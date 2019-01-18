import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { ResponseModel } from '../models/response';
import { TokenComfiar } from '../models/tokenComfiar';
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

  sendInvoice(dateToken: TokenComfiar, xml: string, puntoVenta: number) {
    const httpParams = new HttpParams()
      .append('token', dateToken.token)
      .append('date', dateToken.date)
      .append('invoice', xml)
      .append('puntoVenta', puntoVenta.toString());
    return this._http.post<ResponseModel>(`${this.apiBack}invoice`, httpParams);
  }

  outTransaccion(dateToken: TokenComfiar, transaccion: number) {
    const httpParams = new HttpParams()
      .append('token', dateToken.token)
      .append('date', dateToken.date)
      .append('transaccion', transaccion.toString());
    return this._http.post<ResponseModel>(`${this.apiBack}salidaTransaccion`, httpParams);
  }

  resposeVoucher(dateToken: TokenComfiar, invoice: string, transaccion: number, puntoVenta: number) {
    const httpParams = new HttpParams()
      .append('token', dateToken.token)
      .append('date', dateToken.date)
      .append('transaccion', transaccion.toString())
      .append('invoice', invoice)
      .append('puntoVenta', puntoVenta.toString());
    return this._http.post<ResponseModel>(`${this.apiBack}respuestaComprobante`, httpParams);
  }

  donwloadPDF(dateToken: TokenComfiar, invoice: string, transaccion: number, puntoVenta: number) {
    const httpParams = new HttpParams()
      .append('token', dateToken.token)
      .append('date', dateToken.date)
      .append('transaccion', transaccion.toString())
      .append('invoice', invoice)
      .append('puntoVenta', puntoVenta.toString());
    return this._http.post<ResponseModel>(`${this.apiBack}consultarpdf`, httpParams);
  }
}
