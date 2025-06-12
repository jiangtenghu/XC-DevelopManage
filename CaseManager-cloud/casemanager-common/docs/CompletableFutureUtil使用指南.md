# CompletableFutureUtil 使用指南

## 概述

`CompletableFutureUtil` 是一个功能强大的异步编程工具类，封装了 Java `CompletableFuture` 的常用操作，提供了更简洁的 API 和内置的线程池管理。

## 主要特性

- **统一的线程池管理**：内置自定义线程池，避免使用默认的 ForkJoinPool
- **简化的 API**：提供静态方法，无需手动管理线程池
- **完整的功能覆盖**：包含创建、转换、组合、异常处理、超时控制等所有常用功能
- **实用工具方法**：提供并行执行、重试机制等高级功能

## 快速开始

### 1. 基本异步操作

```java
import com.casemanager.common.util.CompletableFutureUtil;
import java.util.concurrent.CompletableFuture;

// 异步执行有返回值的任务
CompletableFuture<String> future = CompletableFutureUtil.supplyAsync(() -> {
    // 模拟耗时操作
    return "Hello World";
});

// 获取结果
String result = CompletableFutureUtil.join(future);
```

### 2. 链式操作

```java
// 链式转换
CompletableFuture<Integer> future = CompletableFutureUtil.supplyAsync(() -> "100")
    .thenApply(s -> Integer.parseInt(s))
    .thenApply(i -> i * 2);

// 结果: 200
Integer result = CompletableFutureUtil.join(future);
```

### 3. 异常处理

```java
CompletableFuture<String> future = CompletableFutureUtil.supplyAsync(() -> {
    if (Math.random() > 0.5) {
        throw new RuntimeException("随机错误");
    }
    return "成功";
});

// 方式1: 使用 exceptionally
CompletableFuture<String> handled1 = CompletableFutureUtil.exceptionally(
    future, 
    ex -> "发生错误: " + ex.getMessage()
);

// 方式2: 使用 handle（可以处理正常和异常两种情况）
CompletableFuture<String> handled2 = CompletableFutureUtil.handle(
    future,
    (result, error) -> {
        if (error != null) {
            return "错误: " + error.getMessage();
        }
        return "成功: " + result;
    }
);
```

## 高级用法

### 1. 并行执行多个任务

```java
import java.util.Arrays;
import java.util.List;
import java.util.function.Supplier;

// 定义多个任务
List<Supplier<String>> tasks = Arrays.asList(
    () -> callApi1(),
    () -> callApi2(),
    () -> callApi3()
);

// 并行执行并收集结果
CompletableFuture<List<String>> allResults = CompletableFutureUtil.parallel(tasks);
List<String> results = CompletableFutureUtil.join(allResults);
```

### 2. 组合多个异步操作

```java
// 两个异步操作
CompletableFuture<User> userFuture = CompletableFutureUtil.supplyAsync(() -> 
    userService.getUser(userId)
);

CompletableFuture<List<Order>> ordersFuture = CompletableFutureUtil.supplyAsync(() -> 
    orderService.getUserOrders(userId)
);

// 组合两个结果
CompletableFuture<UserProfile> profileFuture = CompletableFutureUtil.thenCombine(
    userFuture, 
    ordersFuture,
    (user, orders) -> new UserProfile(user, orders)
);
```

### 3. 超时控制

```java
// 设置3秒超时
CompletableFuture<String> future = CompletableFutureUtil.supplyAsync(() -> {
    // 长时间运行的任务
    return slowOperation();
});

// 方式1: 超时抛出异常
CompletableFuture<String> withTimeout = CompletableFutureUtil.withTimeout(
    future, 3, TimeUnit.SECONDS
);

// 方式2: 超时返回默认值（Java 9+）
CompletableFuture<String> withDefault = CompletableFutureUtil.completeOnTimeout(
    future, "默认值", 3, TimeUnit.SECONDS
);
```

### 4. 重试机制

```java
// 定义一个可能失败的操作
Supplier<String> unreliableOperation = () -> {
    if (Math.random() > 0.7) {
        return "成功";
    }
    throw new RuntimeException("操作失败");
};

// 最多重试3次，每次间隔1秒
CompletableFuture<String> retryFuture = CompletableFutureUtil.retry(
    unreliableOperation, 
    3,                    // 最大重试次数
    1,                    // 延迟时间
    TimeUnit.SECONDS      // 时间单位
);
```

## 实际应用场景

### 场景1: 微服务调用聚合

```java
@Service
public class AggregationService {
    
    public CompletableFuture<DashboardData> getDashboardData(Long userId) {
        // 并行调用多个微服务
        CompletableFuture<UserInfo> userFuture = CompletableFutureUtil.supplyAsync(() ->
            userServiceClient.getUserInfo(userId)
        );
        
        CompletableFuture<List<Project>> projectsFuture = CompletableFutureUtil.supplyAsync(() ->
            projectServiceClient.getUserProjects(userId)
        );
        
        CompletableFuture<Statistics> statsFuture = CompletableFutureUtil.supplyAsync(() ->
            statsServiceClient.getUserStatistics(userId)
        );
        
        // 组合所有结果
        return CompletableFutureUtil.allOfWithResults(userFuture, projectsFuture, statsFuture)
            .thenApply(results -> {
                UserInfo user = (UserInfo) results.get(0);
                List<Project> projects = (List<Project>) results.get(1);
                Statistics stats = (Statistics) results.get(2);
                return new DashboardData(user, projects, stats);
            });
    }
}
```

### 场景2: 批量数据处理

```java
@Service
public class BatchProcessingService {
    
    public CompletableFuture<BatchResult> processBatch(List<Item> items) {
        // 将大批量数据分组处理
        List<List<Item>> batches = Lists.partition(items, 100);
        
        // 为每个批次创建处理任务
        List<Supplier<BatchResult>> tasks = batches.stream()
            .map(batch -> (Supplier<BatchResult>) () -> processSingleBatch(batch))
            .collect(Collectors.toList());
        
        // 并行处理所有批次
        return CompletableFutureUtil.parallel(tasks)
            .thenApply(this::mergeBatchResults);
    }
    
    private BatchResult processSingleBatch(List<Item> batch) {
        // 处理单个批次
        return new BatchResult();
    }
    
    private BatchResult mergeBatchResults(List<BatchResult> results) {
        // 合并所有批次的结果
        return new BatchResult();
    }
}
```

### 场景3: 缓存预热

```java
@Component
public class CacheWarmer {
    
    @PostConstruct
    public void warmupCache() {
        List<Supplier<Void>> warmupTasks = Arrays.asList(
            () -> { warmupUserCache(); return null; },
            () -> { warmupProjectCache(); return null; },
            () -> { warmupConfigCache(); return null; }
        );
        
        CompletableFuture<List<Void>> warmupFuture = CompletableFutureUtil.parallel(warmupTasks);
        
        // 设置超时，避免启动时间过长
        CompletableFutureUtil.completeOnTimeout(warmupFuture, null, 30, TimeUnit.SECONDS)
            .whenComplete((result, error) -> {
                if (error != null) {
                    log.error("缓存预热失败", error);
                } else {
                    log.info("缓存预热完成");
                }
            });
    }
}
```

### 场景4: 异步事件处理

```java
@Component
public class EventProcessor {
    
    public void processEvent(Event event) {
        // 异步处理事件，不阻塞主流程
        CompletableFutureUtil.runAsync(() -> {
            // 发送通知
            notificationService.send(event);
        });
        
        // 异步记录日志
        CompletableFutureUtil.runAsync(() -> {
            auditService.log(event);
        });
        
        // 异步更新统计
        CompletableFutureUtil.supplyAsync(() -> {
            return statisticsService.update(event);
        }).exceptionally(ex -> {
            log.error("更新统计失败", ex);
            return null;
        });
    }
}
```

## 最佳实践

### 1. 资源管理

```java
// 应用关闭时，记得关闭线程池
@PreDestroy
public void cleanup() {
    CompletableFutureUtil.shutdown();
}
```

### 2. 异常处理

```java
// 始终处理异常，避免异常被吞掉
CompletableFuture<String> future = CompletableFutureUtil.supplyAsync(() -> riskyOperation())
    .whenComplete((result, error) -> {
        if (error != null) {
            log.error("操作失败", error);
            // 记录指标
            metricService.recordError(error);
        }
    });
```

### 3. 超时设置

```java
// 对外部调用始终设置超时
CompletableFuture<String> apiCall = CompletableFutureUtil.supplyAsync(() -> 
    externalApi.call()
);

// 设置合理的超时时间
CompletableFuture<String> withTimeout = CompletableFutureUtil.orTimeout(
    apiCall, 5, TimeUnit.SECONDS
);
```

### 4. 避免阻塞

```java
// 错误：在异步操作中阻塞
CompletableFuture<String> bad = CompletableFutureUtil.supplyAsync(() -> {
    String result = future.get(); // 阻塞！
    return process(result);
});

// 正确：使用 thenCompose
CompletableFuture<String> good = CompletableFutureUtil.thenCompose(
    future,
    result -> CompletableFutureUtil.supplyAsync(() -> process(result))
);
```

## 性能优化建议

1. **合理配置线程池**：根据实际负载调整线程池参数
2. **避免创建过多的 CompletableFuture**：复用和组合现有的 Future
3. **使用批处理**：将多个小任务合并成批处理任务
4. **设置合理的超时**：避免任务无限期等待
5. **监控线程池状态**：定期检查线程池的健康状态

## 注意事项

1. **线程安全**：CompletableFuture 本身是线程安全的
2. **内存泄漏**：长时间运行的应用注意及时清理完成的 Future
3. **异常传播**：异常会在链式调用中传播，直到被处理
4. **调试困难**：异步代码调试较困难，建议添加充分的日志

## 总结

`CompletableFutureUtil` 工具类提供了一套完整的异步编程解决方案，通过统一的 API 和内置的线程池管理，大大简化了异步编程的复杂度。在微服务架构、批处理、并行计算等场景中，能够显著提升应用的性能和响应速度。
