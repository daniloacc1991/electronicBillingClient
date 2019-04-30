import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { MatPaginator, MatSort } from '@angular/material';
import { Title } from '@angular/platform-browser';
import { NotePendingDataSource, NotePendingItem } from './note-pending-datasource';
import { delay } from 'rxjs/operators';
import * as js2xmlparser from 'js2xmlparser';
import { NoteService } from '../../../services/note.service';
import { ComfiarService } from '../../../services/comfiar.service';
import { MessageService } from 'primeng/components/common/messageservice';
import { AuthService } from '../../../auth/auth.service';
import { RtaComprobanteModel, TokenComfiar } from '../../../models';

@Component({
  selector: 'app-note-pending',
  templateUrl: './note-pending.component.html',
  styleUrls: ['./note-pending.component.scss'],
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
export class NotePendingComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('filter') filter: ElementRef;
  dataSource: NotePendingDataSource;
  scopeUser: string;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['consecutivo', 'factura', 'tipo_nota', 'nota', 'fecha', 'empresa', 'punto_venta', 'enviar', 'guardar'];

  constructor(private _ns: NoteService, private _cs: ComfiarService,
    private _as: AuthService,
    private messageService: MessageService,
    private _title: Title) {
    this._title.setTitle('Envío de Notas - Facturación Electrónica');
    this._as.setApplicationName('Envío de Notas - Facturación Electrónica');
    if (this._as.getToken().scope === 'ADMIN') {
      this.scopeUser = this._as.getToken().scope;
      this.displayedColumns.push('usuario');
    }
  }

  ngOnInit() {
    this.paginator._intl.itemsPerPageLabel = 'Items por página.';
    this.paginator._intl.nextPageLabel = 'Siguiente';
    this.paginator._intl.previousPageLabel = 'Anterior';
    this._ns.pending()
      .subscribe(
        res => {
          const data: NotePendingItem[] = res.data.rows;
          this.dataSource = new NotePendingDataSource(this.paginator, this.sort, data);
        }
      );
  }

  async sendNote(element: NotePendingItem) {
    this.changeStatus(element);
    const puntoVenta = element.punto_venta;
    const note = element.nota;
    const tipo_transaccion = element.tipo_transaccion;
    const tokenComfiar: TokenComfiar = await this._cs.validTokenComfiar();
    this._ns.note(note)
      .pipe(delay(2000))
      .subscribe(
        resNote => {
          const enc = element.tipo_nota === 'Credito' ? 'fe:CreditNote' : 'fe:DebitNote';
          const _xml = this.xmlparse(resNote.data, enc);
          this._cs.sendInvoice(tokenComfiar, _xml, puntoVenta, tipo_transaccion).subscribe(
            resSend => {
              const transaccion = resSend.data.rows.transaccion;
              this._ns.saveTransaccion(note, transaccion)
                .pipe(
                  delay(2000)
                )
                .subscribe(
                  resSaveT => {
                    this._cs.outTransaccion(tokenComfiar, transaccion).subscribe(
                      resOut => {
                        if (resOut.data.rows.Estado === 'CargandoComprobantes') {
                          this.changeStatus(element);
                          this.dataSource.deleteElement(element);
                          this.messageService.add(
                            { severity: 'info', summary: 'Salida Transacción', detail: resOut.data.rows.estado, life: 3000 }
                          );
                        } else {
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
                                        severity: 'Success',
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
                      },
                      errOut => {
                        console.error(errOut);
                        this.changeStatus(element);
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: errOut.error.error.msj, life: 3000 });
                        if (errOut.error.error.delete) {
                          this._ns.deleteTransaccion(note).subscribe(
                            res => console.log(res),
                            errDelete => console.error(errDelete)
                          );
                        }
                      }
                    );
                  },
                  errSaveT => {
                    console.error(errSaveT);
                    this.changeStatus(element);
                    if (errSaveT.error.error.delete) {
                      this.dataSource.deleteElement(element);
                    }
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: errSaveT.error.error.msj, life: 3000 });
                  }
                );
            },
            errSend => {
              console.error(errSend);
              this.changeStatus(element);
              if (errSend.error.error.delete) {
                this.dataSource.deleteElement(element);
              }
              this.messageService.add({ severity: 'error', summary: 'Error', detail: errSend.error.error.msj, life: 3000 });
            }
          );
        },
        errInvoice => {

          console.error(errInvoice);
          this.changeStatus(element);
          if (errInvoice.error.error.delete) {
            this.dataSource.deleteElement(element);
          }
          this.messageService.add({ severity: 'error', summary: 'Error', detail: errInvoice.error.error.msj, life: 3000 });
        }
      );
  }

  saveXML(e: NotePendingItem) {
    this._ns.note(e.nota).subscribe(
      res => {
        const enc = e.tipo_nota === 'Credito' ? 'fe:CreditNote' : 'fe:DebitNote';
        const _xml = this.xmlparse(res.data, enc);
        const blob = new Blob([_xml], { type: 'text/xml; charset=utf-8' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.setAttribute('download', e.nota + '.xml');
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
      },
      err => {
        console.log(err);
      }
    );
  }

  xmlparse(data: any, enc: string) {
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
    return js2xmlparser.parse(enc, data, options);
  }

  changeStatus(e: NotePendingItem) {
    const index = this.dataSource.data.indexOf(e, 0);
    this.dataSource.data[index].status = !this.dataSource.data[index].status;
  }
}
