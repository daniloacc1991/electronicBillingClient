import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

import { LoginModel } from '../models/login';
import { ResponseModel } from '../models/response';
import { TokenModel } from '../models/token';

import { AppSettings } from '../proyect.conf';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private backAPI = AppSettings.backApi;
  headers = new HttpHeaders({
    // tslint:disable-next-line:max-line-length
    'Authorization': 'Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1NDQ3MDY5MTIzMjAsImlzcyI6Imh0dHA6Ly9sb2NhbGhvc3Q6MzAwMCIsInN1YiI6IjEwOTg3MDc3ODYiLCJqdGkiOjE4OSwic2NvcGUiOiJVU0VSIiwiaWF0IjoxNTQ0NTM0MTEyfQ.UgbplOawcBcPGkwvIdGsD-EH5v7T34GZfVBsG6ny95o31j3JbZJ0-uIUNFgYw9XFmzoEoi5Nvyinv8Mt549xsw'
  });

  constructor(private _http: HttpClient, private router: Router) { }

  login(username: string, password: string) {
    const httpParams = new HttpParams()
      .append('user', username)
      .append('password', password);
    return this._http.post<ResponseModel>(`${this.backAPI}v0/comfiar/login`, httpParams, { headers: this.headers });
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

  logoff() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  loggedIn(): boolean {
    const token = this.getToken();
    if (token) {
      return true;
    } else {
      return false;
    }
  }

  validToken() {
    const dateNow = new Date().valueOf();
    const dateToken = new Date(this.getToken().date).valueOf();
    if (dateToken < dateNow) {
      return false;
    }
    return true;
  }
}
