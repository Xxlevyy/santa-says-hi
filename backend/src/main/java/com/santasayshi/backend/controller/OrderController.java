package com.santasayshi.backend.controller;

import com.santasayshi.backend.entity.Order;
import com.santasayshi.backend.entity.OrderItem;
import com.santasayshi.backend.entity.Product;
import com.santasayshi.backend.repository.OrderRepository;
import com.santasayshi.backend.repository.OrderItemRepository;
import com.santasayshi.backend.repository.ProductRepository;

import jakarta.transaction.Transactional;

import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;

    public OrderController(
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            ProductRepository productRepository
    ) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productRepository = productRepository;
    }

    // ============================================
    // GET ALL ORDERS
    // ============================================

    @GetMapping
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    // ============================================
    // GET ONE ORDER
    // ============================================

    @GetMapping("/{id}")
    public Order getOrder(@PathVariable Long id) {

        return orderRepository
                .findById(id)
                .orElseThrow(
                        () -> new RuntimeException("Order not found")
                );
    }

    // ============================================
    // GET ORDER ITEMS
    // ============================================

    @GetMapping("/{id}/items")
    public List<OrderItem> getOrderItems(
            @PathVariable Long id
    ) {

        return orderItemRepository.findByOrderId(id);
    }

    // ============================================
    // CREATE ORDER
    // ============================================

    @PostMapping
    @Transactional
    public Order createOrder(@RequestBody Order order) {

        // --------------------------------------------
        // Basic validation
        // --------------------------------------------

        if (order.getCustomerName() == null ||
                order.getCustomerName().isBlank()) {

            throw new RuntimeException("Customer name is required");
        }

        if (order.getPhone() == null ||
                order.getPhone().isBlank()) {

            throw new RuntimeException("Phone number is required");
        }

        if (order.getLocation() == null ||
                order.getLocation().isBlank()) {

            throw new RuntimeException("Delivery location is required");
        }

        if (order.getItems() == null ||
                order.getItems().isEmpty()) {

            throw new RuntimeException("Order must contain at least one item");
        }

        // --------------------------------------------
        // Default order values
        // --------------------------------------------

        if (order.getStatus() == null ||
                order.getStatus().isBlank()) {

            order.setStatus("PENDING");
        }

        if (order.getOrderDate() == null) {
            order.setOrderDate(LocalDateTime.now());
        }

        // --------------------------------------------
        // Check stock BEFORE saving anything
        // --------------------------------------------

        for (OrderItem item : order.getItems()) {

            Product product = productRepository
                    .findById(item.getProductId())
                    .orElseThrow(
                            () -> new RuntimeException(
                                    "Product not found: " + item.getProductId()
                            )
                    );

            if (item.getQuantity() <= 0) {

                throw new RuntimeException(
                        "Invalid quantity for product: "
                                + product.getName()
                );
            }

            if (product.getStockQuantity() < item.getQuantity()) {

                throw new RuntimeException(
                        "Not enough stock for "
                                + product.getName()
                                + ". Available: "
                                + product.getStockQuantity()
                );
            }
        }

        // --------------------------------------------
        // Save the order
        // --------------------------------------------

        Order savedOrder = orderRepository.save(order);

        // --------------------------------------------
        // Save order items + deduct stock
        // --------------------------------------------

        for (OrderItem item : order.getItems()) {

            Product product = productRepository
                    .findById(item.getProductId())
                    .orElseThrow(
                            () -> new RuntimeException(
                                    "Product not found: "
                                            + item.getProductId()
                            )
                    );

            OrderItem orderItem =
                    new OrderItem(
                            product.getId(),
                            product.getName(),
                            product.getPrice(),
                            item.getQuantity(),
                            savedOrder.getId()
                    );

            orderItemRepository.save(orderItem);

            // Deduct stock automatically
            product.setStockQuantity(
                    product.getStockQuantity()
                            - item.getQuantity()
            );

            productRepository.save(product);
        }

        return savedOrder;
    }

    // ============================================
    // UPDATE ORDER STATUS
    // ============================================

    @PutMapping("/{id}/status")
    public Order updateOrderStatus(
            @PathVariable Long id,
            @RequestParam String status
    ) {

        Order order = orderRepository
                .findById(id)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Order not found"
                        )
                );

        String newStatus = status.toUpperCase();

        if (!newStatus.equals("PENDING") &&
                !newStatus.equals("PROCESSING") &&
                !newStatus.equals("SHIPPED") &&
                !newStatus.equals("DELIVERED") &&
                !newStatus.equals("CANCELLED")) {

            throw new RuntimeException(
                    "Invalid order status"
            );
        }

        order.setStatus(newStatus);

        return orderRepository.save(order);
    }
}