import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ICellRendererParams } from 'ag-grid-community';
import { MatDialog } from '@angular/material/dialog';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'rule-action-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgbTooltipModule],
  template: `
      <ng-container >
            <div class="actionicons-template">
                <span class="verified-button">
                    <span class="inbtn " container="body" tooltipClass="tooltip-bg" [ngbTooltip]="'Edit Distribution Rule'"  style="left: 60px;" (click)="clickToPrevoiusTab()" ><i class="fas fa-edit"></i></span>
                </span>
            </div>
      </ng-container>
  `,
})


export class SubActionButtonRender implements OnInit {
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
    this.params.onClick(true);
  }
  
}
