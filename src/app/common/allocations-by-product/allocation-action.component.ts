import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ICellRendererParams } from 'ag-grid-community';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'allocation-action-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
      <ng-container >
            <div class="actionicons-template">
                <span class="verified-button">
                    <span class="inbtn btn btn-icon btn-outline-warning" container="body" tooltipClass="tooltip-bg" title="Edit" style="cursor: pointer; width: 19px; height: 19px; font-size: 10px;" (click)="redirectEngine()" ><i class="fas fa-edit"></i></span>
                </span>
            </div>
      </ng-container>
  `,
  // styles:   [
  // `
  //  .fa-edit {
  //       color: #4680ff;
  //   }
  // `]
})

export class AllocationActionButtonRender implements OnInit {
  params: any;

  constructor(public dialog: MatDialog) {
  }
  ngOnInit(): void {
  }
  public cellValue!: string;

  agInit(params: ICellRendererParams): void {
    this.params = params;
  }
  redirectEngine() {
    const params = {
      type: 'engine',
      rowData: this.params.data
    }
    this.params.onClick(params);
  }
  
}
