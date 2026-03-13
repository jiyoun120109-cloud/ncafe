package com.new_cafe.app.backend.order.adapter.out.jpa;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "order_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private OrderEntity order;

    @Column(name = "menu_id", nullable = false)
    private Long menuId;

    @Column(name = "menu_name")
    private String menuName;

    @Column(name = "quantity", nullable = false)
    @Builder.Default
    private Integer quantity = 1;

    @Column(name = "unit_price", nullable = false)
    @Builder.Default
    private Integer unitPrice = 0;

    @Column(name = "option_extra_price")
    @Builder.Default
    private Integer optionExtraPrice = 0;

    @Column(name = "options_display", length = 255)
    private String optionsDisplay;
}
