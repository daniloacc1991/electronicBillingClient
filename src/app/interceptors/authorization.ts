import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class Autorization implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token');
    if (token) {
      const duplicate = req.clone({ headers: req.headers.set('Authorization', `Bearer ${JSON.parse(token).token}`) });
      // console.log(duplicate);
      return next.handle(duplicate);
    } else {
      return next.handle(req);
    }
  }
}
