import {Route} from '@angular/router';
import { InventoryDeliveryComponent } from './inventory_delivery/inventory-delivery.component';
import { InventoryDeliveryListComponent } from './inventory_delivery/list/list.component';
import {InventoryReceivingComponent} from './inventory_receiving/inventory-receiving.component';
import {InventoryReceivingListComponent} from './inventory_receiving/list/list.component';
import {InventoryItemLineUpListComponent} from "./inventory_item_line_up/list/list.component";
import {Inventory_item_line_upComponent} from "./inventory_item_line_up/inventory_item_line_up.component";
import {
    Inventory_need_supplier_scheduleComponent
} from "./inventory_need_supplier_schedule/inventory_need_supplier_schedule.component";
import {
    InventoryNeedSupplierScheduleListComponent
} from "./inventory_need_supplier_schedule/list/list.component";
import {
    CalendarCalendarsResolver,
    CalendarSettingsResolver,
    CalendarWeekdaysResolver
} from "../../../../shared/calendar/calendar.resolvers";

export const inventoryRoutes: Route[] = [
    {
        path      : '',
        pathMatch : 'full',
        redirectTo: 'inventory_receiving_index'
    },
    {
        path     : 'inventory_receiving_index',
        component: InventoryReceivingComponent,
        children : [
            {
                path     : '',
                pathMatch: 'full',
                component: InventoryReceivingListComponent,
            },
        ]
    },
    {
        path     : 'inventory_item_line_up_index',
        component: Inventory_item_line_upComponent,
        children : [
            {
                path     : '',
                pathMatch: 'full',
                component: InventoryItemLineUpListComponent,
            },
        ]
    },
    {
        path     : 'inventory_delivery_index',
        component: InventoryDeliveryComponent,
        children : [
            {
                path     : '',
                pathMatch: 'full',
                component: InventoryDeliveryListComponent,
            },
        ]
    },
    {
        path     : 'inventory_need_supplier_schedule_index',
        component: Inventory_need_supplier_scheduleComponent,

        resolve  : {
            calendars: CalendarCalendarsResolver,
            settings : CalendarSettingsResolver,
            weekdays : CalendarWeekdaysResolver
        },

        children : [
            {
                path     : '',
                pathMatch: 'full',
                component: InventoryNeedSupplierScheduleListComponent,
            },
        ]
    }
];
