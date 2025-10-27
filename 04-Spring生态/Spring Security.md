# Spring Security

## 📌 学习目标

- 理解Spring Security核心概念
- 掌握认证和授权
- 熟练使用JWT
- 了解OAuth2
- 掌握安全最佳实践

## ⭐ 核心内容

- **认证（Authentication）** ⭐⭐⭐⭐⭐
- **授权（Authorization）** ⭐⭐⭐⭐⭐
- **JWT** ⭐⭐⭐⭐⭐
- **OAuth2** ⭐⭐⭐⭐
- **密码加密** ⭐⭐⭐⭐⭐

## 1. Spring Security简介 ⭐⭐⭐⭐⭐

### 核心概念

```
认证（Authentication）：验证用户身份（你是谁？）⭐⭐⭐⭐⭐
授权（Authorization）：验证用户权限（你能做什么？）⭐⭐⭐⭐⭐
```

### Maven依赖

```xml
<dependencies>
    <!-- Spring Security ⭐⭐⭐⭐⭐ -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    
    <!-- JWT ⭐⭐⭐⭐⭐ -->
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>0.12.3</version>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-impl</artifactId>
        <version>0.12.3</version>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-jackson</artifactId>
        <version>0.12.3</version>
        <scope>runtime</scope>
    </dependency>
</dependencies>
```

## 2. 基础配置 ⭐⭐⭐⭐⭐

### 安全配置类 ⭐⭐⭐⭐⭐

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // 禁用CSRF（前后端分离项目）⭐⭐⭐⭐⭐
            .csrf(csrf -> csrf.disable())
            
            // 配置URL访问权限 ⭐⭐⭐⭐⭐
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()  // 公开接口
                .requestMatchers("/api/admin/**").hasRole("ADMIN")  // 需要ADMIN角色
                .requestMatchers("/api/user/**").hasAnyRole("USER", "ADMIN")
                .anyRequest().authenticated()  // 其他请求需要认证
            )
            
            // 配置表单登录
            .formLogin(form -> form
                .loginPage("/login")
                .defaultSuccessUrl("/home")
                .permitAll()
            )
            
            // 配置登出
            .logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessUrl("/login")
                .permitAll()
            );
        
        return http.build();
    }
    
    // 密码加密器 ⭐⭐⭐⭐⭐
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

## 3. 用户认证 ⭐⭐⭐⭐⭐

### UserDetails实现 ⭐⭐⭐⭐⭐

```java
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

public class User implements UserDetails {
    private Long id;
    private String username;
    private String password;
    private Set<Role> roles;
    private boolean enabled = true;
    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return roles.stream()
            .map(role -> new SimpleGrantedAuthority("ROLE_" + role.getName()))
            .collect(Collectors.toList());
    }
    
    @Override
    public String getPassword() {
        return password;
    }
    
    @Override
    public String getUsername() {
        return username;
    }
    
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }
    
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }
    
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
    
    @Override
    public boolean isEnabled() {
        return enabled;
    }
}
```

### UserDetailsService实现 ⭐⭐⭐⭐⭐

```java
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    
    private final UserRepository userRepository;
    
    public UserDetailsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    
    @Override
    public UserDetails loadUserByUsername(String username) 
            throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("用户不存在：" + username));
        return user;
    }
}
```

## 4. JWT认证 ⭐⭐⭐⭐⭐

### JWT工具类 ⭐⭐⭐⭐⭐

```java
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {
    
    // 密钥（生产环境应从配置文件读取）
    private final SecretKey key = Keys.hmacShaKeyFor(
        "your-256-bit-secret-key-here-must-be-long-enough".getBytes()
    );
    
    private final long expiration = 86400000; // 24小时
    
    // 生成Token ⭐⭐⭐⭐⭐
    public String generateToken(String username) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);
        
        return Jwts.builder()
            .subject(username)
            .issuedAt(now)
            .expiration(expiryDate)
            .signWith(key)
            .compact();
    }
    
    // 从Token获取用户名 ⭐⭐⭐⭐⭐
    public String getUsernameFromToken(String token) {
        Claims claims = Jwts.parser()
            .verifyWith(key)
            .build()
            .parseSignedClaims(token)
            .getPayload();
        
        return claims.getSubject();
    }
    
    // 验证Token ⭐⭐⭐⭐⭐
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
```

### JWT过滤器 ⭐⭐⭐⭐⭐

```java
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;
    
    public JwtAuthenticationFilter(JwtUtil jwtUtil, 
                                  UserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }
    
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                   HttpServletResponse response,
                                   FilterChain filterChain) 
            throws ServletException, IOException {
        
        // 从请求头获取Token ⭐⭐⭐⭐⭐
        String header = request.getHeader("Authorization");
        
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            
            if (jwtUtil.validateToken(token)) {
                String username = jwtUtil.getUsernameFromToken(token);
                
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                
                // 创建认证对象 ⭐⭐⭐⭐⭐
                UsernamePasswordAuthenticationToken authentication = 
                    new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities()
                    );
                
                authentication.setDetails(
                    new WebAuthenticationDetailsSource().buildDetails(request)
                );
                
                // 设置到SecurityContext
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }
        
        filterChain.doFilter(request, response);
    }
}
```

### 配置JWT过滤器 ⭐⭐⭐⭐⭐

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)  // 无状态
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .anyRequest().authenticated()
            )
            // 添加JWT过滤器 ⭐⭐⭐⭐⭐
            .addFilterBefore(jwtAuthenticationFilter, 
                           UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}
```

## 5. 认证Controller ⭐⭐⭐⭐⭐

```java
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    
    // 登录 ⭐⭐⭐⭐⭐
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        // 认证
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getUsername(),
                request.getPassword()
            )
        );
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        // 生成Token
        String token = jwtUtil.generateToken(request.getUsername());
        
        return ResponseEntity.ok(new LoginResponse(token));
    }
    
    // 注册 ⭐⭐⭐⭐⭐
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        // 检查用户名是否存在
        if (userService.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest().body("用户名已存在");
        }
        
        // 创建用户
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        
        userService.save(user);
        
        return ResponseEntity.ok("注册成功");
    }
    
    // 获取当前用户信息 ⭐⭐⭐⭐⭐
    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext()
            .getAuthentication();
        String username = authentication.getName();
        User user = userService.findByUsername(username);
        return ResponseEntity.ok(user);
    }
}
```

## 6. 方法级安全 ⭐⭐⭐⭐⭐

### 启用方法安全

```java
@Configuration
@EnableMethodSecurity  // Spring Security 6.0+
public class MethodSecurityConfig {
}
```

### 使用注解 ⭐⭐⭐⭐⭐

```java
@Service
public class UserService {
    
    // 需要ADMIN角色 ⭐⭐⭐⭐⭐
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteUser(Long id) {
        // 删除用户
    }
    
    // 需要USER或ADMIN角色
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public User getUser(Long id) {
        return userRepository.findById(id).orElse(null);
    }
    
    // 只能访问自己的数据 ⭐⭐⭐⭐⭐
    @PreAuthorize("#username == authentication.name")
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username).orElse(null);
    }
    
    // 方法执行后检查
    @PostAuthorize("returnObject.username == authentication.name")
    public User loadUser(Long id) {
        return userRepository.findById(id).orElse(null);
    }
}
```

## 7. 密码加密 ⭐⭐⭐⭐⭐

```java
@Service
public class PasswordService {
    
    private final PasswordEncoder passwordEncoder;
    
    // 加密密码 ⭐⭐⭐⭐⭐
    public String encodePassword(String rawPassword) {
        return passwordEncoder.encode(rawPassword);
    }
    
    // 验证密码 ⭐⭐⭐⭐⭐
    public boolean matches(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }
}

// 使用示例
String rawPassword = "123456";
String encoded = passwordEncoder.encode(rawPassword);
// $2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

boolean matches = passwordEncoder.matches("123456", encoded);  // true
boolean matches2 = passwordEncoder.matches("wrong", encoded);  // false
```

## 8. CORS配置 ⭐⭐⭐⭐⭐

```java
@Configuration
public class CorsConfig {
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

## 💡 最佳实践 ⭐⭐⭐⭐⭐

### 1. 密码策略

```java
// 强密码验证
public boolean isStrongPassword(String password) {
    // 至少8位，包含大小写字母、数字、特殊字符
    String regex = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$";
    return password.matches(regex);
}
```

### 2. Token刷新

```java
// 实现Token刷新机制
@PostMapping("/refresh")
public ResponseEntity<LoginResponse> refreshToken(@RequestBody RefreshRequest request) {
    String oldToken = request.getToken();
    
    if (jwtUtil.validateToken(oldToken)) {
        String username = jwtUtil.getUsernameFromToken(oldToken);
        String newToken = jwtUtil.generateToken(username);
        return ResponseEntity.ok(new LoginResponse(newToken));
    }
    
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
}
```

### 3. 登录失败次数限制

```java
@Service
public class LoginAttemptService {
    private final Map<String, Integer> attemptsCache = new ConcurrentHashMap<>();
    private static final int MAX_ATTEMPTS = 5;
    
    public void loginFailed(String username) {
        int attempts = attemptsCache.getOrDefault(username, 0);
        attemptsCache.put(username, attempts + 1);
    }
    
    public boolean isBlocked(String username) {
        return attemptsCache.getOrDefault(username, 0) >= MAX_ATTEMPTS;
    }
    
    public void loginSucceeded(String username) {
        attemptsCache.remove(username);
    }
}
```

## 🎯 实战练习

1. 实现完整的JWT认证系统
2. 添加角色和权限管理
3. 实现Token刷新机制
4. 添加登录失败次数限制

## 📚 下一步

学习完Spring Security后，继续学习：
- [Spring Data JPA](./Spring Data JPA.md)
- [微服务架构](../05-微服务与中间件/微服务架构.md)

