import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ActionPopupComponent } from '../action-popup/action-popup.component';
import _ from 'lodash';
import { SandBoxService } from 'src/app/services/sandbox.service';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { AgGridTableComponent } from 'src/app/common/ag-grid-table/ag-grid-table.component';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-distribution-rule-main-grid',
  templateUrl: './distribution-rule-main-grid.component.html',
  styleUrls: ['./distribution-rule-main-grid.component.scss'],
  imports: [SharedModule, PrimgModule, AgGridTableComponent, NgbTooltipModule]
})
export class DistributionRuleMainGridComponent implements OnInit {

  private _unsubscribeBillDetail: Subject<any> = new Subject<any>();
  private _postUnsubscribeBillDetail: Subject<any> = new Subject<any>();
  @Input() overviewData: any;
  @Output() overviewDataOP: EventEmitter<any> = new EventEmitter<any>();
  @Output() clickOnSaved: EventEmitter<any> = new EventEmitter<any>();
  @Output() refreshOverview: EventEmitter<any> = new EventEmitter<any>();
  statusList: any;

  rowData: any = [];
  totalRecords = 0;
  loadingPaybleAccTable: boolean = false;
  @Input() sandBoxGridRowData: any;
  public columnDefs;
  defaultColDef = {
    editable: true,
    sortable: true,
    minWidth: 100,
    filter: true,
    resizable: true,
    floatingFilter: true,
    flex: 1,
  };

  sideBar = {
    toolPanels: ['columns', 'filters']
  };
  showNext: any;

  constructor(private sandboxService: SandBoxService, public dialog: MatDialog) {
    this.columnDefs = [
      {
        headerName: 'Status',
        children: [
          {
            field: 'DistributionStatus',
            headerName: 'Distribution Status',
            editable: false,
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 200,
          }
        ],
      },
      {
        headerName: 'Distribution Details',
        children: [
          {
            field: 'TotalCharge',
            headerName: 'Distribution Total',
            resizable: true,
            editable: false,
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            minWidth: 200,
            cellStyle: {display: 'flex !important', 'justify-content': 'end','padding-right':'50px'},
            valueFormatter: (params: any) => this.currencyFormatter(params.data.TotalCharge, this.overviewData.CurrencySymbol)
          },
          {
            field: 'CountChargeCode',
            headerName: 'Count of Charge Codes',
            resizable: true,
            editable: false,
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            minWidth: 220,
          },
          // {
          //   field: 'Avg Distribution Per',
          //   headerName: 'Avg Distribution Per',
          //   resizable: true,
          //   editable: false,
          //   columnGroupShow: 'close',
          //   filter: 'agTextColumnFilter',
          //   minWidth: 200,
          // },
          {
            field: 'DistributionTotalCount',
            headerName: 'Distribution Count',
            resizable: true,
            editable: false,
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            minWidth: 200,
          },
          {
            field: 'DistributionEventId',
            headerName: 'Distribution Event',
            resizable: true,
            editable: false,
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            minWidth: 200,
          },
          // {
          //   field: 'Distribution Note',
          //   headerName: 'Distribution Note',
          //   resizable: true,
          //   editable: false,
          //   columnGroupShow: 'open',
          //   filter: 'agTextColumnFilter',
          //   minWidth: 200,
          // }
        ],
      },
      {
        headerName: 'Distribution Rules',
        children: [
          {
            field: 'DistrubationRule',
            headerName: 'Distribution Rule',
            resizable: true,
            editable: false,
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            minWidth: 200,
          },
          {
            field: 'DistributionOriginLevelType',
            headerName: 'Distribution Origin',
            resizable: true,
            editable: false,
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 200,
          },
          {
            field: 'DistributionMethodType',
            headerName: 'Distribution Method',
            resizable: true,
            editable: false,
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 200,
          },
          {
            field: 'Rule Option',
            headerName: 'Rule Option',
            resizable: true,
            editable: false,
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 200,
          },
          {
            field: 'DistributionRuleType',
            headerName: 'Rule Type',
            resizable: true,
            editable: false,
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 200,
          },
          // {
          //   field: 'Correction?',
          //   headerName: 'Correction?',
          //   resizable: true,
          //   editable: false,
          //   columnGroupShow: 'close',
          //   filter: 'agTextColumnFilter',
          //   minWidth: 200,
          // }
        ],
      },
      {
        headerName: 'Account',
        children: [
          {
            field: 'MainAccountNumber',
            headerName: 'Main Account',
            resizable: true,
            editable: false,
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            minWidth: 200,
          },
          {
            field: 'SubAccountNumber',
            headerName: 'Sub Account',
            resizable: true,
            editable: false,
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 200,
          },
          // {
          //   field: 'Billing ID',
          //   headerName: 'Billing ID',
          //   resizable: true,
          //   editable: false,
          //   columnGroupShow: 'close',
          //   filter: 'agTextColumnFilter',
          //   minWidth: 200,
          // }
        ]
      },
      {
        headerName: 'Charge Code',
        children: [
          {
            field: 'ChargeCodeName',
            headerName: 'Charge Code Name',
            resizable: true,
            editable: false,
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            minWidth: 200,
          },
          {
            field: 'ChargeCode',
            headerName: 'Charge Code',
            resizable: true,
            editable: false,
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 200,
          },
          {
            field: 'ChargeCodeTypeName',
            headerName: 'Charge Code Type',
            resizable: true,
            editable: false,
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 200,
          },
          {
            field: 'ChargeLocationType',
            headerName: 'Charge Location',
            resizable: true,
            editable: false,
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 200,
          }
        ]
      },
    ]
  }

  refresh(click?: any) {
    this.recallAPi(click);
    

  }

  ngOnInit(): void {
    this.recallAPi();
    this.getStatus();
    // this.overviewData.Differences == 0 ? this.showNext = true : this.showNext = false;
  }



  getStatus() {
    this.sandboxService.statusList().subscribe((res: any) => {
      this.statusList = res.Data.$values;
    })
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes['overviewData']?.currentValue) {
      changes['overviewData'].currentValue.Differences == 0 ? this.showNext = true : this.showNext = false;
    }
  }

  recallAPi(click?: any) {
    this.getDistibutionRulesData();
    if (click) {
      this.refreshOverview.emit(true);
    }
    if (this.sandBoxGridRowData.Step5VendorProductAssignment && !this.sandBoxGridRowData.Step6Distribution) {
      this.postDistibutionRulesData();
    }
  }

  ngOnDestroy() {
    this._unsubscribeBillDetail.next(null);
    this._unsubscribeBillDetail.complete();
    this._postUnsubscribeBillDetail.next(null);
    this._postUnsubscribeBillDetail.complete();
  }

  getDistibutionRulesData() {
    const dialogRef = this.dialog.open(ActionPopupComponent, { width: '400px', disableClose: true , data: {text : 'Sit tight while we run Distributions' }  });
    dialogRef['disableClose'] = true;
    this._unsubscribeBillDetail.next(null);
    this.sandboxService.getDistributionRules(this.sandBoxGridRowData.SBInvoiceId).pipe(takeUntil(this._unsubscribeBillDetail))
      .subscribe((data: any) => {
        if (data.Success) {
          this.rowData = data.Data.$values;
          let data1 = _.map(this.rowData, (x: any) => x.DistributionStatus);
          let isCompleted = _.every(data1, (x: any) => x == 'Completed')
          if (isCompleted == true) {
            this.showNext = true;
          }
          setTimeout(() => {
            dialogRef.close();
            dialogRef['disableClose'] = false;
            this.sandboxService.getInvoiceOverview(this.sandBoxGridRowData.SBInvoiceId).subscribe((data: any) => {
              let overviewInfo = data.Data;
              if (overviewInfo.Differences !== 0 && overviewInfo.SandboxStatusDisplayText !== 'Data Issue') {
                let errorData: any = {
                  messgeType: "error",
                  title: "Attention",
                  titleClass: "text-c-blue",
                  icon: "fas fa-exclamation-circle",
                  iconClass: "text-c-blue f-70",
                  okBtnName: 'Data Issue',
                  message: "The Amount to Pay is out of balance with the Detail Charges after Distribution. This is now a Data Issue please engage Dev assistance."
                }
                const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
                dialogRef.afterClosed().subscribe(result => {
                  if (result == true) {
                    let passid;
                    passid = _.find(this.statusList, (x: any) => x.DisplayText == 'Working').Id;
                    this.sandboxService.sandboxStatus(this.sandBoxGridRowData.SBInvoiceId, passid).subscribe((res: any) => {
                      if (res.Success) {
                        this.dialog.closeAll();
                      }
                    })
                  }
                });
              }
            });
          }, 0)
        } else {
          setTimeout(() => {
            dialogRef.close();
            dialogRef['disableClose'] = false;
          }, 0)
        }
      }, error => {
        setTimeout(() => {
          dialogRef.close();
          dialogRef['disableClose'] = false;
        }, 0)
      })
  }

  postDistibutionRulesData() {
    // this._postUnsubscribeBillDetail.next();
    // this.sandboxService.postDistributionRules(this.sandBoxGridRowData.SBInvoiceId).pipe(takeUntil(this._postUnsubscribeBillDetail))
    //   .subscribe();
  }

  next() {
    this.sandboxService.getInvoiceOverview(this.sandBoxGridRowData.SBInvoiceId).subscribe((dataa: any) => {
      if (dataa?.Data && dataa.Data.InvoiceProcessingStepsData.ChargeDistribution) {
        if (dataa.Data.AmountToPay === dataa.Data.ChargeDetailTotal) {
          dataa.Data.InvoiceProcessingStepsData.ChargeDistribution = true;
          dataa.Data.InvoiceProcessingStepsData.FinalReview = false;
          this.overviewDataOP.emit(dataa.Data);
          this.clickOnSaved.emit(true);
        }
      }
    });
  }

  currencyFormatter(currency: any, sign: any) {
     if (currency !== null && currency !== undefined) {
      const formatted = currency.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      return sign + formatted;
    }
  }
  
}
