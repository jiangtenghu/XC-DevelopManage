# CompletableFutureUtil 使用指南

## 概述

`CompletableFutureUtil` 是一个功能全面的 CompletableFuture 工具类，提供了 CompletableFuture 的所有常用操作方法，包括创建、组合、批量处理、异常处理、超时控制、链式操作、重试机制等功能。

## 主要特性

- **统一的线程池管理**：内置优化配置的线程池，避免使用默认的 ForkJoinPool
- **完整的功能覆盖**：涵盖 CompletableFuture 的所有使用场景
- **简化的 API**：提供静态方法，使用更加便捷
- **丰富的工具方法**：包含重试、超时、并行执行等高级功能
- **异常处理增强**：与项目的 BusinessException 集成

## 功能分类

### 1. 创建 CompletableFuture

#### 创建已完成的 Future
```java
// 创建一个已完成的 Future
CompletableFuture<String> future = CompletableFutureUtil.completedFuture("Hello");

// 创建一个异常完成的 Future
CompletableFuture<String> failedFuture = CompletableFutureUtil.failedFuture(
    new RuntimeException("Error")
);
```

#### 异步执行任务
```java
// 异步执行无返回值任务
CompletableFuture<Void> voidFuture = CompletableFutureUtil.runAsync(() -> {
    System.out.println("异步任务执行");
});

// 异步执行有返回值任务
CompletableFuture<String> future = CompletableFutureUtil.supplyAsync(() -> {
    return "异步结果";
});

// 使用自定义线程池
ExecutorService executor = Executors.newFixedThreadPool(10);
CompletableFuture<String> customFuture = CompletableFutureUtil.supplyAsync(
    () -> "结果", 
    executor
);
```

### 2. 组合操作

#### 组合两个 Future
```java
CompletableFuture<Integer> future1 = CompletableFutureUtil.supplyAsync(() -> 10);
CompletableFuture<Integer> future2 = CompletableFutureUtil.supplyAsync(() -> 20);

// 组合两个结果
CompletableFuture<Integer> combinedFuture = CompletableFutureUtil.thenCombine(
    future1, future2, (a, b) -> a + b
);

// 组合两个结果（无返回值）
CompletableFuture<Void> bothFuture = CompletableFutureUtil.thenAcceptBoth(
    future1, future2, (a, b) -> System.out.println("Sum: " + (a + b))
);
```

#### 任意一个完成时执行
```java
CompletableFuture<String> fast = CompletableFutureUtil.supplyAsync(() -> "快速任务");
CompletableFuture<String> slow = CompletableFutureUtil.delayedFuture(
    1000, TimeUnit.MILLISECONDS, "慢速任务"
);

CompletableFuture<String> eitherFuture = CompletableFutureUtil.applyToEither(
    fast, slow, s -> s + " 完成了"
);
```

### 3. 批量操作

#### 等待所有任务完成
```java
CompletableFuture<String> f1 = CompletableFutureUtil.supplyAsync(() -> "任务1");
CompletableFuture<String> f2 = CompletableFutureUtil.supplyAsync(() -> "任务2");
CompletableFuture<String> f3 = CompletableFutureUtil.supplyAsync(() -> "任务3");

// 等待所有完成
CompletableFuture<Void> allFuture = CompletableFutureUtil.allOf(f1, f2, f3);

// 等待所有完成并收集结果
List<CompletableFuture<String>> futures = Arrays.asList(f1, f2, f3);
CompletableFuture<List<String>> allResults = CompletableFutureUtil.allOfWithResults(futures);
```

#### 等待任意一个完成
```java
CompletableFuture<Object> anyFuture = CompletableFutureUtil.anyOf(f1, f2, f3);
```

#### 并行执行任务
```java
List<Supplier<String>> tasks = Arrays.asList(
    () -> "任务1结果",
    () -> "任务2结果",
    () -> "任务3结果"
);

// 并行执行
CompletableFuture<List<String>> results = CompletableFutureUtil.parallel(tasks);

// 使用自定义线程池并行执行
CompletableFuture<List<String>> customResults = CompletableFutureUtil.parallel(
    tasks, customExecutor
);
```

### 4. 异常处理

#### 异常时返回默认值
```java
CompletableFuture<String> future = CompletableFutureUtil.supplyAsync(() -> {
    throw new RuntimeException("出错了");
});

// 返回默认值
CompletableFuture<String> handled = CompletableFutureUtil.exceptionally(
    future, "默认值"
);

// 使用函数处理异常
CompletableFuture<String> handledWithFunction = CompletableFutureUtil.exceptionally(
    future, 
    throwable -> "错误: " + throwable.getMessage()
);
```

#### 处理结果或异常
```java
CompletableFuture<String> handled = CompletableFutureUtil.handle(
    future,
    (result, error) -> {
        if (error != null) {
            return "错误: " + error.getMessage();
        }
        return "成功: " + result;
    }
);
```

### 5. 超时控制

#### 设置超时
```java
CompletableFuture<String> future = CompletableFutureUtil.supplyAsync(() -> {
    // 长时间运行的任务
    return slowOperation();
});

// 设置超时（超时抛出异常）
CompletableFuture<String> withTimeout = CompletableFutureUtil.withTimeout(
    future, 500, TimeUnit.MILLISECONDS
);

// 超时返回默认值
CompletableFuture<String> withDefault = CompletableFutureUtil.withTimeoutDefault(
    future, 500, TimeUnit.MILLISECONDS, "超时默认值"
);
```

### 6. 链式操作

#### 链式执行多个异步操作
```java
CompletableFuture<Integer> result = CompletableFutureUtil.chain(
    10,
    value -> CompletableFutureUtil.supplyAsync(() -> value * 2),
    value -> CompletableFutureUtil.supplyAsync(() -> value + 5),
    value -> CompletableFutureUtil.supplyAsync(() -> value - 3)
);
// 结果: (10 * 2) + 5 - 3 = 22
```

#### 顺序执行多个异步任务
```java
List<Supplier<CompletableFuture<String>>> tasks = Arrays.asList(
    () -> CompletableFutureUtil.supplyAsync(() -> "第一步"),
    () -> CompletableFutureUtil.supplyAsync(() -> "第二步"),
    () -> CompletableFutureUtil.supplyAsync(() -> "第三步")
);

CompletableFuture<List<String>> sequenceResult = CompletableFutureUtil.sequence(tasks);
```

### 7. 重试机制

#### 带重试的异步执行
```java
// 简单重试
CompletableFuture<String> retryFuture = CompletableFutureUtil.retryAsync(
    () -> {
        // 可能失败的操作
        return callRemoteService();
    },
    3,    // 最大重试次数
    1000  // 重试延迟（毫秒）
);

// 带条件的重试
CompletableFuture<String> conditionalRetry = CompletableFutureUtil.retryAsync(
    () -> callService(),
    3,
    1000,
    throwable -> throwable instanceof IOException  // 只在IO异常时重试
);
```

### 8. 工具方法

#### 获取结果
```java
CompletableFuture<String> future = CompletableFutureUtil.supplyAsync(() -> "结果");

// 带超时获取结果
String result = CompletableFutureUtil.getResult(future, 5, TimeUnit.SECONDS);

// 不抛出检查异常
String result2 = CompletableFutureUtil.join(future);
```

#### 转换和扁平化
```java
// 转换结果类型
CompletableFuture<Integer> intFuture = CompletableFutureUtil.supplyAsync(() -> "100");
CompletableFuture<String> mapped = CompletableFutureUtil.map(
    intFuture, 
    value -> "Result: " + value
);

// 扁平化嵌套的 Future
CompletableFuture<CompletableFuture<String>> nested = 
    CompletableFutureUtil.supplyAsync(() -> 
        CompletableFutureUtil.supplyAsync(() -> "嵌套结果")
    );
CompletableFuture<String> flattened = CompletableFutureUtil.flatten(nested);
```

#### 延迟和计时
```java
// 创建延迟完成的 Future
CompletableFuture<String> delayed = CompletableFutureUtil.delayedFuture(
    1, TimeUnit.SECONDS, "延迟结果"
);

// 执行任务并记录时间
CompletableFuture<String> timed = CompletableFutureUtil.timedAsync(
    "用户查询",
    () -> userService.getUser(userId)
);
```

## 实际应用示例

### 示例1：微服务聚合调用
```java
@Service
public class UserDashboardService {
    
    public CompletableFuture<DashboardData> loadDashboard(Long userId) {
        // 并行调用多个服务
        CompletableFuture<User> userFuture = CompletableFutureUtil.timedAsync(
            "获取用户信息",
            () -> userService.getUser(userId)
        );
        
        CompletableFuture<List<Order>> ordersFuture = CompletableFutureUtil.timedAsync(
            "获取订单列表",
            () -> orderService.getUserOrders(userId)
        );
        
        CompletableFuture<Double> pointsFuture = CompletableFutureUtil.timedAsync(
            "获取积分",
            () -> pointsService.getUserPoints(userId)
        );
        
        // 组合所有结果
        CompletableFuture<DashboardData> dashboardFuture = CompletableFutureUtil.thenCombine(
            userFuture,
            CompletableFutureUtil.thenCombine(ordersFuture, pointsFuture,
                (orders, points) -> new OrdersAndPoints(orders, points)
            ),
            (user, ordersAndPoints) -> new DashboardData(
                user, 
                ordersAndPoints.getOrders(), 
                ordersAndPoints.getPoints()
            )
        );
        
        // 添加超时控制
        return CompletableFutureUtil.withTimeoutDefault(
            dashboardFuture, 
            3, TimeUnit.SECONDS, 
            DashboardData.empty()
        );
    }
}
```

### 示例2：批量处理带重试
```java
@Service
public class BatchProcessor {
    
    public CompletableFuture<BatchResult> processBatch(List<Item> items) {
        // 将每个项目转换为带重试的处理任务
        List<Supplier<ProcessResult>> tasks = items.stream()
            .map(item -> (Supplier<ProcessResult>) () -> {
                // 带重试的处理
                CompletableFuture<ProcessResult> retryFuture = 
                    CompletableFutureUtil.retryAsync(
                        () -> processItem(item),
                        3,     // 重试3次
                        500,   // 延迟500ms
                        ex -> !(ex instanceof IllegalArgumentException) // 参数错误不重试
                    );
                return CompletableFutureUtil.join(retryFuture);
            })
            .collect(Collectors.toList());
        
        // 并行执行所有任务
        CompletableFuture<List<ProcessResult>> allResults = 
            CompletableFutureUtil.parallel(tasks);
        
        // 处理结果
        return allResults
            .thenApply(this::aggregateResults)
            .exceptionally(ex -> {
                log.error("批处理失败", ex);
                return BatchResult.failed(ex.getMessage());
            });
    }
    
    private ProcessResult processItem(Item item) {
        // 实际处理逻辑
        if (Math.random() > 0.8) {
            throw new RuntimeException("随机失败");
        }
        return new ProcessResult(item.getId(), "processed");
    }
    
    private BatchResult aggregateResults(List<ProcessResult> results) {
        // 聚合结果
        return new BatchResult(results);
    }
}
```

### 示例3：异步事件处理链
```java
@Component
public class EventProcessor {
    
    public CompletableFuture<Void> processEvent(Event event) {
        return CompletableFutureUtil.chain(
            event,
            // 步骤1：验证事件
            e -> CompletableFutureUtil.supplyAsync(() -> {
                validateEvent(e);
                log.info("事件验证通过: {}", e.getId());
                return e;
            }),
            // 步骤2：保存到数据库
            e -> CompletableFutureUtil.supplyAsync(() -> {
                eventRepository.save(e);
                log.info("事件已保存: {}", e.getId());
                return e;
            }),
            // 步骤3：发送通知
            e -> CompletableFutureUtil.supplyAsync(() -> {
                notificationService.notify(e);
                log.info("通知已发送: {}", e.getId());
                return e;
            }),
            // 步骤4：更新统计
            e -> CompletableFutureUtil.supplyAsync(() -> {
                statisticsService.update(e);
                log.info("统计已更新: {}", e.getId());
                return e;
            })
        ).thenApply(e -> null)  // 转换为 Void
         .exceptionally(ex -> {
            log.error("事件处理失败: {}", event.getId(), ex);
            // 发送告警
            alertService.sendAlert("事件处理失败", ex);
            return null;
        });
    }
}
```

### 示例4：缓存预热
```java
@Component
public class CacheWarmer {
    
    @PostConstruct
    public void warmupCache() {
        log.info("开始缓存预热...");
        
        List<Supplier<String>> warmupTasks = Arrays.asList(
            () -> { warmupUserCache(); return "用户缓存"; },
            () -> { warmupProjectCache(); return "项目缓存"; },
            () -> { warmupConfigCache(); return "配置缓存"; }
        );
        
        // 并行预热，设置总超时时间
        CompletableFutureUtil.withTimeoutDefault(
            CompletableFutureUtil.parallel(warmupTasks),
            30, TimeUnit.SECONDS,
            Collections.emptyList()
        ).whenComplete((results, error) -> {
            if (error != null) {
                log.error("缓存预热失败", error);
            } else {
                log.info("缓存预热完成: {}", results);
            }
        });
    }
    
    private void warmupUserCache() {
        List<User> users = userRepository.findTop1000ByOrderByLastLoginDesc();
        users.forEach(user -> cacheService.put("user:" + user.getId(), user));
    }
    
    private void warmupProjectCache() {
        List<Project> projects = projectRepository.findAllActive();
        projects.forEach(project -> cacheService.put("project:" + project.getId(), project));
    }
    
    private void warmupConfigCache() {
        Map<String, String> configs = configRepository.findAll();
        configs.forEach((key, value) -> cacheService.put("config:" + key, value));
    }
}
```

## 最佳实践

### 1. 合理使用线程池
```java
// 工具类提供了默认线程池，适合大多数场景
CompletableFutureUtil.supplyAsync(() -> "使用默认线程池");

// 对于特殊场景，可以使用自定义线程池
ExecutorService customExecutor = new ThreadPoolExecutor(
    10, 50, 60L, TimeUnit.SECONDS,
    new LinkedBlockingQueue<>(1000),
    new ThreadFactory() {
        private final AtomicInteger counter = new AtomicInteger();
        @Override
        public Thread newThread(Runnable r) {
            return new Thread(r, "custom-pool-" + counter.incrementAndGet());
        }
    }
);

CompletableFutureUtil.supplyAsync(() -> "使用自定义线程池", customExecutor);
```

### 2. 异常处理策略
```java
// 始终处理异常，避免异常被吞掉
CompletableFuture<String> future = CompletableFutureUtil.supplyAsync(() -> riskyOperation())
    .whenComplete((result, error) -> {
        if (error != null) {
            // 记录日志
            log.error("操作失败", error);
            // 发送监控指标
            metricService.recordError("risky_operation", error);
            // 发送告警
            if (error instanceof CriticalException) {
                alertService.sendAlert("关键操作失败", error);
            }
        }
    });
```

### 3. 超时控制
```java
// 对所有外部调用设置超时
public CompletableFuture<ApiResponse> callExternalApi(Request request) {
    CompletableFuture<ApiResponse> apiCall = CompletableFutureUtil.supplyAsync(() -> 
        externalApi.call(request)
    );
    
    // 设置合理的超时时间
    return CompletableFutureUtil.withTimeoutDefault(
        apiCall, 
        5, TimeUnit.SECONDS,
        ApiResponse.timeout()
    );
}
```

### 4. 避免阻塞
```java
// 错误：在异步操作中阻塞
CompletableFuture<String> bad = CompletableFutureUtil.supplyAsync(() -> {
    try {
        // 阻塞！会占用线程池线程
        String result = future.get();
        return process(result);
    } catch (Exception e) {
        throw new RuntimeException(e);
    }
});

// 正确：使用组合操作
CompletableFuture<String> good = future.thenCompose(result -> 
    CompletableFutureUtil.supplyAsync(() -> process(result))
);
```

### 5. 资源清理
```java
// 确保 CompletableFuture 完成后释放资源
CompletableFuture<Resource> resourceFuture = CompletableFutureUtil.supplyAsync(() -> 
    acquireResource()
);

resourceFuture
    .thenApply(resource -> {
        try {
            return processResource(resource);
        } finally {
            resource.close(); // 确保资源被释放
        }
    })
    .exceptionally(ex -> {
        log.error("处理资源失败", ex);
        return null;
    });
```

## 性能优化建议

1. **批量处理**：将多个小任务合并成批处理任务，减少线程切换开销
2. **合理的并行度**：根据 CPU 核心数和任务特性设置合适的并行度
3. **避免过度创建**：复用 CompletableFuture，避免创建过多实例
4. **监控线程池**：定期监控线程池状态，及时发现问题
5. **内存管理**：长时间运行的应用注意及时清理已完成的 Future

## 注意事项

1. **线程安全**：CompletableFuture 本身是线程安全的，但要注意共享数据的线程安全
2. **异常传播**：异常会在链式调用中传播，直到被处理
3. **调试困难**：异步代码调试较困难，建议添加充分的日志和监控
4. **默认线程池大小**：基于 CPU 核心数配置，可能需要根据实际负载调整
5. **重试机制**：重试会在线程中阻塞，大量使用时注意线程池容量

## 总结

`CompletableFutureUtil` 提供了一套完整、易用的异步编程工具集，涵盖了 CompletableFuture 的所有常用场景。通过合理使用这些工具方法，可以编写出高效、可靠的异步代码，显著提升应用的性能和响应速度。
