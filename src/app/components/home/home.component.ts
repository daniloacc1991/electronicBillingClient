import { Component, OnInit, ViewChild } from '@angular/core';
import { map, delay } from 'rxjs/operators';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

import { UIChart } from 'primeng/primeng';
import { SelectItem } from 'primeng/components/common/api';
import { Message } from 'primeng/components/common/api';
import { MessageService } from 'primeng/components/common/messageservice';

import { InvoiceService } from '../../services/invoice.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [
    // The locale would typically be provided on the root module of your application. We do it at
    // the component level here, due to limitations of our example generation script.
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    MessageService
  ],
})
export class HomeComponent implements OnInit {
  /** Based on the screen size, switch from standard to one column per row */
  picker: any;
  constents = {
    card1: {
      datasets: [
        {
          borderColor: '#4bc0c0',
          data: [],
          fill: false,
          label: 'Cantidad Año Anterior'
        },
        {
          borderColor: '#3f51b5',
          data: [],
          fill: true,
          label: 'Cantidad Año Actual'
        },
        {
          borderColor: '#FF6384',
          data: [],
          fill: false,
          label: 'Valor Año Anterior'
        },
        {
          borderColor: '#36A2EB',
          data: [],
          fill: true,
          label: 'Valor Año Actual'
        }
      ],
      labels: []
    },
    card2: {
      labels: ['Pendientes Por Enviar', 'Enviadas en Transito', 'Enviadas Satisfactorias'],
      datasets: [
        {
          data: [],
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56'
          ],
          hoverBackgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56'
          ]
        }

      ]
    }
  };

  options = {
    title: {
      display: true,
      fontSize: 16
    },
    legend: {
      position: 'bottom'
    }
  };

  @ViewChild('lineCount') chart: UIChart;

  titleCard = {
    card1: 'Facturación Realizada',
    card2: 'Estado de las Facturas'
  };

  cards = this.breakpointObserver
    .observe([Breakpoints.Medium, Breakpoints.Small, Breakpoints.XLarge, Breakpoints.Large])
    .pipe(
      delay(2000),
      map((breakpoints) => {
        if (breakpoints.breakpoints['(min-width: 1920px)']) {
          return [
            {
              id: 1,
              title: this.titleCard.card1,
              cols: 2,
              rows: 2,
              charts: true,
              content: this.constents.card1,
              width: '400',
              height: '600',
              type: 'line'
            },
            {
              id: 2,
              title: this.titleCard.card2,
              cols: 1,
              rows: 2,
              charts: true,
              content: this.constents.card2,
              width: '600',
              height: '600',
              type: 'doughnut'
            },
            {
              id: 3,
              title: 'Card 3',
              cols: 1,
              rows: 2,
              charts: false,
              content: {}
            }
          ];
        }

        if (breakpoints.breakpoints['(min-width: 1280px) and (max-width: 1919.99px)']) {
          return [
            {
              id: 1,
              title: this.titleCard.card1,
              cols: 2,
              rows: 2,
              charts: true,
              content: this.constents.card1,
              width: '400',
              height: '600',
              type: 'line'
            },
            {
              id: 2,
              title: this.titleCard.card2,
              cols: 1,
              rows: 2,
              charts: true,
              content: this.constents.card2,
              width: '600',
              height: '600',
              type: 'doughnut'
            },
            {
              id: 3,
              title: 'Card 3',
              cols: 1,
              rows: 2,
              charts: false,
              content: {}
            }
          ];
        }

        if (breakpoints.breakpoints['(min-width: 960px) and (max-width: 1279.99px)']) {
          return [
            {
              id: 1,
              title: this.titleCard.card1,
              cols: 2,
              rows: 2,
              charts: true,
              content: this.constents.card1,
              width: '400',
              height: '600',
              type: 'line'
            },
            {
              id: 2,
              title: this.titleCard.card2,
              cols: 1,
              rows: 2,
              charts: true,
              content: this.constents.card2,
              width: '600',
              height: '600',
              type: 'doughnut'
            },
            {
              id: 3,
              title: 'Card 3',
              cols: 1,
              rows: 2,
              charts: false,
              content: {}
            }
          ];
        }

        if (breakpoints.breakpoints['(min-width: 600px) and (max-width: 959.99px)']) {
          return [
            {
              id: 1,
              title: this.titleCard.card1,
              cols: 2,
              rows: 2,
              charts: true,
              content: this.constents.card1,
              width: '400',
              height: '600',
              type: 'line'
            },
            {
              id: 2,
              title: this.titleCard.card2,
              cols: 2,
              rows: 2,
              charts: true,
              content: this.constents.card2,
              width: '600',
              height: '600',
              type: 'doughnut'
            },
            {
              id: 3,
              title: 'Card 3',
              cols: 2,
              rows: 2,
              charts: false,
              content: {}
            }
          ];
        }

        return [
          {
            id: 1,
            title: this.titleCard.card1,
            cols: 2,
            rows: 2,
            charts: true,
            content: this.constents.card1,
            width: '400',
            height: '600',
            type: 'line'
          },
          {
            id: 2,
            title: this.titleCard.card2,
            cols: 2,
            rows: 2,
            charts: true,
            content: this.constents.card2,
            width: '600',
            height: '600',
            type: 'doughnut'
          },
          {
            id: 3,
            title: 'Card 3',
            cols: 2,
            rows: 2,
            charts: false,
            content: {}
          }
        ];
      })
    );

  constructor(private breakpointObserver: BreakpointObserver, private _is: InvoiceService,
    private _as: AuthService, private adapter: DateAdapter<any>, private messageService: MessageService) {
  }

  ngOnInit() {
    this.forYear(new Date(), false);

    this._is.invoicesForUser(this._as.getDataUser().username)
    .subscribe(
      res => {
        res.data.rows.map(r => {
          this.constents.card2.datasets[0].data.push(r.pending);
          this.constents.card2.datasets[0].data.push(r.pending_cufe);
          this.constents.card2.datasets[0].data.push(r.send);
        });
      }
    );
  }

  forYear(date: any, refresh: boolean) {
    this._is.invoiceForYearxUser(this.dateString(date), this._as.getDataUser().username)
      .subscribe(
        res => {
          this.constents.card1.labels = [];
          this.constents.card1.datasets[0].data = [];
          this.constents.card1.datasets[1].data = [];
          this.constents.card1.datasets[2].data = [];
          this.constents.card1.datasets[3].data = [];
          res.data.rows.map(r => {
            this.constents.card1.labels.push(r.nombre_mes);
            this.constents.card1.datasets[0].data.push(parseInt(r.cantidad_1, 0));
            this.constents.card1.datasets[1].data.push(parseInt(r.cantidad_2, 0));
            this.constents.card1.datasets[2].data.push(parseInt(r.valor_1, 0));
            this.constents.card1.datasets[3].data.push(parseInt(r.valor_2, 0));
          });
          if (refresh) {
            this.chart.reinit();
          }
        }
      );
  }

  addEvent(type: string, event: MatDatepickerInputEvent<any>) {
    this.forYear(event.value._d, true);
  }

  dateString(date: any) {
    let month, day;
    month = (date.getMonth() + 1) < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
    day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
    return `${date.getFullYear()}-${month}-${day}`;
  }

  selectData(event, card: string) {
    let data;
    card === 'card1' ? data = this.constents.card1 : data = this.constents.card2;
    const title = data.labels[event.element._datasetIndex];
    const detail = data.datasets[event.element._datasetIndex].data[event.element._index];
    this.messageService.add({severity: 'success', summary: title, detail: detail, life: 3000 });
}
}
