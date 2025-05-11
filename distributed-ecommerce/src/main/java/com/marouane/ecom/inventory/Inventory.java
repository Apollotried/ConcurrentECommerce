package com.marouane.ecom.inventory;

import com.marouane.ecom.exception.InsufficientStockException;
import com.marouane.ecom.product.Product;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "inventories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false, unique = true)
    private Product product;

    @Column(nullable = false)
    private int totalQuantity;

    @Column(nullable = false)
    private int totalReserved;

    @Version
    private Long version;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;


    public int getAvailableQuantity() {
        return totalQuantity - totalReserved;
    }

    public void addStock(int quantity) {
        this.totalQuantity += quantity;
    }


    public void reserveStock(int quantity) {
        if (quantity > getAvailableQuantity()) {
            throw new InsufficientStockException(
                    "Available: " + getAvailableQuantity() +
                            ", Requested: " + quantity
            );
        }
        this.totalReserved += quantity;
    }

    public void releaseStock(int quantity) {
        this.totalReserved = Math.max(0, totalReserved - quantity);
    }

    public void fulfillReservedStock(int quantity) {
        if (totalReserved < quantity) {
            throw new IllegalStateException("Cannot deduct more than reserved");
        }
        this.totalQuantity -= quantity;
        this.totalReserved -= quantity;
    }






}
