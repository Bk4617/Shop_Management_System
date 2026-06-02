package com.shop.product_service.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.shop.product_service.entity.ProductEntity;
import com.shop.product_service.entity.SaleRecordEntity;
import com.shop.product_service.service.ProductService;

@RestController
@RequestMapping("/api/products")
@CrossOrigin("*")
public class ProductController {

    @Autowired
    private ProductService productService;

    @PostMapping
    public ResponseEntity<ProductEntity> addProduct(@RequestBody ProductEntity product) {
        ProductEntity created = productService.addProduct(product);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<ProductEntity>> getAllProducts() {
        List<ProductEntity> products = productService.getAllProducts();
        return ResponseEntity.ok(products);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id) {
        ProductEntity product = productService.getProductById(id);
        if (product == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Product not found");
        }
        return ResponseEntity.ok(product);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id,
            @RequestBody ProductEntity product) {
        ProductEntity updated = productService.updateProduct(id, product);
        if (updated == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Product not found");
        }
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        ProductEntity product = productService.getProductById(id);
        if (product == null) {
            return ResponseEntity.notFound().build();
        }
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/sell/{id}")
    public ResponseEntity<?> sellProduct(@PathVariable Long id,
            @RequestParam Integer quantity) {
        ProductEntity product = productService.getProductById(id);
        if (product == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Product not found");
        }
        if (product.getQuantity() < quantity) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Insufficient stock. Available quantity: " + product.getQuantity());
        }
        ProductEntity soldProduct = productService.sellProduct(id, quantity);
        return ResponseEntity.ok(soldProduct);
    }

    @GetMapping("/sales-records")
    public ResponseEntity<List<SaleRecordEntity>> getSalesRecords() {
        return ResponseEntity.ok(productService.getSalesRecords());
    }
}