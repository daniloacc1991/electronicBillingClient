import { DataSource } from '@angular/cdk/collections';
import { MatPaginator, MatSort } from '@angular/material';
import { map } from 'rxjs/operators';
import { Observable, BehaviorSubject, merge } from 'rxjs';

// TODO: Replace this with your own data model type
export interface PendingCufeElement {
  consecutivo: number;
  empresa: string;
  factura: string;
  fecha: string;
  transaccion: number;
  status: boolean;
  punto_venta: number;
}

// TODO: replace this with real data from your application
// const EXAMPLE_DATA: InvoicePendingElement[] = [];

/**
 * Data source for the PruebaTable view. This class should
 * encapsulate all logic for fetching and manipulating the displayed data
 * (including sorting, pagination, and filtering).
 */
export class PendingCufeDataSource extends DataSource<PendingCufeElement> {
  _filterChange = new BehaviorSubject('');

  get filter(): string {
    return this._filterChange.value;
  }

  set filter(filter: string) {
    this._filterChange.next(filter);
  }

  filteredData: PendingCufeElement[] = [];
  renderedData: PendingCufeElement[] = [];

  constructor(private paginator: MatPaginator, private sort: MatSort, public data: BehaviorSubject<PendingCufeElement[]>) {
    super();
    this._filterChange.subscribe(() => this.paginator.pageIndex = 0);
  }

  /**
   * Connect this data source to the table. The table will only update when
   * the returned stream emits new items.
   * @returns A stream of the items to be rendered.
   */
  connect(): Observable<PendingCufeElement[]> {
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
        .filter((e: PendingCufeElement) => {
          const searchStr = (e.consecutivo + e.empresa + e.factura + e.fecha + e.punto_venta + e.transaccion).toLowerCase();
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
  // private getPagedData(data: PendingCufeElement[]) {
  //   const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
  //   return data.splice(startIndex, this.paginator.pageSize);
  // }

  /**
   * Sort the data (client-side). If you're using server-side sorting,
   * this would be replaced by requesting the appropriate data from the server.
   */
  private getSortedData(data: PendingCufeElement[]) {
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
      }

      const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      const valueB = isNaN(+propertyB) ? propertyB : +propertyB;

      return (valueA < valueB ? -1 : 1) * (this.sort.direction === 'asc' ? 1 : -1);

    });
  }

  deleteElement(e: PendingCufeElement) {
    const foundIndex = this.data.value.indexOf(e, 0);
    this.data.value.splice(foundIndex, 1);
    this.paginator._changePageSize(this.paginator.pageSize);
  }
}
