import {
    Component,
    OnInit,
    ViewEncapsulation,
    Input,
    EventEmitter,
    Output,
    forwardRef,
    OnDestroy,
    ChangeDetectorRef
} from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';

import Swal from 'sweetalert2';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";
import {Subject} from "rxjs";
import {MatSelectChange} from "@angular/material/select";
@Component({
    selector     : 'cm_sys_approval_filter',
    templateUrl  : './cm_sys_approval_filter.component.html',
    encapsulation: ViewEncapsulation.None,

    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef( () => cm_sys_approval_filterComponent),
            multi: true
        }
    ]
})
export class cm_sys_approval_filterComponent implements ControlValueAccessor, OnDestroy, OnInit
{

    @Input() callbackChange: Function;
    public listData: any;

    constructor(
        public _translocoService: TranslocoService,
        private _changeDetectorRef: ChangeDetectorRef
    ) {
    }
    public value: string;

    public changed: (value: string) => void;

    public touched: () => void;

    public isDisabled: boolean;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    ngOnInit() {
        this.listData = [
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

    writeValue(value: any): void {
        this.value = value;
    }
    registerOnChange(fn: any): void {
        this.changed = fn;
    }
    registerOnTouched(fn: any): void {
        this.touched = fn;
    }
    setDisabledState?(isDisabled: boolean): void {
        this.isDisabled = isDisabled;
    }

    onChange(change: MatSelectChange): void {

        this.value = change.value;
        this.changed(this.value);

        this.setChose();
    }
    setChose(): void {
        if (this.callbackChange !== undefined && this.callbackChange != null)
        this.callbackChange();
    }









}

