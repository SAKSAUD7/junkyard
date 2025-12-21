const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * Centralized API service for all backend communication
 */
export const api = {
  // Vendors
  getVendors: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/vendors/${queryString ? `?${queryString}` : ''}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  getVendor: async (id) => {
    const response = await fetch(`${API_BASE_URL}/vendors/${id}/`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  getTrustedVendors: async (limit = 6) => {
    const response = await fetch(`${API_BASE_URL}/vendors/?trusted=true`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    // Return only the specified limit
    return Array.isArray(data) ? data.slice(0, limit) : data;
  },

  // Common data
  getMakes: async () => {
    const response = await fetch(`${API_BASE_URL}/common/makes/`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  getModels: async (params = {}) => {
    // Handle both direct makeId and params object from useData hook
    const makeId = params.makeID || params.makeId || params;
    const url = makeId && typeof makeId === 'number'
      ? `${API_BASE_URL}/common/models/?makeID=${makeId}`
      : `${API_BASE_URL}/common/models/`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  getParts: async () => {
    const response = await fetch(`${API_BASE_URL}/common/parts/`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  getStates: async () => {
    const response = await fetch(`${API_BASE_URL}/common/states/`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  getCities: async () => {
    const response = await fetch(`${API_BASE_URL}/common/cities/`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  // Leads
  createLead: async (data) => {
    const response = await fetch(`${API_BASE_URL}/leads/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  // Health check
  healthCheck: async () => {
    const response = await fetch(`${API_BASE_URL}/health/`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }
};
