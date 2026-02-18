import { api as axiosInstance } from './authService';

export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_BASE_URL = `${BASE_URL}/api`;

/**
 * Centralized API service for all backend communication
 */
export const api = {
  // Vendors
  getVendors: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `/vendors/${queryString ? `?${queryString}` : ''}`;
    const response = await axiosInstance.get(url);
    return response.data;
  },

  getStateCounts: async () => {
    const response = await axiosInstance.get('/vendors/state_counts/');
    return response.data;
  },

  getVendor: async (id) => {
    const response = await axiosInstance.get(`/vendors/${id}/`);
    return response.data;
  },

  getTrustedVendors: async (limit = 6) => {
    const response = await axiosInstance.get('/vendors/?trusted=true');
    const data = response.data;
    const vendors = data.results || (Array.isArray(data) ? data : []);
    return vendors.slice(0, limit);
  },

  getFeaturedVendors: async (limit = 8) => {
    const response = await axiosInstance.get('/vendors/?featured=true');
    const data = response.data;
    const vendors = data.results || (Array.isArray(data) ? data : []);
    return vendors.slice(0, limit);
  },

  getTopRatedVendors: async (limit = 6) => {
    const response = await axiosInstance.get('/vendors/?top_rated=true');
    const data = response.data;
    const vendors = data.results || (Array.isArray(data) ? data : []);
    return vendors.slice(0, limit);
  },

  suggestZipcodes: async (prefix) => {
    const response = await axiosInstance.get(`/vendors/suggest_zipcodes/?prefix=${prefix}`);
    return response.data;
  },

  // Hollander Reference Data
  getMakes: async () => {
    const response = await axiosInstance.get('/hollander/makes/');
    return response.data;
  },

  getModels: async (params = {}) => {
    let makeId = params;
    if (typeof params === 'object' && params !== null) {
      makeId = params.makeID || params.makeId || params.make_id;
    }

    const url = makeId && (typeof makeId === 'number' || typeof makeId === 'string')
      ? `/hollander/models/?make_id=${makeId}`
      : '/hollander/models/';

    const response = await axiosInstance.get(url);
    return response.data;
  },

  getYears: async (params = {}) => {
    const makeId = params.makeID || params.makeId || params.make_id;
    const modelId = params.modelID || params.modelId || params.model_id;

    if (!makeId || !modelId) return [];

    const url = `/hollander/years/?make_id=${makeId}&model_id=${modelId}`;
    const response = await axiosInstance.get(url);
    return response.data;
  },

  getParts: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `/hollander/parts/${queryString ? `?${queryString}` : ''}`;
    const response = await axiosInstance.get(url);
    return response.data;
  },

  getVehicleDataBulk: async (makeId) => {
    const response = await axiosInstance.get(`/hollander/vehicle-data/${makeId}/`);
    return response.data;
  },

  getStates: async () => {
    const response = await axiosInstance.get('/common/states/');
    return response.data;
  },

  getCities: async () => {
    const response = await axiosInstance.get('/common/cities/');
    return response.data;
  },

  // Hollander / ZipCode Search
  searchPincodes: async (query) => {
    const response = await axiosInstance.get('/hollander/pincodes/search/', {
      params: { q: query }
    });
    return response.data;
  },

  lookupZipcode: async (zip) => {
    const response = await axiosInstance.get('/hollander/zipcode/lookup/', {
      params: { zip }
    });
    return response.data;
  },

  getZipcodesByState: async (state) => {
    const response = await axiosInstance.get('/hollander/zipcodes/state/', {
      params: { state }
    });
    return response.data;
  },

  // Admin / Common
  getAdminStats: async (token) => {
    // Token is handled by interceptor now, but kept argument for compatibility
    const response = await axiosInstance.get('/common/admin-stats/');
    return response.data;
  },

  getContactMessages: async (token) => {
    const response = await axiosInstance.get('/common/messages/');
    return response.data;
  },

  markMessageAsRead: async (token, messageId) => {
    const response = await axiosInstance.post(`/common/messages/${messageId}/mark_as_read/`);
    return response.data;
  },

  deleteContactMessage: async (token, messageId) => {
    await axiosInstance.delete(`/common/messages/${messageId}/`);
    return true;
  },

  submitYard: async (data) => {
    const response = await axiosInstance.post('/yard-submissions/', data);
    return response.data;
  },

  // Leads
  createLead: async (data) => {
    const response = await axiosInstance.post('/leads/', data);
    return response.data;
  },

  createVendorLead: async (data) => {
    const response = await axiosInstance.post('/vendor-leads/', data);
    return response.data;
  },

  sendContactMessage: async (data) => {
    const response = await axiosInstance.post('/common/messages/', data);
    return response.data;
  },

  // Ads
  getAds: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `/ads/${queryString ? `?${queryString}` : ''}`;
    const response = await axiosInstance.get(url);
    return response.data;
  },

  // Admin Management
  getAdminLeads: async (token, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `/leads/${queryString ? `?${queryString}` : ''}`;
    const response = await axiosInstance.get(url);
    return response.data;
  },

  updateLead: async (token, id, data) => {
    const response = await axiosInstance.patch(`/leads/${id}/`, data);
    return response.data;
  },

  exportLeads: async (token, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `/leads/export_csv/?${queryString}`;
    console.log('Exporting leads from:', url);

    const response = await axiosInstance.get(url, { responseType: 'blob' });
    return response.data;
  },

  exportVendors: async (token, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `/vendors/manage/export_csv/${queryString ? `?${queryString}` : ''}`;
    const response = await axiosInstance.get(url, { responseType: 'blob' });
    return response.data;
  },

  getAdminVendors: async (token, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `/vendors/manage/${queryString ? `?${queryString}` : ''}`;
    const response = await axiosInstance.get(url);
    return response.data;
  },

  createVendor: async (token, data) => {
    // Axios sets Content-Type automatically for FormData
    const response = await axiosInstance.post('/vendors/manage/', data);
    return response.data;
  },

  updateVendor: async (token, id, data) => {
    const response = await axiosInstance.patch(`/vendors/manage/${id}/`, data);
    return response.data;
  },

  resetVendorPassword: async (token, id) => {
    const response = await axiosInstance.post(`/vendors/manage/${id}/reset_password/`, {});
    return response.data;
  },

  getAdminAds: async (token, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `/ads/manage/${queryString ? `?${queryString}` : ''}`;
    const response = await axiosInstance.get(url);
    return response.data;
  },

  createAd: async (token, data) => {
    const response = await axiosInstance.post('/ads/manage/', data);
    return response.data;
  },

  updateAd: async (token, id, data) => {
    const response = await axiosInstance.patch(`/ads/manage/${id}/`, data);
    return response.data;
  },

  deleteAd: async (token, id) => {
    await axiosInstance.delete(`/ads/manage/${id}/`);
    return true;
  },

  // Part Pricing
  getPartPricing: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `/part-pricing/${queryString ? `?${queryString}` : ''}`;
    const response = await axiosInstance.get(url);
    return response.data;
  },

  exportPartPricing: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `/part-pricing/export_csv/${queryString ? `?${queryString}` : ''}`;
    const response = await axiosInstance.get(url, { responseType: 'blob' });
    return response.data;
  },

  // Message Management
  // markMessageAsRead defined above

  markMessageAsUnread: async (token, id) => {
    const response = await axiosInstance.post(`/common/messages/${id}/mark_as_unread/`);
    return response.data;
  },

  deleteMessage: async (token, id) => {
    await axiosInstance.delete(`/common/messages/${id}/`);
    return true;
  },

  bulkDeleteMessages: async (token, ids) => {
    const response = await axiosInstance.post('/common/messages/bulk_delete/', { ids });
    return response.data;
  },

  // Health check
  healthCheck: async () => {
    const response = await axiosInstance.get('/health/');
    return response.data;
  },

  // Vendor Import
  vendorImport: {
    upload: async (token, file) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await axiosInstance.post('/vendors/import/upload/', formData);
      return response.data;
    },

    confirm: async (token, uploadId) => {
      const response = await axiosInstance.post('/vendors/import/confirm/', { upload_id: uploadId });
      return response.data;
    },

    history: async (token, params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      const url = `/vendors/import/history/${queryString ? `?${queryString}` : ''}`;
      const response = await axiosInstance.get(url);
      return response.data;
    },

    rollback: async (token, batchId) => {
      const response = await axiosInstance.post(`/vendors/import/${batchId}/rollback/`);
      return response.data;
    },

    downloadErrorReport: async (token, batchId) => {
      const response = await axiosInstance.get(`/vendors/import/${batchId}/error_report/`, { responseType: 'blob' });
      return response.data;
    }
  }
};
