package com.borsibaar.controller;

import com.borsibaar.dto.UserSummaryResponseDto;
import com.borsibaar.entity.Role;
import com.borsibaar.entity.User;
import com.borsibaar.mapper.UserMapper;
import com.borsibaar.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false) // Disable security filters for simpler testing
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private UserMapper userMapper;

    @AfterEach
    void tearDown() {
        // Clear security context after each test
        SecurityContextHolder.clearContext();
    }

    @Test
    void testGetOrganizationUsers_AsAdmin_ReturnsUsers() throws Exception {
        // Arrange: Create admin role
        Role adminRole = Role.builder()
                .id(1L)
                .name("ADMIN")
                .build();

        // Arrange: Create admin user (current authenticated user)
        User adminUser = User.builder()
                .id(UUID.randomUUID())
                .email("admin@example.com")
                .name("Admin User")
                .organizationId(1L)
                .role(adminRole)
                .build();

        // Arrange: Setup security context with admin user
        setupSecurityContextWithUser(adminUser);

        // Arrange: Create two mock users in the same organization
        User user1 = User.builder()
                .id(UUID.randomUUID())
                .email("user1@example.com")
                .name("User One")
                .organizationId(1L)
                .role(adminRole)
                .build();

        User user2 = User.builder()
                .id(UUID.randomUUID())
                .email("user2@example.com")
                .name("User Two")
                .organizationId(1L)
                .role(adminRole)
                .build();

        List<User> organizationUsers = List.of(user1, user2);

        // Arrange: Mock repository to return users for organization
        when(userRepository.findByOrganizationId(1L)).thenReturn(organizationUsers);

        // Arrange: Mock mapper to convert users to DTOs
        UserSummaryResponseDto dto1 = new UserSummaryResponseDto(
                user1.getId(),
                user1.getEmail(),
                user1.getName(),
                "ADMIN");
        UserSummaryResponseDto dto2 = new UserSummaryResponseDto(
                user2.getId(),
                user2.getEmail(),
                user2.getName(),
                "ADMIN");

        when(userMapper.toSummaryDto(user1)).thenReturn(dto1);
        when(userMapper.toSummaryDto(user2)).thenReturn(dto2);

        // Act & Assert: Perform GET request and verify response
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].email").value("user1@example.com"))
                .andExpect(jsonPath("$[0].name").value("User One"))
                .andExpect(jsonPath("$[0].role").value("ADMIN"))
                .andExpect(jsonPath("$[1].email").value("user2@example.com"))
                .andExpect(jsonPath("$[1].name").value("User Two"))
                .andExpect(jsonPath("$[1].role").value("ADMIN"));

        // Assert: Verify repository was called with correct organizationId
        verify(userRepository).findByOrganizationId(1L);

        // Assert: Verify mapper was called for each user
        verify(userMapper).toSummaryDto(user1);
        verify(userMapper).toSummaryDto(user2);
    }

    /**
     * Helper method to setup SecurityContext with a mock authenticated user.
     * This simulates the authentication that would normally be set by
     * JwtAuthenticationFilter.
     *
     * @param user The user to set as authenticated principal
     */
    private void setupSecurityContextWithUser(User user) {
        Authentication auth = new UsernamePasswordAuthenticationToken(
                user,
                null,
                Collections.emptyList());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }
}
