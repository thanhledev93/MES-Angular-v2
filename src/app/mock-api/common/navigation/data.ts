/* tslint:disable:max-line-length */
import { FuseNavigationItem } from '@fuse/components/navigation';

export const defaultNavigation: FuseNavigationItem[] = [
    {
        id: 'inventory',
        title: 'NAV.inventory',
        type: 'group',
        icon: 'heroicons_outline:home',
        children: [
            {
                id      : 'inventory_receiving',
                title   : 'NAV.inventory_receiving',
                type    : 'basic',
                icon    : 'heroicons_outline:clipboard-list',
                link : '/inventory_receiving_index'
            },
            {
                id      : 'inventory_item_line_up',
                title   : 'NAV.inventory_item_line_up',
                type    : 'basic',
                icon    : 'heroicons_outline:collection',
                link : '/inventory_item_line_up_index'
            },
            {
                id      : 'inventory_delivery',
                title   : 'NAV.inventory_delivery',
                type    : 'basic',
                icon    : 'heroicons_outline:clipboard',
                link : '/inventory_delivery_index'
            },
            {
                id      : 'inventory_need_supplier_schedule',
                title   : 'NAV.inventory_need_supplier_schedule',
                type    : 'basic',
                icon    : 'heroicons_outline:calendar',
                link : '/inventory_need_supplier_schedule_index'
            },

        ]
    },
];
export const compactNavigation: FuseNavigationItem[] = [
    {
        id   : 'example',
        title: 'Example',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/example'
    }
];
export const futuristicNavigation: FuseNavigationItem[] = [
    {
        id   : 'example',
        title: 'Example',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/example'
    }
];
export const horizontalNavigation: FuseNavigationItem[] = [
    {
        id   : 'example',
        title: 'Example',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/example'
    }
];
