/* eslint-disable @typescript-eslint/member-ordering,@typescript-eslint/naming-convention */
import {
    AfterViewInit,
    ChangeDetectorRef,
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
import {TranslocoService} from '@ngneat/transloco';
import { BaseComponentService } from 'app/shared/base-component/base-component.service';
import { BasePopupAddComponent } from 'app/shared/base-component/base-popupAdd.component';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import Swal from 'sweetalert2';


@Component({
    selector: 'inventory-delivery-popupAdd',
    templateUrl: './popup-add.component.html',
    encapsulation: ViewEncapsulation.None,

    providers: [BaseComponentService,
        {provide: 'controller', useValue: 'inventory_delivery'},
    ],
})

export class InventoryDeliveryPopupAddComponent extends BasePopupAddComponent implements OnInit, OnDestroy, AfterViewInit {
    value = 2000;
    //table
    dataTableColumns: string[] = ['function', 'item', 'specification', 'warehouse_position', 'quantity', 'type_add'];
    @ViewChild(MatPaginator) private _matPaginator: MatPaginator;
    dataSource = new MatTableDataSource<any>([]);

    // Remove item in table
    pageIndex: any = 0;
    pageSize: any = 10;

    list_sys_approval_config: any = [];

    list_sys_delivery_type: any;
    list_sys_warehouse: any;
    list_type: any;
    type_add: any;
    listData_other_unit: any;
    list_position: any;

    item_chose: any;
    item_chose_specification: any;
    item_chose_other_unit: any;
    position_chose: any;

    objectChose: any;
    currentTypeAdd: any;

    addItem: any = {
        db: {}
    };

    /**
     * Constructor
     */
    constructor(
        public matDialogRef: MatDialogRef<InventoryDeliveryPopupAddComponent>,
        public _formBuilder: FormBuilder,
        public _baseComponentService: BaseComponentService,
        public _translocoService: TranslocoService,
        public _httpClient: HttpClient,
        @Inject(MAT_DIALOG_DATA) public data: any,
    ) {
        super(matDialogRef, _formBuilder, _baseComponentService, _translocoService);

        this.record = data;
        this.actionEnum = data.actionEnum;

        console.log('this.record: ', this.record = data)
        console.log('this.actionEnum: ', this.actionEnum )

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
            {id: 1, name: this._translocoService.translate('inventory.production_order')},
            {id: 2, name: this._translocoService.translate('inventory.sales_order')},
            {id: 3, name: this._translocoService.translate('inventory.write_down')}
           ]

        this.type_add = [
            {id: 1, name: this._translocoService.translate('inventory.follow_main_unit')},
            {id: 2, name: this._translocoService.translate('inventory.follow_specification')},
            {id: 3, name: this._translocoService.translate('inventory.follow_other_unit')}
        ]

        // Get list sys_delivery_type
        this._baseComponentService.getListResolveData('sys_delivery_type.ctr/getListUse/', {})
            .subscribe((resp) => {
                this.list_sys_delivery_type = resp;
            });

        // Get list sys_warehouse
        this._baseComponentService.getListResolveData('sys_warehouse.ctr/getListUse/', {})

            .subscribe((resp) => {
                this.list_sys_warehouse = resp;
            });

        // Get list sys_approval_config
        this._baseComponentService.getListResolveData('sys_approval_config.ctr/getListUse/', {data: {
                menu: 'inventory_delivery'
            }
        }).subscribe((resp) => {
                this.list_sys_approval_config = resp;
            });

        if (this.record.list_item.length == 0) {
            this._httpClient
                .post('https://localhost:5001/inventory_delivery.ctr/getListItem/', {
                        id: this.record.db.id
                    }
                ).subscribe((resp: any[]) => {

                // get list item for table
                this.record.list_item = resp; // load list item for View Mode
                this.dataSource.data = resp; // get dataSource for table / paginator for Edit Mode

            });
        } else {
            // Load item tu Tao phieu xuat cho LSX
            this.dataSource.data = this.record.list_item;
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

        // Create the form
        this._form = this._formBuilder.group({
            id: [''],
            id_delivery_type: [],
            id_warehouse: [],
            export_date: [''],
            name: [''],
            object_: [''],
            note: [''],
            type: ['']
        });

        this._form.patchValue(this.record.db)

        this._form.get('type').patchValue(this.list_type[this.record.db.type -1].name) // Chuyen type number --> text de load mac dinh

        this._formItem = this._formBuilder.group({
            item: [],
            specification: [],
            otherUnit: [],
            id_warehouse_position: [''],
            quantity: [''],
            stock: ['']
        });

        this._formItem.patchValue({
            quantity: [0],
        })


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
        console.log('type: ', this._form.get('type').value);

        // Get the department object
        const record = {
            db: this._form.getRawValue(),
            list_item: this.dataSource.data
        };

        record.db.type = this.list_type.find(d => d.name == this._form.get('type').value).id;


        this.saveRecord(record);
    }

    addDetail() {
        // db list_data
        // {
        //     "id_item": "item_10001",
        //     "id_unit": "unit_10001",
        //     "id_unit_main": "unit_10001",
        //     "quantity": 5,
        //     "quantity_unit_main": 5,
        //     "id_specification": 10001,
        //     "id_warehouse_position": "position_10001",
        //     "type_add": "2",
        //     "sys_item_unit_main_name": "Cây",
        //     "id_item_specification": 10001,
        //     "conversion_factor": 1
        // }

        const formItemValue = this._formItem.getRawValue()

        if (this.dataSource.data.find(d => d.db.id_item === this.item_chose.id) && this.dataSource.data.find(d =>
            d.db.id_specification === this.item_chose_specification?.id) && this.dataSource.data.find(d =>
            d.db.id_warehouse_position === this.position_chose?.id)) {
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
        this.addItem.db.id_warehouse_position = this.position_chose.id;
        this.addItem.warehouse_position_name = this.position_chose.name;



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

        // add item into first index in table and render record table
        this.dataSource.data.unshift(this.addItem);
        this.dataSource.data = [...this.dataSource.data]

        this.addItem = {
            db: {}
        };

    }

    resetFormItem(change) {

        // Set current Tab index
        this.currentTypeAdd = change;

        // this._formItem.reset();

        this._formItem.patchValue({
            quantity: [0],
            stock: ['']
        })
    }

    bind_data_item_chose(): void {

        // reset specification of item
        this._formItem.patchValue({
            specification: [''],
            id_warehouse_position: [''],
            stock: [''],
            quantity: [0]
        })

        if (this.currentTypeAdd === 2) {
            this.getOtherUnit();
        }

        this.getPosition()
    }

    bind_data_specification_chose(): void {
        this._formItem.patchValue({
            id_warehouse_position: [''],
            stock: ['']
        })

        this.getPosition()
    }
    bind_data_position_chose(): void {
       this._formItem.get('stock').patchValue(this.position_chose.quantity_ending_stocks);
    }

    deleteDetail(index: number) {

        let currentIndex = (this.pageIndex * this.pageSize) + index;

        this.dataSource.data.splice(currentIndex, 1);
        this.dataSource.data = [...this.dataSource.data];
    }

    getOtherUnit() {
        this._baseComponentService.getListResolveData('sys_item.ctr/getListUseOtherUnit/',
            {id_item: this._formItem.get('item').value}
        ).subscribe((resp) => {
            this.listData_other_unit = resp;
        });
    }
    getPosition() {


        this._baseComponentService.getListResolveData('sys_warehouse_position.ctr/getListExitedPosition/',
            {
                id_warehouse: this._form.get('id_warehouse').value,
                list_item: [{id_item: this._formItem.get('item').value, id_specification: this._formItem.get('specification').value}]

            }
        ).subscribe((resp) => {
            this.list_position = [];

            if(resp){
                resp.forEach((e) => {
                    let position: any = {};

                    position.id = e.id_warehouse_position;
                    position.name = e.name_warehouse_position;
                    position.quantity_ending_stocks = e.db.quantity_ending_stocks;

                    this.list_position.push(position);
                });

                console.log('this.list_position: ', this.list_position)
            }
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
