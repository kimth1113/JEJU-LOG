package com.jejulog.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry; // 이거 추가
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    // 1. 이미지 폴더 접근 허용 (아까 작성한 것)
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String rootPath = System.getProperty("user.dir");
        String uploadPath = "file:///" + rootPath + "/images/";

        registry.addResourceHandler("/images/**")
                .addResourceLocations(uploadPath);
    }

    // 2. ★ CORS 설정 추가 (여기부터 복사하세요) ★
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // 모든 API 경로에 대해
                .allowedOrigins("*") // 모든 출처(프론트엔드 주소) 허용 (보안상 좋진 않지만 프로젝트용으론 OK)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH") // 허용할 HTTP 메서드
                .allowedHeaders("*"); // 모든 헤더 허용
    }
}