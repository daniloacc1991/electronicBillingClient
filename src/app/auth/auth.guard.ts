import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private _as: AuthService, private router: Router) { }

  canActivate(): boolean {
    const token: string = localStorage.getItem('token');
    if (!token) {
      localStorage.clear();
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }

  // canActivate(
  //   next: ActivatedRouteSnapshot,
  //   state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
  //     if (!this._as.loggedIn) {
  //       localStorage.clear()
  //       this.router.navigate(['/login']);
  //       return false;
  //     }
  //   return true;
  // }
}
