import { Component, AfterViewInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { trigger, state, style, animate, transition } from '@angular/animations';

import { AuthService } from '../../../auth/auth.service';
import { NavItem } from '../../../models/nav-item';
import { OpcionesModel } from '../../../models/opciones';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
  animations: [
    trigger('flyInOut', [
      state('in', style({ transform: 'translateX(0)' })),
      transition('void => *', [
        style({ transform: 'translateX(-100%)' }),
        animate(100)
      ]),
      transition('* => void', [
        animate(100, style({ transform: 'translateX(100%)' }))
      ])
    ])
  ]
})
export class NavigationComponent implements AfterViewInit {

  // @ViewChild('appDrawer') appDrawer: ElementRef;
  nameUser: string;
  nameApplication: string;
  navItems: NavItem[] = [];

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches)
    );

  constructor(private breakpointObserver: BreakpointObserver, public _as: AuthService,
    private router: Router) {
    if (localStorage.getItem('token')) {
      this.router.navigate(['/home']);
    }
    this.nameUser = this._as.getToken().username;
    this._as.getMenu()
      .pipe(
        map((res): OpcionesModel[] => res.data.rows)
      )
      .subscribe(
        res => {
          let indexChildren: number;
          let optionRoot: string[];
          for (let index = 0; index < res.length; index++) {
            const option = res[index].opcion.split('.');
            const navItem: NavItem = { displayName: '', children: [] };
            if (option.length === 1) {
              index === 0 ? indexChildren = index : indexChildren++;
              optionRoot = option;
              navItem.displayName = res[index].descripcion;
              navItem.route = res[index].ventana;
              this.navItems.push(navItem);
            } else if (option.length === 2 && option[0] === optionRoot[0]) {
              navItem.displayName = res[index].descripcion;
              navItem.route = this.navItems[indexChildren].route + res[index].ventana;
              this.navItems[indexChildren].children.push(navItem);
            }
          }
        }
      );
  }

  ngAfterViewInit() {
    // this.navService.appDrawer = this.appDrawer;
  }

  logoff() {
    this._as.logOff()
      .subscribe(
        res => {
          localStorage.clear();
          this.router.navigate(['/login']);
        },
        err => {
          console.log(err);
        }
      );
  }
}
