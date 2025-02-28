import { create } from "zustand";
import { WorkCenterOrder } from "@/lib/orderData/types";
import { generateDummyWorkCenterOrders } from "@/lib/orderData/mockData";

interface OrderStore {
    // State
    orders: WorkCenterOrder[];
    scheduledOrders: WorkCenterOrder[];
    unscheduledOrders: WorkCenterOrder[];
    selectedOrder: WorkCenterOrder | null;
    isLoading: boolean;
    error: string | null;
    conversionPixels: number;
    timelineStartDate: Date;
    leftOffset: number;

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

    setConversionPixels: (pixels: number) => void;
    setLeftOffset: (offset: number) => void;
    setTimelineStartDate: (date: Date) => void;

    scheduleOrder: (orderNumber: string) => void;
    unscheduleOrder: (orderNumber: string) => void;
    moveAllToScheduled: () => void;
    moveAllToUnscheduled: () => void;
    setScheduledOrders: (orders: WorkCenterOrder[]) => void;
    setUnscheduledOrders: (orders: WorkCenterOrder[]) => void;
}

export const useOrderStore = create<OrderStore>((set) => ({
    // Initial state
    orders: [],
    scheduledOrders: [],
    unscheduledOrders: [],
    selectedOrder: null,
    isLoading: false,
    error: null,
    conversionPixels: 0,
    leftOffset: 0,
    timelineStartDate: new Date(),

    // Actions
    setOrders: (orders: WorkCenterOrder[]) =>
        set({
            orders,
            // By default, all orders are unscheduled when first loaded
            unscheduledOrders: orders,
            scheduledOrders: [],
        }),

    setConversionPixels: (pixels: number) => set({ conversionPixels: pixels }),
    setLeftOffset: (offset: number) => set({ leftOffset: offset }),
    setTimelineStartDate: (date: Date) => set({ timelineStartDate: date }),
    setScheduledOrders: (orders: WorkCenterOrder[]) =>
        set({ scheduledOrders: orders }),
    setUnscheduledOrders: (orders: WorkCenterOrder[]) =>
        set({ unscheduledOrders: orders }),

    addOrder: (order: WorkCenterOrder) =>
        set((state) => ({
            orders: [...state.orders, order],
            unscheduledOrders: [...state.unscheduledOrders, order],
        })),

    removeOrder: (orderNumber: string) =>
        set((state) => {
            const filteredOrders = state.orders.filter(
                (order) => order.order_number !== orderNumber
            );
            const filteredScheduled = state.scheduledOrders.filter(
                (order) => order.order_number !== orderNumber
            );
            const filteredUnscheduled = state.unscheduledOrders.filter(
                (order) => order.order_number !== orderNumber
            );

            return {
                orders: filteredOrders,
                scheduledOrders: filteredScheduled,
                unscheduledOrders: filteredUnscheduled,
                selectedOrder:
                    state.selectedOrder?.order_number === orderNumber
                        ? null
                        : state.selectedOrder,
            };
        }),

    updateOrder: (
        orderNumber: string,
        updatedOrder: Partial<WorkCenterOrder>
    ) =>
        set((state) => {
            const updatedOrders = state.orders.map((order) =>
                order.order_number === orderNumber
                    ? { ...order, ...updatedOrder }
                    : order
            );

            const updatedScheduled = state.scheduledOrders.map((order) =>
                order.order_number === orderNumber
                    ? { ...order, ...updatedOrder }
                    : order
            );

            const updatedUnscheduled = state.unscheduledOrders.map((order) =>
                order.order_number === orderNumber
                    ? { ...order, ...updatedOrder }
                    : order
            );

            return {
                orders: updatedOrders,
                scheduledOrders: updatedScheduled,
                unscheduledOrders: updatedUnscheduled,
                selectedOrder:
                    state.selectedOrder?.order_number === orderNumber
                        ? { ...state.selectedOrder, ...updatedOrder }
                        : state.selectedOrder,
            };
        }),

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
            set({
                orders: dummyOrders,
                unscheduledOrders: dummyOrders,
                scheduledOrders: [],
                isLoading: false,
            });
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

    // Scheduled/Unscheduled Order Actions
    scheduleOrder: (orderNumber: string) =>
        set((state) => {
            const orderToSchedule = state.unscheduledOrders.find(
                (order) => order.order_number === orderNumber
            );

            if (!orderToSchedule) return state;

            const newUnscheduled = state.unscheduledOrders.filter(
                (order) => order.order_number !== orderNumber
            );

            return {
                scheduledOrders: [...state.scheduledOrders, orderToSchedule],
                unscheduledOrders: newUnscheduled,
            };
        }),

    unscheduleOrder: (orderNumber: string) =>
        set((state) => {
            const orderToUnschedule = state.scheduledOrders.find(
                (order) => order.order_number === orderNumber
            );

            if (!orderToUnschedule) return state;

            const newScheduled = state.scheduledOrders.filter(
                (order) => order.order_number !== orderNumber
            );

            return {
                unscheduledOrders: [
                    ...state.unscheduledOrders,
                    orderToUnschedule,
                ],
                scheduledOrders: newScheduled,
            };
        }),

    moveAllToScheduled: () =>
        set((state) => ({
            scheduledOrders: [
                ...state.scheduledOrders,
                ...state.unscheduledOrders,
            ],
            unscheduledOrders: [],
        })),

    moveAllToUnscheduled: () =>
        set((state) => ({
            unscheduledOrders: [
                ...state.unscheduledOrders,
                ...state.scheduledOrders,
            ],
            scheduledOrders: [],
        })),
}));
