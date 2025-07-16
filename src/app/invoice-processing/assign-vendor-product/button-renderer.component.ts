// Author: T4professor

import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-button-renderer',
  template: `
    <i class="fa fa-trash text-danger" (click)="onClick($event)"></i>
    
    `
})

export class ButtonRendererComponent implements ICellRendererAngularComp {

  params: any;
  label: string;

  agInit(params: any): void {
    this.params = params;
  }

  refresh(params?: any): boolean {
    return true;
  }

  onClick($event: any) {
      const params = {
        event: $event,
        rowData: this.params.node.data
      }
      this.params.onClick(params);
  }
}