package com.shop.product_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.shop.product_service.entity.SaleRecordEntity;
import java.util.List;

public interface SaleRecordRepository extends JpaRepository<SaleRecordEntity, Long> {
    
    // Retrieve sales records ordered by most recent first
    List<SaleRecordEntity> findAllByOrderBySaleDateDesc();
}
