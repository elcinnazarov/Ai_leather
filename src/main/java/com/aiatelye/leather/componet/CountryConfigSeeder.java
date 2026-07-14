package com.aiatelye.leather.componet;

import com.aiatelye.leather.dao.DeliveryCountryConfig;
import com.aiatelye.leather.repository.DeliveryCountryConfigRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class CountryConfigSeeder implements CommandLineRunner {
    private final DeliveryCountryConfigRepository repository;

    @Override
    public void run(String... args) {
        log.info("Ölkələrin bazada olub-olmaması yoxlanılır...");

        // Frontend-dəki 82 ölkəlik tam siyahımız (Qısaldılmış versiyasını yazıram, layihədə hamısını əlavə edə bilərsən)
        Map<String, String> countries = new HashMap<>();

        // 1. Spesifik Ölkələr (Öz Enum-ları olanlar)
        countries.put("AZ", "Azerbaijan");
        countries.put("AU", "Australia");
        countries.put("CA", "Canada");
        countries.put("FR", "France");
        countries.put("DE", "Germany");
        countries.put("IT", "Italy");
        countries.put("JP", "Japan");
        countries.put("SA", "Saudi Arabia");
        countries.put("CH", "Switzerland");
        countries.put("AE", "United Arab Emirates");
        countries.put("GB", "United Kingdom");
        countries.put("US", "United States");

        // 2. Avropa Birliyi və Avrozona
        countries.put("AT", "Austria");
        countries.put("BE", "Belgium");
        countries.put("HR", "Croatia");
        countries.put("CY", "Cyprus");
        countries.put("CZ", "Czechia");
        countries.put("DK", "Denmark");
        countries.put("EE", "Estonia");
        countries.put("FI", "Finland");
        countries.put("GR", "Greece");
        countries.put("HU", "Hungary");
        countries.put("IE", "Ireland");
        countries.put("LV", "Latvia");
        countries.put("LT", "Lithuania");
        countries.put("LU", "Luxembourg");
        countries.put("MT", "Malta");
        countries.put("NL", "Netherlands");
        countries.put("NO", "Norway");
        countries.put("PL", "Poland");
        countries.put("PT", "Portugal");
        countries.put("RO", "Romania");
        countries.put("SK", "Slovakia");
        countries.put("SI", "Slovenia");
        countries.put("ES", "Spain");
        countries.put("SE", "Sweden");

        // 3. Amerika Qitəsi
        countries.put("AR", "Argentina");
        countries.put("BS", "Bahamas");
        countries.put("BR", "Brazil");
        countries.put("CL", "Chile");
        countries.put("CO", "Colombia");
        countries.put("CR", "Costa Rica");
        countries.put("DO", "Dominican Republic");
        countries.put("EC", "Ecuador");
        countries.put("MX", "Mexico");
        countries.put("PA", "Panama");
        countries.put("PE", "Peru");
        countries.put("PR", "Puerto Rico");
        countries.put("UY", "Uruguay");

        // 4. Asiya, Okeaniya və Körfəz

        countries.put("CN", "China");
        countries.put("HK", "Hong Kong");
        countries.put("IN", "India");
        countries.put("ID", "Indonesia");

        countries.put("KR", "South Korea");

        countries.put("MY", "Malaysia");
        countries.put("NZ", "New Zealand");

        countries.put("PH", "Philippines");

        countries.put("SG", "Singapore");
        countries.put("TW", "Taiwan");
        countries.put("TH", "Thailand");
        countries.put("VN", "Vietnam");

        // 5. Qafqaz, Avrasiya, Afrika və MDB
        countries.put("TR", "Turkey");
        countries.put("RU", "Russia");
        countries.put("GE", "Georgia");
        countries.put("KZ", "Kazakhstan");

        countries.put("ZA", "South Africa");
        countries.put("UZ", "Uzbekistan");

        // 6. Ərəb və Körfəz Ölkələri (Lüks seqment)
        countries.put("QA", "Qatar");
        countries.put("KW", "Kuwait");
        countries.put("BH", "Bahrain");
        countries.put("OM", "Oman");
        countries.put("IL", "Israel");
        countries.put("EG", "Egypt");
        countries.put("JO", "Jordan");
        countries.put("LB", "Lebanon");
        countries.put("MA", "Morocco");


        int addedCount = 0;

        // Dövr (Loop) qururuq: Hər bir ölkəni yoxlayır
        for (Map.Entry<String, String> entry : countries.entrySet()) {
            String code = entry.getKey();
            String name = entry.getValue();

            // Əgər bu ölkə bazada yoxdursa, yenisini yarat və əlavə et
            if (!repository.existsByCountryCode(code)) {
                DeliveryCountryConfig config = DeliveryCountryConfig.builder()
                        .countryCode(code)
                        .countryName(name)
                        .isActive(true) // DEFAULT OLARAQ HAMISI AKTİVDİR
                        .build();

                repository.save(config);
                addedCount++;
            }
        }

        if (addedCount > 0) {
            log.info("{} yeni çatdırılma ölkəsi bazaya avtomatik əlavə edildi!", addedCount);
        } else {
            log.info("Bütün çatdırılma ölkələri artıq bazada mövcuddur. Əlavə işləməyə ehtiyac yoxdur.");
        }
    }
}
