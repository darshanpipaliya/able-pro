import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
    selector: 'action-button',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
      <ng-container>
        <div class="actionicons-template">
            <span class="verified-button">
                <span class="inbtn">
                    <input name="radio" type="radio" (click)="onClick($event)" [checked]="params?.data?.PrimaryChargeCode == true">
                </span>
            </span>
        </div>
      </ng-container>
  `,
})

export class RadioButtonRender implements OnInit {
    params: any;

    constructor() {
    }

    onClick(e: any) {
        const params = {
            event: e,
            rowData: this.params.node.data
        }
        this.params.onClick(params);
    }

    ngOnInit(): void {
    }
    public cellValue!: string;

    agInit(params: ICellRendererParams): void {
        this.params = params;
    }

    refresh(params: ICellRendererParams) {
        return true;
    }
}
