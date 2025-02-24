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
    const durationInMinutes = differenceInMinutes(endDate, startDate);
    const cardWidth = Math.max(durationInMinutes, 200); // Minimum width of 200px

    return (
        <div
            className={`flex flex-col h-[83px] bg-white border  cursor-pointer
                ${
                    isSelected
                        ? "ring-2 ring-blue-600"
                        : "hover:ring-1 hover:ring-gray-300"
                }`}
            style={{ width: `${cardWidth}px` }}
            onClick={onSelect}
        >
            {/* Progress bar - 9px height with rounded corners */}
            <div className="h-[9px] w-full  bg-gray-200">
                {confirmedQuantity > 0 && (
                    <>
                        <div
                            className="h-full  bg-gray-200"
                            style={{
                                width: `${
                                    (confirmedQuantity / targetQuantity) * 100
                                }%`,
                            }}
                        />
                        {/* <div
                            className="absolute top-0 right-0 h-full rounded-md bg-blue-500"
                            style={{
                                width: `${
                                    ((targetQuantity - confirmedQuantity) /
                                        targetQuantity) *
                                    100
                                }%`,
                            }}
                        /> */}
                    </>
                )}
            </div>

            {/* Content container - centers text */}
            <div className="flex-1 flex items-start justify-start p-4">
                <span className="text-gray-900 font-medium">{name}</span>
            </div>
        </div>
    );
};

export default SchedulingCard;
