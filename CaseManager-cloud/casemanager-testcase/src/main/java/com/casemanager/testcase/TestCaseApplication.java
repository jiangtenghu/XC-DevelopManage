package com.casemanager.testcase;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

/**
 * 测试用例服务应用程序入口
 */
@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
public class TestCaseApplication {

    public static void main(String[] args) {
        SpringApplication.run(TestCaseApplication.class, args);
    }
}
