import { Injectable } from '@angular/core';
import { api_list } from './api-list';
import { HttpClient } from '@angular/common/http';
import { UrlToolsService } from './url-tools.service';

@Injectable()
export class InvoiceService {

    constructor(private http: HttpClient, private urlTools: UrlToolsService) {
    }

    chargeCodeNeedRules(id: any, queryParams?: any) {
        return this.http.get(this.urlTools.addDynamicURL(api_list.Invoice.InvoiceChargeCodeNeedRules, { Id: id }), queryParams ? this.urlTools.addQueryParams(queryParams) : {});
    }

    costDistributionEvent(id: any) {
        return this.http.get(this.urlTools.addDynamicURL(api_list.Invoice.InvoiceCostDistributionRules, { Id: id }));
    }

    preDistributionDetails(Id: any, distributionEventId: any) {
        return this.http.get(this.urlTools.addDynamicURL(api_list.Invoice.InvoicePreDistributionDetails, { Id: Id, distributionEventId: distributionEventId }));
    }
    DistributionDetails(data: any) {
        return this.http.post(this.urlTools.addDynamicURL(api_list.Invoice.InvoiceDistributionDetails), data);
    }
    DistributionDetailsExport(data: any) {
        return this.http.post(this.urlTools.addDynamicURL(api_list.Invoice.InvoiceDistributionDetails), data, { responseType: 'blob' });
    }
    ChargeCodeContextDetails(Id: any) {
        return this.http.get(this.urlTools.addDynamicURL(api_list.Invoice.ChargeCodeContext, { Id: Id }));
    }
    billingIds(id: any) {
        return this.http.get(this.urlTools.addDynamicURL(api_list.Invoice.billingIds, { Id: id }));
    }
    subAccounts(id: any) {
        return this.http.get(this.urlTools.addDynamicURL(api_list.Invoice.subaccounts, { Id: id }));
    }
    addDistributionRules(id: any, data: any) {
        return this.http.post(this.urlTools.addDynamicURL(api_list.Invoice.DistributionRules, { Id: id }), data);
    }
    distributionDetail(id: any) {
        return this.http.get(this.urlTools.addDynamicURL(api_list.Invoice.ruleDetail, { Id: id }));
    }
    getcostAllocationVendorProduct(id: any, data: any) {
        return this.http.post(this.urlTools.addDynamicURL(api_list.Invoice.costAllocationVendorProduct, { Id: id }), data);
    }
    getcostAllocationStructure(id: any, data: any) {
        return this.http.post(this.urlTools.addDynamicURL(api_list.Invoice.costAllocationStructure, { Id: id }), data);
    }
    costAllocationExcel(id: any, data: any) {
        return this.http.post(this.urlTools.addDynamicURL(api_list.Invoice.costAllocationExport, { Id: id }), data, { responseType: 'blob' });
    }
    rerunAllocation(id: any) {
        return this.http.put(this.urlTools.addDynamicURL(api_list.Invoice.costAllocationRerun, { Id: id }), {});
    }
    costAllocationStructureExport(id: any, data: any) {
        return this.http.post(this.urlTools.addDynamicURL(api_list.Invoice.costAllocationStructure, { Id: id }), data, { responseType: 'blob' });
    }
}
