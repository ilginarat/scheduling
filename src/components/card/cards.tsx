import OrderCard from "./orderCard";
import { WorkCenterOrder } from "@/lib/orderData/types";

interface OrderCardsProps {
    orders: WorkCenterOrder[];
    selectedOrder: WorkCenterOrder | null;
    selectOrder: (orderNumber: string) => void;
    clearSelectedOrder: () => void;
}

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

export default function OrderCards({
    orders,
    selectedOrder,
    selectOrder,
    clearSelectedOrder,
}: OrderCardsProps) {
    return (
        <div className="space-y-4">
            {orders.map((order) => (
                <OrderCard
                    key={order.order_number}
                    {...mapWorkCenterOrderToCardProps(order)}
                    isSelected={
                        selectedOrder?.order_number === order.order_number
                    }
                    onSelect={() => {
                        if (
                            selectedOrder?.order_number === order.order_number
                        ) {
                            clearSelectedOrder();
                        } else {
                            selectOrder(order.order_number);
                        }
                    }}
                />
            ))}
        </div>
    );
}
