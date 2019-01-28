import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { MatSort, MatPaginator } from '@angular/material';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import * as js2xmlparser from 'js2xmlparser';
import { delay } from 'rxjs/operators';
import { BehaviorSubject, fromEvent } from 'rxjs';
import { MessageService } from 'primeng/components/common/messageservice';

import { RtaComprobanteModel, TokenComfiar } from '../../models';
import { InvoicePendingDataSource, InvoicePendingElement } from './invoice-pending.datasource';

import { ErrorComponent } from '../shared/error/error.component';

import { InvoiceService } from '../../services/invoice.service';
import { ComfiarService } from '../../services/index';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-invoice-pending',
  templateUrl: './invoice-pending.component.html',
  styleUrls: ['./invoice-pending.component.scss'],
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

export class InvoicePendingComponent implements OnInit {
  displayedColumns: string[] = ['consecutivo', 'empresa', 'factura', 'fecha', 'punto_venta', 'typeinvoce', 'enviar', 'guardar'];
  dataSource: InvoicePendingDataSource | null;
  _messageError: string;
  scopeUser: string;
  lengthData = 0;
  _data: BehaviorSubject<InvoicePendingElement[]>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('filter') filter: ElementRef;

  constructor(private _is: InvoiceService,
    private _cs: ComfiarService,
    private _as: AuthService,
    private messageService: MessageService,
    private _title: Title,
    public _dialogError: MatDialog) {
    this._title.setTitle('Envío de Facturas - Facturación Electrónica');
    this._as.setApplicationName('Envío de Facturas - Facturación Electrónica');
    if (this._as.getToken().scope === 'ADMIN') {
      this.scopeUser = this._as.getToken().scope;
      this.displayedColumns.push('usuario');
    }
  }

  ngOnInit() {
    this.invoicePending();
  }

  invoicePending() {
    this._is.invoicePending()
      .subscribe(
        res => {
          this._data = new BehaviorSubject(res.data.rows);
          this.dataSource = new InvoicePendingDataSource(this.paginator, this.sort, this._data);
          fromEvent(this.filter.nativeElement, 'keyup')
            .subscribe(() => {
              if (!this.dataSource) {
                return;
              }
              this.dataSource.filter = this.filter.nativeElement.value;
            });
        },
        err => {
          console.error(err);
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

  async sendInvoice(element: InvoicePendingElement) {
    this.changeStatus(element);
    const puntoVenta = element.punto_venta;
    const invoice = element.factura;
    const tokenComfiar: TokenComfiar = await this._cs.validTokenComfiar();
    this._is.invoice(invoice)
      .pipe(delay(2000))
      .subscribe(
        resInvoice => {
          const _xml = this.xmlparse(resInvoice.data.rows);
          this._cs.sendInvoice(tokenComfiar, _xml, puntoVenta).subscribe(
            resSend => {
              const transaccion = resSend.data.rows.transaccion;
              this._is.saveTransaccion(invoice, transaccion)
                .pipe(
                  delay(2000)
                )
                .subscribe(
                  resSaveT => {
                    this._cs.outTransaccion(tokenComfiar, transaccion).subscribe(
                      resOut => {
                        if (resOut.data.rows.Estado === 'CargandoComprobantes') {
                          this.dataSource.deleteElement(element);
                          this.messageService.add(
                            { severity: 'info', summary: 'Salida Transacción', detail: resOut.data.rows.estado, life: 3000 }
                          );
                          this.changeStatus(element);
                        } else {
                          this._cs.resposeVoucher(tokenComfiar, invoice, puntoVenta).subscribe(
                            resVoucher => {
                              const rtaDian: RtaComprobanteModel = resVoucher.data.rows;
                              rtaDian.invoice = invoice;
                              this._is.saveCufe(rtaDian)
                                .subscribe(
                                  resCufe => {
                                    this.dataSource.deleteElement(element);
                                    this.changeStatus(element);
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
                                this._is.deleteTransaccion(invoice).subscribe(
                                  res => this.dataSource.deleteElement(element),
                                  errDelete => console.error(errDelete)
                                );
                              }
                            }
                          );
                        }
                      },
                      errOut => {
                        console.error(errOut);
                        this.changeStatus(element);
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: errOut.error.error.msj, life: 3000 });
                        if (errOut.error.error.delete) {
                          this._is.deleteTransaccion(invoice).subscribe(
                            res => this.dataSource.deleteElement(element),
                            errDelete => console.error(errDelete)
                          );
                        }
                      }
                    );
                  },
                  errSaveT => {
                    console.error(errSaveT);
                    this.changeStatus(element);
                    this.dataSource.deleteElement(element);
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: errSaveT.error.error.msj, life: 3000 });
                  }
                );
            },
            errSend => {
              console.error(errSend);
              this.changeStatus(element);
              this.dataSource.deleteElement(element);
              this.messageService.add({ severity: 'error', summary: 'Error', detail: errSend.error.error.msj, life: 3000 });
            }
          );
        },
        errInvoice => {
          console.error(errInvoice.error);
          this.changeStatus(element);
          this.dataSource.deleteElement(element);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: errInvoice.error.error.msj, life: 3000 });
        }
      );
  }

  saveXML(invoice: string) {
    this._is.invoice(invoice).subscribe(
      res => {
        const _xml = this.xmlparse(res.data.rows);
        const blob = new Blob([_xml], { type: 'text/xml; charset=utf-8' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.setAttribute('download', invoice + '.xml');
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
      },
      err => {
        console.log(err);
      }
    );
  }

  xmlparse(data: any) {
    const options = {
      declaration: {
        include: true,
        encoding: 'UTF-8',
        standalone: 'no',
        version: '1.0'
      },
      format: {
        doubleQuotes: true,
        pretty: true
      },
    };
    return js2xmlparser.parse('fe:Invoice', data, options);
  }

  changeStatus(e: InvoicePendingElement) {
    const index = this._data.value.indexOf(e, 0);
    this.dataSource.data.value[index].status = !this.dataSource.data.value[index].status;
  }
}
