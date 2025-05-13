import { Injectable, inject } from '@angular/core';
import { Router, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { LocalStorageService } from 'src/app/services/local-storage.service';
import { MatDialog } from '@angular/material/dialog';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';

@Injectable({ providedIn: 'root' })
export class AuthGuardChild implements CanActivateChild {

  constructor(private router: Router,
    private localStorageService: LocalStorageService, public dialog: MatDialog) { }


  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

    if (this.localStorageService.getObjectValue('token') != null) {
      return true;
    } else {
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

      return this.router.parseUrl("/auth/signin");

    }


   
  }
}
