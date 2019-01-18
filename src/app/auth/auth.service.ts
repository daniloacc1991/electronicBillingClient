import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';

import { LoginModel } from '../models/login';
import { ResponseModel } from '../models/response';
import { TokenModel } from '../models/token';

import { AppSettings } from '../proyect.conf';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private backAPI = AppSettings.backApi;
  private applicationName = 'Facturación Electronica';

  constructor(private _http: HttpClient, private router: Router) { }

  login(username: string, password: string) {
    const httpParams = new HttpParams()
      .append('user', username)
      .append('pass', password);
    return this._http.post<ResponseModel>(`${this.backAPI}v0/user/login`, httpParams);
  }

  logOff() {
    const httpParams = new HttpParams()
      .append('token', JSON.parse(localStorage.getItem('token')).token);
    return this._http.put<ResponseModel>(`${this.backAPI}v0/user/logoff`, httpParams);
  }

  getToken(): TokenModel {
    return JSON.parse(localStorage.getItem('token'));
  }

  setToken(data) {
    localStorage.setItem('token', JSON.stringify(data));
  }

  getDataUser(): LoginModel {
    return JSON.parse(localStorage.getItem('user'));
  }

  setDataUser(data: LoginModel) {
    localStorage.setItem('user', JSON.stringify(data));
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
    return this._http.get<ResponseModel>(`${this.backAPI}v0/user/menu`);
  }
}
