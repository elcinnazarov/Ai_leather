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
        countries.put("AL", "Albania");
        countries.put("AD", "Andorra");
        countries.put("AT", "Austria");
        countries.put("BY", "Belarus");
        countries.put("BE", "Belgium");
        countries.put("BA", "Bosnia and Herzegovina");
        countries.put("BG", "Bulgaria");
        countries.put("HR", "Croatia");
        countries.put("CY", "Cyprus");
        countries.put("CZ", "Czechia");
        countries.put("DK", "Denmark");
        countries.put("EE", "Estonia");
        countries.put("FI", "Finland");
        countries.put("GR", "Greece");
        countries.put("HU", "Hungary");
        countries.put("IS", "Iceland");
        countries.put("IE", "Ireland");
        countries.put("LV", "Latvia");
        countries.put("LI", "Liechtenstein");
        countries.put("LT", "Lithuania");
        countries.put("LU", "Luxembourg");
        countries.put("MT", "Malta");
        countries.put("MD", "Moldova");
        countries.put("MC", "Monaco");
        countries.put("ME", "Montenegro");
        countries.put("NL", "Netherlands");
        countries.put("MK", "North Macedonia");
        countries.put("NO", "Norway");
        countries.put("PL", "Poland");
        countries.put("PT", "Portugal");
        countries.put("RO", "Romania");
        countries.put("SM", "San Marino");
        countries.put("RS", "Serbia");
        countries.put("SK", "Slovakia");
        countries.put("SI", "Slovenia");
        countries.put("ES", "Spain");
        countries.put("SE", "Sweden");
        countries.put("UA", "Ukraine");
        countries.put("VA", "Vatican City");

        // 3. Şimali Amerika
        countries.put("BZ", "Belize");
        countries.put("CR", "Costa Rica");
        countries.put("SV", "El Salvador");
        countries.put("GT", "Guatemala");
        countries.put("HN", "Honduras");
        countries.put("MX", "Mexico");
        countries.put("NI", "Nicaragua");
        countries.put("PA", "Panama");

        // 4. Cənubi Amerika
        countries.put("AR", "Argentina");
        countries.put("BO", "Bolivia");
        countries.put("BR", "Brazil");
        countries.put("CL", "Chile");
        countries.put("CO", "Colombia");
        countries.put("EC", "Ecuador");
        countries.put("GY", "Guyana");
        countries.put("PY", "Paraguay");
        countries.put("PE", "Peru");
        countries.put("SR", "Suriname");
        countries.put("UY", "Uruguay");
        countries.put("VE", "Venezuela");

        // 5. Karib
        countries.put("AG", "Antigua and Barbuda");
        countries.put("BS", "Bahamas");
        countries.put("BB", "Barbados");
        countries.put("CU", "Cuba");
        countries.put("DM", "Dominica");
        countries.put("DO", "Dominican Republic");
        countries.put("GD", "Grenada");
        countries.put("HT", "Haiti");
        countries.put("JM", "Jamaica");
        countries.put("KN", "Saint Kitts and Nevis");
        countries.put("LC", "Saint Lucia");
        countries.put("VC", "Saint Vincent and the Grenadines");
        countries.put("TT", "Trinidad and Tobago");

        // 6. Asiya
        countries.put("AF", "Afghanistan");
        countries.put("BD", "Bangladesh");
        countries.put("BT", "Bhutan");
        countries.put("BN", "Brunei");
        countries.put("KH", "Cambodia");
        countries.put("CN", "China");
        countries.put("IN", "India");
        countries.put("ID", "Indonesia");
        countries.put("KZ", "Kazakhstan");
        countries.put("KG", "Kyrgyzstan");
        countries.put("LA", "Laos");
        countries.put("MY", "Malaysia");
        countries.put("MV", "Maldives");
        countries.put("MN", "Mongolia");
        countries.put("MM", "Myanmar");
        countries.put("NP", "Nepal");
        countries.put("KP", "North Korea");
        countries.put("PK", "Pakistan");
        countries.put("PH", "Philippines");
        countries.put("SG", "Singapore");
        countries.put("KR", "South Korea");
        countries.put("LK", "Sri Lanka");
        countries.put("TJ", "Tajikistan");
        countries.put("TH", "Thailand");
        countries.put("TL", "Timor-Leste");
        countries.put("TM", "Turkmenistan");
        countries.put("UZ", "Uzbekistan");
        countries.put("VN", "Vietnam");

        // 7. Yaxın Şərq
        countries.put("BH", "Bahrain");
        countries.put("EG", "Egypt");
        countries.put("IR", "Iran");
        countries.put("IQ", "Iraq");
        countries.put("IL", "Israel");
        countries.put("JO", "Jordan");
        countries.put("KW", "Kuwait");
        countries.put("LB", "Lebanon");
        countries.put("OM", "Oman");
        countries.put("PS", "Palestine");
        countries.put("QA", "Qatar");
        countries.put("SY", "Syria");
        countries.put("YE", "Yemen");

        // 8. Okeaniya
        countries.put("FJ", "Fiji");
        countries.put("KI", "Kiribati");
        countries.put("MH", "Marshall Islands");
        countries.put("FM", "Micronesia");
        countries.put("NR", "Nauru");
        countries.put("NZ", "New Zealand");
        countries.put("PW", "Palau");
        countries.put("PG", "Papua New Guinea");
        countries.put("WS", "Samoa");
        countries.put("SB", "Solomon Islands");
        countries.put("TO", "Tonga");
        countries.put("TV", "Tuvalu");
        countries.put("VU", "Vanuatu");

        // 9. Afrika
        countries.put("DZ", "Algeria");
        countries.put("AO", "Angola");
        countries.put("BJ", "Benin");
        countries.put("BW", "Botswana");
        countries.put("BF", "Burkina Faso");
        countries.put("BI", "Burundi");
        countries.put("CV", "Cabo Verde");
        countries.put("CM", "Cameroon");
        countries.put("CF", "Central African Republic");
        countries.put("TD", "Chad");
        countries.put("KM", "Comoros");
        countries.put("CG", "Congo");
        countries.put("CD", "Democratic Republic of the Congo");
        countries.put("DJ", "Djibouti");
        countries.put("GQ", "Equatorial Guinea");
        countries.put("ER", "Eritrea");
        countries.put("SZ", "Eswatini");
        countries.put("ET", "Ethiopia");
        countries.put("GA", "Gabon");
        countries.put("GM", "Gambia");
        countries.put("GH", "Ghana");
        countries.put("GN", "Guinea");
        countries.put("GW", "Guinea-Bissau");
        countries.put("CI", "Côte d'Ivoire");
        countries.put("KE", "Kenya");
        countries.put("LS", "Lesotho");
        countries.put("LR", "Liberia");
        countries.put("LY", "Libya");
        countries.put("MG", "Madagascar");
        countries.put("MW", "Malawi");
        countries.put("ML", "Mali");
        countries.put("MR", "Mauritania");
        countries.put("MU", "Mauritius");
        countries.put("MA", "Morocco");
        countries.put("MZ", "Mozambique");
        countries.put("NA", "Namibia");
        countries.put("NE", "Niger");
        countries.put("NG", "Nigeria");
        countries.put("RW", "Rwanda");
        countries.put("ST", "Sao Tome and Principe");
        countries.put("SN", "Senegal");
        countries.put("SC", "Seychelles");
        countries.put("SL", "Sierra Leone");
        countries.put("SO", "Somalia");
        countries.put("ZA", "South Africa");
        countries.put("SS", "South Sudan");
        countries.put("SD", "Sudan");
        countries.put("TZ", "Tanzania");
        countries.put("TG", "Togo");
        countries.put("TN", "Tunisia");
        countries.put("UG", "Uganda");
        countries.put("ZM", "Zambia");
        countries.put("ZW", "Zimbabwe");

        // 10. Avrasiya
        countries.put("AM", "Armenia");
        countries.put("GE", "Georgia");
        countries.put("RU", "Russia");
        countries.put("TR", "Turkey");


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
