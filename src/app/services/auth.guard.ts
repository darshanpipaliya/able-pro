import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { LocalStorageService } from '../services/local-storage.service';
import { ErrorWarningPopupComponent } from '../common/error-warning-popup/error-warning-popup.component';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router,
    private localStorageService: LocalStorageService, public dialog: MatDialog) { }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    if (this.localStorageService.getObjectValue('token') != null) {
      return true;
    } else {
      setTimeout(() => {
        if (this.localStorageService.getObjectValue('token') == null) {
          let errorData: any = {
            messgeType: 'error',
            title: 'Attention',
            titleClass: 'text-c-blue',
            icon: 'fas fa-exclamation-circle',
            iconClass: 'text-c-blue f-70',
            message: 'Login Required',
          };
          this.dialog.open(ErrorWarningPopupComponent, {
            panelClass: 'error-warning',
            data: errorData,
          });
        }
      }, 1000);
      return this.router.parseUrl("/auth/signin");
    }
  }

}
