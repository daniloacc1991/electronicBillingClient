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
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  dataSource = new MatTableDataSource<InvoiceSentsElement>();
  _messageError: string;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns: string[] = ['position', 'name', 'empresa', 'transaccion', 'enviar'];

  constructor(private _is: InvoiceService, private _cs: ComfiarService,
    private _as: AuthService, private router: Router,
    public _dialogError: MatDialog ) { }

  ngOnInit() {
    this._is.cufePending(this._as.getDataUser().username)
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
    await this._as.validToken();
    // this._cs.resposeVoucher(this._as.getToken, invoice,  )
    this._cs.resposeVoucher(this._as.getToken(), invoice, transaccion).subscribe(
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
}
