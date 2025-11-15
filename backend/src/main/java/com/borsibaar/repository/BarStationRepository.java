package com.borsibaar.repository;

import com.borsibaar.entity.BarStation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BarStationRepository extends JpaRepository<BarStation, Long> {
    List<BarStation> findByOrganizationId(Long organizationId);
    
    Optional<BarStation> findByOrganizationIdAndId(Long organizationId, Long id);
    
    List<BarStation> findByOrganizationIdAndIsActiveTrue(Long organizationId);
}

