package com.aiatelye.leather.dto.admin.Securty;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class LoginRequestDto {
    @Email
    private String email;
    @Size(min = 8,max = 20)
    private String password;
}
