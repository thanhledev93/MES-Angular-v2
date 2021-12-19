/* eslint-disable */
import {BehaviorSubject, Observable} from 'rxjs';
import {filter, map, switchMap, take, tap} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {Inject, Injectable} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {lastIndexOf} from "lodash-es";
import {FuseConfirmationService} from "../../../@fuse/services/confirmation";

@Injectable({
    providedIn: 'root'
})
export class BaseComponentService
{
    private baseURL = 'https://localhost:5001/';
    // private controller = this.route.url.slice(1, -6); // get Controller from Url "/sys_department_index" --> "sys_department"

    // Private
    public _listData: BehaviorSubject<any[]> = new BehaviorSubject([]);
    public _record: BehaviorSubject<any> = new BehaviorSubject({});    /**
 * Constructor
 */
    public _pagination: BehaviorSubject<any> = new BehaviorSubject({});

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient,
                private _fuseConfirmationService: FuseConfirmationService,
                @Inject('controller') private controller: string
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for listData
     */
    get listData$(): Observable<any[]> {
        return this._listData.asObservable();
    }

    /**
     * Getter for data
     */
    get record$(): Observable<any> {
        return this._record.asObservable();
    }

    /**
     * Getter for pagination
     */
    get pagination$(): Observable<any> {
        return this._pagination.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get _listData
     *
     * @param _filter
     * @param pageSize
     * @param pageIndex
     * @param sortField
     * @param sortOrder
     *
     * @param filters
     */
    public getListData(_filter: any,
                       pageIndex: number = 1,
                       pageSize: number = 10,
                       sortField: string | null = null,
                       sortOrder: string | null = null,
                       _filters: Array<{ key: string; value: string[] }> = []): Observable<any> {

        console.log('getListData...');
        console.log('_filters: ', _filter)
        console.log('controller: ', this.controller)



        return this._httpClient.post<any>( this.baseURL + '' + this.controller + '.ctr/DataHandler/', {
            param1: { pageSize, pageIndex, sortField, sortOrder, _filters },
            data: _filter
        }).pipe(
            tap((response) => {
                console.log('Base response: ', response);

                this._pagination.next({
                    draw: response.draw,
                    receiptCode: response.receiptCode,
                    start: response.start,
                    recordsTotal: response.recordsTotal,
                    recordsFiltered: response.recordsFiltered,
                });
                this._listData.next(response.data);

                return response.data;
            })
        );
    }

    // eslint-disable-next-line @typescript-eslint/no-shadow
    getListResolveData(url: string, body: object = {}): Observable<any> {
        return this._httpClient.post(this.baseURL + url, body).pipe(tap(resp => resp));
    }

    /**
     * Create and Update and Revert record
     *
     * @param record
     */
    updateRecord(record: any, actionNum: number, controller: string = null): Observable<any>
    {
        console.log('start controller: ', controller)
        let action: string = '';

        if (actionNum === 1) {
            action = 'create';
        } else if (actionNum === 2) {
            action = 'edit';
        }
        if (!controller) {
            controller = this.controller;
        }

        console.log('controller popup: ', controller)

        return this._httpClient.post<any>(this.baseURL + '' + controller + '.ctr/' + action + '/', {
            data: record,
        }).pipe(
            map(updatedRecord =>

                // Return the updatedRecord
                 updatedRecord
            )
        );
    }

    /**
     * Delete the record
     *
     * @param id
     */
    deleteRecord(id: string): Observable<boolean>
    {
        return this.listData$.pipe(
            take(1),
            switchMap(listData => this._httpClient.post(this.baseURL + '' + this.controller + '.ctr/delete/', {
                id: id,
            }).pipe(
                map((isDeleted: boolean) => {

                    // Find the index of the deleted record
                    const index = listData.findIndex(item => item.db.id === id);

                    console.log('listData: ', listData)
                    console.log('index: ', index)


                    // Delete the record
                    listData.splice(index, 1);

                    // Update the listData
                    this._listData.next(listData);

                    // Return the deleted status
                    return isDeleted;
                })
            ))
        );
    }


    /**
     * Update the avatar of the given user
     *
     * @param id
     * @param avatar
     */
    uploadAvatar(id: string, avatar: File): Observable<any>
    {
        console.log('id: ', id);
        const URL = 'https://localhost:5001/sys_user.ctr/uploadAvatar?id_user=' + id;
        console.log('uploadAvatarService - url: ', URL);

        const formData = new FormData();
        formData.append('file', avatar);

        return this.listData$.pipe(
            take(1),
            switchMap(users => this._httpClient.post<any>(URL, formData ).pipe(
                map((updatedAvatarUser) => {
                    console.log('users: ', users);
                    console.log('updatedAvatarUser: ', updatedAvatarUser);

                    // Find the index of the updated contact
                    const index = users.findIndex(item => item.db.Id === id);

                    // Update user with avatar
                    users[index].db.avatar_path = updatedAvatarUser.avatar_path;

                    // Update the contacts
                    this._listData.next(users);

                    // Return the updated contact
                    console.log( 'userIndex: ', users[index]);
                    return users[index];
                }),
                switchMap(updatedUser => this.record$.pipe(
                    take(1),
                    filter((item: any) => item && item.db.Id === id),
                    tap(() => {

                        // Update the contact if it's selected
                        console.log('updatedUserAVT: ', updatedUser);
                        this._record.next(updatedUser);

                        // Return the updated contact
                        return updatedUser;
                    })
                ))
            ))
        );
    }

    confirmationDialog(title: string, message: string): void {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title,
            message,
            actions: {
                confirm: {
                    show: false,
                    label: "Remove",
                    color: "warn"
                },
                cancel: {
                    show: false,
                    label: "Đóng"
                }
            },
            dismissible: true
        });
    }
}
