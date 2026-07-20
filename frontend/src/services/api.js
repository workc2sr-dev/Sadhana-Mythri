const API_URL = import.meta.env.VITE_API_URL || "/api";

async function request(path, options = {}) {
  const token = localStorage.getItem("sadhana_token");
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
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
  getSubscriptions: () => request("/subscriptions"),
  createSubscription: (plan_id) =>
    request("/subscriptions", {
      method: "POST",
      body: JSON.stringify({ plan_id }),
    }),
  getVerification: () => request("/verification"),
  submitVerification: (document_type) =>
    request("/verification", {
      method: "POST",
      body: JSON.stringify({ document_type }),
    }),
  getInvoices: () => request("/invoices"),
};
