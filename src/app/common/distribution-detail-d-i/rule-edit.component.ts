import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ICellRendererParams } from 'ag-grid-community';
import { MatDialog } from '@angular/material/dialog';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'rule-edit-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [SharedModule, NgbTooltipModule],
  template: `
      <ng-container >
            <div class="actionicons-template">
                <span class="verified-button">
                    <span class="inbtn " container="body" tooltipClass="tooltip-bg" [ngbTooltip]="'Edit Distribution Rule'"  style="left: 60px; cursor: pointer;" (click)="clickToPrevoiusTab()" ><i class="fas fa-edit"></i></span>
                </span>
            </div>
      </ng-container>
  `,
})


export class RuleEditComponent implements OnInit {
  params: any;

  constructor(public dialog: MatDialog) {
  }
  ngOnInit(): void {
  }
  public cellValue!: string;

  agInit(params: ICellRendererParams): void {
    this.params = params;
  }
  clickToPrevoiusTab() {
    const params = {
        redirect: true,
        type: 'distribution-rule-engine',
        data: this.params.data
      }
    this.params.onClick(params);
  }
  
}
