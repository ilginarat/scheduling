import { differenceInMilliseconds } from "date-fns";

export const calculateWidth = (
    startDate: Date,
    endDate: Date,
    conversionPixels: number
) => {
    // Calculate the duration of the order in hours
    const orderDurationHours =
        differenceInMilliseconds(endDate, startDate) / 1000 / 60 / 60;

    // Return the calculated width, ensuring it's at least a minimum size for visibility
    return orderDurationHours * 60 * 60 * conversionPixels;
};
