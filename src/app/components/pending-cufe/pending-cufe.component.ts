import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';

import { ErrorComponent } from '../shared/error/error.component';

import { InvoiceService, ComfiarService } from '../../services/';
import { AuthService } from '../../auth/auth.service';
import { delay } from 'rxjs/operators';

export interface InvoiceSentsElement {
  position: string;
  name: string;
  empresa: string;
  transaccion: string;
  cufe: string;
  status: boolean;
}

@Component({
  selector: 'app-pending-cufe',
  templateUrl: './pending-cufe.component.html',
  styleUrls: ['./pending-cufe.component.scss'],
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
  displayedColumns: string[] = ['consecutivo', 'factura', 'empresa', 'transaccion', 'punto_venta', 'enviar'];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  dataSource = new MatTableDataSource<InvoiceSentsElement>();
  _messageError: any;

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  constructor(private _is: InvoiceService,
    private _cs: ComfiarService,
    private _as: AuthService,
    private router: Router,
    public _dialogError: MatDialog,
    private _title: Title) {
      this._title.setTitle('Reenvio de Facturas - Facturación Electrónica');
      this._as.setApplicationName('Reenvio de Facturas- Facturación Electrónica');
    }

  ngOnInit() {
    this._is.cufePending()
      .subscribe(
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

  openDialog(): void {
    const dialogRef = this._dialogError.open(ErrorComponent, {
      data: {
        Message: this._messageError
      }
    });
  }

  consultarCufe(position: number, invoice: string, transaccion: number, puntoVenta: number) {
    this.dataSource.data[position].status = true;
    const dataCom = this._as.getDataUser();
    this._cs.loginComfiar(dataCom.username, dataCom.password)
      .pipe(
        delay(1000)
      )
      .subscribe(
        resLogin => {
          this._cs.resposeVoucher(resLogin.data.rows, invoice, transaccion, puntoVenta ).subscribe(
            resVoucher => {
              const dataDIAN = resVoucher.data.rows;
              this._is.saveCufe(dataDIAN.cufe, invoice, dataDIAN.estado, dataDIAN.ReceivedDateTime, dataDIAN.ResponseDateTime).subscribe(
                resCufe => {
                  this.dataSource.data[position].status = false;
                  this.router.navigate(['/factura/downloadpdf']);
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
              // this._is.deleteTransaccion(invoice).subscribe(
              //   res => console.log(res),
              //   errDelete => {
              //     this._messageError = errDelete.error;
              //     this.openDialog();
              //   }
              // );
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
