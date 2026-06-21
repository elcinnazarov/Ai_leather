// src/store/useOrderStore.ts
import { create } from 'zustand';
import { OrderSummaryResponse, OrderDetailResponse, PageResponse } from '../types/order';
import { OrderStatus } from '../types/order';

interface OrderState {
  // List state
  orders: OrderSummaryResponse[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  isLast: boolean;
  
  // Detail state
  currentOrder: OrderDetailResponse | null;
  
  // Loading states
  loadingList: boolean;
  loadingDetail: boolean;
  creating: boolean;
  cancelling: boolean;
  
  // Error states
  listError: string | null;
  detailError: string | null;
  
  // Actions
  setOrders: (page: PageResponse<OrderSummaryResponse>) => void;
  appendOrders: (page: PageResponse<OrderSummaryResponse>) => void;
  setCurrentOrder: (order: OrderDetailResponse | null) => void;
  updateOrderStatus: (orderId: number, status: OrderStatus) => void;
  setLoadingList: (loading: boolean) => void;
  setLoadingDetail: (loading: boolean) => void;
  setCreating: (creating: boolean) => void;
  setCancelling: (cancelling: boolean) => void;
  setListError: (error: string | null) => void;
  setDetailError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  orders: [],
  pageNumber: 0,
  pageSize: 10,
  totalElements: 0,
  totalPages: 0,
  isLast: true,
  currentOrder: null,
  loadingList: false,
  loadingDetail: false,
  creating: false,
  cancelling: false,
  listError: null,
  detailError: null,
};

export const useOrderStore = create<OrderState>((set) => ({
  ...initialState,

  setOrders: (page) => set({
    orders: page.content,
    pageNumber: page.pageNumber,
    pageSize: page.pageSize,
    totalElements: page.totalElements,
    totalPages: page.totalPages,
    isLast: page.last,
    listError: null,
  }),

  appendOrders: (page) => set((state) => ({
    orders: [...state.orders, ...page.content],
    pageNumber: page.pageNumber,
    pageSize: page.pageSize,
    totalElements: page.totalElements,
    totalPages: page.totalPages,
    isLast: page.last,
    listError: null,
  })),

  setCurrentOrder: (order) => set({ currentOrder: order, detailError: null }),

  updateOrderStatus: (orderId, status) => set((state) => ({
    orders: state.orders.map(o => 
      o.orderId === orderId ? { ...o, status } : o
    ),
    currentOrder: state.currentOrder?.orderId === orderId 
      ? { ...state.currentOrder, status } 
      : state.currentOrder,
  })),

  setLoadingList: (loading) => set({ loadingList: loading }),
  setLoadingDetail: (loading) => set({ loadingDetail: loading }),
  setCreating: (creating) => set({ creating }),
  setCancelling: (cancelling) => set({ cancelling }),
  setListError: (error) => set({ listError: error }),
  setDetailError: (error) => set({ detailError: error }),
  reset: () => set(initialState),
}));