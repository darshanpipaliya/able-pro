import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import _ from 'lodash';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { SubActionButtonRender } from './sub-action-button.component';
import { MatDialog } from '@angular/material/dialog';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { AgGridTableComponent } from 'src/app/common/ag-grid-table/ag-grid-table.component';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { SandBoxService } from 'src/app/services/sandbox.service';
import { isValueExist } from 'src/app/services/helper';
import { processNumberFilter, processTextFilter } from 'src/app/common/ag-grid-filter';
@Component({
  selector: 'app-cost-distribution-subb',
  templateUrl: './cost-distribution-subb.component.html',
  styleUrls: ['./cost-distribution-subb.component.scss'],
  imports: [SharedModule, PrimgModule, AgGridTableComponent, NgbTooltipModule]
})
export class CostDistributionSubbComponent implements OnInit {
  @Input() fromTab: any;
  @Input() sandBoxGridRowData: any;
  @Input() clickedRecord: any;
  @Output() redirectTab: EventEmitter<any> = new EventEmitter<any>();
  @Output() onCellClicked: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('DistributionGrid') DistributionGrid!: TemplateRef<any>;
  @ViewChild('DistributionDetail') DistributionDetail!: TemplateRef<any>;
  @Input() recordPublishedOrCompleted: any;
  @Input() overviewData: any;

  public sideBar;
  sbInvoiceId: any;
  columnDefs2: any;

  public columnDefs;
  rowData: any = [];
  rowDataSecond: any = [];
  totalCount = 0;
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

  frameworkComponents: any;

  gridApi: any;
  public exportCustomerData: any;
  public exportCustomerDetail: any;
  private gridColumnApi!: any;
  isDisabledExport = false;

  gridOptions = {
    rowModelType: 'serverSide',
    serverSideInfiniteScroll: true,
    enableFiltering: true,
    headerHeight: 35,
    groupHeaderHeight: 37,
    floatingFiltersHeight: 35
  };
  constructor(private sandboxService: SandBoxService, public dialog: MatDialog) {
   
    this.sideBar = {
      toolPanels: [{ id: 'columns',
        labelDefault: 'Columns',
        labelKey: 'columns',
        iconKey: 'columns',
        toolPanel: 'agColumnsToolPanel',
        toolPanelParams: {
          suppressRowGroups: true,
          suppressValues: true,
          suppressPivotMode: true
        }}, 'filters']
    };

    this.columnDefs = [
      {
        headerName: '',
        children: [
          {
            headerName: 'Action',
            filter: false,
            editable: false,
            width: 91,
            minWidth: 91,
            flex: 0,
            suppressSizeToFit: true,
            cellStyle: {
              'display': 'flex',
              'justify-content': 'center'
            },
            cellRenderer: SubActionButtonRender,
            cellRendererParams: {
              onClick: this.onBtnClick2.bind(this)
            }
            // cellRenderer: function () {
            //   return `<i class="fa fa-edit" tooltipClass="tooltip-bg" container="body" ngbTooltip="Edit Distribution"></i>`
            // }
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
            width: 184,
            minWidth: 184,
            flex: 0,
            suppressSizeToFit: true
          },
        ],
      },
      {
        headerName: 'Distribution Details',
        children: [
          {
            field: 'DistributionTotalOriginalChargeDisplay',
            headerName: 'Original Charge',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            width: 145,
            minWidth: 145,
            flex: 0,
            suppressSizeToFit: true,
            cellStyle: { display: 'flex !important', 'justify-content': 'end', 'padding-right': '30px' },
          },
          {
            field: 'DistributionAmountDistributed',
            headerName: 'Amount Distributed',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            width: 170,
            minWidth: 170,
            flex: 0,
            suppressSizeToFit: true,
            cellStyle: { display: 'flex !important', 'justify-content': 'end', 'padding-right': '30px' },
            valueFormatter: (params: any) => this.currencyFormatter(params.data.DistributionAmountDistributed, params?.data?.CurrencySymbol),

            // valueFormatter(params) {

            //   if (params?.data?.DistributionAmountDistributed) {
            //     var sansDec = params?.data?.DistributionAmountDistributed.toFixed(2);
            //     return params?.data?.CurrencySymbol + `${sansDec.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
            //   }
            //   return '';
            // }
          },
          {
            field: 'DistributionAmountDifference',
            headerName: 'Difference',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            width: 113,
            minWidth: 113,
            flex: 0,
            suppressSizeToFit: true,
            cellStyle: { display: 'flex !important', 'justify-content': 'end', 'padding-right': '30px' },
            valueFormatter: (params: any) => this.currencyFormatter(params.data.DistributionAmountDifference, params?.data?.CurrencySymbol),
            // valueFormatter(params) {

            //   if (params?.data?.DistributionAmountDifference) {
            //     var sansDec = params?.data?.DistributionAmountDifference.toFixed(2);
            //     return params?.data?.CurrencySymbol + `${sansDec.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
            //   }
            //   return '';
            // }
          },
          // {
          //   field: 'DistributionTo',
          //   headerName: 'Distribution To',
          //   columnGroupShow: 'close',
          //   filter: 'agTextColumnFilter',
          //   editable: false,
          //   minWidth: 175
          // },
          {
            field: 'TotalDistribution',
            headerName: '# of Distributions',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            width: 155,
            minWidth: 155,
            flex: 0,
            suppressSizeToFit: true
          },
          {
            field: 'DistributionEventId',
            headerName: 'Distribution Event',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            width: 159,
            minWidth: 159,
            flex: 0,
            suppressSizeToFit: true
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
            width: 177,
            minWidth: 177,
            flex: 0,
            suppressSizeToFit: true
          },
          {
            field: 'DistributionLevel',
            headerName: 'Distribution Level',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            width: 156,
            minWidth: 156,
            flex: 0,
            suppressSizeToFit: true
          },
          {
            field: 'DistributionOriginLevelType',
            headerName: 'Distribution Origin',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            width: 185,
            minWidth: 185,
            flex: 0,
            suppressSizeToFit: true
          },
          {
            field: 'DistributionMethodType',
            headerName: 'Distribution Method',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            width: 195,
            minWidth: 195,
            flex: 0,
            suppressSizeToFit: true
          },
          {
            field: 'DistributionRuleOption',
            headerName: 'Rule Option',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            width: 123,
            minWidth: 123,
            flex: 0,
            suppressSizeToFit: true
          },
          {
            field: 'DistributionRuleName',
            headerName: 'Distribution Rule',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            width: 174,
            minWidth: 174,
            flex: 0,
            suppressSizeToFit: true,
            tooltipField: 'DistributionRuleName',
            tooltipComponentParams: { color: '#ececec' },
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
            width: 189,
            minWidth: 189,
            flex: 0,
            suppressSizeToFit: true
          },
          {
            field: 'ChargeCode',
            headerName: 'Charge Code',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            width: 150,
            minWidth: 150,
            flex: 0,
            suppressSizeToFit: true
          },
          {
            field: 'ChargeCodeType',
            headerName: 'Charge Code Type',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            width: 182,
            minWidth: 182,
            flex: 0,
            suppressSizeToFit: true
          },
          {
            field: 'ChargeType',
            headerName: 'Charge Type',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            width: 148,
            minWidth: 148,
            flex: 0,
            suppressSizeToFit: true
          },
          {
            field: 'ChargeLocationType',
            headerName: 'Charge Location',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            width: 170,
            minWidth: 170,
            flex: 0,
            suppressSizeToFit: true
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
            field: 'BillingId',
            headerName: 'Billing ID',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            width: 115,
            minWidth: 115,
            cellClass: "ag-cell-add-btn",
            cellRenderer: function (params: any) {
              return params.data.AccrossInventory == true ? params.data.BillingId + '<div><button class="btn btn-primary grid-cell-btn" style="padding: 2px 8px; font-size: 10px; position: relative; top: -1px; margin-left: 5px;">Added</button></div>' : params.data.BillingId
            }
          },
          {
            field: 'MainAccountNumber',
            headerName: 'Main Account',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            width: 156,
            minWidth: 156,
            flex: 0,
            suppressSizeToFit: true
          },
          {
            field: 'SubAccountNumber',
            headerName: 'Sub Account',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            width: 149,
            minWidth: 149,
            flex: 0,
            suppressSizeToFit: true
          },
          {
            field: 'PayableAccountNumber',
            headerName: 'Payable Account',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            width: 172,
            minWidth: 172,
            flex: 0,
            suppressSizeToFit: true
          }
        ],
      }
    ];

    this.columnDefs2 = [

      {
        headerName: 'Account',
        children: [
          {
            field: 'BillingId',
            headerName: 'Billing ID',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            width: 128,
            minWidth: 128,
            flex: 0,
            cellClass: "ag-cell-add-btn",
            cellRenderer: function (params: any) {
              return params.data.AccrossInventory == true ? params.data.BillingId + '<div><button class="btn btn-primary grid-cell-btn" style="padding: 2px 8px; font-size: 10px; position: relative; top: -1px; margin-left: 5px;">Added</button></div>' : params.data.BillingId
            }
          },
          {
            field: 'AccrossInventoryDisplay',
            headerName: 'ID Added',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 121,
            width: 121
          },
          {
            field: 'AnotherAccountInventoryDisplay',
            headerName: 'Secondary Account',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 167
          },
          {
            field: 'PayableAccountNumber',
            headerName: 'Payable Account Number',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 204
          },
          {
            field: 'MainAccountNumber',
            headerName: 'Main Account',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'open',
            editable: false,
            minWidth: 140
          },
          {
            headerName: 'Sub Account',
            field: 'SubAccountNumber',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 149
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
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 164,
            cellStyle: { display: 'flex !important', 'justify-content': 'end', 'padding-right': '30px' },
            valueFormatter: (params: any) => this.currencyFormatter(params.data?.DistributionItemizedCharge, params?.data?.CurrencySymbol),

            // valueFormatter(params) {

            //   if (params?.data?.DistributionItemizedCharge) {
            //     var sansDec = params?.data?.DistributionItemizedCharge.toFixed(2);
            //     return params?.data?.CurrencySymbol + `${sansDec.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
            //   }
            //   return '';
            // }
          },
          {
            field: 'DistributionEventId',
            headerName: 'Distribution Event',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 181
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
            width: 177,
            flex: 0,
            minWidth: 177
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
            minWidth: 123
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
            minWidth: 210
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
      SubActionButtonRender: SubActionButtonRender
    }
  }

  currencyFormatter(currency: any, sign: any) {
    if(currency !== null && currency !== undefined) {
      var sansDec = currency.toFixed(2);
      // var formatted = sansDec.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return sign + `${sansDec.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
    } else {
      return '';
    }
  }

  redirect() {
    this.redirectTab.emit({ index: 0 });
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

    this.preDistributionDetails();
    // this.DistributionDetails();
  }
  openDialog(): void {
    this.dialog.open(this.DistributionGrid, {
      width: '900px',
      data: {
        colseButton: true,
      }
    });
  }

  openDisDetail(): void {
    this.dialog.open(this.DistributionDetail, {
      width: '900px',
      data: {
        colseButton: true,
      }
    });
  }

  preDistributionDetails() {
    const data: any = {};
    if (this.fromTab == 'true')
      data['IsFromChargeDistributionStep6'] = true;

    this._unsubscribePreDis.next(null);
    this.sandboxService.preDistributionDetails(this.sandBoxGridRowData.SBInvoiceId, this.clickedRecord[0].DistributionEventId, data).pipe(takeUntil(this._unsubscribePreDis)).subscribe((res: any) => {
      if (res.Success) {
        this.rowData = res.Data.$values;
        // _.map(this.rowData, (x: any) => {
        // const a = x;
        // a['DistributionAmountDistributed'] = (x.DistributionAmountDistributed) ? this.overviewData.CurrencySymbol + parseFloat(x['DistributionAmountDistributed']).toFixed(2) : `${this.overviewData.CurrencySymbol}0.00`;
        // a['DistributionAmountDifference'] = (x.DistributionAmountDifference) ? this.overviewData.CurrencySymbol + parseFloat(x['DistributionAmountDifference']).toFixed(2) : `${this.overviewData.CurrencySymbol}0.00`;

        // return a;
        // });
      }
    });
  }

  // DistributionDetails() {
  //   const data = {};
  //   if (this.fromTab == 'true')
  //     data['IsFromChargeDistributionStep6'] = true;
  //   this._unsubscribeDetail.next();
  //   this.sandboxService.DistributionDetails(this.sandBoxGridRowData.SBInvoiceId, this.clickedRecord.DistributionEventId, data).pipe(takeUntil(this._unsubscribeDetail)).subscribe((res: any) => {
  //     if (res.Success) {
  //       this.rowDataSecond = res.Data.$values;
  //       // _.map(this.rowDataSecond, (x: any) => {
  //       //   const a = x;
  //       //   a['DistributionItemizedCharge'] = (x.DistributionItemizedCharge) ? this.overviewData.CurrencySymbol + parseFloat(x['DistributionItemizedCharge']).toFixed(2) : `${this.overviewData.CurrencySymbol}0.00`;
  //       //   return a;
  //       // });
  //     }
  //   });
  // }

  ngOnDestroy() {
    this._unsubscribePreDis.next(null);
    this._unsubscribePreDis.complete();
    this._unsubscribeDetail.next(null);
    this._unsubscribeDetail.complete();
  }


  onBtnClick2(data: any) {
    this.onCellClicked.emit(true)
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
        if (this.fromTab == 'true')
          data['IsFromChargeDistributionStep6'] = true;

        data['sbInvoiceId'] = this.sandBoxGridRowData.SBInvoiceId;
        data['distributionEventId'] = this.clickedRecord[0].DistributionEventId;
        this.exportCustomerData = { ...this.exportCustomerDetail, ...data };
        this._unsubscribeDetail.next(null);
        this.sandboxService.DistributionDetails(data)
          .pipe(takeUntil(this._unsubscribeDetail))
          .subscribe(
            async (data: any) => {
              this.totalCount = data?.TotalCount;
              if (data && data.Data.$values.length > 0) {
                this.rowDataSecond = data.Data.$values;
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
    if (this.gridApi.api) {
      this.gridApi.api.setGridOption("serverSideDatasource", dataSource);
    } else {
      this.gridApi.setGridOption("serverSideDatasource", dataSource);
    }
  }

  onAgGridReadyEmit($event: any) {
    this.gridApi = $event.api;
    this.gridColumnApi = $event.columnApi;
  }

  exportExcel() {
    this.isDisabledExport = true;
    this.sandboxService.DistributionDetailsExcel(this.exportCustomerData)
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
