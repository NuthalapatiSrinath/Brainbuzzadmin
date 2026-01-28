import axiosInstance from "./axiosInstance";

const createFormData = (data) => {
  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    if (data[key] !== null && data[key] !== undefined) {
      formData.append(key, data[key]);
    }
  });
  return formData;
};

const subCategoryService = {
  // GET /?contentType=...&category=...
  getAll: async (contentType, categoryId) => {
    const params = { contentType };
    if (categoryId) params.category = categoryId;

    const response = await axiosInstance.get("/sub-categories", { params });
    return response.data;
  },

  // GET /:id
  getById: async (id) => {
    const response = await axiosInstance.get(`/sub-categories/${id}`);
    return response.data;
  },

  // POST / (Multipart)
  create: async (data) => {
    // data: { category (id), name, description, thumbnail: File, isActive }
    const formData = createFormData(data);
    const response = await axiosInstance.post("/sub-categories", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // PUT /:id (Multipart)
  update: async (id, data) => {
    const formData = createFormData(data);
    const response = await axiosInstance.put(
      `/sub-categories/${id}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },

  // DELETE /:id
  delete: async (id) => {
    const response = await axiosInstance.delete(`/sub-categories/${id}`);
    return response.data;
  },
};

export default subCategoryService;
