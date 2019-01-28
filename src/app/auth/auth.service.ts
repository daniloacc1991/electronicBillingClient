import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';

import { TokenBearerModel, ResponseModel } from '../models/';
import { UserComfiarModel } from '../models/userComfiar';

import { AppSettings } from '../proyect.conf';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private backAPI = AppSettings.backApi;
  private applicationName = 'Facturación Electronica';

  constructor(private _http: HttpClient) { }

  login(username: string, password: string) {
    const httpParams = new HttpParams()
      .append('user', username)
      .append('pass', password);
    return this._http.post<ResponseModel>(`${this.backAPI}user/login`, httpParams);
  }

  logOff() {
    const httpParams = new HttpParams()
      .append('token', JSON.parse(localStorage.getItem('token')).token);
    return this._http.put<ResponseModel>(`${this.backAPI}user/logoff`, httpParams);
  }

  getToken(): TokenBearerModel {
    return JSON.parse(localStorage.getItem('token'));
  }

  setToken(data: TokenBearerModel) {
    localStorage.setItem('token', JSON.stringify(data));
  }

  getDataUserComfiar(): UserComfiarModel {
    return JSON.parse(localStorage.getItem('userComfiar'));
  }

  setDataUser(data: UserComfiarModel) {
    localStorage.setItem('userComfiar', JSON.stringify(data));
  }

  loggedIn(): boolean {
    const token = this.getToken();
    if (token) {
      return true;
    } else {
      return false;
    }
  }

  getApplicationName(): Observable<string> {
    return of(this.applicationName);
  }

  setApplicationName(name: string) {
    this.applicationName = name;
  }

  getMenu() {
    return this._http.get<ResponseModel>(`${this.backAPI}user/menu`);
  }
}
