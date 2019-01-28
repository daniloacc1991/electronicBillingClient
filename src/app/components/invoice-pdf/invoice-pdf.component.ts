import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { FormControl, Validators } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { delay } from 'rxjs/operators';

import { RtaComprobanteModel } from '../../models/rtaComprobante';
import { ErrorComponent } from '../shared/error/error.component';

import { InvoiceService } from '../../services/invoice.service';
import { ComfiarService } from '../../services/index';
import { AuthService } from '../../auth/auth.service';

export interface InvoiceSentsElement {
  consecutivo: string;
  empresa: string;
  estado_fe: string;
  factura: string;
  fecha: string;
  path_pdf: boolean;
  punto_venta: number;
  save_local: boolean;
  status: boolean;
  transaccion: number;
  typeinvoce: string;
  msj: string;
}

@Component({
  selector: 'app-invoice-pdf',
  templateUrl: './invoice-pdf.component.html',
  styleUrls: ['./invoice-pdf.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('flyInOut', [
      state('in', style({ transform: 'translateX(0)' })),
      transition('void => *', [
        style({ transform: 'translateX(-100%)' }),
        animate(500)
      ]),
      transition('* => void', [
        animate(100, style({ transform: 'translateX(100%)' }))
      ])
    ])
  ]
})
export class InvoicePdfComponent implements OnInit {
  pdfSrc: any;
  _messageError: string;
  valueFechas = {
    inicio: null,
    fin: null
  };

  fechaI: FormControl;
  fechaF: FormControl;
  minDateFin: Date;
  // maxDateFin = new Date() + 1;
  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns: string[] = [
    'consecutivo',
    'fecha',
    'factura',
    'typeinvoce',
    'empresa',
    'transaccion',
    'punto_venta',
    'estado_fe',
    'enviar',
    'save_local',
  ];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  dataSource = new MatTableDataSource<InvoiceSentsElement>();

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  constructor(private _is: InvoiceService,
    private _as: AuthService,
    private _cs: ComfiarService,
    private _titleService: Title,
    public _dialogError: MatDialog) {
    this._titleService.setTitle('Descargar Facturas - Facturación Electrónica');
    this._as.setApplicationName('Descargar Facturas - Facturación Electrónica');
    if (!localStorage.getItem('descargaPDF')) {
      this.valueFechas.inicio = new Date();
      this.valueFechas.fin = new Date();
      this.minDateFin = new Date();
    } else {
      this.valueFechas.inicio = new Date(JSON.parse(localStorage.getItem('descargaPDF')).inicio);
      this.valueFechas.fin = new Date(JSON.parse(localStorage.getItem('descargaPDF')).fin);
      this.minDateFin = new Date(JSON.parse(localStorage.getItem('descargaPDF')).inicio);
    }
  }

  ngOnInit() {
    this.fechaI = new FormControl({ value: this.valueFechas.inicio, disabled: true }, Validators.required);
    this.fechaF = new FormControl({ value: this.valueFechas.fin, disabled: true }, Validators.required);
    const fechaI = this.dateString(this.fechaI.value);
    const fechaF = this.dateString(this.fechaF.value);
    this.invoiceSent(fechaI, fechaF);
  }

  invoiceSent(fechaI: string, fechaF: string) {
    this._is.invoiceSend(fechaI, fechaF).subscribe(
      res => {
        this.dataSource.data = res.data.rows;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      err => {
        console.log(err);
      }
    );
  }

  pdf(position: number, invoice: string, transaccion: number, puntoVenta: number) {
    this.dataSource.data[position].status = true;
    const dataCom = this._as.getDataUserComfiar();
    this._cs.loginComfiar(dataCom.username, dataCom.password)
      .pipe(
        delay(1000)
      )
      .subscribe(
        resLogin => {
          this._cs.donwloadPDF(resLogin.data.rows, invoice, transaccion, puntoVenta).subscribe(
            resPDF => {
              this.converToPdf(resPDF.data.rows, invoice);
              this.dataSource.data[position].status = false;
              this.ngOnInit();
            },
            errPDF => {
              console.error(errPDF);
              this.dataSource.data[position].status = false;
              this._messageError = errPDF.error;
              this.openDialog();
            }
          );
        },
        errLogin => {
          console.error(errLogin);
          this.dataSource.data[position].status = false;
          this._messageError = errLogin.error;
          this.openDialog();
        }
      );
  }

  converToPdf(pdfBase64: string, invoice: string) {
    const sliceSize = 512;
    const byteCharacters = atob(pdfBase64);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    const blob = new Blob(byteArrays, { type: 'application/octet-stream' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = invoice + '.pdf';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  openDialog(): void {
    const dialogRef = this._dialogError.open(ErrorComponent, {
      data: {
        Message: this._messageError
      }
    });
  }

  consultar() {
    const fechaI = this.dateString(this.fechaI.value);
    const fechaF = this.dateString(this.fechaF.value);
    this.invoiceSent(fechaI, fechaF);
  }

  dateString(date: any) {
    let month, day;
    month = (date.getMonth() + 1) < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
    day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
    return `${date.getFullYear()}-${month}-${day}`;
  }

  changeFechaI(event: MatDatepickerInputEvent<Date>) {
    this.minDateFin = event.value;
    this.valueFechas.inicio = event.value;
    localStorage.setItem('descargaPDF', JSON.stringify(this.valueFechas));
    // this.minDateFin = event.value
  }

  changeFechaF(event: MatDatepickerInputEvent<Date>) {
    this.valueFechas.fin = event.value;
    localStorage.setItem('descargaPDF', JSON.stringify(this.valueFechas));
    // this.minDateFin = event.value
  }

  actualizarEstado(element: InvoiceSentsElement) {
    // console.log(element);
    const position = parseInt(element.consecutivo, 0) - 1;
    const invoice = element.factura;
    const puntoVenta = element.punto_venta;
    this.dataSource.data[position].status = true;
    const dataCom = this._as.getDataUserComfiar();
    this._cs.loginComfiar(dataCom.username, dataCom.password)
      .pipe(
        delay(2000)
      )
      .subscribe(
        resLogin => {
          this._cs.resposeVoucher(resLogin.data.rows, invoice, puntoVenta).subscribe(
            resVoucher => {
              const rtaDian: RtaComprobanteModel = resVoucher.data.rows;
              rtaDian.invoice = invoice;
              this._is.saveCufe(rtaDian).subscribe(
                resCufe => {
                  this.dataSource.data[position].status = false;
                  const fechaI = this.dateString(this.fechaI.value);
                  const fechaF = this.dateString(this.fechaF.value);
                  this.invoiceSent(fechaI, fechaF);
                },
                errCufe => {
                  this.dataSource.data[position].status = false;
                  this._messageError = errCufe.error;
                  this.openDialog();
                  console.error(errCufe);
                }
              );
            },
            errVoucher => {
              this.dataSource.data[position].status = false;
              this._messageError = errVoucher.error;
              this.openDialog();
              console.error(errVoucher);
            }
          );
        },
        errLogin => {
          this.dataSource.data[position].status = false;
          this._messageError = errLogin.error.error;
          this.openDialog();
          console.error(errLogin);
        }
      );
  }
}
