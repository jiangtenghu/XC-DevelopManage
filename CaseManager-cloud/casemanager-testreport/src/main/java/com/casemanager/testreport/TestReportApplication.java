package com.casemanager.testreport;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

/**
 * 测试报告服务应用程序入口
 */
@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
public class TestReportApplication {

    public static void main(String[] args) {
        SpringApplication.run(TestReportApplication.class, args);
    }
}
