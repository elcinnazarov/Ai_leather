package com.aiatelye.leather.dto.admin.product;


import com.aiatelye.leather.dao.enums.Enums;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class CreateProductModelRequest {
    @NotBlank(message = "Modelin adı boş ola bilməz")
    @Size(min = 3, max = 100, message = "Modelin adı 3 ilə 100 simvol arasında olmalıdır")
    private String modelName;

    @NotNull(message = "Model növü (Kateqoriya) mütləq seçilməlidir")
    private Enums.ProductCategory modelType; // (BAG, BELT, WALLET)

    // DİQQƏT: Bura @NotNull yox, @NotBlank olmalıdır!
    @NotBlank(message = "Təsvir (description) boş göndərilə bilməz")
    @Size(max = 2000, message = "Təsvir maksimum 2000 simvol ola bilər")
    private String description;

    // İstəyə bağlı sahədir, amma yenə də limit qoymaq məsləhətdir
    @Size(max = 100, message = "Ölçülər maksimum 100 simvol ola bilər")
    private String dimensions;
}
