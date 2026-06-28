const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
}

export const api = {
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  getToys: (params = '') => request(`/toys${params}`),
  getToy: (id) => request(`/toys/${id}`),
  addToy: (payload, token) => request('/toys', { method: 'POST', body: payload, token }),
  updateToyStatus: (id, status, token) => request(`/toys/${id}/status`, { method: 'PATCH', body: { status }, token }),
  deleteToy: (id, token) => request(`/toys/${id}`, { method: 'DELETE', token }),
  createOrder: (payload, token) => request('/orders', { method: 'POST', body: payload, token }),
  getMyOrders: (token) => request('/orders/mine', { token }),
  getReceivedOrders: (token) => request('/orders/received', { token }),
  updateOrderStatus: (id, status, token) => request(`/orders/${id}/status`, { method: 'PATCH', body: { status }, token }),
};

// Uploads an image file straight to Cloudinary using an unsigned upload preset.
// Returns the hosted image URL. Configure these in frontend/.env (see .env.example).
export async function uploadImageToCloudinary(file) {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !preset) {
    throw new Error('Cloudinary is not configured yet (see frontend/.env.example)');
  }
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', preset);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Image upload failed');
  return data.secure_url;
}
