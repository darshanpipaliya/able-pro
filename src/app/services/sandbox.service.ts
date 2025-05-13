import { Injectable } from '@angular/core';
import { api_list } from './api-list';
import { HttpClient } from '@angular/common/http';
import { UrlToolsService } from './url-tools.service';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';

@Injectable()
export class SandBoxService {
    baseUrl = environment.base_url;
    sandboxFilter = [];
    isSwitchValue: boolean = false;

    constructor(private http: HttpClient, private urlTools: UrlToolsService) { }

    validationtotalsummary(Id: any, data: any) {
        return this.http.put(this.urlTools.addDynamicURL(api_list.SandBox.step_1.validationtotalsummary, { Id: Id }), data);
    }

    getValidationtotalsummary(Id: any) {
        return this.http.get(this.urlTools.addDynamicURL(api_list.SandBox.step_1.validationtotalsummary, { Id: Id }));
    }

    getVBAbyChargeCode(Id: any) {
        return this.http.get(this.urlTools.addDynamicURL(api_list.SandBox.step_2.VBAbyChargeCode, { Id: Id }));
    }

    updateVBAbyChargeCode(Id: any, data: any) {
        return this.http.put(this.urlTools.addDynamicURL(api_list.SandBox.step_2.VBAbyChargeCode, { Id: Id }), data);
    }

    ChargeCodeAssignment(Id: any) {
        return this.http.get(this.urlTools.addDynamicURL(api_list.SandBox.step_3.ChargeCodeAssignment, { Id: Id }));
    }

    // Don't Remove or change this code => Mihir
    ChargeCodeContextDetails(Id: any): Observable<any> {
        // return this.http.get(this.urlTools.addDynamicURL(api_list.SandBox.step_3.ChargeCodeContextDetails, { Id: Id }));
        return new Observable(observer => {
            observer.next(Id);
          }).pipe(
            debounceTime(500),  // Wait 500ms after the last change
            switchMap(query => this.http.get(this.urlTools.addDynamicURL(api_list.SandBox.step_3.ChargeCodeContextDetails, { Id: Id })))
          );
    }

    ChargeCodeContextBlank(Id: any, queryParams: any) {
        return this.http.get(this.urlTools.addDynamicURL(api_list.SandBox.step_3.ChargeCodeContextBlank, { Id: Id }), this.urlTools.addQueryParams(queryParams));
    }

    ChargeCode(data: any) {
        return this.http.post(this.urlTools.addDynamicURL(api_list.SandBox.step_3.ChargeCode), data);
    }

    AssignBlankChangeCode(Id: any, data: any) {
        return this.http.put(this.urlTools.addDynamicURL(api_list.SandBox.step_3.AssignBlankChangeCode, { Id: Id }), data);
    }
    ChargeCodeContext(Id: any, sbChargeDetailId: any) {
        return this.http.get(this.urlTools.addDynamicURL(api_list.SandBox.step_3.ChargeCodeContextId, { Id: Id, sbChargeDetailId: sbChargeDetailId }));
    }

    parentChargeCode(data: any) {
        return this.http.post(this.urlTools.addDynamicURL(api_list.SandBox.step_3.ParentChargeCode), data);
    }

    ChargeCodeContextNew(id: any, data: any) {
        return this.http.post(this.urlTools.addDynamicURL(api_list.SandBox.step_3.ChargeCodeContext, { id: id }), data);
    }

    chargeCodeAssignmentNew(id: any, data: any) {
        return this.http.post(this.urlTools.addDynamicURL(api_list.SandBox.step_3.ChargeCodeAssignment, { Id: id }), data);
    }

    vendorProductAssignment(Id: any) {
        return this.http.get(this.urlTools.addDynamicURL(api_list.SandBox.step_4.VendorProductAssignment, { Id: Id }));
    }

    vpaBySBInvoiceInventory(data: any) {
        return this.http.post(this.urlTools.addDynamicURL(api_list.SandBox.step_4.VPABySBInvoiceInventory), data);
    }
    getSandboxGrid() {
        return this.http.get(this.urlTools.addDynamicURL(api_list.SandBox.sandBoxGrid));
    }
    getSandboxGridData(value: any) {
        return this.http.post(this.urlTools.addDynamicURL(api_list.SandBox.sandBoxGrid), value);
    }
    sandboxDataExport(value: any) {
        return this.http.post(this.urlTools.addDynamicURL(api_list.SandBox.sandBoxGrid), value, { responseType: 'blob'});
    }
    getVPChargeCodeGroups(Id: any) {
        return this.http.get(this.urlTools.addDynamicURL(api_list.SandBox.step_4.VPChargeCodeGroups, { Id: Id }));
    }
    getInvoiceOverview(id: any, queryParams ?: any) {
        return this.http.get(this.urlTools.addDynamicURL(api_list.SandBox.InvoiceOverview, { id: id }), queryParams ? this.urlTools.addQueryParams(queryParams) : {}  );
    }
    getChargeValidation(id: any) {
        return this.http.get(this.urlTools.addDynamicURL(api_list.SandBox.step_4.ChargeValidation, { Id: id }));
    }
    getChargeValidationByAccount(id: any) {
        return this.http.get(this.urlTools.addDynamicURL(api_list.SandBox.step_4.ChargeValidationByAccount, { Id: id }));
    }
    addVPChargeCodeGroups(id: any, data: any) {
        return this.http.post(this.urlTools.addDynamicURL(api_list.SandBox.step_4.VPChargeCodeGroups, { Id: id }), data);
    }
    chargeValidationByBillingId(id: any) {
        return this.http.get(this.urlTools.addDynamicURL(api_list.SandBox.step_4.ChargeValidationByBillingId, { Id: id }));
    }
    chargeValidationByChargeLocations(id: any) {
        return this.http.get(this.urlTools.addDynamicURL(api_list.SandBox.step_4.ChargeValidationByChargeLocations, { Id: id }));
    }
    distributionOriginLevelTypes(id: any, data: any) {
        return this.http.post(this.urlTools.addDynamicURL(api_list.SandBox.step_4.distributionOriginLevelTypes, { Id: id }), data);
    }
    chargeValidationDetails(id: any, data: any) {
        return this.http.post(this.urlTools.addDynamicURL(api_list.SandBox.step_4.ChargeValidationDetails, { Id: id }), data);
    }
    getunitOfMeasures() {
        return this.http.get(this.urlTools.addDynamicURL(api_list.SandBox.add_correction.unitOfMeasures));
    }
    subAccountDropDown(id: any) {
        return this.http.get(this.urlTools.addDynamicURL(api_list.SandBox.add_correction.SubAccountDropDown, { Id: id }));
    }
    chargeLocationTypes() {
        return this.http.get(this.urlTools.addDynamicURL(api_list.SandBox.add_correction.chargeLocationTypes));
    }
    addCorrection(id: any, data: any) {
        return this.http.post(this.urlTools.addDynamicURL(api_list.SandBox.add_correction.correction, { Id: id }), data);
    }
    chargeCodeGroupAndVendorProduct(data: any) {
        return this.http.post(this.urlTools.addDynamicURL(api_list.SandBox.step_5.ChargeCodeGroupAndVendorProduct), data);
    }
    vPABySBInvoiceInventory(data: any) {
        return this.http.post(this.urlTools.addDynamicURL(api_list.SandBox.step_5.VPABySBInvoiceInventory), {}, data);
    }
    getDistributionRules(id: any) {
        return this.http.get(this.urlTools.addDynamicURL(api_list.SandBox.step_6.DistributionRules, { Id: id }));
    }
    postDistributionRules(id: any) {
        return this.http.post(this.urlTools.addDynamicURL(api_list.SandBox.step_6.DistributionRules, { Id: id }),{});
    }
    addDistributionRules(id: any, data: any) {
        return this.http.post(this.urlTools.addDynamicURL(api_list.SandBox.step_6.DistributionRules, { Id: id }), data);
    }
    refreshGridData(id: any) {
        return this.http.get(this.urlTools.addDynamicURL(api_list.SandBox.refreshGrid, { Id: id }));
    }
    statusList() {
        return this.http.get(this.urlTools.addDynamicURL(api_list.SandBox.sandboxstatuses));
    }
    sandboxStatus(id: any, SId: any) {
        return this.http.put(this.urlTools.addDynamicURL(api_list.SandBox.Status, { Id: id, SId: SId }), {});
    }
    sandboxPublish(id: any) {
        return this.http.put(this.urlTools.addDynamicURL(api_list.SandBox.Publish, { Id: id}), {});
    }
    sandboxUnPublish(id: any) {
        return this.http.put(this.urlTools.addDynamicURL(api_list.SandBox.step_7.unPublish, { Id: id}), {});
    }
    downloadDataFiles(id: any) {
        return this.http.get(this.urlTools.addDynamicURL(api_list.SandBox.downloadDataFiles, { Id: id }), { responseType: 'blob'});
    }
    downloaBDFFiles(id: any, queryParams ?: any) {
        const finalUrl = this.urlTools.addDynamicURL(api_list.SandBox.downloadBDFFiles, { Id: id });
        const httpOptions = this.urlTools.addQueryParams(queryParams)
        return this.http.get(finalUrl, { ...httpOptions, responseType: 'blob' });
    }
    finalReview(id: any) {
        return this.http.get(this.urlTools.addDynamicURL(api_list.SandBox.step_7.finalReview, { Id : id }));
    }
    changeSBRepName(sbInvoiceId: any, temUserId: any){
        return this.http.put(this.urlTools.addDynamicURL(api_list.SandBox.changeSBRepName, { sbInvoiceId: sbInvoiceId, temUserId: temUserId }), {});
    }
    VPABySBInvoiceInventoryId(id: any, data: any) {
        return this.http.post(this.urlTools.addDynamicURL(api_list.SandBox.step_4.VPChargeCodeGroups, { Id: id }), data);
    }
    chargeCodeNeedRules(id: any, queryParams ?: any) {
        return this.http.get(this.urlTools.addDynamicURL(api_list.SandBox.step_4_3.ChargeCodeNeedRules, { Id : id }), queryParams ? this.urlTools.addQueryParams(queryParams) : {} );
    }
    costDistributionEvent(id: any, queryParams ?: any){
        return this.http.get(this.urlTools.addDynamicURL(api_list.SandBox.step_4_3.CostDistributionRules, { Id : id }), queryParams ? this.urlTools.addQueryParams(queryParams) : {});
    }
    distributionAccountLocationTypes() {
        return this.http.get(this.urlTools.addDynamicURL(api_list.SandBox.step_4_3.distributionAccountLocationTypes));
    }
    distributionRuleTypes() {
        return this.http.get(this.urlTools.addDynamicURL(api_list.SandBox.step_4_3.distributionRuleTypes));
    }
    distributionOriginLevelType() {
        return this.http.get(this.urlTools.addDynamicURL(api_list.SandBox.step_4_3.distributionOriginLevelType));
    }
    distributionMethodTypes() {
        return this.http.get(this.urlTools.addDynamicURL(api_list.SandBox.step_4_3.distributionMethodTypes));
    }
    billingIds(id: any) {
        return this.http.get(this.urlTools.addDynamicURL(api_list.SandBox.step_4_3.billingIds, { Id : id }));
    }
    subAccounts(id: any) {
        return this.http.get(this.urlTools.addDynamicURL(api_list.SandBox.step_4_3.subaccounts, { Id : id }));
    }
    distributionRulesOptions() {
        return this.http.get(this.urlTools.addDynamicURL(api_list.SandBox.step_4_3.distributionRulesOptions));
    }
    preDistributionDetails(Id: any, distributionEventId: any, queryParams ?: any) {
        return this.http.get(this.urlTools.addDynamicURL(api_list.SandBox.step_4_3.PreDistributionDetails, { Id: Id, distributionEventId: distributionEventId }), queryParams ? this.urlTools.addQueryParams(queryParams) : {});
    }
    DistributionDetails(queryParams: any) {
        return this.http.post(this.urlTools.addDynamicURL(api_list.SandBox.step_4_3.DistributionDetails), queryParams );
    }   
    DistributionDetailsExcel(queryParams: any) {
        return this.http.post(this.urlTools.addDynamicURL(api_list.SandBox.step_4_3.DistributionDetails), queryParams , { responseType: 'blob'});
    }   
    sandboxinvoiceRetreival(sbInvoiceId: any, expectedInvoiceId: any) {
        return this.http.put(this.urlTools.addDynamicURL(api_list.SandBox.invoiceRetreival, { sbInvoiceId: sbInvoiceId, expectedInvoiceId: expectedInvoiceId }), {});
    }
    VPChargeCodeGroupsView(id: any, data: any) {
        return this.http.post(this.urlTools.addDynamicURL(api_list.SandBox.step_5.VPChargeCodeGroupsView, { Id: id }), data);
    }
    FromOtherSBInvoice(id: any, data: any) {
        return this.http.post(this.urlTools.addDynamicURL(api_list.SandBox.step_5.FromOtherSBInvoice, { Id: id }), data );
    }
 
    FromOtherSBInvoiceData(id: any, data: any) {
        return this.http.post(this.urlTools.addDynamicURL(api_list.SandBox.step_5.FromOtherSBInvoiceData, { Id: id }), data );
    }
    applyDistribution(id: any, queryParams: any) {
        return this.http.get(this.urlTools.addDynamicURL(api_list.SandBox.step_4_3.ruleApply, { Id: id }), this.urlTools.addQueryParams(queryParams) );
    }
    FromOtherSBInvoiceSave(id: any, data: any) {
        return this.http.post(this.urlTools.addDynamicURL(api_list.SandBox.step_5.FromOtherSBInvoiceSave, { Id: id }), data );
    }
    invoiceProcesingStep(id: any) {
        return this.http.post(this.urlTools.addDynamicURL(api_list.SandBox.InvoiceProcesingStep, { id: id }) , {});
    }
    getDistributionChangeLog(id: any) {
        return this.http.get(this.urlTools.addDynamicURL(api_list.SandBox.distributionRuleLog, { Id: id }));
    }
    getInvoiceDistributionChangeLog(id: any) {
        return this.http.get(this.urlTools.addDynamicURL(api_list.SandBox.invoiceChangeLog, { Id: id }));
    }

    refreshButton(id: any) {
        return this.http.get(this.urlTools.addDynamicURL(api_list.SandBox.step_5.refreshButtonUrl, { Id: id }));
    }

    markCloseInvoiceFn(data: any) {
        return this.http.put(this.urlTools.addDynamicURL(api_list.SandBox.MarkCloseInvoice, {}), data);
    }
    chargeValidationByBillingIds(id: any, data: any) {
        return this.http.post(this.urlTools.addDynamicURL(api_list.SandBox.step_4.ChargeValidationByBillingId, { Id: id }), data);
    }

    
    invoiceRuleApply(id: any, queryParams: any) {
        return this.http.get(this.urlTools.addDynamicURL(api_list.SandBox.invoiceApply, { Id: id }), this.urlTools.addQueryParams(queryParams) );
    }
}
