export const monthlyPlanPrices = Object.freeze({
  essential: 2999,
  business: 4999,
  enterprise: 6999,
});

// Compute the annual price from a monthly price
export const annualPlanPrice = (monthlyPrice) => monthlyPrice * 12;
