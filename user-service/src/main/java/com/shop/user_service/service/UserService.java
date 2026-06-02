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

    // Update Profile (Username, Contact, Password)
    public UserEntity updateProfile(String currentUsername, UserEntity updatedUser) {
        UserEntity existing = userRepository.findFirstByName(currentUsername);
        if (existing == null) {
            return null;
        }

        // If username is changing, verify it is not already taken
        if (!existing.getName().equalsIgnoreCase(updatedUser.getName())) {
            if (userRepository.existsByName(updatedUser.getName())) {
                return null;
            }
        }

        existing.setName(updatedUser.getName());
        existing.setContact(updatedUser.getContact());
        if (updatedUser.getPassword() != null && !updatedUser.getPassword().trim().isEmpty()) {
            existing.setPassword(updatedUser.getPassword());
        }

        return userRepository.save(existing);
    }
}