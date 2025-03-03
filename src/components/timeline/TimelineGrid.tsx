import React, { useEffect, useRef, useState } from "react";
import OrderCard from "@/components/card/orderCard";
import { WorkCenterOrder } from "@/lib/orderData/types";

import {
    format,
    addHours,
    startOfDay,
    endOfDay,
    addDays,
    differenceInSeconds,
} from "date-fns";

import { useOrderStore } from "@/stores/orderStore";
import { mapWorkCenterOrderToCardProps } from "@/components/card/cards";
import SchedulingCard from "../card/schedulingCard";

interface TimelineGridProps {
    gridGrain: "hour" | "halfDay" | "day";
    onScaleChange?: (scale: number) => void;
    onColumnWidthChange?: (columnWidth: number, columnCount: number) => void;
}

interface DateGroup {
    start: Date;
    end: Date;
}

const TimelineGrid: React.FC<TimelineGridProps> = ({
    gridGrain,
    onScaleChange,
    onColumnWidthChange,
}) => {
    // Reference to the grid container for measuring available width
    const gridRef = useRef<HTMLDivElement>(null);
    const {
        selectOrder,
        setConversionPixels,
        selectedOrder,
        setTimelineStartDate,
        scheduledOrders,
        unscheduledOrders,
        conversionPixels,
        setTotalGridWidth,
        totalGridWidth,
        timelineStartDate,
        setTimelineEndDate,
        timelineEndDate,
    } = useOrderStore();

    // State for visible date groups and scale value
    const [visibleGroups, setVisibleGroups] = useState<DateGroup[]>([]);
    const [scale, setScale] = useState(50); // Scale from 0 to 100
    const [columnWidth, setColumnWidth] = useState(0); // Width of each column in pixels

    const secondsToPixels = (): number => {
        if (visibleGroups.length === 0) return 0;

        const totalTimeSpanSeconds = differenceInSeconds(
            timelineEndDate,
            timelineStartDate
        );

        // If there's no time span, return 0 to avoid division by zero
        if (totalTimeSpanSeconds <= 0) return 0;

        // Calculate the conversion factor (pixels per second)
        const pixelsPerSecond = totalGridWidth / totalTimeSpanSeconds;

        // Convert the input seconds to pixels
        return pixelsPerSecond;
    };

    const calculateLeftOffset = (
        order: WorkCenterOrder,
        conversionPixels: number
    ): number => {
        const orderStart = new Date(order.planned_start_time);
        const diff = differenceInSeconds(orderStart, timelineStartDate);

        //console.log("CALCULATE LEFT OFFSET:");
        //console.log("orderStart", orderStart);
        //console.log("conversionPixels:", conversionPixels);
        //console.log("offset in pixels", diff * conversionPixels);

        return diff * conversionPixels;
    };

    const calculateHeaderOffset = (
        displayedDate: Date,
        conversionPixels: number
    ): number => {
        const diff = differenceInSeconds(displayedDate, timelineStartDate);
        //console.log(
        //    "header offset:",
        //    diff * conversionPixels,
        //    "conversionPixels:",
        //    conversionPixels,
        //    "for",
        //    displayedDate
        //);
        return diff * conversionPixels;
    };

    const returnVisibleDates = (scaleValue: number) => {
        // If start and end dates are provided, use them
        const dates: DateGroup[] = [];
        const totalTimeSpan = differenceInSeconds(
            timelineEndDate,
            timelineStartDate
        );
        let columnsToShow: number;

        if (scaleValue <= 43) {
            // Hour view
            columnsToShow = Math.ceil(totalTimeSpan / (60 * 60)); // Convert to hours
            const calc = Math.ceil((columnsToShow * scaleValue) / 20000);
            const hoursPerGroup = Math.max(1, calc); // Group hours if too many

            //console.log("hoursPerGroup", hoursPerGroup);
            //console.log("calc: ", calc);

            let currentHour = startOfDay(timelineStartDate);
            while (currentHour < timelineEndDate) {
                const groupEndHour = addHours(currentHour, hoursPerGroup - 1);
                dates.push({
                    start: currentHour,
                    end: groupEndHour,
                });
                currentHour = addHours(currentHour, hoursPerGroup);
            }
        } else {
            // Day view
            columnsToShow = Math.ceil(totalTimeSpan / (60 * 60 * 24)); // Convert to days
            const calc = Math.ceil((columnsToShow * scaleValue) / 5000);
            const daysPerGroup = Math.max(1, calc); // Group hours if too many

            //console.log("daysPerGroup", daysPerGroup);
            //console.log("calc: ", calc);

            let currentDay = startOfDay(timelineStartDate);
            while (currentDay < timelineEndDate) {
                const groupEndDay = addDays(currentDay, daysPerGroup - 1);
                dates.push({
                    start: currentDay,
                    end: groupEndDay,
                });
                currentDay = addDays(currentDay, daysPerGroup);
            }
        }

        // Calculate the required grid width based on the date range and scale
        const requiredGridWidth = dates.length * (50 + scaleValue); // Base width plus scale factor

        // Update the total grid width
        setTotalGridWidth(requiredGridWidth);

        // Notify parent component about column width change
        const newColumnWidth = requiredGridWidth / dates.length;
        if (onColumnWidthChange && newColumnWidth !== columnWidth) {
            onColumnWidthChange(newColumnWidth, dates.length);
        }

        // Update local state
        setColumnWidth(newColumnWidth);

        // Log the dates array for debugging
        //console.log(
        //    "Generated date groups:",
        //    dates.map((group) => ({
        //        start: format(group.start, "yyyy-MM-dd HH:mm"),
        //    }))
        //);

        return dates;
    };

    useEffect(() => {
        setTimelineStartDate(addDays(new Date(), -3));
        setTimelineEndDate(addDays(new Date(), 60));
    }, []);

    useEffect(() => {
        setConversionPixels(secondsToPixels());
    }, [scale, visibleGroups]);

    useEffect(() => {
        const updateVisibleGroups = () => {
            if (!gridRef.current) return;

            // Use provided start and end dates if available
            const groups = returnVisibleDates(scale);
            setVisibleGroups(groups);
        };

        updateVisibleGroups();

        const resizeObserver = new ResizeObserver(updateVisibleGroups);
        if (gridRef.current) {
            resizeObserver.observe(gridRef.current);
        }

        return () => resizeObserver.disconnect();
    }, [scale]);

    const generateTimeSlots = () => {
        if (visibleGroups.length === 0) return [];

        const slots = [];
        let current = startOfDay(visibleGroups[0].start);
        const end = endOfDay(visibleGroups[visibleGroups.length - 1].end);

        const increment = {
            hour: 1,
            halfDay: 12,
            day: 24,
        }[gridGrain];

        while (current <= end) {
            slots.push(current);
            current = addHours(current, increment);
        }
        return slots;
    };

    const formatDateLabel = (
        group: DateGroup,
        index: number,
        groups: DateGroup[]
    ) => {
        if (scale <= 43) {
            // Hour view: show only start time
            const startTime = format(group.start, "H");
            const isNewDay =
                index === 0 ||
                format(group.start, "yyyy-MM-dd") !==
                    format(groups[index - 1].start, "yyyy-MM-dd");

            return (
                <span className="inline-flex flex-col h-[88px] justify-center">
                    <span>{startTime}</span>
                    <span className="text-xs text-gray-500 h-4">
                        {isNewDay ? format(group.start, "MMM d") : "\u00A0"}
                    </span>
                </span>
            );
        } else if (scale < 66) {
            // Day view: show date with day indicator
            return (
                <span className="inline-flex items-center gap-1 h-[88px] justify-center">
                    {format(group.start, "d")}
                    <span className="text-gray-500 text-xs">
                        {format(group.start, "EEEEE")}
                    </span>
                </span>
            );
        } else {
            // Month view: show only start date with day indicator
            return (
                <span className="inline-flex items-center gap-1 h-[88px] justify-center">
                    {format(group.start, "d")}
                    <span className="text-gray-500 text-xs">
                        {format(group.start, "EEEEE")}
                    </span>
                </span>
            );
        }
    };

    const timeSlots = generateTimeSlots();

    useEffect(() => {
        //console.log("scheduledOrders TO SEE ", scheduledOrders);
    }, [scheduledOrders]);

    //console.log(" scheduledOrders in the timeline", scheduledOrders);
    const headerOffset = 100;
    return (
        <div className="flex flex-col h-[700px] max-w-[1200px] overflow-x-scroll">
            {/* Scale Slider - Controls the zoom level of the timeline */}
            <div className="px-4 py-2 border-b border-gray-200 shrink-0">
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={scale}
                    onChange={(e) => {
                        const newScale = Number(e.target.value);
                        setScale(newScale);
                        onScaleChange?.(newScale);
                    }}
                    className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Hours</span>
                    <span>Days</span>
                    <span>Month</span>
                </div>
            </div>

            {/* Timeline Grid - Shows the date headers and grid lines */}
            <div className="flex-1 ">
                {/* Container that fills parent width with horizontal scroll */}
                <div className="w-full h-[600px] overflow-x-auto overflow-y-hidden">
                    <div
                        ref={gridRef}
                        className="relative bg-white h-full inline-block"
                        style={{
                            width: `${totalGridWidth}px`,
                            minWidth: "100%",
                        }}
                    >
                        {/* Header with date labels - Shows time indicators */}
                        <div className="flex border-b border-gray-200 transition-all duration-200 overflow-visible z-[9999]">
                            <div className="flex " style={{ width: "100%" }}>
                                {visibleGroups.map((group, index) => (
                                    <div
                                        key={index}
                                        className={` absolute text-center transition-all duration-200 overflow-visible -top-7 ${
                                            scale < 33
                                                ? "text-left"
                                                : "text-center"
                                        }`}
                                        style={{
                                            transform: `translateX(${calculateHeaderOffset(
                                                group.start,
                                                conversionPixels
                                            )}px)`,
                                        }}
                                    >
                                        <div
                                            className={`text-sm font-medium whitespace-nowrap z-[9999] ${
                                                scale < 33
                                                    ? "text-left"
                                                    : "text-center"
                                            }`}
                                        >
                                            {formatDateLabel(
                                                group,
                                                index,
                                                visibleGroups
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {scheduledOrders.length > 0 &&
                                scheduledOrders.map((local_order, index) => (
                                    <div
                                        key={local_order.order_number}
                                        className="absolute opacity-90 z-[999]"
                                        style={{
                                            top: `${index + 1 * 100}px`,
                                            transform: `translateX(${calculateLeftOffset(
                                                local_order,
                                                conversionPixels
                                            )}px)`,
                                        }}
                                    >
                                        <SchedulingCard
                                            order={local_order}
                                            verticalIndex={index}
                                            index={index}
                                        />
                                    </div>
                                ))}
                        </div>

                        {/* Grid container - Contains vertical and horizontal grid lines */}
                        <div className="flex h-[400px] relative">
                            {/* Vertical grid lines - One for each date group */}
                            <div className="flex w-full transition-all duration-200">
                                {visibleGroups.map((_, index) => (
                                    <div
                                        key={index}
                                        className="absolute border-l border-gray-200 transition-all duration-200 h-full"
                                        style={{
                                            transform: `translateX(${calculateHeaderOffset(
                                                visibleGroups[index].start,
                                                conversionPixels
                                            )}px)`,
                                        }}
                                    />
                                ))}
                            </div>

                            {/* Horizontal grid lines - 24 equal divisions */}
                            <div className="absolute inset-x-0 top-0 bottom-0">
                                {[...Array(24)].map((_, index) => (
                                    <div
                                        key={index}
                                        className="border-b border-gray-100"
                                        style={{ height: `${100 / 24}%` }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TimelineGrid;
