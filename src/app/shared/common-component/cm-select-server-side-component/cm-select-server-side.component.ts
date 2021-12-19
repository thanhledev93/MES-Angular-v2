import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    forwardRef,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewEncapsulation
} from '@angular/core';
import {ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR} from '@angular/forms';
import {BehaviorSubject, Subject } from 'rxjs';
import {MatSelectChange} from '@angular/material/select';
import {debounceTime, filter, map, takeUntil, tap } from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import { BaseComponentService } from 'app/shared/base-component/base-component.service';

@Component({
    selector     : 'cm-select-server-side',
    templateUrl  : './cm-select-server-side.component.html',
    // styleUrls    : ['./date-range.component.scss'],
    encapsulation: ViewEncapsulation.None,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef( () => CmSelectServerSideComponent),
            multi: true
        }
    ]
})
export class CmSelectServerSideComponent implements ControlValueAccessor, OnInit, OnDestroy
{
    @Input() actionEnum: any = 1;
    @Input() errorModel: any = [];
    @Input() keyError: any;
    @Input() model: any;
    @Input() label: any;
    @Input() labelAddString: string;
    @Input() callbackChange: () => void;
    @Input() link: string;
    @Input() filterData: any;


    @Output() readonly objectChose: EventEmitter<any> = new EventEmitter<any>();

    public value: string;

    public changed: (value: string) => void;

    public touched: () => void;

    public isDisabled: boolean;

    inputFormControl: FormControl = new FormControl('');
    listData: any = [];
    searching: any;
    body: any = {};

    public filteredData: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _httpClient: HttpClient,
        private _baseComponentService: BaseComponentService
    )
    {
    }

    writeValue(value: any): void {
        this.value = value;
        this.filteredData.next([]);
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

        this.objectChose.emit(this.listData.filter(d => d.id === change.value)[0]);

        this.setChose();
    }

    /**
     * On init
     */
    ngOnInit(): void
    {
        // this.inputFormControl.setValue(this.model);
        // Subscribe to item select search field value changes
        this.inputFormControl.valueChanges
            .pipe(
                filter(query => !!query),
                tap(() => this.searching = true),
                takeUntil(this._unsubscribeAll),
                debounceTime(500),
                map((query) => {
                    if (this.filterData) {
                        this.body.data = {id_item: this.filterData};
                    }
                    this.body.search = query;

                    this._baseComponentService.getListResolveData(this.link, this.body)
                        .subscribe((resp) => {
                            this.filteredData.next(resp);
                            this.listData = resp;
                        });
                })).subscribe(() => {
            this.searching = false;
        });
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
        if (this.callbackChange !== undefined && this.callbackChange !== null) { this.callbackChange(); }
    }
}
