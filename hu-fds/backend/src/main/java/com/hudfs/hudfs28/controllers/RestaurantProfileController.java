package com.hudfs.hudfs28.controllers;

import com.hudfs.hudfs28.dtos.RestaurantProfileData;
import com.hudfs.hudfs28.dtos.RestaurantProfileResponse;
import com.hudfs.hudfs28.dtos.RestaurantUpdateRequest;
import com.hudfs.hudfs28.services.RestaurantProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/restaurant")
public class RestaurantProfileController {

    @Autowired
    private RestaurantProfileService restaurantProfileService;

    @GetMapping("/{restaurantId}/profile")
    public RestaurantProfileData getProfile(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long restaurantId) {
        String token = authHeader.replace("Bearer ", "");
        return restaurantProfileService.getProfile(token, restaurantId);
    }

    @PutMapping("/{restaurantId}/profile/update")
    public RestaurantProfileResponse updateProfile(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long restaurantId,
            @RequestBody RestaurantUpdateRequest request) {
        String token = authHeader.replace("Bearer ", "");
        return restaurantProfileService.updateProfile(token, restaurantId, request);
    }
}
