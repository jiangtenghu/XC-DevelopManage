package com.casemanager.common.utils;

import com.casemanager.common.exception.BusinessException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Timeout;

import java.util.Arrays;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;

/**
 * CompletableFutureUtil 测试类
 * 演示各种使用方法
 *
 * @author CaseManager
 * @since 1.0.0
 */
class CompletableFutureUtilTest {

    // ==================== 创建 CompletableFuture 测试 ====================

    @Test
    void testCompletedFuture() {
        // 创建一个已完成的 Future
        CompletableFuture<String> future = CompletableFutureUtil.completedFuture("Hello");
        
        assertTrue(future.isDone());
        assertEquals("Hello", CompletableFutureUtil.join(future));
    }

    @Test
    void testFailedFuture() {
        // 创建一个异常完成的 Future
        RuntimeException exception = new RuntimeException("Test exception");
        CompletableFuture<String> future = CompletableFutureUtil.failedFuture(exception);
        
        assertTrue(future.isCompletedExceptionally());
        assertThrows(BusinessException.class, () -> CompletableFutureUtil.join(future));
    }

    @Test
    void testRunAsync() {
        // 异步执行无返回值任务
        AtomicInteger counter = new AtomicInteger(0);
        CompletableFuture<Void> future = CompletableFutureUtil.runAsync(() -> {
            try {
                Thread.sleep(100);
                counter.incrementAndGet();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
        
        CompletableFutureUtil.join(future);
        assertEquals(1, counter.get());
    }

    @Test
    void testSupplyAsync() {
        // 异步执行有返回值任务
        CompletableFuture<String> future = CompletableFutureUtil.supplyAsync(() -> {
            try {
                Thread.sleep(100);
                return "Async Result";
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return null;
            }
        });
        
        assertEquals("Async Result", CompletableFutureUtil.join(future));
    }

    // ==================== 组合操作测试 ====================

    @Test
    void testThenCombine() {
        // 组合两个 Future 的结果
        CompletableFuture<Integer> future1 = CompletableFutureUtil.supplyAsync(() -> 10);
        CompletableFuture<Integer> future2 = CompletableFutureUtil.supplyAsync(() -> 20);
        
        CompletableFuture<Integer> combinedFuture = CompletableFutureUtil.thenCombine(
            future1, future2, (a, b) -> a + b
        );
        
        assertEquals(30, CompletableFutureUtil.join(combinedFuture));
    }

    @Test
    void testThenAcceptBoth() {
        // 组合两个 Future，消费结果
        CompletableFuture<String> future1 = CompletableFutureUtil.supplyAsync(() -> "Hello");
        CompletableFuture<String> future2 = CompletableFutureUtil.supplyAsync(() -> "World");
        
        StringBuilder result = new StringBuilder();
        CompletableFuture<Void> combinedFuture = CompletableFutureUtil.thenAcceptBoth(
            future1, future2, (a, b) -> result.append(a).append(" ").append(b)
        );
        
        CompletableFutureUtil.join(combinedFuture);
        assertEquals("Hello World", result.toString());
    }

    @Test
    void testApplyToEither() {
        // 任意一个完成时执行
        CompletableFuture<String> future1 = CompletableFutureUtil.delayedFuture(200, TimeUnit.MILLISECONDS, "Slow");
        CompletableFuture<String> future2 = CompletableFutureUtil.supplyAsync(() -> "Fast");
        
        CompletableFuture<String> eitherFuture = CompletableFutureUtil.applyToEither(
            future1, future2, s -> s + " Winner"
        );
        
        assertEquals("Fast Winner", CompletableFutureUtil.join(eitherFuture));
    }

    // ==================== 批量操作测试 ====================

    @Test
    void testAllOf() {
        // 等待所有 Future 完成
        CompletableFuture<Integer> future1 = CompletableFutureUtil.supplyAsync(() -> 1);
        CompletableFuture<Integer> future2 = CompletableFutureUtil.supplyAsync(() -> 2);
        CompletableFuture<Integer> future3 = CompletableFutureUtil.supplyAsync(() -> 3);
        
        CompletableFuture<Void> allFuture = CompletableFutureUtil.allOf(future1, future2, future3);
        CompletableFutureUtil.join(allFuture);
        
        assertTrue(future1.isDone());
        assertTrue(future2.isDone());
        assertTrue(future3.isDone());
    }

    @Test
    void testAllOfWithResults() {
        // 等待所有 Future 完成并收集结果
        List<CompletableFuture<Integer>> futures = Arrays.asList(
            CompletableFutureUtil.supplyAsync(() -> 1),
            CompletableFutureUtil.supplyAsync(() -> 2),
            CompletableFutureUtil.supplyAsync(() -> 3)
        );
        
        CompletableFuture<List<Integer>> resultFuture = CompletableFutureUtil.allOfWithResults(futures);
        List<Integer> results = CompletableFutureUtil.join(resultFuture);
        
        assertEquals(Arrays.asList(1, 2, 3), results);
    }

    @Test
    void testAnyOf() {
        // 等待任意一个 Future 完成
        CompletableFuture<String> future1 = CompletableFutureUtil.delayedFuture(300, TimeUnit.MILLISECONDS, "Slow");
        CompletableFuture<String> future2 = CompletableFutureUtil.supplyAsync(() -> "Fast");
        CompletableFuture<String> future3 = CompletableFutureUtil.delayedFuture(200, TimeUnit.MILLISECONDS, "Medium");
        
        CompletableFuture<Object> anyFuture = CompletableFutureUtil.anyOf(future1, future2, future3);
        Object result = CompletableFutureUtil.join(anyFuture);
        
        
        assertEquals("Fast", result);
    }

    @Test
    void testParallel() {
        // 并行执行多个任务
        List<Integer> results = CompletableFutureUtil.join(
            CompletableFutureUtil.parallel(Arrays.asList(
                () -> 1 + 1,
                () -> 2 + 2,
                () -> 3 + 3
            ))
        );

        assertEquals(Arrays.asList(2, 4, 6), results);
    }

    // ==================== 异常处理测试 ====================

    @Test
    void testExceptionally() {
        // 异常处理，返回默认值
        CompletableFuture<String> future = CompletableFutureUtil.supplyAsync(() -> {
            throw new RuntimeException("Error");
        });
        
        CompletableFuture<String> handledFuture = CompletableFutureUtil.exceptionally(future, "Default");
        assertEquals("Default", CompletableFutureUtil.join(handledFuture));
    }

    @Test
    void testExceptionallyWithFunction() {
        // 异常处理，使用函数返回值
        CompletableFuture<String> future = CompletableFutureUtil.supplyAsync(() -> {
            throw new RuntimeException("Error");
        });



        CompletableFuture<String> handledFuture = CompletableFutureUtil.exceptionally(
            future, 
            (Throwable throwable) -> "Error: " + throwable.getMessage()
        );
        
        assertTrue(CompletableFutureUtil.join(handledFuture).contains("Error"));
        );
        assertEquals("Result: 42", CompletableFutureUtil.join(handledSuccess));
        
        CompletableFuture<Integer> errorFuture = CompletableFutureUtil.supplyAsync(() -> {
            throw new RuntimeException("Test error");
        });
        CompletableFuture<String> handledError = CompletableFutureUtil.handle(
            errorFuture,
            (result, error) -> error != null ? "Error occurred" : "Result: " + result
        );
        assertEquals("Error occurred", CompletableFutureUtil.join(handledError));
    }

    // ==================== 超时控制测试 ====================

    @Test
    @Timeout(2)
    void testWithTimeout() {
        // 超时控制
        CompletableFuture<String> slowFuture = CompletableFutureUtil.supplyAsync(() -> {
            try {
                Thread.sleep(2000);
                return "Too slow";
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return null;
            }
        });
        
        CompletableFuture<String> timeoutFuture = CompletableFutureUtil.withTimeout(
            slowFuture, 500, TimeUnit.MILLISECONDS
        );
        
        assertThrows(BusinessException.class, () -> CompletableFutureUtil.join(timeoutFuture));
    }

    @Test
    void testWithTimeoutDefault() {
        // 超时返回默认值
        CompletableFuture<String> slowFuture = CompletableFutureUtil.supplyAsync(() -> {
            try {
                Thread.sleep(1000);
                return "Too slow";
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return null;
            }
        });
        
        CompletableFuture<String> timeoutFuture = CompletableFutureUtil.withTimeoutDefault(
            slowFuture, 200, TimeUnit.MILLISECONDS, "Timeout Default"
        );
        
        assertEquals("Timeout Default", CompletableFutureUtil.join(timeoutFuture));
    }

    // ==================== 链式操作测试 ====================

    @Test
    void testChain() {
        // 链式执行多个异步操作
        CompletableFuture<Integer> result = CompletableFutureUtil.chain(
            10,
            value -> CompletableFutureUtil.supplyAsync(() -> value * 2),
            value -> CompletableFutureUtil.supplyAsync(() -> value + 5),
            value -> CompletableFutureUtil.supplyAsync(() -> value - 3)
        );
        
        assertEquals(22, CompletableFutureUtil.join(result)); // (10 * 2) + 5 - 3 = 22
    }

    @Test
    void testSequence() {
        // 顺序执行多个异步任务
        AtomicInteger counter = new AtomicInteger(0);
        
        List<Integer> results = CompletableFutureUtil.join(
            CompletableFutureUtil.sequence(Arrays.asList(
                () -> CompletableFutureUtil.supplyAsync(() -> counter.incrementAndGet()),
                () -> CompletableFutureUtil.supplyAsync(() -> counter.incrementAndGet()),
                () -> CompletableFutureUtil.supplyAsync(() -> counter.incrementAndGet())
            ))
        );
        
        assertEquals(Arrays.asList(1, 2, 3), results);
    }

    // ==================== 重试机制测试 ====================

    @Test
    void testRetryAsync() {
        // 重试机制
        AtomicInteger attempts = new AtomicInteger(0);
        
        CompletableFuture<String> future = CompletableFutureUtil.retryAsync(
            () -> {
                int attempt = attempts.incrementAndGet();
                if (attempt < 3) {
                    throw new RuntimeException("Attempt " + attempt + " failed");
                }
                return "Success on attempt " + attempt;
            },
            3,
            100
        );
        
        String result = CompletableFutureUtil.join(future);
        assertTrue(result.contains("Success"));
        assertEquals(3, attempts.get());
    }

    @Test
    void testRetryAsyncWithPredicate() {
        // 带条件的重试机制
        AtomicInteger attempts = new AtomicInteger(0);
        
        CompletableFuture<String> future = CompletableFutureUtil.retryAsync(
            () -> {
                int attempt = attempts.incrementAndGet();
                if (attempt == 1) {
                    throw new RuntimeException("Retryable error");
                } else if (attempt == 2) {
                    throw new IllegalStateException("Non-retryable error");
                }
                return "Should not reach here";
            },
            3,
            100,
            throwable -> throwable instanceof RuntimeException
        );
        
        assertThrows(BusinessException.class, () -> CompletableFutureUtil.join(future));
        assertEquals(2, attempts.get());
    }

    // ==================== 工具方法测试 ====================

    @Test
    void testGetResult() {
        // 获取结果（带超时）
        CompletableFuture<String> future = CompletableFutureUtil.supplyAsync(() -> "Result");
        String result = CompletableFutureUtil.getResult(future, 1, TimeUnit.SECONDS);
        assertEquals("Result", result);
        
        // 测试超时
        CompletableFuture<String> slowFuture = CompletableFutureUtil.supplyAsync(() -> {
            try {
                Thread.sleep(2000);
                return "Too slow";
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return null;
            }
        });
        
        assertThrows(BusinessException.class, 
            () -> CompletableFutureUtil.getResult(slowFuture, 500, TimeUnit.MILLISECONDS));
    }

    @Test
    void testMap() {
        // 转换结果类型
        CompletableFuture<Integer> future = CompletableFutureUtil.supplyAsync(() -> 10);
        CompletableFuture<String> mappedFuture = CompletableFutureUtil.map(
            future, 
            value -> "Result: " + value
        );
        
        assertEquals("Result: 10", CompletableFutureUtil.join(mappedFuture));
    }

    @Test
    void testFlatten() {
        // 扁平化嵌套的 Future
        CompletableFuture<CompletableFuture<String>> nestedFuture = 
            CompletableFutureUtil.supplyAsync(() -> 
                CompletableFutureUtil.supplyAsync(() -> "Nested Result")
            );
        
        CompletableFuture<String> flatFuture = CompletableFutureUtil.flatten(nestedFuture);
        assertEquals("Nested Result", CompletableFutureUtil.join(flatFuture));
    }

    @Test
    void testDelayedFuture() {
        // 延迟完成的 Future
        long startTime = System.currentTimeMillis();
        CompletableFuture<String> future = CompletableFutureUtil.delayedFuture(
            200, TimeUnit.MILLISECONDS, "Delayed Result"
        );
        
        assertEquals("Delayed Result", CompletableFutureUtil.join(future));
        long duration = System.currentTimeMillis() - startTime;
        assertTrue(duration >= 200);
    }

    @Test
    void testTimedAsync() {
        // 记录执行时间的异步任务
        CompletableFuture<String> future = CompletableFutureUtil.timedAsync(
            "TestTask",
            () -> {
                try {
                    Thread.sleep(100);
                    return "Task Result";
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    return null;
                }
            }
        );

        assertEquals("Task Result", CompletableFutureUtil.join(future));
    }

    // ==================== 实际应用场景示例 ====================

    @Test
    void testRealWorldScenario() {
        // 模拟一个实际场景：并行调用多个服务，组合结果
        
        // 模拟用户服务
        CompletableFuture<String> userFuture = CompletableFutureUtil.supplyAsync(() -> {
            // 模拟网络延迟
            try {
                Thread.sleep(100);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
            return "User: John";
        });
        
        // 模拟订单服务
        CompletableFuture<Integer> orderFuture = CompletableFutureUtil.supplyAsync(() -> {
            // 模拟网络延迟
            try {
                Thread.sleep(150);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
            return 3; // 订单数量
        });
        
        // 模拟积分服务
        CompletableFuture<Double> pointsFuture = CompletableFutureUtil.supplyAsync(() -> {
            // 模拟网络延迟
            try {
                Thread.sleep(80);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
            return 1500.0; // 积分
        });
        
        // 组合所有结果
        CompletableFuture<String> combinedFuture = CompletableFutureUtil.thenCombine(
            userFuture,
            CompletableFutureUtil.thenCombine(orderFuture, pointsFuture, 
                (orders, points) -> String.format("Orders: %d, Points: %.0f", orders, points)
            ),
            (user, orderInfo) -> String.format("%s - %s", user, orderInfo)
        );
        
        // 添加超时控制
        CompletableFuture<String> timeoutFuture = CompletableFutureUtil.withTimeoutDefault(
            combinedFuture, 500, TimeUnit.MILLISECONDS, "Service timeout"
        );
        
        String result = CompletableFutureUtil.join(timeoutFuture);
        assertTrue(result.contains("User: John"));
        assertTrue(result.contains("Orders: 3"));
        assertTrue(result.contains("Points: 1500"));
    }
}
