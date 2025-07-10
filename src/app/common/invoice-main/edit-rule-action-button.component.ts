import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ICellRendererParams } from 'ag-grid-community';
import { MatDialog } from '@angular/material/dialog';
import { SharedModule } from 'src/app/demo/shared/shared.module';

@Component({
    selector: 'event-rule-action-button',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [SharedModule],
    template: `
      <ng-container >
            <div class="">
                <span class="verified-button">
                    <span class="inbtn " *ngIf="params.data.DistributionStatusDisplay == 'Needs Rule'"
                    (click)="actionClick('distribution-rule-engine')"  style="left: 60px; cursor: pointer;"><i container="body" tooltipClass="tooltip-bg"  class="fas fa-edit" [ngbTooltip]="this.params.data.DistributionRuleId == null ? 'Add' : 'Edit'"></i>
                    </span>
                 </span>
            </div>
      </ng-container>
  `,
})


export class EditRuleActionButtonRender implements OnInit {
    params: any;
    constructor(public dialog: MatDialog) {
    }
    ngOnInit(): void {
    }

    agInit(params: ICellRendererParams): void {
        this.params = params;
    }

    actionClick(value: any) {
        const params = {
            redirect: true,
            type: value,
            data: this.params.data
        }
        this.params.onClick(params);
    }
}
