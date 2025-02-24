import React, {
    useEffect,
    useRef,
    useState,
    WheelEvent,
    TouchEvent,
} from "react";
import {
    format,
    addHours,
    startOfDay,
    endOfDay,
    eachDayOfInterval,
} from "date-fns";

interface TimelineGridProps {
    startDate: Date;
    endDate: Date;
    gridGrain: "hour" | "halfDay" | "day";
}

// A group can represent one date or a range of dates
interface DateGroup {
    start: Date;
    end: Date;
}

const TimelineGrid: React.FC<TimelineGridProps> = ({
    startDate,
    endDate,
    gridGrain,
}) => {
    const gridRef = useRef<HTMLDivElement>(null);
    const [visibleGroups, setVisibleGroups] = useState<DateGroup[]>([]);
    const [scale, setScale] = useState(1);
    const minDateWidth = 50; // Base width (in pixels) for each column
    const MIN_SCALE = 0.1;
    const MAX_SCALE = 3;

    // This ref stores the initial distance between two touch points for pinch gestures.
    const pinchRef = useRef<number | null>(null);

    // Zoom in/out using the mouse wheel (with ctrl/meta key)
    const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const delta = -e.deltaY;
            const zoomFactor = 0.01;
            setScale((prevScale) => {
                const newScale = prevScale * (1 + delta * zoomFactor);
                return Math.min(Math.max(newScale, MIN_SCALE), MAX_SCALE);
            });
        }
    };

    // Touch handlers for pinch-to-zoom gestures
    const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
        if (e.touches.length === 2) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            pinchRef.current = Math.hypot(dx, dy);
        }
    };

    const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
        if (e.touches.length === 2 && pinchRef.current !== null) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            const newDistance = Math.hypot(dx, dy);
            const distanceDelta = newDistance / pinchRef.current;

            setScale((prevScale) => {
                const newScale = prevScale * distanceDelta;
                return Math.min(Math.max(newScale, MIN_SCALE), MAX_SCALE);
            });
            pinchRef.current = newDistance;
        }
    };

    const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
        if (e.touches.length < 2) {
            pinchRef.current = null;
        }
    };

    // Recalculate visible date groups whenever startDate, endDate, or scale changes.
    useEffect(() => {
        const calculateVisibleGroups = () => {
            if (!gridRef.current) return;

            const gridWidth = gridRef.current.offsetWidth;
            // Multiply scale so that higher scale means wider columns.
            const scaledDateWidth = minDateWidth * scale;
            const maxVisibleColumns = Math.floor(gridWidth / scaledDateWidth);

            const allDates = eachDayOfInterval({
                start: startDate,
                end: endDate,
            });
            let groups: DateGroup[] = [];

            if (allDates.length <= maxVisibleColumns) {
                groups = allDates.map((date) => ({ start: date, end: date }));
            } else {
                const groupSize = Math.ceil(
                    allDates.length / maxVisibleColumns
                );
                for (let i = 0; i < allDates.length; i += groupSize) {
                    const groupSlice = allDates.slice(i, i + groupSize);
                    groups.push({
                        start: groupSlice[0],
                        end: groupSlice[groupSlice.length - 1],
                    });
                }
            }
            setVisibleGroups(groups);
        };

        calculateVisibleGroups();

        const resizeObserver = new ResizeObserver(calculateVisibleGroups);
        if (gridRef.current) {
            resizeObserver.observe(gridRef.current);
        }
        return () => resizeObserver.disconnect();
    }, [startDate, endDate, scale]);

    // Generate time slots based on gridGrain.
    const generateTimeSlots = () => {
        const slots = [];
        let current = startOfDay(startDate);
        const end = endOfDay(endDate);
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

    const timeSlots = generateTimeSlots();

    return (
        <div
            ref={gridRef}
            className="relative w-full h-full bg-white"
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ touchAction: "none" }}
        >
            {/* Header with date labels or grouped ranges */}
            <div className="flex border-b border-gray-200 transition-all duration-200">
                {visibleGroups.map((group, index) => (
                    <div
                        key={index}
                        className="flex-1 px-2 py-1 text-center transition-all duration-200"
                        style={{ minWidth: `${minDateWidth * scale}px` }}
                    >
                        <div className="text-sm font-medium">
                            {group.start.getTime() === group.end.getTime()
                                ? format(group.start, "d EEEEE")
                                : `${format(group.start, "d")}-${format(
                                      group.end,
                                      "d"
                                  )} ${format(group.start, "MMMM")}`}
                        </div>
                    </div>
                ))}
            </div>

            {/* Grid container */}
            <div className="flex h-[calc(100%-32px)] relative">
                {/* Vertical grid lines */}
                <div className="flex flex-1 transition-all duration-200">
                    {timeSlots.map((slot) => (
                        <div
                            key={slot.getTime()}
                            className="flex-1 border-l border-gray-100 first:border-l-0 transition-all duration-200"
                            style={{ minWidth: `${minDateWidth * scale}px` }}
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
    );
};

export default TimelineGrid;
