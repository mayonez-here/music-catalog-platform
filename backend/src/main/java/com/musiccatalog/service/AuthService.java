package com.musiccatalog.service;

import com.musiccatalog.dto.AuthDtos.AuthResponse;
import com.musiccatalog.dto.AuthDtos.LoginRequest;
import com.musiccatalog.dto.AuthDtos.RegisterRequest;
import com.musiccatalog.entity.User;
import com.musiccatalog.exception.BadCredentialsAppException;
import com.musiccatalog.exception.DuplicateResourceException;
import com.musiccatalog.repository.UserRepository;
import com.musiccatalog.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new DuplicateResourceException("Username '" + request.username() + "' is already taken");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new DuplicateResourceException("An account with this email already exists");
        }

        User user = User.builder()
                .username(request.username())
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .build();

        userRepository.save(user);

        String token = jwtService.generateToken(toUserDetails(user));
        return new AuthResponse(token, user.getUsername(), user.getEmail());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new BadCredentialsAppException("Invalid username or password"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsAppException("Invalid username or password");
        }

        String token = jwtService.generateToken(toUserDetails(user));
        return new AuthResponse(token, user.getUsername(), user.getEmail());
    }

    private org.springframework.security.core.userdetails.User toUserDetails(User user) {
        return new org.springframework.security.core.userdetails.User(
                user.getUsername(), user.getPasswordHash(), java.util.Collections.emptyList());
    }
}
