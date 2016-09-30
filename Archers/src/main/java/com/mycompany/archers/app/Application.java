package com.mycompany.archers.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 *
 * @author Sokolov
 */
@SpringBootApplication
@EnableScheduling
@Configuration
@EnableAutoConfiguration
@ComponentScan(basePackages = "com.mycompany")
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

}
