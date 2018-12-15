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
    'Authorization': `Bearer ${JSON.parse(localStorage.getItem('token')).token}`
  });

  constructor(private _http: HttpClient, private _as: AuthService) { }

  invoicePending() {
    return this._http.get<ResponseModel>(`${this.backAPI}pending`, { headers: this.headers });
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

  cufePending() {
    return this._http.get<ResponseModel>(`${this.backAPI}cufePending`, { headers: this.headers });
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

  invoiceSend() {
    return this._http.get<ResponseModel>(`${this.backAPI}invoicesSent`, { headers: this.headers });
  }

  invoiceForYearxUser(date: string) {
    const httpParams = new HttpParams()
      .append('date', date);
    return this._http.post<ResponseModel>(`${this.backAPI}foryearxuser`, httpParams, { headers: this.headers });
  }

  invoicesForUser() {
    return this._http.get<ResponseModel>(`${this.backAPI}electronicforuser`, { headers: this.headers });
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
