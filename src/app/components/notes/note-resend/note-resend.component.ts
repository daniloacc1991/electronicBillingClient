import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { MatPaginator, MatSort } from '@angular/material';
// import { fromEvent } from 'rxjs';
import { NoteResendDataSource, NoteResendItem } from './note-resend-datasource';
import { Title } from '@angular/platform-browser';
import { NoteService } from '../../../services/note.service';
import { ComfiarService } from '../../../services/comfiar.service';
import { MessageService } from 'primeng/components/common/messageservice';
import { AuthService } from '../../../auth/auth.service';

import { RtaComprobanteModel, TokenComfiar } from '../../../models';

@Component({
  selector: 'app-note-resend',
  templateUrl: './note-resend.component.html',
  styleUrls: ['./note-resend.component.scss'],
  providers: [MessageService],
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
export class NoteResendComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('filter') filter: ElementRef;
  dataSource: NoteResendDataSource;
  scopeUser: string;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['consecutivo', 'tipo_nota', 'nota', 'fecha', 'empresa', 'transaccion', 'punto_venta', 'enviar'];

  constructor(private _ns: NoteService, private _cs: ComfiarService,
    private _as: AuthService,
    private messageService: MessageService,
    private _title: Title) {
    this._title.setTitle('Reenviar de Notas - Facturación Electrónica');
    this._as.setApplicationName('Reenviar de Notas - Facturación Electrónica');
    if (this._as.getToken().scope === 'ADMIN') {
      this.scopeUser = this._as.getToken().scope;
      this.displayedColumns.push('usuario');
    }
  }

  ngOnInit() {
    this.paginator._intl.itemsPerPageLabel = 'Items por página.';
    this.paginator._intl.nextPageLabel = 'Siguiente';
    this.paginator._intl.previousPageLabel = 'Anterior';
    this._ns.resend()
      .subscribe(
        res => {
          const data: NoteResendItem[] = res.data.rows;
          this.dataSource = new NoteResendDataSource(this.paginator, this.sort, data);
          // fromEvent(this.filter.nativeElement, 'keyup')
          //   .subscribe(() => {
          //     if (!this.dataSource) {
          //       return;
          //     }
          //     this.dataSource.filter = this.filter.nativeElement.value;
          //   });
        }
      );
  }

  async reSend(element: NoteResendItem) {
    this.changeStatus(element);
    const puntoVenta = element.punto_venta;
    const note = element.nota;
    const tipo_transaccion = element.tipo_transaccion;
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
        this._ns.saveCufe(rtaDian)
          .subscribe(
            resCufe => {
              this.changeStatus(element);
              this.dataSource.deleteElement(element);
              this.messageService.add(
                {
                  severity: 'success',
                  summary: 'Guardando Respuesta Comprobante',
                  detail: resCufe.data.rows.estado,
                  life: 3000
                }
              );
            },
            errCufe => {
              this.changeStatus(element);
              console.error(errCufe);
            }
          );
      },
      errVoucher => {
        this.changeStatus(element);
        console.error(errVoucher);
        this.messageService.add(
          {
            severity: 'info',
            summary: 'Error',
            detail: errVoucher.error.error.msj,
            life: 3000
          }
        );
        if (errVoucher.error.error.delete) {
          this._ns.deleteTransaccion(note).subscribe(
            res => console.log(res),
            errDelete => console.error(errDelete)
          );
        }
      }
    );
  }

  changeStatus(e: NoteResendItem) {
    const index = this.dataSource.data.indexOf(e, 0);
    this.dataSource.data[index].status = !this.dataSource.data[index].status;
  }
}
