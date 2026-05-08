export const BASE_CURRENCY = 'UGX';

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  rate: number; // Rate relative to USD (1 USD = X Currency)
}

export const currencies: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1 },
  { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.92 },
  { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.79 },
  { code: 'UGX', name: 'Ugandan Shilling', symbol: 'shs', rate: 3850 },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', rate: 130 },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', rate: 1450 },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', rate: 18.5 },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', rate: 83 },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', rate: 7.2 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 151 },
  { code: 'RWF', name: 'Rwandan Franc', symbol: 'RF', rate: 1280 },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh', rate: 2550 },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', rate: 3.67 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', rate: 1.35 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rate: 1.52 }
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
