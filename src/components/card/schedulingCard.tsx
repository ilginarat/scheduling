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
    return (
        <div
            className={`h-[83px] w-[200px] absolute bg-white border border-gray-200 rounded-md cursor-pointer overflow-hidden flex flex-col
                ${
                    isSelected
                        ? "ring-2 ring-blue-600"
                        : "hover:ring-1 hover:ring-gray-300"
                }`}
            style={style}
            onClick={onSelect}
        >
            {/* Gray line at the top */}
            <div className="h-[83px] w-full bg-gray-500 border-b border-gray-500" />

            {/* Progress indicator bar */}
            <div className="h-[4px] w-full relative">
                <div
                    className="h-full bg-green-500"
                    style={{
                        width: `${(confirmedQuantity / targetQuantity) * 100}%`,
                    }}
                />
                <div
                    className="absolute top-0 right-0 h-full bg-blue-500"
                    style={{
                        width: `${
                            ((targetQuantity - confirmedQuantity) /
                                targetQuantity) *
                            100
                        }%`,
                    }}
                />
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col gap-1">
                <div className="font-semibold text-sm truncate">{name}</div>
                <div className="text-sm text-gray-600">
                    {targetQuantity} pcs
                </div>
            </div>
        </div>
    );
};

export default SchedulingCard;
