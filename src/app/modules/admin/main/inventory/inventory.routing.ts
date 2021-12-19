import {Route} from '@angular/router';
import {InventoryReceivingComponent} from './inventory_receiving/inventory-receiving.component';
import {InventoryReceivingListComponent} from './inventory_receiving/list/list.component';

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
    }
];
