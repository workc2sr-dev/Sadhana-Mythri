import { monthlyPlanPrices } from "./pricing";

export const plans = [
  {
    id: "essential",
    name: "Essential",
    price: monthlyPlanPrices.essential,
    description: "For freelancers and early-stage businesses.",
    features: [
      "Professional business address",
      "Mail notification",
      "Online account access",
    ],
  },
  {
    id: "business",
    name: "Business",
    price: monthlyPlanPrices.business,
    featured: true,
    description: "For growing teams that need more flexibility.",
    features: [
      "Everything in Essential",
      "Mail handling & forwarding",
      "2 workspace days / month",
      "Priority support",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: monthlyPlanPrices.enterprise,
    description: "For established businesses with tailored needs.",
    features: [
      "Everything in Business",
      "8 workspace days / month",
      "Dedicated support",
      "Custom requirements",
    ],
  },
];
