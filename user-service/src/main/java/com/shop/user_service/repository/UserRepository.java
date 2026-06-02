package com.shop.user_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shop.user_service.entity.UserEntity;

public interface UserRepository extends JpaRepository<UserEntity, Long> {

    UserEntity findFirstByName(String name);

    boolean existsByName(String name);

}