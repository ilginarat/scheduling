"use client";

import OrderCard from "@/components/card/orderCard";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { useOrderStore } from "@/stores/orderStore";
import { useEffect, useState } from "react";
import { WorkCenterOrder } from "@/lib/orderData/types";
import { Menu } from "lucide-react";
import Link from "next/link";
import OrderCards from "@/components/card/cards";
import TimelineGrid from "@/components/timeline/TimelineGrid";
import { startOfDay, addDays } from "date-fns";

const mapWorkCenterOrderToCardProps = (order: WorkCenterOrder) => {
    return {
        name: order.order_number,
        orderStatus: order.order_status,
        timeLeft: "2h 30m", // This would need actual calculation based on times
        operationCounter: `${order.operation_counter}/${order.parent_operation_counter}`,
        ifPRT: order.production_resource_tool_check,
        componentCheck: order.component_check,
        demandCheck: order.demand_check,
        startDate: new Date(order.planned_start_time),
        endDate: new Date(order.planned_end_time),
        updatedStartDate: new Date(order.updated_start_time),
        updatedEndDate: new Date(order.updated_end_time),
        actualStartDate: order.actual_start_time
            ? new Date(order.actual_start_time)
            : undefined,
        actualEndDate: order.actual_end_time
            ? new Date(order.actual_end_time)
            : undefined,
        ordNum: order.target_quantity,
        materialNumber: order.material_number,
        targetQuantity: order.target_quantity,
        confirmedQuantity: order.confirmed_quantity,
    };
};

export default function Home() {
    const {
        orders,
        loadDummyOrders,
        isLoading,
        error,
        selectedOrder,
        selectOrder,
        clearSelectedOrder,
    } = useOrderStore();
    const [isOrdersOpen, setIsOrdersOpen] = useState(true);
    const [gridGrain, setGridGrain] = useState<"hour" | "halfDay" | "day">(
        "hour"
    );

    useEffect(() => {
        loadDummyOrders(3);
    }, [loadDummyOrders]);

    // Timeline dates (you might want to make these dynamic based on your needs)
    const timelineStartDate = startOfDay(new Date());
    const timelineEndDate = addDays(timelineStartDate, 5);

    return (
        <div className="flex flex-col h-screen">
            <Header />
            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 bg-gray-100">
                    <div className="flex h-full relative">
                        {/* Main Content Area */}
                        <div className="flex-1 p-6 flex flex-col">
                            <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
                                <Link href="/" className="hover:text-gray-700">
                                    Home
                                </Link>
                                <span>/</span>
                                <Link
                                    href="/materials"
                                    className="hover:text-gray-700"
                                >
                                    My Materials
                                </Link>
                                <span>/</span>
                                <span className="text-gray-900">
                                    Machine Scheduling
                                </span>
                            </nav>

                            {/* Machine Info */}
                            <div className="mb-6">
                                <h1 className="text-2xl font-semibold mb-2">
                                    LINE2-MILL-02
                                </h1>
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center gap-1">
                                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                        <span className="text-sm">Active</span>
                                    </span>
                                </div>
                            </div>

                            {/* Timeline Container */}
                            <div
                                className="h-[500px] bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                                style={{
                                    width: isOrdersOpen
                                        ? "calc(100% - 400px)"
                                        : "100%",
                                    transition: "width 300ms ease-in-out",
                                }}
                            >
                                <TimelineGrid gridGrain="hour" />
                            </div>

                            {/* Container Below Timeline */}
                            <div
                                className="mt-6 h-[250px] bg-white rounded-lg shadow-sm border border-gray-200"
                                style={{
                                    width: isOrdersOpen
                                        ? "calc(100% - 400px)"
                                        : "100%",
                                    transition: "width 300ms ease-in-out",
                                }}
                            >
                                {/* Content for the new container will go here */}
                            </div>
                        </div>

                        {/* Toggle Button (visible when panel is closed) */}
                        {!isOrdersOpen && (
                            <button
                                onClick={() => setIsOrdersOpen(true)}
                                className="fixed right-6 top-20 p-2 bg-white hover:bg-gray-100 rounded-lg transition-colors shadow-md z-50"
                                aria-label="Open orders panel"
                            >
                                <Menu className="h-6 w-6 text-gray-600" />
                            </button>
                        )}

                        {/* Right Side - Order Cards */}
                        <div
                            className={`fixed right-0 top-12 bottom-0 w-[400px] bg-white shadow-xl py-6 px-4 overflow-y-auto transition-transform duration-300 ease-in-out z-40 ${
                                isOrdersOpen
                                    ? "translate-x-0"
                                    : "translate-x-full"
                            }`}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-gray-500 font-semibold">
                                    MY SCHEDULED ORDERS
                                </h2>
                                <button
                                    onClick={() => setIsOrdersOpen(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    aria-label="Close orders panel"
                                >
                                    <Menu className="h-6 w-6 text-gray-600" />
                                </button>
                            </div>
                            {isLoading ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-gray-500">
                                        Loading...
                                    </div>
                                </div>
                            ) : error ? (
                                <div className="text-red-500 p-4">{error}</div>
                            ) : (
                                <div className="space-y-4">
                                    {orders.map((order) => (
                                        <OrderCard
                                            key={order.order_number}
                                            {...mapWorkCenterOrderToCardProps(
                                                order
                                            )}
                                            isSelected={
                                                selectedOrder?.order_number ===
                                                order.order_number
                                            }
                                            onSelect={() => {
                                                if (
                                                    selectedOrder?.order_number ===
                                                    order.order_number
                                                ) {
                                                    clearSelectedOrder();
                                                } else {
                                                    selectOrder(
                                                        order.order_number
                                                    );
                                                }
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
