package com.marouane.ecom.parser;

import com.marouane.ecom.product.ProductStatus;
import com.opencsv.bean.CsvBindByName;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class StockUpdateRecord {

        @CsvBindByName(column = "product_name", required = true)
        private String productName;

        @CsvBindByName(column = "quantity", required = true)
        private Integer quantity;


        @CsvBindByName(column = "category")
        private String category;

        @CsvBindByName(column = "description")
        private String description;

        @CsvBindByName(column = "status")
        private ProductStatus status;

        @CsvBindByName(column = "price")
        private BigDecimal price;

}
