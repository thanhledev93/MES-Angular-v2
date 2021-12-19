import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    forwardRef,
    Input,
    OnDestroy,
    Output,
    ViewEncapsulation
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {observable, Subject} from 'rxjs';
import {MatSelectChange} from '@angular/material/select';

@Component({
    selector     : 'cm-select',
    templateUrl  : './cm-select.component.html',
    encapsulation: ViewEncapsulation.None,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef( () => CmSelectComponent),
            multi: true
        }
    ]
})
export class CmSelectComponent implements ControlValueAccessor, OnDestroy
{
    @Input() actionEnum: any = 1;
    @Input() errorModel: any = [];
    @Input() keyError: any;
    @Input() listData: any;
    @Input() label: any;
    @Input() labelAddString: string;
    @Input() type: any;
    @Input() callbackChange: Function;
    @Output() readonly objectChose: EventEmitter<any> = new EventEmitter<any>();

    public value: string;

    public changed: (value: string) => void;

    public touched: () => void;

    public isDisabled: boolean;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef
    )
    {
        if (this.type == '' || this.type == null) this.type = 'single';
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

        this.objectChose.emit(this.listData?.filter(d => d.id === change.value)[0]);
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
