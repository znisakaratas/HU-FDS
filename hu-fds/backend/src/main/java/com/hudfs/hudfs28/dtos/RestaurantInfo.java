package com.hudfs.hudfs28.dtos;

public class RestaurantInfo {
    private Long restaurantId;
    private String name;

    public RestaurantInfo() {}

    public RestaurantInfo(Long restaurantId, String name) {
        this.restaurantId = restaurantId;
        this.name = name;
    }

    // Getters and Setters
    public Long getRestaurantId() { return restaurantId; }
    public void setRestaurantId(Long restaurantId) { this.restaurantId = restaurantId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
