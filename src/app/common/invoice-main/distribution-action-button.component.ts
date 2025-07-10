import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ICellRendererParams } from 'ag-grid-community';
import { MatDialog } from '@angular/material/dialog';
import { SharedModule } from 'src/app/demo/shared/shared.module';

@Component({
  selector: 'event-rule-action-button',
  imports: [SharedModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
      <ng-container >
            <div class="actionicons-template">
                <span class="verified-button">
                    <span class="inbtn " *ngIf="params.data.DistributionStatusDisplay == 'Completed' || params.data.DistributionStatusDisplay == 'Error'"  (click)="actionClick('distribution-rule-engine')"  style="left: 60px; cursor: pointer;"><i class="fas fa-edit" container="body" tooltipClass="tooltip-bg" [ngbTooltip]="'Edit'"></i></span>
              
                    <span class="inbtn " *ngIf="params.data.DistributionStatusDisplay !== 'Processing'" (click)="actionClick('distribution-detail')" ><i class="fa fa-binoculars" container="body" tooltipClass="tooltip-bg" aria-hidden="true" [ngbTooltip]="'View'" style="cursor: pointer;"></i></span>
                </span>
            </div>
      </ng-container>
  `,
})


export class DistributionActionButtonRender implements OnInit {
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
