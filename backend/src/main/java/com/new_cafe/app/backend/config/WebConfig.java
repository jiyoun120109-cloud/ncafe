package com.new_cafe.app.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration // @Component
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // 모든 URL에 대해 CORS 허용
                .allowedOrigins("http://localhost:3011") // 모든 origin 허용
                .allowedMethods("GET", "POST", "PUT", "DELETE") // 허용된 HTTP 메소드
                .allowedHeaders("*") // 모든 header 허용
                .allowCredentials(true); // credentials 허용

    }
}
