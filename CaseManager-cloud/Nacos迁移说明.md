# Nacos 迁移说明

## 概述
本项目已从 Eureka 注册中心迁移到 Nacos，同时使用 Nacos 作为配置中心。

## 已完成的修改

### 1. 依赖更新
所有服务模块的 `pom.xml` 文件已更新：
- 移除了 `spring-cloud-starter-netflix-eureka-client`
- 移除了 `spring-cloud-starter-config`
- 添加了 `spring-cloud-starter-alibaba-nacos-discovery`
- 添加了 `spring-cloud-starter-alibaba-nacos-config`
- 添加了 `spring-cloud-starter-loadbalancer`（用于负载均衡）

### 2. 配置文件更新
所有服务的 `application.yml` 文件已更新：
- 移除了 Eureka 相关配置
- 保留并完善了 Nacos 配置：
  ```yaml
  spring:
    cloud:
      nacos:
        discovery:
          server-addr: localhost:8848
        config:
          server-addr: localhost:8848
          file-extension: yaml
  ```

### 3. 已更新的服务模块
- casemanager-gateway（网关服务）
- casemanager-auth（认证服务）
- casemanager-project（项目服务）
- casemanager-testcase（测试用例服务）
- casemanager-testplan（测试计划服务）
- casemanager-defect（缺陷服务）
- casemanager-user（用户服务）
- casemanager-testreport（测试报告服务）

### 4. 注册中心服务
原 `casemanager-registry` 模块（Eureka Server）已不再需要，可以删除或停用。

## 部署要求

### 1. 安装 Nacos
需要先安装并启动 Nacos Server：
```bash
# 下载 Nacos
wget https://github.com/alibaba/nacos/releases/download/2.3.0/nacos-server-2.3.0.tar.gz

# 解压
tar -xvf nacos-server-2.3.0.tar.gz

# 启动（单机模式）
cd nacos/bin
sh startup.sh -m standalone
```

### 2. 访问 Nacos 控制台
- 地址：http://localhost:8848/nacos
- 默认用户名/密码：nacos/nacos

### 3. 配置中心使用（可选）
如需使用 Nacos 作为配置中心，可以：
1. 在每个服务的 `src/main/resources` 目录下创建 `bootstrap.yml` 文件
2. 参考 `bootstrap-template.yml` 模板进行配置
3. 在 Nacos 控制台中创建相应的配置文件

## 启动顺序
1. 启动 Nacos Server
2. 启动网关服务（casemanager-gateway）
3. 启动其他业务服务（顺序不限）

## 注意事项
1. 确保 Nacos Server 在所有服务启动前已经运行
2. 默认配置使用 `localhost:8848`，生产环境需要修改为实际的 Nacos 地址
3. 可以通过环境变量或配置文件覆盖默认的 Nacos 地址：
   ```bash
   -Dspring.cloud.nacos.discovery.server-addr=192.168.1.100:8848
   ```

## 回滚方案
如需回滚到 Eureka：
1. 恢复 pom.xml 中的 Eureka 依赖
2. 恢复 application.yml 中的 Eureka 配置
3. 启动 casemanager-registry 服务
4. 重启所有服务

## 常见问题
1. **服务无法注册到 Nacos**
   - 检查 Nacos Server 是否正常运行
   - 检查网络连接
   - 查看服务日志中的错误信息

2. **配置无法自动刷新**
   - 确保添加了 `@RefreshScope` 注解
   - 检查 `refresh-enabled` 配置是否为 true

3. **负载均衡失效**
   - 确保添加了 `spring-cloud-starter-loadbalancer` 依赖
   - 检查服务名称是否正确
