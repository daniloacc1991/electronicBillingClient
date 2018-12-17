import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { Title } from '@angular/platform-browser';

import { InvoiceService } from '../../services/invoice.service';
import { ComfiarService } from '../../services/index';
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
  selector: 'app-invoice-pdf',
  templateUrl: './invoice-pdf.component.html',
  styleUrls: ['./invoice-pdf.component.scss'],
})
export class InvoicePdfComponent implements OnInit {
  pdfSrc: any;
  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns: string[] = ['position', 'name', 'typeinvoce', 'empresa', 'transaccion', 'enviar'];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  dataSource = new MatTableDataSource<InvoiceSentsElement>();

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  constructor(private _is: InvoiceService,
    private _as: AuthService,
    private _cs: ComfiarService,
    private _titleService: Title) {
    this._titleService.setTitle('Consultar PDF - Facturación Electrónica');
  }

  ngOnInit() {
    this._is.invoiceSend().subscribe(
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

  pdf(position: number, invoice: string, transaccion: number) {
    this.dataSource.data[position].status = true;
    const dataCom = this._as.getDataUser();
    this._cs.loginComfiar(dataCom.username, dataCom.password).subscribe(
      resLogin => {
        this._cs.donwloadPDF(resLogin.data.rows, invoice, transaccion).subscribe(
          resPDF => {
            this.converToPdf(resPDF.data.rows, invoice);
            this.dataSource.data[position].status = false;
          },
          errPDF => {
            console.error(errPDF);
            this.dataSource.data[position].status = false;
          }
        );
      },
      errLogin => {
        console.error(errLogin);
        this.dataSource.data[position].status = false;
      }
    );
  }

  converToPdf(pdfBase64: string, invoice: string) {
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
    link.download = invoice + '.pdf';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
}