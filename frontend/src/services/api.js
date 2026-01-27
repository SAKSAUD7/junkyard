const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';

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
    const url = `${API_BASE_URL}/leads/export_csv/?${queryString}`;
    console.log('Exporting leads from:', url);

    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('Export response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Export error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

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

  createVendor: async (token, data) => {
    const response = await fetch(`${API_BASE_URL}/vendors/manage/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }
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

  resetVendorPassword: async (token, id) => {
    const response = await fetch(`${API_BASE_URL}/vendors/manage/${id}/reset_password/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: '{}'
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
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
    const headers = { 'Authorization': `Bearer ${token}` };

    // Only set Content-Type for JSON, let browser set it for FormData
    if (!(data instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE_URL}/ads/manage/`, {
      method: 'POST',
      headers,
      body: data instanceof FormData ? data : JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  updateAd: async (token, id, data) => {
    const headers = { 'Authorization': `Bearer ${token}` };

    // Only set Content-Type for JSON, let browser set it for FormData
    if (!(data instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE_URL}/ads/manage/${id}/`, {
      method: 'PATCH',
      headers,
      body: data instanceof FormData ? data : JSON.stringify(data)
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
  },

  // Vendor Import
  vendorImport: {
    upload: async (token, file) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch(`${API_BASE_URL}/vendors/import/upload/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (!response.ok) {
        let errorMsg;
        try {
          const text = await response.text();
          try {
            const error = JSON.parse(text);
            errorMsg = error.error || `HTTP error! status: ${response.status}`;
          } catch {
            // If JSON parse fails, use text
            errorMsg = `Server Error (${response.status}): ${text.substring(0, 100)}...`;
          }
        } catch (e) {
          errorMsg = `HTTP error! status: ${response.status}`;
        }
        throw new Error(errorMsg);
      }
      return response.json();
    },

    confirm: async (token, uploadId) => {
      const response = await fetch(`${API_BASE_URL}/vendors/import/confirm/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ upload_id: uploadId })
      });
      if (!response.ok) {
        let errorMsg;
        try {
          const text = await response.text();
          try {
            const error = JSON.parse(text);
            errorMsg = error.error || `HTTP error! status: ${response.status}`;
          } catch {
            // If JSON parse fails, use text
            errorMsg = `Server Error (${response.status}): ${text.substring(0, 100)}...`;
          }
        } catch (e) {
          errorMsg = `HTTP error! status: ${response.status}`;
        }
        throw new Error(errorMsg);
      }
      return response.json();
    },

    history: async (token, params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${API_BASE_URL}/vendors/import/history/${queryString ? `?${queryString}` : ''}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    },

    rollback: async (token, batchId) => {
      const response = await fetch(`${API_BASE_URL}/vendors/import/${batchId}/rollback/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
      }
      return response.json();
    },

    downloadErrorReport: async (token, batchId) => {
      const response = await fetch(`${API_BASE_URL}/vendors/import/${batchId}/error_report/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.blob();
    }
  }
};
