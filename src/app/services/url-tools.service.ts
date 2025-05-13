import { HttpParams } from '@angular/common/http';
import {Injectable} from '@angular/core';
@Injectable({
    providedIn: 'root'
})
export class UrlToolsService {

    constructor() {
    }

    addDynamicURL(url: string, stringParams?:any) {
        if (stringParams) {
            Object.keys(stringParams).forEach(key => {
                url = url.replace('{' + key + '}', stringParams[key]);
            });
        }
        return url;
    }

    addQueryParams(params? :any) {
        let searchParams = new HttpParams();
            Object.keys(params).forEach(key => {
            searchParams = searchParams.append(key, params[key]);
        });
        return {params : searchParams};
    }

}
