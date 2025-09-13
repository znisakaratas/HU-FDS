package com.hudfs.hudfs28.services;

import com.hudfs.hudfs28.dtos.RestaurantRequest;
import com.hudfs.hudfs28.dtos.RestaurantResponse;
import com.hudfs.hudfs28.entities.Restaurant;
import com.hudfs.hudfs28.repositories.RestaurantRepository;
import com.hudfs.hudfs28.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RestaurantService {

    @Autowired
    private RestaurantRepository restaurantRepository;

    public RestaurantResponse register(RestaurantRequest request) {
        if (isNullOrEmpty(request.getName()) ||
            isNullOrEmpty(request.getOwner()) ||
            isNullOrEmpty(request.getMail()) ||
            isNullOrEmpty(request.getPassword()) ||
            isNullOrEmpty(request.getPasswordVerification())) {
            return new RestaurantResponse(false, null, null, "All the parts must be filled.");
        }

        if (!request.getPassword().equals(request.getPasswordVerification())) {
            return new RestaurantResponse(false, null, null, "Password and password verification do not match.");
        }

        if (!request.getMail().matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")) {
            return new RestaurantResponse(false, null, null, "Mail format is not correct");
        }

        if (!request.getPassword().matches("^(?=.*[A-Z])(?=.*\\p{Punct}).{8,}$")) {
            return new RestaurantResponse(false, null, null, "Password format is not correct.");
        }

        if (restaurantRepository.existsByMail(request.getMail())) {
            return new RestaurantResponse(false, null, null, "Mail is already registered.");
        }

        Restaurant restaurant = new Restaurant(
            request.getName(),
            request.getOwner(),
            request.getMail(),
            request.getPassword()
        );

        restaurantRepository.save(restaurant);

        // 👇 Generate JWT token after registration
        String token = JwtUtil.generateToken(restaurant.getMail());

        return new RestaurantResponse(true, token, restaurant.getId(), "Restaurant is registered.");
    }

    private boolean isNullOrEmpty(String str) {
        return str == null || str.trim().isEmpty();
    }
}
