// src/constants/countries.ts
import { Country } from "../types/order";

export interface CountryMapping {
  code: string;        // ISO 3166-1 alpha-2 (AZ, DE, US...)
  name: string;        // Təmiz İngiliscə ad (A-dan Z-yə düzülmək üçün)
  enum: Country;       // Backend-in gözlədiyi Enum
  phoneCode: string;   // Beynəlxalq telefon kodu (+994, +1...)
  region: string;      // Biznes məntiqi üçün region
}

// ============================================================
// 🟢 1. SPESİFİK BİZNES MƏNTİQİ OLAN ÖLKƏLƏR (Öz Enum-ları olanlar)
// ============================================================
export const SPECIFIC_COUNTRIES: CountryMapping[] = [
  { code: "AZ", name: "Azerbaijan",           enum: Country.AZERBAIJAN,       phoneCode: "+994", region: "Local" },
  { code: "AU", name: "Australia",            enum: Country.AUSTRALIA,        phoneCode: "+61",  region: "Oceania" },
  { code: "CA", name: "Canada",               enum: Country.CANADA,           phoneCode: "+1",   region: "North America" },
  { code: "FR", name: "France",               enum: Country.FRANCE,           phoneCode: "+33",  region: "Europe" },
  { code: "DE", name: "Germany",              enum: Country.GERMANY,          phoneCode: "+49",  region: "Europe" },
  { code: "IT", name: "Italy",                enum: Country.ITALY,            phoneCode: "+39",  region: "Europe" },
  { code: "JP", name: "Japan",                enum: Country.JAPAN,            phoneCode: "+81",  region: "Asia" },
  { code: "SA", name: "Saudi Arabia",         enum: Country.SAUDI_ARABIA,     phoneCode: "+966", region: "Middle East" },
  { code: "CH", name: "Switzerland",          enum: Country.SWITZERLAND,      phoneCode: "+41",  region: "Europe" },
  { code: "AE", name: "United Arab Emirates", enum: Country.UAE,              phoneCode: "+971", region: "Middle East" },
  { code: "GB", name: "United Kingdom",       enum: Country.UNITED_KINGDOM,   phoneCode: "+44",  region: "Europe" },
  { code: "US", name: "United States",        enum: Country.USA,              phoneCode: "+1",   region: "North America" },
];

// ============================================================
// 🟡 2. YÜKSƏK TİCARƏT POTENSİALI OLAN DİGƏR ÖLKƏLƏR
// (Avrozona, Amerika Qitəsi və Qlobal Ticarət Mərkəzləri - Hamısı INTERNATIONAL_OTHER olacaq)
// ============================================================
export const OTHER_COUNTRIES: CountryMapping[] = [
  // --- Avropa Birliyi və Avrozona (Yüksək alıcılıq qabiliyyəti) ---
  { code: "AT", name: "Austria", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+43", region: "Europe" },
  { code: "BE", name: "Belgium", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+32", region: "Europe" },
  { code: "HR", name: "Croatia", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+385", region: "Europe" },
  { code: "CY", name: "Cyprus", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+357", region: "Europe" },
  { code: "CZ", name: "Czechia", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+420", region: "Europe" },
  { code: "DK", name: "Denmark", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+45", region: "Europe" },
  { code: "EE", name: "Estonia", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+372", region: "Europe" },
  { code: "FI", name: "Finland", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+358", region: "Europe" },
  { code: "GR", name: "Greece", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+30", region: "Europe" },
  { code: "HU", name: "Hungary", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+36", region: "Europe" },
  { code: "IE", name: "Ireland", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+353", region: "Europe" },
  { code: "LV", name: "Latvia", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+371", region: "Europe" },
  { code: "LT", name: "Lithuania", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+370", region: "Europe" },
  { code: "LU", name: "Luxembourg", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+352", region: "Europe" },
  { code: "MT", name: "Malta", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+356", region: "Europe" },
  { code: "NL", name: "Netherlands", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+31", region: "Europe" },
  { code: "NO", name: "Norway", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+47", region: "Europe" },
  { code: "PL", name: "Poland", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+48", region: "Europe" },
  { code: "PT", name: "Portugal", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+351", region: "Europe" },
  { code: "RO", name: "Romania", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+40", region: "Europe" },
  { code: "SK", name: "Slovakia", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+421", region: "Europe" },
  { code: "SI", name: "Slovenia", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+386", region: "Europe" },
  { code: "ES", name: "Spain", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+34", region: "Europe" },
  { code: "SE", name: "Sweden", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+46", region: "Europe" },

  // --- Amerika Qitəsi (USD Mərkəzli və Yüksək Potensiallı Bazar) ---
  { code: "AR", name: "Argentina", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+54", region: "South America" },
  { code: "BS", name: "Bahamas", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+1", region: "North America" },
  { code: "BR", name: "Brazil", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+55", region: "South America" },
  { code: "CL", name: "Chile", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+56", region: "South America" },
  { code: "CO", name: "Colombia", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+57", region: "South America" },
  { code: "CR", name: "Costa Rica", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+506", region: "North America" },
  { code: "DO", name: "Dominican Republic", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+1", region: "North America" },
  { code: "EC", name: "Ecuador", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+593", region: "South America" },
  { code: "MX", name: "Mexico", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+52", region: "North America" },
  { code: "PA", name: "Panama", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+507", region: "North America" },
  { code: "PE", name: "Peru", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+51", region: "South America" },
  { code: "PR", name: "Puerto Rico", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+1", region: "North America" },
  { code: "UY", name: "Uruguay", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+598", region: "South America" },

  // --- Asiya, Okeaniya və Körfəz (Böyük İqtisadiyyatlar) ---
  { code: "BH", name: "Bahrain", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+973", region: "Middle East" },
  { code: "CN", name: "China", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+86", region: "Asia" },
  { code: "HK", name: "Hong Kong", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+852", region: "Asia" },
  { code: "IN", name: "India", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+91", region: "Asia" },
  { code: "ID", name: "Indonesia", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+62", region: "Asia" },
  { code: "IL", name: "Israel", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+972", region: "Middle East" },
  { code: "KR", name: "South Korea", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+82", region: "Asia" },
  { code: "KW", name: "Kuwait", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+965", region: "Middle East" },
  { code: "MY", name: "Malaysia", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+60", region: "Asia" },
  { code: "NZ", name: "New Zealand", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+64", region: "Oceania" },
  { code: "OM", name: "Oman", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+968", region: "Middle East" },
  { code: "PH", name: "Philippines", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+63", region: "Asia" },
  { code: "QA", name: "Qatar", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+974", region: "Middle East" },
  { code: "SG", name: "Singapore", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+65", region: "Asia" },
  { code: "TW", name: "Taiwan", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+886", region: "Asia" },
  { code: "TH", name: "Thailand", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+66", region: "Asia" },

  { code: "VN", name: "Vietnam", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+84", region: "Asia" },

  // --- Afrika və MDB (Yüksələn Bazarlar) ---
  // --- Qafqaz, Avrasiya və MDB (Yüksək potensiallı qonşular) ---
  { code: "TR", name: "Turkey", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+90", region: "Eurasia" },
  { code: "RU", name: "Russia", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+7", region: "Eurasia" },
  { code: "GE", name: "Georgia", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+995", region: "Europe" },
  { code: "KZ", name: "Kazakhstan", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+7", region: "Asia" },
  { code: "MA", name: "Morocco", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+212", region: "Africa" },
  { code: "ZA", name: "South Africa", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+27", region: "Africa" },
  { code: "UZ", name: "Uzbekistan", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+998", region: "Asia" },


// --- Ərəb və Körfəz Ölkələri (Yüksək alıcılıq qabiliyyəti - Lüks seqment) ---
  { code: "QA", name: "Qatar", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+974", region: "Middle East" },
  { code: "KW", name: "Kuwait", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+965", region: "Middle East" },
  { code: "BH", name: "Bahrain", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+973", region: "Middle East" },
  { code: "OM", name: "Oman", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+968", region: "Middle East" },
  { code: "IL", name: "Israel", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+972", region: "Middle East" },
  { code: "EG", name: "Egypt", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+20", region: "Middle East" },
  { code: "JO", name: "Jordan", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+962", region: "Middle East" },
  { code: "LB", name: "Lebanon", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+961", region: "Middle East" },
  { code: "MA", name: "Morocco", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+212", region: "Africa" },

];

// ============================================================
// 🌐 3. BİRLƏŞDİRİLMİŞ VƏ ƏLİFBA SİRASI İLƏ DÜZÜLMÜŞ TAM SİYAHI 
// ============================================================
// Bu massiv Frontend-də istifadə olunacaq və A-dan Z-yə mükəmməl sırlanacaq.
export const ALL_COUNTRIES: CountryMapping[] = [
  ...SPECIFIC_COUNTRIES,
  ...OTHER_COUNTRIES,
].sort((a, b) => a.name.localeCompare(b.name));

// ============================================================
// 🛠️ 4. KÖMƏKÇİ FUNKSİYALAR
// ============================================================
export const getCountryByCode = (code: string): CountryMapping | undefined => {
  return ALL_COUNTRIES.find(c => c.code === code);
};

export const mapToBackendEnum = (isoCode: string): Country => {
  const country = getCountryByCode(isoCode);
  return country?.enum || Country.INTERNATIONAL_OTHER;
};