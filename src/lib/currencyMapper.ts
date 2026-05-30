import { Country, Currency } from "../types";

export const getCurrencyForCountry = (country?: Country): Currency => {
  if (!country) return Currency.USD;

  switch (country) {
    case Country.AZERBAIJAN:
      return Currency.AZN;

    // European countries for EUR (UK is moved to global market as USD)
    case Country.GERMANY:
    case Country.FRANCE:
    case Country.ITALY:
    case Country.SWITZERLAND:
      return Currency.EUR;

    // Global luxury markets and other international zones for USD
    case Country.USA:
    case Country.CANADA:
    case Country.UNITED_KINGDOM:
    case Country.JAPAN:
    case Country.AUSTRALIA:
    case Country.UAE:
    case Country.SAUDI_ARABIA:
    case Country.INTERNATIONAL_OTHER:
    default:
      return Currency.USD;
  }
};

export const getCurrencyForIsoCode = (isoCode?: string): Currency => {
  if (!isoCode || isoCode.trim() === "") return Currency.USD;

  const upperIso = isoCode.toUpperCase();

  switch (upperIso) {
    case "AZ":
      return Currency.AZN;

    // European Union and Switzerland
    case "DE":
    case "FR":
    case "IT":
    case "ES":
    case "NL":
    case "BE":
    case "AT":
    case "CH":
    case "PT":
    case "GR":
      return Currency.EUR;

    // USA, UK, Canada, Japan, Australia, UAE, Saudi Arabia, etc.
    case "US":
    case "GB":
    case "CA":
    case "JP":
    case "AU":
    case "AE":
    case "SA":
    case "QA":
    case "KW":
    default:
      return Currency.USD;
  }
};

export const getCurrencySymbol = (currency: Currency | string): string => {
  switch (currency) {
    case Currency.AZN:
    case "AZN":
      return "₼";
    case Currency.EUR:
    case "EUR":
      return "€";
    case Currency.USD:
    case "USD":
    default:
      return "$";
  }
};
