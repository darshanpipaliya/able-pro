import { Injectable } from '@angular/core';
import { api_list } from './api-list';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UrlToolsService } from './url-tools.service';


@Injectable()
export class RetrievalService {
    baseUrl = environment.base_url;
    constructor(private http: HttpClient, private urlTools: UrlToolsService) { }

    getRetrievalSource(): Observable<any>  {
        return this.http.get(api_list.Invoice_retrieval.dataRetrievalSource);
    }

    getRetrievalMethods(): Observable<any>  {
        return this.http.get(api_list.Invoice_retrieval.dataRetrievalMethods);
    }

    getProcessingMethods(): Observable<any>  {
        return this.http.get(api_list.Invoice_retrieval.dataRetrievalProcessingMethods);
    }

    getTemplateType(): Observable<any>  {
        return this.http.get(api_list.Invoice_retrieval.dataRetrievalTemplateType);
    }

    getinvoiceRetrievalMethods(): Observable<any>  {
        return this.http.get(api_list.Invoice_retrieval.invoiceRetrievalMethods);
    }

    saveInvoiceAndDataRetrieval(Id: any, data: any): Observable<any>  {
        return this.http.put(this.urlTools.addDynamicURL(api_list.Invoice_retrieval.InvoiceAndDataRetrieval, {Id: Id}), data);
    }

    invoiceAndDataRetrievalUpload(data: any): Observable<any> {
        return this.http.post(api_list.Invoice_retrieval.InvoiceAndDataRetrievalUpload, data);
    }
}
