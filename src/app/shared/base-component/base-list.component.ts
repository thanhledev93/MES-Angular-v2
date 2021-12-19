/* eslint-disable */
import {
    AfterViewInit,
    ChangeDetectorRef,
    Directive,
    OnDestroy,
    OnInit, ViewChild,
} from '@angular/core';

import {debounceTime, delay, filter, map, switchMap, takeUntil, tap} from 'rxjs/operators';
import {merge, Subject} from 'rxjs';
import {NzTableComponent} from 'ng-zorro-antd/table';
import {MatDialog} from '@angular/material/dialog';
import {BaseComponentService} from './base-component.service';
import {MatSelectChange} from '@angular/material/select';
import {ComponentType} from '@angular/cdk/overlay';
import Swal from 'sweetalert2';
import {Pagination} from './base.types';
import {TranslocoService} from "@ngneat/transloco";
import {MatPaginator} from "@angular/material/paginator";
import {FormGroup} from "@angular/forms";
import {handleLinearGradient} from "ng-zorro-antd/progress/utils";

@Directive()
// tslint:disable-next-line:directive-class-suffix
export abstract class BaseListComponent implements OnInit, AfterViewInit, OnDestroy {
    public _form: FormGroup;
    public listData: any[];
    public pagination: Pagination;
    public isLoading: boolean = false;
    public list_status_del = [
        {id: '1', name: this._translocoService.translate('system.use')},
        {id: '2', name: this._translocoService.translate('system.not_use')}
    ];

    // Filter if changed value
    public filters: any;

    // Data filter of API
    public _filter: any;

    @ViewChild(MatPaginator, {
        static: false
    }) private _matPaginator: MatPaginator;

    public _unsubscribeAll: Subject<any> = new Subject<any>();

    protected constructor(
        public _changeDetectorRef: ChangeDetectorRef,
        public _baseComponentService: BaseComponentService,
        public _matDialog: MatDialog,
        public _translocoService: TranslocoService


    ) {
        this.isLoading = false;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
    }

    /**
     * After view init
     */
    ngAfterViewInit(): void {

        // Get listData if sort or page changes for ANGULAR_TABLE
        merge(this._matPaginator.page).pipe(
            switchMap(() => {
                this.isLoading = true;
                return this._baseComponentService.getListData( this._filter, (this._matPaginator.pageIndex + 1), this._matPaginator.pageSize, null, null, []);
            }),
            map(() => {
                this.isLoading = false;
            })
        ).subscribe();
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

    public rerender(): void {

        this.isLoading = true;

        this._baseComponentService.getListData(this._filter).subscribe((resp) => {
            this.isLoading = false;
        });
    }

    // Get the listData
    public getListData(): void {
        this._baseComponentService.listData$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((listData: any[]) => {
                this.listData = listData;

                console.log(this.listData);

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    // Get the pagination
    public getPagination(): void {
        this._baseComponentService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: Pagination) => {
                // Update the pagination
                this.pagination = pagination;

                console.log(this.pagination);

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    // combine filters
    public combineFilters(): void {

    }

    /**
     * Open dialog detail
     */
    openDialog(model = null, popUpAddComponent: ComponentType<any>): void {    // actionEnum: Detail = 3, Edit = 2, Add = 1

        const dialogRef = this._matDialog.open(popUpAddComponent, {
            maxHeight: '95vh',
            disableClose: true,
            data: model,
        });
        dialogRef.afterClosed().subscribe((resp) => {
            if (resp !== null && resp !== undefined) {
                this.rerender();

                // Mark for check
                this._changeDetectorRef.markForCheck();
            }
        });
    }


    /**
     * Delete job title
     */
    deleteRecord(id: string): void
    {

        Swal.fire({
            title: 'Bạn có chắc không?',
            text: '',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Có',
            cancelButtonText: 'Không'
        }).then(
            (result) => {
                if (result.value) {
                    if (this._baseComponentService.deleteRecord(id).subscribe()) {
                        // Display alert
                        Swal.fire('Xóa thành công', '', 'success');
                        this.rerender();
                    }
                }});

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }


    /**
     * Revert status
     */
    revertStatus(record, actionEnum): void {
        record.db.status_del = 1;
        // Update the department on the server
        this._baseComponentService.updateRecord(record, actionEnum).subscribe((resp: any) => {
            if (resp !== undefined && resp !== null) {
                // Display alert
                Swal.fire('Sử dụng lại thành công', '', 'success');
                this.rerender();
            }
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
        return item.db.id || index;
    }

}
