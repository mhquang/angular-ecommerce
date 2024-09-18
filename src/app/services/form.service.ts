import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { City } from '../common/city';
import { District } from '../common/district';

@Injectable({
  providedIn: 'root',
})
export class FormService {
  private citiesUrl = 'http://localhost:8080/api/cities?size=100';
  private distrcitsUrl = 'http://localhost:8080/api/districts';

  constructor(private httpClient: HttpClient) {}

  getCities(): Observable<City[]> {
    return this.httpClient
      .get<GetResponseCities>(this.citiesUrl)
      .pipe(map((response) => response._embedded.cities));
  }

  getDistricts(theCityId: string): Observable<District[]> {
    const searchUrl = `${this.distrcitsUrl}/search/findByCityId?id=${theCityId}`;

    return this.httpClient
      .get<GetResponseDistricts>(searchUrl)
      .pipe(map((response) => response._embedded.districts));
  }

  getCreditCardMonths(startMonth: number): Observable<number[]> {
    let data: number[] = [];

    // build an array for Month dropdown list
    // start at desired startMonth and loop until 12

    for (let month = startMonth; month <= 12; month++) {
      data.push(month);
    }

    return of(data);
  }

  getCreditCardYears(): Observable<number[]> {
    let data: number[] = [];

    const startYear: number = new Date().getFullYear();
    const endYear: number = startYear + 10;

    for (let year = startYear; year <= endYear; year++) {
      data.push(year);
    }

    return of(data);
  }
}

interface GetResponseCities {
  _embedded: {
    cities: City[];
  };
}

interface GetResponseDistricts {
  _embedded: {
    districts: District[];
  };
}
