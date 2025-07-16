import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { from, Subject } from 'rxjs';
import _ from 'lodash';
import { RuleActionButtonRender } from './rule-action-button.component';
import { MatDialog } from '@angular/material/dialog';
import { EventRuleActionButtonRender } from './event-rule-action-button.component';
import { SandBoxService } from 'src/app/services/sandbox.service';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { AgGridModule } from 'ag-grid-angular';
import { AgGridTableComponent } from 'src/app/common/ag-grid-table/ag-grid-table.component';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { ClientSideRowModelModule, ModuleRegistry, ServerSideRowModelModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([ServerSideRowModelModule, ClientSideRowModelModule]);

@Component({
  selector: 'app-cost-distribution-step4',
  templateUrl: './cost-distribution-step4.component.html',
  styleUrls: ['./cost-distribution-step4.component.scss'],
  imports: [SharedModule, PrimgModule, AgGridModule, AgGridTableComponent]
})
export class CostDistributionStep4Component implements OnInit {

  @Input() sandBoxGridRowData: any;
  @Input() clickedRefresh: any;
  @Output() onCellClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() switchTab: EventEmitter<any> = new EventEmitter<any>();
  @Output() callOverview: EventEmitter<any> = new EventEmitter<any>();

  
  @Input() fetchedData: any;
  @Input() fromTab: any;
  @Input() recordPublishedOrCompleted: any;
  @Input() overviewData: any;
  @Input() reloadGrid: boolean = false;
  hasAllDistribution: boolean = false;

  public sideBar;
  sbInvoiceId: any;
  columnDefsEvent: any;
  isShowNext = false;
  showSpinner = false;
  public columnDefs: any;
  rowData: any = [];
  rowDataEvent: any = [];
  rowSelection = 'multiple';
  defaultColDef = {
    editable: true,
    sortable: true,
    minWidth: 100,
    resizable: true,
    floatingFilter: true,
    flex: 1,
  };

  gridOptions = {
    rowSelection: 'multiple',
    suppressRowClickSelection: true,
    suppressRowDeselection: false,
    suppressRowTransform: true,
    isRowSelectable: (rowNode: any) => {
      return !rowNode.data?.SpecificDistributionNeeded && rowNode.data?.DistributionStatusDisplay !== 'Expired Rule';
    }
  }

  selectedCheckBoxData = [];
  totalUnassignedChargeCode: any = 0;
  private _unsubscribeChargeCode: Subject<any> = new Subject<any>();
  private _unsubscribeDistributionEvent: Subject<any> = new Subject<any>();
  frameworkComponents: any;
  dialogRef: any;
  @ViewChild('tooltipText') tooltipText!: TemplateRef<any>;
  @ViewChild('tooltipText1') tooltipText1!: TemplateRef<any>;

   hasSpecificDistribution: boolean = false;

  constructor(public dialog: MatDialog, private sandBoxService: SandBoxService) {
    this.sideBar = {
      toolPanels: ['columns', 'filters']
    };
  }

  ngOnInit(): void {
    this.setColumnDefs();
  }

  onBtnClick2(data: any) {
    if(data.type == 'edit') {
      this.onCellClicked.emit({ rowData: [data.data], index: 1 })
    } else {
      this.onCellClicked.emit({ rowData: [data.data], index: 2 })
    }
  }

  openDialog() {
    const dialogRef = this.dialog.open(this.tooltipText, {
      width: '900px'
    });
  }

  openDialog2() {
    this.dialog.open(this.tooltipText1, {
      width: '900px'
    });
  }

  recallAPi(click = false) {
    this.getDistibutionRulesData(click);
  }

  getDistibutionRulesData(click: any) {

    if (!this.reloadGrid) {
      let errorData: any = {
        messgeType: "error", 
        title: "Please wait",
        titleClass: "text-c-blue",
        icon: "fas fa-exclamation-circle",
        iconClass: "text-c-blue f-70",
        message: 'Sit tight while we run Distributions',
        hideOkbtn: true
      };
      this.dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
      setTimeout(() => {
        this.dialogRef['disableClose'] = true;
        this.dialogRef.close();
      }, 3000);
    }
    let data = {
      isReRunDistribution: true,
      IsFromChargeDistributionStep6: this.fromTab == 'true' ? true : false
    }
    if(click) {
      this.sandBoxService.applyDistribution(this.sandBoxGridRowData.SBInvoiceId, data).subscribe((data: any) => {
        if(data.Success) {
          this.getChargeCodeRules();
          this.getDistributionEvent();
        }
      });
    } else {
      this.getChargeCodeRules();
      this.getDistributionEvent();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.['clickedRefresh']?.currentValue == true) {
      this.recallAPi(true);
    }

    if (changes?.['fetchedData']?.currentValue == true || changes?.['reloadGrid']?.currentValue == true) {
      this.recallAPi();
    }

    if (changes && changes['overviewData'] && changes['overviewData']['currentValue'] && changes['overviewData']['currentValue'] !== changes['overviewData']['previousValue'] && changes['overviewData']['currentValue']) {
      this.overviewData = changes['overviewData']['currentValue'];
      this.isShowNext = this.fromTab == 'true' ?  this.overviewData.InvoiceProcessingStepsData.ChargeDistribution : this.overviewData.InvoiceProcessingStepsData.CostDistributionRules;
    }

    if (changes && changes['fromTab'] && changes['fromTab']['currentValue']) {
      this.setColumnDefs();
    }
  }

  setColumnDefs() {
    let distributionDetailsChildren: any = [
      {
        field: 'DistributionTotalCharge',
        headerName: 'Charge',
        columnGroupShow: 'close',
        filter: 'agNumberColumnFilter',
        editable: false,
        minWidth: 174,
        cellStyle: {display: 'flex !important', 'justify-content': 'end','padding-right':'50px'},
        valueFormatter(params: any) {
          if (params?.data?.DistributionTotalCharge != null) {
            const sansDec = Number(params.data.DistributionTotalCharge).toFixed(2);
            return (
              (params.data.CurrencySymbol || '') +
              sansDec.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            );
          }
          return '';
        }
      }
    ];

    if (this.fromTab === 'true') {
      distributionDetailsChildren.push({
        field: 'BillingId',
        headerName: 'Billing Id',
        columnGroupShow: 'close',
        filter: 'agTextColumnFilter',
        editable: false,
        minWidth: 150
      });
    }

    distributionDetailsChildren.push({
      field: 'Quantity',
      headerName: 'Quantity',
      filter: 'agNumberColumnFilter',
      columnGroupShow: 'close',
      editable: false,
      minWidth: 150
    });

    this.columnDefs = [
      {
        headerName: '',
        headerCheckboxSelection: true,
        // checkboxSelection: true,
        floatingFilter: true,
        suppressMenu: true,
        minWidth: 50,
        maxWidth: 50,
        width: 50,
        flex: 0,
        resizable: true,
        sortable: true,
        editable: false,
        filter: false,
        suppressColumnsToolPanel: true,
        headerCheckboxSelectionFilteredOnly: true,
        checkboxSelection: (params: any) => {
          return !params.data?.SpecificDistributionNeeded && params.data?.DistributionStatusDisplay !== 'Expired Rule';
        },
      },
      {
        headerName: 'Action',
        children: [
          {
            headerName: 'Action',
            filter: false,
            editable: false,
            width: 91,
            minWidth: 91,
            flex: 0,
            cellStyle: {
              'display': 'flex',
              'justify-content': 'center'
            },
            cellRenderer: RuleActionButtonRender,
            cellRendererParams: {
              onClick: this.onBtnClick1.bind(this)
            }
          }
        ]
      },
      {
        headerName: 'Status',
        children: [
          {
            field: 'DistributionStatusDisplay',
            headerName: 'Distribution Status',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 184
          }
        ]
      },
      {
        headerName: 'Distribution Details',
        children: distributionDetailsChildren
      },
      {
        headerName: 'Account',
        children: [
          {
            field: 'PayableAccountNumber',
            headerName: 'Payable Account',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'close',
            editable: false,
            minWidth: 172
          },
          {
            field: 'MainAccountNumber',
            headerName: 'Main Account',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 156
          },
          {
            field: 'SubAccountNumber',
            headerName: 'Sub Account',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 149
          }
        ],
      },
      {
        headerName: 'Charge Code',
        children: [
          {
            field: 'ChargeCodeName',
            headerName: 'Charge Code Name',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 189
          },
          {
            field: 'ChargeCode',
            headerName: 'Charge Code',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 150
          },
          {
            field: 'ChargeCodeType',
            headerName: 'Charge Code Type',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 182
          },
          {
            field: 'ChargeType',
            headerName: 'Charge Type',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 148
          },
          {
            field: 'ChargeLocationType',
            headerName: 'Charge Location',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 170
          }
        ],
      }
    ];
    this.columnDefsEvent = [
      {
        headerName: 'Action',
        children: [
          {
            headerName: 'Action',
            filter: false,
            editable: false,
            width: 91,
            minWidth: 91,
            flex: 0,
            cellStyle: {
              'display': 'flex',
              'justify-content': 'center'
            },
            cellRenderer: EventRuleActionButtonRender,
            cellRendererParams: {
              onClick: this.onBtnClick2.bind(this)
            }
            // cellRenderer: function () {
            //   return '<i class="fa fa-edit"></i> <i class="fa fa-binoculars" aria-hidden="true"></i>'
            // }
          }
        ]
      },
      {
        headerName: 'Status',
        children: [
          {
            field: 'DistributionStatus',
            headerName: 'Distribution Status',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 184
          },
        ],
      },
      {
        headerName: 'Distribution Details',
        children: [
          {
            field: 'DistributionEventId',
            headerName: 'Distribution Event',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 181
          }
        ],
      },
      {
        headerName: 'Charge Code',
        children: [
          {
            field: 'ChargeCodeName',
            headerName: 'Charge Code Name',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 189
          },
          {
            field: 'ChargeCode',
            headerName: 'Charge Code',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 150
          },
          {
            field: 'ChargeCodeType',
            headerName: 'Charge Code Type',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 182
          },
          {
            field: 'ChargeType',
            headerName: 'Charge Type',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 148
          },
          {
            field: 'ChargeLocationType',
            headerName: 'Charge Location',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 170
          }
        ],
      },
      {
        headerName: 'Distribution Rule',
        children: [
          {
            field: 'DistributionRuleType',
            headerName: 'Rule Type',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 177,
            flex: 0
          },
          {
            field: 'DistributionLevel',
            headerName: 'Distribution Level',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 178
          },
          {
            field: 'DistributionOriginLevelType',
            headerName: 'Distribution Origin',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 185
          },
          {
            field: 'DistributionMethodType',
            headerName: 'Distribution Method',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 195
          },
          {
            field: 'DistributionRuleOption',
            headerName: 'Rule Option',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 145
          },
          {
            field: 'DistributionRuleName',
            headerName: 'Distribution Rule',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 174,
            tooltipField: 'DistributionRuleName',
            tooltipComponentParams: { color: '#ececec' },
          }
        ],
      }
    ];
    this.frameworkComponents = {
      RuleActionButtonRender: RuleActionButtonRender,
      EventRuleActionButtonRender: EventRuleActionButtonRender
    }
  }

  clickNext() {
    if(this.fromTab == 'true') {
      this.switchTab.emit({ index: 8 })
    } else {
      this.switchTab.emit({ index: 6 })
    }
  }

  onBtnClick1(e: any) {
    if(e.type == 'delete') {
      this.sandBoxService.specificDistribution(this.sandBoxGridRowData.SBInvoiceId, [{
        inventoryId: e.data.InventoryId,
        status: false,
        chargeCodeId: e.data.ChargeCodeId
      }]).subscribe((res: any) => {
        if (res.Success) {
          this.getChargeCodeRules();
        }
      });
    } else {
      this.onCellClicked.emit({ rowData: [e.data], index: 1 })
    }
  }

  getChargeCodeRules() {
    this.showSpinner = true;
    const data: any = {};
    if(this.fromTab == 'true')
      data['IsFromChargeDistributionStep6'] = true;

    this._unsubscribeChargeCode.next(null);
    this.sandBoxService.chargeCodeNeedRules(this.sandBoxGridRowData.SBInvoiceId, data)
      .pipe(takeUntil(this._unsubscribeChargeCode))
      .subscribe((response: any) => {
        this.showSpinner = false;
        if (response.Success) {
          this.rowData = response.Data.$values;
          this.hasSpecificDistribution = this.rowData.some((row: any) => row.SpecificDistributionNeeded === true);
          this.hasAllDistribution = this.rowData.every((row: any) => row.SpecificDistributionNeeded === true);
        } else {
          this.rowData = [];
          if(response.Data.$values.length == 0) {
            this.callOverview.emit(true);
          }
        }
      }, error => {
        this.showSpinner = false;
        this.rowData = [];
      });
  }

  onSelectionChanged($event: any) {
    this.selectedCheckBoxData = $event
    this.totalUnassignedChargeCode = $event?.length;
  }

  redirectTab() {
    this.onCellClicked.emit({ multiCheckBox : this.selectedCheckBoxData.length > 1 ? true : false, rowData: this.selectedCheckBoxData, index: 1 });
  }

  getDistributionEvent() {
    const data: any = {};
    if(this.fromTab == 'true')
      data['IsFromChargeDistributionStep6'] = true;
    this._unsubscribeDistributionEvent.next(null);
    this.sandBoxService.costDistributionEvent(this.sandBoxGridRowData.SBInvoiceId, data).pipe(takeUntil(this._unsubscribeDistributionEvent)).subscribe((response: any) => {
      if (response.Success) {
        this.rowDataEvent = response.Data.$values;
      }
      // this.dialogRef.close();
      // this.dialog['disableClose'] = false;
    });
  }

  ngOnDestroy() {
    this._unsubscribeChargeCode.next(null);
    this._unsubscribeChargeCode.complete();
    this._unsubscribeDistributionEvent.next(null);
    this._unsubscribeDistributionEvent.complete();
  }
}
