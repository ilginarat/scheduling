import React from "react";
import { useOrderStore } from "@/stores/orderStore";
import { WorkCenterOrder } from "@/lib/orderData/types";
import { calculateWidth } from "@/shared/utils";
interface SchedulingCardProps {
    order: WorkCenterOrder;
    verticalIndex: number;
    index: number;
}

const SchedulingCard: React.FC<SchedulingCardProps> = ({
    order,
    verticalIndex,
    index,
}) => {
    // Extract data from the WorkCenterOrder
    //console.log("SchedulingCard order", order);
    //console.log("SchedulingCard index", index);
    const name = order.order_number;
    const targetQuantity = order.target_quantity;
    // const confirmedQuantity = order?.confirmed_quantity;
    const startDate = new Date(order.planned_start_time);
    const endDate = new Date(order.planned_end_time);

    const { conversionPixels, selectedOrder, selectOrder } = useOrderStore();

    const width = calculateWidth(startDate, endDate, conversionPixels);

    // Calculate top position based on verticalIndex (each card is 82px tall + 16px gap)
    const topPosition = verticalIndex * (82 + 16);

    const isSelected =
        selectedOrder && selectedOrder.order_number === order.order_number;

    return (
        <div
            className={`h-[82px] absolute bg-white border border-gray-200 cursor-pointer overflow-hidden flex flex-col
                ${
                    isSelected
                        ? "ring-2 ring-blue-600"
                        : "hover:ring-1 hover:ring-gray-300"
                }`}
            style={{
                left: 0,
                top: `${topPosition}px`,
                width: `${width}px`,
            }}
            onClick={() => selectOrder(order.order_number)}
        >
            {/* Gray line at the top */}
            <div className="h-[24px] w-full bg-gray-300 border-b border-gray-300" />

            {/* Content */}
            <div className="p-4 flex flex-col gap-1">
                <div className="font-semibold text-sm truncate">{name}</div>
                <div className="text-sm text-gray-600">
                    {targetQuantity} pcs
                </div>
                <div className="text-sm text-gray-600">{index}</div>
            </div>
        </div>
    );
};

export default SchedulingCard;
