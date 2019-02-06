import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { MatPaginator, MatSort } from '@angular/material';
import { FormControl, Validators } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { fromEvent } from 'rxjs';

import { NotePdfDataSource, NotePdfItem } from './note-pdf-datasource';
import { Title } from '@angular/platform-browser';
import { NoteService } from '../../../services/note.service';
import { ComfiarService } from '../../../services/comfiar.service';
import { MessageService } from 'primeng/components/common/messageservice';
import { AuthService } from '../../../auth/auth.service';

import { RtaComprobanteModel, TokenComfiar } from '../../../models';

import * as moment from 'moment';
export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-note-pdf',
  templateUrl: './note-pdf.component.html',
  styleUrls: ['./note-pdf.component.scss'],
  providers: [
    MessageService,
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
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
export class NotePdfComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('filter') filter: ElementRef;
  dataSource: NotePdfDataSource;
  scopeUser: string;
  pdfSrc: any;
  valueFechas = {
    inicio: null,
    fin: null
  };

  fechaI: FormControl;
  fechaF: FormControl;
  minDateFin: any;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = [
    'consecutivo',
    'tipo_nota',
    'nota', 'fecha',
    'empresa',
    'transaccion',
    'punto_venta',
    'estado_fe',
    'enviar',
    'save_local'];

  constructor(private _ns: NoteService, private _cs: ComfiarService,
    private _as: AuthService,
    private messageService: MessageService,
    private _title: Title) {
    this._title.setTitle('Descargar PDF de Notas - Facturación Electrónica');
    this._as.setApplicationName('Descargar PDF de Notas - Facturación Electrónica');
    if (!localStorage.getItem('descargaNotaPDF')) {
      this.valueFechas.inicio = moment();
      this.valueFechas.fin = moment();
      this.minDateFin = moment();
    } else {
      this.valueFechas.inicio = moment(JSON.parse(localStorage.getItem('descargaNotaPDF')).inicio);
      this.valueFechas.fin = moment(JSON.parse(localStorage.getItem('descargaNotaPDF')).fin);
      this.minDateFin = moment(JSON.parse(localStorage.getItem('descargaNotaPDF')).inicio);
    }
  }

  ngOnInit() {
    this.paginator._intl.itemsPerPageLabel = 'Items por página.';
    this.paginator._intl.nextPageLabel = 'Siguiente';
    this.paginator._intl.previousPageLabel = 'Anterior';
    this.fechaI = new FormControl({ value: this.valueFechas.inicio, disabled: true }, Validators.required);
    this.fechaF = new FormControl({ value: this.valueFechas.fin, disabled: true }, Validators.required);
    const fechaI = this.dateString(this.fechaI.value);
    const fechaF = this.dateString(this.fechaF.value);
    this.sent(fechaI, fechaF);
  }

  sent(fechaI: string, fechaF: string) {
    this._ns.sent(fechaI, fechaF)
      .subscribe(
        res => {
          const data: NotePdfItem[] = res.data.rows;
          this.dataSource = new NotePdfDataSource(this.paginator, this.sort, data);
          fromEvent(this.filter.nativeElement, 'keyup')
            .subscribe(() => {
              if (!this.dataSource) {
                return;
              }
              this.dataSource.filter = this.filter.nativeElement.value;
            });
        },
        err => {
          console.log(err);
        }
      );
  }

  async pdf(element: NotePdfItem) {
    this.changeStatus(element);
    const note = element.nota;
    const transaccion = element.transaccion;
    const puntoVenta = element.punto_venta;
    const tipo_transaccion = element.tipo_transaccion;
    const tokenComfiar: TokenComfiar = await this._cs.validTokenComfiar();
    this._cs.donwloadPDF(tokenComfiar, note, transaccion, puntoVenta, tipo_transaccion)
      .subscribe(
        resPDF => {
          this.converToPdf(resPDF.data.rows, note);
          this.changeStatus(element);
          const fechaI = this.dateString(this.fechaI.value);
          const fechaF = this.dateString(this.fechaF.value);
          this.sent(fechaI, fechaF);
        },
        errPDF => {
          console.error(errPDF);
          this.changeStatus(element);
          // this._messageError = errPDF.error;
          // this.openDialog();
        }
      );
  }

  converToPdf(pdfBase64: string, note: string) {
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
    link.download = note + '.pdf';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  consultar() {
    const fechaI = this.dateString(this.fechaI.value);
    const fechaF = this.dateString(this.fechaF.value);
    this.sent(fechaI, fechaF);
  }

  dateString(date: any) {
    return date.format('YYYY-MM-DD');
  }

  changeFechaI(event: MatDatepickerInputEvent<Date>) {
    this.minDateFin = event.value;
    this.valueFechas.inicio = event.value;
    localStorage.setItem('descargaNotaPDF', JSON.stringify(this.valueFechas));
    // this.minDateFin = event.value
  }

  changeFechaF(event: MatDatepickerInputEvent<Date>) {
    this.valueFechas.fin = event.value;
    localStorage.setItem('descargaNotaPDF', JSON.stringify(this.valueFechas));
    // this.minDateFin = event.value
  }

  async actualizarEstado(element: NotePdfItem) {
    const note = element.nota;
    const puntoVenta = element.punto_venta;
    const tipo_transaccion = element.tipo_transaccion;
    this.changeStatus(element);
    let tokenComfiar: TokenComfiar;
    try {
      tokenComfiar = await this._cs.validTokenComfiar();
    } catch (e) {
      this.changeStatus(element);
      console.error(eval);
      this.messageService.add(
        {
          severity: 'info',
          summary: 'Error',
          detail: e.error.error.msj,
          life: 3000
        }
      );
    }
    this._cs.resposeVoucher(tokenComfiar, note, puntoVenta, tipo_transaccion).subscribe(
      resVoucher => {
        const rtaDian: RtaComprobanteModel = resVoucher.data.rows;
        rtaDian.invoice = note;
        this._ns.saveCufe(rtaDian).subscribe(
          resCufe => {
            this.changeStatus(element);
            // this.applyFilter('');
          },
          errCufe => {
            this.changeStatus(element);
            // this._messageError = errCufe.error;
            // this.openDialog();
            console.error(errCufe);
          }
        );
      },
      errVoucher => {
        this.changeStatus(element);
        // this._messageError = errVoucher.error;
        // this.openDialog();
        console.error(errVoucher);
      }
    );
  }

  changeStatus(e: NotePdfItem) {
    const index = this.dataSource.data.indexOf(e, 0);
    this.dataSource.data[index].status = !this.dataSource.data[index].status;
  }
}
