import { api as axiosInstance } from './authService';

const BLOG_BASE = '/blog';

export const blogApi = {
  // ─── PUBLIC ──────────────────────────────────────────
  
  /** Get paginated list of published posts */
  getPosts: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const res = await axiosInstance.get(`${BLOG_BASE}/posts/${qs ? `?${qs}` : ''}`);
    return res.data;
  },

  /** Get a single post by slug */
  getPost: async (slug) => {
    const res = await axiosInstance.get(`${BLOG_BASE}/posts/${slug}/`);
    return res.data;
  },

  /** Get featured posts */
  getFeaturedPosts: async () => {
    const res = await axiosInstance.get(`${BLOG_BASE}/posts/featured/`);
    return res.data;
  },

  /** Get related posts (exclude current, filter by category) */
  getRelatedPosts: async ({ exclude, category }) => {
    const qs = new URLSearchParams({ exclude, category }).toString();
    const res = await axiosInstance.get(`${BLOG_BASE}/posts/related/?${qs}`);
    return res.data;
  },

  /** Get all categories */
  getCategories: async () => {
    const res = await axiosInstance.get(`${BLOG_BASE}/categories/`);
    return res.data;
  },

  /** Like a post */
  likePost: async (slug) => {
    const res = await axiosInstance.post(`${BLOG_BASE}/posts/${slug}/like/`);
    return res.data;
  },

  /** Submit a comment */
  submitComment: async (slug, data) => {
    const res = await axiosInstance.post(`${BLOG_BASE}/posts/${slug}/comment/`, data);
    return res.data;
  },

  // ─── ADMIN ───────────────────────────────────────────

  /** Admin: get all posts (all statuses) */
  adminGetPosts: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const res = await axiosInstance.get(`${BLOG_BASE}/admin/posts/${qs ? `?${qs}` : ''}`);
    return res.data;
  },

  /** Admin: get single post by ID */
  adminGetPost: async (id) => {
    const res = await axiosInstance.get(`${BLOG_BASE}/admin/posts/${id}/`);
    return res.data;
  },

  /** Admin: create post */
  adminCreatePost: async (data) => {
    const res = await axiosInstance.post(`${BLOG_BASE}/admin/posts/`, data);
    return res.data;
  },

  /** Admin: update post */
  adminUpdatePost: async (id, data) => {
    const res = await axiosInstance.put(`${BLOG_BASE}/admin/posts/${id}/`, data);
    return res.data;
  },

  /** Admin: partial update post */
  adminPatchPost: async (id, data) => {
    const res = await axiosInstance.patch(`${BLOG_BASE}/admin/posts/${id}/`, data);
    return res.data;
  },

  /** Admin: delete post */
  adminDeletePost: async (id) => {
    const res = await axiosInstance.delete(`${BLOG_BASE}/admin/posts/${id}/`);
    return res.data;
  },

  /** Admin: publish a post */
  adminPublishPost: async (id) => {
    const res = await axiosInstance.post(`${BLOG_BASE}/admin/posts/${id}/publish/`);
    return res.data;
  },

  /** Admin: set post to draft */
  adminDraftPost: async (id) => {
    const res = await axiosInstance.post(`${BLOG_BASE}/admin/posts/${id}/draft/`);
    return res.data;
  },

  /** Admin: toggle featured */
  adminFeaturePost: async (id) => {
    const res = await axiosInstance.post(`${BLOG_BASE}/admin/posts/${id}/feature/`);
    return res.data;
  },

  /** Admin: get stats */
  adminGetStats: async () => {
    const res = await axiosInstance.get(`${BLOG_BASE}/admin/posts/stats/`);
    return res.data;
  },

  /** Admin: get all categories */
  adminGetCategories: async () => {
    const res = await axiosInstance.get(`${BLOG_BASE}/admin/categories/`);
    return res.data;
  },

  /** Admin: create category */
  adminCreateCategory: async (data) => {
    const res = await axiosInstance.post(`${BLOG_BASE}/admin/categories/`, data);
    return res.data;
  },

  /** Admin: delete category */
  adminDeleteCategory: async (id) => {
    await axiosInstance.delete(`${BLOG_BASE}/admin/categories/${id}/`);
  },

  /** Admin: get pending comments */
  adminGetComments: async () => {
    const res = await axiosInstance.get(`${BLOG_BASE}/admin/comments/`);
    return res.data;
  },

  /** Admin: approve comment */
  adminApproveComment: async (id) => {
    const res = await axiosInstance.post(`${BLOG_BASE}/admin/comments/${id}/approve/`);
    return res.data;
  },

  /** Admin: delete comment */
  adminDeleteComment: async (id) => {
    await axiosInstance.delete(`${BLOG_BASE}/admin/comments/${id}/`);
  },
};
