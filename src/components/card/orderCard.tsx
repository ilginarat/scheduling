import React from "react";
import { format } from "date-fns";
import { CheckCircle, XCircle } from "lucide-react";

interface OrderCardProps {
    name: string;
    orderStatus: string;
    timeLeft: string;
    operationCounter: string;
    ifPRT: boolean;
    componentCheck: boolean;
    demandCheck: boolean;
    startDate: Date;
    endDate: Date;
    ordNum: number;
    materialNumber: string;
    targetQuantity: number;
    confirmedQuantity: number;
}

const OrderCard: React.FC<OrderCardProps> = ({
    name,
    timeLeft,
    operationCounter,
    ifPRT,
    componentCheck,
    demandCheck,
    startDate,
    endDate,
    ordNum,
    materialNumber,
    targetQuantity,
    confirmedQuantity,
}) => {
    // Calculate progress percentage
    const progressPercentage = (confirmedQuantity / targetQuantity) * 100;

    // Determine status based on confirmed quantity
    const getStatus = () => {
        if (confirmedQuantity === 0) return "Released";
        if (confirmedQuantity === targetQuantity) return "Completed";
        if (confirmedQuantity > 0 && confirmedQuantity < targetQuantity)
            return "In Production";
        return "Released";
    };

    const status = getStatus();

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Progress Bar */}
            <div className="h-1.5 w-full bg-blue-700 flex">
                <div
                    className="h-full bg-green-500"
                    style={{ width: `${progressPercentage}%` }}
                />
            </div>

            {/* Header Section */}
            <div className="p-4 bg-gray-50">
                <div className="flex justify-between items-start">
                    <h2 className="text-xl font-bold">{name}</h2>
                    <div
                        className={`px-2.5 py-0.5 rounded text-xs font-semibold ${
                            confirmedQuantity >= 0
                                ? "bg-green-500 text-white"
                                : "border border-dashed border-gray-300 text-gray-500 bg-white"
                        }`}
                    >
                        {status}
                    </div>
                </div>
                <div className="flex items-center mt-1 text-sm">
                    <div className="text-gray-500">
                        <span className="text-green-600 font-semibold">
                            {confirmedQuantity}
                        </span>
                        <span className="font-semibold">/</span>
                        <span>{targetQuantity}</span>
                        <span> Pcs</span>
                    </div>
                    <div className="text-gray-500 ml-8">{materialNumber}</div>
                </div>
            </div>

            {/* Time Section */}
            <div className="p-4 border-t border-b border-gray-200">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div>
                            <div className="text-lg font-semibold">
                                {format(startDate, "HH:mm")}
                            </div>
                            <div className="text-sm text-gray-500">
                                {format(startDate, "dd/MM/yy")}
                            </div>
                        </div>
                        <div className="text-gray-400">→</div>
                        <div>
                            <div className="text-lg font-semibold">
                                {format(endDate, "HH:mm")}
                            </div>
                            <div className="text-sm text-gray-500">
                                {format(endDate, "dd/MM/yy")}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <div>
                            <span className="text-blue-700 font-semibold text-base">
                                {operationCounter}
                            </span>
                            <span className="text-gray-500 text-sm">
                                {" "}
                                Operation
                            </span>
                        </div>
                        <span className="text-gray-500 text-sm">
                            {timeLeft}
                        </span>
                    </div>
                </div>
            </div>

            {/* Status Section */}
            <div className="p-4 flex gap-6 items-center bg-gray-50">
                <div className="flex items-center gap-2 mr-8">
                    <div
                        className={`w-5 h-5 rounded flex items-center justify-center ${
                            ifPRT ? "bg-blue-700" : "bg-gray-200"
                        }`}
                    >
                        {ifPRT && <span className="text-white text-sm">✓</span>}
                    </div>
                    <span className="text-base text-gray-500">PRT</span>
                </div>
                <div className="flex items-center gap-2">
                    <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center ${
                            componentCheck ? "bg-green-500" : "bg-red-500"
                        }`}
                    >
                        <span className="text-white text-sm">
                            {componentCheck ? "✓" : "×"}
                        </span>
                    </div>
                    <span className="text-base font-semibold text-blue-700">
                        Components
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center ${
                            demandCheck ? "bg-green-500" : "bg-red-500"
                        }`}
                    >
                        <span className="text-white text-sm">
                            {demandCheck ? "✓" : "×"}
                        </span>
                    </div>
                    <span className="text-base font-semibold text-blue-700">
                        Demand
                    </span>
                </div>
            </div>
        </div>
    );
};

export default OrderCard;
