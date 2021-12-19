/* eslint-disable @typescript-eslint/member-ordering,@typescript-eslint/naming-convention */
import {
    AfterViewInit,
    Component,
    Inject,
    OnDestroy,
    OnInit, ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {
    FormArray,
    FormBuilder,
    Validators
} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {TranslocoService} from "@ngneat/transloco";
import { DOCUMENT } from '@angular/common';
import { BaseComponentService } from 'app/shared/base-component/base-component.service';
import { BasePopupAddComponent } from 'app/shared/base-component/base-popupAdd.component';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import Swal from "sweetalert2";
import { FuseConfirmationService } from '@fuse/services/confirmation';

@Component({
    selector: 'inventory_item_line_up-list-popupAdd',
    templateUrl: './popup-add.component.html',
    encapsulation: ViewEncapsulation.None,

    providers: [BaseComponentService,
        {provide: 'controller', useValue: 'inventory_item_line_up'},
    ],
})

export class InventoryItemLineUpPopupAddComponent extends BasePopupAddComponent implements OnInit, OnDestroy, AfterViewInit {
    list_position: any;
    list_item_line_up: any;

    /**
     * Constructor
     */
    constructor(
        public matDialogRef: MatDialogRef<InventoryItemLineUpPopupAddComponent>,
        public _formBuilder: FormBuilder,
        public _baseComponentService: BaseComponentService,
        public _translocoService: TranslocoService,
        public _httpClient: HttpClient,
        public _fuseConfirmationService: FuseConfirmationService,
        @Inject(MAT_DIALOG_DATA) public data: any,
    ) {
        super(matDialogRef, _formBuilder, _baseComponentService, _translocoService);

        this.record = data;
        this.actionEnum = data.actionEnum;

        console.log('this.record; ', this.record)

        this._baseComponentService.getListResolveData('sys_warehouse_position.ctr/getListUse/',
            {id_warehouse: this.record.db.id_warehouse}
        ).subscribe((resp) => {
            this.list_position = resp;
        });

        this._baseComponentService.getListResolveData('inventory_item_line_up.ctr/getListItem/',
            {id_receiving_item: this.record.db.id}
        ).subscribe((resp) => {
            this.list_item_line_up = resp;

            // render warehousePositions for View mode or Edit mode when has list_item_line_up
            this.renderWarehousePositions();
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Add or Update
        // Create the form
        this._form = this._formBuilder.group({
            db: this._formBuilder.group({
                id_receiving_item: [''],
                id_inventory_receiving: [''],
                id_item: [''],
                conversion_factor: [''],
                id_specification: [''],
                id_unit_main: [''],
                id_unit: [''],
                type_add: [''],
                quantity_unit_main: [''],
                quantity: [''],
            }),
            // #
            sys_item_name: [''],
            sys_item_specification_name: [''],
            warehouse_name: [''],
            warehouse_positions: this._formBuilder.array([]),
        });


        // set default value
        this._form.patchValue(
            {...this.record,
              db: {...this.record.db, id_receiving_item: this.record.db.id}
            }
        );
    }

    ngAfterViewInit() {
        if (this.actionEnum === 1) {
            this.save();
        }
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    renderWarehousePositions(): void {
        // Setup the emails form array
        const positionFormGroups = [];

        // View Mode
        if ( this.list_item_line_up?.length > 0 )
        {
            console.log('length: ', this.list_item_line_up?.length)
            // Iterate through them
            this.list_item_line_up.forEach((d) => {

                // Create an email form group
                positionFormGroups.push(
                    this._formBuilder.group({
                        warehouse_position_name: [d.warehouse_position_name],
                        quantity_unit_main: [d.db.quantity_unit_main]
                    })
                );
            });
        }
        // Edit mode
        else {
            // Create an email form group
            positionFormGroups.push(
                this._formBuilder.group({
                    id_warehouse_position: [''],
                    quantity_unit_main: ['']
                })
            );
        }

        // Add the email form groups to the emails form array
        positionFormGroups.forEach((positionFormGroup) => {
            (this._form.get('warehouse_positions') as FormArray).push(positionFormGroup);
        });
    }

    /**
     * Create and Update
     */
    save(): void {

        let record = this._form.getRawValue();

        let list_records = [];
        let totalQuantity = 0;

        console.log('record; ', record);

        list_records = this._form.get('warehouse_positions').value.map((d) => {
            totalQuantity += d.quantity_unit_main;

            const updatedRecord = {
                db: {...record.db,
                    quantity_unit_main: d.quantity_unit_main,
                    id_warehouse_position: d.id_warehouse_position,
                }
            };
            return updatedRecord;
        });

        if (totalQuantity !== record.db.quantity_unit_main) {
            // Open the confirmation dialog
            this._baseComponentService.confirmationDialog('Chênh lệch số lượng',
                'Số lượng phải bằng số lượng chưa sắp xếp!')
            return;
        }

        this.saveRecord(list_records);
    }

    /**
     * Add the email field
     */
    addEmailField(): void
    {
        // Create an empty email form group
        const positionFormGroup = this._formBuilder.group({
            id_warehouse_position: [''],
            quantity_unit_main: ['']
        });

        // Add the email form group to the emails form array
        (this._form.get('warehouse_positions') as FormArray).push(positionFormGroup);

    }

    /**
     * Remove the email field
     *
     * @param index
     */
    removePositionField(index: number): void
    {
        // Get form array for emails
        const positionFormArray = this._form.get('warehouse_positions') as FormArray;

        // Remove the email field
        positionFormArray.removeAt(index);

    }


    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }
}
