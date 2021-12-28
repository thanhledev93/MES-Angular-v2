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
    FormArray,
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

    //table
    dataTableColumns: string[] = ['function', 'item', 'specification', 'warehouse_position', 'current_stock', 'quantity', 'type_add'];
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

    // ---
    list_item_position: any[];

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
            db: this._formBuilder.group({
                id: [''],
                id_delivery_type: [],
                id_warehouse: [],
                id_production_order: [''],
                export_date: [''],
                name: [''],
                object_: [''],
                note: [''],
                type: [''],
            }),

            list_item: this._formBuilder.array([]),
        });

        this._form.patchValue(this.record);

        // Chuyen type number --> text de load mac dinh
        this._form.get('db.type').setValue(this.list_type[this.record.db.type -1].name);

        this._formItem = this._formBuilder.group({
            item: [''],
            specification: [''],
            otherUnit: [''],
            quantity: [0]
        });

        if (this.addItem.db.type_add === undefined) this.addItem.db.type_add = 1;

        // Neu co list items se push vao form array list_item
        this.renderListItemFormArr();

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
    renderListItemFormArr(): void {

        //reset list_item
        this._form.get('list_item')['controls'] = [];


        // Setup the emails form array
        const listItemFormGroups = [];

        if (this.dataSource.data.length > 0) {
            this.dataSource.data.forEach(item => {
                // Create an email form group
                listItemFormGroups.push(
                    this._formBuilder.group({
                        item: [item.db.id_item],
                        specification: [item.db.id_specification],
                        otherUnit: [item.db.otherUnit],

                        // #
                        quantity: [item.db.quantity],
                        id_warehouse_position: [''],
                        quantity_ending_stocks: [{value: 0, disabled: true}],
                        list_position: [[]]
                    })
                );
            })
        }

        // Add the email form groups to the emails form array
        listItemFormGroups.forEach((itemFormGroup) => {
            (this._form.get('list_item') as FormArray).push(itemFormGroup);
        });
    }

    getPosition() {

        // re-render list_item for table
        this.renderListItemFormArr();

        console.log('after render: ', this._form.get('list_item'))

        this.list_item_position = [];

        // Duyet tung item trong table
        this.dataSource.data.forEach((item,index) => {
            this.list_item_position.push(
                {
                    id_item: item.db.id_item,
                    id_specification: item.db.id_specification
                }
            )
        })

        console.log('list_item_position; ', this.list_item_position)

        this._baseComponentService.getListResolveData('sys_warehouse_position.ctr/getListExitedPosition/',
            {
                id_warehouse: this._form.get('db.id_warehouse').value,
                list_item: this.list_item_position
            }
        ).subscribe((resp) => {
            if( resp ) {

                this._form.get('list_item').value.forEach(item => {

                    // Iterate through them
                    resp.forEach((e) => {

                        if (item.item === e.db.id_item && item.specification === e.db.id_specification) {
                            let position: any = {};
                            position.id_item = e.db.id_item;
                            position.id_specification = e.id_specification;
                            position.id = e.id_warehouse_position;
                            position.name = e.name_warehouse_position;
                            position.quantity_ending_stocks = e.db.quantity_ending_stocks;

                            item.list_position.push(position);

                        }
                    })

                })


            }
        })
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

            // Open the confirmation dialog
            this._baseComponentService.confirmationDialog('Đã tồn tại',
                'Mặt hàng đã được thêm vào danh sách!')
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

        // Add item into table and get position
        this.addPosition(this.addItem, this.dataSource.data.length);


        this.addItem = {
            db: {}
        };

        console.log('this.dataSource.data: ', this.dataSource.data)
    }

    /**
     * Create and Update
     */
    save(): void {

        // {
        //     "id": 20304,
        //     "quantity": 100,
        //     "id_warehouse_position": "position_10002"
        // }

        let record = this._form.getRawValue();
        let list_itemUpdated = [];

        console.log('record.list_item: ', record.list_item)
        if (this.dataSource.data.length > 0) {
            list_itemUpdated = record.list_item.map((d, index) => {

                const updatedItem = {
                    db: {...this.dataSource.data[index].db,
                        quantity: d.quantity,
                        id_warehouse_position: d.id_warehouse_position,
                    }
                };
                return updatedItem;
            });
        }

        // Chuyen type text --> number
        record.db.type = this.list_type.find(d => d.name == this._form.get('db.type').value).id;
        record.list_item = list_itemUpdated;

        console.log('list_itemUpdated: ', list_itemUpdated)
        console.log('record; ', record);

        this.saveRecord(record);

    }

    /**
     * Remove the email field
     *
     * @param index
     */
    removePositionField(index: number): void
    {
        console.log('remove index: ', index)

        // Get form array for emails
        const positionFormArray = this._form.get('list_item') as FormArray;

        // Remove the email field
        positionFormArray.removeAt(index);

        console.log('delete list_item: ',  this._form.get('list_item').value)

    }

    resetFormItem(change) {

        // Set current Tab index
        this.currentTypeAdd = change;

        // this._formItem.reset();

        // this._formItem.patchValue({
        //     quantity: [0],
        //     stock: ['']
        // })
    }

    bind_data_item_chose(): void {

        // reset specification of item
        // this._formItem.patchValue({
        //     specification: [''],
        //     id_warehouse_position: [''],
        //     stock: [''],
        //     quantity: [0]
        // })

        if (this.currentTypeAdd === 2) {
            this.getOtherUnit();
        }

    }

    bind_data_specification_chose(): void {
        // this._formItem.patchValue({
        //     id_warehouse_position: [''],
        //     stock: ['']
        // })

    }
    bind_data_position_chose(): void {
       // this._formItem.get('stock').patchValue(this.position_chose.quantity_ending_stocks);
    }

    deleteDetail(index: number) {

        let currentIndex = (this.pageIndex * this.pageSize) + index;

        this.dataSource.data.splice(currentIndex, 1);
        this.dataSource.data = [...this.dataSource.data];

        this.removePositionField(index);
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

    getValueSelect(change: any, index: any) {
        console.log('index: ', index)
        console.log('changed: ', this._form.get('list_item')['controls'][index])

        // Lay quantity_ending_stocks tai position duoc chon
       const i = this._form.get('list_item').value[index].list_position.findIndex(d => d.id === change);
       const quantity_ending_stocks = this._form.get('list_item').value[index].list_position[i].quantity_ending_stocks

        // this._form.get('list_item')['controls'][index].get('id_warehouse_position').setValue(change);
        this._form.get('list_item')['controls'][index].get('quantity_ending_stocks').setValue(quantity_ending_stocks)

    }

    addPosition(data: any, index: number) {

        this.dataSource.data.splice(index + 1, 0, data);
        this.dataSource.data = [...this.dataSource.data];

        // Create an email form group
        const positionFormGroup = this._formBuilder.group({
            item: [data.db.id_item],
            specification: [data.db.id_specification],
            otherUnit: [data.db.otherUnit],

            // #
            quantity: [data.db.quantity],
            id_warehouse_position: [''],
            quantity_ending_stocks: [{value: 0, disabled: true}],
            list_position: [[]]
        });

        // Add the email form group to the emails form array
        (this._form.get('list_item') as FormArray).push(positionFormGroup);

        // re-render list_position
        this.getPosition();

    }
}
