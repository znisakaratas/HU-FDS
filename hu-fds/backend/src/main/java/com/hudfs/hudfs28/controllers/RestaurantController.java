package com.hudfs.hudfs28.controllers;

import com.hudfs.hudfs28.dtos.RestaurantRequest;
import com.hudfs.hudfs28.dtos.RestaurantResponse;
import com.hudfs.hudfs28.services.RestaurantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/restaurant")
public class RestaurantController {

    @Autowired
    private RestaurantService restaurantService;

    @PostMapping("/register")
    public RestaurantResponse register(@RequestBody RestaurantRequest request) {
        return restaurantService.register(request);
    }
}
