import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ICellRendererParams } from 'ag-grid-community';
import { MatDialog } from '@angular/material/dialog';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';

@Component({
  selector: 'rule-action-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
      <ng-container >
            <div class="actionicons-template">
                <span class="verified-button">
                    <span class="inbtn " *ngIf="this.params.data.IsDistributionRuleEditable && (this.params.data.DistributionStatusDisplay == 'Needs Rule' || this.params.data.DistributionStatusDisplay == 'Expired Rule')" container="body" tooltipClass="tooltip-bg" [ngbTooltip]="this.params.data.DistributionRuleId == null ? 'Add Distribution Rule' : 'Edit Distribution Rule'" (click)="editSandboxData()"  style="left: 60px;"><i class="fas fa-edit"></i></span>
                  <span *ngIf="this.params.data.SpecificDistributionNeeded" (click)="deleteRule()" container="body" tooltipClass="tooltip-bg" [ngbTooltip]="'Remove from Distribution'"> <i class="fas fa-trash ml-1"></i></span>
                  </span>
            </div>
      </ng-container>
  `,
  imports: [SharedModule, PrimgModule]
})


export class RuleActionButtonRender implements OnInit {
  params: any;
  constructor(public dialog: MatDialog) {
  }
  ngOnInit(): void {
  }
  public cellValue!: string;

  agInit(params: ICellRendererParams): void {
    this.params = params;
  }

  deleteRule() {
    const params = {
      type: 'delete',
      data: this.params.data
    };
    this.params.onClick(params);
  }

  editSandboxData() {
    if (this.params.data.DistributionRuleId == null) {
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
