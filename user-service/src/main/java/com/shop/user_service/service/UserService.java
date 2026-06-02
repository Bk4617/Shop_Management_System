package com.shop.user_service.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.shop.user_service.entity.UserEntity;
import com.shop.user_service.repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    // Register User
    public UserEntity registerUser(UserEntity user) {

        // Prevent duplicate usernames
        if (userRepository.existsByName(user.getName())) {
            return null;
        }

        return userRepository.save(user);
    }

    // Login User
    public UserEntity login(String name, String password) {

        UserEntity user = userRepository.findFirstByName(name);

        if (user != null && user.getPassword().equals(password)) {
            return user;
        }

        return null;
    }

    // Change Password
    public boolean changePassword(String name, String newPassword) {
        UserEntity user = userRepository.findFirstByName(name);
        if (user != null) {
            user.setPassword(newPassword);
            userRepository.save(user);
            return true;
        }
        return false;
    }
}