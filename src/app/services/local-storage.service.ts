import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor() { }

  setObjectValue(key : string, value : any) {
    let objValue =  this.checkIsNullString(value) ? (typeof(value) === 'number' ? value + '' : value) : null;
    objValue = JSON.stringify(objValue);
    localStorage.setItem(key, objValue);
  }

  getObjectValue(key: string) {
     const value = localStorage.getItem(key);
     return value ? JSON.parse(value) : null;
  } 

  removeItem(key: string) {
    localStorage.removeItem(key);
  }

  clearSessionObjects() {
    localStorage.clear();
  }

  checkIsNullString(value: null | undefined) {
    if (null != value && undefined != value) {
      return true;
    } else {
      return false;
    }
  }
}
