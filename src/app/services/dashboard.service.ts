import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UrlToolsService } from './url-tools.service';
import { Observable } from 'rxjs';
import { api_list } from './api-list';

@Injectable()
export class DashboardService {

    constructor(private http: HttpClient, private urlTools: UrlToolsService) {
    }
    getSpendSummary(data: any){
        return this.http.post(this.urlTools.addDynamicURL(api_list.dashboard.SpendSummary), data);
    }

    getSpendOverviewData(data: any) {
        return this.http.post(this.urlTools.addDynamicURL(api_list.dashboard.spendOverview), data);
    }

    getProcessingData(data: any) {
        return this.http.post(this.urlTools.addDynamicURL(api_list.dashboard.invoiceprocessing), data);
    }

    getSpendVendor(data: any) {
        return this.http.post(this.urlTools.addDynamicURL(api_list.dashboard.spendVendor), data);
    }

    getInventoryOverview(data: any) {
        return this.http.post(this.urlTools.addDynamicURL(api_list.dashboard.inventoryOverview), data);
    }

    getExpiredContract(data: any) {
        return this.http.post(this.urlTools.addDynamicURL(api_list.dashboard.expiredContracts), data);
    }

    disconnectedProduct(data: any) {
        return this.http.post(this.urlTools.addDynamicURL(api_list.dashboard.disconnectedProduct), data);
    }

    closedLocation(data: any) {
        return this.http.post(this.urlTools.addDynamicURL(api_list.dashboard.inactiveLocation), data);
    }

    inactivePeople(data: any) {
        return this.http.post(this.urlTools.addDynamicURL(api_list.dashboard.inactivePeople), data);
    }

    getVendorChart(data?: any): Observable<any> {
        return this.http.post(this.urlTools.addDynamicURL(api_list.dashboard.VendorChartUrl), data);
    }

    getInventoryByStatusChart(data?: any): Observable<any>  {
        return this.http.post(this.urlTools.addDynamicURL(api_list.dashboard.InventoryByStatusUrl), data);
    }

    getSpendSumByProduct(data?: any): Observable<any>  {
        return this.http.post(this.urlTools.addDynamicURL(api_list.dashboard.SpendSumByProductUrl), data);
    }

    getSpendSumByProductType(data?: any): Observable<any>  {
        return this.http.post(this.urlTools.addDynamicURL(api_list.dashboard.SpendSumByProductTypeUrl), data);
    }
    invoiceSumByVendor(data: any) {
        return this.http.post(this.urlTools.addDynamicURL(api_list.dashboard.invoiceSumByVendor), data);
    }

    spendBySummary(data: any) {
        return this.http.post(this.urlTools.addDynamicURL(api_list.dashboard.spendSummarybyVendor), data);
    }

    spendSumByService(data: any) {
        return this.http.post(this.urlTools.addDynamicURL(api_list.dashboard.spendSumByService), data);
    }

    invoiceMonitor(data: any) {
        return this.http.post(this.urlTools.addDynamicURL(api_list.dashboard.invoiceMonitor), data);
    }
}
