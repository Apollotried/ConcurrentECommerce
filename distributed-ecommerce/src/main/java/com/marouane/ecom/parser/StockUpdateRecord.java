package com.marouane.ecom.parser;

import com.opencsv.bean.CsvBindByName;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class StockUpdateRecord {

        @CsvBindByName(column = "product_id")
        private Long productId;

        @CsvBindByName(column = "quantity")
        private Integer quantity;



}
