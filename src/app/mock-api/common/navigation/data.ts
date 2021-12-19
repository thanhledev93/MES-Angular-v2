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
                id      : 'inventory_delivery',
                title   : 'NAV.inventory_delivery',
                type    : 'basic',
                icon    : 'heroicons_outline:clipboard',
                link : '/inventory_delivery_index'
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
