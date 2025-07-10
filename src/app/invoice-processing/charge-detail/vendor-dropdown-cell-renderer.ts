import { Component, OnInit } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import _ from 'lodash';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SharedModule } from 'src/app/demo/shared/shared.module';

@Component({
    selector: 'vendor-dropdown-cell-renderer',
    imports: [SharedModule, PrimgModule],
    template: `
    <ng-container>
    <p-dropdown [disabled]="params.disabled" [options]="options" appendTo="body" [placeholder]="params?.data?.VendorAccountId ? 'Loading...' : 'Select a vendor' " 
     optionValue="Id" 
    optionLabel="AccountName" [(ngModel)]="params.data.VendorAccountId"
    filterBy="AccountName"  [filter]="true" (onChange)="onValueChange($event)"></p-dropdown>
    </ng-container>
  `,
    // styles: [
    //     `
    //   :host {
    //     display: block;
    //     width: 100%;
    //   }
    // `,
    // ],
})
export class VendorDropdownCellRenderer implements OnInit, ICellRendererAngularComp {
    options: any[];
    selectedValue: any;
    params: any;
    disabled: boolean;

    constructor() { }

    ngOnInit() {
    }

    agInit(params: any): void {
        this.options = params.colDef.filterParams.values;
        this.params = params;
    }

    refresh(params: ICellRendererParams): boolean {
        return false;
    }

    onValueChange(data: any) {
        const params = {
            vendorAccountId: data.value,
            index: this.params.data.index,
            params:this.params.data
        }
        this.params.onClick(params);
    }
}
