import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { ResponseModel } from '../models/response';
import { RtaComprobanteModel } from '../models/rtaComprobante';
import { AppSettings } from '../proyect.conf';

import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  private backAPI = `${AppSettings.backApi}invoice/`;

  constructor(private _http: HttpClient, private _as: AuthService) { }

  invoicePending() {
    return this._http.get<ResponseModel>(`${this.backAPI}pending`);
  }

  invoice(factura: string) {
    return this._http.get<ResponseModel>(`${this.backAPI}${factura}`);
  }

  saveTransaccion(invoice: string, transaccion: number) {
    const httpParams = new HttpParams()
      .append('invoice', invoice)
      .append('transaccion', transaccion.toString());
    return this._http.put<ResponseModel>(`${this.backAPI}savetransaccion`, httpParams);
  }

  cufePending() {
    return this._http.get<ResponseModel>(`${this.backAPI}cufePending`);
  }

  deleteTransaccion(invoice: string) {
    return this._http.delete<ResponseModel>(`${this.backAPI}deletetransaccion/${invoice}`);
  }

  // saveCufe(cufe: string, invoice: string, estado: string, recibeDian: string, respondeDian: string) {
  //   const httpParams = new HttpParams()
  //     .append('cufe', cufe)
  //     .append('invoice', invoice)
  //     .append('estado', estado)
  //     .append('recibeDian', recibeDian)
  //     .append('respondeDian', respondeDian);
  //   return this._http.put<ResponseModel>(`${this.backAPI}saveCufe`, httpParams);
  // }

  saveCufe(rtaComprobanteModel: RtaComprobanteModel) {
    const httpParams = new HttpParams()
      .append('rtaComprobante' , JSON.stringify(rtaComprobanteModel));
    return this._http.put<ResponseModel>(`${this.backAPI}saveCufe`, httpParams);
  }

  invoiceSend(fechaI: string, fechaF: string) {
    return this._http.get<ResponseModel>(`${this.backAPI}invoicesSent/${fechaI}/${fechaF}`);
  }

  invoiceForYearxUser(date: string) {
    const httpParams = new HttpParams()
      .append('date', date);
    return this._http.post<ResponseModel>(`${this.backAPI}foryearxuser`, httpParams);
  }

  invoicesForUser() {
    return this._http.get<ResponseModel>(`${this.backAPI}electronicforuser`);
  }

  viewPDF(invoice: string) {
    return this._http.get<ResponseModel>(`${this.backAPI}pdf/${invoice}`);
  }

}
