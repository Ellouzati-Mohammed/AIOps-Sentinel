package com.aiops.auth.service;

import com.aiops.auth.entity.Role;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RoleService {

    Role save(Role role);

    List<Role> findAll();

    Optional<Role> findById(UUID id);

    Optional<Role> findByName(String name);

}