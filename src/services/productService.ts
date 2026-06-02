import { api } from "../lib/api";
import {
  ProductModelResponse,
  CreateProductModelRequest,
  UpdateProductModelRequest,
  ApiResponse,
  AvailabilityStatus,
} from "../types";
import {
  ProductCatalogResponse,
  ProductFilterRequest,
  ProductDetailResponse,
  ProductPriceMatrixResponse,
  P_AvailableLeatherResponse
} from "../types/product";

const API_BASE_URL = "/admin/products";
const SHOP_API_BASE_URL = "/products";

export const productService = {
  
  // --- ADMIN ENDPOINTS ---
  
  // GET all products (Assuming a standard list endpoint exists)
  getAllProducts: async (): Promise<ProductModelResponse[]> => {
    const response = await api.get<ApiResponse<ProductModelResponse[]>>(API_BASE_URL);
    return response.data.data;
  },

  getProducts: async (): Promise<ProductModelResponse[]> => {
    const response = await api.get<ApiResponse<ProductModelResponse[]>>(API_BASE_URL);
    return response.data.data;
  },


  // 🌍 FRONTEND SHOP KATALOQ ÜÇÜN
  getProductsSlice: async (filter: ProductFilterRequest): Promise<ProductCatalogResponse> => {
    // Diqqət: "SHOP_API_BASE_URL" əgər '/products' isə o şəkildə qalır.
    // Əgər '/api/products' dursa, ona uyğun yaz. 
    // Sənin kodunda "/products" olduğu görünürdü, lakin backend loglarında "/api/products" idi.
    // Biz api.ts interceptor-un "/api" əlavə etdiyini nəzərə alaraq belə yazırıq:
    const response = await api.get('/products', { 
      params: {
        modelType: filter.modelType || undefined,
        search: filter.search || undefined,
        page: filter.page || 0,
        size: filter.size || 12
      } 
    });
    
    // ApiResponse qabığını soyuruq
    if (response?.data?.data) return response.data.data;
    if (response?.data) return response.data;
    
    // Qəza sığortası
    return { content: [], pageNumber: 0, pageSize: 12, hasNext: false, hasPrevious: false };
  },
  
  createProductModel: async (
    data: CreateProductModelRequest,
    images: File[]
  ): Promise<ProductModelResponse> => {
    const formData = new FormData();
    formData.append(
      "data",
      new Blob([JSON.stringify(data)], { type: "application/json" })
    );
    images.forEach((file) => {
      formData.append("images", file);
    });

    const response = await api.post<ApiResponse<ProductModelResponse>>(
      API_BASE_URL,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.data;
  },

  updateProductModel: async (
    id: number,
    data: UpdateProductModelRequest,
    newImages?: File[]
  ): Promise<ProductModelResponse> => {
    const formData = new FormData();
    formData.append(
      "data",
      new Blob([JSON.stringify(data)], { type: "application/json" })
    );
    if (newImages) {
      newImages.forEach((file) => {
        formData.append("newImages", file);
      });
    }

    const response = await api.put<ApiResponse<ProductModelResponse>>(
      `${API_BASE_URL}/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.data;
  },

  deleteProductModel: async (id: number): Promise<void> => {
    await api.delete(`${API_BASE_URL}/${id}`);
  },

  updateProductModelStatus: async (
    id: number,
    status: AvailabilityStatus
  ): Promise<ProductModelResponse> => {
    const response = await api.put<ApiResponse<ProductModelResponse>>(
      `${API_BASE_URL}/${id}/status`,
      null,
      { params: { status } }
    );
    return response.data.data;
  },

  addProductImages: async (modelId: number, images: File[]): Promise<void> => {
    const formData = new FormData();
    images.forEach((file) => {
      formData.append("images", file);
    });
    await api.post(`${API_BASE_URL}/${modelId}/images`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  changePrimaryImage: async (
    modelId: number,
    imageId: number
  ): Promise<void> => {
    await api.patch(`${API_BASE_URL}/${modelId}/images/${imageId}/primary`);
  },

  deleteProductImage: async (
    modelId: number,
    imageId: number
  ): Promise<void> => {
    await api.delete(`${API_BASE_URL}/${modelId}/images/${imageId}`);
  },

  // --- SHOP ENDPOINTS ---
// Filtrləri və səhifələməni qəbul edən peşəkar çağırış
  getShopProducts: async (filter: ProductFilterRequest): Promise<ProductCatalogResponse> => {
    try {
      // Axios-da "params" obyekti avtomatik olaraq URL-in sonuna ?page=0&size=12 kimi əlavə olunur
      const response = await api.get('/products', { params: filter });
      
      // İnterceptor ApiResponse-u onsuz da açır, bizə birbaşa ProductCatalogResponse qalır
      return response.data;
    } catch (error) {
      console.error("Məhsulları gətirəndə xəta:", error);
      throw error;
    }
  },
  

  // Product Detail gətirən funksiya
  getProductDetail: async (id: number): Promise<ProductDetailResponse> => {
    try {
      const response = await api.get(`/products/${id}`);
      // Zəka mühərrikimiz ApiResponse-u açdığı üçün bizə xalis data qalır
      return response.data;
    } catch (error) {
      console.error("Məhsul detallarını gətirəndə xəta:", error);
      throw error;
    }
  },
  getProductPrices: async (id: number): Promise<ProductPriceMatrixResponse> => {
    const response = await api.get<ApiResponse<ProductPriceMatrixResponse>>(`${SHOP_API_BASE_URL}/${id}/prices`);
    return response.data.data;
  },

 getProductAvailableLeathers: async (id: number): Promise<P_AvailableLeatherResponse[]> => {
    try {
      const response = await api.get(`/products/${id}/available-leathers`);
      // İnterceptor onsuz da ApiResponse qutusunu açır deyə birbaşa datanı (List) qaytarırıq
      return response.data; 
    } catch (error) {
      console.error("Dəri növlərini gətirəndə xəta:", error);
      throw error;
    }
  },

  getProductPriceMatrix: async (id: number): Promise<ProductPriceMatrixResponse> => {
    try {
      const response = await api.get(`/products/${id}/prices`);
      return response.data;
    } catch (error) {
      console.error("Matrix gətirəndə xəta:", error);
      throw error;
    }
  },
};
