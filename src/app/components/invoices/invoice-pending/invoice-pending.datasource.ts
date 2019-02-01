import { DataSource } from '@angular/cdk/collections';
import { MatPaginator, MatSort } from '@angular/material';
import { map } from 'rxjs/operators';
import { Observable, BehaviorSubject, merge } from 'rxjs';

// TODO: Replace this with your own data model type
export interface InvoicePendingElement {
  consecutivo: number;
  empresa: string;
  factura: string;
  fecha: string;
  punto_venta: number;
  status: boolean;
  typeinvoce: string;
  usuario: string;
  tipo_transaccion: number;
}

// TODO: replace this with real data from your application
// const EXAMPLE_DATA: InvoicePendingElement[] = [];

/**
 * Data source for the PruebaTable view. This class should
 * encapsulate all logic for fetching and manipulating the displayed data
 * (including sorting, pagination, and filtering).
 */
export class InvoicePendingDataSource extends DataSource<InvoicePendingElement> {
  _filterChange = new BehaviorSubject('');

  get filter(): string {
    return this._filterChange.value;
  }

  set filter(filter: string) {
    this._filterChange.next(filter);
  }

  filteredData: InvoicePendingElement[] = [];
  renderedData: InvoicePendingElement[] = [];

  constructor(private paginator: MatPaginator, private sort: MatSort, public data: BehaviorSubject<InvoicePendingElement[]>) {
    super();
    this._filterChange.subscribe(() => this.paginator.pageIndex = 0);
  }

  /**
   * Connect this data source to the table. The table will only update when
   * the returned stream emits new items.
   * @returns A stream of the items to be rendered.
   */
  connect(): Observable<InvoicePendingElement[]> {
    // Combine everything that affects the rendered data into one update
    // stream for the data-table to consume.
    const dataMutations = [
      this.data,
      this.paginator.page,
      this._filterChange,
      this.sort.sortChange
    ];

    // Set the paginator's length
    this.paginator.length = this.data.value.length;

    return merge(...dataMutations).pipe(map(() => {
      // return this.getPagedData(this.getSortedData([...this.data]));
      this.filteredData = this.data.value.slice()
        .filter((e: InvoicePendingElement) => {
          const searchStr = (e.consecutivo + e.empresa + e.factura + e.fecha + e.typeinvoce + e.usuario).toLowerCase();
          return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
        });

      const sortedData = this.getSortedData(this.filteredData.slice());

      // Grab the page's slice of the filtered sorted data.
      const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
      this.renderedData = sortedData.splice(startIndex, this.paginator.pageSize);
      return this.renderedData;
    }));
  }

  /**
   *  Called when the table is being destroyed. Use this function, to clean up
   * any open connections or free any held resources that were set up during connect.
   */
  disconnect() { }

  /**
   * Paginate the data (client-side). If you're using server-side pagination,
   * this would be replaced by requesting the appropriate data from the server.
   */
  // private getPagedData(data: InvoicePendingElement[]) {
  //   const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
  //   return data.splice(startIndex, this.paginator.pageSize);
  // }

  /**
   * Sort the data (client-side). If you're using server-side sorting,
   * this would be replaced by requesting the appropriate data from the server.
   */
  private getSortedData(data: InvoicePendingElement[]) {
    if (!this.sort.active || this.sort.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      let propertyA: number | string = '';
      let propertyB: number | string = '';

      switch (this.sort.active) {
        case 'consecutivo': [propertyA, propertyB] = [a.consecutivo, b.consecutivo]; break;
        case 'empresa': [propertyA, propertyB] = [a.empresa, b.empresa]; break;
        case 'fecha': [propertyA, propertyB] = [a.fecha, b.fecha]; break;
        case 'punto_venta': [propertyA, propertyB] = [a.punto_venta, b.punto_venta]; break;
        case 'typeinvoce': [propertyA, propertyB] = [a.typeinvoce, b.typeinvoce]; break;
        case 'usuario': [propertyA, propertyB] = [a.usuario, b.usuario]; break;
      }

      const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      const valueB = isNaN(+propertyB) ? propertyB : +propertyB;

      return (valueA < valueB ? -1 : 1) * (this.sort.direction === 'asc' ? 1 : -1);

    });
  }

  deleteElement(e: InvoicePendingElement) {
    const foundIndex = this.data.value.indexOf(e, 0);
    this.data.value.splice(foundIndex, 1);
    this.paginator._changePageSize(this.paginator.pageSize);
  }

}
