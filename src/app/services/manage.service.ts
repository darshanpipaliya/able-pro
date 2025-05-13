import { Injectable } from '@angular/core';
import { CustomPipe } from '../custom-pipe/date.pipe';

@Injectable({
  providedIn: 'root'
})
export class ManageService {
  constructor(private customPipe: CustomPipe) {}


  // convertDate(dateStr: any, inputType='text') {
  //   return this.customPipe.transform(dateStr, inputType );
    convertDate(dateStr: any, inputType='text', regex = '-') {
      return this.customPipe.transform(dateStr, inputType, regex );
  }
}
