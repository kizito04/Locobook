export const BASE_CURRENCY = 'UGX';

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  rate: number; // Rate relative to USD (1 USD = X Currency)
}

export const currencies: Currency[] = [
  { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.73 },
  { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.85 },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHf', rate: 0.88 },
  { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1 }, // Base Currency
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', rate: 1.34 },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', rate: 1.35 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rate: 1.49 },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', rate: 3.67 },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', rate: 5.05 },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', rate: 6.81 },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', rate: 16.42 },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$', rate: 16.85 },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£', rate: 47.30 },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', rate: 94.48 },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', rate: 129.15 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 154.50 },
  { code: 'RWF', name: 'Rwandan Franc', symbol: 'RF', rate: 1295.00 },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', rate: 1361.21 },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh', rate: 2590.00 },
  { code: 'UGX', name: 'Ugandan Shilling', symbol: 'shs', rate: 3752.29 }
];

/**
 * Converts an amount from one currency to another
 * @param amount The value to convert
 * @param fromCode Source currency code
 * @param toCode Target currency code
 */
export const convertCurrency = (amount: number, fromCode: string, toCode: string): number => {
  const from = currencies.find(c => c.code === fromCode);
  const to = currencies.find(c => c.code === toCode);

  if (!from || !to) return amount;

  // Convert to USD first, then to target currency
  const inUsd = amount / from.rate;
  return inUsd * to.rate;
};
