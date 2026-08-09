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
  { code: "AU", name: "Australia", enum: Country.AUSTRALIA, phoneCode: "+61", region: "Oceania" },
  { code: "AZ", name: "Azerbaijan", enum: Country.AZERBAIJAN, phoneCode: "+994", region: "Local" },
  { code: "CA", name: "Canada", enum: Country.CANADA, phoneCode: "+1", region: "North America" },
  { code: "FR", name: "France", enum: Country.FRANCE, phoneCode: "+33", region: "Europe" },
  { code: "DE", name: "Germany", enum: Country.GERMANY, phoneCode: "+49", region: "Europe" },
  { code: "IT", name: "Italy", enum: Country.ITALY, phoneCode: "+39", region: "Europe" },
  { code: "JP", name: "Japan", enum: Country.JAPAN, phoneCode: "+81", region: "Asia" },
  { code: "SA", name: "Saudi Arabia", enum: Country.SAUDI_ARABIA, phoneCode: "+966", region: "Middle East" },
  { code: "CH", name: "Switzerland", enum: Country.SWITZERLAND, phoneCode: "+41", region: "Europe" },
  { code: "AE", name: "United Arab Emirates", enum: Country.UAE, phoneCode: "+971", region: "Middle East" },
  { code: "GB", name: "United Kingdom", enum: Country.UNITED_KINGDOM, phoneCode: "+44", region: "Europe" },
  { code: "US", name: "United States", enum: Country.USA, phoneCode: "+1", region: "North America" },
];

// ============================================================
// 🟡 2. DİGƏR BÜTÜN ÖLKƏLƏR (Hamısı INTERNATIONAL_OTHER olacaq)
// ============================================================
export const OTHER_COUNTRIES: CountryMapping[] = [
  // --- Europe ---
  { code: "AL", name: "Albania", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+355", region: "Europe" },
  { code: "AD", name: "Andorra", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+376", region: "Europe" },
  { code: "AT", name: "Austria", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+43", region: "Europe" },
  { code: "BY", name: "Belarus", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+375", region: "Europe" },
  { code: "BE", name: "Belgium", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+32", region: "Europe" },
  { code: "BA", name: "Bosnia and Herzegovina", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+387", region: "Europe" },
  { code: "BG", name: "Bulgaria", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+359", region: "Europe" },
  { code: "HR", name: "Croatia", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+385", region: "Europe" },
  { code: "CY", name: "Cyprus", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+357", region: "Europe" },
  { code: "CZ", name: "Czechia", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+420", region: "Europe" },
  { code: "DK", name: "Denmark", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+45", region: "Europe" },
  { code: "EE", name: "Estonia", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+372", region: "Europe" },
  { code: "FI", name: "Finland", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+358", region: "Europe" },
  { code: "GR", name: "Greece", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+30", region: "Europe" },
  { code: "HU", name: "Hungary", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+36", region: "Europe" },
  { code: "IS", name: "Iceland", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+354", region: "Europe" },
  { code: "IE", name: "Ireland", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+353", region: "Europe" },
  { code: "LV", name: "Latvia", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+371", region: "Europe" },
  { code: "LI", name: "Liechtenstein", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+423", region: "Europe" },
  { code: "LT", name: "Lithuania", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+370", region: "Europe" },
  { code: "LU", name: "Luxembourg", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+352", region: "Europe" },
  { code: "MT", name: "Malta", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+356", region: "Europe" },
  { code: "MD", name: "Moldova", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+373", region: "Europe" },
  { code: "MC", name: "Monaco", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+377", region: "Europe" },
  { code: "ME", name: "Montenegro", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+382", region: "Europe" },
  { code: "NL", name: "Netherlands", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+31", region: "Europe" },
  { code: "MK", name: "North Macedonia", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+389", region: "Europe" },
  { code: "NO", name: "Norway", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+47", region: "Europe" },
  { code: "PL", name: "Poland", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+48", region: "Europe" },
  { code: "PT", name: "Portugal", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+351", region: "Europe" },
  { code: "RO", name: "Romania", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+40", region: "Europe" },
  { code: "SM", name: "San Marino", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+378", region: "Europe" },
  { code: "RS", name: "Serbia", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+381", region: "Europe" },
  { code: "SK", name: "Slovakia", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+421", region: "Europe" },
  { code: "SI", name: "Slovenia", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+386", region: "Europe" },
  { code: "ES", name: "Spain", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+34", region: "Europe" },
  { code: "SE", name: "Sweden", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+46", region: "Europe" },
  { code: "UA", name: "Ukraine", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+380", region: "Europe" },
  { code: "VA", name: "Vatican City", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+379", region: "Europe" },

  // --- North America ---
  { code: "BZ", name: "Belize", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+501", region: "North America" },
  { code: "CR", name: "Costa Rica", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+506", region: "North America" },
  { code: "SV", name: "El Salvador", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+503", region: "North America" },
  { code: "GT", name: "Guatemala", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+502", region: "North America" },
  { code: "HN", name: "Honduras", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+504", region: "North America" },
  { code: "MX", name: "Mexico", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+52", region: "North America" },
  { code: "NI", name: "Nicaragua", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+505", region: "North America" },
  { code: "PA", name: "Panama", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+507", region: "North America" },

  // --- South America ---
  { code: "AR", name: "Argentina", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+54", region: "South America" },
  { code: "BO", name: "Bolivia", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+591", region: "South America" },
  { code: "BR", name: "Brazil", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+55", region: "South America" },
  { code: "CL", name: "Chile", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+56", region: "South America" },
  { code: "CO", name: "Colombia", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+57", region: "South America" },
  { code: "EC", name: "Ecuador", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+593", region: "South America" },
  { code: "GY", name: "Guyana", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+592", region: "South America" },
  { code: "PY", name: "Paraguay", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+595", region: "South America" },
  { code: "PE", name: "Peru", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+51", region: "South America" },
  { code: "SR", name: "Suriname", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+597", region: "South America" },
  { code: "UY", name: "Uruguay", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+598", region: "South America" },
  { code: "VE", name: "Venezuela", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+58", region: "South America" },

  // --- Caribbean ---
  { code: "AG", name: "Antigua and Barbuda", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+1-268", region: "Caribbean" },
  { code: "BS", name: "Bahamas", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+1-242", region: "Caribbean" },
  { code: "BB", name: "Barbados", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+1-246", region: "Caribbean" },
  { code: "CU", name: "Cuba", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+53", region: "Caribbean" },
  { code: "DM", name: "Dominica", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+1-767", region: "Caribbean" },
  { code: "DO", name: "Dominican Republic", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+1-809", region: "Caribbean" },
  { code: "GD", name: "Grenada", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+1-473", region: "Caribbean" },
  { code: "HT", name: "Haiti", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+509", region: "Caribbean" },
  { code: "JM", name: "Jamaica", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+1-876", region: "Caribbean" },
  { code: "KN", name: "Saint Kitts and Nevis", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+1-869", region: "Caribbean" },
  { code: "LC", name: "Saint Lucia", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+1-758", region: "Caribbean" },
  { code: "VC", name: "Saint Vincent and the Grenadines", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+1-784", region: "Caribbean" },
  { code: "TT", name: "Trinidad and Tobago", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+1-868", region: "Caribbean" },

  // --- Asia ---
  { code: "AF", name: "Afghanistan", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+93", region: "Asia" },
  { code: "BD", name: "Bangladesh", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+880", region: "Asia" },
  { code: "BT", name: "Bhutan", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+975", region: "Asia" },
  { code: "BN", name: "Brunei", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+673", region: "Asia" },
  { code: "KH", name: "Cambodia", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+855", region: "Asia" },
  { code: "CN", name: "China", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+86", region: "Asia" },
  { code: "IN", name: "India", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+91", region: "Asia" },
  { code: "ID", name: "Indonesia", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+62", region: "Asia" },
  { code: "KZ", name: "Kazakhstan", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+7", region: "Asia" },
  { code: "KG", name: "Kyrgyzstan", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+996", region: "Asia" },
  { code: "LA", name: "Laos", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+856", region: "Asia" },
  { code: "MY", name: "Malaysia", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+60", region: "Asia" },
  { code: "MV", name: "Maldives", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+960", region: "Asia" },
  { code: "MN", name: "Mongolia", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+976", region: "Asia" },
  { code: "MM", name: "Myanmar", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+95", region: "Asia" },
  { code: "NP", name: "Nepal", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+977", region: "Asia" },
  { code: "KP", name: "North Korea", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+850", region: "Asia" },
  { code: "PK", name: "Pakistan", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+92", region: "Asia" },
  { code: "PH", name: "Philippines", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+63", region: "Asia" },
  { code: "SG", name: "Singapore", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+65", region: "Asia" },
  { code: "KR", name: "South Korea", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+82", region: "Asia" },
  { code: "LK", name: "Sri Lanka", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+94", region: "Asia" },
  { code: "TJ", name: "Tajikistan", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+992", region: "Asia" },
  { code: "TH", name: "Thailand", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+66", region: "Asia" },
  { code: "TL", name: "Timor-Leste", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+670", region: "Asia" },
  { code: "TM", name: "Turkmenistan", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+993", region: "Asia" },
  { code: "UZ", name: "Uzbekistan", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+998", region: "Asia" },
  { code: "VN", name: "Vietnam", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+84", region: "Asia" },

  // --- Middle East ---
  { code: "BH", name: "Bahrain", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+973", region: "Middle East" },
  { code: "EG", name: "Egypt", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+20", region: "Middle East" },
  { code: "IR", name: "Iran", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+98", region: "Middle East" },
  { code: "IQ", name: "Iraq", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+964", region: "Middle East" },
  { code: "IL", name: "Israel", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+972", region: "Middle East" },
  { code: "JO", name: "Jordan", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+962", region: "Middle East" },
  { code: "KW", name: "Kuwait", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+965", region: "Middle East" },
  { code: "LB", name: "Lebanon", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+961", region: "Middle East" },
  { code: "OM", name: "Oman", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+968", region: "Middle East" },
  { code: "PS", name: "Palestine", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+970", region: "Middle East" },
  { code: "QA", name: "Qatar", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+974", region: "Middle East" },
  { code: "SY", name: "Syria", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+963", region: "Middle East" },
  { code: "YE", name: "Yemen", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+967", region: "Middle East" },

  // --- Oceania ---
  { code: "FJ", name: "Fiji", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+679", region: "Oceania" },
  { code: "KI", name: "Kiribati", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+686", region: "Oceania" },
  { code: "MH", name: "Marshall Islands", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+692", region: "Oceania" },
  { code: "FM", name: "Micronesia", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+691", region: "Oceania" },
  { code: "NR", name: "Nauru", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+674", region: "Oceania" },
  { code: "NZ", name: "New Zealand", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+64", region: "Oceania" },
  { code: "PW", name: "Palau", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+680", region: "Oceania" },
  { code: "PG", name: "Papua New Guinea", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+675", region: "Oceania" },
  { code: "WS", name: "Samoa", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+685", region: "Oceania" },
  { code: "SB", name: "Solomon Islands", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+677", region: "Oceania" },
  { code: "TO", name: "Tonga", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+676", region: "Oceania" },
  { code: "TV", name: "Tuvalu", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+688", region: "Oceania" },
  { code: "VU", name: "Vanuatu", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+678", region: "Oceania" },

  // --- Africa ---
  { code: "DZ", name: "Algeria", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+213", region: "Africa" },
  { code: "AO", name: "Angola", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+244", region: "Africa" },
  { code: "BJ", name: "Benin", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+229", region: "Africa" },
  { code: "BW", name: "Botswana", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+267", region: "Africa" },
  { code: "BF", name: "Burkina Faso", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+226", region: "Africa" },
  { code: "BI", name: "Burundi", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+257", region: "Africa" },
  { code: "CV", name: "Cabo Verde", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+238", region: "Africa" },
  { code: "CM", name: "Cameroon", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+237", region: "Africa" },
  { code: "CF", name: "Central African Republic", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+236", region: "Africa" },
  { code: "TD", name: "Chad", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+235", region: "Africa" },
  { code: "KM", name: "Comoros", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+269", region: "Africa" },
  { code: "CG", name: "Congo", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+242", region: "Africa" },
  { code: "CD", name: "Democratic Republic of the Congo", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+243", region: "Africa" },
  { code: "DJ", name: "Djibouti", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+253", region: "Africa" },
  { code: "GQ", name: "Equatorial Guinea", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+240", region: "Africa" },
  { code: "ER", name: "Eritrea", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+291", region: "Africa" },
  { code: "SZ", name: "Eswatini", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+268", region: "Africa" },
  { code: "ET", name: "Ethiopia", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+251", region: "Africa" },
  { code: "GA", name: "Gabon", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+241", region: "Africa" },
  { code: "GM", name: "Gambia", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+220", region: "Africa" },
  { code: "GH", name: "Ghana", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+233", region: "Africa" },
  { code: "GN", name: "Guinea", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+224", region: "Africa" },
  { code: "GW", name: "Guinea-Bissau", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+245", region: "Africa" },
  { code: "CI", name: "Côte d'Ivoire", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+225", region: "Africa" },
  { code: "KE", name: "Kenya", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+254", region: "Africa" },
  { code: "LS", name: "Lesotho", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+266", region: "Africa" },
  { code: "LR", name: "Liberia", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+231", region: "Africa" },
  { code: "LY", name: "Libya", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+218", region: "Africa" },
  { code: "MG", name: "Madagascar", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+261", region: "Africa" },
  { code: "MW", name: "Malawi", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+265", region: "Africa" },
  { code: "ML", name: "Mali", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+223", region: "Africa" },
  { code: "MR", name: "Mauritania", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+222", region: "Africa" },
  { code: "MU", name: "Mauritius", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+230", region: "Africa" },
  { code: "MA", name: "Morocco", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+212", region: "Africa" },
  { code: "MZ", name: "Mozambique", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+258", region: "Africa" },
  { code: "NA", name: "Namibia", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+264", region: "Africa" },
  { code: "NE", name: "Niger", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+227", region: "Africa" },
  { code: "NG", name: "Nigeria", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+234", region: "Africa" },
  { code: "RW", name: "Rwanda", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+250", region: "Africa" },
  { code: "ST", name: "Sao Tome and Principe", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+239", region: "Africa" },
  { code: "SN", name: "Senegal", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+221", region: "Africa" },
  { code: "SC", name: "Seychelles", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+248", region: "Africa" },
  { code: "SL", name: "Sierra Leone", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+232", region: "Africa" },
  { code: "SO", name: "Somalia", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+252", region: "Africa" },
  { code: "ZA", name: "South Africa", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+27", region: "Africa" },
  { code: "SS", name: "South Sudan", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+211", region: "Africa" },
  { code: "SD", name: "Sudan", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+249", region: "Africa" },
  { code: "TZ", name: "Tanzania", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+255", region: "Africa" },
  { code: "TG", name: "Togo", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+228", region: "Africa" },
  { code: "TN", name: "Tunisia", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+216", region: "Africa" },
  { code: "UG", name: "Uganda", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+256", region: "Africa" },
  { code: "ZM", name: "Zambia", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+260", region: "Africa" },
  { code: "ZW", name: "Zimbabwe", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+263", region: "Africa" },

  // --- Eurasia ---
  { code: "AM", name: "Armenia", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+374", region: "Eurasia" },
  { code: "GE", name: "Georgia", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+995", region: "Eurasia" },
  { code: "RU", name: "Russia", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+7", region: "Eurasia" },
  { code: "TR", name: "Turkey", enum: Country.INTERNATIONAL_OTHER, phoneCode: "+90", region: "Eurasia" },

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