export const monthlyPlanPrices = Object.freeze({
  essential: 2999,
  business: 4999,
  enterprise: 6999,
});

export const annualPlanPrice = (monthlyPrice) => monthlyPrice * 12;
