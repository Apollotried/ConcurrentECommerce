package com.marouane.ecom.product;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;


    private String description;

    private String category;

    @Enumerated(EnumType.STRING)
    private ProductStatus status = ProductStatus.ACTIVE;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Version
    @JsonIgnore
    private int version;

    private BigDecimal price;






    //    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
//    @JsonManagedReference
//    private List<ProductVersion> versions;

//    @PrePersist
//    public void initializeVersion() {
//        if (this.versions == null) {
//            this.versions = new ArrayList<>();
//        }
//
//
//        if (this.versions.isEmpty()) {
//            ProductVersion initialVersion = ProductVersion.builder()
//                    .product(this)
//                    .price(BigDecimal.ZERO)
//                    .isCurrent(true)
//                    .build();
//            this.versions.add(initialVersion);
//        }
//    }

//    @Transient
//    public ProductVersion getCurrentVersion() {
//        return versions.stream()
//                .filter(ProductVersion::isCurrent)
//                .findFirst()
//                .orElse(null);
//    }

//    @JsonIgnore
//    public BigDecimal getPrice() {
//        ProductVersion current = getCurrentVersion();
//        return current != null ? current.getPrice() : null;
//    }
//
//
//
//    public void addVersion(ProductVersion newVersion) {
//        this.versions.forEach(v -> v.setCurrent(false));
//
//        newVersion.setCurrent(true);
//        newVersion.setProduct(this);
//        this.versions.add(newVersion);
//    }

    }



