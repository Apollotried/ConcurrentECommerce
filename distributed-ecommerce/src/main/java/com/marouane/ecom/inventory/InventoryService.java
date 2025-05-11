package com.marouane.ecom.inventory;

import com.marouane.ecom.exception.*;
import com.marouane.ecom.product.Product;
import com.marouane.ecom.product.ProductRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;


@Service
@RequiredArgsConstructor
public class InventoryService {
    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;
    private final InventoryMapper inventoryMapper;
    private final InventoryReservationRepository reservationRepository;


    @Transactional
    public Inventory createInventory(Long productId, int quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Product not found with ID: " + productId));

        if (inventoryRepository.existsByProductId(productId)) {
            throw new IllegalStateException("Inventory already exists for product ID: " + productId);
        }

        Inventory inventory = Inventory.builder()
                .product(product)
                .totalQuantity(quantity)
                .totalReserved(0)
                .build();

        return inventoryRepository.save(inventory);
    }


   @Transactional
   public void reserveStock(Long productId, int quantity) {
       Inventory inventory = inventoryRepository.findByProductIdWithLock(productId)
               .orElseThrow(() -> new InventoryNotFoundException("Inventory not found with product id" + productId));

       inventory.reserveStock(quantity);
       inventoryRepository.save(inventory);
   }



    @Transactional
    public void releaseReservation(Long productId, int quantity) {
        Inventory inventory = inventoryRepository.findByProductIdWithLock(productId)
                .orElseThrow(() -> new InventoryNotFoundException("Inventory not found with product id" + productId));

        inventory.releaseStock(quantity);
        inventoryRepository.save(inventory);
    }

    @Transactional(readOnly = true)
    public InventoryResponseDto  getInventory(Long productId) {
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new InventoryNotFoundException("Inventory not found with product id " + productId));

        return inventoryMapper.toDto(inventory);
    }


    @Transactional(readOnly = true)
    public boolean isAvailable(Long productId, int quantity) {
        return inventoryRepository.findByProductId(productId)
                .map(Inventory::getAvailableQuantity)
                .orElse(0) >= quantity;
    }

    //anrj3 l hadi apres to fix some stuff
    @Transactional
    public UUID reserveForOrder(Map<Long, Integer> productQuantities, UUID orderId) {
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(30);

        productQuantities.forEach(
                (productId, quantity) -> {
                    Inventory inventory = inventoryRepository.findByProductIdWithLock(productId)
                            .orElseThrow(() -> new InventoryNotFoundException("Inventory not found"));

//                    if(inventory.getAvailableQuantity() < quantity) {
//                        throw new InsufficientStockException("Insufficient stock for product id" + productId);
//                    }
//                    inventory.reserveStock(quantity);

                    reserveStock(productId, quantity);

                    reservationRepository.save(
                            InventoryReservation.builder()
                                    .productId(productId)
                                    .quantity(quantity)
                                    .orderId(orderId)
                                    .expiresAt(expiresAt)
                                    .build()
                    );

                });
        return orderId;
    }


    @Transactional
    public void confirmReservation(UUID orderId){
        List<InventoryReservation> reservations =
                reservationRepository.findByOrderId(orderId);

        if(reservations.isEmpty()){
            throw new ReservationNotFoundException("Reservations not found with order id " + orderId);
        }

        reservations.forEach(reservation -> {
            Inventory inventory = inventoryRepository.findByProductIdWithLock(reservation.getProductId())
                    .orElseThrow(() -> new InventoryNotFoundException("Inventory not found with product id " + reservation.getProductId()));

            inventory.fulfillReservedStock(reservation.getQuantity());
        });

        reservationRepository.deleteAll(reservations);

    }

    @Scheduled(fixedRate = 60_000)
    @Transactional
    public void releaseExpiredReservations(){
        LocalDateTime now = LocalDateTime.now();
        List<InventoryReservation> expired = reservationRepository.findByExpiresAtBefore(now);

        for(InventoryReservation res : expired){
            Inventory inventory = inventoryRepository.findByProductIdWithLock(res.getProductId())
                    .orElseThrow(() -> new InventoryNotFoundException("Inventory not found with product id " + res.getProductId()));
            inventory.releaseStock(res.getQuantity());
            inventoryRepository.save(inventory);
        }

        reservationRepository.deleteAll(expired);
    }



}
