package com.smartcampus.config;

import org.springframework.context.annotation.Configuration;

@Configuration
public class MongoConfig {
    // MongoDB auditing enabled via @EnableMongoAuditing on SmartCampusApplication
    // @CreatedDate and @LastModifiedDate will work on all @Document classes
}
