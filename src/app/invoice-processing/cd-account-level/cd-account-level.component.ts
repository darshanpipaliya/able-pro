import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { AddCorrectionComponent } from '../isd-by-billing-id/add-correction/add-correction.component';
import { MatDialog } from '@angular/material/dialog';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import * as _ from 'lodash';
import moment from 'moment';
import { processNumberFilter, processTextFilter } from 'src/app/common/ag-grid-filter';
import { isValueExist } from 'src/app/services/helper';
import { SandBoxService } from 'src/app/services/sandbox.service';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { AgGridTableComponent } from 'src/app/common/ag-grid-table/ag-grid-table.component';

@Component({
  selector: 'app-cd-account-level',
  templateUrl: './cd-account-level.component.html',
  styleUrls: ['./cd-account-level.component.scss'],
  imports: [SharedModule, PrimgModule, AgGridTableComponent]
})
export class CdAccountLevelComponent implements OnInit {
  @Input() sandBoxGridRowData: any;
  @Input() recordPublishedOrCompleted: any;
  @Input() overviewData: any;

  private _unsubscribeDetail: Subject<any> = new Subject<any>();
  @Output() refreshOverview: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('tooltipText') tooltipText!: TemplateRef<any>;

  rowData: any = [];
  rowSelection = 'multiple';
  tableData: any;
  cols: any[];
  defaultColDef = {
    editable: false,
    sortable: true,
    minWidth: 100,
    filter: true,
    resizable: true,
    floatingFilter: true,
    flex: 1,
  };
  selectedDetail: any = [];
  columnDefs = [
    {
      headerName: ' ',
      headerCheckboxSelection: true,
      checkboxSelection: true,
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
    },
    {
      headerName: 'Account',
      children: [
        {
          field: 'BillingId',
          headerName: 'Billing Id',
          columnGroupShow: 'close',
          editable: false,
          filter: 'agTextColumnFilter',
          minWidth: 127,
          flex: 0,
          cellClass: "ag-cell-add-btn",
          cellRenderer: function (params: any) {
            return params.data.AccrossInventory == true ? params.data.BillingId + '<div><button class="btn btn-primary grid-cell-btn" style="padding: 2px 8px; font-size: 10px; position: relative; top: -1px; margin-left: 5px;">Added</button></div>' : params.data.BillingId
          },
          sortingFiled: 'BillingId'
        },
        {
          field: 'MainAccountNumber',
          headerName: 'Main Account Number',
          columnGroupShow: 'open',
          editable: false,
          filter: 'agTextColumnFilter',
          minWidth: 209,
          flex: 0,
          sortingFiled: 'MainAccountNumber'
        },
        {
          field: 'SubAccountNumber',
          headerName: 'Sub Account Number',
          columnGroupShow: 'open',
          editable: false,
          filter: 'agTextColumnFilter',
          minWidth: 201,
          flex: 0,
          sortingFiled: 'SubAccountNumber'
        }
      ],
    },
    {
      headerName: 'Summary Comparision',
      children: [
        {
          field: 'DifferenceDisplay',
          headerName: 'Difference',
          columnGroupShow: 'close',
          editable: false,
          filter: 'agNumberColumnFilter',
          minWidth: 113,
          width: 113,
          flex: 0,
          sortingFiled: 'Difference',
          // valueFormatter: (params) => params.value !== null && params.value !== undefined ? params.value : "--",
          cellStyle: { display: 'flex !important', 'justify-content': 'end', 'padding-right': '50px' }
        },
        {
          field: 'ChargeSummaryDisplay',
          headerName: 'Charge Summary',
          columnGroupShow: 'open',
          editable: false,
          filter: 'agNumberColumnFilter',
          minWidth: 176,
          flex: 0,
          sortingFiled: 'ChargeSummary',
          cellStyle: { display: 'flex !important', 'justify-content': 'end', 'padding-right': '50px' },
        //  valueFormatter: (params) => params.value !== null && params.value !== undefined ? params.value : "--"
        },
        {
          field: 'DetailSummaryDisplay',
          headerName: 'Detail Summary',
          columnGroupShow: 'open',
          editable: false,
          filter: 'agNumberColumnFilter',
          minWidth: 169,
          flex: 0,
          sortingFiled: 'DetailSummary',
          cellStyle: { display: 'flex !important', 'justify-content': 'end', 'padding-right': '50px' },
          valueFormatter: (params: any) => this.currencyFormatter(params.data?.DetailSummary, this.overviewData?.CurrencySymbol)
        }
      ],
    },
    {
      headerName: 'Charge Detail',
      children: [
        {
          field: 'ItemizedDetailDisplay',
          headerName: 'Itemized Detail',
          columnGroupShow: 'close',
          editable: false,
          filter: 'agNumberColumnFilter',
          minWidth: 164,
          sortingFiled: 'ItemizedDetail',
          flex: 0,
          cellStyle: { display: 'flex !important', 'justify-content': 'end', 'padding-right': '50px' },
          valueFormatter: (params: any) => this.currencyFormatter(params.data?.ItemizedDetail, this.overviewData?.CurrencySymbol)
        }
      ],

    },
    {
      headerName: 'Charge Codes',
      children: [
        {
          field: 'ChargeCodeName',
          headerName: 'Charge Code Name',
          columnGroupShow: 'close',
          editable: false,
          filter: 'agTextColumnFilter',
          sortingFiled: 'ChargeCodeName',
          minWidth: 210,
          flex: 0
        },
        {
          field: 'ChargeCode',
          headerName: 'Charge Code',
          columnGroupShow: 'open',
          editable: false,
          filter: 'agTextColumnFilter',
          sortingFiled: 'ChargeCode',
          minWidth: 170,
          flex: 0
        },
        {
          field: 'ChargeCodeType',
          headerName: 'Charge Code Type',
          columnGroupShow: 'open',
          editable: false,
          filter: 'agTextColumnFilter',
          sortingFiled: 'ChargeCodeType',
          minWidth: 182,
          flex: 0
        },
        {
          field: 'ChargeTypeName',
          headerName: 'Charge Type',
          columnGroupShow: 'open',
          editable: false,
          filter: 'agTextColumnFilter',
          sortingFiled: 'ChargeTypeName',
          minWidth: 150,
          flex: 0,
        },
        {
          field: 'Quantity',
          headerName: 'Quantity',
          columnGroupShow: 'open',
          editable: false,
          filter: 'agTextColumnFilter',
          sortingFiled: 'Quantity',
          width: 105,
          maxWidth: 130,
          flex: 0
        },
        {
          field: 'UnitOfMeasureAbbreviation',
          headerName: 'Unit of Measure',
          columnGroupShow: 'open',
          editable: false,
          filter: 'agTextColumnFilter',
          sortingFiled: 'UnitOfMeasureAbbreviation',
          maxWidth: 175,
          flex: 0
        },
        {
          field: 'ChargeAdjustmentNote',
          headerName: 'Adjustment Note',
          columnGroupShow: 'open',
          editable: false,
          filter: 'agTextColumnFilter',
          sortingFiled: 'ChargeAdjustmentNote',
          minWidth: 175,
          flex: 0
        }
      ],
    },
    {
      headerName: 'Charge Location',
      children: [
        {
          field: 'ChargeLocationType',
          headerName: 'Charge Location',
          columnGroupShow: 'close',
          editable: false,
          filter: 'agTextColumnFilter',
          sortingFiled: 'ChargeLocationType',
          minWidth: 170,
          flex: 0
        }
      ],
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
          sortingFiled: 'DistributionEventsId',
          flex: 0
        },
      ]
    }
  ]

  gridOptions = {
    rowModelType: 'serverSide',
    serverSideInfiniteScroll: true,
    enableFiltering: true,
    headerHeight: 35,
    groupHeaderHeight: 37,
    floatingFiltersHeight: 35
  };

  sideBar = {
    toolPanels: ['columns', 'filters']
  };
  gridApi: any;
  gridColumnApi: any;
  public exportCompanyData: any;
  public exportCompanyDetail: any;
  constructor(public dialog: MatDialog, public sandBoxService: SandBoxService) {

    this.cols = [
      { field: 'billingID ', header: 'Billing ID' },
      { field: 'mainAccountNumber', header: 'Main Account Number' },
      { field: 'subAccountNumber', header: 'Sub Account Number' },
      { field: 'charge', header: 'Charge' },
      { field: 'chargeCodeType', header: 'Charge Code Type' },
      { field: 'chargeCodeName', header: 'Charge Code Name' },
      { field: 'ChargeCode', header: 'Charge Code' },
      { field: 'timeDate', header: 'Time & Date' },
      { field: 'who', header: 'Who' }
    ];

  }

  ngOnInit(): void {

    let headerData:any = [];
    let ChildHeaderData:any = [];
    let i = 0;
    let childIndex = 0;
    _.map(this.columnDefs, (x: any) => {
      if (isValueExist(x.headerName) && x.headerName !== " ") {
        i = i + 1;
        headerData.push({ position: i, title: x.headerName });
        if (x.children) {
          _.map(x.children, (y: any) => {
            childIndex = childIndex + 1;
            ChildHeaderData.push({ Position: childIndex, Title: y.headerName, FieldName: y.field, HeaderPosition: i })
          })
        }
      }
    });

    this.exportCompanyDetail = {
      ExportToExcelData: {
        HeaderData: headerData,
        ChildHeaderData: ChildHeaderData,
        fileName: "CD Account Level"
      },
      ExportToExcel: true
    };
    this.exportCompanyData = this.exportCompanyDetail;


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
    }, ];

    this.sandBoxService.chargeValidationDetails(this.sandBoxGridRowData.SBInvoiceId, data).subscribe((data: any) => {
      if (data.Success) {
        // Replace null values for Difference & ChargeSummary with "--"
        this.tableData = data.Data.$values.map((item: any) => ({
            ...item,
            Difference: item.Difference ?? "--",
            ChargeSummary: item.ChargeSummary ?? "--"
        }));
    } else {
        this.tableData = [];
    }
});
}
  
  convertToDateTime(date: any) {
    return moment(new Date(date)).format('MM/DD/YYYY h:mm');
  }

  onSelectionChanged(event: any) {
    this.selectedDetail = event;
  }
  openTooltipDialog() {
    const dialogRef = this.dialog.open(this.tooltipText, {
      width: '900px',
      data: {
        colseButton: true,
      }
    });
  }

  AddCorrection() {
    this.refreshOverview.emit(false);
    let matchRecord = _.every(this.selectedDetail, (x: any) => x.IsServiceLevel == true || x.ChargeLocationType === 'Account Level Adjustment');
    if (matchRecord) {
      // let data1 = _.map(this.selectedDetail, (x) => x.VendorBillingAliasId);
      // let matched1 = data1.every((val, i, arr) => val === arr[0]);
      // if (matched1) {
      const dialogRef = this.dialog.open(AddCorrectionComponent, {
        width: '900px',
        data: {
          selected: this.selectedDetail,
          SBInvoiceId: this.sandBoxGridRowData.SBInvoiceId,
          sandBoxGridRowData: this.sandBoxGridRowData,
          overviewData: this.overviewData
        },
        disableClose: true
      });
      dialogRef.afterClosed().subscribe((result) => {
        // this.selectedDetail = [];
        // this.onAgGridReady(this.gridApi);
        this.refreshOverview.emit(true);
        this.getChargeValidationLog();
        // this.gridApi.deselectAll();
      });
      // } else {
      //   let errorData: any = {
      //     messgeType: "error",
      //     title: "Attention",
      //     titleClass: "text-c-blue",
      //     icon: "fas fa-exclamation-triangle",
      //     iconClass: "text-c-blue f-70",
      //     message: 'Vendor Product are created by VBA. Please ensure your selection of Charge Codes only 1 VBA.'
      //   }
      //   const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData, width: '400px' });
      //   dialogRef.afterClosed().subscribe(result => {
      //   });
      // }
    } else {
      return
    }
  }
 
  currencyFormatter(currency: any, sign: any) {
    if (currency !== null && currency !== undefined) {
      var sansDec = currency?.toFixed(2);
      // var formatted = sansDec.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      // formatted = formatted ? parseFloat(formatted).toFixed(2) : 0.00;
      return sign + `${sansDec.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
    } else {
      return "--";
    }
  }

  ngOnDestroy() {
    this._unsubscribeDetail.next(null);
    this._unsubscribeDetail.complete();
  }

  onAgGridReadyEmit($event: any) {
    this.gridApi = $event.api;
    this.gridColumnApi = $event.columnApi;
  }

  onAgGridReady($event: any) {
    this.gridApi = $event;
    let dataSource: any = {
      rowCount: null,
      getRows: (params: any) => {
        let paramsRequest = params['request'];
        const filterArray:any = [];
        const filterArrayNumber:any = [];

        for (var key in paramsRequest.filterModel) {
          let data = paramsRequest.filterModel[key];
          let arr;
          let arrNumber;

          if (key == 'ItemizedDetailDisplay') {
            key = 'ItemizedDetail'
          }

          if(key == 'DetailSummaryDisplay') {
            key = 'DetailSummary'
          }
          if(key == 'ChargeSummaryDisplay') {
            key = 'ChargeSummary'
          }

          if(key == 'DifferenceDisplay') {
            key = 'Difference'
          }

          if (key === 'Difference' || key === 'ChargeSummary' || key === 'DetailSummary' || key === 'ItemizedDetail') {
            arrNumber = processNumberFilter(key, data);
            filterArrayNumber.push(arrNumber);
          } else {
            arr = processTextFilter(key, data);
            filterArray.push(arr);
          }
        }
        let data: any = {
          StartRowIndex:
            paramsRequest.startRow === 0 ? 1 : paramsRequest.startRow + 1,
          MaximumRows: 100
        };

        if (filterArray && filterArray.length > 0) {
          data['advanceFilter'] = filterArray;
        }

        if (filterArrayNumber && filterArrayNumber.length > 0) {
          data['advanceNumberFilter'] = filterArrayNumber;
        }

        if (paramsRequest.sortModel.length > 0) {
          Object.values(params['columnApi']['columnController']['columnDefs']).forEach((key:any) => {
            if (key['children']) {
              Object.values(key['children']).forEach((k:any) => {
                if (k['field'] === paramsRequest.sortModel[0].colId) {
                  data['OrderBy'] = k['sortingFiled'];
                  data['SortOrder'] = paramsRequest.sortModel[0].sort;
                }
              });
            }
          });
        }
        this.exportCompanyData = { ...this.exportCompanyDetail, ...data };
        this._unsubscribeDetail.next(null);
        this.sandBoxService.chargeValidationDetails(this.sandBoxGridRowData.SBInvoiceId, data).pipe(takeUntil(this._unsubscribeDetail))
          .subscribe(
            async (data: any) => {
              this.rowData = data.Data.$values;
              if (data && data.Data.$values.length > 0) {
                let lastRow = -1;
                if (data.TotalCount <= paramsRequest.startRow + 100) {
                  lastRow = data.TotalCount;
                }
                params.success({
                  rowData: data.Data.$values,
                  rowCount: lastRow
                });
              } else {
                params.success({
                  rowData: [],
                  rowCount: 0
                });
                this.gridApi.showNoRowsOverlay();
              }
            },
            (error) => {
              params.success({
                rowData: [],
                rowCount: 0
              });
              this.gridApi.showNoRowsOverlay();
            }
          );
      },
    };
    if (this.gridApi!.api) {
      this.gridApi!.api.setGridOption("serverSideDatasource", dataSource);
    } else {
      this.gridApi.setGridOption("serverSideDatasource", dataSource);
    }
  }

}
