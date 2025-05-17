package com.marouane.ecom.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.Executor;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

@Configuration
public class AsyncConfig {

    @Bean
    public Executor bulkUpdateExecutor() {
        return new ThreadPoolExecutor(
                10,
                20,
                30, TimeUnit.SECONDS,
                new LinkedBlockingQueue<>(500),
                new ThreadPoolExecutor.CallerRunsPolicy()
        );
    }
}
