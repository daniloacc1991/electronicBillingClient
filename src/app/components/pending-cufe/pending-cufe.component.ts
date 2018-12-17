import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { MatDialog } from '@angular/material/dialog';

import { ErrorComponent } from '../shared/error/error.component';

import { InvoiceService, ComfiarService } from '../../services/';
import { AuthService } from '../../auth/auth.service';

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
})
export class PendingCufeComponent implements OnInit {

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns: string[] = ['position', 'name', 'empresa', 'transaccion', 'enviar'];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  dataSource = new MatTableDataSource<InvoiceSentsElement>();
  _messageError: any;

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  constructor(private _is: InvoiceService, private _cs: ComfiarService,
    private _as: AuthService, private router: Router,
    public _dialogError: MatDialog) { }

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

  async consultarCufe(position: number, invoice: string, transaccion: number) {
    this.dataSource.data[position].status = true;
    const dataCom = this._as.getDataUser();
    this._cs.loginComfiar(dataCom.username, dataCom.password).subscribe(
      resLogin => {
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
