export interface WorkCenterOrder {
    order_number: string;
    material_number: string;
    work_center_number: string;
    operation_number: string;
    operation_counter: number;
    parent_operation_counter: number;
    operation_description: string;
    operation_status: string;
    target_quantity: number;
    confirmed_quantity: number;
    component_check: boolean;
    demand_check: boolean;
    production_resource_tool_check: boolean;
    planned_start_time: string;
    planned_end_time: string;
    updated_start_time: string;
    updated_end_time: string;
    actual_start_time: string;
    actual_end_time: string;
    order_status: string;
    updated_at: string;
}
