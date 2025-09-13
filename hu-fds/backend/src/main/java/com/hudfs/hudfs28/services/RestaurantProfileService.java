package com.hudfs.hudfs28.services;

import com.hudfs.hudfs28.dtos.AddressView;
import com.hudfs.hudfs28.dtos.RestaurantProfileData;
import com.hudfs.hudfs28.dtos.RestaurantProfileResponse;
import com.hudfs.hudfs28.dtos.RestaurantUpdateRequest;
import com.hudfs.hudfs28.entities.Restaurant;
import com.hudfs.hudfs28.repositories.RestaurantRepository;
import com.hudfs.hudfs28.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RestaurantProfileService {

    @Autowired
    private RestaurantRepository restaurantRepository;

    private boolean isNullOrEmpty(String str) {
        return str == null || str.trim().isEmpty();
    }

    public RestaurantProfileData getProfile(String token, Long restaurantId) {
        String mail = JwtUtil.validateTokenAndGetEmail(token);
        Restaurant restaurant = restaurantRepository.findByMail(mail);

        if (restaurant == null || !restaurant.getId().equals(restaurantId)) {
            return null; // Or throw Unauthorized exception
        }

        List<AddressView> addressViews = restaurant.getAddresses().stream().map(address -> {
            AddressView view = new AddressView();
            view.setAddressId(address.getAddressId());
            view.setCountry(address.getCountry());
            view.setCity(address.getCity());
            view.setState(address.getState());
            view.setStreet(address.getStreet());
            view.setApartmentNumber(address.getApartmentNumber());
            view.setFloor(address.getFloor());
            view.setFlatNumber(address.getFlatNumber());
            view.setPostalCode(address.getPostalCode());
            return view;
        }).collect(Collectors.toList());

        return new RestaurantProfileData(
                restaurant.getId(),
                restaurant.getName(),
                restaurant.getOwner(),
                restaurant.getMail(),
                restaurant.getPhoneNumber(),
                restaurant.getOverAllRating(),
                addressViews
        );
    }

    public RestaurantProfileResponse updateProfile(String token, Long restaurantId, RestaurantUpdateRequest request) {
        String mail = JwtUtil.validateTokenAndGetEmail(token);
        Restaurant restaurant = restaurantRepository.findByMail(mail);

        if (restaurant == null || !restaurant.getId().equals(restaurantId)) {
            return new RestaurantProfileResponse(false, "Unauthorized.");
        }

        boolean changed = false;

        if (!isNullOrEmpty(request.getName()) && !request.getName().equals(restaurant.getName())) {
            restaurant.setName(request.getName());
            changed = true;
        }

        if (!isNullOrEmpty(request.getPhoneNumber()) && !request.getPhoneNumber().equals(restaurant.getPhoneNumber())) {
            restaurant.setPhoneNumber(request.getPhoneNumber());
            changed = true;
        }

        if (!changed) {
            return new RestaurantProfileResponse(false, "There is no change.");
        }

        restaurantRepository.save(restaurant);
        return new RestaurantProfileResponse(true, "Changes updated.");
    }
}
