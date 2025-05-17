package com.marouane.ecom.inventory;

import com.marouane.ecom.exception.*;
import com.marouane.ecom.parser.StockUpdateRecord;
import com.marouane.ecom.product.Product;
import com.marouane.ecom.product.ProductRepository;
import com.opencsv.bean.CsvToBean;
import com.opencsv.bean.CsvToBeanBuilder;
import com.opencsv.bean.HeaderColumnNameMappingStrategy;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;


@Service
@RequiredArgsConstructor
public class InventoryService {
    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;
    private final InventoryMapper inventoryMapper;
    private final InventoryReservationRepository reservationRepository;
    private final PlatformTransactionManager transactionManager;
    private final ExecutorService bulkUpdateExecutor =
            Executors.newFixedThreadPool(4);


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


    public boolean hasActiveReservations(Long productId) {
        return reservationRepository.existsByProductIdAndExpiresAtAfter(
                productId,
                LocalDateTime.now()
        );
    }

    public void releaseAllReservationsForOrder(UUID orderId){
        List<InventoryReservation> reservations = reservationRepository.findByOrderId(orderId);

        reservations.forEach(reservation -> {
            Inventory inventory = inventoryRepository.findByProductIdWithLock(
                    reservation.getProductId()
            ).orElseThrow(() -> new InventoryNotFoundException("Inventory not found"));

            inventory.releaseStock(reservation.getQuantity());
            inventoryRepository.save(inventory);
        });

        reservationRepository.deleteAll(reservations);

    }


    public void bulkUpdateStock(List<StockUpdateRecord> updates){
        List<CompletableFuture<Void>> futures = updates.stream()
                .map(update -> CompletableFuture.runAsync(
                        () -> {
                            TransactionTemplate transactionTemplate =
                                    new TransactionTemplate(transactionManager);
                            transactionTemplate.execute(status -> {
                                try {
                                    updateSingleProduct(update);
                                    return null;
                                } catch (Exception e) {
                                    status.setRollbackOnly();
                                    throw new CompletionException(e);
                                }
                            });
                        },
                        bulkUpdateExecutor
                ))
                .toList();

        try {
            CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
        } catch (CompletionException e) {
            throw new RuntimeException("Some updates failed: " + e.getCause().getMessage());
        }
    }


    protected void updateSingleProduct(StockUpdateRecord update){
        Inventory inventory = inventoryRepository.findByProductIdWithLock(update.getProductId())
                .orElseThrow(() -> new InventoryNotFoundException("Inventory not found with product id " + update.getProductId()));

        inventory.addStock(update.getQuantity());
        inventoryRepository.save(inventory);
    }


}
