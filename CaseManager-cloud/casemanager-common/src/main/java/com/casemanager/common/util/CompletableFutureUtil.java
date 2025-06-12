package com.casemanager.common.util;

import java.util.Arrays;
import java.util.List;
import java.util.concurrent.*;
import java.util.function.*;
import java.util.stream.Collectors;

/**
 * CompletableFuture 工具类
 * 提供 CompletableFuture 的各种使用方法和最佳实践
 *
 * @author CaseManager
 * @since 1.0.0
 */
public class CompletableFutureUtil {
    
    // 自定义线程池（可根据需要调整参数）
    private static final ThreadPoolExecutor CUSTOM_EXECUTOR = new ThreadPoolExecutor(
            10,                                    // 核心线程数
            50,                                    // 最大线程数
            60L,                                   // 线程空闲时间
            TimeUnit.SECONDS,                      // 时间单位
            new LinkedBlockingQueue<>(1000),       // 任务队列
            new ThreadFactory() {                  // 线程工厂
                private int count = 0;
                @Override
                public Thread newThread(Runnable r) {
                    Thread thread = new Thread(r);
                    thread.setName("CompletableFuture-" + count++);
                    thread.setDaemon(true);
                    return thread;
                }
            },
            new ThreadPoolExecutor.CallerRunsPolicy() // 拒绝策略
    );

    /**
     * 1. 创建 CompletableFuture - 基础方法
     */
    
    /**
     * 创建一个已完成的 CompletableFuture
     */
    public static <T> CompletableFuture<T> completedFuture(T value) {
        return CompletableFuture.completedFuture(value);
    }

    /**
     * 创建一个异常完成的 CompletableFuture
     */
    public static <T> CompletableFuture<T> failedFuture(Throwable ex) {
        CompletableFuture<T> future = new CompletableFuture<>();
        future.completeExceptionally(ex);
        return future;
    }

    /**
     * 异步执行一个任务（无返回值）
     */
    public static CompletableFuture<Void> runAsync(Runnable runnable) {
        return CompletableFuture.runAsync(runnable, CUSTOM_EXECUTOR);
    }

    /**
     * 异步执行一个任务（有返回值）
     */
    public static <T> CompletableFuture<T> supplyAsync(Supplier<T> supplier) {
        return CompletableFuture.supplyAsync(supplier, CUSTOM_EXECUTOR);
    }

    /**
     * 2. 转换和组合操作
     */
    
    /**
     * 转换结果 - thenApply
     * 当前阶段正常完成后，将结果作为参数传递给下一个阶段
     */
    public static <T, U> CompletableFuture<U> thenApply(
            CompletableFuture<T> future, Function<? super T, ? extends U> fn) {
        return future.thenApplyAsync(fn, CUSTOM_EXECUTOR);
    }

    /**
     * 消费结果 - thenAccept
     * 当前阶段正常完成后，消费结果但不返回新结果
     */
    public static <T> CompletableFuture<Void> thenAccept(
            CompletableFuture<T> future, Consumer<? super T> action) {
        return future.thenAcceptAsync(action, CUSTOM_EXECUTOR);
    }

    /**
     * 执行操作 - thenRun
     * 当前阶段完成后执行一个 Runnable，不关心上一阶段的结果
     */
    public static CompletableFuture<Void> thenRun(
            CompletableFuture<?> future, Runnable action) {
        return future.thenRunAsync(action, CUSTOM_EXECUTOR);
    }

    /**
     * 组合两个 CompletableFuture - thenCombine
     * 当两个 CompletableFuture 都完成时，使用两个结果进行计算
     */
    public static <T, U, V> CompletableFuture<V> thenCombine(
            CompletableFuture<T> future1,
            CompletableFuture<U> future2,
            BiFunction<? super T, ? super U, ? extends V> fn) {
        return future1.thenCombineAsync(future2, fn, CUSTOM_EXECUTOR);
    }

    /**
     * 组合两个 CompletableFuture - thenAcceptBoth
     * 当两个 CompletableFuture 都完成时，消费两个结果
     */
    public static <T, U> CompletableFuture<Void> thenAcceptBoth(
            CompletableFuture<T> future1,
            CompletableFuture<U> future2,
            BiConsumer<? super T, ? super U> action) {
        return future1.thenAcceptBothAsync(future2, action, CUSTOM_EXECUTOR);
    }

    /**
     * 3. 异常处理
     */
    
    /**
     * 异常处理 - exceptionally
     * 当出现异常时，返回一个默认值
     */
    public static <T> CompletableFuture<T> exceptionally(
            CompletableFuture<T> future,
            Function<Throwable, ? extends T> fn) {
        return future.exceptionally(fn);
    }

    /**
     * 处理正常和异常情况 - handle
     * 无论是否有异常都会执行，可以转换结果或异常
     */
    public static <T, U> CompletableFuture<U> handle(
            CompletableFuture<T> future,
            BiFunction<? super T, Throwable, ? extends U> fn) {
        return future.handleAsync(fn, CUSTOM_EXECUTOR);
    }

    /**
     * 处理正常和异常情况 - whenComplete
     * 无论是否有异常都会执行，但不改变结果
     */
    public static <T> CompletableFuture<T> whenComplete(
            CompletableFuture<T> future,
            BiConsumer<? super T, ? super Throwable> action) {
        return future.whenCompleteAsync(action, CUSTOM_EXECUTOR);
    }

    /**
     * 4. 多个 CompletableFuture 的组合
     */
    
    /**
     * 等待所有 CompletableFuture 完成 - allOf
     */
    @SafeVarargs
    public static CompletableFuture<Void> allOf(CompletableFuture<?>... futures) {
        return CompletableFuture.allOf(futures);
    }

    /**
     * 等待所有 CompletableFuture 完成并收集结果
     */
    @SafeVarargs
    public static <T> CompletableFuture<List<T>> allOfWithResults(CompletableFuture<T>... futures) {
        return CompletableFuture.allOf(futures)
                .thenApply(v -> Arrays.stream(futures)
                        .map(CompletableFuture::join)
                        .collect(Collectors.toList()));
    }

    /**
     * 等待任意一个 CompletableFuture 完成 - anyOf
     */
    @SafeVarargs
    public static CompletableFuture<Object> anyOf(CompletableFuture<?>... futures) {
        return CompletableFuture.anyOf(futures);
    }

    /**
     * 5. 链式调用和流水线
     */
    
    /**
     * 链式调用 - thenCompose
     * 当前阶段完成后，使用结果创建新的 CompletableFuture
     */
    public static <T, U> CompletableFuture<U> thenCompose(
            CompletableFuture<T> future,
            Function<? super T, ? extends CompletionStage<U>> fn) {
        return future.thenComposeAsync(fn, CUSTOM_EXECUTOR);
    }

    /**
     * 6. 超时控制
     */
    
    /**
     * 设置超时时间（Java 9+）
     * 如果在指定时间内未完成，则抛出 TimeoutException
     */
    public static <T> CompletableFuture<T> orTimeout(
            CompletableFuture<T> future, long timeout, TimeUnit unit) {
        return future.orTimeout(timeout, unit);
    }

    /**
     * 设置超时时间并提供默认值（Java 9+）
     * 如果在指定时间内未完成，则返回默认值
     */
    public static <T> CompletableFuture<T> completeOnTimeout(
            CompletableFuture<T> future, T value, long timeout, TimeUnit unit) {
        return future.completeOnTimeout(value, timeout, unit);
    }

    /**
     * 自定义超时处理（兼容 Java 8）
     */
    public static <T> CompletableFuture<T> withTimeout(
            CompletableFuture<T> future, long timeout, TimeUnit unit) {
        final CompletableFuture<T> timeoutFuture = new CompletableFuture<>();
        
        // 设置超时
        ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
        scheduler.schedule(() -> {
            if (!future.isDone()) {
                timeoutFuture.completeExceptionally(
                    new TimeoutException("Timeout after " + timeout + " " + unit));
            }
        }, timeout, unit);
        
        // 原始 future 完成时，完成 timeoutFuture
        future.whenComplete((result, error) -> {
            scheduler.shutdown();
            if (error != null) {
                timeoutFuture.completeExceptionally(error);
            } else {
                timeoutFuture.complete(result);
            }
        });
        
        return timeoutFuture;
    }

    /**
     * 7. 实用方法
     */
    
    /**
     * 并行执行多个任务并收集结果
     */
    public static <T> CompletableFuture<List<T>> parallel(List<Supplier<T>> suppliers) {
        List<CompletableFuture<T>> futures = suppliers.stream()
                .map(supplier -> supplyAsync(supplier))
                .collect(Collectors.toList());
        
        @SuppressWarnings("unchecked")
        CompletableFuture<T>[] futureArray = futures.toArray(new CompletableFuture[0]);
        return allOfWithResults(futureArray);
    }

    /**
     * 重试机制
     */
    public static <T> CompletableFuture<T> retry(
            Supplier<T> supplier, int maxRetries, long delay, TimeUnit unit) {
        return retryInternal(supplier, maxRetries, delay, unit, 0);
    }

    private static <T> CompletableFuture<T> retryInternal(
            Supplier<T> supplier, int maxRetries, long delay, TimeUnit unit, int attempt) {
        return supplyAsync(supplier)
                .handle((result, error) -> {
                    if (error != null && attempt < maxRetries) {
                        // 延迟后重试
                        CompletableFuture<T> retryFuture = new CompletableFuture<>();
                        ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
                        scheduler.schedule(() -> {
                            retryInternal(supplier, maxRetries, delay, unit, attempt + 1)
                                    .whenComplete((r, e) -> {
                                        if (e != null) {
                                            retryFuture.completeExceptionally(e);
                                        } else {
                                            retryFuture.complete(r);
                                        }
                                        scheduler.shutdown();
                                    });
                        }, delay, unit);
                        return retryFuture;
                    } else if (error != null) {
                        // 达到最大重试次数，抛出异常
                        CompletableFuture<T> failedFuture = new CompletableFuture<>();
                        failedFuture.completeExceptionally(error);
                        return failedFuture;
                    } else {
                        // 成功
                        return CompletableFuture.completedFuture(result);
                    }
                })
                .thenCompose(Function.identity());
    }

    /**
     * 获取结果（带超时）
     */
    public static <T> T get(CompletableFuture<T> future, long timeout, TimeUnit unit) 
            throws InterruptedException, ExecutionException, TimeoutException {
        return future.get(timeout, unit);
    }

    /**
     * 获取结果（阻塞）
     */
    public static <T> T join(CompletableFuture<T> future) {
        return future.join();
    }

    /**
     * 检查是否完成
     */
    public static boolean isDone(CompletableFuture<?> future) {
        return future.isDone();
    }

    /**
     * 检查是否异常完成
     */
    public static boolean isCompletedExceptionally(CompletableFuture<?> future) {
        return future.isCompletedExceptionally();
    }

    /**
     * 取消任务
     */
    public static boolean cancel(CompletableFuture<?> future, boolean mayInterruptIfRunning) {
        return future.cancel(mayInterruptIfRunning);
    }

    /**
     * 8. 使用示例
     */
    
    /**
     * 示例1：基本使用
     */
    public static void example1() {
        // 创建异步任务
        CompletableFuture<String> future = supplyAsync(() -> {
            // 模拟耗时操作
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
            return "Hello";
        });

        // 转换结果
        CompletableFuture<String> transformedFuture = thenApply(future, s -> s + " World!");

        // 消费结果
        thenAccept(transformedFuture, System.out::println);
    }

    /**
     * 示例2：组合多个 CompletableFuture
     */
    public static void example2() {
        CompletableFuture<String> future1 = supplyAsync(() -> "Hello");
        CompletableFuture<String> future2 = supplyAsync(() -> "World");

        // 组合两个结果
        CompletableFuture<String> combinedFuture = thenCombine(
                future1, future2, (s1, s2) -> s1 + " " + s2);

        System.out.println(join(combinedFuture));
    }

    /**
     * 示例3：异常处理
     */
    public static void example3() {
        CompletableFuture<Integer> future = supplyAsync(() -> {
            // 模拟可能出错的操作
            if (Math.random() > 0.5) {
                throw new RuntimeException("Something went wrong!");
            }
            return 42;
        });

        // 异常处理
        CompletableFuture<Integer> handledFuture = exceptionally(future, ex -> {
            System.err.println("Error: " + ex.getMessage());
            return -1; // 默认值
        });

        System.out.println("Result: " + join(handledFuture));
    }

    /**
     * 示例4：并行处理多个任务
     */
    public static void example4() {
        List<Supplier<String>> tasks = Arrays.asList(
                () -> "Task 1 result",
                () -> "Task 2 result",
                () -> "Task 3 result"
        );

        CompletableFuture<List<String>> allResults = parallel(tasks);
        
        join(allResults).forEach(System.out::println);
    }

    /**
     * 示例5：超时控制
     */
    public static void example5() {
        CompletableFuture<String> future = supplyAsync(() -> {
            try {
                Thread.sleep(5000); // 模拟长时间操作
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
            return "Result";
        });

        // 设置3秒超时
        CompletableFuture<String> timeoutFuture = withTimeout(future, 3, TimeUnit.SECONDS);

        try {
            String result = get(timeoutFuture, 4, TimeUnit.SECONDS);
            System.out.println("Result: " + result);
        } catch (Exception e) {
            System.err.println("Timeout or error: " + e.getMessage());
        }
    }

    /**
     * 示例6：重试机制
     */
    public static void example6() {
        Supplier<String> unreliableTask = () -> {
            if (Math.random() > 0.7) {
                return "Success!";
            } else {
                throw new RuntimeException("Random failure");
            }
        };

        CompletableFuture<String> retryFuture = retry(
                unreliableTask, 3, 1, TimeUnit.SECONDS);

        whenComplete(retryFuture, (result, error) -> {
            if (error != null) {
                System.err.println("Failed after retries: " + error.getMessage());
            } else {
                System.out.println("Success: " + result);
            }
        });
    }

    /**
     * 关闭自定义线程池
     */
    public static void shutdown() {
        CUSTOM_EXECUTOR.shutdown();
        try {
            if (!CUSTOM_EXECUTOR.awaitTermination(60, TimeUnit.SECONDS)) {
                CUSTOM_EXECUTOR.shutdownNow();
            }
        } catch (InterruptedException e) {
            CUSTOM_EXECUTOR.shutdownNow();
            Thread.currentThread().interrupt();
        }
    }
}
