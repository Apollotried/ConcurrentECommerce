package com.marouane.ecom.inventory;

import com.marouane.ecom.parser.CsvStockUpdateParserService;
import com.marouane.ecom.parser.StockUpdateRecord;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;
    private final CsvStockUpdateParserService csvParser;

    @PostMapping("/create/{productId}/{quantity}")
    public ResponseEntity<Inventory> createInventory(
            @PathVariable Long productId,
            @PathVariable int quantity) {
        Inventory inventory = inventoryService.createInventory(productId, quantity);
        return ResponseEntity.ok(inventory);
    }


    @GetMapping("/{productId}")
    public ResponseEntity<InventoryResponseDto> getInventory(@PathVariable Long productId) {
        InventoryResponseDto inventory = inventoryService.getInventory(productId);
        return ResponseEntity.ok(inventory);
    }


    @GetMapping("/{productId}/available")
    public ResponseEntity<Boolean> isAvailable(
            @PathVariable Long productId,
            @RequestParam int quantity) {
        boolean available = inventoryService.isAvailable(productId, quantity);
        return ResponseEntity.ok(available);
    }


    @PostMapping("/{productId}/reserve")
    public ResponseEntity<Void> reserveStock(
            @PathVariable Long productId,
            @RequestParam int quantity) {
        inventoryService.reserveStock(productId, quantity);
        return ResponseEntity.ok().build();
    }


    @PostMapping("/{productId}/release")
    public ResponseEntity<Void> releaseStock(
            @PathVariable Long productId,
            @RequestParam int quantity) {
        inventoryService.releaseReservation(productId, quantity);
        return ResponseEntity.ok().build();
    }


    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> uploadFile(
            @RequestPart("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty");
        }

        try {
            List<StockUpdateRecord> updates = csvParser.parse(file);
            try {
                inventoryService.bulkUpdateStock(updates);
                return ResponseEntity.ok().body(
                        String.format("Successfully processed %d records", updates.size())
                );
            } catch (RuntimeException e) {
                return ResponseEntity.internalServerError()
                        .body("Partial update completed with errors: " + e.getMessage());
            }
        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body("Failed to process file: " + e.getMessage());
        }
    }
}
