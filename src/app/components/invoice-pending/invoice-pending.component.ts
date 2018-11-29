import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatSort, MatPaginator, MatTableDataSource } from '@angular/material';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import * as js2xmlparser from 'js2xmlparser';

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
    this._is.invoicePending(this._as.getDataUser().username)
      .subscribe(
        res => {
          this.dataSource.data = res.data;
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        },
        err => {
          console.error(err)
        }
      )
  }

  openDialog(): void {
    const dialogRef = this._dialogError.open(ErrorComponent, {
      data: {
        Message: this._messageError
      }
    });
  }

  async sendInvoice(position: number, invoice: string) {
    this.dataSource.data[position].status = true;
    await this._is.verifyToken(this._as.getDataUser());
    this._is.invoice(invoice).subscribe(
      resInvoice => {
        const _xml = this.xmlparse(resInvoice.data)
        const dataToken = this._as.getToken()
        this._cs.sendInvoice(dataToken, _xml).subscribe(
          resSend => {
            const transaccion = resSend.data.transaccion;
            setTimeout(() => {
              this._cs.outTransaccion(dataToken, resSend.data.transaccion).subscribe(
                resOut => {
                  if (resOut.data.Message === 'Error' || resOut.data.Estado._text === 'ERROR') {
                    this.dataSource.data[position].status = false
                    this._messageError = resOut.data.mensajes.mensaje.mensaje._text;
                    console.log(this._messageError)
                    this.openDialog();
                    return;
                  }
                  this._is.saveTransaccion(invoice, transaccion).subscribe(
                    resSaveT => {
                      this._cs.resposeVoucher(dataToken, invoice, transaccion).subscribe(
                        resVoucher => {
                          this._is.saveCufe(resVoucher.data.cufe, invoice).subscribe(
                            resCufe => {
                              this.dataSource.data[position].status = false;
                              this.router.navigate(['/donwloadPDF']);
                            },
                            errCufe => {
                              this.dataSource.data[position].status = false
                              console.error(errCufe)
                            }
                          )
                        },
                        errVoucher => {
                          this.dataSource.data[position].status = false
                          console.error(errVoucher)
                        }
                      )
                    },
                    errSaveT => {
                      this.dataSource.data[position].status = false
                      console.error(errSaveT)
                    }
                  )
                },
                errOut => {
                  this.dataSource.data[position].status = false
                  console.error(errOut)
                }
              )
            }, 3000);
          },
          errSend => {
            this.dataSource.data[position].status = false
            console.error(errSend)
          }
        )
      },
      errInvoice => {
        this.dataSource.data[position].status = false
        console.error(errInvoice)
      }
    );
  }

  saveXML(position: number, invoice: string) {
    this._is.invoice(invoice).subscribe(
      res => {
        const _xml = this.xmlparse(res.data)
        const blob = new Blob([_xml], { type: 'text/xml; charset=utf-8' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.setAttribute('download', invoice + '.xml');
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
      },
      err => {
        console.log(err)
      }
    )
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
