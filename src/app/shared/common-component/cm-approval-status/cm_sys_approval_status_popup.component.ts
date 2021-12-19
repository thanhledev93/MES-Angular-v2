import {
    Component,
    ViewEncapsulation,
    Inject,
} from '@angular/core';
import { FormBuilder} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {BasePopupAddComponent} from "../../base-component/base-popupAdd.component";
import {BaseComponentService} from "../../base-component/base-component.service";
import {TranslocoService} from "@ngneat/transloco";
import {MatTableDataSource} from "@angular/material/table";
@Component({
    selector: 'cm_sys_approval_status_popup',
    templateUrl: './cm_sys_approval_status_popup.component.html',
    styleUrls  : ['./popup.component.scss'],
    encapsulation: ViewEncapsulation.None,

    providers: [BaseComponentService,
        {provide: 'controller', useValue: ''},
    ],
})
export class cm_sys_approval_status_popupComponent extends BasePopupAddComponent{
    public record: any;
    public loading: any = true;
    icon = [
        'heroicons_solid:star', // Bat dau quy trinh duyet
        'heroicons_solid:check-circle', // Da duyet
        'heroicons_solid:refresh', // Tra ve
        'heroicons_solid:x-circle', // Huy phieu
        'heroicons_solid:lock-open', // Mo phieu
        'heroicons_solid:lock-closed', // Dong phieu
    ];

    //table
    dataTableColumns: string[] = ['step_num', 'step_name', 'user_name', 'duration_hours', 'note'];
    dataSource = new MatTableDataSource<any>([]);

    /**
     * Constructor
     */
    constructor(
        public matDialogRef: MatDialogRef<cm_sys_approval_status_popupComponent>,
        public _formBuilder: FormBuilder,
        public _baseComponentService: BaseComponentService,
        public _translocoService: TranslocoService,
        public _httpClient: HttpClient,
        @Inject(MAT_DIALOG_DATA) public data: any,
    ) {
        super(matDialogRef, _formBuilder, _baseComponentService, _translocoService);

        this.record = data;
        this.actionEnum = data.actionEnum;

        // Get sys_approval
        this._baseComponentService.getListResolveData('sys_approval.ctr/getElementById/', {id: this.record.id})
            .subscribe((resp) => {
                this.dataSource.data = resp.list_step;
                this.record = resp;

            });
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

