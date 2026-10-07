package com.santasayshi.backend.repository;

import com.santasayshi.backend.entity.Product;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository
        extends JpaRepository<Product, Long> {

}