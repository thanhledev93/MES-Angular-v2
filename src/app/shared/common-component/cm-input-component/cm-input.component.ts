/* eslint-disable no-trailing-spaces */
import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    forwardRef,
    Input,
    OnDestroy,
    OnInit,
    Output,
    Renderer2,
    TemplateRef,
    ViewChild,
    ViewContainerRef,
    ViewEncapsulation
} from '@angular/core';
import {ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR, Validators} from '@angular/forms';
import { Overlay } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { MatCalendarCellCssClasses, MatMonthView } from '@angular/material/datepicker';
import { Subject } from 'rxjs';

@Component({
    selector     : 'cm-input',
    templateUrl  : './cm-input.component.html',
    // styleUrls    : ['./date-range.component.scss'],
    encapsulation: ViewEncapsulation.None,

    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef( () => CmInputComponent),
            multi: true
        }
    ]
})
export class CmInputComponent implements ControlValueAccessor, OnDestroy
{
    @Input() actionEnum: any = 1;
    @Input() errorModel: any = [];
    @Input() keyError: any;
    @Input() label: any;
    @Input() placeholder: any;
    @Input() labelAddString: string;
    @Input() type: any;
    @Input() icon: any;
    @Input() suffixstring: any;
    @Input() isDisabled: boolean;
    @Input() callbackChange: Function;

    myOptions: any;

    public value: string;

    public changed: (value: string) => void;

    public touched: () => void;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef
    )
    {
        this.myOptions = {
            allowDecimalPadding:false
        };
        if (this.type == '' || this.type == null) {this.type = 'text';}
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

    onChange(value: string): void {
        this.value = value;
        this.changed(this.value);

        this.setChose();
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

    setChose(): void {
        if (this.callbackChange !== undefined && this.callbackChange !== null)
            this.callbackChange();
    }
}
