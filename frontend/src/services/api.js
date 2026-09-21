const API_URL = import.meta.env.VITE_API_URL || "/api";

// Perform an authenticated fetch to the backend API and parse the JSON response
async function request(path, options = {}) {
  const token = localStorage.getItem("sadhana_token");
  const isFormData = options.body instanceof FormData;
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Something went wrong. Please try again.");
  }
  return response.status === 204 ? null : response.json();
}

export const api = {
  getPlans: () => request("/plans"),
  register: (payload) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  login: (payload) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  getCurrentUser: () => request("/auth/me"),
  getSubscriptions: () => request("/subscriptions"),
  getVerification: () => request("/verification"),
  getBusinessDetails: () => request("/business-details"),
  submitBusinessDetails: (payload) =>
    request("/business-details", { method: "POST", body: JSON.stringify(payload) }),
  submitVerification: (documentType, document) => {
    const body = new FormData();
    body.append("document_type", documentType);
    body.append("document", document);
    return request("/verification", { method: "POST", body });
  },
  createSubscription: (plan_id) =>
    request("/subscriptions", {
      method: "POST",
      body: JSON.stringify({ plan_id }),
    }),
  cancelSubscription: (subscriptionId) =>
    request(`/subscriptions/${subscriptionId}`, { method: "DELETE" }),
  renewSubscription: (subscriptionId) =>
    request(`/subscriptions/${subscriptionId}/renew`, { method: "POST" }),
  createPaymentOrder: (amount, receipt) =>
    request("/payments/create-order", {
      method: "POST",
      body: JSON.stringify({ amount, currency: "INR", receipt }),
    }),
  verifyPayment: (payload) =>
    request("/payments/verify-payment", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getInvoices: () => request("/invoices"),
  getAdminUsers: () => request("/admin/users"),
  getAdminSubscriptions: () => request("/admin/subscriptions"),
  deleteAdminUser: (userId) => request(`/admin/users/${userId}`, { method: "DELETE" }),
  getAdminVerifications: () => request("/admin/verifications"),
  reviewVerification: (verificationId, reviewStatus) =>
    request(`/admin/verifications/${verificationId}`, {
      method: "PATCH",
      body: JSON.stringify({ status: reviewStatus }),
    }),
  getVerificationDocument: async (verificationId) => {
    const token = localStorage.getItem("sadhana_token");
    const response = await fetch(`${API_URL}/admin/verifications/${verificationId}/document`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error("Unable to load the government ID document");
    return response.blob();
  },
};
