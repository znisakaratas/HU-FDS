package com.hudfs.hudfs28.repositories;

import com.hudfs.hudfs28.entities.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource
public interface CouponRepository extends JpaRepository<Coupon, Integer> {
    // Gerekirse özel sorgular burada tanımlanabilir
}