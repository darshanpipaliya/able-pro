import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ICellRendererParams } from 'ag-grid-community';
import { MatDialog } from '@angular/material/dialog';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';

@Component({
  selector: 'event-rule-action-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
      <ng-container >
            <div class="actionicons-template">
                <span class="verified-button">
                    <span class="inbtn " *ngIf="this.params.data.IsDistributionRuleEditable" (click)="editButtonClick()"  style="left: 60px; cursor: pointer;"><i class="fas fa-edit" container="body" tooltipClass="tooltip-bg"[ngbTooltip]="this.params.data.DistributionRuleId == null  ? 'Add' : 'Edit'" ></i></span>
                    <span class="inbtn " *ngIf="this.params.data.DistributionStatusDisplay == 'Completed'" (click)="viewDetail()" style="cursor: pointer;"><i class="fa fa-binoculars" container="body" tooltipClass="tooltip-bg" aria-hidden="true" [ngbTooltip]="'View Detail'"></i></span>
                </span>
            </div>
      </ng-container>
  `,
  imports: [SharedModule, PrimgModule]
})


export class EventRuleActionButtonRender implements OnInit {
  params: any;
  isShowAccept = false;
  disableViewInvoice: boolean = false;
  constructor(public dialog: MatDialog) {
  }
  ngOnInit(): void {
  }
  public cellValue!: string;

  agInit(params: ICellRendererParams): void {
    this.params = params;
  }

  viewDetail() {
    const params = {
        redirect: true,
        type: 'view',
        data: this.params.data
      }
    this.params.onClick(params);
  }

  editButtonClick() {
    if(this.params.data.DistributionRuleId == null) {
      const params = {
        redirect: true,
        type: 'add',
        data: this.params.data
      }
      this.params.onClick(params);
    } else {
      const params = {
        redirect: true,
        type: 'edit',
        data: this.params.data
      }
      this.params.onClick(params);
    }
  }
}
