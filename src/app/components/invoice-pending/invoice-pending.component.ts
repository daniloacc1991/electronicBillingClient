import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatSort, MatPaginator, MatTableDataSource } from '@angular/material';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import * as js2xmlparser from 'js2xmlparser';
import { delay } from 'rxjs/operators';

import { ErrorComponent } from '../shared/error/error.component';

import { InvoiceService } from '../../services/invoice.service';
import { ComfiarService } from '../../services/index';
import { AuthService } from '../../auth/auth.service';


export interface InvoicePendingElement {
  position: string;
  name: string;
  status: boolean;
}


@Component({
  selector: 'app-invoice-pending',
  templateUrl: './invoice-pending.component.html',
  styleUrls: ['./invoice-pending.component.scss'],
})
export class InvoicePendingComponent implements OnInit {
  displayedColumns: string[] = ['position', 'name', 'typeinvoce', 'empresa', 'enviar', 'guardar'];
  dataSource = new MatTableDataSource<InvoicePendingElement>();
  _messageError: string;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  constructor(private _is: InvoiceService,
    private _cs: ComfiarService,
    private _as: AuthService,
    private router: Router,
    private _title: Title,
    public _dialogError: MatDialog) {
    this._title.setTitle('Envío DELCOP - Facturación Electrónica');
  }

  ngOnInit() {
    this._is.invoicePending()
      .subscribe(
        res => {
          this.dataSource.data = res.data.rows;
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
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

  sendInvoice(position: number, invoice: string) {
    this.dataSource.data[position].status = true;
    const dataCom = this._as.getDataUser();
    this._cs.loginComfiar(dataCom.username, dataCom.password).subscribe(
      resLogin => {
        this._is.invoice(invoice).subscribe(
          resInvoice => {
            const _xml = this.xmlparse(resInvoice.data.rows);
            this._cs.sendInvoice(resLogin.data.rows, _xml).subscribe(
              resSend => {
                if (!resSend.data.rows) {
                  this.dataSource.data[position].status = false;
                  this._messageError = 'Favor informar a sistemas.';
                  this.openDialog();
                  return;
                }
                const transaccion = resSend.data.rows.transaccion;
                this._is.saveTransaccion(invoice, transaccion)
                  .pipe(
                    delay(4000)
                  )
                  .subscribe(
                    resSaveT => {
                      this._cs.outTransaccion(resLogin.data.rows, transaccion).subscribe(
                        resOut => {
                          console.log(resOut);
                          if (resOut.data.rows.Message === 'Error' || resOut.data.rows.Estado._text === 'ERROR') {
                            this.dataSource.data[position].status = false;
                            this._messageError = resOut.data.rows.mensajes.mensaje.mensaje._text;
                            this.openDialog();
                            this._is.deleteTransaccion(invoice).subscribe(
                              res => console.log(res),
                              errDelete => {
                                this._messageError = errDelete.error;
                                this.openDialog();
                              }
                            );
                          } else {
                            this._cs.resposeVoucher(resLogin.data.rows, invoice, transaccion).subscribe(
                              resVoucher => {
                                this._is.saveCufe(resVoucher.data.rows.cufe, invoice).subscribe(
                                  resCufe => {
                                    this.dataSource.data[position].status = false;
                                    this.router.navigate(['/downloadpdf']);
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
                                this._messageError = errVoucher.error.error;
                                this.openDialog();
                                console.error(errVoucher);
                              }
                            );
                          }
                        },
                        errOut => {
                          this.dataSource.data[position].status = false;
                          console.error(errOut);
                          this._messageError = errOut.error.error;
                          this.openDialog();
                        }
                      );
                    },
                    errSaveT => {
                      this.dataSource.data[position].status = false;
                      console.error(errSaveT);
                    }
                  );
              },
              errSend => {
                this.dataSource.data[position].status = false;
                this._messageError = errSend.error.error;
                this.openDialog();
                console.error(errSend);
              }
            );
          },
          errInvoice => {
            this.dataSource.data[position].status = false;
            console.error(errInvoice);
          }
        );
      },
      errLogin => {
        this.dataSource.data[position].status = false;
        console.error(errLogin);
      }
    );
  }

  saveXML(position: number, invoice: string) {
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
}