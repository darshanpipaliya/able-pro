import { DatePipe } from '@angular/common';
import { Injectable, Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'customDate',
    pure: true

})
@Injectable({
    providedIn: 'root'
})

export class CustomPipe implements PipeTransform {

    constructor(private dp: DatePipe) {
    }

    transform(value: any, type?:any, regex?:any) {

        let dateFormat = value.replaceAll("/","-");
        let date = new Date(dateFormat)
        let d = date.getDate();
        let m = date.getMonth()+1;
        let y = (date.getFullYear());
        
         if (isNaN(d)) {
            d = new Date(value.split('T')[0]).getDate();
        }

        if (isNaN(m)) {
            m = new Date(value.split('T')[0]).getMonth()+1;
        }

        if (isNaN(y)) {
            y = new Date(value.split('T')[0]).getFullYear();
        }

        if (isNaN(d)) {
            d = value.split('T')[0].split('-')[1];
        }

        if (isNaN(m)) {
            m = value.split('T')[0].split('-')[0];
        }

        if (isNaN(y)) {
            y = value.split('T')[0].split('-')[2];
        }
        if (type === 'datePicker') {
            return y + '-' +  (m <= 9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d) ;
        } else if (type === 'saveDatePicker') {
            return y + '-' + (m <= 9 ? '0' + m : m)  + '-' + (d <= 9 ? '0' + d : d);
        } else if(type === 'inputText'){
            return y + '-' + (m <= 9 ? '0' + m : m)  + '-' + (d <= 9 ? '0' + d : d);
        } else {
            return (m <= 9 ? '0' + m : m) + regex + (d <= 9 ? '0' + d : d) + regex + y;
        }

    }

}