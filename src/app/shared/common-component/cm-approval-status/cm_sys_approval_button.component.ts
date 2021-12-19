import {Component, OnInit, Input, EventEmitter, Output, ViewEncapsulation} from '@angular/core';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';

import { TranslocoService } from '@ngneat/transloco';
import {BaseComponentService} from "../../base-component/base-component.service";
import { cm_sys_approval_popupComponent } from './cm_sys_approval_popup.component';

@Component({
    selector: 'cm_sys_approval_button',
    templateUrl: './cm_sys_approval_button.component.html',
    encapsulation: ViewEncapsulation.None,

    providers: [BaseComponentService,
        {provide: 'controller', useValue: ''},
    ],

})
export class cm_sys_approval_buttonComponent implements OnInit {
    @Input() id_sys_approval: any;
    @Input() id_record: any;
    @Input() create_by: any;
    @Input() create_date: any;
    @Input() menu: any;
    @Input() model: any;
    @Output() modelChange: EventEmitter<any> = new EventEmitter<any>();
    @Output() id_sys_approvalChange: EventEmitter<any> = new EventEmitter<any>();
    @Input() callbackChange: Function;
    navigation: any;
    public loading: boolean = true;
    public record: any = {
        db: {
            id_sys_approval_config: 0,
        }
    };

    // public currentUser: any = JSON.parse(localStorage.getItem('user'));

    // Test user le thi an
    public currentUser = {
        id: "user_10005",
        name: "Lê Thị  An",
        email: "",
        avatar_path: "/sys_user.ctr/avatarImage?id=a473e304-3e4a-41c7-8b75-80c22cef39ddfemale04.jpg&id_user=user_10005",
        status: "online"
    }

    constructor(
        private dialogRef: MatDialogRef<cm_sys_approval_buttonComponent>,
        private http: HttpClient,
        private dialog: MatDialog,
        private _translocoService: TranslocoService,
        private _baseComponentService: BaseComponentService

    ) {

    }
    ngOnInit(): void {
        this.record.db.menu = this.menu;
        this.record.db.id_record = this.id_record;
        this.record.db.create_by_record = this.create_by;
        this.record.db.create_date_record = this.create_date;
        if (this.id_sys_approval == null) {
            this.id_sys_approval = 0;
            this.record.db.id = this.id_sys_approval;
        } else {
            this.record.db.id = this.model.id;
        }

        this.loading = false;
    }
    approval(): void {
        this.loading = true;
        this.record.db.status_action = 2;
        this.http
            .post('sys_approval.ctr/approval/',
                this.record
            ).subscribe(resp => {
                this.loading = false;
                this.model = resp;
                this.modelChange.emit(this.model)

            });
    }
    cancel(): void {
        Swal.fire({
            title: this._translocoService.translate('common.reason'),
            input: 'text',
            inputAttributes: {
                autocapitalize: 'off'
            },
            showCancelButton: true,
            cancelButtonText: this._translocoService.translate('close'),
            confirmButtonText: this._translocoService.translate('common.confirm'),
            showLoaderOnConfirm: true,
            inputValidator: (value) => {
                if (!value) {
                    return this._translocoService.translate('common.must_input_reason')
                }
            },
            allowOutsideClick: () => false,
        }).then((result) => {
            if (result.value) {
                this.loading = true;
                this.record.db.status_action = 3;
                this.record.db.last_note = result.value;
                this.http
                    .post('sys_approval.ctr/cancel/',
                        this.record
                    ).subscribe(resp => {
                        this.model = resp;
                        this.modelChange.emit(this.model);
                        this.http
                            .post(this.record.db.menu + '.ctr/sync_cancel_approval/',
                                {
                                    id_approval: this.record.db.id,
                                    id_record: this.record.db.id_record
                                }
                            ).subscribe(resp => {
                                this.loading = false;
                            });

                    });
            }
        })
    }
    close(): void {
        Swal.fire({
            title: this._translocoService.translate('common.reason'),
            input: 'text',
            inputAttributes: {
                autocapitalize: 'off'
            },
            showCancelButton: true,
            cancelButtonText: this._translocoService.translate('close'),
            confirmButtonText: this._translocoService.translate('common.confirm'),
            showLoaderOnConfirm: true,
            inputValidator: (value) => {
                if (!value) {
                    return this._translocoService.translate('common.must_input_reason')
                }
            },
            allowOutsideClick: () => false,
        }).then((result) => {
            if (result.value) {
                this.loading = true;
                this.record.db.status_action = 6;
                this.record.db.last_note = result.value;
                this.http
                    .post('sys_approval.ctr/close/',
                        this.record
                    ).subscribe(resp => {
                        this.loading = false;
                        this.model = resp;
                        this.modelChange.emit(this.model);

                    });
            }
        })

    }
    open(): void {
        Swal.fire({
            title: this._translocoService.translate('common.reason'),
            input: 'text',
            inputAttributes: {
                autocapitalize: 'off'
            },
            showCancelButton: true,
            cancelButtonText: this._translocoService.translate('close'),
            confirmButtonText: this._translocoService.translate('common.confirm'),
            showLoaderOnConfirm: true,
            inputValidator: (value) => {
                if (!value) {
                    return this._translocoService.translate('common.must_input_reason')
                }
            },
            allowOutsideClick: () => false,
        }).then((result) => {
            if (result.value) {
                this.loading = true;
                this.record.db.status_action = 5;
                this.record.db.last_note = result.value;
                this.http
                    .post('sys_approval.ctr/open/',
                        this.record
                    ).subscribe(resp => {
                        this.model = resp;
                        this.modelChange.emit(this.model);
                        this.http
                            .post(this.record.db.menu + '.ctr/sync_cancel_approval/',
                                {
                                    id_approval: this.record.db.id,
                                    id_record: this.record.db.id_record
                                }
                            ).subscribe(resp => {
                                this.loading = false;
                            });

                    });
            }
        })
    }
    return(): void {
        Swal.fire({
            title: this._translocoService.translate('common.reason'),
            input: 'text',
            inputAttributes: {
                autocapitalize: 'off'
            },
            showCancelButton: true,
            cancelButtonText: this._translocoService.translate('close'),
            confirmButtonText: this._translocoService.translate('common.return'),
            showLoaderOnConfirm: true,
            inputValidator: (value) => {
                if (!value) {
                    return this._translocoService.translate('common.must_input_reason')
                }
            },
            allowOutsideClick: () => false,
        }).then((result) => {
            if (result.value) {
                this.loading = true;
                this.record.db.status_action = 3;
                this.record.db.last_note = result.value;
                this.http
                    .post('sys_approval.ctr/approval/',
                        this.record
                    ).subscribe(resp => {
                        this.loading = false;
                        this.model = resp;
                        this.modelChange.emit(this.model);

                    });
            }
        })

    }

    openDialogApproval(): void {
        console.log('this.record: ', this.record)
        this.record.actionEnum = 1;
        const dialogRef = this.dialog.open(cm_sys_approval_popupComponent, {

            disableClose: true,
            data: this.record,
        });
        dialogRef.afterClosed().subscribe(result => {
            if (this.id_sys_approval == 0) {
                this.loading = true;

                this._baseComponentService.getListResolveData(this.record.db.menu + '.ctr/sync_approval/',
                    {
                        id_approval: result?.id,
                        id_record: this.record.db.id_record
                    })
                    .subscribe((resp) => {
                        this.loading = false;
                    });
            }

            if (result !== undefined && result != null) {
                this.model = result;
                this.record.db.id = result.id;
                this.modelChange.emit(this.model)
                this.id_sys_approvalChange.emit(this.id_sys_approval);

                if (this.callbackChange != undefined && this.callbackChange != null)
                    this.callbackChange(result);
            }
        });
    }
}

