import React, { useEffect, useRef, useState } from "react";
import OrderCard from "@/components/card/orderCard";
import { WorkCenterOrder } from "@/lib/orderData/types";

import {
    format,
    addHours,
    startOfDay,
    endOfDay,
    addDays,
    differenceInMilliseconds,
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
    } = useOrderStore();

    // State for visible date groups and scale value
    const [visibleGroups, setVisibleGroups] = useState<DateGroup[]>([]);
    const [scale, setScale] = useState(50); // Scale from 0 to 100
    const [columnWidth, setColumnWidth] = useState(0); // Width of each column in pixels
    const totalGridWidth = 1299; // Total width of the grid in pixels

    const secondsToPixels = (): number => {
        if (visibleGroups.length === 0) return 0;

        // Calculate the total time span of the visible timeline in seconds
        const timelineStart = visibleGroups[0].start;
        const timelineEnd = visibleGroups[visibleGroups.length - 1].end;

        // setTimelineStartDate(timelineStart);

        const totalTimeSpanSeconds = differenceInSeconds(
            timelineEnd,
            timelineStart
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
        const timelineStart = new Date(visibleGroups[0].start);
        const diff = differenceInSeconds(orderStart, timelineStart);

        console.log("CALCULATE LEFT OFFSET:");
        console.log("orderStart", orderStart);
        console.log("conversionPixels:", conversionPixels);
        console.log("offset in pixels", diff * conversionPixels);

        return diff * conversionPixels;
    };

    const calculateHeaderOffset = (
        timelineStart: Date,
        displayedDate: Date,
        conversionPixels: number
    ): number => {
        const diff = differenceInSeconds(displayedDate, timelineStart);
        console.log(
            "header offset:",
            diff * conversionPixels,
            "conversionPixels:",
            conversionPixels,
            "for",
            displayedDate
        );
        return diff * conversionPixels;
    };

    const calculateVisibleDates = (
        availableWidth: number,
        scaleValue: number
    ) => {
        const today = startOfDay(new Date());
        const dates: DateGroup[] = [];
        let columnsToShow: number;

        if (scaleValue <= 33) {
            // Hour view
            const totalHours = Math.floor(24 * (1 + scaleValue / 33)); // 24 to 48 hours
            columnsToShow = Math.min(totalHours, 24); // Limit columns and group instead
            const hoursPerGroup = Math.max(
                1,
                Math.ceil(totalHours / columnsToShow)
            );
            const startHour = addHours(today, -Math.floor(totalHours / 2));

            for (let i = 0; i < totalHours; i += hoursPerGroup) {
                const groupStartHour = addHours(startHour, i);
                const groupEndHour = addHours(
                    groupStartHour,
                    hoursPerGroup - 1
                );
                dates.push({
                    start: groupStartHour,
                    end: groupEndHour,
                });
            }
        } else if (scaleValue < 66) {
            // Day view - smooth transition from 3 to 14 days
            const minDays = 3;
            const maxDays = 14;
            const normalizedScale = (scaleValue - 33) / 33; // 0 to 1
            columnsToShow = Math.floor(
                minDays + (maxDays - minDays) * normalizedScale
            );
            const startDay = addDays(today, -Math.floor(columnsToShow / 2));

            for (let i = 0; i < columnsToShow; i++) {
                const dayDate = addDays(startDay, i);
                dates.push({
                    start: dayDate,
                    end: dayDate,
                });
            }
        } else {
            // Month view
            columnsToShow = Math.floor(30 * (scaleValue / 100)); // up to 30 days
            const startDay = addDays(today, -Math.floor(columnsToShow / 2));
            const daysPerGroup = Math.max(1, Math.floor(columnsToShow / 10));

            for (let i = 0; i < columnsToShow; i += daysPerGroup) {
                const groupStart = addDays(startDay, i);
                const groupEnd = addDays(groupStart, daysPerGroup - 1);
                dates.push({
                    start: groupStart,
                    end: groupEnd,
                });
            }
        }

        // Calculate column width in pixels
        const newColumnWidth = totalGridWidth / dates.length;

        // Notify parent component about column width change
        if (onColumnWidthChange && newColumnWidth !== columnWidth) {
            onColumnWidthChange(newColumnWidth, dates.length);
        }

        // Update local state
        setColumnWidth(newColumnWidth);

        return dates;
    };
    useEffect(() => {
        setConversionPixels(secondsToPixels());
    }, [scale]);

    useEffect(() => {
        const updateVisibleGroups = () => {
            if (!gridRef.current) return;
            const gridWidth = gridRef.current.offsetWidth;
            // ToDo: Inverse the calculation to have variable width with static dates
            const groups = calculateVisibleDates(gridWidth, scale);
            setVisibleGroups(groups);
        };

        updateVisibleGroups();

        const resizeObserver = new ResizeObserver(updateVisibleGroups);
        if (gridRef.current) {
            resizeObserver.observe(gridRef.current);
        }

        return () => resizeObserver.disconnect();
    }, [scale, onColumnWidthChange]);

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
        if (scale < 33) {
            // Hour view: show only start time
            const startTime = format(group.start, "H");
            const isNewDay =
                index === 0 ||
                format(group.start, "yyyy-MM-dd") !==
                    format(groups[index - 1].start, "yyyy-MM-dd");

            return (
                <span className="inline-flex flex-col h-[38px] justify-center">
                    <span>{startTime}</span>
                    <span className="text-xs text-gray-500 h-4">
                        {isNewDay ? format(group.start, "MMM d") : "\u00A0"}
                    </span>
                </span>
            );
        } else if (scale < 66) {
            // Day view: show date with day indicator
            return (
                <span className="inline-flex items-center gap-1 h-[38px] justify-center">
                    {format(group.start, "d")}
                    <span className="text-gray-500 text-xs">
                        {format(group.start, "EEEEE")}
                    </span>
                </span>
            );
        } else {
            // Month view: show only start date with day indicator
            return (
                <span className="inline-flex items-center gap-1 h-[38px] justify-center">
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
        <div className="flex flex-col h-full">
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
                <div
                    ref={gridRef}
                    className="relative bg-white w-[1299px] h-full"
                >
                    {/* Header with date labels - Shows time indicators */}
                    <div className="flex border-b border-gray-200 transition-all duration-200 overflow-visible z-[10]">
                        <div className=" flex" style={{ width: "100%" }}>
                            {visibleGroups.map((group, index) => (
                                <div
                                    key={index}
                                    className={`absolute text-center transition-all duration-200   overflow-visible -top-7  z-[999]${
                                        scale < 33 ? "text-left" : "text-center"
                                    }`}
                                    style={{
                                        transform: `translateX(${calculateHeaderOffset(
                                            visibleGroups[0].start,
                                            group.start,
                                            conversionPixels
                                        )}px)`,
                                    }}
                                    // style={{
                                    //     minWidth: "fit-content",
                                    //     padding: "0.5rem",
                                    // }}
                                >
                                    <div
                                        className={`text-sm font-medium whitespace-nowrap ${
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
                        <div className="flex w-full transition-all duration-200 ">
                            {visibleGroups.map((_, index) => (
                                <div
                                    key={index}
                                    className="absolute border-l border-gray-200  transition-all duration-200 h-full"
                                    style={{
                                        transform: `translateX(${calculateHeaderOffset(
                                            visibleGroups[0].start,
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
                                    className="border-b  border-gray-100"
                                    style={{ height: `${100 / 24}%` }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TimelineGrid;
