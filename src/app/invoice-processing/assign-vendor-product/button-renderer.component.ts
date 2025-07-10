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

  params;
  label: string;

  agInit(params): void {
    this.params = params;
  }

  refresh(params?: any): boolean {
    return true;
  }

  onClick($event) {
      const params = {
        event: $event,
        rowData: this.params.node.data
      }
      this.params.onClick(params);
  }
}