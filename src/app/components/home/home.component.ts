import { Component } from '@angular/core';
import { map } from 'rxjs/operators';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  /** Based on the screen size, switch from standard to one column per row */
  cards = this.breakpointObserver.observe([Breakpoints.Medium, Breakpoints.Small, Breakpoints.XLarge])
    .pipe(
      map((breakpoints) => {
        if (breakpoints.breakpoints["(min-width: 960px) and (max-width: 1279.99px)"] || breakpoints.breakpoints["(min-width: 1920px)"]) {
          return [
            {
              title: 'Card 1',
              cols: 2,
              rows: 1,
              content: {
                total: 20,
                pending: 14,
                send: 6
              }
            },
            {
              title: 'Card 2',
              cols: 1,
              rows: 1,
              content: {
                total: 20,
                pending: 14,
                send: 6
              }
            },
            {
              title: 'Card 3',
              cols: 1,
              rows: 1,
              content: {
                total: 20,
                pending: 14,
                send: 6
              }
            },
            {
              title: 'Card 4',
              cols: 2,
              rows: 1,
              content: {
                total: 20,
                pending: 14,
                send: 6
              }
            }
          ];
        }

        if (breakpoints.breakpoints["(min-width: 600px) and (max-width: 959.99px)"]) {
          return [
            {
              title: 'Card 1',
              cols: 2,
              rows: 1,
              content: {
                total: 20,
                pending: 14,
                send: 6
              }
            },
            {
              title: 'Card 2',
              cols: 1,
              rows: 1,
              content: {
                total: 20,
                pending: 14,
                send: 6
              }
            },
            {
              title: 'Card 3',
              cols: 1,
              rows: 2,
              content: {
                total: 20,
                pending: 14,
                send: 6
              }
            },
            {
              title: 'Card 4',
              cols: 1,
              rows: 1,
              content: {
                total: 20,
                pending: 14,
                send: 6
              }
            }
          ];
        }

        return [
          {
            title: 'Card 1',
            cols: 2,
            rows: 1,
            content: {
              total: 20,
              pending: 14,
              send: 6
            }
          },
          {
            title: 'Card 2',
            cols: 2,
            rows: 1,
            content: {
              total: 20,
              pending: 14,
              send: 6
            }
          },
          {
            title: 'Card 3',
            cols: 2,
            rows: 1,
            content: {
              total: 20,
              pending: 14,
              send: 6
            }
          },
          {
            title: 'Card 4',
            cols: 2,
            rows: 1,
            content: {
              total: 20,
              pending: 14,
              send: 6
            }
          }
        ];
      })
    );

  constructor(private breakpointObserver: BreakpointObserver) {
    console.log(Breakpoints)
  }
}
