import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { UrlToolsService } from './url-tools.service';
import { VariableManageService } from './variable-manage.service';

import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { SessionStorageService } from './session-storage.service';
import { LocalStorageService } from './local-storage.service';
import { ErrorWarningPopupComponent } from '../common/error-warning-popup/error-warning-popup.component';
import { result } from 'lodash';


@Injectable({
  providedIn: 'root'
})
export class ContractService {

  baseUrl = environment.base_url;
  tokenExpdialogRef: any;

  getAllContractsUrl = this.baseUrl + 'contracts/LoggedInUser';
  getContractContainerbyIdUrl = this.baseUrl + 'contracts/{contractId}/{type}';

  getGetContractMonthsUrl = this.baseUrl + 'contracts/months';
  getContractOrAddendumDetailsUrl = this.baseUrl + 'contracts/{id}/{type}/details';
  DownloadAttachmentUrl = this.baseUrl + 'contracts/Document/Download/{id}/{type}';
  UpdateContractOrAddendumUrl = this.baseUrl + 'contracts/update/{id}';
  saveContractUrl = this.baseUrl + 'contracts';
  loggedInUserUrl = this.baseUrl + 'contracts/LoggedInUser/DropDown';
  addProduct = this.baseUrl + 'vendorproductinventories/contract';
  getinventoriesForContractUrl = this.baseUrl + 'inventories/LoggedInUser';
  getLinkedinventoriesForContractUrl = this.baseUrl + 'contracts/{id}/Type/{documentType}/VendorProductInventory';
  saveNewAddumUrl = this.baseUrl + 'contracts/addendum';
  linkInventoryUrl = this.baseUrl + 'contracts/{id}/Type/{documentType}/VendorProductInventory';
  getReplaceContractGridUrl = this.baseUrl + 'contracts/ReplaceContractGrid/{id}';

  constructor(private http: HttpClient,
    private urlTools: UrlToolsService,
    private variableService: VariableManageService,
    public dialog: MatDialog,
    private router: Router,
    private sessionStorageService: SessionStorageService,
    private localStorageService: LocalStorageService,
  ) { }

  
  getAllContracts(data: any): Observable<any> {
    return this.http.post(this.urlTools.addDynamicURL(this.getAllContractsUrl), data).pipe(
      catchError((err) => {
        this.tokenExpired(err);
        return throwError(err);
      })
    );
  }

  getAllContractsExport(data: any): Observable<any> {
    return this.http.post(this.urlTools.addDynamicURL(this.getAllContractsUrl), data, { responseType: 'blob' }).pipe(
      catchError((err) => {
        this.tokenExpired(err);
        return throwError(err);
      })
    )
  }

  getContractContainerbyId(contractId: any, type: any) {
    return this.http.get(this.urlTools.addDynamicURL(this.getContractContainerbyIdUrl, { contractId: contractId, type: type })).pipe(
      catchError((err) => {
        this.tokenExpired(err);
        return throwError(err);
      })
    );
  }

  getGetContractMonths() {
    return this.http.get(this.urlTools.addDynamicURL(this.getGetContractMonthsUrl)).pipe(
      catchError((err) => {
        this.tokenExpired(err);
        return throwError(err);
      })
    );
  }

  getContractOrAddendumDetails(id: any, type: any) {
    return this.http.get(this.urlTools.addDynamicURL(this.getContractOrAddendumDetailsUrl, { id: id, type: type })).pipe(
      catchError((err) => {
        this.tokenExpired(err);
        return throwError(err);
      })
    );
  }

  DownloadAttachment(id: any, type: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.DownloadAttachmentUrl, { id: id, type: type }), { responseType: 'blob' }).pipe(
      catchError((err) => {
        this.tokenExpired(err);
        return throwError(err);
      })
    );
  }

  UpdateContractOrAddendum(id: any, data: any) { //contract id as data
    return this.http.put(this.urlTools.addDynamicURL(this.UpdateContractOrAddendumUrl, {id: id}), data).pipe(
      catchError((err) => {
        this.tokenExpired(err);
        return throwError(err);
      })
    );
  }

  saveContract(data: any): Observable<any> {
    return this.http.post(this.urlTools.addDynamicURL(this.saveContractUrl), data).pipe(
      catchError((err) => {
        this.tokenExpired(err);
        return throwError(err);
      })
    );
  }

  getReplaceContractGrid(id: any){
    return this.http.get(this.urlTools.addDynamicURL(this.getReplaceContractGridUrl, { id: id })).pipe(
      catchError((err) => {
        this.tokenExpired(err);
        return throwError(err);
      })
    );
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

  // loggedUserUrl() {
    
  //   return this.http.get(this.urlTools.addDynamicURL(this.loggedInUserUrl)).pipe(
  //     catchError((err) => {
  //       this.tokenExpired(err);
  //       return throwError(err);
  //     })
  //   );
  // }

  loggedUserUrl(VendorAccountId = ''): Observable<any> {
    let key = '?';
    if(VendorAccountId !== '') {
      key = key + `VendorAccountId=${VendorAccountId}`;
    }
    return this.http.get(this.urlTools.addDynamicURL(this.loggedInUserUrl+key, {})).pipe(
      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  addProductToContract(data: any) {
    return this.http.post(this.urlTools.addDynamicURL(this.addProduct), data).pipe(
      catchError((err) => {
        this.tokenExpired(err);
        return throwError(err);
      })
    );
  }

  getinventoriesForContract(data: any): Observable<any> {
    return this.http.post(this.urlTools.addDynamicURL(this.getinventoriesForContractUrl), data).pipe(
      catchError((err) => {
        this.tokenExpired(err);
        return throwError(err);
      })
    );
  }

  getLinkedinventoriesForContract(documentType: any, id: any): Observable<any> {
    return this.http.post(this.urlTools.addDynamicURL(this.getLinkedinventoriesForContractUrl, { id: id, documentType: documentType }), {}).pipe(
      catchError((err) => {
        this.tokenExpired(err);
        return throwError(err);
      })
    );
  }

  linkInventory(id: any,documentType: any,data: any) { 
    return this.http.put(this.urlTools.addDynamicURL(this.linkInventoryUrl, { id: id, documentType: documentType }), data).pipe(
      catchError((err) => {
        this.tokenExpired(err);
        return throwError(err);
      })
    );
  }

  saveNewAddum(data: any): Observable<any> {
    return this.http.post(this.urlTools.addDynamicURL(this.saveNewAddumUrl), data).pipe(
      catchError((err) => {
        this.tokenExpired(err);
        return throwError(err);
      })
    );
  }
}
