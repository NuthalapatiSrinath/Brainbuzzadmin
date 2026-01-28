import axiosInstance from "./axiosInstance";

// Helper to build FormData for file uploads
const createFormData = (data) => {
  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    if (data[key] !== null && data[key] !== undefined) {
      formData.append(key, data[key]);
    }
  });
  return formData;
};

const categoryService = {
  // GET /?contentType=...&isActive=...
  getAll: async (contentType, isActive) => {
    const params = { contentType };
    if (isActive !== undefined) params.isActive = isActive;

    const response = await axiosInstance.get("/categories", { params });
    return response.data;
  },

  // GET /:id
  getById: async (id) => {
    const response = await axiosInstance.get(`/categories/${id}`);
    return response.data;
  },

  // POST / (Multipart)
  create: async (data) => {
    // data should be object like: { name, description, contentType, thumbnail: File, isActive }
    const formData = createFormData(data);
    const response = await axiosInstance.post("/categories", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // PUT /:id (Multipart)
  update: async (id, data) => {
    const formData = createFormData(data);
    const response = await axiosInstance.put(`/categories/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // DELETE /:id
  delete: async (id) => {
    const response = await axiosInstance.delete(`/categories/${id}`);
    return response.data;
  },
};

export default categoryService;
