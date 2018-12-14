import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';

import { ResponseModel } from '../models/response';
import { TokenModel } from '../models/token';
import { AppSettings } from '../proyect.conf';

@Injectable({
  providedIn: 'root'
})
export class ComfiarService {
  private apiBack = `${AppSettings.backApi}v0/comfiar/`;
  headers = new HttpHeaders({
    // tslint:disable-next-line:max-line-length
    'Authorization': 'Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1NDQ3MDY5MTIzMjAsImlzcyI6Imh0dHA6Ly9sb2NhbGhvc3Q6MzAwMCIsInN1YiI6IjEwOTg3MDc3ODYiLCJqdGkiOjE4OSwic2NvcGUiOiJVU0VSIiwiaWF0IjoxNTQ0NTM0MTEyfQ.UgbplOawcBcPGkwvIdGsD-EH5v7T34GZfVBsG6ny95o31j3JbZJ0-uIUNFgYw9XFmzoEoi5Nvyinv8Mt549xsw'
  });

  constructor(private _http: HttpClient) { }

  sendInvoice(dateToken: TokenModel, xml: string) {
    console.log(dateToken);
    const httpParams = new HttpParams()
      .append('token', dateToken.token)
      .append('date', dateToken.date)
      .append('invoice', xml);
    return this._http.post<ResponseModel>(`${this.apiBack}invoice`, httpParams, { headers: this.headers });
  }

  outTransaccion(dateToken: TokenModel, transaccion: number) {
    const httpParams = new HttpParams()
      .append('token', dateToken.token)
      .append('date', dateToken.date)
      .append('transaccion', transaccion.toString());
    return this._http.post<ResponseModel>(`${this.apiBack}salidaTransaccion`, httpParams, { headers: this.headers });
  }

  resposeVoucher(dateToken: TokenModel, invoice: string, transaccion: number) {
    const httpParams = new HttpParams()
      .append('token', dateToken.token)
      .append('date', dateToken.date)
      .append('transaccion', transaccion.toString())
      .append('invoice', invoice);
    return this._http.post<ResponseModel>(`${this.apiBack}respuestaComprobante`, httpParams, { headers: this.headers });
  }

  donwloadPDF(dateToken: TokenModel, invoice: string, transaccion: number) {
    const httpParams = new HttpParams()
      .append('token', dateToken.token)
      .append('date', dateToken.date)
      .append('transaccion', transaccion.toString())
      .append('invoice', invoice);
    return this._http.post<ResponseModel>(`${this.apiBack}consultarpdf`, httpParams, { headers: this.headers });
  }
}
