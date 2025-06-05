package com.casemanager.testplan;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

/**
 * 测试计划服务应用程序入口
 */
@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
public class TestPlanApplication {

    public static void main(String[] args) {
        SpringApplication.run(TestPlanApplication.class, args);
    }
}
