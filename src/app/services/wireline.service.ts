import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { UrlToolsService } from './url-tools.service';
import { environment } from 'src/environments/environment';
import { api_list } from './api-list';

@Injectable()
export class WirelineService {
    baseUrl = environment.base_url;
    constructor(private http: HttpClient, private urlTools: UrlToolsService) { }

    getInventory(value: any): Observable<any> {
        return this.http.post(api_list.Inventory.Grid, value);
    }
    getInventoryData(value: any): Observable<any> {
        return this.http.post(api_list.Inventory.GridData, value);
    }
    getInventoryDataExport(value: any): Observable<any> {
        return this.http.post(api_list.Inventory.GridData, value, { responseType: 'blob' });
    }
    getInventoryExcel(value: any): Observable<any> {
        return this.http.post(api_list.Inventory.Grid, value, { responseType: 'blob' });
    }
    getSubBillingAccountsDD(Id: any): Observable<any> {
        return this.http.get(this.urlTools.addDynamicURL(api_list.Inventory.SubBillingAccounts, { Id: Id }));
    }
    getInventoryorigins(): Observable<any> {
        return this.http.get(this.urlTools.addDynamicURL(api_list.Inventory.inventoryorigins));
    }
    getInventoryoriginsName(): Observable<any> {
        return this.http.get(this.urlTools.addDynamicURL(api_list.Inventory.inventoryoriginsName));
    }
    getServiceDetail(Id: any): Observable<any> {
        return this.http.get(this.urlTools.addDynamicURL(api_list.Inventory.getServiceDetail, { Id: Id }));
    }
    addServiceTypeAttributes(Id: any, value: any): Observable<any> {
        return this.http.post(this.urlTools.addDynamicURL(api_list.Inventory.addServiceTypeAttributes, { Id: Id }), value);
    }
    addChildInventory(value: any): Observable<any> {
        return this.http.post(this.urlTools.addDynamicURL(api_list.Inventory.getchildInventoriesDetail), value);
    }
    getInventoryContacts(value: any, Id: any): Observable<any> {
        return this.http.post(api_list.Inventory.inventorycontacts + '/' + Id, value);
    }
    getInventoryContactsExcel(value: any, Id: any): Observable<any> {
        return this.http.post(api_list.Inventory.inventorycontacts + '/' + Id, value, { responseType: 'blob' });
    }
    getInventoryLocations(value: any, Id: any): Observable<any> {
        return this.http.post(api_list.Inventory.inventorylocations + '/' + Id, value);
    }
    getInventoryLocationsExcel(value: any, Id: any): Observable<any> {
        return this.http.post(api_list.Inventory.inventorylocations + '/' + Id, value, { responseType: 'blob' });
    }
    inventorycontactsAssign(value: any): Observable<any> {
        return this.http.put(api_list.Inventory.inventorycontactsAssign, value);
    }
    inventorylocationsAssign(value: any): Observable<any> {
        return this.http.put(api_list.Inventory.inventorylocationsAssign, value);
    }
    getInventoryNotes(value: any, Id: any): Observable<any> {
        return this.http.post(api_list.Inventory.inventorynotes + '/' + Id, value);
    }
    addInventoryNote(queryParams: any): Observable<any> {
        return this.http.post(api_list.Inventory.addInventoryNote, queryParams);
    }
    getChildinventories(value: any, Id: any): Observable<any> {
        return this.http.post(api_list.Inventory.childinventories + '/' + Id, value);
    }
    getInventoryAssociated(value: any, Id: any): Observable<any> {
        return this.http.post(api_list.Inventory.associatedInventory + '/' + Id, value);
    }
    inventoryAssociatedAssign(data: any): Observable<any> {
        return this.http.put(api_list.Inventory.inventoryassociatedAssign, data);
    }
    getChildinventoriesDetails(Id: any): Observable<any> {
        return this.http.get(api_list.Inventory.getchildInventoriesDetail + '/' + Id + '/details');
    }
    makeIndividual(Id: any, value: any): Observable<any> {
        return this.http.put(api_list.Inventory.makeIndividual + '/' + Id, value);
    }
    updateParent(Id: any, value: any): Observable<any> {
        return this.http.put(api_list.Inventory.updateParent + '/' + Id, value);
    }
    inventorynotesStatus(value: any): Observable<any> {
        return this.http.put(api_list.Inventory.inventorynotesStatus, value);
    }
    inventoryattributesAssign(value: any): Observable<any> {
        return this.http.put(api_list.Inventory.inventoryattributesAssign, value);
    }
    vendorProductType(Id: any): Observable<any> {
        return this.http.get(this.urlTools.addDynamicURL(api_list.vendorproductType, { Id: Id }));
    }
    getServicetypeattributes(Id: any): Observable<any> {
        return this.http.get(this.urlTools.addDynamicURL(api_list.Inventory.getServicetypeattributes, { Id: Id }));
    }
    makeChild(Id: any, value: any): Observable<any> {
        return this.http.put(api_list.Inventory.makeChild + '/' + Id, value);
    }
    downloadInventoryNote(Id: any): Observable<any> {
        return this.http.get(this.urlTools.addDynamicURL(api_list.Inventory.downloadinventoryNote, { Id: Id }), { responseType: 'blob' });
    }
    inventorylocationsPrimary(Id: any, LId: any): Observable<any> {
        return this.http.put(this.urlTools.addDynamicURL(api_list.Inventory.inventorylocationsPrimary,
            { Id: Id, LId: LId }), {});
    }
    saveChildInventory(value: any, Id: any): Observable<any> {
        return this.http.put(api_list.Inventory.saveChildinventories + '/' + Id, value);
    }
    vendorProductTypeDetail(Id: any): Observable<any> {
        return this.http.get(this.urlTools.addDynamicURL(api_list.vendorproductTypeDetail, { Id: Id }));
    }

    getInvoiceSummryBillingMobility(data: any) {
        return this.http.post(api_list.Inventory.getInvoiceSummryBillingMobilityUrl, data);
    }

    getInvoiceSummryBillingNew(data: any) {
        return this.http.post(api_list.Inventory.getInvoiceSummryBillingNew, data);
    }
    getSandboxSummryBillingNew(data: any) {
        return this.http.post(api_list.SandBox.step_7.InvoiceServiceSummaryNew, data);
    }
    getInvoiceSummryBillingNewExport(data: any) {
        return this.http.post(api_list.Inventory.getInvoiceSummryBillingNew, data, { responseType: 'blob' });
    }
    getSandboxSummryBillingNewExport(data: any) {
        return this.http.post(api_list.SandBox.step_7.InvoiceServiceSummaryNew, data, { responseType: 'blob' });
    }
    getInvoiceSummryBillingMobilityExport(data: any): Observable<any> {
        return this.http.post(api_list.Inventory.getInvoiceSummryBillingMobilityUrl, data, { responseType: 'blob' });
    }

    getCostCenterStructure(data: any) {
        return this.http.post(api_list.Inventory.getCostCenterStructureUrl, data);
    }
    getChildinventoriesData(Id: any) {
        return this.http.get(this.urlTools.addDynamicURL(api_list.Inventory.childinventoriesData, { Id: Id }));
    }
}