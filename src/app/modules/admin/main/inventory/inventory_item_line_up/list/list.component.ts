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
import { InventoryItemLineUpPopupAddComponent } from '../popup-add/popup-add.component';

@Component({
    selector: 'inventory_item_line_up-list',
    templateUrl: './list.component.html',
    styleUrls  : ['./list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,

    providers: [BaseComponentService,
        {provide: 'controller', useValue: 'inventory_item_line_up'},
    ],
})
export class InventoryItemLineUpListComponent extends BaseListComponent implements OnInit, AfterViewInit, OnDestroy {
    list_sys_receiving_type: any;
    list_line_up_status: any;
    list_sys_warehouse: any;

    dataTableColumns: string[] = ['function', 'name', 'sys_warehouse', 'sys_item', 'sys_item_specification',
        'quantity', 'note', 'line_up_status'];


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
            query$      : new BehaviorSubject(''),
            status_del$ : new BehaviorSubject('1'),
            approvalStatus$ : new BehaviorSubject('-1'),

            // Custom filter
            receiving_type$ : new BehaviorSubject('-1'),
            line_up_status$ : new BehaviorSubject('1')
        };

        // Data filter of API
        this._filter = {
            search: '',
            id_receiving_type: -1,
            type: -1,
            id_warehouse: -1,
            id_approval_status: -1,
            status_del: 1,
            line_up_status: 1
        }

        this.list_line_up_status = [
            { id: 2, name: this._translocoService.translate('inventory.lined_up') },
            { id: 1, name: this._translocoService.translate('inventory.not_line_up') }];

        // Get list sys_delivery_type
        this._baseComponentService.getListResolveData('sys_receiving_type.ctr/getListUse/', {})
            .subscribe((resp) => {
                this.list_sys_receiving_type = resp;
                this.list_sys_receiving_type.splice(0,0, { id: "-1", name: this._translocoService.translate('all') });
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
            receiving_type: ['-1'],
            line_up_status: [1]
        });

        this.getListData();
        this.getPagination();

        // Filter if change value
        this.combineFilters(); {
            combineLatest([this.filters.query$, this.filters.receiving_type$, this.filters.line_up_status$]).pipe(debounceTime(300))
                .subscribe(([ query, receiving_type, line_up_status$]) => {

                        // update _filter
                        this._filter = {...this._filter,
                            search: query,
                            id_receiving_type: receiving_type,
                            line_up_status: line_up_status$
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
    filterByReceiving_type(): void
    {
        this.filters.receiving_type$.next(this._form.get('receiving_type').value);
    }

    /**
     * Filter by type
     *
     * @param change
     */
    filterByLineUpStatus(): void
    {
        this.filters.line_up_status$.next(this._form.get('line_up_status').value);
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

        this.openDialog(model, InventoryItemLineUpPopupAddComponent);
    }
}
