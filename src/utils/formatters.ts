export const formatCurrency = (amount: number, currencyCode: string = 'UGX') => {
  const formatter = new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
  });
  
  let formatted = formatter.format(amount);
  
  // Custom replacement for UGX to show 'shs' as per original design
  if (currencyCode === 'UGX') {
    formatted = formatted.replace('UGX', 'shs');
  }
  
  return formatted;
};

