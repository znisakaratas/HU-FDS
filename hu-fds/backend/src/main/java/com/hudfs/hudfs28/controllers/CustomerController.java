package com.hudfs.hudfs28.controllers;

import com.hudfs.hudfs28.dtos.CustomerRequest;
import com.hudfs.hudfs28.dtos.CustomerResponse;
import com.hudfs.hudfs28.dtos.CustomerTaskView;
import com.hudfs.hudfs28.dtos.CustomerProfileUpdateRequest;
import com.hudfs.hudfs28.dtos.CustomerProfileUpdateResponse;
import com.hudfs.hudfs28.dtos.CustomerProfileView;
import com.hudfs.hudfs28.dtos.AddressRequest;
import com.hudfs.hudfs28.dtos.CreditCardRequest;
import com.hudfs.hudfs28.services.CustomerTaskService;
import com.hudfs.hudfs28.services.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer")
public class CustomerController {

    @Autowired
    private CustomerService customerService;

    @Autowired
    private CustomerTaskService customerTaskService;

    @PostMapping("/register")
    public CustomerResponse register(@RequestBody CustomerRequest request) {
        return customerService.register(request);
    }

    @GetMapping("/tasks")
    public List<CustomerTaskView> getMyTasks(@RequestHeader("Authorization") String token) {
        token = token.replace("Bearer ", "");
        return customerTaskService.getTasksForLoggedInCustomer(token);
    }

    @PutMapping("/{customerId}/profile/update-profile")
    public CustomerProfileUpdateResponse updateCustomerProfile(
        @RequestHeader("Authorization") String token,
        @PathVariable Long customerId,
        @RequestBody CustomerProfileUpdateRequest request) {

        token = token.replace("Bearer ", "");
        return customerService.updateProfile(token, customerId, request);
    }

    @PutMapping("/{customerId}/profile/add-address")
    public CustomerProfileUpdateResponse addAddress(
            @RequestHeader("Authorization") String token,
            @PathVariable Long customerId,
            @RequestBody AddressRequest request) {
        token = token.replace("Bearer ", "");
        return customerService.addAddress(token, customerId, request);
    }

    @PutMapping("/{customerId}/profile/add-card")
    public CustomerProfileUpdateResponse addCard(
            @RequestHeader("Authorization") String token,
            @PathVariable Long customerId,
            @RequestBody CreditCardRequest request) {
        token = token.replace("Bearer ", "");
        return customerService.addCreditCard(token, customerId, request);
    }

    @GetMapping("/{customerId}/profile")
    public CustomerProfileView getCustomerProfile(
            @RequestHeader("Authorization") String token,
            @PathVariable Long customerId) {

        token = token.replace("Bearer ", "");
        return customerService.viewProfile(token, customerId);
    }

    @DeleteMapping("/{customerId}/profile/delete-address/{addressId}")
    public CustomerProfileUpdateResponse deleteAddress(
            @RequestHeader("Authorization") String token,
            @PathVariable Long customerId,
            @PathVariable Long addressId) {
        token = token.replace("Bearer ", "");
        return customerService.deleteAddress(token, customerId, addressId);
    }

    @DeleteMapping("/{customerId}/profile/delete-card/{cardId}")
    public CustomerProfileUpdateResponse deleteCreditCard(
            @RequestHeader("Authorization") String token,
            @PathVariable Long customerId,
            @PathVariable Long cardId) {
        token = token.replace("Bearer ", "");
        return customerService.deleteCreditCard(token, customerId, cardId);
    }
}
