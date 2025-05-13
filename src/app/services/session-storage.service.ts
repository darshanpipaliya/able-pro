import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SessionStorageService {

  constructor() { }


  setObjectValue(key : string, value : any) {
    let objValue =  this.checkIsNullString(value) ? (typeof(value) === 'number' ? value + '' : value) : null;
    objValue = JSON.stringify(objValue);
    sessionStorage.setItem(key, objValue);
  }

  getObjectValue(key: string) {
     const value = sessionStorage.getItem(key);
     return value ? JSON.parse(value) : null;
  }

  removeItem(key: string) {
    sessionStorage.removeItem(key);
  }

  clearSessionObjects() {
    sessionStorage.clear();
  }

  checkIsNullString(value: null | undefined) {
    if (null != value && undefined != value) {
      return true;
    } else {
      return false;
    }
  }




}
