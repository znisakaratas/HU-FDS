package com.hudfs.hudfs28.services;

import com.hudfs.hudfs28.dtos.CourierRequest;
import com.hudfs.hudfs28.dtos.CourierResponse;
import com.hudfs.hudfs28.entities.Courier;
import com.hudfs.hudfs28.repositories.CourierRepository;
import com.hudfs.hudfs28.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CourierService {

    @Autowired
    private CourierRepository courierRepository;

    public CourierResponse register(CourierRequest request) {
        if (isNullOrEmpty(request.getName()) ||
            isNullOrEmpty(request.getMail()) ||
            isNullOrEmpty(request.getPassword()) ||
            isNullOrEmpty(request.getPasswordVerification())) {
            return new CourierResponse(false, null, null, "All the parts must be filled.");
        }

        if (!request.getPassword().equals(request.getPasswordVerification())) {
            return new CourierResponse(false, null, null, "Password and password verification do not match.");
        }

        if (!request.getMail().matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")) {
            return new CourierResponse(false, null, null, "Mail format is not correct.");
        }

        if (!request.getPassword().matches("^(?=.*[A-Z])(?=.*\\p{Punct}).{8,}$")) {
            return new CourierResponse(false, null, null, "Password format is not correct.");
        }

        if (courierRepository.existsByMail(request.getMail())) {
            return new CourierResponse(false, null, null, "Mail is already registered.");
        }

        Courier courier = new Courier();
        courier.setName(request.getName());
        courier.setMail(request.getMail());
        courier.setPassword(request.getPassword());

        courierRepository.save(courier);

        String token = JwtUtil.generateToken(courier.getMail());

        return new CourierResponse(true, token, courier.getCourierId(), "Courier registered successfully.");
    }

    private boolean isNullOrEmpty(String str) {
        return str == null || str.trim().isEmpty();
    }
}
