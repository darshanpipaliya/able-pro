import { Component, OnInit } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'app-dropdown-cell-renderer',
  template: `
    <p-dropdown [options]="options" appendTo="body" placeholder="{{options.length >= 0 ? 'Select a User' : 'Please Wait...'}} " optionValue="id" optionLabel="name" filterBy="name"  [filter]="true" (onChange)="onValueChange($event)"></p-dropdown>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }
    `,

  ],
})
export class DropdownCellRendererComponent2 implements OnInit, ICellRendererAngularComp {
  options: any[];
  selectedValue: any;
  params: any;

  constructor() {}

  ngOnInit() {
    
  }

  agInit(params: ICellRendererParams): void {

    this.options = params.colDef.filterParams.values;
    this.params = params;

    // this.selectedValue = params.value;
  }

  refresh(params: ICellRendererParams): boolean {
    return false;
  }

  onValueChange(data: any) {
    const params = {
        userId: data.value,
        VendorProductInventoryId: this.params.data.VendorProductInventoryId
      }
      this.params.onClick(params);
  }
}
