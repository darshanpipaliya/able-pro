import { Injectable } from '@angular/core';
import { api_list } from './api-list';
import { HttpClient } from '@angular/common/http';
import { UrlToolsService } from './url-tools.service';

@Injectable()
export class DistributionService {

    constructor(private http: HttpClient, private urlTools: UrlToolsService) {
    }

    getDistributionRules(data: any) {
        return this.http.post(this.urlTools.addDynamicURL(api_list.distribution.getDistributionRules), data);
    }
    distributionDetail(Id: any) {
        return this.http.get(this.urlTools.addDynamicURL(api_list.distribution.distributionDetail, {Id: Id}));
    }
    saveDistribution(data: any) {
        return this.http.put(this.urlTools.addDynamicURL(api_list.distribution.distributionStatus), data);
    }
}
