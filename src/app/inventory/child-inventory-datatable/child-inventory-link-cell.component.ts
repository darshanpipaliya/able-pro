import { Component, OnInit } from '@angular/core';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'app-child-inventory-link',
  template: `
    <ng-container *ngIf="params.value !== params.rowData.ServiceNumber; else showServiceNumber">
      <a href="javascript:void(0);" style="text-decoration: underline" (click)='onLinkClick()'>{{params.value}}</a>
    </ng-container>
    <ng-template #showServiceNumber>
      <span>{{ params.value }}</span>
    </ng-template>
 `
})
export class ChildInventoryLinkCellComponent implements OnInit {
  params: any;

  constructor() { }

  ngOnInit() {
  }

  agInit(params: ICellRendererParams): void {
    this.params = params;
  }

  onLinkClick() {
    if (this.params.onClick) {
      this.params.onClick(this.params);
    }
  }
}
