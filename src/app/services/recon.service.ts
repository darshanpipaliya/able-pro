import { Injectable } from '@angular/core';
import { api_list } from './api-list';
import { HttpClient } from '@angular/common/http';
import { UrlToolsService } from './url-tools.service';
import { environment } from 'src/environments/environment';

@Injectable()
export class ReconService {
    baseUrl = environment.base_url;
    constructor(private http: HttpClient, private urlTools: UrlToolsService) { }

    getReconGrid(data: any) {
        return this.http.post(this.urlTools.addDynamicURL(api_list.Recon.reconLoggedInUser), data);
    }

    getReconLocation(data: any) {
        return this.http.post(this.urlTools.addDynamicURL(api_list.Recon.reconLocation), data);
    }

    setReconLocationPrimary(data: any) {
        return this.http.put(this.urlTools.addDynamicURL(api_list.Recon.reconLocationPrimary), data);
    }
    
    
    getReconPeople(data: any) {
        return this.http.post(this.urlTools.addDynamicURL(api_list.Recon.reconPeoples), data);
    }

    savePeoplePrimary(data: any){
        return this.http.put(this.urlTools.addDynamicURL(api_list.Recon.reconPeoplesPrimary), data);
    }

    getReconSummary(data: any) {
        return this.http.post(this.urlTools.addDynamicURL(api_list.Recon.reconSummary), data);
    }

    getInvoiceOverview(InvoiceId: any){
        return this.http.get(this.urlTools.addDynamicURL(api_list.Recon.InvoiceOverviewUrl, {InvoiceId: InvoiceId}));
    }
}