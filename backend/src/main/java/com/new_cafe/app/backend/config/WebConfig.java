package com.new_cafe.app.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration // @Component
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.upload.path:file:./upload/}")
    private String uploadPath;
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
        // /images/xxx → Next가 백엔드 /xxx 로 요청. bootRun=./upload, Docker=APP_UPLOAD_PATH로 file:/app/upload/
        String path = uploadPath.endsWith("/") ? uploadPath : uploadPath + "/";
        if (!path.startsWith("file:")) {
            path = "file:" + path;
        }
        registry.addResourceHandler("/**")
                .addResourceLocations(path)
                .resourceChain(true);
    }
}
