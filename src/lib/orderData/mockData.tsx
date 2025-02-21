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
        updated_start_time: plannedStart,
        updated_end_time: plannedEnd,
        actual_start_time: "",
        actual_end_time: "",
        order_status: getRandomElement(orderStatuses),
        updated_at: new Date().toISOString(),
    };
}

export function generateDummyWorkCenterOrders(
    count: number
): WorkCenterOrder[] {
    return Array.from({ length: count }, () => generateDummyWorkCenterOrder());
}
