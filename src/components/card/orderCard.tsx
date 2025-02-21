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
}

const OrderCard: React.FC<OrderCardProps> = ({
    name,
    orderStatus,
    timeLeft,
    operationCounter,
    ifPRT,
    componentCheck,
    demandCheck,
    startDate,
    endDate,
    ordNum,
    materialNumber,
}) => {
    return (
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            {/* Header Section */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-xl font-bold">{name}</h2>
                    <div className="flex gap-2 text-gray-500 mt-1">
                        <span>{ordNum} Pcs</span>
                        <span>{materialNumber}</span>
                    </div>
                </div>
                <div className="border border-dashed border-gray-300 px-3 py-1 rounded">
                    <span className="text-gray-500">{orderStatus}</span>
                </div>
            </div>

            {/* Time Section */}
            <div className="flex justify-between items-center mb-4">
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
                    <span className="text-blue-600">
                        {operationCounter} Operation
                    </span>
                    <span className="text-gray-500">{timeLeft}</span>
                </div>
            </div>

            {/* Status Section */}
            <div className="flex gap-4 items-center">
                <div
                    className={`flex items-center gap-1 ${
                        ifPRT ? "text-blue-600" : "text-gray-400"
                    }`}
                >
                    {ifPRT ? <CheckCircle size={20} /> : <XCircle size={20} />}
                    <span>PRT</span>
                </div>
                <div
                    className={`flex items-center gap-1 ${
                        componentCheck ? "text-blue-600" : "text-gray-400"
                    }`}
                >
                    {componentCheck ? (
                        <CheckCircle size={20} />
                    ) : (
                        <XCircle size={20} />
                    )}
                    <span>Components</span>
                </div>
                <div
                    className={`flex items-center gap-1 ${
                        demandCheck ? "text-blue-600" : "text-gray-400"
                    }`}
                >
                    {demandCheck ? (
                        <CheckCircle size={20} />
                    ) : (
                        <XCircle size={20} />
                    )}
                    <span>Demand</span>
                </div>
            </div>
        </div>
    );
};

export default OrderCard;
