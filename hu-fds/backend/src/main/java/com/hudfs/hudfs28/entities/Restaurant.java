package com.hudfs.hudfs28.entities;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "restaurants")
public class Restaurant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long restaurantId;

    private String name;
    private String owner;
    private String mail;
    private String password;
    private Integer overAllRating = 0;
    private String phoneNumber;

    // Constructors
    public Restaurant() {}

    public Restaurant(String name, String owner, String mail, String password) {
        this.name = name;
        this.owner = owner;
        this.mail = mail;
        this.password = password;
        this.overAllRating = 0;
    }

    @OneToMany(mappedBy = "restaurant", cascade = CascadeType.REMOVE)
    private List<Product> products;

    @OneToMany(mappedBy = "restaurant", cascade = CascadeType.REMOVE)
    private List<Menu> menus;

    @OneToMany(mappedBy = "restaurant", cascade = CascadeType.ALL)
    private List<Address> addresses;

    // Getters and Setters
    public Long getId() { return restaurantId; }
    public void setId(Long restaurantId) { this.restaurantId = restaurantId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getOwner() { return owner; }
    public void setOwner(String owner) { this.owner = owner; }

    public String getMail() { return mail; }
    public void setMail(String mail) { this.mail = mail; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Integer getOverAllRating() {return overAllRating; }  
    public void setOverAllRating(Integer overAllRating) { this.overAllRating = overAllRating; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public List<Address> getAddresses() {
        return addresses;
    }
    
    public void setAddresses(List<Address> addresses) {
        this.addresses = addresses;
    }

}