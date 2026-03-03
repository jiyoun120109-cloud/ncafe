package com.new_cafe.app.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration // @Component
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // 모든 URL에 대해 CORS 허용
                .allowedOrigins("http://localhost:3000", "http://localhost:3011") // 허용된 origin
                .allowedMethods("GET", "POST", "PUT", "DELETE") // 허용된 HTTP 메소드
                .allowedHeaders("*") // 모든 header 허용
                .allowCredentials(true); // credentials 허용
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // /images/xxx → Next가 백엔드 /xxx 로 요청. 루트 경로를 upload 디렉터리에서 서빙
        String uploadPath = "/app/upload/";
        registry.addResourceHandler("/**")
                .addResourceLocations("file:" + uploadPath)
                .resourceChain(true)
                .setOrder(Ordered.LOWEST_PRECEDENCE);
    }
}
