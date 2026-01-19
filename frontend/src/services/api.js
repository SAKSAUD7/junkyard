const API_BASE_URL = 'http://localhost:8000/api';

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

  getStateCounts: async () => {
    const response = await fetch(`${API_BASE_URL}/vendors/state_counts/`);
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
    // Handle paginated or list response
    const vendors = data.results || (Array.isArray(data) ? data : []);
    return vendors.slice(0, limit);
  },

  getFeaturedVendors: async (limit = 8) => {
    const response = await fetch(`${API_BASE_URL}/vendors/?featured=true`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    const vendors = data.results || (Array.isArray(data) ? data : []);
    return vendors.slice(0, limit);
  },

  getTopRatedVendors: async (limit = 6) => {
    const response = await fetch(`${API_BASE_URL}/vendors/?top_rated=true`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    const vendors = data.results || (Array.isArray(data) ? data : []);
    return vendors.slice(0, limit);
  },

  suggestZipcodes: async (prefix) => {
    const response = await fetch(`${API_BASE_URL}/vendors/suggest_zipcodes/?prefix=${prefix}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  // Hollander Reference Data
  getMakes: async () => {
    const response = await fetch(`${API_BASE_URL}/hollander/makes/`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  getModels: async (params = {}) => {
    // Handle all case variations: direct ID, params object with makeID/makeId/make_id
    let makeId = params;
    if (typeof params === 'object' && params !== null) {
      makeId = params.makeID || params.makeId || params.make_id;
    }

    // Use the hollander endpoint
    const url = makeId && (typeof makeId === 'number' || typeof makeId === 'string')
      ? `${API_BASE_URL}/hollander/models/?make_id=${makeId}`
      : `${API_BASE_URL}/hollander/models/`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  getYears: async (params = {}) => {
    const makeId = params.makeID || params.makeId || params.make_id;
    const modelId = params.modelID || params.modelId || params.model_id;

    if (!makeId || !modelId) return [];

    const url = `${API_BASE_URL}/hollander/years/?make_id=${makeId}&model_id=${modelId}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  getParts: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/hollander/parts/${queryString ? `?${queryString}` : ''}`;
    const response = await fetch(url);
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

  // Admin / Common
  getAdminStats: async (token) => {
    const response = await fetch(`${API_BASE_URL}/common/admin-stats/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  getContactMessages: async (token) => {
    const response = await fetch(`${API_BASE_URL}/common/messages/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
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

  sendContactMessage: async (data) => {
    const response = await fetch(`${API_BASE_URL}/common/messages/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  // Ads
  getAds: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/ads/${queryString ? `?${queryString}` : ''}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  // Admin Management
  getAdminLeads: async (token, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/leads/${queryString ? `?${queryString}` : ''}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  updateLead: async (token, id, data) => {
    const response = await fetch(`${API_BASE_URL}/leads/${id}/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  exportLeads: async (token, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/leads/export_csv/${queryString ? `?${queryString}` : ''}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.blob();
  },

  exportVendors: async (token, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/vendors/manage/export_csv/${queryString ? `?${queryString}` : ''}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.blob();
  },

  getAdminVendors: async (token, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/vendors/manage/${queryString ? `?${queryString}` : ''}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  updateVendor: async (token, id, data) => {
    const response = await fetch(`${API_BASE_URL}/vendors/manage/${id}/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  getAdminAds: async (token, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/ads/manage/${queryString ? `?${queryString}` : ''}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  createAd: async (token, data) => {
    const response = await fetch(`${API_BASE_URL}/ads/manage/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  updateAd: async (token, id, data) => {
    const response = await fetch(`${API_BASE_URL}/ads/manage/${id}/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  deleteAd: async (token, id) => {
    const response = await fetch(`${API_BASE_URL}/ads/manage/${id}/`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return true;
  },

  // Message Management
  markMessageAsRead: async (token, id) => {
    const response = await fetch(`${API_BASE_URL}/contact-messages/${id}/mark_as_read/`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  markMessageAsUnread: async (token, id) => {
    const response = await fetch(`${API_BASE_URL}/contact-messages/${id}/mark_as_unread/`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  deleteMessage: async (token, id) => {
    const response = await fetch(`${API_BASE_URL}/contact-messages/${id}/`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return true;
  },

  bulkDeleteMessages: async (token, ids) => {
    const response = await fetch(`${API_BASE_URL}/contact-messages/bulk_delete/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ids })
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
