package com.aiops.auth.service;

import com.aiops.auth.entity.User;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserService {

    User save(User user);

    List<User> findAll();

    Optional<User> findById(UUID id);

    Optional<User> findByEmail(String email);

    void delete(UUID id);

}