import React, { useEffect, useRef, useState } from "react";
import {
    format,
    addHours,
    startOfDay,
    endOfDay,
    addDays,
    eachDayOfInterval,
    addMonths,
} from "date-fns";

interface TimelineGridProps {
    gridGrain: "hour" | "halfDay" | "day";
}

// A group can represent one date or a range of dates
interface DateGroup {
    start: Date;
    end: Date;
}

const TimelineGrid: React.FC<TimelineGridProps> = ({ gridGrain }) => {
    const gridRef = useRef<HTMLDivElement>(null);
    const [visibleGroups, setVisibleGroups] = useState<DateGroup[]>([]);
    const [scale, setScale] = useState(50); // Scale from 0 to 100
    const baseColumnWidth = 50;

    // Calculate dates based on scale value (0-100)
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
            // Day view
            columnsToShow = Math.floor(7 * ((scaleValue - 33) / 33)); // 7 to 14 days
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

        return dates;
    };

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
        if (scale < 33) {
            // Hour view: show only start time and date when crossing to a new day
            const startTime = format(group.start, "HH:mm");

            // Check if this is the first group or if the day has changed from the previous group
            const isNewDay =
                index === 0 ||
                format(group.start, "yyyy-MM-dd") !==
                    format(groups[index - 1].start, "yyyy-MM-dd");

            return (
                <span className="inline-flex flex-col">
                    <span>{startTime}</span>
                    {isNewDay && (
                        <span className="text-xs text-gray-500">
                            {format(group.start, "MMM d")}
                        </span>
                    )}
                </span>
            );
        } else if (scale < 66) {
            // Day view: show date with day
            return (
                <span className="inline-flex items-center gap-1">
                    {format(group.start, "d")}
                    <span className="text-gray-500 text-xs">
                        {format(group.start, "EEEEE")}
                    </span>
                </span>
            );
        } else {
            // Month view: show date range if grouped
            return group.start.getTime() === group.end.getTime()
                ? format(group.start, "d")
                : `${format(group.start, "d")}-${format(group.end, "d")}`;
        }
    };

    const timeSlots = generateTimeSlots();

    return (
        <div className="flex flex-col h-full">
            {/* Scale Slider */}
            <div className="px-4 py-2 border-b border-gray-200">
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={scale}
                    onChange={(e) => setScale(Number(e.target.value))}
                    className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Hours</span>
                    <span>Days</span>
                    <span>Month</span>
                </div>
            </div>

            {/* Timeline Grid */}
            <div
                ref={gridRef}
                className="relative flex-1 bg-white overflow-hidden"
            >
                {/* Header with date labels */}
                <div className="flex border-b border-gray-200 transition-all duration-200 overflow-hidden">
                    <div className="flex" style={{ width: "100%" }}>
                        {visibleGroups.map((group, index) => (
                            <div
                                key={index}
                                className="text-center transition-all duration-200"
                                style={{
                                    width: `${100 / visibleGroups.length}%`,
                                    minWidth: "fit-content",
                                    padding: "0.25rem 0.5rem",
                                }}
                            >
                                <div className="text-sm font-medium whitespace-nowrap">
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

                {/* Grid container */}
                <div className="flex h-[calc(100%-32px)] relative overflow-hidden">
                    {/* Vertical grid lines */}
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

                    {/* Horizontal grid lines */}
                    <div className="absolute inset-x-0 top-8 bottom-0">
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
    );
};

export default TimelineGrid;
