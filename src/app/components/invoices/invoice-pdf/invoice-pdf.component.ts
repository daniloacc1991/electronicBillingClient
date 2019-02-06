import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { FormControl, Validators } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

import { RtaComprobanteModel, TokenComfiar } from '../../../models';
import { ErrorComponent } from '../../shared/error/error.component';

import { InvoiceService } from '../../../services/invoice.service';
import { ComfiarService } from '../../../services/index';
import { AuthService } from '../../../auth/auth.service';
import { ExcelService } from '../../../services/excel.service';

import * as moment from 'moment';
export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

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
  tipo_transaccion: number;
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
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ]
})
export class InvoicePdfComponent implements OnInit {
  pdfSrc: any;
  _messageError: string;
  valueFechas = {
    inicio: null,
    fin: null
  };
  scopeUser: string;
  fechaI: FormControl;
  fechaF: FormControl;
  minDateFin: any;
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
    private _es: ExcelService,
    private _titleService: Title,
    public _dialogError: MatDialog) {
    this._titleService.setTitle('Descargar Facturas - Facturación Electrónica');
    this._as.setApplicationName('Descargar Facturas - Facturación Electrónica');
    this.scopeUser = this._as.getToken().scope;
    if (!localStorage.getItem('descargaPDF')) {
      this.valueFechas.inicio = moment();
      this.valueFechas.fin = moment();
      this.minDateFin = moment();
    } else {
      this.valueFechas.inicio = moment(JSON.parse(localStorage.getItem('descargaPDF')).inicio);
      this.valueFechas.fin = moment(JSON.parse(localStorage.getItem('descargaPDF')).fin);
      this.minDateFin = moment(JSON.parse(localStorage.getItem('descargaPDF')).inicio);
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

  async pdf(element: InvoiceSentsElement) {
    this.changeStatus(element);
    const invoice = element.factura;
    const transaccion = element.transaccion;
    const puntoVenta = element.punto_venta;
    const tipo_transaccion = element.tipo_transaccion;
    const tokenComfiar: TokenComfiar = await this._cs.validTokenComfiar();
    this._cs.donwloadPDF(tokenComfiar, invoice, transaccion, puntoVenta, tipo_transaccion)
      .subscribe(
        resPDF => {
          this.converToPdf(resPDF.data.rows, invoice);
          this.changeStatus(element);
          const fechaI = this.dateString(this.fechaI.value);
          const fechaF = this.dateString(this.fechaF.value);
          this.invoiceSent(fechaI, fechaF);
        },
        errPDF => {
          console.error(errPDF);
          this.changeStatus(element);
          this._messageError = errPDF.error;
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
    return date.format('YYYY-MM-DD');
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

  async actualizarEstado(element: InvoiceSentsElement) {
    const invoice = element.factura;
    const puntoVenta = element.punto_venta;
    const tipo_transaccion = element.tipo_transaccion;
    this.changeStatus(element);
    const tokenComfiar: TokenComfiar = await this._cs.validTokenComfiar();
    this._cs.resposeVoucher(tokenComfiar, invoice, puntoVenta, tipo_transaccion).subscribe(
      resVoucher => {
        const rtaDian: RtaComprobanteModel = resVoucher.data.rows;
        rtaDian.invoice = invoice;
        this._is.saveCufe(rtaDian).subscribe(
          resCufe => {
            this.changeStatus(element);
            this.applyFilter('');
          },
          errCufe => {
            this.changeStatus(element);
            this._messageError = errCufe.error;
            this.openDialog();
            console.error(errCufe);
          }
        );
      },
      errVoucher => {
        this.changeStatus(element);
        this._messageError = errVoucher.error;
        this.openDialog();
        console.error(errVoucher);
      }
    );
  }

  changeStatus(e: InvoiceSentsElement) {
    const index = this.dataSource.data.indexOf(e, 0);
    this.dataSource.data[index].status = !this.dataSource.data[index].status;
  }

  saveExcel() {
    this._es.exportAsExcelFile(this.dataSource.data, 'facturas_enviadas');
  }
}
