import Image from "next/image";
import OrderCard from "@/components/card/orderCard";
import { generateDummyWorkCenterOrders } from "@/lib/orderData/mockData";
import { WorkCenterOrder } from "@/lib/orderData/types";

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
        ordNum: order.target_quantity,
        materialNumber: order.material_number,
    };
};

export default function Home() {
    // Generate three dummy cards using our utility function
    const dummyCards = generateDummyWorkCenterOrders(3);

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Left side - can be used for other content */}
            <div className="w-3/4">{/* Left side content */}</div>

            {/* Right side - Cards on white board */}
            <div className="w-1/4 bg-white shadow-lg py-8 px-2 overflow-y-auto">
                <div className="space-y-4">
                    {dummyCards.map((card: WorkCenterOrder, index: number) => (
                        <OrderCard
                            key={index}
                            {...mapWorkCenterOrderToCardProps(card)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
