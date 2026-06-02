package com.shop.product_service.service;

import java.util.List;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.shop.product_service.entity.ProductEntity;
import com.shop.product_service.entity.SaleRecordEntity;
import com.shop.product_service.repository.ProductRepository;
import com.shop.product_service.repository.SaleRecordRepository;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private SaleRecordRepository saleRecordRepository;

    public ProductEntity addProduct(ProductEntity product) {
        return productRepository.save(product);
    }

    public List<ProductEntity> getAllProducts() {
        return productRepository.findAll();
    }

    public ProductEntity getProductById(Long id) {
        return productRepository.findById(id).orElse(null);
    }

    public ProductEntity updateProduct(Long id, ProductEntity updatedProduct) {

        ProductEntity product = productRepository.findById(id).orElse(null);

        if (product != null) {

            product.setName(updatedProduct.getName());
            product.setDescription(updatedProduct.getDescription());
            product.setCategory(updatedProduct.getCategory());
            product.setPrice(updatedProduct.getPrice());
            product.setQuantity(updatedProduct.getQuantity());

            return productRepository.save(product);
        }

        return null;
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    public ProductEntity sellProduct(Long id, Integer quantity) {

        ProductEntity product = productRepository.findById(id).orElse(null);

        if (product != null && product.getQuantity() >= quantity) {

            product.setQuantity(product.getQuantity() - quantity);

            ProductEntity savedProduct = productRepository.save(product);

            // Create and save sales record
            SaleRecordEntity saleRecord = new SaleRecordEntity();
            saleRecord.setProductId(product.getId());
            saleRecord.setProductName(product.getName());
            saleRecord.setQuantity(quantity);
            saleRecord.setTotalPrice(product.getPrice() * quantity);
            saleRecord.setSaleDate(LocalDateTime.now());
            saleRecordRepository.save(saleRecord);

            return savedProduct;
        }

        return null;
    }

    public List<SaleRecordEntity> getSalesRecords() {
        return saleRecordRepository.findAllByOrderBySaleDateDesc();
    }
}