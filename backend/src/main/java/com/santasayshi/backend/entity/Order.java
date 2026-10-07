package com.santasayshi.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String customerName;

    private String phone;

    private String location;

    private String paymentMethod;

    private double totalAmount;

    private String status;

    private LocalDateTime orderDate;

    @Transient
    @JsonProperty("items")
    private List<OrderItem> items = new ArrayList<>();


    // =========================================================
    // CONSTRUCTORS
    // =========================================================

    public Order() {
    }


    public Order(
            String customerName,
            String phone,
            String location,
            String paymentMethod,
            double totalAmount
    ) {

        this.customerName = customerName;
        this.phone = phone;
        this.location = location;
        this.paymentMethod = paymentMethod;
        this.totalAmount = totalAmount;

        this.status = "PENDING";

        this.orderDate =
                LocalDateTime.now();
    }


    // =========================================================
    // GETTERS AND SETTERS
    // =========================================================

    public Long getId() {

        return id;

    }


    public String getCustomerName() {

        return customerName;

    }


    public void setCustomerName(
            String customerName
    ) {

        this.customerName = customerName;

    }


    public String getPhone() {

        return phone;

    }


    public void setPhone(
            String phone
    ) {

        this.phone = phone;

    }


    public String getLocation() {

        return location;

    }


    public void setLocation(
            String location
    ) {

        this.location = location;

    }


    public String getPaymentMethod() {

        return paymentMethod;

    }


    public void setPaymentMethod(
            String paymentMethod
    ) {

        this.paymentMethod = paymentMethod;

    }


    public double getTotalAmount() {

        return totalAmount;

    }


    public void setTotalAmount(
            double totalAmount
    ) {

        this.totalAmount = totalAmount;

    }


    public String getStatus() {

        return status;

    }


    public void setStatus(
            String status
    ) {

        this.status = status;

    }


    public LocalDateTime getOrderDate() {

        return orderDate;

    }


    public void setOrderDate(
            LocalDateTime orderDate
    ) {

        this.orderDate = orderDate;

    }


    public List<OrderItem> getItems() {

        return items;

    }


    public void setItems(
            List<OrderItem> items
    ) {

        this.items = items;

    }

}