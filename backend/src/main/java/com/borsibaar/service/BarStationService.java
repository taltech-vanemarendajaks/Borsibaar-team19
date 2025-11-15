package com.borsibaar.service;

import com.borsibaar.dto.BarStationRequestDto;
import com.borsibaar.dto.BarStationResponseDto;
import com.borsibaar.entity.BarStation;
import com.borsibaar.entity.User;
import com.borsibaar.exception.BadRequestException;
import com.borsibaar.exception.DuplicateResourceException;
import com.borsibaar.exception.NotFoundException;
import com.borsibaar.mapper.BarStationMapper;
import com.borsibaar.repository.BarStationRepository;
import com.borsibaar.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BarStationService {

    private final BarStationRepository barStationRepository;
    private final UserRepository userRepository;
    private final BarStationMapper barStationMapper;

    @Transactional(readOnly = true)
    public List<BarStationResponseDto> getAllStations(Long organizationId) {
        List<BarStation> stations = barStationRepository.findByOrganizationId(organizationId);
        return barStationMapper.toResponseDtoList(stations);
    }

    @Transactional(readOnly = true)
    public BarStationResponseDto getStationById(Long organizationId, Long stationId) {
        BarStation station = barStationRepository.findByOrganizationIdAndId(organizationId, stationId)
                .orElseThrow(() -> new NotFoundException("Bar station not found"));
        return barStationMapper.toResponseDto(station);
    }

    @Transactional
    public BarStationResponseDto createStation(Long organizationId, BarStationRequestDto request) {
        // Check for duplicate name
        List<BarStation> existingStations = barStationRepository.findByOrganizationId(organizationId);
        boolean nameExists = existingStations.stream()
                .anyMatch(s -> s.getName().equalsIgnoreCase(request.name()));
        if (nameExists) {
            throw new DuplicateResourceException("A bar station with this name already exists");
        }

        BarStation station = BarStation.builder()
                .organizationId(organizationId)
                .name(request.name())
                .description(request.description())
                .isActive(request.isActive() != null ? request.isActive() : true)
                .build();

        // Assign users if provided
        if (request.userIds() != null && !request.userIds().isEmpty()) {
            Set<User> users = assignUsersToStation(organizationId, request.userIds(), station);
            station.setUsers(users);
        }

        BarStation savedStation = barStationRepository.save(station);
        return barStationMapper.toResponseDto(savedStation);
    }

    @Transactional
    public BarStationResponseDto updateStation(Long organizationId, Long stationId, BarStationRequestDto request) {
        BarStation station = barStationRepository.findByOrganizationIdAndId(organizationId, stationId)
                .orElseThrow(() -> new NotFoundException("Bar station not found"));

        // Check for duplicate name (excluding current station)
        List<BarStation> existingStations = barStationRepository.findByOrganizationId(organizationId);
        boolean nameExists = existingStations.stream()
                .anyMatch(s -> !s.getId().equals(stationId) && s.getName().equalsIgnoreCase(request.name()));
        if (nameExists) {
            throw new DuplicateResourceException("A bar station with this name already exists");
        }

        station.setName(request.name());
        station.setDescription(request.description());
        if (request.isActive() != null) {
            station.setIsActive(request.isActive());
        }

        // Update assigned users
        if (request.userIds() != null) {
            // Clear existing assignments
            station.getUsers().clear();

            if (!request.userIds().isEmpty()) {
                Set<User> users = assignUsersToStation(organizationId, request.userIds(), station);
                station.setUsers(users);
            }
        }

        BarStation updatedStation = barStationRepository.save(station);
        return barStationMapper.toResponseDto(updatedStation);
    }

    @Transactional
    public void deleteStation(Long organizationId, Long stationId) {
        BarStation station = barStationRepository.findByOrganizationIdAndId(organizationId, stationId)
                .orElseThrow(() -> new NotFoundException("Bar station not found"));
        barStationRepository.delete(station);
    }

    @Transactional(readOnly = true)
    public List<BarStationResponseDto> getUserStations(UUID userId, Long organizationId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (!user.getOrganizationId().equals(organizationId)) {
            throw new BadRequestException("User does not belong to this organization");
        }

        List<BarStation> userStations = user.getBarStations().stream().toList();
        return barStationMapper.toResponseDtoList(userStations);
    }

    private Set<User> assignUsersToStation(Long organizationId, List<UUID> userIds, BarStation station) {
        Set<User> users = new HashSet<>();
        for (UUID userId : userIds) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new NotFoundException("User not found: " + userId));

            if (!user.getOrganizationId().equals(organizationId)) {
                throw new BadRequestException("User " + userId + " does not belong to this organization");
            }

            users.add(user);
        }
        return users;
    }
}
