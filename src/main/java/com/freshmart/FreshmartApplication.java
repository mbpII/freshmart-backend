package com.freshmart;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class FreshmartApplication {

    public static void main(String[] args) {
        SpringApplication.run(FreshmartApplication.class, args);
    }
}
