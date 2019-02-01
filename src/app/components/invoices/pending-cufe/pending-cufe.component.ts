import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { MatPaginator, MatSort } from '@angular/material';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { MessageService } from 'primeng/components/common/messageservice';
import { BehaviorSubject, fromEvent } from 'rxjs';

import { RtaComprobanteModel, TokenComfiar } from '../../../models';
import { PendingCufeDataSource, PendingCufeElement } from './pending-cufe-datasource';

import { ErrorComponent } from '../../shared/error/error.component';

import { InvoiceService, ComfiarService } from '../../../services/';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-pending-cufe',
  templateUrl: './pending-cufe.component.html',
  styleUrls: ['./pending-cufe.component.scss'],
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
export class PendingCufeComponent implements OnInit {

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns: string[] = ['consecutivo', 'factura', 'fecha', 'empresa', 'transaccion', 'punto_venta', 'enviar'];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('filter') filter: ElementRef;
  dataSource: PendingCufeDataSource | null;
  _messageError: any;
  scopeUser: string;
  _data: BehaviorSubject<PendingCufeElement[]>;

  constructor(private _is: InvoiceService,
    private _cs: ComfiarService,
    private _as: AuthService,
    private messageService: MessageService,
    public _dialogError: MatDialog,
    private _title: Title) {
    this._title.setTitle('Reenvio de Facturas - Facturación Electrónica');
    this._as.setApplicationName('Reenvio de Facturas- Facturación Electrónica');
    if (this._as.getToken().scope === 'ADMIN') {
      this.scopeUser = this._as.getToken().scope;
      this.displayedColumns.push('usuario');
    }
  }

  ngOnInit() {
    this._is.cufePending()
      .subscribe(
        res => {
          this._data = new BehaviorSubject(res.data.rows);
          this.dataSource = new PendingCufeDataSource(this.paginator, this.sort, this._data);
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

  openDialog(): void {
    const dialogRef = this._dialogError.open(ErrorComponent, {
      data: {
        Message: this._messageError
      }
    });
  }

  async consultarCufe(element: PendingCufeElement) {
    this.changeStatus(element);
    const invoice = element.factura;
    const puntoVenta = element.punto_venta;
    const tipo_transaccion = element.tipo_transaccion;
    const tokenComfiar: TokenComfiar = await this._cs.validTokenComfiar();
    try {
      this._cs.resposeVoucher(tokenComfiar, invoice, puntoVenta, tipo_transaccion).subscribe(
        resVoucher => {
          const rtaDian: RtaComprobanteModel = resVoucher.data.rows;
          rtaDian.invoice = invoice;
          this._is.saveCufe(rtaDian).subscribe(
            resCufe => {
              this.changeStatus(element);
              this.messageService.add(
                {
                  severity: 'success',
                  summary: 'Guardando Respuesta Comprobante',
                  detail: resCufe.data.rows.estado,
                  life: 3000
                }
              );
              this.dataSource.deleteElement(element);
            },
            errCufe => {
              this.changeStatus(element);
              this.messageService.add({ severity: 'info', summary: 'Error', detail: errCufe.error, life: 3000 });
              console.error(errCufe);
            }
          );
        },
        errVoucher => {
          console.log(errVoucher);
          this.changeStatus(element);
          this.messageService.add({ severity: 'info', summary: 'Error', detail: errVoucher.error.error.msj, life: 3000 });
          if (errVoucher.error.error.delete) {
            this._is.deleteTransaccion(invoice).subscribe(
              res => {
                this.dataSource.deleteElement(element);
              },
              errDelete => console.error(errDelete)
            );
          }
        }
      );
    } catch (e) {
      this.changeStatus(element);
      console.error(e);
    }
  }

  changeStatus(e: PendingCufeElement) {
    const index = this._data.value.indexOf(e, 0);
    this.dataSource.data.value[index].status = !this.dataSource.data.value[index].status;
  }
}
