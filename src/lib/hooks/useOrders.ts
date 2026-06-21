// src/hooks/useOrders.ts
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { orderService } from '../../services/orderService';        // ✅ ../../ (2 qovluq yuxarı)
import { useOrderStore } from '../../store/useOrderStore';          // ✅ ../../
import { useCartStore } from '../../store/useCartStore';  
          // ✅ ../../
import { CreateOrderRequest, OrderFilter, OrderStatus } from '../../types/order'; // ✅ ../../
export const useOrders = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const store = useOrderStore();
  const clearCart = useCartStore((s) => s.clearCart);

  // ============ CREATE ORDER ============
  const createOrder = useCallback(async (request: CreateOrderRequest) => {
    store.setCreating(true);
    try {
      const response = await orderService.createOrder(request);
      toast.success(t('orders.createSuccess', 'Sifariş uğurla yaradıldı'));
      clearCart();
      navigate(`/profile/orders/${response.orderId}`);
      return response;
    } catch (error: any) {
      const msg = error?.response?.data?.message || t('orders.createError', 'Sifariş yaradılarkən xəta');
      toast.error(msg);
      throw error;
    } finally {
      store.setCreating(false);
    }
  }, [navigate, t, clearCart, store]);

  // ============ FETCH MY ORDERS ============
  const fetchMyOrders = useCallback(async (page = 0, size = 10, filter?: OrderFilter, append = false) => {
    store.setLoadingList(true);
    store.setListError(null);
    try {
      const data = await orderService.getMyOrders(page, size);
      if (append) {
        store.appendOrders(data);
      } else {
        store.setOrders(data);
      }
      return data;
    } catch (error: any) {
      store.setListError(error?.response?.data?.message || t('orders.fetchError', 'Sifarişlər yüklənərkən xəta'));
      throw error;
    } finally {
      store.setLoadingList(false);
    }
  }, [store, t]);

  // ============ FETCH ORDER DETAIL ============
  const fetchOrderDetail = useCallback(async (id: number) => {
    store.setLoadingDetail(true);
    store.setDetailError(null);
    try {
      const data = await orderService.getMyOrderDetail(id);
      store.setCurrentOrder(data);
      return data;
    } catch (error: any) {
      store.setDetailError(error?.response?.data?.message || t('orders.detailError', 'Sifariş detalı yüklənərkən xəta'));
      throw error;
    } finally {
      store.setLoadingDetail(false);
    }
  }, [store, t]);

  // ============ CANCEL ORDER ============
  const cancelOrder = useCallback(async (id: number) => {
    store.setCancelling(true);
    try {
      const response = await orderService.cancelOrder(id);
      store.updateOrderStatus(id, OrderStatus.CANCELLED);
      toast.success(t('orders.cancelSuccess', 'Sifariş ləğv edildi'));
      return response;
    } catch (error: any) {
      const msg = error?.response?.data?.message || t('orders.cancelError', 'Ləğv edərkən xəta');
      toast.error(msg);
      throw error;
    } finally {
      store.setCancelling(false);
    }
  }, [store, t]);

  // ============ LOAD MORE ============
  const loadMore = useCallback(async (size = 10) => {
    if (store.isLast || store.loadingList) return;
    await fetchMyOrders(store.pageNumber + 1, size, undefined, true);
  }, [store, fetchMyOrders]);

  return {
    // State
    orders: store.orders,
    currentOrder: store.currentOrder,
    loadingList: store.loadingList,
    loadingDetail: store.loadingDetail,
    creating: store.creating,
    cancelling: store.cancelling,
    listError: store.listError,
    detailError: store.detailError,
    isLast: store.isLast,
    totalElements: store.totalElements,
    
    // Actions
    createOrder,
    fetchMyOrders,
    fetchOrderDetail,
    cancelOrder,
    loadMore,
    reset: store.reset,
  };
};