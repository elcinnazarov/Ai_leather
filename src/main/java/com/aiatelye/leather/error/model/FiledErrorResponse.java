package com.aiatelye.leather.error.model;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FiledErrorResponse {
    private String message;
    private List<FieldValidationError> fields;
}


