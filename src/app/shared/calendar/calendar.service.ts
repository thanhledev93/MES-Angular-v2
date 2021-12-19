import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { Moment } from 'moment';
import { Calendar, CalendarEvent, CalendarEventEditMode, CalendarSettings, CalendarWeekday } from './calendar.types';
import { TranslocoService } from '@ngneat/transloco';

@Injectable({
    providedIn: 'root'
})
export class CalendarService
{
    // Private
    private _calendars: BehaviorSubject<Calendar[] | null> = new BehaviorSubject(null);
    private _events: BehaviorSubject<CalendarEvent[] | null> = new BehaviorSubject(null);
    private _loadedEventsRange: { start: Moment | null; end: Moment | null } = {
        start: null,
        end  : null
    };
    private readonly _numberOfDaysToPrefetch = 60;
    private _settings: BehaviorSubject<CalendarSettings | null> = new BehaviorSubject(null);
    private _weekdays: BehaviorSubject<CalendarWeekday[] | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient, public _translocoService: TranslocoService)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for calendars
     */
    get calendars$(): Observable<Calendar[]>
    {
        return this._calendars.asObservable();
    }

    /**
     * Getter for events
     */
    get events$(): Observable<CalendarEvent[]>
    {
        return this._events.asObservable();
    }

    /**
     * Getter for settings
     */
    get settings$(): Observable<CalendarSettings>
    {
        return this._settings.asObservable();
    }

    /**
     * Getter for weekdays
     */
    get weekdays$(): Observable<CalendarWeekday[]>
    {
        return this._weekdays.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get calendars
     */
    getCalendars(): Observable<Calendar[]>
    {

        const calendars = [
            {
                id: 'notCompleted',
                title: this._translocoService.translate('notCompleted'),
                color: 'bg-blue-500',
                visible: true
            },
            {
                id: 'completed',
                title: this._translocoService.translate('completed'),
                color: 'bg-green-500',
                visible: true
            },
            {
                id: 'late',
                title: this._translocoService.translate('late'),
                color: 'bg-red-500',
                visible: true
            }
        ];
        this._calendars.next(calendars);
        return of(calendars)
    }

    /**
     * Add calendar
     *
     * @param calendar
     */
    addCalendar(calendar: Calendar): Observable<Calendar>
    {
        return this.calendars$.pipe(
            take(1),
            switchMap(calendars => this._httpClient.post<Calendar>('api/apps/calendar/calendars', {
                calendar
            }).pipe(
                map((addedCalendar) => {

                    // Add the calendar
                    calendars.push(addedCalendar);

                    // Update the calendars
                    this._calendars.next(calendars);

                    // Return the added calendar
                    return addedCalendar;
                })
            ))
        );
    }

    /**
     * Update calendar
     *
     * @param id
     * @param calendar
     */
    updateCalendar(id: string, calendar: Calendar): Observable<Calendar>
    {
        return this.calendars$.pipe(
            take(1),
            switchMap(calendars => this._httpClient.patch<Calendar>('api/apps/calendar/calendars', {
                id,
                calendar
            }).pipe(
                map((updatedCalendar) => {

                    // Find the index of the updated calendar
                    const index = calendars.findIndex(item => item.id === id);

                    // Update the calendar
                    calendars[index] = updatedCalendar;

                    // Update the calendars
                    this._calendars.next(calendars);

                    // Return the updated calendar
                    return updatedCalendar;
                })
            ))
        );
    }

    /**
     * Delete calendar
     *
     * @param id
     */
    deleteCalendar(id: string): Observable<any>
    {
        return this.calendars$.pipe(
            take(1),
            switchMap(calendars => this._httpClient.delete<Calendar>('api/apps/calendar/calendars', {
                params: {id}
            }).pipe(
                map((isDeleted) => {

                    // Find the index of the deleted calendar
                    const index = calendars.findIndex(item => item.id === id);

                    // Delete the calendar
                    calendars.splice(index, 1);

                    // Update the calendars
                    this._calendars.next(calendars);

                    // Remove the events belong to deleted calendar
                    const events = this._events.value.filter(event => event.calendarId !== id);

                    // Update the events
                    this._events.next(events);

                    // Return the deleted status
                    return isDeleted;
                })
            ))
        );
    }

    /**
     * Get events
     *
     * @param start
     * @param end
     * @param replace
     */
    getEvents(start: Moment, end: Moment, replace = false, filter: any, controller: any ): Observable<CalendarEvent[]>
    {
        // Set the new start date for loaded events
        if ( replace || !this._loadedEventsRange.start || start.isBefore(this._loadedEventsRange.start) )
        {
            this._loadedEventsRange.start = start;
        }

        // Set the new end date for loaded events
        if ( replace || !this._loadedEventsRange.end || end.isAfter(this._loadedEventsRange.end) )
        {
            this._loadedEventsRange.end = end;
        }

        // Get the events
        return this._httpClient.post<CalendarEvent[]>(`${controller}.ctr/getCalendar`, {
            data: filter,
        }).pipe(
            switchMap(response => this._events.pipe(
                take(1),
                map((events) => {

                    // If replace...
                    if ( replace )
                    {
                        // Execute the observable with the response replacing the events object
                        this._events.next(response);
                    }
                    // Otherwise...
                    else
                    {
                        // If events is null, replace it with an empty array
                        events = events || [];

                        // Execute the observable by appending the response to the current events
                        this._events.next([...events, ...response]);
                    }

                    // Return the response
                    return response;
                })
            ))
        );
    }

    /**
     * Reload events using the loaded events range
     */
    reloadEvents(start: Moment, end: Moment, replace = false, filter: any, controller: any ): Observable<CalendarEvent[]>
    {
        return this._httpClient.post<CalendarEvent[]>(`${controller}.ctr/getCalendar`, {
            data: filter,
        }).pipe(
            map((response) => {

                // Execute the observable with the response replacing the events object
                this._events.next(response);

                // Return the response
                return response;
            })
        );
    }
    
    /**
     * Get settings
     */
    getSettings(): Observable<CalendarSettings>
    {
        return this._httpClient.get<CalendarSettings>('api/apps/calendar/settings').pipe(
            tap((response) => {
                this._settings.next(response);
            })
        );
    }

    /**
     * Get weekdays
     */
    getWeekdays(): Observable<CalendarWeekday[]>
    {
        return this._httpClient.get<CalendarWeekday[]>('api/apps/calendar/weekdays').pipe(
            tap((response) => {
                this._weekdays.next(response);
            })
        );
    }
}
