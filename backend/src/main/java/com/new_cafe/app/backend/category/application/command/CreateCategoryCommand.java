package com.new_cafe.app.backend.category.application.command;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateCategoryCommand {
    private String name;
    private String icon;
    private String description;
}
