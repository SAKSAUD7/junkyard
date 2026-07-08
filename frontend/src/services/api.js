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

  getTrustedVendors: async (limit = 10) => {
    const response = await axiosInstance.get('/vendors/');
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

  // Direct Hollander number lookup — cascades through PartPricing then HollanderInterchange
  lookupHollander: async ({ make_id, model_id, part_id, year, make_name, part_name }) => {
    try {
      const response = await axiosInstance.post('/hollander/lookup/', {
        make_id, model_id, part_id, year,
        make: make_name || '',       // used for HollanderInterchange string lookup
        part_type: part_name || ''   // used for HollanderInterchange string lookup
      });
      const results = response.data?.results || [];
      if (results.length > 0) {
        return { hollander_number: results[0].hollander_number || '', options: results[0].options || '' };
      }
      return { hollander_number: '', options: '' };
    } catch {
      return { hollander_number: '', options: '' };
    }
  },

  // Progressive Hollander question resolution
  // Fetches the next disambiguation question based on current answers
  resolveHollanderQuestions: async ({ make, model, part_name, year, answers = [] }) => {
    try {
      const response = await axiosInstance.post('/hollander/resolve-questions/', {
        make, model, part_name, year, answers
      });
      return response.data;
    } catch {
      return { candidates_count: 0, resolved: null, next_question: null, all_candidates: [] };
    }
  },

  getStates: async () => {
    const response = await axiosInstance.get('/common/states/');
    return response.data;
  },

  getCities: async (state) => {
    const params = state ? { state } : {};
    const response = await axiosInstance.get('/common/cities/', { params });
    return response.data;
  },

  getAllParts: async () => {
    let allParts = [];
    let page = 1;
    while (true) {
      const response = await axiosInstance.get('/common/parts/', { params: { page } });
      const data = response.data;
      allParts = allParts.concat(data.results || []);
      if (!data.next) break;
      page++;
    }
    return allParts.sort((a, b) => a.partName.localeCompare(b.partName));
  },

  getAllMakes: async () => {
    const response = await axiosInstance.get('/common/makes/');
    const makes = response.data.results || [];
    return makes.sort((a, b) => a.makeName.localeCompare(b.makeName));
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
    const isFormData = data instanceof FormData;
    const response = await axiosInstance.post('/yard-submissions/', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
    });
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

  deleteLead: async (token, id) => {
    const response = await axiosInstance.delete(`/leads/${id}/`);
    return response.data;
  },

  exportLeads: async (token, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `/leads/export_csv/?${queryString}`;
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
    const response = await axiosInstance.post('/vendors/manage/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  updateVendor: async (token, id, data) => {
    const response = await axiosInstance.patch(`/vendors/manage/${id}/`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  resetVendorPassword: async (token, id) => {
    const response = await axiosInstance.post(`/vendors/manage/${id}/reset_password/`, {});
    return response.data;
  },

  getAdminAds: async (token, params = {}) => {
    const queryString = new URLSearchParams({ page_size: 1000, ...params }).toString();
    const url = `/ads/manage/${queryString ? `?${queryString}` : ''}`;
    const response = await axiosInstance.get(url);
    return response.data;
  },

  createAd: async (token, data) => {
    const response = await axiosInstance.post('/ads/manage/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  updateAd: async (token, id, data) => {
    const response = await axiosInstance.patch(`/ads/manage/${id}/`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
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
  },

  // ── CMS ────────────────────────────────────────────────────────────────────
  cms: {
    // Public: fetch flat content map for a page
    getPageContent: async (page) => {
      // NOTE: use cms_page to avoid DRF pagination param collision
      const response = await axiosInstance.get(`/cms/content/?cms_page=${page}`);
      return response.data;
    },
    // Admin: list all entries filtered by cms_page (avoids DRF ?page= pagination collision)
    getAllContent: async (params = {}) => {
      // Rename 'page' key to 'cms_page' to avoid DRF PageNumberPagination conflict
      const fixedParams = { ...params };
      if (fixedParams.page !== undefined) {
        fixedParams.cms_page = fixedParams.page;
        delete fixedParams.page;
      }
      const qs = new URLSearchParams(fixedParams).toString();
      const response = await axiosInstance.get(`/cms/admin/content/${qs ? `?${qs}` : ''}`);
      return response.data;
    },
    // Admin: update a single field
    updateContent: async (id, data) => {
      const response = await axiosInstance.patch(`/cms/admin/content/${id}/`, data);
      return response.data;
    },
    // Admin: bulk update multiple fields
    bulkUpdate: async (updates) => {
      const response = await axiosInstance.post('/cms/admin/content/bulk/', { updates });
      return response.data;
    },
    // Admin: create a new content entry
    createContent: async (data) => {
      const response = await axiosInstance.post('/cms/admin/content/', data);
      return response.data;
    },
    // Admin: seed default content
    seedDefaults: async () => {
      const response = await axiosInstance.post('/cms/admin/content/seed/');
      return response.data;
    },
    // Media: list all assets
    getMedia: async () => {
      const response = await axiosInstance.get('/cms/admin/media/');
      return response.data;
    },
    // Media: upload a new asset
    uploadMedia: async (file, name = '', altText = '') => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', name || file.name);
      if (altText) formData.append('alt_text', altText);
      const response = await axiosInstance.post('/cms/admin/media/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    // Media: delete an asset
    deleteMedia: async (id) => {
      await axiosInstance.delete(`/cms/admin/media/${id}/`);
    },
  },

  // ── RBAC ───────────────────────────────────────────────────────────────────
  rbac: {
    // Current user's permissions
    getMyPermissions: async () => {
      const response = await axiosInstance.get('/rbac/me/');
      return response.data;
    },
    // Roles CRUD
    getRoles: async () => {
      const response = await axiosInstance.get('/rbac/roles/');
      return response.data;
    },
    createRole: async (data) => {
      const response = await axiosInstance.post('/rbac/roles/', data);
      return response.data;
    },
    updateRole: async (id, data) => {
      const response = await axiosInstance.patch(`/rbac/roles/${id}/`, data);
      return response.data;
    },
    deleteRole: async (id) => {
      await axiosInstance.delete(`/rbac/roles/${id}/`);
    },
    seedRoles: async () => {
      const response = await axiosInstance.post('/rbac/roles/seed/');
      return response.data;
    },
    // Staff CRUD
    getStaff: async () => {
      const response = await axiosInstance.get('/rbac/staff/');
      return response.data;
    },
    inviteStaff: async (data) => {
      const response = await axiosInstance.post('/rbac/staff/invite/', data);
      return response.data;
    },
    resetStaffPassword: async (id, data) => {
      const response = await axiosInstance.post(`/rbac/staff/${id}/reset_password/`, data);
      return response.data;
    },
    updateStaff: async (id, data) => {
      const response = await axiosInstance.patch(`/rbac/staff/${id}/`, data);
      return response.data;
    },
    deleteStaff: async (id) => {
      await axiosInstance.delete(`/rbac/staff/${id}/`);
    },
  },
};

