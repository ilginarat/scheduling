import { WorkCenterOrder } from "./types";

const workCenterNumbers = ["WC001", "WC002", "WC003", "WC004", "WC005"];
const operationStatuses = ["READY", "IN_PROGRESS", "COMPLETED", "BLOCKED"];
const orderStatuses = ["RELEASED", "IN_PROGRESS", "COMPLETED", "HOLD"];

function getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

function generateRandomDate(start: Date, end: Date): string {
    const randomDate = new Date(
        start.getTime() + Math.random() * (end.getTime() - start.getTime())
    );
    return randomDate.toISOString();
}

export function generateDummyWorkCenterOrder(
    orderNumber?: string
): WorkCenterOrder {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + 7);

    const plannedStart = generateRandomDate(now, futureDate);
    const plannedEnd = generateRandomDate(new Date(plannedStart), futureDate);

    // 40% chance of having updated times different from planned
    const hasUpdatedTimes = Math.random() < 0.4;
    const updatedStart = hasUpdatedTimes
        ? new Date(
              new Date(plannedStart).getTime() +
                  (Math.random() * 2 - 1) * 60 * 60 * 1000
          ).toISOString()
        : plannedStart;
    const updatedEnd = hasUpdatedTimes
        ? new Date(
              new Date(plannedEnd).getTime() +
                  (Math.random() * 2 - 1) * 60 * 60 * 1000
          ).toISOString()
        : plannedEnd;

    // 30% chance of having actual times (meaning production has started)
    const hasActualStart = Math.random() < 0.3;
    const hasActualEnd = hasActualStart && Math.random() < 0.5; // 50% chance of having end time if started

    // If actual times exist, generate them with 50% chance of matching updated times
    const actualStart = hasActualStart
        ? Math.random() < 0.5
            ? updatedStart
            : new Date(
                  new Date(updatedStart).getTime() +
                      (Math.random() * 2 - 1) * 60 * 60 * 1000
              ).toISOString()
        : "";

    const actualEnd = hasActualEnd
        ? Math.random() < 0.5
            ? updatedEnd
            : new Date(
                  new Date(updatedEnd).getTime() +
                      (Math.random() * 2 - 1) * 60 * 60 * 1000
              ).toISOString()
        : "";

    // Generate target quantity first
    const targetQuantity = Math.floor(Math.random() * 1000) + 1;
    // Generate confirmed quantity as a random portion of target quantity
    const confirmedQuantity = Math.floor(Math.random() * targetQuantity);

    return {
        order_number:
            orderNumber ||
            `ORD${Math.floor(Math.random() * 100000)
                .toString()
                .padStart(6, "0")}`,
        material_number: `MAT${Math.floor(Math.random() * 10000)
            .toString()
            .padStart(5, "0")}`,
        work_center_number: getRandomElement(workCenterNumbers),
        operation_number: `OP${Math.floor(Math.random() * 1000)
            .toString()
            .padStart(4, "0")}`,
        operation_counter: Math.floor(Math.random() * 100),
        parent_operation_counter: Math.floor(Math.random() * 100),
        operation_description: `Sample Operation ${Math.floor(
            Math.random() * 100
        )}`,
        operation_status: getRandomElement(operationStatuses),
        target_quantity: targetQuantity,
        confirmed_quantity: confirmedQuantity,
        component_check: Math.random() > 0.5,
        demand_check: Math.random() > 0.5,
        production_resource_tool_check: Math.random() > 0.5,
        planned_start_time: plannedStart,
        planned_end_time: plannedEnd,
        updated_start_time: updatedStart,
        updated_end_time: updatedEnd,
        actual_start_time: actualStart,
        actual_end_time: actualEnd,
        order_status: getRandomElement(orderStatuses),
        updated_at: new Date().toISOString(),
    };
}

export function generateDummyWorkCenterOrders(
    count: number
): WorkCenterOrder[] {
    return Array.from({ length: count }, () => generateDummyWorkCenterOrder());
}
