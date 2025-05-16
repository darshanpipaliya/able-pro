import { Injectable } from '@angular/core';

import { api_list } from './api-list';
import { HttpClient } from '@angular/common/http';
import { UrlToolsService } from './url-tools.service';
import { environment } from 'src/environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { VariableManageService } from './variable-manage.service';
import { ErrorWarningPopupComponent } from '../common/error-warning-popup/error-warning-popup.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { SessionStorageService } from './session-storage.service';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class FinanceInvoicesService {

  baseUrl = environment.base_url;
  tokenExpdialogRef: any;
  constructor(private http: HttpClient,
    private urlTools: UrlToolsService,
    private variableService: VariableManageService,
    public dialog: MatDialog,
    private router: Router,
    private sessionStorageService: SessionStorageService,
    private localStorageService: LocalStorageService,
  ) {

  }

  getInvoiceGriData(data: any) {
    return this.http.post(this.urlTools.addDynamicURL(api_list.finance_invoice.getInvoiceGridUrl), data);
  }

  getInvoiceGriDataExport(data: any): Observable<any> {
    return this.http.post(this.urlTools.addDynamicURL(api_list.finance_invoice.getInvoiceGridUrl), data, { responseType: 'blob' }).pipe(
      catchError((err) => {
        this.tokenExpired(err);
        return throwError(() => err);
      })
    )
  }

  getInvoiceOverview(InvoiceId: any){
    return this.http.get(this.urlTools.addDynamicURL(api_list.finance_invoice.getInvoiceOverviewUrl, { InvoiceId : InvoiceId }));
  }

  getInvoiceCostOverview(InvoiceId: any){
    return this.http.get(this.urlTools.addDynamicURL(api_list.finance_invoice.getInvoiceCostOverviewUrl, { InvoiceId : InvoiceId }));
  }

  getInvoiceServiceSummery(data: any, invoiceId: any){
    return this.http.post(this.urlTools.addDynamicURL(api_list.finance_invoice.getInvoiceServiceSummeryUrl, { invoiceId : invoiceId }), data);
  }

  getInvoiceServiceSummeryExport(data: any): Observable<any> {
    return this.http.post(this.urlTools.addDynamicURL(api_list.finance_invoice.getInvoiceServiceSummeryUrl), data, { responseType: 'blob' }).pipe(
      catchError((err) => {
        this.tokenExpired(err);
        return throwError(() => err);
      })
    )
  }

  tokenExpired(err: any) {
    if (err && err.status === 401 && !this.variableService.isLoggedinPopup) {
      this.variableService.isLoggedinPopup = true;
      let errorData: any = {
        messgeType: "error",
        title: "Attention",
        titleClass: "text-c-blue",
        icon: "fas fa-exclamation-circle",
        iconClass: "text-c-blue f-70",
        message: 'Login Required'
      };

      if (this.tokenExpdialogRef == 'undefined' || this.tokenExpdialogRef == undefined) {
        this.tokenExpdialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
        this.tokenExpdialogRef.afterClosed().subscribe((result: any) => {
        });
        this.sessionStorageService.clearSessionObjects();
        this.localStorageService.clearSessionObjects();
        this.router.navigate(['/auth/signin']);
      } else {
        this.tokenExpdialogRef.close();
      }
    }
  }

  saveInvoiceNotes(data: any){
    return this.http.post(this.urlTools.addDynamicURL(api_list.finance_invoice.saveInvoiceNotesUrl), data).pipe(
      catchError((err) => {
        this.tokenExpired(err);
        return throwError(() => err);
      })
    );
  }  

  getInoviceNotes(data: any){
    return this.http.post(this.urlTools.addDynamicURL(api_list.finance_invoice.getInoviceNotesUrl), data).pipe(
      catchError((err) => {
        this.tokenExpired(err);
        return throwError(() => err);
      })
    );
  }

  getInoviceNotesExport(data: any): Observable<any> {
    return this.http.post(this.urlTools.addDynamicURL(api_list.finance_invoice.getInoviceNotesUrl), data, { responseType: 'blob' }).pipe(
      catchError((err) => {
        this.tokenExpired(err);
        return throwError(() => err);
      })
    )
  }

}
