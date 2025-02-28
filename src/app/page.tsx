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
import { startOfDay, addDays, differenceInHours } from "date-fns";
import SchedulingCard from "@/components/card/schedulingCard";

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
        setScheduledOrders,
        scheduledOrders,
        unscheduledOrders,
        loadDummyOrders,
        isLoading,
        error,
        selectedOrder,
        selectOrder,
        clearSelectedOrder,
        scheduleOrder,
        unscheduleOrder,
        moveAllToScheduled,
        moveAllToUnscheduled,
    } = useOrderStore();
    const [isOrdersOpen, setIsOrdersOpen] = useState(true);
    const [scale, setScale] = useState(50);
    const [columnWidth, setColumnWidth] = useState(0);
    const [columnCount, setColumnCount] = useState(0);
    const [showScheduled, setShowScheduled] = useState(true);

    useEffect(() => {
        loadDummyOrders(3);
    }, [loadDummyOrders]);

    // Timeline dates (you might want to make these dynamic based on your needs)
    const timelineStartDate = startOfDay(new Date());
    const timelineEndDate = addDays(timelineStartDate, 5);

    // Handle column width changes from TimelineGrid
    const handleColumnWidthChange = (width: number, count: number) => {
        setColumnWidth(width);
        setColumnCount(count);
    };

    // Calculate visible time range based on scale
    const getVisibleTimeRange = () => {
        if (scale < 33) {
            // Hour view: 24 to 48 hours
            const totalHours = Math.floor(24 * (1 + scale / 33));
            return addDays(timelineStartDate, Math.ceil(totalHours / 24));
        } else if (scale < 66) {
            // Day view: 3 to 14 days
            const minDays = 3;
            const maxDays = 14;
            const normalizedScale = (scale - 33) / 33;
            const days = Math.floor(
                minDays + (maxDays - minDays) * normalizedScale
            );
            return addDays(timelineStartDate, days);
        } else {
            // Month view: up to 30 days
            const days = Math.floor(30 * (scale / 100));
            return addDays(timelineStartDate, days);
        }
    };

    const visibleEndDate = getVisibleTimeRange();

    // Sort orders by start date
    const sortedScheduledOrders = [...scheduledOrders].sort(
        (a, b) =>
            new Date(a.planned_start_time).getTime() -
            new Date(b.planned_start_time).getTime()
    );

    // Handle scheduling/unscheduling an order
    const handleOrderCardClick = (
        orderNumber: string,
        isScheduled: boolean
    ) => {
        if (selectedOrder?.order_number === orderNumber) {
            clearSelectedOrder();
        } else {
            selectOrder(orderNumber);

            // If the order is already in the desired state, don't change it
            if (isScheduled) {
                const isAlreadyScheduled = scheduledOrders.some(
                    (order) => order.order_number === orderNumber
                );
                if (!isAlreadyScheduled) {
                    scheduleOrder(orderNumber);
                }
            } else {
                const isAlreadyUnscheduled = unscheduledOrders.some(
                    (order) => order.order_number === orderNumber
                );
                if (!isAlreadyUnscheduled) {
                    unscheduleOrder(orderNumber);
                }
            }
        }
    };

    // DEBUG

    useEffect(() => {
        console.log("scheduledOrders:", scheduledOrders);
        console.log("unscheduledOrders:", unscheduledOrders);

        setScheduledOrders(unscheduledOrders);
    }, [unscheduledOrders]);

    const handleSchedule = () => {
        // only if an order is selected s
        console.log("clicked");
        // get the selected order

        // move selected order to scheduledOrders
    };

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
                                        <span className="w-2 h-2m bg-green-600 rounded-full"></span>
                                        <span className="text-sm">Active</span>
                                    </span>
                                </div>
                            </div>

                            <div
                                className="flex flex-col"
                                style={{
                                    width: isOrdersOpen
                                        ? "calc(100% - 400px)"
                                        : "100%",
                                    transition: "width 300ms ease-in-out",
                                }}
                            >
                                <div className="h-[60px] flex flex-row justify-end items-center overflow pr-10 ">
                                    <div
                                        className="h-[10px] w-[100px] bg-blue-600 p-5 flex flex-row justify-center items-center text-white rounded-xl shadow-lg hover:bg-green-500"
                                        onClick={() => {
                                            console.log("clicked");
                                        }}
                                    >
                                        Schedule
                                    </div>
                                </div>

                                {/* Timeline Container */}
                                <div className="h-[500px] bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                    {" "}
                                    <TimelineGrid
                                        gridGrain="hour"
                                        onScaleChange={setScale}
                                        onColumnWidthChange={
                                            handleColumnWidthChange
                                        }
                                    />
                                </div>
                            </div>

                            {/* Container Below Timeline */}
                            <div
                                className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto"
                                style={{
                                    width: isOrdersOpen
                                        ? "calc(100% - 400px)"
                                        : "100%",
                                    transition: "width 300ms ease-in-out",
                                }}
                            >
                                {/* Scheduling Cards Container */}
                                <div className="relative h-[400px] py-6 w-[1299px]">
                                    <div className="absolute left-8 right-8">
                                        {unscheduledOrders.map(
                                            (order, index) => (
                                                <SchedulingCard
                                                    key={order.order_number}
                                                    order={order}
                                                    index={index}
                                                    verticalIndex={index}
                                                />
                                            )
                                        )}
                                    </div>
                                </div>
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
                                    MY ORDERS
                                </h2>
                                <div className="flex items-center gap-2">
                                    <div className="flex rounded-md overflow-hidden border border-gray-200">
                                        <button
                                            onClick={() =>
                                                setShowScheduled(true)
                                            }
                                            className={`px-3 py-1 text-xs ${
                                                showScheduled
                                                    ? "bg-blue-500 text-white"
                                                    : "bg-gray-100 text-gray-600"
                                            }`}
                                        >
                                            Scheduled
                                        </button>
                                        <button
                                            onClick={() =>
                                                setShowScheduled(false)
                                            }
                                            className={`px-3 py-1 text-xs ${
                                                !showScheduled
                                                    ? "bg-blue-500 text-white"
                                                    : "bg-gray-100 text-gray-600"
                                            }`}
                                        >
                                            Unscheduled
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => setIsOrdersOpen(false)}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                        aria-label="Close orders panel"
                                    >
                                        <Menu className="h-6 w-6 text-gray-600" />
                                    </button>
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex justify-between mb-4">
                                {showScheduled ? (
                                    <button
                                        onClick={moveAllToUnscheduled}
                                        className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-600"
                                    >
                                        Unschedule All
                                    </button>
                                ) : (
                                    <button
                                        onClick={moveAllToScheduled}
                                        className="text-xs px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded text-white"
                                    >
                                        Schedule All
                                    </button>
                                )}
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
                                <div className="space-y-4 pb-24">
                                    {(showScheduled
                                        ? scheduledOrders
                                        : unscheduledOrders
                                    ).map((order) => (
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
                                                handleOrderCardClick(
                                                    order.order_number,
                                                    showScheduled
                                                );
                                            }}
                                        />
                                    ))}

                                    {(showScheduled
                                        ? scheduledOrders
                                        : unscheduledOrders
                                    ).length === 0 && (
                                        <div className="text-center py-8 text-gray-500">
                                            No{" "}
                                            {showScheduled
                                                ? "scheduled"
                                                : "unscheduled"}{" "}
                                            orders
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="h-[100px] bg-red-500"></div>
                </main>
            </div>
        </div>
    );
}
