import { Component, EventEmitter, Input, OnInit, Output, ViewChild, TemplateRef } from '@angular/core';
import { AddCorrectionComponent } from './add-correction/add-correction.component';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { SandBoxService } from 'src/app/services/sandbox.service';
import { takeUntil } from 'rxjs/operators';
import * as _ from 'lodash';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { checkIsValueExists } from 'src/app/services/helper';
import moment from 'moment';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { BillingPTableComponent } from './billing-p-table/billing-p-table.component';

@Component({
  selector: 'app-isd-by-billing-id',
  templateUrl: './isd-by-billing-id.component.html',
  styleUrls: ['./isd-by-billing-id.component.scss'],
  imports: [SharedModule, PrimgModule, BillingPTableComponent ]
})
export class IsdByBillingIdComponent implements OnInit {

  
  tableData: any;
  cols: any[];
  public columnDefs1: any;
  rowData: any = [];
  rowSelection = 'multiple';
  defaultColDef = {
    editable: false,
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
  public getDataPath: any = (data: any) => data.dataPath;
  selectedDetail: any = [];
  @Input() recordPublishedOrCompleted: any;
  @Input() sandBoxGridRowData: any;
  @Input() overviewData: any;

  @Output() refreshOverview: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('tooltipText') tooltipText!: TemplateRef<any>;

  private _unsubscribeInventory: Subject<any> = new Subject<any>();

  public autoGroupColumnDef: any = {
    headerName: 'Billing Id',
    field: 'BillingId',
    editable: false,
    filterParams: {
      treeList: true,
    },
    filter: 'agTextColumnFilter',
    minWidth: 240,
    cellStyle: {
      display: "flex",
      'vertical-align': "middle"
    },
    cellClass: "ag-cell-add-btn",
    cellRendererParams: {
      checkbox: true,
      suppressCount: true,
      innerRenderer:(params: any) => {
        return params.data.AccrossInventory == true ? params.data.BillingId + '<div><button class="btn btn-primary grid-cell-btn" style="padding: 2px 8px; font-size: 10px; position: relative; top: -1px; margin-left: 5px;">Added</button></div>' : params.data.BillingId
      }
    }
  };

  constructor(public dialog: MatDialog, public sandBoxService: SandBoxService) {
    this.cols = [
      { field: 'billingID ', header: 'Billing ID' },
      { field: 'mainAccountNumber ', header: 'Main Account Number' },
      { field: 'subAccountNumber', header: 'Sub Account Number' },
      { field: 'charge', header: 'Charge' },
      { field: 'chargeCodeType', header: 'Charge Code Type' },
      { field: 'chargeCodeName ', header: 'Charge Code Name' },
      { field: 'ChargeCode', header: 'Charge Code' },
      { field: 'timeDate ', header: 'Time & Date' },
      { field: 'who', header: 'Who' }
    ];

  }

  ngOnInit(): void {
    // this.chargeValidationByBillingId();
    this.columnDefs1 = [
     
      {
        headerName: 'Account',
        children: [
          {
            field: 'MainAccountNumber',
            headerName: 'Main Account',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 170,
            minWidth: 170,
            flex: 0
          },
          {
            field: 'SubAccountNumber',
            headerName: 'Sub Account',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 156,
            minWidth: 156,
            flex: 0
          }
        ],
      },
      {
        headerName: 'Summary Comparision',
        children: [
          {
            field: 'Difference',
            headerName: 'Difference',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agNumberColumnFilter',
            minWidth: 135,
            flex: 0,
            valueFormatter: (params: any) => this.currencyFormatter(params.data.Difference, this.overviewData.CurrencySymbol),
            cellStyle: {display: 'flex !important', 'justify-content': 'end','padding-right':'50px'}
          },
          {
            field: 'ChargeSummery',
            headerName: 'Charge Summary',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agNumberColumnFilter',
            minWidth: 176,
            flex: 0,
            valueFormatter: (params: any) => this.currencyFormatter(params.data.ChargeSummery, this.overviewData.CurrencySymbol),
            cellStyle: {display: 'flex !important', 'justify-content': 'end','padding-right':'50px'}
          },
          {
            field: 'DetailsSummery',
            headerName: 'Detail Summary',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agNumberColumnFilter',
            minWidth: 169,
            flex: 0,
            valueFormatter: (params: any) => this.currencyFormatter(params.data.DetailsSummery, this.overviewData.CurrencySymbol),
            cellStyle: {display: 'flex !important', 'justify-content': 'end','padding-right':'50px'}
          },
        ],
      },
      {
        headerName: 'Charge Detail',
        children: [
          {
            field: 'Charge',
            headerName: 'Itemized Detail',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agNumberColumnFilter',
            minWidth: 164,
            flex: 0,
            valueFormatter: (params: any) => this.currencyFormatter(params.data.Charge, this.overviewData.CurrencySymbol),
            cellStyle: {display: 'flex !important', 'justify-content': 'end','padding-right':'50px'}
          }
        ],

      },
      {
        headerName: 'Charge Code',
        children: [
          // {
          //   field: 'ChargeCode',
          //   headerName: 'Charge Codes',
          //   columnGroupShow: 'close',
          //   editable: false,
          //   filter: 'agTextColumnFilter',
          //   minWidth: 170,
          //   flex: 0
          // },

          {
            field: 'ChargeCodeName',
            headerName: 'Charge Code Name',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 189,
            flex: 0
          },
          
          {
            field: 'ChargeCode',
            headerName: 'Charge Code',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 200,
            flex: 0
          },

       
          {
            field: 'ChargeCodeCodeType',
            headerName: 'Charge Code Type',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 182,
            flex: 0
          },
          {
            field: 'ChargeTypeName',
            headerName: 'Charge Type',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 180,
            flex: 0
          },
          {
            field: 'quantity',
            headerName: 'Quantity',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 104,
            flex: 0
          },
          {
            field: 'UnitOfMeasure',
            headerName: 'Unit of Measurement',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 200,
            flex: 0
          },
        ],
      },
      {
        headerName: 'Charge Location',
        children: [
          {
            field: 'ChargeCodeLocation',
            headerName: 'Charge Location',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 170,
            flex: 0
          },
        ]
      },
      {
        headerName: 'Distribution',
        children: [
          {
            field: 'DistributionEventsId',
            headerName: 'Distribution Event ID',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 170,
            flex: 0
          },
        ]
      }
    ];
    this.getChargeValidationLog();

  }

  getChargeValidationLog() {
    let data: any = {};
    data['advanceFilter'] = [
      {
       "filterKey": "ManualAddedCharges",
        "filterOptionType1": "equals",
        "filterOptionValue1": "1",
        "filterOperationType": "AND",
        "filterOptionType2": null,
        "filterOptionValue2": null
    }];

    this.sandBoxService.chargeValidationDetails(this.sandBoxGridRowData.SBInvoiceId, data).subscribe((data: any) => {
      if(data.Success) {
        this.tableData = data.Data.$values;
      } else {
        this.tableData = [];
      }
    });
  }
  openDialog(): void {
    const dialogRef = this.dialog.open(this.tooltipText, {
      width: '900px',
          data: {
            colseButton: true,
          }
    });
  }

  processData(data: any[]) {
    const flattenedData: any[] = [];
    const flattenRowRecursive = (row: any, parentPath: string[]) => {
      const dataPath = [...parentPath, row.$id];
      flattenedData.push({ ...row, dataPath });
      if (row.sBChargeValidationsByChargeCodeDataDtos && row.sBChargeValidationsByChargeCodeDataDtos.$values.length) {
        row.sBChargeValidationsByChargeCodeDataDtos.$values.forEach((underling: any) =>
          flattenRowRecursive(underling, dataPath)
        );
      }
    };
    data.forEach((row) => flattenRowRecursive(row, []));
    return flattenedData;
  }

  ngOnDestroy(): void {
    this._unsubscribeInventory.next(null);
    this._unsubscribeInventory.complete();
  }

  chargeValidationByBillingId() {
    this._unsubscribeInventory.next(null);
    this.sandBoxService
      .chargeValidationByBillingId(this.sandBoxGridRowData.SBInvoiceId)
      .pipe(takeUntil(this._unsubscribeInventory))
      .subscribe(
        (data: any) => {
          this.rowData = [];
          if (data && data.Data && data.Data.$values) {
            this.rowData = this.processData(data.Data.$values);
          } else {
            let errorData: any = {
              messgeType: "error",
              title: "Attention",
              titleClass: "text-c-blue",
              icon: "fas fa-exclamation-circle",
              iconClass: "text-c-blue f-70",
              message: data.Message //if messges is multiple use array
            }
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
            dialogRef.afterClosed().subscribe(result => {
            });
          }
        },
        (error) => {
        }
      );
  }
  onSelectionChanged(event: any) {
    this.selectedDetail = event;
  }
  convertToDateTime(date: any) {
    return moment(new Date(date)).format('MM/DD/YYYY h:mm');
  }
  correctionCalled(data: any) {
    this.refreshOverview.emit(false);
    let data1 = _.map(data, (e: any) => { return e.VendorBillingAliasId });
      let matched1 = data1.every((val, i, arr) => val === arr[0]);
      if (matched1) {
        const dialogRef = this.dialog.open(AddCorrectionComponent, {
          width: '900px',
          data: {
            selected: data,
            SBInvoiceId: this.sandBoxGridRowData.SBInvoiceId,
            fromTabC: true,
            sandBoxGridRowData: this.sandBoxGridRowData,
            overviewData: this.overviewData
          },
          disableClose: true
        });
        dialogRef.afterClosed().subscribe((result) => {
          data = [];
          this.chargeValidationByBillingId();
          this.refreshOverview.emit(true);
          this.getChargeValidationLog();
        });
      }
  }
  AddCorrection() {
    this.refreshOverview.emit(false);
    let isParent = _.every(this.selectedDetail, (x: any) => x.InventoryId);
    if (isParent) {
      let data1 = _.map(this.selectedDetail, (e: any) => { return e.VendorBillingAliasId });
      let matched1 = data1.every((val, i, arr) => val === arr[0]);
      if (matched1) {
        const dialogRef = this.dialog.open(AddCorrectionComponent, {
          width: '900px',
          data: {
            selected: this.selectedDetail,
            SBInvoiceId: this.sandBoxGridRowData.SBInvoiceId,
            fromTabC: true,
            sandBoxGridRowData: this.sandBoxGridRowData,
            overviewData: this.overviewData
          },
          disableClose: true
        });
        dialogRef.afterClosed().subscribe((result) => {
          this.selectedDetail = [];
          this.chargeValidationByBillingId();
          this.refreshOverview.emit(true);
          this.getChargeValidationLog();
        });
      }
    //   } else {
    //     let errorData: any = {
    //       messgeType: "error",
    //       title: "Attention",
    //       titleClass: "text-c-blue",
    //       icon: "fas fa-exclamation-triangle",
    //       iconClass: "text-c-blue f-70",
    //       message: 'Vendor Product are created by VBA. Please ensure your selection of Charge Codes only 1 VBA.'
    //     }
    //     const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData, width: '400px' });
    //     dialogRef.afterClosed().subscribe(result => {
    //     });
    //   }
    } else {
      let errorData: any = {
        messgeType: "error",
        title: "Attention",
        titleClass: "text-c-blue",
        icon: "fas fa-exclamation-triangle",
        iconClass: "text-c-blue f-70",
        message: 'Do not allow to select child record'
      }
      const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
      dialogRef.afterClosed().subscribe(result => {
      });
    }

  }
  currencyFormatter(currency: any, sign: any  ) {
    if(checkIsValueExists(currency)){
      var sansDec = currency.toFixed(2);
      // var formatted = sansDec.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      // formatted = formatted ? parseFloat(formatted).toFixed(2) : 0.00;
      return sign + `${sansDec.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
    } else {
      return '';
    }
  }
}