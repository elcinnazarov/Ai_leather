package com.aiatelye.leather.dto.admin.Securty;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    @NotBlank(message = "Email ünvanı boş ola bilməz")
    @Email(message = "Düzgün email formatı daxil edin (məsələn: example@mail.com)")
    private String email;

    @NotBlank(message = "Şifrə boş ola bilməz")
    @Size(min = 8, max = 30, message = "Şifrə ən azı 8, ən çox 30 simvoldan ibarət olmalıdır")
    // 💡 TƏKMİLLƏŞDİRMƏ: Əgər "Şifrədə mütləq böyük hərf və rəqəm olsun" istəyirsənsə, aşağıdakı sətri də aça bilərsən:
    // @Pattern(regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}$", message = "Şifrədə ən azı bir böyük hərf, bir kiçik hərf və rəqəm olmalıdır")
    private String password;

    @NotBlank(message = "Ad boş ola bilməz")
    @Size(min = 2, max = 20, message = "Ad ən azı 2, ən çox 20 simvoldan ibarət olmalıdır")
    private String name;

}
