import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpInterceptorFn } from '@angular/common/http';
import { LocalStorageService } from './local-storage.service';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';

export class TokenInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable < HttpEvent < any >> {
    const localStorageService = inject(LocalStorageService);
    const token = localStorageService.getObjectValue('token');

    const ignorUrl = [
      "https://maps.googleapis.com/maps/api/geocode"
    ] as string[];

    if(!token || ignorUrl.includes(req.url)) {
    return next.handle(req);
  }

  req = req.clone({
    headers: req.headers.set('Authorization', `Bearer ${token}`),
  });

    return next.handle(req);
}
};
