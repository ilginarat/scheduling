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
        const totalTimelineHours = differenceInHours(
            timelineEndDate,
            timelineStartDate
        );
        const duration = differenceInHours(
            effectiveEndDate,
            effectiveStartDate
        );

        // Calculate width as percentage of total width
        // Calculate width based on grid cell width and hours per grid cell
        let width;
        const hoursPerGridCell = scale < 33 
            ? (scale < 15 ? 1 : scale < 25 ? 2 : 4) // Hour view: 1-4 hours per cell depending on scale
            : scale < 66 
                ? 24 // Day view: 24 hours per cell
                : 24 * 7; // Week view: 168 hours per cell
                
        // Calculate grid cell width (totalWidth / number of cells)
        const gridCellWidth = totalWidth / (totalTimelineHours / hoursPerGridCell);
        
        // Calculate width as (grid cell width / hours per grid cell) * duration
        width = (gridCellWidth / hoursPerGridCell) * duration;

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
