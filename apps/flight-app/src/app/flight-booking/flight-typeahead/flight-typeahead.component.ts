import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Flight } from '@flight-workspace/flight-lib';
import { Observable, of } from 'rxjs';
import { catchError, debounceTime, delay, distinctUntilChanged, filter, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'flight-workspace-flight-typeahead',
  templateUrl: './flight-typeahead.component.html',
  styleUrls: ['./flight-typeahead.component.css']
})
export class FlightTypeaheadComponent {
  control = new FormControl();
  flights$: Observable<Flight[]> | undefined;
  loading = false;

  constructor(private http: HttpClient) {
    // Stream 1: Value change of Form input
    // Trigger
    // Data Provider: Filter value for HTTP call
    this.flights$ = this.control.valueChanges.pipe(
      // Filter operators START
      filter(city => city.length > 2),
      debounceTime(300),
      distinctUntilChanged(),
      // Filter operators END
      // Side-effect
      tap(() => this.loading = true),
      // Stream 2: Server API call
      // Data Provider: Final Flight Search result
      switchMap(city => this.load(city).pipe(
        catchError(() => of([]))
      )),
      delay(1000),
      // Side-effect
      tap(() => this.loading = false)
    );
  }

  // Stream 2: Server API call
  load(from: string): Observable<Flight[]>  {
    const url = "http://www.angular.at/api/flight";

    const params = new HttpParams()
                        .set('from', from);

    const headers = new HttpHeaders()
                        .set('Accept', 'application/json');

    return this.http.get<Flight[]>(url, {params, headers});
  }
}
