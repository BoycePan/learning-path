# Java日期时间API

## 📌 学习目标

- 理解旧API的问题
- 掌握Java 8新日期时间API
- 熟练使用LocalDate/LocalTime/LocalDateTime
- 掌握日期时间格式化
- 了解时区处理

## ⭐ 核心内容

- **LocalDate/LocalTime/LocalDateTime** ⭐⭐⭐⭐⭐
- **ZonedDateTime** ⭐⭐⭐⭐
- **DateTimeFormatter** ⭐⭐⭐⭐⭐
- **Period/Duration** ⭐⭐⭐⭐
- **时区处理** ⭐⭐⭐⭐

## 1. 旧API的问题 ⭐⭐⭐⭐

### Date和Calendar的缺陷

```java
import java.util.Date;
import java.util.Calendar;

public class OldDateAPI {
    public static void main(String[] args) {
        // 问题1：Date不是线程安全的
        Date date = new Date();
        
        // 问题2：月份从0开始（反直觉）
        date.setMonth(0);  // 1月
        
        // 问题3：年份从1900开始
        date.setYear(124);  // 2024年
        
        // 问题4：可变性（不安全）
        Date date1 = new Date();
        Date date2 = date1;  // 引用同一个对象
        date2.setTime(0);    // date1也被修改了
        
        // 问题5：API设计混乱
        Calendar calendar = Calendar.getInstance();
        calendar.set(2024, Calendar.JANUARY, 1);  // 月份用常量
        
        System.out.println("不推荐使用旧API！");
    }
}
```

## 2. Java 8新日期时间API ⭐⭐⭐⭐⭐

### 核心类概览

```java
// java.time包（Java 8+）⭐⭐⭐⭐⭐
LocalDate       // 日期（年月日）
LocalTime       // 时间（时分秒）
LocalDateTime   // 日期时间（年月日时分秒）
ZonedDateTime   // 带时区的日期时间
Instant         // 时间戳
Duration        // 时间间隔（秒、纳秒）
Period          // 日期间隔（年、月、日）
DateTimeFormatter  // 格式化器
```

### LocalDate - 日期 ⭐⭐⭐⭐⭐

```java
import java.time.LocalDate;
import java.time.Month;
import java.time.DayOfWeek;

public class LocalDateDemo {
    public static void main(String[] args) {
        // 创建LocalDate ⭐⭐⭐⭐⭐
        LocalDate today = LocalDate.now();  // 当前日期
        System.out.println("今天：" + today);  // 2024-01-15
        
        LocalDate date1 = LocalDate.of(2024, 1, 15);  // 指定日期
        LocalDate date2 = LocalDate.of(2024, Month.JANUARY, 15);
        LocalDate date3 = LocalDate.parse("2024-01-15");  // 解析字符串
        
        // 获取日期信息 ⭐⭐⭐⭐⭐
        int year = today.getYear();           // 2024
        Month month = today.getMonth();       // JANUARY
        int monthValue = today.getMonthValue();  // 1
        int day = today.getDayOfMonth();      // 15
        DayOfWeek dayOfWeek = today.getDayOfWeek();  // MONDAY
        int dayOfYear = today.getDayOfYear(); // 15
        
        System.out.println("年：" + year);
        System.out.println("月：" + monthValue);
        System.out.println("日：" + day);
        System.out.println("星期：" + dayOfWeek);
        
        // 日期计算 ⭐⭐⭐⭐⭐
        LocalDate tomorrow = today.plusDays(1);      // 明天
        LocalDate nextWeek = today.plusWeeks(1);     // 下周
        LocalDate nextMonth = today.plusMonths(1);   // 下月
        LocalDate nextYear = today.plusYears(1);     // 明年
        
        LocalDate yesterday = today.minusDays(1);    // 昨天
        LocalDate lastMonth = today.minusMonths(1);  // 上月
        
        System.out.println("明天：" + tomorrow);
        System.out.println("下月：" + nextMonth);
        
        // 日期比较 ⭐⭐⭐⭐⭐
        boolean isBefore = date1.isBefore(date2);
        boolean isAfter = date1.isAfter(date2);
        boolean isEqual = date1.isEqual(date2);
        
        // 判断闰年
        boolean isLeapYear = today.isLeapYear();
        System.out.println("是否闰年：" + isLeapYear);
        
        // 获取月份天数
        int lengthOfMonth = today.lengthOfMonth();
        System.out.println("本月天数：" + lengthOfMonth);
    }
}
```

### LocalTime - 时间 ⭐⭐⭐⭐⭐

```java
import java.time.LocalTime;

public class LocalTimeDemo {
    public static void main(String[] args) {
        // 创建LocalTime ⭐⭐⭐⭐⭐
        LocalTime now = LocalTime.now();  // 当前时间
        System.out.println("现在：" + now);  // 14:30:25.123456789
        
        LocalTime time1 = LocalTime.of(14, 30);           // 14:30
        LocalTime time2 = LocalTime.of(14, 30, 25);       // 14:30:25
        LocalTime time3 = LocalTime.of(14, 30, 25, 123);  // 14:30:25.000000123
        LocalTime time4 = LocalTime.parse("14:30:25");
        
        // 获取时间信息 ⭐⭐⭐⭐⭐
        int hour = now.getHour();         // 14
        int minute = now.getMinute();     // 30
        int second = now.getSecond();     // 25
        int nano = now.getNano();         // 纳秒
        
        // 时间计算 ⭐⭐⭐⭐⭐
        LocalTime later = now.plusHours(2);      // 2小时后
        LocalTime earlier = now.minusMinutes(30); // 30分钟前
        
        // 时间比较
        boolean isBefore = time1.isBefore(time2);
        boolean isAfter = time1.isAfter(time2);
        
        // 特殊时间
        LocalTime midnight = LocalTime.MIDNIGHT;  // 00:00
        LocalTime noon = LocalTime.NOON;          // 12:00
        LocalTime min = LocalTime.MIN;            // 00:00
        LocalTime max = LocalTime.MAX;            // 23:59:59.999999999
    }
}
```

### LocalDateTime - 日期时间 ⭐⭐⭐⭐⭐

```java
import java.time.LocalDateTime;

public class LocalDateTimeDemo {
    public static void main(String[] args) {
        // 创建LocalDateTime ⭐⭐⭐⭐⭐
        LocalDateTime now = LocalDateTime.now();  // 当前日期时间
        System.out.println("现在：" + now);  // 2024-01-15T14:30:25.123
        
        LocalDateTime dt1 = LocalDateTime.of(2024, 1, 15, 14, 30);
        LocalDateTime dt2 = LocalDateTime.of(2024, 1, 15, 14, 30, 25);
        LocalDateTime dt3 = LocalDateTime.parse("2024-01-15T14:30:25");
        
        // 从LocalDate和LocalTime组合
        LocalDate date = LocalDate.now();
        LocalTime time = LocalTime.now();
        LocalDateTime dt4 = LocalDateTime.of(date, time);
        LocalDateTime dt5 = date.atTime(time);
        LocalDateTime dt6 = time.atDate(date);
        
        // 获取日期时间信息 ⭐⭐⭐⭐⭐
        int year = now.getYear();
        int month = now.getMonthValue();
        int day = now.getDayOfMonth();
        int hour = now.getHour();
        int minute = now.getMinute();
        int second = now.getSecond();
        
        // 提取日期和时间部分
        LocalDate datepart = now.toLocalDate();
        LocalTime timepart = now.toLocalTime();
        
        // 日期时间计算 ⭐⭐⭐⭐⭐
        LocalDateTime future = now.plusDays(1).plusHours(2).plusMinutes(30);
        LocalDateTime past = now.minusWeeks(1);
        
        // 修改日期时间（返回新对象，不可变）⭐⭐⭐⭐⭐
        LocalDateTime modified = now
            .withYear(2025)
            .withMonth(12)
            .withDayOfMonth(31)
            .withHour(23)
            .withMinute(59)
            .withSecond(59);
        
        System.out.println("修改后：" + modified);
    }
}
```

## 3. 日期时间格式化 ⭐⭐⭐⭐⭐

### DateTimeFormatter ⭐⭐⭐⭐⭐

```java
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class FormatterDemo {
    public static void main(String[] args) {
        LocalDateTime now = LocalDateTime.now();
        
        // 预定义格式化器 ⭐⭐⭐⭐⭐
        String iso = now.format(DateTimeFormatter.ISO_DATE_TIME);
        System.out.println("ISO格式：" + iso);  // 2024-01-15T14:30:25.123
        
        String isoDate = now.format(DateTimeFormatter.ISO_DATE);
        System.out.println("ISO日期：" + isoDate);  // 2024-01-15
        
        String isoTime = now.format(DateTimeFormatter.ISO_TIME);
        System.out.println("ISO时间：" + isoTime);  // 14:30:25.123
        
        // 自定义格式化器 ⭐⭐⭐⭐⭐
        DateTimeFormatter formatter1 = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        String formatted1 = now.format(formatter1);
        System.out.println("格式1：" + formatted1);  // 2024-01-15 14:30:25
        
        DateTimeFormatter formatter2 = DateTimeFormatter.ofPattern("yyyy年MM月dd日 HH:mm:ss");
        String formatted2 = now.format(formatter2);
        System.out.println("格式2：" + formatted2);  // 2024年01月15日 14:30:25
        
        DateTimeFormatter formatter3 = DateTimeFormatter.ofPattern("yyyy/MM/dd");
        String formatted3 = now.format(formatter3);
        System.out.println("格式3：" + formatted3);  // 2024/01/15
        
        // 解析字符串 ⭐⭐⭐⭐⭐
        String dateStr = "2024-01-15 14:30:25";
        LocalDateTime parsed = LocalDateTime.parse(dateStr, formatter1);
        System.out.println("解析：" + parsed);
        
        // 常用格式模式
        // yyyy - 年份（4位）
        // MM   - 月份（2位）
        // dd   - 日期（2位）
        // HH   - 小时（24小时制，2位）
        // mm   - 分钟（2位）
        // ss   - 秒（2位）
        // SSS  - 毫秒（3位）
        // E    - 星期
    }
}
```

### 实用格式化示例 ⭐⭐⭐⭐⭐

```java
public class DateFormatUtils {
    // 常用格式化器
    public static final DateTimeFormatter YYYY_MM_DD = 
        DateTimeFormatter.ofPattern("yyyy-MM-dd");
    
    public static final DateTimeFormatter YYYY_MM_DD_HH_MM_SS = 
        DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    
    public static final DateTimeFormatter CHINESE_DATE = 
        DateTimeFormatter.ofPattern("yyyy年MM月dd日");
    
    public static final DateTimeFormatter CHINESE_DATETIME = 
        DateTimeFormatter.ofPattern("yyyy年MM月dd日 HH时mm分ss秒");
    
    // 格式化当前时间
    public static String now() {
        return LocalDateTime.now().format(YYYY_MM_DD_HH_MM_SS);
    }
    
    // 格式化为指定格式
    public static String format(LocalDateTime dateTime, String pattern) {
        return dateTime.format(DateTimeFormatter.ofPattern(pattern));
    }
    
    // 解析字符串
    public static LocalDateTime parse(String dateStr, String pattern) {
        return LocalDateTime.parse(dateStr, DateTimeFormatter.ofPattern(pattern));
    }
}
```

## 4. 时间间隔 ⭐⭐⭐⭐⭐

### Period - 日期间隔 ⭐⭐⭐⭐

```java
import java.time.LocalDate;
import java.time.Period;

public class PeriodDemo {
    public static void main(String[] args) {
        // 创建Period ⭐⭐⭐⭐⭐
        Period period1 = Period.ofDays(10);      // 10天
        Period period2 = Period.ofWeeks(2);      // 2周
        Period period3 = Period.ofMonths(3);     // 3个月
        Period period4 = Period.ofYears(1);      // 1年
        Period period5 = Period.of(1, 2, 3);     // 1年2月3天
        
        // 计算两个日期之间的间隔 ⭐⭐⭐⭐⭐
        LocalDate start = LocalDate.of(2024, 1, 1);
        LocalDate end = LocalDate.of(2024, 12, 31);
        Period between = Period.between(start, end);
        
        System.out.println("间隔：" + between);  // P11M30D
        System.out.println("年：" + between.getYears());
        System.out.println("月：" + between.getMonths());
        System.out.println("日：" + between.getDays());
        
        // 日期加减 ⭐⭐⭐⭐⭐
        LocalDate future = start.plus(period5);
        System.out.println("未来日期：" + future);  // 2025-03-04
        
        // 计算年龄
        LocalDate birthday = LocalDate.of(1990, 5, 15);
        LocalDate today = LocalDate.now();
        Period age = Period.between(birthday, today);
        System.out.println("年龄：" + age.getYears() + "岁" + 
                         age.getMonths() + "个月" + age.getDays() + "天");
    }
}
```

### Duration - 时间间隔 ⭐⭐⭐⭐

```java
import java.time.Duration;
import java.time.LocalTime;
import java.time.LocalDateTime;

public class DurationDemo {
    public static void main(String[] args) {
        // 创建Duration ⭐⭐⭐⭐⭐
        Duration duration1 = Duration.ofSeconds(60);     // 60秒
        Duration duration2 = Duration.ofMinutes(5);      // 5分钟
        Duration duration3 = Duration.ofHours(2);        // 2小时
        Duration duration4 = Duration.ofDays(1);         // 1天
        
        // 计算两个时间之间的间隔 ⭐⭐⭐⭐⭐
        LocalTime start = LocalTime.of(9, 0);
        LocalTime end = LocalTime.of(17, 30);
        Duration workTime = Duration.between(start, end);
        
        System.out.println("工作时长：" + workTime);  // PT8H30M
        System.out.println("小时：" + workTime.toHours());      // 8
        System.out.println("分钟：" + workTime.toMinutes());    // 510
        System.out.println("秒：" + workTime.getSeconds());     // 30600
        
        // 计算代码执行时间 ⭐⭐⭐⭐⭐
        LocalDateTime startTime = LocalDateTime.now();
        // 执行一些操作
        Thread.sleep(1000);
        LocalDateTime endTime = LocalDateTime.now();
        Duration elapsed = Duration.between(startTime, endTime);
        System.out.println("执行时间：" + elapsed.toMillis() + "ms");
    }
}
```

## 5. 时区处理 ⭐⭐⭐⭐

### ZonedDateTime ⭐⭐⭐⭐

```java
import java.time.ZonedDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;

public class ZonedDateTimeDemo {
    public static void main(String[] args) {
        // 获取当前时区的日期时间 ⭐⭐⭐⭐⭐
        ZonedDateTime now = ZonedDateTime.now();
        System.out.println("当前时区：" + now);
        
        // 指定时区 ⭐⭐⭐⭐⭐
        ZonedDateTime tokyo = ZonedDateTime.now(ZoneId.of("Asia/Tokyo"));
        ZonedDateTime newYork = ZonedDateTime.now(ZoneId.of("America/New_York"));
        ZonedDateTime shanghai = ZonedDateTime.now(ZoneId.of("Asia/Shanghai"));
        
        System.out.println("东京：" + tokyo);
        System.out.println("纽约：" + newYork);
        System.out.println("上海：" + shanghai);
        
        // 时区转换 ⭐⭐⭐⭐⭐
        ZonedDateTime shanghaiTime = ZonedDateTime.now(ZoneId.of("Asia/Shanghai"));
        ZonedDateTime tokyoTime = shanghaiTime.withZoneSameInstant(ZoneId.of("Asia/Tokyo"));
        
        System.out.println("上海时间：" + shanghaiTime);
        System.out.println("东京时间：" + tokyoTime);
        
        // 获取所有时区
        Set<String> allZones = ZoneId.getAvailableZoneIds();
        System.out.println("时区数量：" + allZones.size());
    }
}
```

### Instant - 时间戳 ⭐⭐⭐⭐⭐

```java
import java.time.Instant;

public class InstantDemo {
    public static void main(String[] args) {
        // 获取当前时间戳 ⭐⭐⭐⭐⭐
        Instant now = Instant.now();
        System.out.println("时间戳：" + now);  // 2024-01-15T06:30:25.123Z
        
        // 获取秒数和毫秒数
        long epochSecond = now.getEpochSecond();  // 秒
        long epochMilli = now.toEpochMilli();     // 毫秒
        
        System.out.println("秒：" + epochSecond);
        System.out.println("毫秒：" + epochMilli);
        
        // 从秒数创建Instant
        Instant instant1 = Instant.ofEpochSecond(epochSecond);
        Instant instant2 = Instant.ofEpochMilli(epochMilli);
        
        // 时间戳计算
        Instant later = now.plusSeconds(3600);  // 1小时后
        Instant earlier = now.minusSeconds(60); // 1分钟前
        
        // 与LocalDateTime转换 ⭐⭐⭐⭐⭐
        LocalDateTime ldt = LocalDateTime.ofInstant(now, ZoneId.systemDefault());
        Instant instant = ldt.atZone(ZoneId.systemDefault()).toInstant();
    }
}
```

## 6. 实用工具类 ⭐⭐⭐⭐⭐

```java
import java.time.*;
import java.time.format.DateTimeFormatter;

public class DateTimeUtils {
    
    // 常用格式化器
    private static final DateTimeFormatter DEFAULT_FORMATTER = 
        DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    
    // 获取当前时间字符串 ⭐⭐⭐⭐⭐
    public static String now() {
        return LocalDateTime.now().format(DEFAULT_FORMATTER);
    }
    
    // 获取当前日期字符串
    public static String today() {
        return LocalDate.now().toString();
    }
    
    // 字符串转LocalDateTime ⭐⭐⭐⭐⭐
    public static LocalDateTime parseDateTime(String dateStr) {
        return LocalDateTime.parse(dateStr, DEFAULT_FORMATTER);
    }
    
    // LocalDateTime转字符串
    public static String formatDateTime(LocalDateTime dateTime) {
        return dateTime.format(DEFAULT_FORMATTER);
    }
    
    // 计算两个日期之间的天数 ⭐⭐⭐⭐⭐
    public static long daysBetween(LocalDate start, LocalDate end) {
        return Period.between(start, end).getDays();
    }
    
    // 判断是否是今天
    public static boolean isToday(LocalDate date) {
        return date.equals(LocalDate.now());
    }
    
    // 判断是否是周末
    public static boolean isWeekend(LocalDate date) {
        DayOfWeek dayOfWeek = date.getDayOfWeek();
        return dayOfWeek == DayOfWeek.SATURDAY || dayOfWeek == DayOfWeek.SUNDAY;
    }
    
    // 获取本月第一天
    public static LocalDate firstDayOfMonth() {
        return LocalDate.now().withDayOfMonth(1);
    }
    
    // 获取本月最后一天
    public static LocalDate lastDayOfMonth() {
        LocalDate now = LocalDate.now();
        return now.withDayOfMonth(now.lengthOfMonth());
    }
    
    // 获取年龄 ⭐⭐⭐⭐⭐
    public static int getAge(LocalDate birthday) {
        return Period.between(birthday, LocalDate.now()).getYears();
    }
}
```

## 💡 最佳实践 ⭐⭐⭐⭐⭐

### 1. 使用不可变对象

```java
// 好的做法 ⭐⭐⭐⭐⭐
LocalDateTime now = LocalDateTime.now();
LocalDateTime future = now.plusDays(1);  // 返回新对象
// now不变，future是新对象

// 避免使用Date（可变）
Date date = new Date();
date.setTime(0);  // 修改了原对象
```

### 2. 选择合适的类型

```java
// 只需要日期 → LocalDate
LocalDate birthday = LocalDate.of(1990, 5, 15);

// 只需要时间 → LocalTime
LocalTime meetingTime = LocalTime.of(14, 30);

// 需要日期和时间 → LocalDateTime
LocalDateTime appointment = LocalDateTime.of(2024, 1, 15, 14, 30);

// 需要时区 → ZonedDateTime
ZonedDateTime meeting = ZonedDateTime.now(ZoneId.of("Asia/Shanghai"));

// 时间戳 → Instant
Instant timestamp = Instant.now();
```

### 3. 数据库存储建议

```java
// 推荐：存储为TIMESTAMP或BIGINT（毫秒）
Instant instant = Instant.now();
long timestamp = instant.toEpochMilli();

// 或者存储为字符串（ISO格式）
String isoString = LocalDateTime.now().toString();
```

## 🎯 实战练习

1. 实现一个日期工具类
2. 计算两个日期之间的工作日
3. 实现一个简单的日历显示
4. 处理不同时区的会议时间

## 📚 下一步

学习完日期时间API后，继续学习：
- [集合框架](./集合框架.md)
- [IO与NIO](../02-Java进阶/IO与NIO.md)

