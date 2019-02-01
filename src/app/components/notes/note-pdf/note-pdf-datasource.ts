import { DataSource } from '@angular/cdk/collections';
import { MatPaginator, MatSort } from '@angular/material';
import { map } from 'rxjs/operators';
import { Observable, of as observableOf, merge, BehaviorSubject } from 'rxjs';

// TODO: Replace this with your own data model type
export interface NotePdfItem {
  consecutivo: number;
  tipo_nota: string;
  nota: string;
  fecha: string;
  empresa: string;
  factura: string;
  transaccion: number;
  status: boolean;
  path_pdf: string;
  save_local: boolean;
  punto_venta: number;
  tipo_transaccion: number;
  estado_fe: string;
}

/**
 * Data source for the NotePdf view. This class should
 * encapsulate all logic for fetching and manipulating the displayed data
 * (including sorting, pagination, and filtering).
 */
export class NotePdfDataSource extends DataSource<NotePdfItem> {
  _filterChange = new BehaviorSubject('');

  get filter(): string {
    return this._filterChange.value;
  }

  set filter(filter: string) {
    this._filterChange.next(filter);
  }

  filteredData: NotePdfItem[] = [];
  data: NotePdfItem[];

  constructor(private paginator: MatPaginator, private sort: MatSort, private _data: NotePdfItem[]) {
    super();
    this.data = this._data;
    this._filterChange.subscribe(() => this.paginator.pageIndex = 0);
  }

  /**
   * Connect this data source to the table. The table will only update when
   * the returned stream emits new items.
   * @returns A stream of the items to be rendered.
   */
  connect(): Observable<NotePdfItem[]> {
    // Combine everything that affects the rendered data into one update
    // stream for the data-table to consume.
    const dataMutations = [
      observableOf(this.data),
      this.paginator.page,
      this._filterChange,
      this.sort.sortChange
    ];

    // Set the paginator's length
    this.paginator.length = this.data.length;

    return merge(...dataMutations).pipe(map(() => {
      // Filter data
      this.filteredData = this.data.slice().filter((item: NotePdfItem) => {
        const searchStr = (item.consecutivo + item.empresa).toLowerCase();
        return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
      });

      return this.getPagedData(this.getSortedData([...this.filteredData]));
    }));
  }

  /**
   *  Called when the table is being destroyed. Use this function, to clean up
   * any open connections or free any held resources that were set up during connect.
   */
  disconnect() {}

  /**
   * Paginate the data (client-side). If you're using server-side pagination,
   * this would be replaced by requesting the appropriate data from the server.
   */
  private getPagedData(data: NotePdfItem[]) {
    const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
    return data.splice(startIndex, this.paginator.pageSize);
  }

  /**
   * Sort the data (client-side). If you're using server-side sorting,
   * this would be replaced by requesting the appropriate data from the server.
   */
  private getSortedData(data: NotePdfItem[]) {
    if (!this.sort.active || this.sort.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      const isAsc = this.sort.direction === 'asc';
      switch (this.sort.active) {
        case 'tipo_nota': return compare(a.tipo_nota, b.tipo_nota, isAsc);
        case 'consecutivo': return compare(+a.consecutivo, +b.consecutivo, isAsc);
        default: return 0;
      }
    });
  }

  deleteElement(e: NotePdfItem) {
    const foundIndex = this.data.indexOf(e, 0);
    this.data.splice(foundIndex, 1);
    this.paginator._changePageSize(this.paginator.pageSize);
  }
}

/** Simple sort comparator for example ID/Name columns (for client-side sorting). */
function compare(a, b, isAsc) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
