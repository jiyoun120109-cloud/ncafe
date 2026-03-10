package com.new_cafe.app.backend.cart.adapter.in.web.dto.res;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItemResponseDto {
    private Long id;
    private Long menuId;
    private String menuKorName;
    private Integer menuPrice;
    private Integer quantity;
    /** 옵션 표시 문자열 (예: ICED | 기본 원두 | 디카페인) */
    private String optionsDisplay;
    /** 옵션 추가 금액 (디카페인 등) */
    private Integer optionExtraPrice;
    /** 메뉴 대표 이미지 URL (파일명) */
    private String menuImageUrl;
    /** 온도 (HOT, ICED) - 옵션변경 시 사용 */
    private String temperature;
    /** 원두 옵션 - 옵션변경 시 사용 */
    private String beanOption;
    /** 디카페인 여부 */
    private Boolean decaf;
    /** 품절 여부 */
    private Boolean isSoldOut;
}
