package com.shop.user_service.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

import com.shop.user_service.entity.UserEntity;
import com.shop.user_service.service.UserService;

@RestController
@RequestMapping("/api/users")
@CrossOrigin("*")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody UserEntity user) {
        UserEntity registered = userService.registerUser(user);
        if (registered == null) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Username already exists");
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(registered);
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody UserEntity user) {
        UserEntity authenticated = userService.login(user.getName(), user.getPassword());
        if (authenticated == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
        }
        return ResponseEntity.ok(authenticated);
    }

    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestParam String username, @RequestParam String newPassword) {
        boolean updated = userService.changePassword(username, newPassword);
        if (updated) {
            return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));
    }
}