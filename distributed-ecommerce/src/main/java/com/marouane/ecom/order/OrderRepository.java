package com.marouane.ecom.order;

import com.marouane.ecom.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
    long countByUser(User user);

    List<Order> findByUser(User user);
}
