import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AppSettings } from '../proyect.conf';
import { ResponseModel } from '../models/response';
import { RtaComprobanteModel } from '../models/rtaComprobante';

@Injectable({
  providedIn: 'root'
})
export class NoteService {

  private backAPI = `${AppSettings.backApi}note/`;

  constructor(private _http: HttpClient) { }

  pending() {
    return this._http.get<ResponseModel>(`${this.backAPI}pending`);
  }

  resend() {
    return this._http.get<ResponseModel>(`${this.backAPI}resend`);
  }

  sent(fechaI: string, fechaF: string) {
    return this._http.get<ResponseModel>(`${this.backAPI}sent/${fechaI}/${fechaF}`);
  }

  note(note: string) {
    return this._http.get<ResponseModel>(`${this.backAPI}complete/${note}`);
  }

  saveTransaccion(note: string, transaccion: number) {
    const httpParams = new HttpParams()
      .append('note', note)
      .append('transaccion', transaccion.toString());
    return this._http.put<ResponseModel>(`${this.backAPI}savetransaccion`, httpParams);
  }

  deleteTransaccion(note: string) {
    return this._http.delete<ResponseModel>(`${this.backAPI}deletetransaccion/${note}`);
  }

  saveCufe(rtaComprobanteModel: RtaComprobanteModel) {
    const httpParams = new HttpParams()
      .append('rtaComprobante' , JSON.stringify(rtaComprobanteModel));
    return this._http.put<ResponseModel>(`${this.backAPI}saveCufe`, httpParams);
  }

  viewPDF(note: string) {
    return this._http.get<ResponseModel>(`${this.backAPI}pdf/${note}`);
  }
}
