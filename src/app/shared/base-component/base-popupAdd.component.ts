import {
    ChangeDetectorRef,
    Directive,
    OnDestroy,
    OnInit
} from '@angular/core';

import {Subject} from 'rxjs';
import {MatDialogRef} from '@angular/material/dialog';
import {BaseComponentService} from './base-component.service';
import {FormBuilder, FormGroup} from '@angular/forms';
import Swal from 'sweetalert2';
import {TranslocoService} from "@ngneat/transloco";

@Directive()
// tslint:disable-next-line:directive-class-suffix
export abstract class BasePopupAddComponent implements OnInit, OnDestroy {

    public errorModel: any;
    public actionEnum: number;
    public _form: FormGroup;
    public _formItem: FormGroup;
    public record: any;

    public _changeDetectorRef: ChangeDetectorRef;
    public _filter: any;

    public searching: boolean = false;

    public _unsubscribeAll: Subject<any> = new Subject<any>();

    public list_approval_status = [
        {
            id: '-1',
            name: this._translocoService.translate("common.all")
        },
        {
            id: 1,
            name: this._translocoService.translate("common.create")
        },
        {
            id: 2,
            name: this._translocoService.translate("common.waiting_approval")
        },
        {
            id: 3,
            name: this._translocoService.translate("common.approved")
        },
        {
            id: 4,
            name: this._translocoService.translate("common.cancel")
        },
        {
            id: 5,
            name: this._translocoService.translate("common.return")
        },
        {
            id: 6,
            name: this._translocoService.translate("common.waiting_me")
        },
        {
            id: 7,
            name: this._translocoService.translate("common.return_for_me")
        },
        {
            id: 8,
            name: this._translocoService.translate("common.record_closed")
        }

    ]

    public type_add = [
        {
            id: 1,
            name: this._translocoService.translate('follow_main_unit')
        },
        {
            id: 2,
            name: this._translocoService.translate('follow_specification')
        },
        {
            id: 3,
            name: this._translocoService.translate('follow_other_unit')
        },
    ]

    protected constructor(
        public matDialogRef: MatDialogRef<any>,
        public _formBuilder: FormBuilder,
        public _baseComponentService: BaseComponentService,
        public _translocoService: TranslocoService
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.errorModel = [];
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }


    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    close(): void {
        this.matDialogRef.close();
    }

    /**
     * Create and Update the department
     */
    saveRecord(updatedRecord, controller: string = null): void {
        this._baseComponentService.updateRecord(updatedRecord, this.actionEnum, controller).subscribe((resp) => {

            // Display alert
            Swal.fire('Lưu thành công', '', 'success');

            this.matDialogRef.close(resp);

        }, (error) => {
            if (error.status === 400) {
                this.errorModel = error.error;
            }
        });


    }

}
