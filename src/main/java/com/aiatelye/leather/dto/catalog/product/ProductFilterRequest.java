package com.aiatelye.leather.dto.catalog.product;

import com.aiatelye.leather.dao.enums.Enums;
import lombok.Data;

@Data
public class ProductFilterRequest {

    private Enums.ProductCategory modelType;
    private String search;
    private int page = 0;
    private int size = 12;
}
