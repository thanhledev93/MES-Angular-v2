import {Component, Inject, ViewEncapsulation} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TranslocoService } from '@ngneat/transloco';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {BasePopupAddComponent} from "../../base-component/base-popupAdd.component";
import {BaseComponentService} from "../../base-component/base-component.service";
import {MatTableDataSource} from "@angular/material/table";
@Component({
    selector     : 'cm_sys_approval_popup',
    templateUrl  : './cm_sys_approval_popup.component.html',
    encapsulation: ViewEncapsulation.None,

    providers: [BaseComponentService,
        {provide: 'controller', useValue: ''},
    ],
})
export class cm_sys_approval_popupComponent extends BasePopupAddComponent
{
    public listData_sys_approval:any
    public item_sys_approval_config: any = {
        list_item: []
    };

    //table
    dataTableColumns: string[] = ['step_num', 'step_name', 'user_name', 'duration_hours', 'note'];
    dataSource = new MatTableDataSource<any>([]);


    /**
     * Constructor
     */
    constructor(
        public matDialogRef: MatDialogRef<cm_sys_approval_popupComponent>,
        public _formBuilder: FormBuilder,
        public _baseComponentService: BaseComponentService,
        public _translocoService: TranslocoService,
        public _httpClient: HttpClient,
        @Inject(MAT_DIALOG_DATA) public data: any,
    ) {
        super(matDialogRef, _formBuilder, _baseComponentService, _translocoService);


        this.record = data;
        this.actionEnum = data.actionEnum; // Thuc hien create or update theo actionEnum
        this.record.db.id_sys_approval_config = null;

        // Nhan ve danh sach cau hinh duyet cho Select
        this._baseComponentService.getListResolveData('sys_approval_config.ctr/getListUse/', {data: {menu: this.record.db.menu}})
            .subscribe((resp) => {
                this.listData_sys_approval = resp;
            });
    }
    ngOnInit(): void {
        this._form = this._formBuilder.group({
            sys_approval: [''],
        });
    }
    bind_sys_approval_config(): void {

        this.record.db.id_sys_approval_config = this._form.get('sys_approval').value;
        this.record.db.menu = this.item_sys_approval_config.db.menu;
        this.record.db.total_step = this.item_sys_approval_config.db.step;
        this.record.list_step = this.item_sys_approval_config.list_item;

    }

    /**
     * Create and Update
     */
    save(): void {
        this.saveRecord(this.record, 'sys_approval');
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

