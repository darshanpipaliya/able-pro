import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'customCurrency'
})
export class CustomCurrencyPipe implements PipeTransform {

    transform(value: any, appendStr: string) {
        if (value || value === 0 ) {
            return appendStr + ' ' + value;
        } else {
            return '';
        }
    }

}
