import { convertCurrency } from './currencies';

export const formatCurrency = (amount: number, currencyCode: string = 'UGX', baseCurrency: string = 'UGX') => {
  // Convert amount if the currencyCode is different from baseCurrency
  const convertedAmount = currencyCode === baseCurrency ? amount : convertCurrency(amount, baseCurrency, currencyCode);

  const formatter = new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: currencyCode === 'UGX' ? 0 : 2 // Keep decimals for non-shilling currencies
  });
  
  let formatted = formatter.format(convertedAmount);
  
  // Custom replacement for UGX to show 'shs' as per original design
  if (currencyCode === 'UGX') {
    formatted = formatted.replace('UGX', 'shs');
  }
  
  return formatted;
};

