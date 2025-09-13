package com.hudfs.hudfs28.controllers;

import com.hudfs.hudfs28.dtos.CourierRequest;
import com.hudfs.hudfs28.dtos.CourierResponse;
import com.hudfs.hudfs28.services.CourierService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/courier")
public class CourierController {

    @Autowired
    private CourierService courierService;

    @PostMapping("/register")
    public CourierResponse register(@RequestBody CourierRequest request) {
        return courierService.register(request);
    }
}
