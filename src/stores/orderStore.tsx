import { create } from "zustand";
import { StateCreator } from "zustand";
import { WorkCenterOrder } from "@/lib/orderData/types";
import { generateDummyWorkCenterOrders } from "@/lib/orderData/mockData";

interface OrderStore {
    // State
    orders: WorkCenterOrder[];
    selectedOrder: WorkCenterOrder | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    setOrders: (orders: WorkCenterOrder[]) => void;
    addOrder: (order: WorkCenterOrder) => void;
    removeOrder: (orderNumber: string) => void;
    updateOrder: (
        orderNumber: string,
        updatedOrder: Partial<WorkCenterOrder>
    ) => void;
    selectOrder: (orderNumber: string) => void;
    clearSelectedOrder: () => void;
    loadDummyOrders: (count: number) => void;
    setError: (error: string | null) => void;
    setLoading: (isLoading: boolean) => void;
}

export const useOrderStore = create<OrderStore>(
    (
        set: (fn: (state: OrderStore) => Partial<OrderStore>) => void,
        get: () => OrderStore
    ) => ({
        // Initial state
        orders: [],
        selectedOrder: null,
        isLoading: false,
        error: null,

        // Actions
        setOrders: (orders: WorkCenterOrder[]) => set({ orders }),

        addOrder: (order: WorkCenterOrder) =>
            set((state) => ({
                orders: [...state.orders, order],
            })),

        removeOrder: (orderNumber: string) =>
            set((state) => ({
                orders: state.orders.filter(
                    (order) => order.order_number !== orderNumber
                ),
                selectedOrder:
                    state.selectedOrder?.order_number === orderNumber
                        ? null
                        : state.selectedOrder,
            })),

        updateOrder: (
            orderNumber: string,
            updatedOrder: Partial<WorkCenterOrder>
        ) =>
            set((state) => ({
                orders: state.orders.map((order) =>
                    order.order_number === orderNumber
                        ? { ...order, ...updatedOrder }
                        : order
                ),
                selectedOrder:
                    state.selectedOrder?.order_number === orderNumber
                        ? { ...state.selectedOrder, ...updatedOrder }
                        : state.selectedOrder,
            })),

        selectOrder: (orderNumber: string) =>
            set((state) => ({
                selectedOrder:
                    state.orders.find(
                        (order) => order.order_number === orderNumber
                    ) || null,
            })),

        clearSelectedOrder: () => set({ selectedOrder: null }),

        loadDummyOrders: (count: number) => {
            set({ isLoading: true, error: null });
            try {
                const dummyOrders = generateDummyWorkCenterOrders(count);
                set({ orders: dummyOrders, isLoading: false });
            } catch (error) {
                set({
                    error:
                        error instanceof Error
                            ? error.message
                            : "Failed to load dummy orders",
                    isLoading: false,
                });
            }
        },

        setError: (error: string | null) => set({ error }),

        setLoading: (isLoading: boolean) => set({ isLoading }),
    })
);
