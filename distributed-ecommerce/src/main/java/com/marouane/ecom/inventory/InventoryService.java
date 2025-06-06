package com.marouane.ecom.inventory;

import com.marouane.ecom.common.PageResponse;
import com.marouane.ecom.exception.*;
import com.marouane.ecom.parser.StockUpdateRecord;
import com.marouane.ecom.product.Product;
import com.marouane.ecom.product.ProductRepository;
import com.marouane.ecom.product.ProductStatus;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
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



    @Transactional(readOnly = true)
    public PageResponse<InventoryResponseDto> getAllInventory(
            int page,
            int size,
            String sortBy,
            String sortDirection,
            String searchTerm,
            String stockLevel) {

        // Create Sort object
        Sort sort = Sort.by("createdAt").descending();
        if (sortBy != null && sortDirection != null) {
            sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        }

        Pageable pageable = PageRequest.of(page, size, sort);

        // Build specification for filtering
        Specification<Inventory> spec = Specification.where(null);

        // Search by product name or category
        if (searchTerm != null && !searchTerm.isEmpty()) {
            spec = spec.and((root, query, cb) ->
                    cb.or(
                            cb.like(cb.lower(root.get("product").get("name")), "%" + searchTerm.toLowerCase() + "%"),
                            cb.like(root.get("product").get("category"), "%" + searchTerm + "%")
                    )
            );
        }


        // Filter by stock level
        if (stockLevel != null && !stockLevel.equals("All")) {
            switch (stockLevel) {
                case "low":
                    spec = spec.and((root, query, cb) ->
                            cb.and(
                                    cb.gt(root.get("totalQuantity"), 0),
                                    cb.le(root.get("totalQuantity"), 4)
                            )
                    );
                    break;
                case "out":
                    spec = spec.and((root, query, cb) ->
                            cb.equal(root.get("totalQuantity"), 0)
                    );
                    break;
                case "normal":
                    spec = spec.and((root, query, cb) ->
                            cb.gt(root.get("totalQuantity"), 4)
                    );
                    break;
            }
        }

        Page<Inventory> inventoryPage = inventoryRepository.findAll(spec, pageable);

        List<InventoryResponseDto> responses = inventoryPage.getContent().stream()
                .map(inventoryMapper::toDto)
                .toList();

        return new PageResponse<>(
                responses,
                inventoryPage.getNumber(),
                inventoryPage.getSize(),
                (int) inventoryPage.getTotalElements(),
                inventoryPage.getTotalPages(),
                inventoryPage.isFirst(),
                inventoryPage.isLast()
        );
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

        if (update.getProductName() == null || update.getProductName().isBlank()) {
            throw new IllegalArgumentException("Product name is required for record: " + update.toString());
        }
        if (update.getQuantity() == null) {
            throw new IllegalArgumentException("Quantity is required");
        }


        Product product = productRepository.findByName(update.getProductName())
                .orElseGet(() -> {
                    Product newProduct = new Product();
                    newProduct.setName(update.getProductName());
                    newProduct.setCategory(update.getCategory());
                    newProduct.setDescription(update.getDescription());
                    newProduct.setStatus(update.getStatus() != null ?
                            update.getStatus() : ProductStatus.ACTIVE);
                    newProduct.setPrice(update.getPrice() != null ?
                            update.getPrice() : BigDecimal.ZERO);
                    return productRepository.save(newProduct);
                });


        Inventory inventory = inventoryRepository.findByProductIdWithLock(product.getId())
                .orElseGet(() -> {
                    Inventory newInventory = new Inventory();
                    newInventory.setProduct(product);
                    newInventory.setTotalQuantity(0);
                    return inventoryRepository.save(newInventory);
                });

        inventory.addStock(update.getQuantity());
        inventoryRepository.save(inventory);
    }




    @Transactional(readOnly = true)
    public List<Product> getProductsWithLowStock(int threshold) {
        return inventoryRepository.findByAvailableQuantityLessThan(threshold)
                .stream()
                .map(Inventory::getProduct)
                .filter(product -> product.getStatus() == ProductStatus.ACTIVE)
                .toList();
    }


    @Transactional(readOnly = true)
    public long countProductsWithLowStock(int threshold) {
        return inventoryRepository.countByAvailableQuantityLessThan(threshold);
    }


    public Integer getStockForProduct(Long productId) {
        return inventoryRepository.findByProductId(productId)
                .map(Inventory::getAvailableQuantity)
                .orElse(0);
    }



    @Transactional(readOnly = true)
    public long getTotalInventoryCount() {
        return inventoryRepository.count();
    }

    @Transactional(readOnly = true)
    public long getLowStockCount(int threshold) {
        return inventoryRepository.countByAvailableQuantityLessThan(threshold);
    }

    @Transactional(readOnly = true)
    public long getOutOfStockCount() {
        return inventoryRepository.countByAvailableQuantity(0);
    }

    @Transactional(readOnly = true)
    public long getInStockCount(int threshold) {
        return inventoryRepository.countByAvailableQuantityGreaterThanEqual(threshold);
    }

    @Transactional
    public InventoryResponseDto updateInventory(Long productId, int newQuantity) {
        Inventory inventory = inventoryRepository.findByProductIdWithLock(productId)
                .orElseThrow(() -> new InventoryNotFoundException("Inventory not found with product id " + productId));

        // Validate the new quantity
        if (newQuantity < 0) {
            throw new IllegalArgumentException("Quantity cannot be negative");
        }

        // Check if the new quantity is less than currently reserved stock
        if (newQuantity < inventory.getTotalReserved()) {
            throw new IllegalStateException("New quantity cannot be less than currently reserved stock");
        }

        inventory.setTotalQuantity(newQuantity);
        Inventory updatedInventory = inventoryRepository.save(inventory);
        return inventoryMapper.toDto(updatedInventory);
    }


    @Transactional
    public void deleteInventory(Long productId) {
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new InventoryNotFoundException("Inventory not found with product id " + productId));

        // Check if there are any active reservations
        if (hasActiveReservations(productId)) {
            throw new IllegalStateException("Cannot delete inventory with active reservations");
        }

        // Check if there's any reserved stock
        if (inventory.getTotalReserved() > 0) {
            throw new IllegalStateException("Cannot delete inventory with reserved stock");
        }

        inventoryRepository.delete(inventory);
    }

    @Transactional
    public void deleteByProductId(Long productId) {
        inventoryRepository.findByProductId(productId)
                .ifPresent(inventoryRepository::delete);
    }








}
