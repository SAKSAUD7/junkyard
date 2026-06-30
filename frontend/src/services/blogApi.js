import { api as axiosInstance } from './authService';

const BLOG_BASE = '/blog';

export const blogApi = {
  // ─── PUBLIC ──────────────────────────────────────────
  
  getPosts: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const res = await axiosInstance.get(`${BLOG_BASE}/posts/${qs ? `?${qs}` : ''}`);
    return res.data;
  },

  getPost: async (slug) => {
    const res = await axiosInstance.get(`${BLOG_BASE}/posts/${slug}/`);
    return res.data;
  },

  getFeaturedPosts: async () => {
    const res = await axiosInstance.get(`${BLOG_BASE}/posts/featured/`);
    return res.data;
  },

  getTrendingPosts: async () => {
    const res = await axiosInstance.get(`${BLOG_BASE}/posts/trending/`);
    return res.data;
  },

  getRelatedPosts: async ({ exclude, category }) => {
    const qs = new URLSearchParams({ exclude, category }).toString();
    const res = await axiosInstance.get(`${BLOG_BASE}/posts/related/?${qs}`);
    return res.data;
  },

  getCategories: async () => {
    const res = await axiosInstance.get(`${BLOG_BASE}/categories/`);
    return res.data;
  },

  likePost: async (slug) => {
    const res = await axiosInstance.post(`${BLOG_BASE}/posts/${slug}/like/`);
    return res.data;
  },

  submitComment: async (slug, data) => {
    const res = await axiosInstance.post(`${BLOG_BASE}/posts/${slug}/comment/`, data);
    return res.data;
  },

  // ─── ADMIN ───────────────────────────────────────────

  adminGetPosts: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const res = await axiosInstance.get(`${BLOG_BASE}/admin/posts/${qs ? `?${qs}` : ''}`);
    return res.data;
  },

  adminGetPost: async (id) => {
    const res = await axiosInstance.get(`${BLOG_BASE}/admin/posts/${id}/`);
    return res.data;
  },

  adminCreatePost: async (data) => {
    const res = await axiosInstance.post(`${BLOG_BASE}/admin/posts/`, data);
    return res.data;
  },

  adminUpdatePost: async (id, data) => {
    // using patch for partial updates to avoid overwriting missing fields
    const res = await axiosInstance.patch(`${BLOG_BASE}/admin/posts/${id}/`, data);
    return res.data;
  },

  adminDeletePost: async (id) => {
    const res = await axiosInstance.delete(`${BLOG_BASE}/admin/posts/${id}/`);
    return res.data;
  },

  adminUpdatePostStatus: async (id, status) => {
    const res = await axiosInstance.post(`${BLOG_BASE}/admin/posts/${id}/set_status/`, { status });
    return res.data;
  },

  adminGetStats: async () => {
    const res = await axiosInstance.get(`${BLOG_BASE}/admin/posts/stats/`);
    return res.data;
  },

  // Taxonomies & Meta
  
  adminGetCategories: async () => {
    const res = await axiosInstance.get(`${BLOG_BASE}/admin/categories/`);
    return res.data;
  },
  
  adminGetTags: async () => {
    const res = await axiosInstance.get(`${BLOG_BASE}/admin/tags/`);
    return res.data;
  },
  
  adminGetAuthors: async () => {
    const res = await axiosInstance.get(`${BLOG_BASE}/admin/authors/`);
    return res.data;
  },

  // Comments
  
  adminGetComments: async () => {
    const res = await axiosInstance.get(`${BLOG_BASE}/admin/comments/`);
    return res.data;
  },

  adminUpdateCommentStatus: async (id, status) => {
    const res = await axiosInstance.post(`${BLOG_BASE}/admin/comments/${id}/update_status/`, { status });
    return res.data;
  },

  adminDeleteComment: async (id) => {
    await axiosInstance.delete(`${BLOG_BASE}/admin/comments/${id}/`);
  },
};
