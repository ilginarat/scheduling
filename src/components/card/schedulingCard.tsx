import React from "react";
import { differenceInMinutes } from "date-fns";

interface SchedulingCardProps {
    name: string;
    confirmedQuantity: number;
    targetQuantity: number;
    startDate: Date;
    endDate: Date;
    isSelected?: boolean;
    onSelect?: () => void;
    style?: React.CSSProperties;
}

const SchedulingCard: React.FC<SchedulingCardProps> = ({
    name,
    confirmedQuantity,
    targetQuantity,
    startDate,
    endDate,
    isSelected,
    onSelect,
    style,
}) => {
    // Calculate progress percentage
    const progressPercentage = (confirmedQuantity / targetQuantity) * 100;

    return (
        <div
            className={`h-10 w-[200px] absolute rounded transition-colors cursor-pointer overflow-hidden border-r border-gray-200
                ${
                    isSelected
                        ? "ring-2 ring-blue-600 shadow-md"
                        : "hover:ring-2 hover:ring-blue-400"
                }`}
            style={style}
            onClick={onSelect}
        >
            {/* Progress Bar Background */}
            <div className="absolute inset-0 bg-green-100" />

            {/* Progress Bar */}
            <div
                className="absolute inset-y-0 left-0 bg-green-500 opacity-30"
                style={{ width: `${progressPercentage}%` }}
            />

            {/* Content */}
            <div className="relative h-full px-2 flex items-center justify-between">
                <div
                    className="font-medium text-sm truncate flex-1"
                    title={name}
                >
                    {name}
                </div>
                <div className="text-xs text-gray-600 whitespace-nowrap ml-2">
                    {confirmedQuantity}/{targetQuantity}
                </div>
            </div>
        </div>
    );
};

export default SchedulingCard;
