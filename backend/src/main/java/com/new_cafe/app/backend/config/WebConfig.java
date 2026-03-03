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
        registry.addMapping("/**")
                .allowedOriginPatterns("*") // 로컬 + 배포 도메인(nginx가 Origin 전달). allowCredentials 사용 시 allowedOrigins("*") 불가하므로 pattern 사용
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
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
