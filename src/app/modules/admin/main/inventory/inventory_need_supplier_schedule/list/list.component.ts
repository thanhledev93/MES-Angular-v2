/* eslint-disable @typescript-eslint/naming-convention */
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';

import {debounceTime, tap} from 'rxjs/operators';
import {BehaviorSubject, combineLatest} from 'rxjs';
import {MatDialog} from '@angular/material/dialog';
import {TranslocoService} from '@ngneat/transloco';
import { BaseComponentService } from 'app/shared/base-component/base-component.service';
import { BaseListComponent } from 'app/shared/base-component/base-list.component';
import { FormBuilder } from '@angular/forms';
import {Calendar as FullCalendar} from "@fullcalendar/core";
import { MatCheckboxChange } from '@angular/material/checkbox';
import {FuseConfirmationService} from "../../../../../../../@fuse/services/confirmation";
import { InventoryDeliveryPopupAddComponent } from '../../inventory_delivery/popup-add/popup-add.component';

@Component({
    selector: 'inventory_need_supplier_schedule-list',
    templateUrl: './list.component.html',
    styleUrls  : ['./list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,

    providers: [BaseComponentService,
        {provide: 'controller', useValue: 'inventory_need_supplier_schedule'},
    ],
})
export class InventoryNeedSupplierScheduleListComponent extends BaseListComponent implements OnInit, AfterViewInit, OnDestroy {
    list_customer: any;
    type_add: any;
    list_export_status: any;
    list_item: any = [];

    dataTableColumns: string[] = ['function', 'need_supplier_date', 'production_order', 'customer_name',
        'sys_item', 'sys_item_specification', 'quantity', 'quantity_supplied',
        'type_add', 'inventory_delivery', 'note'];

    calendarMode: boolean = false;
    public _fullCalendarApi: FullCalendar;

    viewDate: Date;
    events: any;
    view = 'month'

    /**
     * Constructor
     */
    constructor(public _changeDetectorRef: ChangeDetectorRef,
                public _baseComponentService: BaseComponentService,
                public _matDialog: MatDialog,
                public _translocoService: TranslocoService, public _formBuilder: FormBuilder,
                public _fuseConfirmationService: FuseConfirmationService) {
        super(_changeDetectorRef, _baseComponentService, _matDialog, _translocoService);

        // Filter if changed value
        this.filters = {
            // Base filter
            query$      : new BehaviorSubject(''),
            id_customer$ : new BehaviorSubject('-1'),
            status_export$ : new BehaviorSubject('1'),
            view$ : new BehaviorSubject('month'),
        };

        // Data filter of API
        this._filter = {
            search: '',
            id_customer: -1,
            status_export: 1,
            view: 'month',
            status_del: "1"
        }

        this.type_add = [
            {id: 1, name: this._translocoService.translate('inventory.follow_main_unit')},
            {id: 2, name: this._translocoService.translate('inventory.follow_specification')},
            {id: 3, name: this._translocoService.translate('inventory.follow_other_unit')}
        ]

        // Get list sys_delivery_type
        this._baseComponentService.getListResolveData('sys_customer.ctr/getListUseCustomner/', {search: ''})
            .subscribe((resp) => {
                this.list_customer = resp;
                this.list_customer.splice(0,0, { id: "-1", name: this._translocoService.translate('all') });
            });

        this.list_export_status = [
            {
                id: "1",
                name: this._translocoService.translate('inventory.export_not_enough')
            },
            {
                id: "2",
                name: this._translocoService.translate('inventory.export_enough')
            }
        ];

    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {

        // Create the form
        this._form = this._formBuilder.group({
            search: [''],
            id_customer: ['-1'],
            status_export: ['1']
        });

        this.getListData();
        this.getPagination();

        // Filter if change value
        this.combineFilters(); {
            combineLatest([this.filters.query$, this.filters.id_customer$, this.filters.status_export$,
                this.filters.view$]).pipe(debounceTime(300))
                .subscribe(([ query, id_customer, status_export, view ]) => {

                    // update _filter
                    this._filter = {...this._filter,
                        search: query,
                        id_customer: id_customer,
                        status_export: status_export,
                        view: view,
                    };

                    this.rerender();

                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Filter by search query
     *
     * @param query
     */
    filterByQuery(): void
    {
        this.filters.query$.next(this._form.get('search').value);
    }

    /**
     * Filter by approval status
     *
     * @param change
     */
    filterByCustomer(): void
    {
        this.filters.id_customer$.next(this._form.get('id_customer').value);
    }

    /**
     * Filter by type
     *
     * @param change
     */
    filterByStatusExport(): void
    {
        this.filters.status_export$.next(this._form.get('status_export').value);
    }

    /**
     * Toggle view mode
     *
     * @param calendarMode
     */
    toggleCalendarMode(calendarMode: boolean | null = null): void
    {
        if ( calendarMode === null )
        {
            this.calendarMode = !this.calendarMode;
        }
        else
        {
            this.calendarMode = calendarMode;
        }

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    setApiCalendar(event: any): void {
        this._fullCalendarApi = event;
    }


    /**
     * Add tag to the product
     *
     * @param item
     */
    addItemToListItem(item: any): void
    {
        this.list_item.push(item);

        console.log('add item: ', this.list_item)

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Remove tag from the product
     *
     * @param item
     */
    removeItemToListItem(item: any): void
    {
        const itemIndex = this.list_item.findIndex(d => d.db.id === item.db.id);
        if (itemIndex !== -1) {
            this.list_item.splice(this.list_item.findIndex(d => d.db.id === item.db.id), 1);
        }

        console.log('remove item: ', this.list_item)


        // Mark for check
        this._changeDetectorRef.markForCheck();
    }


    /**
     * Toggle item
     *
     * @param item
     * @param change
     */
    toggleItemChoose(item: any, change: MatCheckboxChange): void
    {
        const isDifferentProductionOrder = this.list_item.findIndex(d => d.db.id_production_order !== item.db.id_production_order)

        if (isDifferentProductionOrder !== -1) {
            this._baseComponentService.confirmationDialog('Mặt hàng không cùng lệnh sản xuất',
                                                      'Các mặt hàng được chọn phải thuộc cùng lệnh sản xuất!');
            item.isChecked = false;

            // reload table
            this.rerender()

            return;
        }

        if ( change.checked )
        {
            this.addItemToListItem(item);
        }
        else
        {
            this.removeItemToListItem(item);
        }

    }

    /**
     * Open dialog detail
     */
    openDialogComponent(model = null, pos = null, actionEnum = null): void {

        if (this.list_item.length === 0) {
            this._baseComponentService.confirmationDialog('Chưa chọn mặt hàng', 'Vui lòng chọn mặt hàng cần lập phiếu xuất kho vật tư!')
            return;
        }

        // Handle data for PopupAdd
        this.list_item.forEach((item, index) => {
            item.db.id_production_order_need_supplier_schedule = item.db.id;
            item.db.quantity = item.db.quantity - item.db.quantity_export;
        });

        if (model !== null && pos !== null) {
            model.actionEnum = actionEnum;
        } else {
            model = {
                actionEnum: 1,
                db: {
                    id: 0,
                    type: 1,
                    export_date:new Date(),
                },
                list_item: this.list_item
            };

            console.log('model: ', model);
        }

        this.openDialog(model, InventoryDeliveryPopupAddComponent);
    }
}
