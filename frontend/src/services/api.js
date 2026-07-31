const API_URL = import.meta.env.VITE_API_URL || "/api";

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
  getSubscriptions: () => request("/subscriptions"),
  getVerification: () => request("/verification"),
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
  getInvoices: () => request("/invoices"),
  getAdminUsers: () => request("/admin/users"),
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
