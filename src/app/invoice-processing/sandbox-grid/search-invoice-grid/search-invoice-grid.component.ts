import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import moment from 'moment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { LocationService } from 'src/app/services/location.service';
import { SandBoxService } from 'src/app/services/sandbox.service';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { AgGridTableComponent } from 'src/app/common/ag-grid-table/ag-grid-table.component';

@Component({
  selector: 'app-search-invoice-grid',
  templateUrl: './search-invoice-grid.component.html',
  styleUrls: ['./search-invoice-grid.component.scss'],
  imports: [SharedModule, PrimgModule, AgGridTableComponent]
})
export class SearchInvoiceGridComponent implements OnInit {

  private readonly _unsubscribeGRid = new Subject<void>();
  @Input() rowData: any;
  private _unsubscribeInvoice: Subject<any> = new Subject<any>();
  @Output() redirectInvoice: EventEmitter<any> = new EventEmitter<any>();

  constructor(private locationService: LocationService,
    public dialog: MatDialog,
    private sandboxService: SandBoxService) { }
  columnDefs: any = [];
  gridOptions = {
    rowModelType: 'serverSide',
    serverSideInfiniteScroll: true,
    enableFiltering: true,
    headerHeight: 35,
    groupHeaderHeight: 37,
    floatingFiltersHeight: 35
  };

  gridApi: any;

  defaultColDef: any = {
    editable: false,
    sortable: true,
    minWidth: 100,
    filter: true,
    resizable: true,
    floatingFilter: true,
    flex: 1,
  };
  sideBar: any = {
    toolPanels: ['columns', 'filters']/* ,
      defaultToolPanel: 'columns', */
  };
  selected: any = [];
  saveButtonLoadder: any;
  rowData1: any = [];
  public startDate: any;
  public endDate: any;

  ngOnInit(): void {
    let date = this.rowData.InvoiceBillDate.split("T")[0];
    let val = date.split('-');
    this.startDate = val[0] + '-' + val[1] + '-01';
    this.endDate = val[0] + '-' + val[1] + this.getLastDateOfMonth(val[0], val[1]);
  }
  getLastDateOfMonth(year: any, month: any) {
    // Create a date object for the first day of the next month
    const date = new Date(year, month, 0);
    // Return the last date of the current month
    return `-${date.getDate()}`;
  }
  addRetrieval() {
    const params = {
      redirect: true,
      type: 'add',
      data: this.rowData
    }
    this.redirectInvoice.emit(params);
  }

  ngAfterViewInit(): void {
    this.columnDefs = [
      {
        //headerName: ' ',
        headerCheckboxSelection: true,
        checkboxSelection: true,
        floatingFilter: true,
        suppressMenu: true,
        minWidth: 150,
        maxWidth: 50,
        width: 100,
        flex: 0,
        resizable: true,
        sortable: true,
        editable: false,
        filter: true,
        //autoHeight: true,
        suppressColumnsToolPanel: true,
      },
      {
        headerName: 'Organization',
        children: [

          {
            headerName: 'Customer',
            field: 'CustomerAccountName',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            minWidth: 150,
            flex: 0,
            editable: false,
          },
          {
            headerName: 'Company',
            field: 'CompanyName',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            width: 140,
            minWidth: 140,
            flex: 0,
            editable: false,
          }
        ]
      },
      {
        headerName: 'Account',
        children: [
          {
            headerName: 'Vendor',
            field: 'VendorAccountName',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 130,
            flex: 0
          },
          // {
          //   headerName: 'Account Number',
          //   field: 'PayableAccountNumber',
          //   columnGroupShow: 'close',
          //   editable: false,
          //   filter: 'agTextColumnFilter',
          //   minWidth: 200,
          //   flex: 0
          // },
          {
            headerName: 'Parent Vendor',
            field: 'ParentVendorAccountName',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 175,
            minWidth: 175,
            flex: 0
          },
          {
            headerName: 'Payable Vendor',
            field: 'PayableVendorAccountName',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 175,
            minWidth: 175,
            flex: 0
          },
          {
            headerName: 'Payable Account #',
            field: 'PayableAccountNumber',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 200,
            flex: 0
          },
          {
            headerName: 'Main Account #',
            field: 'MainAccountNumber',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 185,
            flex: 0
          },
          {
            headerName: 'Billing Period',
            field: 'BillingPeriod',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 170,
            flex: 0
          }
        ]
      },
      {
        headerName: 'Retrieval Record ',
        children: [

          {
            headerName: 'Record Status',
            field: 'RecordStatus',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            minWidth: 175,
            flex: 0,
            editable: false,
          },
          // {
          //   headerName: 'Company',
          //   field: 'ComapnyName',
          //   columnGroupShow: 'open',
          //   filter: 'agTextColumnFilter',
          //   width: 140,
          //   minWidth: 140,
          //   flex: 0,
          //   editable: false,
          // },
          {
            headerName: 'Processed Date',
            field: 'RecordProcessedDate',
            columnGroupShow: 'close',
            filter: 'agDateColumnFilter',
            minWidth: 180,
            flex: 0,
            editable: false,
          },
          {
            headerName: 'Bill Date',
            field: 'InvoiceBillDate',
            columnGroupShow: 'open',
            filter: 'agDateColumnFilter',
            width: 175,
            minWidth: 175,
            flex: 0,
            editable: false,
            valueFormatter: this.createDateFormatter,
          },
          {
            headerName: 'Payment Date',
            field: 'InvoicePaymentDate',
            columnGroupShow: 'open',
            filter: 'agDateColumnFilter',
            width: 175,
            minWidth: 175,
            flex: 0,
            valueFormatter: this.createDateFormatter,
            editable: false,
          },
          {
            headerName: 'Retrieval Dates Differ',
            field: 'RetrievalDatesDifferDisplay',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 225,
            flex: 0,
            editable: false,
          },
          {
            headerName: 'Payable Account is not Main Account',
            field: 'PayableAccountIsNotMainAccountDisplay',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 340,
            flex: 0,
            editable: false,
          },
          {
            headerName: 'Automated Processing',
            field: 'AutomatedProcessingDisplay',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 230,
            flex: 0,
            editable: false,
          },
        ]
      },
      {
        headerName: 'Invoice Retrieval',
        children: [
          {
            headerName: 'Retrieval Date',
            field: 'InvoiceRetrievalDate', valueGetter(params: any) {
              if (params.data && params.data.InvoiceRetrievalDate == null) {
                return '';
              }
              return moment(params.data?.InvoiceRetrievalDate).format('MM/DD/YYYY');
            },
            columnGroupShow: 'close',
            editable: false,
            filter: 'agDateColumnFilter',
            minWidth: 170,
            flex: 0
          },
          {
            headerName: 'Missing Date',
            field: 'InvoiceMissingDate', valueGetter(params: any) {
              if (params.data && params.data.InvoiceMissingDate == null) {
                return '';
              }
              return moment(params.data?.InvoiceMissingDate).format('MM/DD/YYYY');
            },
            columnGroupShow: 'close',
            editable: false,
            filter: 'agDateColumnFilter',
            minWidth: 165,
            flex: 0
          },
          {
            headerName: 'Received Date',
            field: 'InvoiceReceivedDate',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agDateColumnFilter',
            width: 175,
            minWidth: 175,
            valueFormatter: this.createDateFormatter,
            flex: 0
          },
          {
            headerName: 'Processed Date',
            field: 'InvoiceProcessedDate',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agDateColumnFilter',
            width: 180,
            minWidth: 180,
            flex: 0,
            valueFormatter: this.createDateFormatter,
          },
          {
            headerName: 'Invoice Source',
            field: 'InvoiceSource',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 175,
            minWidth: 175,
            flex: 0
          },
          {
            headerName: 'Retrieval Method',
            field: 'InvoiceRetrievalMethod',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 195,
            flex: 0
          },
          {
            headerName: 'URL',
            field: 'InvRetrievalWebUrl',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 105,
            minWidth: 105,
            flex: 0
          },
          {
            headerName: 'Username',
            field: 'InvRetrievalWebLogin',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 145,
            minWidth: 145,
            flex: 0
          },
          {
            headerName: 'Password Manager',
            field: 'InvRetrievalPasswordManagerUrlLink',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 205,
            flex: 0
          },
          {
            headerName: 'Email',
            field: 'InvRetrievalEmail',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 115,
            minWidth: 115,
            flex: 0
          },
          {
            headerName: 'Notes',
            field: 'InvRetrievalNoteText',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 115,
            minWidth: 115,
            flex: 0
          },
        ]
      },
      {
        headerName: 'Data Retrieval',
        children: [
          {
            headerName: 'Retrieval Date',
            field: 'DataRetrievalDate',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agDateColumnFilter',
            minWidth: 170,
            flex: 0,
            valueFormatter: this.createDateFormatter,
          },
          {
            headerName: 'Missing Date',
            field: 'DataMissingDate',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agDateColumnFilter',
            minWidth: 165,
            flex: 0,
            valueFormatter: this.createDateFormatter,
          },
          {
            headerName: 'Received Date',
            field: 'DataReceivedDate',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agDateColumnFilter',
            width: 175,
            minWidth: 175,
            flex: 0,
            valueFormatter: this.createDateFormatter,
          },
          {
            headerName: 'Processed Date',
            field: 'DataProcessedDate',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agDateColumnFilter',
            width: 180,
            minWidth: 180,
            flex: 0,
            valueFormatter: this.createDateFormatter,
          },
          {
            headerName: '# Required Files',
            field: 'RequiredFiles',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 185,
            flex: 0
          },
          {
            headerName: '# Optional Files',
            field: 'OptionalFiles',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 185,
            flex: 0
          },
          {
            headerName: 'Multiple Retrieval Methods',
            field: 'MultipleRetrievalMethodsDisplay',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 260,
            flex: 0
          },
          {
            headerName: 'Data Source',
            field: 'DataRetrievalSource',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 160,
            minWidth: 160,
            flex: 0
          },
          {
            headerName: 'Retrieval Method',
            field: 'DataRetrievalMethod',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 195,
            flex: 0
          },
          {
            headerName: 'Processing Method',
            field: 'DataRetrievalProcessingMethodDisplay',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 210,
            flex: 0
          },
          {
            headerName: 'Template Type',
            field: 'DataRetrievalTemplateType',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 175,
            minWidth: 175,
            flex: 0
          },
          {
            headerName: 'URL',
            field: 'DataRetrievalWebUrl',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 105,
            minWidth: 105,
            flex: 0
          },
          {
            headerName: 'Username',
            field: 'DataRetrievalWebLogin',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 145,
            minWidth: 145,
            flex: 0
          },
          {
            headerName: 'Password Manager',
            field: 'DataRetrievalPasswordManagerUrlLink',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 205,
            flex: 0
          },
          {
            headerName: 'Email',
            field: 'DataRetrievalEmail',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 115,
            minWidth: 115,
            flex: 0
          },
          {
            headerName: 'Notes',
            field: 'DataRetrievalNoteText',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 115,
            minWidth: 115,
            flex: 0
          }
        ]
      },
    ];

  }
  onAgGridReady($event: any, months?: any) {
    this.gridApi = $event;
    let dataSource: any = {
      rowCount: null,
      getRows: (params: any) => {

        let paramsRequest = params['request'];
        const filterArray: any = [];
        const filterArrayDate: any = [];

        for (var key in paramsRequest.filterModel) {
          let data = paramsRequest.filterModel[key];
          let arr;
          let arrDate;
          if (key === 'DataProcessedDate' || key === 'InvoiceBillDate' || key === 'InvoicePaymentDate' || key === 'InvoiceRetrievalDate' || key === 'InvoiceMissingDate' || key === 'InvoiceReceivedDate' || key === 'InvoiceProcessedDate' || key === 'DataRetrievalDate' || key === 'DataMissingDate' || key === 'DataReceivedDate') {
            arrDate = {
              filterKey: key,
              filterOptionType1: data['type'] ? data['type'] : data['condition1'].type ? data['condition1'].type : null,
              filterOptionValue1: (data && data.dateFrom) ? data.dateFrom.split(' ')[0].toString() : (data['condition1'] && data['condition1']['dateFrom']) ? data['condition1'].dateFrom.split(' ')[0].toString() : null,
              filterOptionValue1_2: (data && data.dateTo) ? data.dateTo.split(' ')[0].toString() : (data['condition1'] && data['condition1']['dateTo']) ? data['condition1']?.dateTo.split(' ')[0].toString() : null,
              filterOperationType: data['operator'] ? data['operator'] : 'AND',
              filterOptionType2: data['condition2']?.type ? data['condition2']?.type : null,
              filterOptionValue2: (data['condition2'] && data['condition2'].dateFrom) ? data['condition2']?.dateFrom.split(' ')[0].toString() : null,
              filterOptionValue2_2: (data['condition2'] && data['condition2'].dateTo) ? data['condition2']?.dateTo.split(' ')[0].toString() : null
            }
            filterArrayDate.push(arrDate);
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
          maximumRows: 100,
          advanceFilter: [
            {
              "filterKey": "ExpectedInvoiceDataStatusCode",
              "filterOptionType1": "equals",
              "filterOptionValue1": "OPEN",
              "filterOperationType": "OR",
              "filterOptionType2": "equals",
              "filterOptionValue2": "MISSING"
            },
            {
              "filterKey": "CustomerAccountName",
              "filterOptionType1": "equals",
              "filterOptionValue1": this.rowData.CustomerAccountName,
              "filterOperationType": "AND",
              "filterOptionType2": null,
              "filterOptionValue2": null
            },
            {
              "filterKey": "PayableAccountNumber",
              "filterOptionType1": "equals",
              "filterOptionValue1": this.rowData.PayableBillingAccountNumber,
              "filterOperationType": "AND",
              "filterOptionType2": null,
              "filterOptionValue2": null
            }
          ],
          advanceDateFilter: [{
            "filterKey": "InvoiceBillDate",
            "filterOptionType1": "inRange",
            "filterOptionValue1": this.startDate,
            "filterOptionValue1_2": this.endDate,
            "filterOperationType": "AND",
            "filterOptionType2": null,
            "filterOptionValue2": null,
            "filterOptionValue2_2": null
          }]
        };

        if (filterArrayDate && filterArrayDate.length > 0) {
          data['advanceDateFilter'] = filterArrayDate;
        }

        if (filterArray && filterArray.length > 0) {
          data['advanceFilter'] = filterArray;
        }
        if (paramsRequest.sortModel.length > 0) {

          Object.values(params['columnApi']['columnController']['columnDefs']).forEach((key: any) => {
            if (key['children']) {
              Object.values(key['children']).forEach((k: any) => {
                if (k['field'] === paramsRequest.sortModel[0].colId) {
                  data['OrderBy'] = k['field'];
                  data['SortOrder'] = paramsRequest.sortModel[0].sort;

                }
              });
            }
          });
        }

        this.locationService
          .getInvoiceRetrieval('all', data)
          .pipe(takeUntil(this._unsubscribeGRid))
          .subscribe(
            async (data: any) => {
              if (data && data.Data.$values.length > 0) {

                this.rowData1 = data.Data.$values;
                let lastRow = -1;
                if (data.TotalCount <= paramsRequest.startRow + 100) {
                  lastRow = data.TotalCount;
                }
                params.success({
                  rowData: data.Data.$values,
                  rowCount: lastRow
                });
                // this.rowData.length > 0 ? this.rowDataExist.emit(true) : this.rowDataExist.emit(false); 
              } else {
                params.success({
                  rowData: [],
                  rowCount: 0
                });
                this.gridApi.showNoRowsOverlay();
              }
            },
            (error) => {
              this.rowData1 = [];
              params.success({
                  rowData: [],
                  rowCount: 0
                });
              this.gridApi.showNoRowsOverlay();
              // this.stopSpinner = true;
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
  createDateFormatter(params: any) {
    if (params && params.value) {
      let date = new Date(params.value);
      return moment(date).format('MM/DD/YYYY');
    } else {
      return '';
    }
  }
  onSelectionChanged(event: any) {
    this.selected = event;
  }

  save() {
    this._unsubscribeInvoice.next(null);
    this.sandboxService.sandboxinvoiceRetreival(this.rowData.SBInvoiceId, this.selected[0].ExpectedInvoiceId).pipe(takeUntil(this._unsubscribeInvoice)).subscribe((data: any) => {
      this.ErrorWarningPopupOpen(data.Message)
    });
  }

  ErrorWarningPopupOpen(message: any) {
    let errorData: any = {
      messgeType: "error",
      title: "Attention",
      titleClass: "text-c-blue",
      icon: "fas fa-exclamation-circle",
      iconClass: "text-c-blue f-70",
      message: message //if messges is multiple use array
    }
    const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
    return
  }
}
