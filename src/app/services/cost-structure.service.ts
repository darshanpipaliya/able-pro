import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { UrlToolsService } from './url-tools.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { VariableManageService } from './variable-manage.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { SessionStorageService } from './session-storage.service';
import { LocalStorageService } from './local-storage.service';
import { api_list } from './api-list';
import { environment } from 'src/environments/environment';
import { ErrorWarningPopupComponent } from '../common/error-warning-popup/error-warning-popup.component';

@Injectable()
export class CostStructureService {
    baseUrl = environment.base_url;
    tokenExpdialogRef: any;

    constructor(private http: HttpClient, private urlTools: UrlToolsService,
        private variableService: VariableManageService,
        private sessionStorageService: SessionStorageService,
        private localStorageService: LocalStorageService,
        public dialog: MatDialog,
        private router: Router,
    ) { }

    costCenterDD(data: any) {
        return this.http.post(this.urlTools.addDynamicURL(api_list.coststructure.costcenterDropdown), data);
    }

    ccStructureTypes() {
        return this.http.get(this.urlTools.addDynamicURL(api_list.coststructure.ccStructureTypes));
    }

    ccStructuresRule(data: any) {
        return this.http.post(this.urlTools.addDynamicURL(api_list.coststructure.ccStructuresRule), data);
    }

    getccStructures(data: any) {
        return this.http.post(this.urlTools.addDynamicURL(api_list.coststructure.getCCstructures), data);
    }

    getccStructuresDetail(Id: any) {
        return this.http.get(this.urlTools.addDynamicURL(api_list.coststructure.getCCstructureDetail, { Id: Id }));
    }

    exportExcelStructureData(data: any) {
        return this.http.post(this.urlTools.addDynamicURL(api_list.coststructure.getCCstructures), data, { responseType: 'blob' });
    }

    getApproverDropdown(custId: any = null, compId: any = null) {

        let queryParams: any = {
            customerAccountId : custId,
            companyId : compId,
        }

        for (const key in queryParams) {
            if (queryParams[key] === null || queryParams[key] === 'all') {
                delete queryParams[key];
            }
        }

        return this.http.get(this.urlTools.addDynamicURL(api_list.coststructure.getApproverDropdown, {}), queryParams ? this.urlTools.addQueryParams(queryParams) : {}).pipe(
            catchError((err) => {
                this.tokenExpired(err)
                return throwError(() => err);
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
}