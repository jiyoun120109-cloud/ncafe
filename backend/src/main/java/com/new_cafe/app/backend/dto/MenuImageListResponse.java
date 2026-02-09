package com.new_cafe.app.backend.dto;

import lombok.Builder;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MenuImageListResponse {
    private List<MenuImageResponse> menuImages;
    private String altText;

}
