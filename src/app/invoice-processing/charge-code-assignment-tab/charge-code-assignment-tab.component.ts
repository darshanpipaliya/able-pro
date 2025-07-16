import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { InvoiceOverviewComponent } from '../invoice-overview/invoice-overview.component';
import { ChangeCodesComponent } from '../change-codes/change-codes.component';
import { ChargeCodeAssignment1Component } from '../charge-code-assignment1/charge-code-assignment1.component';
import { ChargeCodeAssignment2Component } from '../charge-code-assignment2/charge-code-assignment2.component';

@Component({
  selector: 'app-charge-code-assignment-tab',
  templateUrl: './charge-code-assignment-tab.component.html',
  styleUrls: ['./charge-code-assignment-tab.component.scss'],
  imports: [SharedModule, PrimgModule, InvoiceOverviewComponent, ChangeCodesComponent, ChargeCodeAssignment1Component, ChargeCodeAssignment2Component]
})
export class ChargeCodeAssignmentTabComponent implements OnInit {

  @Input() selectedTab: any;
  @Input() sandBoxGridRowData: any;
  @Input() recordPublishedOrCompleted: any;
  @Output() invoiceOverviewDataOP: EventEmitter<any> = new EventEmitter<any>();
  @Output() redirectNext: EventEmitter<any> = new EventEmitter<any>();

  index = 0;
  sbChargeDetailId: any;
  SBChargeDetailIdsForCC: any;
  step3mainData: any;
  overviewData: any;
  isRefreshClick = false;
  refreshGrid: boolean = false;
  
  constructor(public dialog: MatDialog) { }

  ngOnInit(): void {
  }

  changedTab(index: any) {
    this.index = index;
  }
  redirectTab(data: any) {
    if (data.multiCheckBox && data.rowData.length > 1) {
    //   const hasAccountLevel = data.rowData.some(item => item.ChargeLocationType === "Account Level");
    //   const hasServiceLevel = data.rowData.some(item => item.ChargeLocationType === "Service Level");

    // if (hasAccountLevel && hasServiceLevel) {
    //   let errorData: any = {
    //       messgeType: "error",
    //       title: "Attention",
    //       titleClass: "text-c-blue",
    //       icon: "fas fa-exclamation-circle",
    //       iconClass: "text-c-blue f-70",
    //       message: 'Account Level and Service Level Charge Codes cannot be assigned simultaneously. We will proceed with Account Level Charge Codes first, and you can assign Service Level Charge Codes afterward.'
    //     }
    //     const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
    //     dialogRef.afterClosed().subscribe((result) => {
    //       if (!isValuesUndefined(result)) {
    //         data.rowData = data.rowData.filter(item => item.ChargeLocationType === "Account Level"); 
    //         if(data.rowData.length == 1) {
    //           this.sbChargeDetailId = data.rowData[0].SBChargeDetailId;
    //           this.step3mainData = data.rowData[0];
    //           this.index = data.index;

    //         } else {
              this.SBChargeDetailIdsForCC = data.rowData.map((k: any) =>  k['SBChargeDetailIdForCC']);
              this.step3mainData = data.rowData;
              this.index = data.index;
            // }
          // }
        // })
      // } else {
      //   this.step3mainData = data.rowData;
      //   this.index = data.index;
      //   this.SBChargeDetailIdsForCC = data.rowData.map(k =>  k['SBChargeDetailIdForCC']);
      // }
    } else {
      if (data.rowData.length === 1) {
        this.sbChargeDetailId = data.rowData[0].SBChargeDetailId;
        this.step3mainData = data.rowData[0];
        this.index = data.index;
      } else {
        this.sbChargeDetailId = data.rowData.SBChargeDetailId;
        this.step3mainData = data.rowData;
        this.index = data.index;
      }
    }
    // setTimeout(() => {
    //   this.index = data.index;
    // }, 50);
  }


  reloadGrid(event: any) {
    this.refreshGrid = event;
  }
  invoiceOverviewDataOutput($event: any) {
    this.overviewData = $event;
    this.invoiceOverviewDataOP.emit($event);
  }

  onSaveRedirect(e: any) {
    this.index = 0;

  }

  redirectNexts(e: any) {
    this.redirectNext.emit(e)
  }

  // refreshClick() {
  //   this.isRefreshClick = true;
  // }

  refreshClickEmit($event: any){
    this.isRefreshClick = true;
  }
  resetRefreshValue($event: any) {
    this.isRefreshClick = $event;
  }
}
