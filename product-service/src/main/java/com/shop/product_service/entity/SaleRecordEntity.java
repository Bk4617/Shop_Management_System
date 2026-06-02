package com.shop.product_service.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "sales_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SaleRecordEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long productId;

    private String productName;

    private Integer quantity;

    private Double totalPrice;

    private LocalDateTime saleDate;
}
