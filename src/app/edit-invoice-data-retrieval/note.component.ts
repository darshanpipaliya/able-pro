// Author: T4professor

import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-note-renderer',
  template: `
    <i class="fas fa-sticky-note " *ngIf="this.params.node.data.Notes" [ngClass]="{'disabled': !this.params.node.data.Notes }" style="color: #E38E02;" (click)="onClick($event)" ></i>
    `
})

export class NoteRendererComponent implements ICellRendererAngularComp {

  params: any;
  label: string;

  agInit(params: any): void {
    this.params = params;
  }

  refresh(params?: any): boolean {
    return true;
  }

  onClick($event: any) {

    // if (this.params.onClick instanceof Function) {
      // put anything into params u want pass into parents component
      const params = {
        event: $event,
        rowData: this.params.node.data
        // ...something
      }
      this.params.onClick(params);

    // }
  }
}