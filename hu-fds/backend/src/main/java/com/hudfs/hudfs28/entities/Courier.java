package com.hudfs.hudfs28.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "courier")
public class Courier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer courierId;

    private String name;
    private Float age;
    private String telephoneNumber;
    private Float level;
    private Float points;
    private String mail;
    private String password;

    // Constructorlar
    public Courier() {}

    public Courier(String name, Float age, String telephoneNumber, Float level, Float points, String mail, String password) {
        this.name = name;
        this.age = age;
        this.telephoneNumber = telephoneNumber;
        this.level = level;
        this.points = points;
        this.mail = mail;
        this.password = password;
    }

    // Getter ve Setterlar
    public Integer getCourierId() {
        return courierId;
    }

    public void setCourierId(Integer courierId) {
        this.courierId = courierId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Float getAge() {
        return age;
    }

    public void setAge(Float age) {
        this.age = age;
    }

    public String getTelephoneNumber() {
        return telephoneNumber;
    }

    public void setTelephoneNumber(String telephoneNumber) {
        this.telephoneNumber = telephoneNumber;
    }

    public Float getLevel() {
        return level;
    }

    public void setLevel(Float level) {
        this.level = level;
    }

    public Float getPoints() {
        return points;
    }

    public void setPoints(Float points) {
        this.points = points;
    }

    public String getMail() {
        return mail;
    }

    public void setMail(String mail) {
        this.mail = mail;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
