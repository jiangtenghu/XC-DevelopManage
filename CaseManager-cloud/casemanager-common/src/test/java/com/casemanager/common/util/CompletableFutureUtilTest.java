package com.casemanager.common.util;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;

import java.util.Arrays;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.function.Supplier;

import static org.junit.jupiter.api.Assertions.*;

/**
 * CompletableFutureUtil 测试类
 * 演示 CompletableFuture 工具类的使用方法
 *
 * @author CaseManager
 * @since 1.0.0
 */
public class CompletableFutureUtilTest {

    @BeforeEach
    public void setUp() {
        System.out.println("\n========== 开始测试 ==========");
    }

    @AfterAll
    public static void tearDown() {
        CompletableFutureUtil.shutdown();
        System.out.println("\n========== 测试结束，线程池已关闭 ==========");
    }

    @Test
    @DisplayName("测试创建已完成的 CompletableFuture")
    public void testCompletedFuture() {
        CompletableFuture<String> future = CompletableFutureUtil.completedFuture("测试值");
        
        assertTrue(CompletableFutureUtil.isDone(future));
        assertEquals("测试值", CompletableFutureUtil.join(future));
        System.out.println("已完成的 Future 值: " + CompletableFutureUtil.join(future));
    }

    @Test
    @DisplayName("测试创建异常完成的 CompletableFuture")
    public void testFailedFuture() {
        RuntimeException exception = new RuntimeException("测试异常");
        CompletableFuture<String> future = CompletableFutureUtil.failedFuture(exception);
        
        assertTrue(CompletableFutureUtil.isCompletedExceptionally(future));
        assertThrows(RuntimeException.class, () -> CompletableFutureUtil.join(future));
        System.out.println("异常 Future 已创建");
    }

    @Test
    @DisplayName("测试异步执行任务")
    public void testSupplyAsync() throws ExecutionException, InterruptedException, TimeoutException {
        CompletableFuture<String> future = CompletableFutureUtil.supplyAsync(() -> {
            System.out.println("异步任务执行中，线程: " + Thread.currentThread().getName());
            return "异步结果";
        });

        String result = CompletableFutureUtil.get(future, 5, TimeUnit.SECONDS);
        assertEquals("异步结果", result);
        System.out.println("异步任务结果: " + result);
    }

    @Test
    @DisplayName("测试转换操作 - thenApply")
    public void testThenApply() {
        CompletableFuture<Integer> future = CompletableFutureUtil.supplyAsync(() -> 10);
        CompletableFuture<String> transformedFuture = CompletableFutureUtil.thenApply(
            future, 
            num -> "数字是: " + (num * 2)
        );

        assertEquals("数字是: 20", CompletableFutureUtil.join(transformedFuture));
        System.out.println("转换后的结果: " + CompletableFutureUtil.join(transformedFuture));
    }

    @Test
    @DisplayName("测试组合两个 CompletableFuture")
    public void testThenCombine() {
        CompletableFuture<String> future1 = CompletableFutureUtil.supplyAsync(() -> {
            sleep(100);
            return "Hello";
        });
        
        CompletableFuture<String> future2 = CompletableFutureUtil.supplyAsync(() -> {
            sleep(200);
            return "World";
        });

        CompletableFuture<String> combinedFuture = CompletableFutureUtil.thenCombine(
            future1, 
            future2, 
            (s1, s2) -> s1 + " " + s2 + "!"
        );

        assertEquals("Hello World!", CompletableFutureUtil.join(combinedFuture));
        System.out.println("组合结果: " + CompletableFutureUtil.join(combinedFuture));
    }

    @Test
    @DisplayName("测试异常处理 - exceptionally")
    public void testExceptionally() {
        CompletableFuture<Integer> future = CompletableFutureUtil.supplyAsync(() -> {
            if (true) {
                throw new RuntimeException("模拟异常");
            }
            return 42;
        });

        CompletableFuture<Integer> handledFuture = CompletableFutureUtil.exceptionally(
            future, 
            ex -> {
                System.out.println("捕获异常: " + ex.getMessage());
                return -1;
            }
        );

        assertEquals(-1, CompletableFutureUtil.join(handledFuture));
        System.out.println("异常处理后的结果: " + CompletableFutureUtil.join(handledFuture));
    }

    @Test
    @DisplayName("测试 handle 方法")
    public void testHandle() {
        CompletableFuture<String> future = CompletableFutureUtil.supplyAsync(() -> {
            if (Math.random() > 0.5) {
                throw new RuntimeException("随机异常");
            }
            return "成功";
        });

        CompletableFuture<String> handledFuture = CompletableFutureUtil.handle(
            future,
            (result, error) -> {
                if (error != null) {
                    return "处理异常: " + error.getMessage();
                }
                return "处理成功: " + result;
            }
        );

        String result = CompletableFutureUtil.join(handledFuture);
        assertTrue(result.contains("处理"));
        System.out.println("Handle 结果: " + result);
    }

    @Test
    @DisplayName("测试等待所有任务完成 - allOf")
    public void testAllOf() {
        CompletableFuture<String> future1 = CompletableFutureUtil.supplyAsync(() -> {
            sleep(100);
            System.out.println("任务1完成");
            return "结果1";
        });

        CompletableFuture<String> future2 = CompletableFutureUtil.supplyAsync(() -> {
            sleep(200);
            System.out.println("任务2完成");
            return "结果2";
        });

        CompletableFuture<String> future3 = CompletableFutureUtil.supplyAsync(() -> {
            sleep(150);
            System.out.println("任务3完成");
            return "结果3";
        });

        CompletableFuture<Void> allFuture = CompletableFutureUtil.allOf(future1, future2, future3);
        CompletableFutureUtil.join(allFuture);
        
        assertTrue(CompletableFutureUtil.isDone(future1));
        assertTrue(CompletableFutureUtil.isDone(future2));
        assertTrue(CompletableFutureUtil.isDone(future3));
        System.out.println("所有任务已完成");
    }

    @Test
    @DisplayName("测试收集所有结果 - allOfWithResults")
    public void testAllOfWithResults() {
        CompletableFuture<String> future1 = CompletableFutureUtil.supplyAsync(() -> "A");
        CompletableFuture<String> future2 = CompletableFutureUtil.supplyAsync(() -> "B");
        CompletableFuture<String> future3 = CompletableFutureUtil.supplyAsync(() -> "C");

        CompletableFuture<List<String>> allResults = CompletableFutureUtil.allOfWithResults(
            future1, future2, future3
        );

        List<String> results = CompletableFutureUtil.join(allResults);
        assertEquals(3, results.size());
        assertTrue(results.containsAll(Arrays.asList("A", "B", "C")));
        System.out.println("所有结果: " + results);
    }

    @Test
    @DisplayName("测试任意一个完成 - anyOf")
    public void testAnyOf() {
        CompletableFuture<String> future1 = CompletableFutureUtil.supplyAsync(() -> {
            sleep(300);
            return "慢任务";
        });

        CompletableFuture<String> future2 = CompletableFutureUtil.supplyAsync(() -> {
            sleep(100);
            return "快任务";
        });

        CompletableFuture<Object> anyFuture = CompletableFutureUtil.anyOf(future1, future2);
        Object result = CompletableFutureUtil.join(anyFuture);
        
        assertEquals("快任务", result);
        System.out.println("最先完成的任务结果: " + result);
    }

    @Test
    @DisplayName("测试链式调用 - thenCompose")
    public void testThenCompose() {
        CompletableFuture<Integer> future = CompletableFutureUtil.supplyAsync(() -> 10);
        
        CompletableFuture<String> composedFuture = CompletableFutureUtil.thenCompose(
            future,
            num -> CompletableFutureUtil.supplyAsync(() -> "结果是: " + (num * 2))
        );

        assertEquals("结果是: 20", CompletableFutureUtil.join(composedFuture));
        System.out.println("链式调用结果: " + CompletableFutureUtil.join(composedFuture));
    }

    @Test
    @DisplayName("测试超时控制")
    public void testTimeout() {
        CompletableFuture<String> future = CompletableFutureUtil.supplyAsync(() -> {
            sleep(2000);
            return "超时测试";
        });

        CompletableFuture<String> timeoutFuture = CompletableFutureUtil.withTimeout(
            future, 1, TimeUnit.SECONDS
        );

        assertThrows(ExecutionException.class, () -> {
            CompletableFutureUtil.get(timeoutFuture, 2, TimeUnit.SECONDS);
        });
        System.out.println("超时测试完成");
    }

    @Test
    @DisplayName("测试并行执行多个任务")
    public void testParallel() {
        List<Supplier<String>> tasks = Arrays.asList(
            () -> {
                sleep(100);
                return "任务1结果";
            },
            () -> {
                sleep(200);
                return "任务2结果";
            },
            () -> {
                sleep(150);
                return "任务3结果";
            }
        );

        long startTime = System.currentTimeMillis();
        CompletableFuture<List<String>> resultsFuture = CompletableFutureUtil.parallel(tasks);
        List<String> results = CompletableFutureUtil.join(resultsFuture);
        long endTime = System.currentTimeMillis();

        assertEquals(3, results.size());
        assertTrue(results.contains("任务1结果"));
        assertTrue(results.contains("任务2结果"));
        assertTrue(results.contains("任务3结果"));
        
        // 并行执行应该比串行快
        assertTrue((endTime - startTime) < 400);
        System.out.println("并行执行结果: " + results);
        System.out.println("执行时间: " + (endTime - startTime) + "ms");
    }

    @Test
    @DisplayName("测试重试机制")
    public void testRetry() {
        // 使用一个计数器来模拟前几次失败，最后一次成功
        final int[] attemptCount = {0};
        
        Supplier<String> unreliableTask = () -> {
            attemptCount[0]++;
            System.out.println("尝试次数: " + attemptCount[0]);
            
            if (attemptCount[0] < 3) {
                throw new RuntimeException("第 " + attemptCount[0] + " 次失败");
            }
            return "最终成功!";
        };

        CompletableFuture<String> retryFuture = CompletableFutureUtil.retry(
            unreliableTask, 3, 100, TimeUnit.MILLISECONDS
        );

        String result = CompletableFutureUtil.join(retryFuture);
        assertEquals("最终成功!", result);
        assertEquals(3, attemptCount[0]);
        System.out.println("重试结果: " + result);
    }

    @Test
    @DisplayName("测试 whenComplete")
    public void testWhenComplete() {
        CompletableFuture<String> future = CompletableFutureUtil.supplyAsync(() -> "测试值");
        
        CompletableFuture<String> completedFuture = CompletableFutureUtil.whenComplete(
            future,
            (result, error) -> {
                if (error != null) {
                    System.out.println("发生错误: " + error.getMessage());
                } else {
                    System.out.println("正常完成，结果: " + result);
                }
            }
        );

        assertEquals("测试值", CompletableFutureUtil.join(completedFuture));
    }

    @Test
    @DisplayName("测试取消任务")
    public void testCancel() {
        CompletableFuture<String> future = CompletableFutureUtil.supplyAsync(() -> {
            sleep(5000);
            return "不会完成的任务";
        });

        boolean cancelled = CompletableFutureUtil.cancel(future, true);
        assertTrue(cancelled || CompletableFutureUtil.isDone(future));
        System.out.println("任务取消状态: " + cancelled);
    }

    // 辅助方法：休眠
    private void sleep(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
