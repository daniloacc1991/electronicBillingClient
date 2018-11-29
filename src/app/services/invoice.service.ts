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

  private backAPI = `${AppSettings.backApi}v1/invoice/`;

  constructor(private _http: HttpClient, private _as: AuthService) { }

  invoicePending(user: string) {
    return this._http.get<ResponseModel>(`${this.backAPI}pending/${user}`);
  }

  invoice(factura: string) {
    return this._http.get<ResponseModel>(`${this.backAPI}${factura}`);
  }

  saveTransaccion(invoice: string, transaccion: number) {
    const httpParams = new HttpParams()
      .append('invoice', invoice)
      .append('transaccion', transaccion.toString())
    return this._http.post<ResponseModel>(`${this.backAPI}saveTransaccion`, httpParams);
  }

  saveCufe(cufe: string, invoice: string) {
    const httpParams = new HttpParams()
      .append('cufe', cufe)
      .append('invocie', invoice)
    return this._http.post<ResponseModel>(`${this.backAPI}saveCufe`, httpParams);
  }

  invoiceSend(user: string) {
    return this._http.get<ResponseModel>(`${this.backAPI}invoicesSent/${user}`);
  }

  verifyToken(user: LoginModel) {
    return new Promise((resolve, reject) => {
      if (!this._as.validToken()) {
        this._as.login(user.username, user.password).subscribe(
          res => {
            this._as.setToken(res.data)
            resolve(true)
          },
          err => {
            reject(false)
          }
        )
      }
      resolve(true)
    })
  }
}
