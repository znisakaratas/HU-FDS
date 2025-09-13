package com.hudfs.hudfs28.repositories;

import com.hudfs.hudfs28.entities.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource
public interface OrderRepository extends JpaRepository<Order, Integer> {
    // Gerekirse özel sorgular burada tanımlanabilir
}