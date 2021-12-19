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
import { InventoryDeliveryPopupAddComponent } from '../popup-add/popup-add.component';
// import { InventoryDeliveryPopupAddComponent } from '../popup-add/popup-add.component';

@Component({
    selector: 'inventory-delivery-list',
    templateUrl: './list.component.html',
    styleUrls  : ['./list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,

    providers: [BaseComponentService,
        {provide: 'controller', useValue: 'inventory_delivery'},
    ],
})
export class InventoryDeliveryListComponent extends BaseListComponent implements OnInit, AfterViewInit, OnDestroy {
    list_sys_delivery_type: any;
    list_sys_warehouse: any;
    list_type: any;
    list_status_del: any;

    dataTableColumns: string[] = ['function', 'name', 'status_finish', 'sys_warehouse_name', 'type', 'sys_delivery_type_name', 'create_date',
        'business_purchase_order_name', 'production_order_name', 'note'];

    panelOpenState = false;
    expand = false;

    /**
     * Constructor
     */
    constructor(public _changeDetectorRef: ChangeDetectorRef,
                public _baseComponentService: BaseComponentService,
                public _matDialog: MatDialog,
                public _translocoService: TranslocoService, public _formBuilder: FormBuilder) {
        super(_changeDetectorRef, _baseComponentService, _matDialog, _translocoService);

        // Filter if changed value
        this.filters = {
            // Base filter
            query$      : new BehaviorSubject(''),
            status_del$ : new BehaviorSubject('1'),
            approvalStatus$ : new BehaviorSubject('-1'),

            // Custom filter
            delivery_type$ : new BehaviorSubject('-1'),
            type$ : new BehaviorSubject('-1'),
            warehouse$ : new BehaviorSubject('-1'),
        };

        // Data filter of API
        this._filter = {
            search: '',
            id_delivery_type: -1,
            type: -1,
            id_warehouse: -1,
            id_approval_status: -1,
            status_del: 1
        }

        this.list_type = [
            { id: "-1", name: this._translocoService.translate('all') },
            { id: 1, name: this._translocoService.translate('inventory.production_order') },
            { id: 2, name: this._translocoService.translate('inventory.sales_order') },
            { id: 3, name: this._translocoService.translate('inventory.write_down') }]


        // Get list sys_delivery_type
        this._baseComponentService.getListResolveData('sys_delivery_type.ctr/getListUse/', {})
            .subscribe((resp) => {
                this.list_sys_delivery_type = resp;
                this.list_sys_delivery_type.splice(0,0, { id: "-1", name: this._translocoService.translate('all') });
            });

        // Get list sys_warehouse
        this._baseComponentService.getListResolveData('sys_warehouse.ctr/getListUse/', {})
            .subscribe((resp) => {
                this.list_sys_warehouse = resp;
                this.list_sys_warehouse.splice(0,0, { id: "-1", name: this._translocoService.translate('all') });
            });
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
            approval_status: ['-1'],
            type: ['-1'],
            sys_warehouse: ['-1'],
            delivery_type: ['-1']
        });

        this.getListData();
        this.getPagination();

        // Filter if change value
        this.combineFilters(); {
            combineLatest([this.filters.query$, this.filters.approvalStatus$, this.filters.type$, this.filters.delivery_type$,
            this.filters.warehouse$]).pipe(debounceTime(300))
                .subscribe(([ query, approvalStatus, type, deliveryType, wareHouse ]) => {

                        // update _filter
                        this._filter = {...this._filter,
                            search: query,
                            id_delivery_type: deliveryType,
                            type: type,
                            id_warehouse: wareHouse,
                            id_approval_status: approvalStatus,
                        };
                        console.log('_filter: ', [ query, approvalStatus, type, deliveryType, wareHouse ]);

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
    filterByApprovalStatus(): void
    {
        this.filters.approvalStatus$.next(this._form.get('approval_status').value);
    }

    /**
     * Filter by type
     *
     * @param change
     */
    filterByType(): void
    {
        this.filters.type$.next(this._form.get('type').value);
    }

    /**
     * Filter by warehouse
     *
     * @param change
     */
    filterByWarehouse(): void
    {
        this.filters.warehouse$.next(this._form.get('sys_warehouse').value);
    }

    /**
     * Filter by delivery_type$
     *
     * @param change
     */
    filterByDeliveryType(): void
    {
        this.filters.delivery_type$.next(this._form.get('delivery_type').value);
    }

    toggleAdvanceSearch(): void {
        this.expand = !this.expand;
    }

    /**
     * Open dialog detail
     */
    openDialogComponent(model = null, pos = null, actionEnum = null): void {
        if (model !== null && pos !== null) {
            model.actionEnum = actionEnum;
        } else {
            model = {
                actionEnum: 1,
                db: {
                    id: 0,
                    type: 3,
                    export_date:new Date(),
                }
            };
        }
        // Custom model fields
        model.list_item = [];

        this.openDialog(model, InventoryDeliveryPopupAddComponent);
    }
}
