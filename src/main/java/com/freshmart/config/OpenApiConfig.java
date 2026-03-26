package com.freshmart.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {
    
    @Bean
    public OpenAPI freshmartOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("FreshMart Inventory API")
                        .version("1.0.0")
                        .description("REST API for FreshMart grocery inventory management system")
                        .contact(new Contact()
                                .name("FreshMart Development Team")));
    }
}
