import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';

import { ResponseModel } from '../models/response';
import { TokenModel } from '../models/token';
import { AppSettings } from '../proyect.conf';

@Injectable({
  providedIn: 'root'
})
export class ComfiarService {
  private apiBack = `${AppSettings.backApi}v1/comfiar/`;

  constructor(private _http: HttpClient) { }

  sendInvoice(dateToken: TokenModel, xml: string) {
    const data = {
      ...dateToken,
      invoice: xml
    }
    return this._http.post<ResponseModel>(`${this.apiBack}invoice`, data);
  }

  outTransaccion(dateToken: TokenModel, transaccion: number) {
    const data = {
      ...dateToken,
      transaccion
    }
    return this._http.post<ResponseModel>(`${this.apiBack}salidaTransaccion`, data);
  }

  resposeVoucher(dateToken: TokenModel, invoice: string, transaccion: number) {
    const data = {
      ...dateToken,
      transaccion,
      invoice
    }
    return this._http.post<ResponseModel>(`${this.apiBack}respuestaComprobante`, data);
  }

  donwloadPDF(dateToken: TokenModel, invoice: string, transaccion: number) {
    const httpParams = new HttpParams()
      .append('token', dateToken.token)
      .append('date', dateToken.date)
      .append('transaccion', transaccion.toString())
      .append('invoice', invoice)
    console.log(httpParams)
    return this._http.post<ResponseModel>(`${this.apiBack}consultarpdf`, httpParams);
  }
}
