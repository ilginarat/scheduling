import React from "react";
import { format, differenceInMinutes } from "date-fns";
import { CheckCircle, XCircle } from "lucide-react";

interface TimeDisplayResult {
    shouldStrikethrough: boolean;
    strikethroughTime: string | null;
    displayTime: string;
    timeDate: Date; // Add actual Date object for time difference calculation
}

function formatTimeDifference(minutes: number): string {
    const days = Math.floor(minutes / (24 * 60));
    const remainingMinutesAfterDays = minutes % (24 * 60);
    const hours = Math.floor(remainingMinutesAfterDays / 60);
    const remainingMinutes = remainingMinutesAfterDays % 60;

    if (days > 0) {
        return `${days}d ${hours}h ${remainingMinutes}m`;
    }
    return `${hours}h ${remainingMinutes}m`;
}

function calculateTimeDisplay(
    plannedTime: Date,
    updatedTime?: Date,
    actualTime?: Date
): TimeDisplayResult {
    // If in production (actual time exists)
    if (actualTime) {
        // If updated time exists, compare with actual
        if (updatedTime) {
            if (updatedTime.getTime() === actualTime.getTime()) {
                // Updated matches actual, show only actual
                return {
                    shouldStrikethrough: false,
                    strikethroughTime: null,
                    displayTime: format(actualTime, "HH:mm"),
                    timeDate: actualTime,
                };
            } else {
                // Updated doesn't match actual, show updated strikethrough and actual
                return {
                    shouldStrikethrough: true,
                    strikethroughTime: format(updatedTime, "HH:mm"),
                    displayTime: format(actualTime, "HH:mm"),
                    timeDate: actualTime,
                };
            }
        }
        // No updated time, show planned strikethrough and actual
        return {
            shouldStrikethrough: true,
            strikethroughTime: format(plannedTime, "HH:mm"),
            displayTime: format(actualTime, "HH:mm"),
            timeDate: actualTime,
        };
    }

    // Not in production (no actual time)
    if (updatedTime && updatedTime.getTime() !== plannedTime.getTime()) {
        // Updated exists and differs from planned
        return {
            shouldStrikethrough: true,
            strikethroughTime: format(plannedTime, "HH:mm"),
            displayTime: format(updatedTime, "HH:mm"),
            timeDate: updatedTime,
        };
    }

    // Default case: show planned time normally
    return {
        shouldStrikethrough: false,
        strikethroughTime: null,
        displayTime: format(plannedTime, "HH:mm"),
        timeDate: plannedTime,
    };
}

interface OrderCardProps {
    name: string;
    orderStatus: string;
    timeLeft: string;
    operationCounter: string;
    ifPRT: boolean;
    componentCheck: boolean;
    demandCheck: boolean;
    startDate: Date; // planned start
    endDate: Date; // planned end
    updatedStartDate?: Date;
    updatedEndDate?: Date;
    actualStartDate?: Date;
    actualEndDate?: Date;
    ordNum: number;
    materialNumber: string;
    targetQuantity: number;
    confirmedQuantity: number;
    isSelected?: boolean;
    onSelect?: () => void;
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
    updatedStartDate,
    updatedEndDate,
    actualStartDate,
    actualEndDate,
    ordNum,
    materialNumber,
    targetQuantity,
    confirmedQuantity,
    isSelected,
    onSelect,
}) => {
    // Calculate progress percentage
    const progressPercentage = (confirmedQuantity / targetQuantity) * 100;

    // Determine status based on confirmed quantity
    const getStatus = () => {
        if (confirmedQuantity === 0) return "Released";
        if (confirmedQuantity === targetQuantity) return "Completed";
        if (confirmedQuantity > 0 && confirmedQuantity < targetQuantity)
            return "In Production";
    };

    const status = getStatus();

    return (
        <div
            className={`bg-white rounded-lg shadow-sm border transition-colors cursor-pointer ${
                isSelected
                    ? "border-blue-800 shadow-md"
                    : "border-gray-200 hover:border-blue-400"
            } overflow-hidden`}
            onClick={onSelect}
        >
            {/* Progress Bar */}
            <div className="h-1 w-full bg-blue-800 flex">
                <div
                    className="h-full bg-green-600"
                    style={{ width: `${progressPercentage}%` }}
                />
            </div>

            {/* Header Section */}
            <div
                className={`p-3 ${
                    isSelected
                        ? status === "Released"
                            ? "bg-blue-50"
                            : "bg-green-50"
                        : "bg-gray-50"
                } transition-colors`}
            >
                <div className="flex justify-between items-start">
                    <h2
                        className={`text-lg font-bold ${
                            isSelected
                                ? status === "Released"
                                    ? "text-blue-800"
                                    : "text-green-700"
                                : ""
                        }`}
                    >
                        {name}
                    </h2>
                    <div
                        className={`px-3 py-0.5 rounded text-xs font-semibold ${
                            status === "Released"
                                ? "bg-blue-600 text-white"
                                : "bg-green-600 text-white"
                        }`}
                    >
                        {status}
                    </div>
                </div>
                <div className="flex items-center mt-0.5 text-xs">
                    <div className="text-gray-500">
                        <span className="text-green-600 font-semibold">
                            {confirmedQuantity}
                        </span>
                        <span className="font-semibold">/</span>
                        <span>{targetQuantity}</span>
                        <span> Pcs</span>
                    </div>
                    <div className="text-gray-500 ml-6">{materialNumber}</div>
                </div>
            </div>

            {/* Time Section */}
            <div className="p-3 border-t border-b border-gray-200">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4 flex-1">
                        {(() => {
                            const startResult = calculateTimeDisplay(
                                startDate,
                                updatedStartDate,
                                actualStartDate
                            );
                            const endResult = calculateTimeDisplay(
                                endDate,
                                updatedEndDate,
                                actualEndDate
                            );
                            const timeDiff = formatTimeDifference(
                                differenceInMinutes(
                                    endResult.timeDate,
                                    startResult.timeDate
                                )
                            );
                            return (
                                <>
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2 min-w-[80px]">
                                                    {startResult.shouldStrikethrough &&
                                                        startResult.strikethroughTime && (
                                                            <div className="text-base line-through text-gray-400">
                                                                {
                                                                    startResult.strikethroughTime
                                                                }
                                                            </div>
                                                        )}
                                                    <div
                                                        className={`text-base ${
                                                            startResult.shouldStrikethrough
                                                                ? "text-green-600"
                                                                : ""
                                                        }`}
                                                    >
                                                        {
                                                            startResult.displayTime
                                                        }
                                                    </div>
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {format(
                                                        startDate,
                                                        "dd/MM/yy"
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-gray-400">→</div>
                                        <div>
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2 min-w-[80px]">
                                                    {endResult.shouldStrikethrough &&
                                                        endResult.strikethroughTime && (
                                                            <div className="text-base line-through text-gray-400">
                                                                {
                                                                    endResult.strikethroughTime
                                                                }
                                                            </div>
                                                        )}
                                                    <div
                                                        className={`text-base ${
                                                            endResult.shouldStrikethrough
                                                                ? "text-green-600"
                                                                : ""
                                                        }`}
                                                    >
                                                        {endResult.displayTime}
                                                    </div>
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {format(
                                                        endDate,
                                                        "dd/MM/yy"
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end flex-1 justify-end">
                                        <div className="flex items-center">
                                            <span className="text-blue-800 font-semibold text-base">
                                                {operationCounter}
                                            </span>
                                            <span className="text-gray-500 text-sm ml-1">
                                                Operation
                                            </span>
                                        </div>
                                        <span className="text-gray-500 text-sm">
                                            {timeDiff}
                                        </span>
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </div>
            </div>

            {/* Status Section */}
            <div className="p-3 flex gap-4 items-center bg-gray-50">
                <div className="flex items-center gap-2 mr-16">
                    <div
                        className={`w-4 h-4 rounded flex items-center justify-center ${
                            ifPRT ? "bg-blue-800" : "bg-gray-200"
                        }`}
                    >
                        <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-sm text-gray-500">PRT</span>
                </div>
                <div className="flex items-center gap-2">
                    <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center ${
                            componentCheck ? "bg-green-600" : "bg-red-700"
                        }`}
                    >
                        <span className="text-white text-xs">
                            {componentCheck ? "✓" : "×"}
                        </span>
                    </div>
                    <span className="text-sm font-semibold text-blue-800">
                        Components
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center ${
                            demandCheck ? "bg-green-600" : "bg-red-700"
                        }`}
                    >
                        <span className="text-white text-xs">
                            {demandCheck ? "✓" : "×"}
                        </span>
                    </div>
                    <span className="text-sm font-semibold text-blue-800">
                        Demand
                    </span>
                </div>
            </div>
        </div>
    );
};

export default OrderCard;
