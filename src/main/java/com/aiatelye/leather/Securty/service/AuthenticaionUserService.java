package com.aiatelye.leather.Securty.service;

import com.aiatelye.leather.Securty.repository.AuthUserRepository;
import com.aiatelye.leather.dao.User;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

@Configuration
@RequiredArgsConstructor
public class AuthenticaionUserService implements UserDetailsService {
private final  AuthUserRepository authUserRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
         User authUserEntity = authUserRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(String.format("User %s not found with this Fincode",email)));


        return org.springframework.security.core.userdetails.User.builder()
                .username(authUserEntity.getEmail())
                .password(authUserEntity.getPassword())
                .authorities(authUserEntity.getRole().getGrantedAuthorities().stream().toList())
                .accountExpired(false)
                .accountLocked(false)
                .credentialsExpired(false)
                .disabled(false)
                .build();
    }


}
