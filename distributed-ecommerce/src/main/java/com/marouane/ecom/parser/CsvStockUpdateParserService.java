package com.marouane.ecom.parser;

import com.opencsv.bean.CsvToBean;
import com.opencsv.bean.CsvToBeanBuilder;
import com.opencsv.bean.HeaderColumnNameMappingStrategy;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.util.List;

@Service
public class CsvStockUpdateParserService {


    public List<StockUpdateRecord> parse(MultipartFile file) throws IOException {
        try(Reader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            HeaderColumnNameMappingStrategy<StockUpdateRecord> strategy =
                    new HeaderColumnNameMappingStrategy<>();
            strategy.setType(StockUpdateRecord.class);
            CsvToBean<StockUpdateRecord> csvToBean =
                    new CsvToBeanBuilder<StockUpdateRecord>(reader)
                            .withMappingStrategy(strategy)
                            .withIgnoreEmptyLine(true)
                            .withIgnoreLeadingWhiteSpace(true)
                            .build();
            return csvToBean.parse();

        }


    }
}
