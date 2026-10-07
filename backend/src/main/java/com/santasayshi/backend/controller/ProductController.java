package com.santasayshi.backend.controller;

import com.santasayshi.backend.entity.Product;
import com.santasayshi.backend.repository.ProductRepository;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    private final ProductRepository productRepository;

    public ProductController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    // Get all products
    @GetMapping
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // Get one product
    @GetMapping("/{id}")
    public Product getProduct(@PathVariable Long id) {
        return productRepository
                .findById(id)
                .orElseThrow(
                        () -> new RuntimeException("Product not found")
                );
    }

    // Create product
    @PostMapping
    public Product createProduct(@RequestBody Product product) {

        if (product.getLowStockThreshold() <= 0) {
            product.setLowStockThreshold(5);
        }

        if (product.getStockQuantity() < 0) {
            product.setStockQuantity(0);
        }

        return productRepository.save(product);
    }

    // Update product
    @PutMapping("/{id}")
    public Product updateProduct(
            @PathVariable Long id,
            @RequestBody Product updatedProduct
    ) {

        Product product =
                productRepository
                        .findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Product not found"
                                )
                        );

        product.setName(updatedProduct.getName());
        product.setCategory(updatedProduct.getCategory());
        product.setPrice(updatedProduct.getPrice());
        product.setImage(updatedProduct.getImage());
        product.setDescription(updatedProduct.getDescription());

        if (updatedProduct.getStockQuantity() < 0) {
            product.setStockQuantity(0);
        } else {
            product.setStockQuantity(
                    updatedProduct.getStockQuantity()
            );
        }

        if (updatedProduct.getLowStockThreshold() <= 0) {
            product.setLowStockThreshold(5);
        } else {
            product.setLowStockThreshold(
                    updatedProduct.getLowStockThreshold()
            );
        }

        return productRepository.save(product);
    }

    // Delete product
    @DeleteMapping("/{id}")
    public void deleteProduct(@PathVariable Long id) {
        productRepository.deleteById(id);
    }

    // Increase stock
    @PutMapping("/{id}/stock/add")
    public Product addStock(
            @PathVariable Long id,
            @RequestParam int quantity
    ) {

        Product product =
                productRepository
                        .findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Product not found"
                                )
                        );

        if (quantity <= 0) {
            throw new RuntimeException(
                    "Quantity must be greater than zero"
            );
        }

        product.setStockQuantity(
                product.getStockQuantity() + quantity
        );

        return productRepository.save(product);
    }

    // Reduce stock
    @PutMapping("/{id}/stock/remove")
    public Product removeStock(
            @PathVariable Long id,
            @RequestParam int quantity
    ) {

        Product product =
                productRepository
                        .findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Product not found"
                                )
                        );

        if (quantity <= 0) {
            throw new RuntimeException(
                    "Quantity must be greater than zero"
            );
        }

        if (quantity > product.getStockQuantity()) {
            throw new RuntimeException(
                    "Not enough stock available"
            );
        }

        product.setStockQuantity(
                product.getStockQuantity() - quantity
        );

        return productRepository.save(product);
    }
}