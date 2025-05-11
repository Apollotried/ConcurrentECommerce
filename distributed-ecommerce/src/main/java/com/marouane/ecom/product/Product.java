package com.marouane.ecom.product;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "products")
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

    @Lob
    private String description;

    private String category;

    @Enumerated(EnumType.STRING)
    private ProductStatus status = ProductStatus.ACTIVE;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<ProductVersion> versions;


    @Version
    private int version;



    @Transient
    public ProductVersion getCurrentVersion() {
        return versions.stream()
                .filter(ProductVersion::isCurrent)
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No active version found"));
    }


    public BigDecimal getPrice() {
        return getCurrentVersion().getPrice();
    }


    public void addVersion(ProductVersion newVersion) {
        this.versions.forEach(v -> v.setCurrent(false));

        newVersion.setCurrent(true);
        this.versions.add(newVersion);
    }

    }



