import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';

import { LoginModel } from '../models/login';
import { ResponseModel } from '../models/response';
import { TokenModel } from '../models/token';

import { AppSettings } from '../proyect.conf';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private backAPI = AppSettings.backApi;

  constructor(private _http: HttpClient, private router: Router) { }

  login(username: string, password: string) {
    const httpParams = new HttpParams()
      .append('user', username)
      .append('password', password)
    return this._http.post<ResponseModel>(`${this.backAPI}v1/comfiar/login`, httpParams)
  }

  getToken(): TokenModel {
    return JSON.parse(localStorage.getItem('token'))
  }

  setToken(data) {
    localStorage.setItem('token', JSON.stringify(data))
  }

  getDataUser(): LoginModel {
    return JSON.parse(localStorage.getItem('user'))
  }

  setDataUser(data: LoginModel) {
    localStorage.setItem('user', JSON.stringify(data))
  }

  logoff() {
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  loggedIn(): boolean {
    const token = this.getToken();
    console.log(token)
    if (token) {
      return true
    } else {
      return false
    }
  }

  validToken() {
    const dateNow = new Date().valueOf();
    const dateToken = new Date(this.getToken().date).valueOf();
    if (dateToken < dateNow) {
      console.log('Token vencido')
      return false;
    }
    return true
  }
}
