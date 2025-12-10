package com.jejulog.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    // 1. 로컬 이미지 폴더를 URL로 매핑
    // "file:///C:/jeju-images/" 부분은 본인이 원하는 실제 폴더 경로로 바꾸세요.
    // 맥/리눅스라면 "file:///Users/내이름/jeju-images/" 형식이 됩니다.
    private final String uploadPath = "file:///C:/jeju-images/";

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/images/**") // 웹에서 접근할 URL 경로
                .addResourceLocations(uploadPath); // 실제 파일이 있는 로컬 경로
    }

    // 2. CORS 설정 (프론트엔드 접근 허용)
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("*") // 모든 주소 허용 (보안 필요시 프론트 주소로 변경)
                .allowedMethods("GET", "POST", "PUT", "DELETE");
    }
}