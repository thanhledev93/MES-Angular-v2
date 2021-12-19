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

@Component({
    selector: 'inventory-receiving-popupAdd',
    templateUrl: './popup-add.component.html',
    encapsulation: ViewEncapsulation.None,
})

export class InventoryReceivingPopupAddComponent extends BasePopupAddComponent implements OnInit, OnDestroy, AfterViewInit {
    //table
    dataTableColumns: string[] = ['function', 'item', 'specification', 'quantity', 'type_add'];
    @ViewChild(MatPaginator) private _matPaginator: MatPaginator;
    dataSource = new MatTableDataSource<any>([]);

    // Remove item in table
    pageIndex: any = 0;
    pageSize: any = 10;

    list_sys_approval_config: any = [];

    list_sys_receiving_type: any;
    list_sys_warehouse: any;
    list_type: any;
    type_add: any;
    listData_other_unit: any;

    item_chose: any;
    item_chose_specification: any;
    item_chose_other_unit: any;

    objectChose: any;
    currentTypeAdd: any;

    addItem: any = {
        db: {}
    };

    /**
     * Constructor
     */
    constructor(
        public matDialogRef: MatDialogRef<InventoryReceivingPopupAddComponent>,
        public _formBuilder: FormBuilder,
        public _baseComponentService: BaseComponentService,
        public _translocoService: TranslocoService,
        public _httpClient: HttpClient,
        @Inject(MAT_DIALOG_DATA) public data: any,
    ) {
        super(matDialogRef, _formBuilder, _baseComponentService, _translocoService);

        this.record = data;
        this.actionEnum = data.actionEnum;

        // Data filter of API
        this._filter = {
            search: '',
            id_receiving_type: -1,
            type: -1,
            id_warehouse: -1,
            id_approval_status: -1,
            status_del: 1
        }

        this.list_type = [
            {id: "-1", name: this._translocoService.translate('all')},
            {id: 1, name: this._translocoService.translate('inventory.production_order')},
            {id: 2, name: this._translocoService.translate('inventory.write_up')},
            {id: 3, name: this._translocoService.translate('inventory.purchase_order')}]

        this.type_add = [
            {id: 1, name: this._translocoService.translate('inventory.follow_main_unit')},
            {id: 2, name: this._translocoService.translate('inventory.follow_specification')},
            {id: 3, name: this._translocoService.translate('inventory.follow_other_unit')}
        ]


        // Get list sys_receiving_type
        this._baseComponentService.getListResolveData('sys_receiving_type.ctr/getListUse/', {})
            .subscribe((resp) => {
                this.list_sys_receiving_type = resp;
            });

        // Get list sys_warehouse
        this._baseComponentService.getListResolveData('sys_warehouse.ctr/getListUse/', {})

            .subscribe((resp) => {
                this.list_sys_warehouse = resp;
            });

        // Get list sys_approval_config
        this._baseComponentService.getListResolveData('sys_approval_config.ctr/getListUse/', {data: {
                menu: 'inventory_receiving'
            }
        }).subscribe((resp) => {
                this.list_sys_approval_config = resp;
            });

        if (this.record.list_item.length == 0) {
            this._httpClient
                .post('https://localhost:5001/inventory_receiving.ctr/getListItem/', {
                        id: this.record.db.id
                    }
                ).subscribe((resp: any[]) => {
                // get list item for table
                this.dataSource.data = resp;
            });
        }

        // Set default type_add = follow unit maim
        this.currentTypeAdd = 0;

    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Add or Update
        if (this.actionEnum !== 3) {
            // Create the form
            this._form = this._formBuilder.group({
                name: ['' , [Validators.required]],
                import_date: [''],
                type: [''],
                sys_receiving_type_name: [''],
                sys_warehouse_name: [''],
                object_: [''],
                note: [''],
            });


            // set default value
            this._form.patchValue({
                name: this.record.db.name === undefined ? '' : this.record.db.name,
                import_date: this.record.db.import_date,
                type: this.list_type[this.record.db.type].name,
                sys_receiving_type_name:  this.record.db.id_receiving_type,
                sys_warehouse_name: this.record.db.id_warehouse,
                object_: this.record.db.object_ === undefined ? '' : this.record.db.object_,
                note: this.record.db.note === undefined ? '' : this.record.db.note,
            })


            this._formItem = this._formBuilder.group({
                item: [null],
                specification: [null],
                otherUnit: [null],
                quantity: [null]
            });

            this._formItem.patchValue({
                quantity: [0]
            })
        }

        if (this.addItem.db.type_add === undefined) this.addItem.db.type_add = 1;
    }

    ngAfterViewInit() {
        if (this.actionEnum === 1) {
            this.save();
        }
        this.dataSource.paginator = this._matPaginator;
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Create and Update
     */
    save(): void {
        // Update List Item for record
        this.record.list_item = this.dataSource.data;

        // Get the department object
        const record = this._form.getRawValue();

        console.log('record.note: ', record.note)

        // Update department object
        const updatedRecord = {
            ...this.record,
            password: record.password,
            db: {...this.record.db,
                id_receiving_type: record.sys_receiving_type_name,
                id_warehouse: record.sys_warehouse_name,
                import_date: record.import_date,
                name: record.name,
                note: record.note,
                object_: record.object_,
            },
            type_name: record.type,
        };
        this.saveRecord(updatedRecord);
    }

    addDetail() {
        const formItemValue = this._formItem.getRawValue()

        if (this.dataSource.data.find(d => d.db.id_item === this.item_chose.id) && this.dataSource.data.find(d =>
            d.db.id_specification === this.item_chose_specification?.id)) {
            // Display alert
            Swal.fire('Đã tồn tại', '', 'error');

            return;
        }

        this.addItem.db.id_item = this.item_chose.id;
        this.addItem.db.id_unit = this.item_chose.id_unit;
        this.addItem.db.id_unit_main = this.item_chose.id_unit;
        this.addItem.db.quantity = formItemValue.quantity;
        this.addItem.sys_unit_main_name = this.item_chose.unit_name;
        this.addItem.sys_unit_name = this.item_chose.unit_name;
        this.addItem.sys_item_name = this.item_chose.name;
        this.addItem.db.type_add = this.currentTypeAdd + 1;


        if (this.addItem.db.type_add == 1) {
            this.addItem.db.quantity_unit_main = this.addItem.db.quantity;
        }
        else if (this.addItem.db.type_add == 2) {

            this.addItem.db.id_specification = this.item_chose_specification.id;
            this.addItem.sys_item_specification_name = this.item_chose_specification.name;
            this.addItem.db.conversion_factor = this.item_chose_specification.conversion_factor;
            this.addItem.db.id_unit = this.item_chose_specification.id_unit;

            this.addItem.db.quantity_unit_main = this.item_chose_specification.conversion_factor * this.addItem.db.quantity;
        } else if (this.addItem.db.type_add == 3) {

            this.addItem.db.conversion_factor = this.item_chose_other_unit.conversion_factor;
            this.addItem.db.id_unit = this.item_chose_other_unit.id;
            this.addItem.sys_unit_name = this.item_chose_other_unit.name;

            this.addItem.db.quantity_unit_main = this.item_chose_other_unit.conversion_factor * this.addItem.db.quantity;
        }

        // add item into table
        this.dataSource.data = [...this.dataSource.data,this.addItem];

        // reset form item
        this._formItem.reset();
        this.addItem = {
            db: {}
        };
    }

    resetFormItem(change) {

        // Set current Tab index
        this.currentTypeAdd = change;

        this._formItem.reset();

        this._formItem.patchValue({
            quantity: 0
        })
    }

    bind_data_item_chose(): void {

        // reset specification of item
        this._formItem.get('specification').setValue('');
        this._formItem.get('quantity').setValue(0)

        if (this.currentTypeAdd === 2) {
            this.getOtherUnit();
        }
    }

    deleteDetail(index: number) {

        let currentIndex = (this.pageIndex * this.pageSize) + index;

        this.dataSource.data.splice(currentIndex, 1);
        this.dataSource.data =[...this.dataSource.data];
    }

    getOtherUnit() {
        this._baseComponentService.getListResolveData('sys_item.ctr/getListUseOtherUnit/',
            {id_item: this._formItem.get('item').value}
        ).subscribe((resp) => {
            this.listData_other_unit = resp;
        });
    }


    onChangePage(pe:PageEvent) {
        this.pageIndex = pe.pageIndex;
        this.pageSize = pe.pageSize;
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
