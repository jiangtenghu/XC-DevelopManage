package com.casemanager.common.utils;

import com.casemanager.common.exception.BusinessException;
import lombok.extern.slf4j.Slf4j;

import java.util.Collection;
import java.util.List;
import java.util.concurrent.*;
import java.util.function.*;
import java.util.stream.Collectors;

/**
 * CompletableFuture 工具类
 * 提供 CompletableFuture 的各种便捷使用方法
 *
 * @author CaseManager
 * @since 1.0.0
 */
@Slf4j
public class CompletableFutureUtil {

    /**
     * 默认线程池 - 用于异步任务执行
     */
    private static final Executor DEFAULT_EXECUTOR = new ThreadPoolExecutor(
            Runtime.getRuntime().availableProcessors(),
            Runtime.getRuntime().availableProcessors() * 2,
            60L, TimeUnit.SECONDS,
            new LinkedBlockingQueue<>(1000),
            new ThreadFactory() {
                private int counter = 0;
                @Override
                public Thread newThread(Runnable r) {
                    return new Thread(r, "CompletableFuture-" + counter++);
                }
            },
            new ThreadPoolExecutor.CallerRunsPolicy()
    );

    /**
     * 私有构造函数，防止实例化
     */
    private CompletableFutureUtil() {
        throw new IllegalStateException("Utility class");
    }

    // ==================== 创建 CompletableFuture ====================

    /**
     * 创建一个已完成的 CompletableFuture
     *
     * @param value 完成值
     * @param <T>   值类型
     * @return 已完成的 CompletableFuture
     */
    public static <T> CompletableFuture<T> completedFuture(T value) {
        return CompletableFuture.completedFuture(value);
    }

    /**
     * 创建一个异常完成的 CompletableFuture
     *
     * @param ex  异常
     * @param <T> 值类型
     * @return 异常完成的 CompletableFuture
     */
    public static <T> CompletableFuture<T> failedFuture(Throwable ex) {
        CompletableFuture<T> future = new CompletableFuture<>();
        future.completeExceptionally(ex);
        return future;
    }

    /**
     * 异步执行一个任务（无返回值）
     *
     * @param runnable 要执行的任务
     * @return CompletableFuture<Void>
     */
    public static CompletableFuture<Void> runAsync(Runnable runnable) {
        return CompletableFuture.runAsync(runnable, DEFAULT_EXECUTOR);
    }

    /**
     * 异步执行一个任务（有返回值）
     *
     * @param supplier 供应函数
     * @param <T>      返回值类型
     * @return CompletableFuture<T>
     */
    public static <T> CompletableFuture<T> supplyAsync(Supplier<T> supplier) {
        return CompletableFuture.supplyAsync(supplier, DEFAULT_EXECUTOR);
    }

    /**
     * 使用自定义线程池异步执行任务
     *
     * @param supplier 供应函数
     * @param executor 线程池
     * @param <T>      返回值类型
     * @return CompletableFuture<T>
     */
    public static <T> CompletableFuture<T> supplyAsync(Supplier<T> supplier, Executor executor) {
        return CompletableFuture.supplyAsync(supplier, executor);
    }

    // ==================== 组合操作 ====================

    /**
     * 当两个 CompletableFuture 都完成时，执行给定的操作
     *
     * @param future1    第一个 future
     * @param future2    第二个 future
     * @param biFunction 组合函数
     * @param <T>        第一个 future 的类型
     * @param <U>        第二个 future 的类型
     * @param <R>        结果类型
     * @return 组合后的 CompletableFuture
     */
    public static <T, U, R> CompletableFuture<R> thenCombine(
            CompletableFuture<T> future1,
            CompletableFuture<U> future2,
            BiFunction<? super T, ? super U, ? extends R> biFunction) {
        return future1.thenCombine(future2, biFunction);
    }

    /**
     * 当两个 CompletableFuture 都完成时，执行给定的操作（无返回值）
     *
     * @param future1    第一个 future
     * @param future2    第二个 future
     * @param biConsumer 消费函数
     * @param <T>        第一个 future 的类型
     * @param <U>        第二个 future 的类型
     * @return CompletableFuture<Void>
     */
    public static <T, U> CompletableFuture<Void> thenAcceptBoth(
            CompletableFuture<T> future1,
            CompletableFuture<U> future2,
            BiConsumer<? super T, ? super U> biConsumer) {
        return future1.thenAcceptBoth(future2, biConsumer);
    }

    /**
     * 当任意一个 CompletableFuture 完成时，执行给定的操作
     *
     * @param future1  第一个 future
     * @param future2  第二个 future
     * @param function 转换函数
     * @param <T>      输入类型
     * @param <R>      结果类型
     * @return 组合后的 CompletableFuture
     */
    public static <T, R> CompletableFuture<R> applyToEither(
            CompletableFuture<T> future1,
            CompletableFuture<T> future2,
            Function<? super T, R> function) {
        return future1.applyToEither(future2, function);
    }

    // ==================== 批量操作 ====================

    /**
     * 等待所有 CompletableFuture 完成
     *
     * @param futures CompletableFuture 数组
     * @return CompletableFuture<Void>
     */
    public static CompletableFuture<Void> allOf(CompletableFuture<?>... futures) {
        return CompletableFuture.allOf(futures);
    }

    /**
     * 等待所有 CompletableFuture 完成，并收集结果
     *
     * @param futures CompletableFuture 列表
     * @param <T>     结果类型
     * @return 包含所有结果的 CompletableFuture
     */
    public static <T> CompletableFuture<List<T>> allOfWithResults(Collection<CompletableFuture<T>> futures) {
        return allOf(futures.toArray(new CompletableFuture[0]))
                .thenApply(v -> futures.stream()
                        .map(CompletableFuture::join)
                        .collect(Collectors.toList()));
    }

    /**
     * 等待任意一个 CompletableFuture 完成
     *
     * @param futures CompletableFuture 数组
     * @return CompletableFuture<Object>
     */
    public static CompletableFuture<Object> anyOf(CompletableFuture<?>... futures) {
        return CompletableFuture.anyOf(futures);
    }

    /**
     * 并行执行多个任务，并收集结果
     *
     * @param tasks 任务列表
     * @param <T>   结果类型
     * @return 包含所有结果的 CompletableFuture
     */
    public static <T> CompletableFuture<List<T>> parallel(List<Supplier<T>> tasks) {
        List<CompletableFuture<T>> futures = tasks.stream()
                .map(task -> supplyAsync(task))
                .collect(Collectors.toList());
        return allOfWithResults(futures);
    }

    /**
     * 并行执行多个任务，使用自定义线程池
     *
     * @param tasks    任务列表
     * @param executor 线程池
     * @param <T>      结果类型
     * @return 包含所有结果的 CompletableFuture
     */
    public static <T> CompletableFuture<List<T>> parallel(List<Supplier<T>> tasks, Executor executor) {
        List<CompletableFuture<T>> futures = tasks.stream()
                .map(task -> supplyAsync(task, executor))
                .collect(Collectors.toList());
        return allOfWithResults(futures);
    }

    // ==================== 异常处理 ====================

    /**
     * 处理异常，返回默认值
     *
     * @param future       原始 future
     * @param defaultValue 默认值
     * @param <T>          值类型
     * @return 处理后的 CompletableFuture
     */
    public static <T> CompletableFuture<T> exceptionally(CompletableFuture<T> future, T defaultValue) {
        return future.exceptionally(throwable -> {
            log.error("CompletableFuture exception occurred", throwable);
            return defaultValue;
        });
    }

    /**
     * 处理异常，使用函数返回默认值
     *
     * @param future           原始 future
     * @param exceptionHandler 异常处理函数
     * @param <T>              值类型
     * @return 处理后的 CompletableFuture
     */
    public static <T> CompletableFuture<T> exceptionally(
            CompletableFuture<T> future,
            Function<Throwable, ? extends T> exceptionHandler) {
        return future.exceptionally(throwable -> {
            log.error("CompletableFuture exception occurred", throwable);
            return exceptionHandler.apply(throwable);
        });
    }

    /**
     * 处理结果或异常
     *
     * @param future   原始 future
     * @param handler  处理函数
     * @param <T>      输入类型
     * @param <R>      结果类型
     * @return 处理后的 CompletableFuture
     */
    public static <T, R> CompletableFuture<R> handle(
            CompletableFuture<T> future,
            BiFunction<? super T, Throwable, ? extends R> handler) {
        return future.handle(handler);
    }

    // ==================== 超时控制 ====================

    /**
     * 为 CompletableFuture 添加超时控制
     *
     * @param future  原始 future
     * @param timeout 超时时间
     * @param unit    时间单位
     * @param <T>     值类型
     * @return 带超时的 CompletableFuture
     */
    public static <T> CompletableFuture<T> withTimeout(
            CompletableFuture<T> future,
            long timeout,
            TimeUnit unit) {
        final CompletableFuture<T> timeoutFuture = new CompletableFuture<>();
        
        // 设置超时
        ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor(r -> {
            Thread thread = new Thread(r);
            thread.setDaemon(true);
            return thread;
        });
        
        scheduler.schedule(() -> {
            if (!future.isDone()) {
                timeoutFuture.completeExceptionally(new TimeoutException("Operation timed out"));
            }
        }, timeout, unit);
        
        // 原始 future 完成时，完成 timeout future
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
     * 为 CompletableFuture 添加超时控制，超时返回默认值
     *
     * @param future       原始 future
     * @param timeout      超时时间
     * @param unit         时间单位
     * @param defaultValue 默认值
     * @param <T>          值类型
     * @return 带超时的 CompletableFuture
     */
    public static <T> CompletableFuture<T> withTimeoutDefault(
            CompletableFuture<T> future,
            long timeout,
            TimeUnit unit,
            T defaultValue) {
        return withTimeout(future, timeout, unit)
                .exceptionally(throwable -> {
                    if (throwable instanceof TimeoutException) {
                        log.warn("Operation timed out, returning default value");
                        return defaultValue;
                    }
                    throw new CompletionException(throwable);
                });
    }

    // ==================== 链式操作 ====================

    /**
     * 链式执行多个异步操作
     *
     * @param initial  初始值
     * @param functions 函数列表
     * @param <T>      类型
     * @return 最终结果的 CompletableFuture
     */
    @SafeVarargs
    public static <T> CompletableFuture<T> chain(
            T initial,
            Function<T, CompletableFuture<T>>... functions) {
        CompletableFuture<T> result = completedFuture(initial);
        for (Function<T, CompletableFuture<T>> function : functions) {
            result = result.thenCompose(function);
        }
        return result;
    }

    /**
     * 顺序执行多个异步任务
     *
     * @param tasks 任务列表
     * @param <T>   结果类型
     * @return 包含所有结果的 CompletableFuture
     */
    public static <T> CompletableFuture<List<T>> sequence(List<Supplier<CompletableFuture<T>>> tasks) {
        CompletableFuture<List<T>> result = completedFuture(new CopyOnWriteArrayList<>());
        
        for (Supplier<CompletableFuture<T>> task : tasks) {
            result = result.thenCompose(list -> 
                task.get().thenApply(value -> {
                    list.add(value);
                    return list;
                })
            );
        }
        
        return result;
    }

    // ==================== 重试机制 ====================

    /**
     * 带重试机制的异步执行
     *
     * @param supplier  供应函数
     * @param maxRetries 最大重试次数
     * @param delay     重试延迟（毫秒）
     * @param <T>       返回类型
     * @return CompletableFuture
     */
    public static <T> CompletableFuture<T> retryAsync(
            Supplier<T> supplier,
            int maxRetries,
            long delay) {
        return retryAsync(supplier, maxRetries, delay, null);
    }

    /**
     * 带重试机制的异步执行（可指定重试条件）
     *
     * @param supplier      供应函数
     * @param maxRetries    最大重试次数
     * @param delay         重试延迟（毫秒）
     * @param retryPredicate 重试条件（返回 true 表示需要重试）
     * @param <T>           返回类型
     * @return CompletableFuture
     */
    public static <T> CompletableFuture<T> retryAsync(
            Supplier<T> supplier,
            int maxRetries,
            long delay,
            Predicate<Throwable> retryPredicate) {
        return retryAsyncInternal(supplier, maxRetries, delay, retryPredicate, 0);
    }

    private static <T> CompletableFuture<T> retryAsyncInternal(
            Supplier<T> supplier,
            int maxRetries,
            long delay,
            Predicate<Throwable> retryPredicate,
            int currentAttempt) {
        
        return supplyAsync(supplier)
                .exceptionally(throwable -> {
                    if (currentAttempt < maxRetries && 
                        (retryPredicate == null || retryPredicate.test(throwable))) {
                        log.warn("Attempt {} failed, retrying... Error: {}", 
                                currentAttempt + 1, throwable.getMessage());
                        
                        try {
                            Thread.sleep(delay);
                        } catch (InterruptedException e) {
                            Thread.currentThread().interrupt();
                            throw new CompletionException(e);
                        }
                        
                        return retryAsyncInternal(supplier, maxRetries, delay, 
                                retryPredicate, currentAttempt + 1).join();
                    } else {
                        log.error("All retry attempts failed", throwable);
                        throw new CompletionException(throwable);
                    }
                });
    }

    // ==================== 工具方法 ====================

    /**
     * 获取 CompletableFuture 的结果（带超时）
     *
     * @param future  CompletableFuture
     * @param timeout 超时时间
     * @param unit    时间单位
     * @param <T>     结果类型
     * @return 结果
     * @throws BusinessException 如果超时或执行异常
     */
    public static <T> T getResult(CompletableFuture<T> future, long timeout, TimeUnit unit) {
        try {
            return future.get(timeout, unit);
        } catch (TimeoutException e) {
            throw new BusinessException("Operation timed out after " + timeout + " " + unit);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new BusinessException("Operation was interrupted", e);
        } catch (ExecutionException e) {
            Throwable cause = e.getCause();
            if (cause instanceof BusinessException) {
                throw (BusinessException) cause;
            }
            throw new BusinessException("Operation failed", cause);
        }
    }

    /**
     * 获取 CompletableFuture 的结果（不抛出检查异常）
     *
     * @param future CompletableFuture
     * @param <T>    结果类型
     * @return 结果
     */
    public static <T> T join(CompletableFuture<T> future) {
        try {
            return future.join();
        } catch (CompletionException e) {
            Throwable cause = e.getCause();
            if (cause instanceof BusinessException) {
                throw (BusinessException) cause;
            }
            throw new BusinessException("Operation failed", cause);
        }
    }

    /**
     * 转换 CompletableFuture 的结果类型
     *
     * @param future   原始 future
     * @param mapper   转换函数
     * @param <T>      原始类型
     * @param <R>      目标类型
     * @return 转换后的 CompletableFuture
     */
    public static <T, R> CompletableFuture<R> map(
            CompletableFuture<T> future,
            Function<? super T, ? extends R> mapper) {
        return future.thenApply(mapper);
    }

    /**
     * 扁平化嵌套的 CompletableFuture
     *
     * @param future 嵌套的 future
     * @param <T>    结果类型
     * @return 扁平化后的 CompletableFuture
     */
    public static <T> CompletableFuture<T> flatten(
            CompletableFuture<CompletableFuture<T>> future) {
        return future.thenCompose(Function.identity());
    }

    /**
     * 创建一个延迟完成的 CompletableFuture
     *
     * @param delay    延迟时间
     * @param unit     时间单位
     * @param value    完成值
     * @param <T>      值类型
     * @return 延迟完成的 CompletableFuture
     */
    public static <T> CompletableFuture<T> delayedFuture(long delay, TimeUnit unit, T value) {
        CompletableFuture<T> future = new CompletableFuture<>();
        ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor(r -> {
            Thread thread = new Thread(r);
            thread.setDaemon(true);
            return thread;
        });
        
        scheduler.schedule(() -> {
            future.complete(value);
            scheduler.shutdown();
        }, delay, unit);
        
        return future;
    }

    /**
     * 执行异步任务并记录执行时间
     *
     * @param taskName 任务名称
     * @param supplier 供应函数
     * @param <T>      返回类型
     * @return CompletableFuture
     */
    public static <T> CompletableFuture<T> timedAsync(String taskName, Supplier<T> supplier) {
        long startTime = System.currentTimeMillis();
        return supplyAsync(supplier)
                .whenComplete((result, error) -> {
                    long duration = System.currentTimeMillis() - startTime;
                    if (error != null) {
                        log.error("Task '{}' failed after {} ms", taskName, duration, error);
                    } else {
                        log.info("Task '{}' completed in {} ms", taskName, duration);
                    }
                });
    }
}
