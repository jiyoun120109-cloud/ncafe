package com.new_cafe.app.backend.cart.adapter.out.jpa;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cart_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItemEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", nullable = false)
    private CartEntity cart;

    @Column(name = "menu_id", nullable = false)
    private Long menuId;

    @Column(name = "menu_kor_name")
    private String menuKorName;

    @Column(name = "menu_price")
    private Integer menuPrice;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "option_temperature", length = 20)
    private String optionTemperature;

    @Column(name = "option_bean", length = 100)
    private String optionBean;

    @Column(name = "option_decaf")
    private Boolean optionDecaf;

    @Column(name = "option_extra_price")
    private Integer optionExtraPrice;

    @Column(name = "options_display", length = 255)
    private String optionsDisplay;
}
