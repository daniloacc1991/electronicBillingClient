import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { ResponseModel } from '../models/response';
import { TokenModel } from '../models/token';
import { AppSettings } from '../proyect.conf';

@Injectable({
  providedIn: 'root'
})
export class ComfiarService {
  private apiBack = `${AppSettings.backApi}v0/comfiar/`;

  constructor(private _http: HttpClient) { }

  loginComfiar(user: string, passowrd: string) {
    const httpParams = new HttpParams()
      .append('user', user)
      .append('password', passowrd);

    return this._http.post<ResponseModel>(`${this.apiBack}login`, httpParams);
  }

  sendInvoice(dateToken: TokenModel, xml: string) {
    const httpParams = new HttpParams()
      .append('token', dateToken.token)
      .append('date', dateToken.date)
      .append('invoice', xml);
    return this._http.post<ResponseModel>(`${this.apiBack}invoice`, httpParams);
  }

  outTransaccion(dateToken: TokenModel, transaccion: number) {
    const httpParams = new HttpParams()
      .append('token', dateToken.token)
      .append('date', dateToken.date)
      .append('transaccion', transaccion.toString());
    return this._http.post<ResponseModel>(`${this.apiBack}salidaTransaccion`, httpParams);
  }

  resposeVoucher(dateToken: TokenModel, invoice: string, transaccion: number) {
    const httpParams = new HttpParams()
      .append('token', dateToken.token)
      .append('date', dateToken.date)
      .append('transaccion', transaccion.toString())
      .append('invoice', invoice);
    return this._http.post<ResponseModel>(`${this.apiBack}respuestaComprobante`, httpParams);
  }

  donwloadPDF(dateToken: TokenModel, invoice: string, transaccion: number) {
    const httpParams = new HttpParams()
      .append('token', dateToken.token)
      .append('date', dateToken.date)
      .append('transaccion', transaccion.toString())
      .append('invoice', invoice);
    return this._http.post<ResponseModel>(`${this.apiBack}consultarpdf`, httpParams);
  }
}
