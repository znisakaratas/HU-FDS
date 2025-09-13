package com.hudfs.hudfs28.dtos;

import java.util.List;

public class RestaurantProfileData {
    private Long id;
    private String name;
    private String owner;
    private String mail;
    private String phoneNumber;
    private Integer overAllRating;
    private List<AddressView> addresses;

    public RestaurantProfileData(Long id, String name, String owner, String mail, String phoneNumber, Integer overAllRating, List<AddressView> addresses) {
        this.id = id;
        this.name = name;
        this.owner = owner;
        this.mail = mail;
        this.phoneNumber = phoneNumber;
        this.overAllRating = overAllRating;
        this.addresses = addresses;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getOwner() { return owner; }
    public String getMail() { return mail; }
    public String getPhoneNumber() { return phoneNumber; }
    public Integer getOverAllRating() { return overAllRating; }
    public List<AddressView> getAddresses() { return addresses; }
}

