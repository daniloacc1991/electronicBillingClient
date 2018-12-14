import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';

import { ResponseModel } from '../models/response';
import { LoginModel } from '../models/login';
import { AppSettings } from '../proyect.conf';

import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  private backAPI = `${AppSettings.backApi}v0/invoice/`;
  headers = new HttpHeaders({
    // tslint:disable-next-line:max-line-length
    'Authorization': 'Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1NDQ3MDY5MTIzMjAsImlzcyI6Imh0dHA6Ly9sb2NhbGhvc3Q6MzAwMCIsInN1YiI6IjEwOTg3MDc3ODYiLCJqdGkiOjE4OSwic2NvcGUiOiJVU0VSIiwiaWF0IjoxNTQ0NTM0MTEyfQ.UgbplOawcBcPGkwvIdGsD-EH5v7T34GZfVBsG6ny95o31j3JbZJ0-uIUNFgYw9XFmzoEoi5Nvyinv8Mt549xsw'
  });

  constructor(private _http: HttpClient, private _as: AuthService) { }

  invoicePending(user: string) {
    return this._http.get<ResponseModel>(`${this.backAPI}pending/${user}`, { headers: this.headers });
  }

  invoice(factura: string) {
    return this._http.get<ResponseModel>(`${this.backAPI}${factura}`, { headers: this.headers });
  }

  saveTransaccion(invoice: string, transaccion: number) {
    const httpParams = new HttpParams()
      .append('invoice', invoice)
      .append('transaccion', transaccion.toString());
    return this._http.put<ResponseModel>(`${this.backAPI}savetransaccion`, httpParams, { headers: this.headers });
  }

  cufePending(user: string) {
    return this._http.get<ResponseModel>(`${this.backAPI}cufePending/${user}`, { headers: this.headers });
  }

  deleteTransaccion(invoice: string) {
    return this._http.delete<ResponseModel>(`${this.backAPI}deletetransaccion/${invoice}`, { headers: this.headers });
  }

  saveCufe(cufe: string, invoice: string) {
    const httpParams = new HttpParams()
      .append('cufe', cufe)
      .append('invoice', invoice);
    return this._http.put<ResponseModel>(`${this.backAPI}saveCufe`, httpParams, { headers: this.headers });
  }

  invoiceSend(user: string) {
    return this._http.get<ResponseModel>(`${this.backAPI}invoicesSent/${user}`, { headers: this.headers });
  }

  invoiceForYearxUser(date: string, user: string) {
    const httpParams = new HttpParams()
      .append('date', date)
      .append('user', user);
    return this._http.post<ResponseModel>(`${this.backAPI}foryearxuser`, httpParams, { headers: this.headers });
  }

  invoicesForUser(user: string) {
    const httpParams = new HttpParams()
      .append('user', user);
    return this._http.post<ResponseModel>(`${this.backAPI}electronicforuser`, httpParams, { headers: this.headers });
  }

  verifyToken(user: LoginModel) {
    return new Promise((resolve, reject) => {
      if (!this._as.validToken()) {
        this._as.login(user.username, user.password).subscribe(
          res => {
            localStorage.removeItem('token');
            this._as.setToken(res.data.rows);
            resolve(true);
          },
          err => {
            reject(false);
          }
        );
      }
      resolve(true);
    });
  }
}
