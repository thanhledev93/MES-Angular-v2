import {
    Component,
    forwardRef,
    Input,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { NG_VALUE_ACCESSOR} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { cm_sys_approval_status_popupComponent } from './cm_sys_approval_status_popup.component';

@Component({
    selector     : 'cm-approval-status',
    templateUrl  : './cm-approval-status.html',
    // styleUrls    : ['./date-range.component.scss'],
    encapsulation: ViewEncapsulation.None,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef( () => CmApprovalStatus),
            multi: true
        }
    ]
})
export class CmApprovalStatus implements OnInit
{
    @Input() model: any;
    @Input() actionEnum: any;


    constructor(
        public http: HttpClient,
        public dialog: MatDialog,
    ) {}

    ngOnInit(): void {
        if (this.model == null) this.model = 0;
    }

    openpopupview(): void {
        const dialogRef = this.dialog.open(cm_sys_approval_status_popupComponent, {
            maxHeight: '95vh',
            data: this.model
        });
        dialogRef.afterClosed().subscribe(result => { });
    }
}
