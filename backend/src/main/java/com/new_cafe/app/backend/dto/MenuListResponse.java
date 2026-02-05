package com.new_cafe.app.backend.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Builder;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MenuListResponse {
    private List<MenuResponse> menus;
    private int total;
}
