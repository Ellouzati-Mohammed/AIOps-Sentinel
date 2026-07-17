package com.aiops.auth.service.impl;

import com.aiops.auth.entity.Role;
import com.aiops.auth.repository.RoleRepository;
import com.aiops.auth.service.RoleService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;

    public RoleServiceImpl(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Override
    public Role save(Role role) {
        return roleRepository.save(role);
    }

    @Override
    public List<Role> findAll() {
        return roleRepository.findAll();
    }

    @Override
    public Optional<Role> findById(UUID id) {
        return roleRepository.findById(id);
    }

    @Override
    public Optional<Role> findByName(String name) {
        return roleRepository.findByName(name);
    }
}