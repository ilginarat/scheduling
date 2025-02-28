/**
 * TimelineGrid Component
 *
 * This component renders a scalable timeline grid that can display time in different granularities:
 * - Hour view: Shows hours with date indicators for new days
 * - Day view: Shows days with weekday indicators
 * - Month view: Shows days grouped into weeks/months
 *
 * The component includes a scale slider that allows users to zoom in/out, changing the visible
 * time range and granularity dynamically.
 */
import React, { useEffect, useRef, useState } from "react";
import {
    format,
    addHours,
    startOfDay,
    endOfDay,
    addDays,
    eachDayOfInterval,
    addMonths,
    differenceInSeconds,
} from "date-fns";
import { useOrderStore } from "@/stores/orderStore";
/**
 * Props for the TimelineGrid component
 * @property {string} gridGrain - The base granularity of the grid ("hour", "halfDay", or "day")
 * @property {function} onScaleChange - Optional callback that fires when the scale changes
 * @property {function} onColumnWidthChange - Optional callback that fires when column width changes
 */
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
    const { setConversionPixels } = useOrderStore();

    // State for visible date groups and scale value
    const [visibleGroups, setVisibleGroups] = useState<DateGroup[]>([]);
    const [scale, setScale] = useState(50); // Scale from 0 to 100
    const [columnWidth, setColumnWidth] = useState(0); // Width of each column in pixels
    const totalGridWidth = 1299; // Total width of the grid in pixels

    /**
     * Converts seconds to pixels based on the current scale value
     * This is useful for positioning elements on the timeline
     *
     * @param {number} seconds - The number of seconds to convert
     * @returns {number} - The equivalent width in pixels
     */
    const secondsToPixels = (): number => {
        if (visibleGroups.length === 0) return 0;

        // Calculate the total time span of the visible timeline in seconds
        const timelineStart = visibleGroups[0].start;
        const timelineEnd = visibleGroups[visibleGroups.length - 1].end;
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

    /**
     * Calculates the visible date groups based on the current scale value
     * The scale determines both the time range and the granularity:
     * - 0-33: Hour view (24-48 hours)
     * - 34-66: Day view (3-14 days)
     * - 67-100: Month view (up to 30 days)
     *
     * @param {number} availableWidth - The available width for the grid
     * @param {number} scaleValue - The current scale value (0-100)
     * @returns {DateGroup[]} - Array of date groups to display
     */
    const calculateVisibleDates = (
        availableWidth: number,
        scaleValue: number
    ) => {
        const today = startOfDay(new Date());
        const dates: DateGroup[] = [];
        let columnsToShow: number;

        if (scaleValue < 33) {
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
            <div className="flex-1 overflow-x-auto">
                <div
                    ref={gridRef}
                    className="relative bg-white w-[1299px] h-full"
                >
                    {/* Header with date labels - Shows time indicators */}
                    <div className="flex border-b border-gray-200 transition-all duration-200">
                        <div className="flex" style={{ width: "100%" }}>
                            {visibleGroups.map((group, index) => (
                                <div
                                    key={index}
                                    className="text-center transition-all duration-200"
                                    style={{
                                        width: `${100 / visibleGroups.length}%`,
                                        minWidth: "fit-content",
                                        padding: "0.5rem",
                                    }}
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
                    </div>

                    {/* Grid container - Contains vertical and horizontal grid lines */}
                    <div className="flex h-[400px] relative">
                        {/* Vertical grid lines - One for each date group */}
                        <div className="flex w-full transition-all duration-200">
                            {visibleGroups.map((_, index) => (
                                <div
                                    key={index}
                                    className="border-l border-gray-100 first:border-l-0 transition-all duration-200"
                                    style={{
                                        width: `${100 / visibleGroups.length}%`,
                                    }}
                                />
                            ))}
                        </div>

                        {/* Horizontal grid lines - 24 equal divisions */}
                        <div className="absolute inset-x-0 top-0 bottom-0">
                            {[...Array(24)].map((_, index) => (
                                <div
                                    key={index}
                                    className="border-b border-gray-50"
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
