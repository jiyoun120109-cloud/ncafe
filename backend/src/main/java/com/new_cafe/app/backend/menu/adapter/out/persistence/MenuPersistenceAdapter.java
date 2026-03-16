package com.new_cafe.app.backend.menu.adapter.out.persistence;

import com.new_cafe.app.backend.menu.application.port.out.MenuRepositoryPort;
import com.new_cafe.app.backend.menu.model.Menu;
import com.new_cafe.app.backend.menu.adapter.out.jpa.MenuEntity;
import com.new_cafe.app.backend.menu.adapter.out.jpa.MenuJpaRepository;
import com.new_cafe.app.backend.category.model.Category;
import com.new_cafe.app.backend.category.adapter.out.jpa.CategoryEntity;

import org.springframework.stereotype.Repository;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Repository
public class MenuPersistenceAdapter implements MenuRepositoryPort {

    private final MenuJpaRepository menuJpaRepository;

    public MenuPersistenceAdapter(MenuJpaRepository menuJpaRepository) {
        this.menuJpaRepository = menuJpaRepository;
    }

    @Override
    public List<Menu> findAllByCategoryIdAndSearchQuery(Integer categoryId, String searchQuery, String sortBy) {
        List<MenuEntity> entities = menuJpaRepository.findAll();

        // categoryId null 또는 0이면 전체 조회 (0은 프론트 "전체" 선택 시 올 수 있음)
        boolean listAll = categoryId == null || categoryId.intValue() == 0;
        List<Menu> list = entities.stream()
            .filter(e -> listAll || e.getCategoryId() == null || e.getCategoryId().equals(categoryId.longValue()))
            .filter(e -> searchQuery == null || searchQuery.isBlank() ||
                (e.getKorName() != null && e.getKorName().contains(searchQuery)) ||
                (e.getEngName() != null && e.getEngName().contains(searchQuery)) ||
                (e.getDescription() != null && e.getDescription().contains(searchQuery)))
            .map(this::toDomain)
            .collect(Collectors.toList());

        // 선택한 기준으로만 정렬, 동일 값이면 이름순(한글명 오름차순)으로 2차 정렬
        Comparator<Menu> byNameAsc = Comparator.comparing(Menu::getKorName, Comparator.nullsLast(Comparator.naturalOrder()));
        if ("price_desc".equalsIgnoreCase(sortBy)) {
            list.sort(Comparator.comparing(Menu::getPrice, Comparator.nullsLast(Comparator.reverseOrder())).thenComparing(byNameAsc));
        } else if ("price_asc".equalsIgnoreCase(sortBy)) {
            list.sort(Comparator.comparing(Menu::getPrice, Comparator.nullsLast(Comparator.naturalOrder())).thenComparing(byNameAsc));
        } else if ("likes".equalsIgnoreCase(sortBy)) {
            list.sort(Comparator.comparing(Menu::getLikeCount, Comparator.nullsFirst(Comparator.naturalOrder())).reversed().thenComparing(byNameAsc));
        } else if ("views".equalsIgnoreCase(sortBy)) {
            list.sort(Comparator.comparing(Menu::getViewCount, Comparator.nullsFirst(Comparator.naturalOrder())).reversed().thenComparing(byNameAsc));
        } else if ("name".equalsIgnoreCase(sortBy) || "name_asc".equalsIgnoreCase(sortBy)) {
            list.sort(byNameAsc);
        } else {
            // 기본: 인기·뉴·추천 배지 있는 메뉴 우선, 그 다음 좋아요 많은 순, 동점이면 이름순
            Comparator<Menu> byBadgeScore = Comparator.comparing((Menu m) -> {
                int s = 0;
                if (Boolean.TRUE.equals(m.getIsPopular())) s += 4;
                if (Boolean.TRUE.equals(m.getIsNew())) s += 2;
                if (Boolean.TRUE.equals(m.getIsRecommended())) s += 1;
                return s;
            }, Comparator.reverseOrder());
            Comparator<Integer> byLikeCountDesc = Comparator.nullsFirst(Comparator.<Integer>naturalOrder()).reversed();
            list.sort(byBadgeScore
                .thenComparing(Menu::getLikeCount, byLikeCountDesc)
                .thenComparing(byNameAsc));
        }
        return list;
    }

    @Override
    public Menu findById(Long id) {
        return menuJpaRepository.findById(id)
            .map(this::toDomain)
            .orElse(null);
    }

    @Override
    public void incrementViewCount(Long menuId) {
        if (menuId != null) {
            menuJpaRepository.incrementViewCount(menuId);
        }
    }

    private Menu toDomain(MenuEntity e) {
        Category category = e.getCategory() != null ? categoryEntityToDomain(e.getCategory()) : null;
        Integer sortOrder = e.getSortOrder();
        return Menu.builder()
            .id(e.getId())
            .korName(e.getKorName())
            .engName(e.getEngName())
            .description(e.getDescription())
            .price(e.getPrice())
            .categoryId(e.getCategoryId())
            .category(category)
            .isAvailable(e.getIsAvailable())
            .productInfoJson(e.getProductInfoJson())
            .optionsJson(e.getOptionsJson())
            .isPopular(e.getIsPopular())
            .isNew(e.getIsNew())
            .isRecommended(e.getIsRecommended())
            .displayPriority(e.getDisplayPriority())
            .likeCount(e.getLikeCount())
            .viewCount(e.getViewCount())
            .sortOrder(sortOrder)
            .createdAt(e.getCreatedAt())
            .updatedAt(e.getUpdatedAt())
            .build();
    }

    private Category categoryEntityToDomain(CategoryEntity e) {
        return Category.builder()
            .id(e.getId())
            .name(e.getName())
            .build();
    }
}


