import { Component, OnInit, TemplateRef } from '@angular/core';
import { ICellRendererParams } from 'ag-grid-community';
 

@Component({
    selector: 'custom-elements',
    template: `
    <ng-container
      *ngTemplateOutlet="template; context: templateContext"
    ></ng-container>
  `,
})
export class AttributeInputRender implements OnInit {
    template: TemplateRef<any>;
    templateContext: { $implicit: any, params: any };
    
    ngOnInit(): void {
    }
   
    refresh(params: any) {
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
