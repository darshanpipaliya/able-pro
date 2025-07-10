import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import _ from 'lodash';
import { RuleEditComponent } from './rule-edit.component';
import { MatDialog } from '@angular/material/dialog';
import { InvoiceService } from 'src/app/services/invoice.service';
import { isValueExist } from 'src/app/services/helper';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { AgGridTableComponent } from '../ag-grid-table/ag-grid-table.component';
import { InvoiceOverviewIComponent } from '../invoice-overview-i/invoice-overview-i.component';
import { AgGridModule } from 'ag-grid-angular';
import { ModuleRegistry, ServerSideRowModelModule } from 'ag-grid-enterprise';
import { ClientSideRowModelModule } from 'ag-grid-community';

ModuleRegistry.registerModules([ClientSideRowModelModule, ServerSideRowModelModule]);
@Component({
  selector: 'app-distribution-detail-d-i',
  templateUrl: './distribution-detail-d-i.component.html',
  styleUrls: ['./distribution-detail-d-i.component.scss'],
  standalone: true,
  imports: [SharedModule, PrimgModule, AgGridTableComponent, AgGridModule, InvoiceOverviewIComponent]
})
export class DistributionDetailDIComponent implements OnInit {

  public sideBar;
  sbInvoiceId: any;
  columnDefs2: any;
  gridApi: any;

  public columnDefs;
  rowData: any = [];
  rowDataSecond: any = [];
  rowSelection = 'multiple';
  defaultColDef = {
    editable: true,
    sortable: true,
    minWidth: 100,
    resizable: true,
    floatingFilter: true,
    flex: 1,
  };
  private _unsubscribeDetail: Subject<any> = new Subject<any>();
  private _unsubscribePreDis: Subject<any> = new Subject<any>();
  private _unsubscribeGRid: Subject<any> = new Subject<any>();

  frameworkComponents: any;
  overviewData: any;

  @Input() gridRowData: any;
  @Input() clickedRecord: any;
  @Input() selectedTab: any;
  @Output() redirectTab: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('tooltipText') tooltipText!: TemplateRef<any>;
  @ViewChild('tooltipText2') tooltipText2!: TemplateRef<any>;

  gridOptions = {
    rowModelType: 'serverSide',
    serverSideInfiniteScroll: true,
    enableFiltering: true,
    headerHeight: 35,
    groupHeaderHeight: 37,
    floatingFiltersHeight: 35,
    rowSelection: {
      type: 'multiple',
      enableClickSelection: true
    }
  };

  public exportCustomerData: any;
  public exportCustomerDetail: any;
  private gridColumnApi!: any;
  isDisabledExport = false;
  rowDataDistribution = [];
  totalCount = 0;
  constructor(private invoiceService: InvoiceService, public dialog: MatDialog
  ) {
    this.sideBar = {
      toolPanels: ['columns', 'filters']
    };

    this.columnDefs = [
      {
        headerName: '',
        children: [
          {
            headerName: 'Action',
            filter: false,
            editable: false,
            minWidth: 97,
            cellStyle: {
              'display': 'flex',
              'justify-content': 'center'
            },
            cellRenderer: RuleEditComponent,
            cellRendererParams: {
                onClick: this.onBtnClick2.bind(this)
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
            minWidth: 201
          },
        ],
      },
      {
        headerName: 'Distribution Details',
        children: [
          {
            field: 'DistributionAmountDistributed',
            headerName: 'Amount Distributed',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 188,
            cellStyle: {display: 'flex !important', 'justify-content': 'end','padding-right':'50px'},
            valueFormatter(params: any) {
              if (params?.data?.DistributionAmountDistributed) {
                var sansDec = params?.data?.DistributionAmountDistributed.toFixed(2);
                return params?.data?.CurrencySymbol + `${sansDec.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
              }
              return '';
            }
          },
          {
            field: 'DistributionEventId',
            headerName: 'Distribution Event',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 175
          },
          {
            field: 'DistributionAmountDifference',
            headerName: 'Difference',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 123,
            cellStyle: {display: 'flex !important', 'justify-content': 'end','padding-right':'50px'},
          },
          {
            field: 'TotalDistribution',
            headerName: '# of Distributions',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 171,
            cellStyle: {display: 'flex !important', 'justify-content': 'end','padding-right':'50px'},
          },
          {
            field: 'DistributionTotalChargeDisplay',
            headerName: 'Original Charge',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 159,
            cellStyle: {display: 'flex !important', 'justify-content': 'end','padding-right':'40px'},
          }
        ],
      },
      {
        headerName: 'Distribution Rule',
        children: [
          {
            field: 'DistributionRuleType',
            headerName: 'Rule Type',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'close',
            editable: false,
            minWidth: 185
          },
          {
            field: 'DistributionLevel',
            headerName: 'Distribution Level',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 195
          },
          {
            field: 'DistributionOriginLevelType',
            headerName: 'Distribution Origin',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 205
          },
          {
            field: 'DistributionMethodType',
            headerName: 'Distribution Method',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 215
          },
          {
            field: 'DistributionRuleOption',
            headerName: 'Rule Option',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 160
          },
          {
            field: 'DistributionRuleName',
            headerName: 'Distribution Rule',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 190,
            tooltipField: 'DistributionRuleName',
            tooltipComponentParams: { color: '#ececec' },
          }
        ],
      },
      {
        headerName: 'Charge Code',
        children: [
          {
            field: 'ChargeCode',
            headerName: 'Charge Code',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 165
          },
          {
            field: 'ChargeCodeName',
            headerName: 'Charge Code Name',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 210
          },
          {
            field: 'ChargeCodeType',
            headerName: 'Charge Code Type',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 200
          },
          {
            field: 'ChargeType',
            headerName: 'Charge Type',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 165
          },
          {
            field: 'ChargeLocationType',
            headerName: 'Charge Location',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 185
          },
          {
            field: 'Quantity',
            headerName: 'Quantity',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'open',
            editable: false,
            width: 150,
            minWidth: 150
          }
        ],
      },
      {
        headerName: 'Account',
        children: [
          {
            field: 'ServiceNumber',
            // headerName: 'Billing ID',
            headerName: 'Service Number',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 162,
            cellClass: "ag-cell-add-btn",
            cellRenderer: function (params: any) {
              return  params.data.AccrossInventory == true ? params.data.ServiceNumber + '<div><button class="btn btn-primary grid-cell-btn" style="padding: 2px 8px; font-size: 10px; position: relative; top: -1px; margin-left: 5px;">Added</button></div>' : params.data.ServiceNumber
            }
          },
          {
            field: 'MainAccountNumber',
            headerName: 'Main Account',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 175
          },
          {
            field: 'SubAccountNumber',
            headerName: 'Sub Account',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 165
          },
          {
            field: 'PayableAccountNumber',
            headerName: 'Payable Account',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 190
          }
        ],
      }
    ];

    this.columnDefs2 = [
      {
        headerName: 'Account',
        children: [
          {
            field: 'ServiceNumber',
            // headerName: 'Billing ID',
            headerName: 'Service Number',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            width: 162,
            minWidth: 162,
            flex: 0,
            cellClass: "ag-cell-add-btn",
            cellRenderer: function (params: any) {
              return  params.data.AccrossInventory == true ? params.data.ServiceNumber + '<div><button class="btn btn-primary grid-cell-btn" style="padding: 2px 8px; font-size: 10px; position: relative; top: -1px; margin-left: 5px;">Added</button></div>' : params.data.ServiceNumber
            }
          },
          {
            field: 'AccrossInventoryDisplay',
            headerName: 'ID Added',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 150
          },
          {
            field: 'AnotherAccountInventoryDisplay',
            headerName: 'Secondary Account',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 150
          },
          {
            field: 'PayableAccountNumber',
            headerName: 'Payable Account Number',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 250
          },
          {
            field: 'MainAccountNumber',
            headerName: 'Main Account',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 175
          },
          {
            field: 'SubAccountNumber',
            headerName: 'Sub Account',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 165
          }
        ],
      },
      {
        headerName: 'Distribution',
        children: [
          {
            field: 'DistributionItemizedCharge',
            headerName: 'Itemized Detail',
            columnGroupShow: 'close',
            filter: 'agNumberColumnFilter',
            editable: false,
            minWidth: 180,
            cellStyle: {display: 'flex !important', 'justify-content': 'end','padding-right':'50px'},
            valueFormatter(params: any) {
              if (params?.data?.DistributionItemizedCharge) {
                var sansDec = params?.data?.DistributionItemizedCharge.toFixed(2);
                return params?.data?.CurrencySymbol + `${sansDec.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
              }
              return '';
            }
          },
          {
            field: 'DistributionEventId',
            headerName: 'Distribution Event',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 200
          }
        ],
      },
      {
        headerName: 'Distribution Rule',
        children: [
          {
            field: 'DistributionRuleType',
            headerName: 'Rule Type',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'close',
            editable: false,
            width: 190,
            flex: 0,
            minWidth: 190
          },
          {
            field: 'DistributionLevel',
            headerName: 'Distribution Level',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 195
          },
          {
            field: 'DistributionOriginLevelType',
            headerName: 'Distribution Origin',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 205
          },
          {
            field: 'DistributionMethodType',
            headerName: 'Distribution Method',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 215
          },
          {
            field: 'DistributionRuleOption',
            headerName: 'Rule Option',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 180
          },
          {
            field: 'DistributionRuleName',
            headerName: 'Distribution Rule',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 190,
            tooltipField: 'DistributionRuleName',
            tooltipComponentParams: { color: '#ececec' },
          }
        ],
      },
      {
        headerName: 'Charge Code',
        children: [
          {
            field: 'ChargeCode',
            headerName: 'Charge Code',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 165
          },
          {
            field: 'ChargeCodeName',
            headerName: 'Charge Code Name',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 210
          },
          {
            field: 'ChargeCodeType',
            headerName: 'Charge Code Type',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 200
          },
          {
            field: 'ChargeType',
            headerName: 'Charge Type',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 165
          },
          {
            field: 'ChargeLocationType',
            headerName: 'Charge Location',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 185
          }
        ],
      },
      {
        headerName: 'Product',
        children: [
          {
            field: 'VendorProductTypeName',
            headerName: 'Vendor Product',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 165
          },
          {
            field: 'ServiceName',
            headerName: 'Service',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 145
          },
          {
            field: 'ServiceTypeName',
            headerName: 'Service Type',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 165
          },
          {
            field: 'ProductName',
            headerName: 'Product',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 145
          },
          {
            field: 'ProductTypeName',
            headerName: 'Product Type',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 185
          },
          {
            field: 'IndustryName',
            headerName: 'Industry',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 165
          }
        ],
      }
    ];

    this.frameworkComponents = {
      RuleEditComponent: RuleEditComponent
    }
  }

  ngOnInit(): void {

    let headerData:any = [];
    let ChildHeaderData:any = [];
    let i = 0;
    let childIndex = 0;
    _.map(this.columnDefs2, (x: any) => {
      if (isValueExist(x.headerName)) {
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

    this.exportCustomerDetail = {
      ExportToExcelData: {
        HeaderData: headerData,
        ChildHeaderData: ChildHeaderData,
        fileName: "Distribution Detail"
      },
      ExportToExcel: true
    };

    this.exportCustomerData = this.exportCustomerDetail;
  }

  invoiceOverviewDataOutput($event: any) {
    this.overviewData = $event; 
    this.preDistributionDetails();
  }
  openDialog() {
    this.dialog.open(this.tooltipText, {
      width: '900px',
          data: {
            colseButton: true,
          }
    });
  }
  openDialog2() {
    this.dialog.open(this.tooltipText2, {
      width: '900px',
          data: {
            colseButton: true,
          }
    });
  }
  onBtnClick2(data: any) {
    this.redirectTab.emit(data);
  }

  preDistributionDetails() {

    this._unsubscribePreDis.next(true);
    this.invoiceService.preDistributionDetails(this.gridRowData.InvoiceId, this.clickedRecord.DistributionEventId).pipe(takeUntil(this._unsubscribePreDis)).subscribe((res: any) => {
      if(res.Success) {
        this.rowData = res.Data.$values;
        _.map(this.rowData, (x: any) => {
          const a = x;
          a['DistributionAmountDifference'] = (x.DistributionAmountDifference) ? this.overviewData?.CurrencySymbol + parseFloat(x['DistributionAmountDifference']).toFixed(2) : `${this.overviewData?.CurrencySymbol}0.00`;
         
          return a;
        });
      }
    });
  }

  

  onAgGridReady($event: any) {
    this.gridApi = $event;
    let dataSource: any = {
      rowCount: null,
      getRows: (params: any) => {
        let paramsRequest = params['request'];
        const filterArray:any = [];
        let filterArrayNumber:any = [];
        let arrNumber;
        for (var key in paramsRequest.filterModel) {
          let data = paramsRequest.filterModel[key];
          let arr;
          if (key === 'DistributionItemizedCharge') {
            arrNumber = {
              filterKey: key,
              filterOptionType1: data['type'] ? data['type'] : data['condition1'].type ? data['condition1'].type : null,
              filterOptionValue1: (data && data.filter) ? data.filter : (data['condition1'] && data['condition1']['filter']) ? data['condition1'].filter : null,
              filterOptionValue1_2 : (data && data.filterTo) ? data.filterTo : (data['condition1'] && data['condition1']['filterTo']) ? data['condition1']?.filterTo : null,
              filterOperationType: data['operator'] ? data['operator'] : 'AND',
              filterOptionType2: data['condition2']?.type ? data['condition2']?.type : null,
              filterOptionValue2: (data['condition2'] && data['condition2'].filter) ? data['condition2']?.filter : null,
              filterOptionValue2_2: (data['condition2'] && data['condition2'].filterTo) ? data['condition2']?.filterTo : null
            }
            filterArrayNumber.push(arrNumber);
          } else {
            arr = {
              filterKey: key,
              filterOptionType1: data['type'] ? data['type'] : data['condition1'].type ? data['condition1'].type : null,
              filterOptionValue1: data['filter'] ? data['filter'] : data['condition1'].filter ? data['condition1'].filter : null,
              filterOperationType: data['operator'] ? data['operator'] : 'AND',
              filterOptionType2: data['condition2']?.type ? data['condition2']?.type : null,
              filterOptionValue2: data['condition2']?.filter ? data['condition2']?.filter : null
            }
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
        if(filterArrayNumber && filterArrayNumber.length > 0) {
          data['advanceNumberFilter'] = filterArrayNumber;
        }

        data['invoiceId'] = this.gridRowData.InvoiceId;
        data['distributionEventId'] = this.clickedRecord.DistributionEventId;

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
        this.exportCustomerData = { ...this.exportCustomerDetail, ...data };
        this.invoiceService.DistributionDetails(data)
          .pipe(takeUntil(this._unsubscribeGRid))
          .subscribe(
            async (data: any) => {
              this.totalCount = data?.TotalCount;
              if (data && data.Data.$values.length > 0) {
                this.rowDataDistribution = data.Data.$values;
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

    if(this.gridApi?.api) {
      this.gridApi.api.setGridOption("serverSideDatasource", dataSource);
    } else {
      this.gridApi.setGridOption("serverSideDatasource", dataSource);
    }
  }


  ngOnDestroy() {
    this._unsubscribePreDis.next(true);
    this._unsubscribePreDis.complete();
    this._unsubscribeDetail.next(true);
    this._unsubscribeDetail.complete();
  }
  closeClick() {
    let data = {
      type: 'grid'
    }
    this.redirectTab.emit(data);
  }

  onAgGridReadyEmit($event: any) {
    this.gridApi = $event.api;
    this.gridColumnApi = $event.columnApi;
  }

  exportExcel(){
 
    this.isDisabledExport = true;
    this.invoiceService.DistributionDetailsExport(this.exportCustomerData)
      .subscribe({
        next: (data) => {
          this.isDisabledExport = false;
          let bolbUrl = URL.createObjectURL(data);
          var link = document.createElement("a");
          link.setAttribute("href", bolbUrl);
          link.setAttribute("download", "Distribution Detail.xlsx");
          link.style.display = "none";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
        },
        error: error => {
          this.isDisabledExport = false;
        
        }
      });
  }

}
