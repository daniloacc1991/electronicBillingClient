import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { trigger, state, style, animate, transition } from '@angular/animations';

import { AuthService } from '../../../auth/auth.service';

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
export class NavigationComponent implements OnInit {

  nameUser: string;
  nameApplication: string;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches)
    );

  constructor(private breakpointObserver: BreakpointObserver, private _as: AuthService,
    private router: Router) {
    if (localStorage.getItem('token')) {
      this.router.navigate(['/home']);
    }
  }

  ngOnInit() {
    this.nameUser = this._as.getToken().username;
  }

  logoff() {
    this._as.logOff()
      .subscribe(
        res => {
          // console.log(res);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          this.router.navigate(['/login']);
        },
        err => {
          console.log(err);
        }
      );
  }

}
