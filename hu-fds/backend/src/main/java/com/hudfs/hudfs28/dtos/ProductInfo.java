package com.hudfs.hudfs28.dtos;

public class ProductInfo {
    private Long productId;
    private String name;
    private String category;
    private Float price;
    private Float calories;

    public ProductInfo() {}

    public ProductInfo(Long productId, String name, String category, Float price, Float calories) {
        this.productId = productId;
        this.name = name;
        this.category = category;
        this.price = price;
        this.calories = calories;
    }

    // Getters and Setters
    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Float getPrice() {
        return price;
    }

    public void setPrice(Float price) {
        this.price = price;
    }

    public Float getCalories() {
        return calories;
    }

    public void setCalories(Float calories) {
        this.calories = calories;
    }
}
