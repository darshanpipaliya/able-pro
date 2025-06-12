import { ICellRendererParams } from '@ag-grid-community/core';
import { Component, OnInit, TemplateRef } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-comman-html-renderer',
  template: `
    <ng-container
      *ngTemplateOutlet="template; context: templateContext"
    ></ng-container>
  `,
  standalone: true,
  imports: [CommonModule]
})
export class CommanHtmlRendererComponent implements ICellRendererAngularComp {

  template: TemplateRef<any>;
  templateContext: { $implicit: any, params: any };

  refresh(params: any): boolean {
    this.templateContext = {
      $implicit: params.data,
      params: params
    };
    return true;
  }

  agInit(params: any): void {
    this.template = params['ngTemplate'];
    this.refresh(params);
  }
}
