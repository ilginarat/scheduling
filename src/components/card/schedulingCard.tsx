import React from "react";
import {
    differenceInHours,
    isAfter,
    isBefore,
    startOfDay,
    addDays,
} from "date-fns";

interface SchedulingCardProps {
    name: string;
    confirmedQuantity: number;
    targetQuantity: number;
    startDate: Date;
    endDate: Date;
    isSelected?: boolean;
    onSelect?: () => void;
    timelineStartDate: Date;
    timelineEndDate: Date;
    totalWidth: number;
    verticalIndex: number;
    scale: number;
}

const SchedulingCard: React.FC<SchedulingCardProps> = ({
    name,
    confirmedQuantity,
    targetQuantity,
    startDate,
    endDate,
    isSelected,
    onSelect,
    timelineStartDate,
    timelineEndDate,
    totalWidth,
    verticalIndex,
    scale,
}) => {
    // Calculate the effective start and end dates within the visible timeline
    const effectiveStartDate = isBefore(startDate, timelineStartDate)
        ? timelineStartDate
        : startDate;
    const effectiveEndDate = isAfter(endDate, timelineEndDate)
        ? timelineEndDate
        : endDate;

    // Calculate position and width based on scale
    const calculatePosition = () => {
        // Calculate duration in hours
        const duration = differenceInHours(endDate, startDate);

        // Calculate grid cell width
        const gridCellWidth =
            totalWidth / (scale < 33 ? 24 : scale < 66 ? 14 : 30);

        // Calculate width based on duration relative to a single hour/day
        const hoursPerCell = scale < 33 ? 1 : scale < 66 ? 24 : 24;
        const cellsSpanned = duration / hoursPerCell;

        // Width is the number of cells spanned multiplied by cell width
        const width = cellsSpanned * gridCellWidth;

        return { width };
    };

    const { width } = calculatePosition();

    // Calculate top position based on verticalIndex (each card is 82px tall + 16px gap)
    const topPosition = verticalIndex * (82 + 16);

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
            onClick={onSelect}
        >
            {/* Gray line at the top */}
            <div className="h-[24px] w-full bg-gray-300 border-b border-gray-300" />

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
