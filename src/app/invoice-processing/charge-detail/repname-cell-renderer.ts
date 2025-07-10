import { Component, OnInit } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import _ from 'lodash';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SharedModule } from 'src/app/demo/shared/shared.module';

@Component({
    selector: 'repname-cell-renderer',
    imports: [SharedModule, PrimgModule],
    template: `
    <ng-container>
        <p-dropdown [options]="options" appendTo="body" [placeholder]="params?.data?.RepUserId ? 'Loading...' : 'Select a Rep Name' " 
        optionValue="UserId" optionLabel="FullName" [(ngModel)]="params.data.RepUserId"
        filterBy="FullName"  [filter]="true" (onChange)="onValueChange($event)">
        <ng-template let-country pTemplate="item">
            <div class="flex align-items-center gap-2">
                <div>{{ country.FullName }} ({{country.Logon}})</div>
            </div>
        </ng-template>
    </p-dropdown> 
    </ng-container>
  `,
})
export class RepnameCellRenderer implements OnInit, ICellRendererAngularComp {
    options: any[];
    params: any;

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
            RepUserId: data.value,
            params:this.params.data
        }
        this.params.onClick(params);
    }
}
