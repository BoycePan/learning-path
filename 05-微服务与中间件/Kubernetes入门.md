# Kubernetes入门

## 📌 学习目标

- 理解Kubernetes核心概念
- 掌握Pod、Service、Deployment
- 了解配置管理
- 掌握基本运维操作
- 了解Java应用部署

## ⭐ 核心内容

- **Pod** ⭐⭐⭐⭐⭐
- **Service** ⭐⭐⭐⭐⭐
- **Deployment** ⭐⭐⭐⭐⭐
- **ConfigMap/Secret** ⭐⭐⭐⭐⭐
- **Ingress** ⭐⭐⭐⭐

## 1. Kubernetes简介 ⭐⭐⭐⭐⭐

### 什么是Kubernetes？

Kubernetes（K8s）是一个**容器编排平台**，用于：
1. **自动化部署** - 自动部署容器
2. **自动扩缩容** - 根据负载自动调整
3. **服务发现和负载均衡** - 自动分配流量
4. **自我修复** - 自动重启失败的容器

### 核心概念

```
集群（Cluster）：K8s集群
节点（Node）：物理机或虚拟机
Pod：最小部署单元，包含一个或多个容器 ⭐⭐⭐⭐⭐
Service：服务，提供稳定的网络访问 ⭐⭐⭐⭐⭐
Deployment：部署，管理Pod的副本 ⭐⭐⭐⭐⭐
```

## 2. Pod ⭐⭐⭐⭐⭐

### Pod定义

```yaml
# pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-app
  labels:
    app: my-app
spec:
  containers:
  - name: app
    image: my-app:1.0
    ports:
    - containerPort: 8080
    env:
    - name: SPRING_PROFILES_ACTIVE
      value: "prod"
    resources:  # 资源限制 ⭐⭐⭐⭐⭐
      requests:
        memory: "512Mi"
        cpu: "500m"
      limits:
        memory: "1Gi"
        cpu: "1000m"
```

### Pod操作

```bash
# 创建Pod ⭐⭐⭐⭐⭐
kubectl apply -f pod.yaml

# 查看Pod ⭐⭐⭐⭐⭐
kubectl get pods
kubectl get pods -o wide  # 详细信息
kubectl describe pod my-app  # 查看详情

# 查看日志 ⭐⭐⭐⭐⭐
kubectl logs my-app
kubectl logs -f my-app  # 实时查看
kubectl logs my-app --tail=100  # 最后100行

# 进入Pod ⭐⭐⭐⭐⭐
kubectl exec -it my-app -- /bin/bash

# 删除Pod
kubectl delete pod my-app
kubectl delete -f pod.yaml
```

## 3. Deployment ⭐⭐⭐⭐⭐

### Deployment定义

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
  labels:
    app: my-app
spec:
  replicas: 3  # 副本数 ⭐⭐⭐⭐⭐
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
      - name: app
        image: my-app:1.0
        ports:
        - containerPort: 8080
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: "prod"
        # 健康检查 ⭐⭐⭐⭐⭐
        livenessProbe:  # 存活探针
          httpGet:
            path: /actuator/health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:  # 就绪探针
          httpGet:
            path: /actuator/health
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 5
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
```

### Deployment操作

```bash
# 创建Deployment ⭐⭐⭐⭐⭐
kubectl apply -f deployment.yaml

# 查看Deployment
kubectl get deployments
kubectl describe deployment my-app

# 扩缩容 ⭐⭐⭐⭐⭐
kubectl scale deployment my-app --replicas=5

# 更新镜像（滚动更新）⭐⭐⭐⭐⭐
kubectl set image deployment/my-app app=my-app:2.0

# 查看更新状态
kubectl rollout status deployment/my-app

# 回滚 ⭐⭐⭐⭐⭐
kubectl rollout undo deployment/my-app
kubectl rollout undo deployment/my-app --to-revision=2

# 查看历史
kubectl rollout history deployment/my-app

# 删除Deployment
kubectl delete deployment my-app
```

## 4. Service ⭐⭐⭐⭐⭐

### Service类型

```yaml
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: my-app-service
spec:
  type: ClusterIP  # 类型 ⭐⭐⭐⭐⭐
  # ClusterIP: 集群内部访问（默认）
  # NodePort: 通过节点端口访问
  # LoadBalancer: 云厂商负载均衡器
  selector:
    app: my-app
  ports:
  - protocol: TCP
    port: 80  # Service端口
    targetPort: 8080  # Pod端口
```

### NodePort Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-app-nodeport
spec:
  type: NodePort
  selector:
    app: my-app
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8080
    nodePort: 30080  # 节点端口（30000-32767）
```

### Service操作

```bash
# 创建Service ⭐⭐⭐⭐⭐
kubectl apply -f service.yaml

# 查看Service
kubectl get services
kubectl describe service my-app-service

# 查看Endpoints
kubectl get endpoints my-app-service

# 删除Service
kubectl delete service my-app-service
```

## 5. ConfigMap和Secret ⭐⭐⭐⭐⭐

### ConfigMap

```yaml
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  application.properties: |
    server.port=8080
    spring.datasource.url=jdbc:mysql://mysql:3306/mydb
  database.url: "jdbc:mysql://mysql:3306/mydb"
  log.level: "INFO"
```

### Secret

```yaml
# secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secret
type: Opaque
data:
  # Base64编码 ⭐⭐⭐⭐⭐
  username: YWRtaW4=  # admin
  password: MTIzNDU2  # 123456
```

### 使用ConfigMap和Secret

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  template:
    spec:
      containers:
      - name: app
        image: my-app:1.0
        # 环境变量方式 ⭐⭐⭐⭐⭐
        env:
        - name: DB_URL
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: database.url
        - name: DB_USERNAME
          valueFrom:
            secretKeyRef:
              name: app-secret
              key: username
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: app-secret
              key: password
        # 文件挂载方式 ⭐⭐⭐⭐⭐
        volumeMounts:
        - name: config-volume
          mountPath: /config
        - name: secret-volume
          mountPath: /secrets
      volumes:
      - name: config-volume
        configMap:
          name: app-config
      - name: secret-volume
        secret:
          secretName: app-secret
```

### 操作

```bash
# 创建ConfigMap ⭐⭐⭐⭐⭐
kubectl create configmap app-config --from-file=application.properties
kubectl apply -f configmap.yaml

# 创建Secret ⭐⭐⭐⭐⭐
kubectl create secret generic app-secret \
  --from-literal=username=admin \
  --from-literal=password=123456

# 查看
kubectl get configmaps
kubectl get secrets
kubectl describe configmap app-config
kubectl describe secret app-secret

# Base64编码/解码
echo -n "admin" | base64  # 编码
echo "YWRtaW4=" | base64 -d  # 解码
```

## 6. Ingress ⭐⭐⭐⭐

### Ingress定义

```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-app-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host: myapp.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: my-app-service
            port:
              number: 80
```

## 7. 完整示例：部署Spring Boot应用 ⭐⭐⭐⭐⭐

### 1. 构建Docker镜像

```dockerfile
# Dockerfile
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY target/myapp.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

```bash
# 构建镜像
docker build -t myapp:1.0 .

# 推送到镜像仓库
docker tag myapp:1.0 registry.example.com/myapp:1.0
docker push registry.example.com/myapp:1.0
```

### 2. 创建K8s资源

```yaml
# all-in-one.yaml
---
# ConfigMap
apiVersion: v1
kind: ConfigMap
metadata:
  name: myapp-config
data:
  SPRING_PROFILES_ACTIVE: "prod"
  SPRING_DATASOURCE_URL: "jdbc:mysql://mysql:3306/mydb"

---
# Secret
apiVersion: v1
kind: Secret
metadata:
  name: myapp-secret
type: Opaque
data:
  DB_USERNAME: cm9vdA==  # root
  DB_PASSWORD: cm9vdDEyMw==  # root123

---
# Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: myapp
        image: registry.example.com/myapp:1.0
        ports:
        - containerPort: 8080
        envFrom:
        - configMapRef:
            name: myapp-config
        env:
        - name: SPRING_DATASOURCE_USERNAME
          valueFrom:
            secretKeyRef:
              name: myapp-secret
              key: DB_USERNAME
        - name: SPRING_DATASOURCE_PASSWORD
          valueFrom:
            secretKeyRef:
              name: myapp-secret
              key: DB_PASSWORD
        livenessProbe:
          httpGet:
            path: /actuator/health/liveness
            port: 8080
          initialDelaySeconds: 60
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /actuator/health/readiness
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 5
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"

---
# Service
apiVersion: v1
kind: Service
metadata:
  name: myapp-service
spec:
  type: ClusterIP
  selector:
    app: myapp
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8080

---
# Ingress
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: myapp-ingress
spec:
  rules:
  - host: myapp.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: myapp-service
            port:
              number: 80
```

### 3. 部署

```bash
# 部署所有资源 ⭐⭐⭐⭐⭐
kubectl apply -f all-in-one.yaml

# 查看状态
kubectl get all
kubectl get pods
kubectl get services
kubectl get ingress

# 查看日志
kubectl logs -f deployment/myapp

# 更新应用
kubectl set image deployment/myapp myapp=registry.example.com/myapp:2.0

# 回滚
kubectl rollout undo deployment/myapp
```

## 8. 常用命令 ⭐⭐⭐⭐⭐

```bash
# 查看资源 ⭐⭐⭐⭐⭐
kubectl get pods
kubectl get deployments
kubectl get services
kubectl get all  # 查看所有资源

# 查看详情
kubectl describe pod <pod-name>
kubectl describe deployment <deployment-name>

# 查看日志 ⭐⭐⭐⭐⭐
kubectl logs <pod-name>
kubectl logs -f <pod-name>  # 实时查看
kubectl logs <pod-name> -c <container-name>  # 多容器Pod

# 执行命令 ⭐⭐⭐⭐⭐
kubectl exec -it <pod-name> -- /bin/bash
kubectl exec <pod-name> -- ls /app

# 端口转发 ⭐⭐⭐⭐
kubectl port-forward pod/<pod-name> 8080:8080
kubectl port-forward service/<service-name> 8080:80

# 复制文件
kubectl cp <pod-name>:/path/to/file ./local-file
kubectl cp ./local-file <pod-name>:/path/to/file

# 删除资源
kubectl delete pod <pod-name>
kubectl delete deployment <deployment-name>
kubectl delete -f deployment.yaml
```

## 💡 最佳实践 ⭐⭐⭐⭐⭐

### 1. 资源限制

```yaml
resources:
  requests:  # 最小资源
    memory: "512Mi"
    cpu: "500m"
  limits:  # 最大资源
    memory: "1Gi"
    cpu: "1000m"
```

### 2. 健康检查

```yaml
livenessProbe:  # 存活探针
  httpGet:
    path: /actuator/health/liveness
    port: 8080
readinessProbe:  # 就绪探针
  httpGet:
    path: /actuator/health/readiness
    port: 8080
```

### 3. 使用命名空间

```bash
# 创建命名空间
kubectl create namespace dev
kubectl create namespace prod

# 在指定命名空间操作
kubectl apply -f deployment.yaml -n dev
kubectl get pods -n dev
```

## 🎯 实战练习

1. 部署一个Spring Boot应用到K8s
2. 实现应用的滚动更新和回滚
3. 配置水平自动扩缩容（HPA）
4. 使用Ingress暴露服务

## 📚 下一步

学习完Kubernetes后，继续学习：
- [服务监控与链路追踪](./服务监控与链路追踪.md)
- [Docker容器化](../00-开发环境与工具/Docker容器化.md)

