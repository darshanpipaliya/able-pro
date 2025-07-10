import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import moment from 'moment';
import { MatDialog } from '@angular/material/dialog';
import { InvoiceForecastingUploadComponent } from './invoice-forecasting-upload/invoice-forecasting-upload.component';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import * as _ from 'lodash';
import { LocationService } from '../services/location.service';
import { isValueExist, isValuesUndefined } from '../services/helper';
import { ErrorWarningPopupComponent } from '../common/error-warning-popup/error-warning-popup.component';
import { SharedModule } from '../demo/shared/shared.module';
import { AgGridModule } from 'ag-grid-angular';
import { AgGridTableComponent } from '../common/ag-grid-table/ag-grid-table.component';
import { ModuleRegistry, ServerSideRowModelModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([ServerSideRowModelModule]);

@Component({
  selector: 'app-invoice-retrieval',
  templateUrl: './invoice-retrieval.component.html',
  styleUrls: ['./invoice-retrieval.component.scss'],
  imports: [SharedModule, AgGridModule, AgGridTableComponent],

})
export class InvoiceRetrievalComponent implements OnInit, AfterViewInit {

  @Output() rowCellDoubleClicked: EventEmitter<any> = new EventEmitter();
  @Output() clickEditInvRitriBillingAc: EventEmitter<any> = new EventEmitter();
  @Output() onAgGridReadyRetrivalEmit: EventEmitter<any> = new EventEmitter();
  @Output() selectedTemValue: EventEmitter<any> = new EventEmitter();
  @Input() selectedTemIR: any;
  @Input() selectedMonth: any;
  @Input() pageName: any;
  @Output() exportExcelData: EventEmitter<any> = new EventEmitter();
  @Output() rowDataExist: EventEmitter<any> = new EventEmitter();

  public exportInvoiceRetrieval: any;
  public exportInvoiceRDetail: any;
  isFilterData = false;

  frameworkComponents: any
  @ViewChild('actionicons', { static: false }) actionicons: TemplateRef<any>;
  @ViewChild('IIconTooltip') IIconTooltip!: TemplateRef<any>;


  columnDefs: any = [];
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
    },
  };

  gridApi: any;
  rowSelection: any = 'multiple';
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
  rowData: any = [];
  stopSpinner: boolean = false;
  downloadFileDisabled: boolean = false;
  selectedTem: string = 'all';
  private readonly getAllCustomerListByTEMId = new Subject<void>();
  private readonly _unsubscribeGRid = new Subject<void>();
  private readonly _unsubscribeTemLists = new Subject<void>();
  private readonly _unsubscribeDownloadInvoice = new Subject<void>();
  invoiceDataCount = 0;

  tems: any;
  isSuperTEMManager: boolean;
  isSuperTEMAdmin: boolean;
  isSuperTEMUsers: boolean;
  constructor(private locationService: LocationService, public dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.isSuperTEMManager = this.locationService.isUserHasSuperTEMManagerRole();
    this.isSuperTEMAdmin = this.locationService.isUserHasSuperTEMAdminRole();
    this.isSuperTEMUsers = this.locationService.isUserHasSuperTEMUsersRole();
    if (this.isSuperTEMUsers) {
      this.getTemLists();
    }
  }

  ngAfterViewInit(): void {

    if (this.pageName === 'Invoice Retrievals') {
      this.columnDefs = [
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
              flex: 0
            },
            {
              headerName: 'Payable Account Number',
              field: 'PayableAccountNumber',
              columnGroupShow: 'close',
              editable: false,
              filter: 'agTextColumnFilter',
              minWidth: 151,
              width: 151,
              flex: 0
            },
            {
              headerName: 'Main Account Number',
              field: 'MainAccountNumber',
              columnGroupShow: 'open',
              editable: false,
              filter: 'agTextColumnFilter',
              minWidth: 165,
              width: 160,
              flex: 0
            },
            {
              headerName: 'Billing Period',
              field: 'BillingPeriod',
              columnGroupShow: 'close',
              editable: false,
              filter: 'agTextColumnFilter',
              minWidth: 165,
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
              minWidth: 165,
              flex: 0,
              editable: false,
            },
            {
              headerName: 'Invoice Status',
              field: 'ExpectedInvoiceStatusDisplay',
              columnGroupShow: 'close',
              filter: 'agTextColumnFilter',
              minWidth: 155,
              flex: 0,
              editable: false,
            },
            {
              headerName: 'Data Status',
              field: 'ExpectedInvoiceDataStatusDisplay',
              columnGroupShow: 'close',
              filter: 'agTextColumnFilter',
              minWidth: 145,
              flex: 0,
              editable: false,
            },
            {
              headerName: 'Processed Date',
              field: 'DataProcessedDate',
              columnGroupShow: 'close',
              filter: 'agDateColumnFilter',
              minWidth: 170,
              flex: 0,
              editable: false,
              valueFormatter: this.createDateFormatter,
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
              headerName: 'Pay By Date',
              // headerName: 'Payment Date',
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
            }
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
              headerName: 'Data Source',
              field: 'DataRetrievalSource',
              columnGroupShow: 'open',
              editable: false,
              filter: 'agTextColumnFilter',
              width: 160,
              minWidth: 160,
              flex: 0
            },
            // {
            //   headerName: 'Notes',
            //   field: 'DataRetrievalNoteText',
            //   columnGroupShow: 'open',
            //   editable: false,
            //   filter: 'agTextColumnFilter',
            //   width: 115,
            //   minWidth: 115,
            //   flex: 0
            // }
          ]
        }
      ];
    } else {
      this.columnDefs = [
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
              // minWidth: 175,
              flex: 0
            },
            {
              headerName: 'Payable Acct',
              field: 'PayableAccountNumber',
              columnGroupShow: 'close',
              editable: false,
              filter: 'agTextColumnFilter',
              minWidth: 151,
              width: 151,
              flex: 0
            },
            {
              headerName: 'Main Acct',
              field: 'MainAccountNumber',
              columnGroupShow: 'open',
              editable: false,
              filter: 'agTextColumnFilter',
              minWidth: 165,
              width: 160,
              flex: 0
            },
            {
              headerName: 'Billing Period',
              field: 'BillingPeriod',
              columnGroupShow: 'close',
              editable: false,
              filter: 'agTextColumnFilter',
              minWidth: 165,
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
              minWidth: 165,
              flex: 0,
              editable: false,
            },
            {
              headerName: 'Invoice Status',
              field: 'ExpectedInvoiceStatusDisplay',
              columnGroupShow: 'close',
              filter: 'agTextColumnFilter',
              minWidth: 155,
              flex: 0,
              editable: false,
            },
            {
              headerName: 'Data Status',
              field: 'ExpectedInvoiceDataStatusDisplay',
              columnGroupShow: 'close',
              filter: 'agTextColumnFilter',
              minWidth: 145,
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
              minWidth: 170,
              flex: 0,
              editable: false,
              valueFormatter: this.createDateFormatter,
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
              headerName: 'Pay By Date',
              // headerName: 'Payment Date',
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
              headerName: 'Password Manager',
              field: 'InvRetrievalPasswordManagerUrlLink',
              columnGroupShow: 'open',
              editable: false,
              filter: 'agTextColumnFilter',
              minWidth: 205,
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
              headerName: 'Password Manager',
              field: 'DataRetrievalPasswordManagerUrlLink',
              columnGroupShow: 'open',
              editable: false,
              filter: 'agTextColumnFilter',
              minWidth: 205,
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


    let headerData: any = [];
    let ChildHeaderData: any = [];
    let i = 0;
    let childIndex = 0;
    _.map(this.columnDefs, (x: any) => {
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
    // headerData.pop();
    // ChildHeaderData.pop();
    this.exportInvoiceRDetail = {
      ExportToExcelData: {
        HeaderData: headerData,
        ChildHeaderData: ChildHeaderData,
        fileName: "Invoice Retrieval"
      },
      ExportToExcel: true
    };
    this.exportInvoiceRetrieval = this.exportInvoiceRDetail;
  }
  toggle() {
    this.onAgGridReady(this.gridApi)
  }
  getInvoiceRetrivalData(months: any = 'all', selectedTem = 'all') {
    this.onAgGridReady(this.gridApi, months)
  }


  openDialog() {
    const dialogRef = this.dialog.open(this.IIconTooltip, {
      width: '900px',
      data: {
        colseButton: true,
      }
    });
    dialogRef.afterClosed().subscribe((result) => {
    });
  }

  onAgGridReady($event: any, months?: any) {

    if (!this.selectedMonth) {
      this.selectedMonth = 3;
    }
    let monthVal = months ? months : this.selectedMonth;
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
        };

        if (filterArrayDate && filterArrayDate.length > 0) {
          data['advanceDateFilter'] = filterArrayDate;
        }
        if (!this.isFilterData) {
          filterArray.push({
            "filterKey": "RecordStatus",
            "filterOptionType1": "equals",
            "filterOptionValue1": "Missing",
            "filterOperationType": "OR",
            "filterOptionType2": "equals",
            "filterOptionValue2": "Open"
          });
          data['OrderBy'] = 'InvoiceBillDate';
          data['SortOrder'] = 'asc';
        }
        if (filterArray && filterArray.length > 0) {
          data['advanceFilter'] = filterArray;
        }

        if (this.selectedTemIR && this.selectedTemIR !== 'all') {
          data['TemAccountId'] = parseInt(this.selectedTemIR);
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
        this.exportInvoiceRetrieval = { ...this.exportInvoiceRDetail, ...data };
        this.exportExcelData.emit({ exportInvoiceRetrieval: this.exportInvoiceRetrieval, monthVal: monthVal });
        this._unsubscribeGRid.next();
        this.locationService
          .getInvoiceRetrieval(monthVal, data)
          .pipe(takeUntil(this._unsubscribeGRid))
          .subscribe(
            async (data: any) => {
              this.invoiceDataCount = _.cloneDeep(data?.TotalCount);

              if (data && data.Data.$values.length > 0) {
                this.selectedTemValue.emit(this.selectedTemIR);
                this.rowData = data.Data.$values;
                let lastRow = -1;
                if (data.TotalCount <= paramsRequest.startRow + 100) {
                  lastRow = data.TotalCount;
                }

                params.success({
                  rowData: data.Data.$values,
                  rowCount: lastRow
                });

                this.rowData.length > 0 ? this.rowDataExist.emit(true) : this.rowDataExist.emit(false);
              } else {
                params.success({
                  rowData: [],
                  rowCount: 0
                });
                this.gridApi.showNoRowsOverlay();
              }
            },
            (error) => {
              this.rowData = [];
              this.stopSpinner = true;
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
      this.gridApi.api!.setGridOption("serverSideDatasource", dataSource);
    } else {
      this.gridApi!.setGridOption("serverSideDatasource", dataSource);
    }
  }

  editBillingAccount(data: any) {
    data.data = data;
    this.clickEditInvRitriBillingAc.emit(data);
  }
  downloadFile(data: any) {

    this.downloadFileDisabled = true;
    this._unsubscribeDownloadInvoice.next();
    this.locationService.DownloadInvoiceAttachment(data.ExpectedInvoiceID).pipe(takeUntil(this._unsubscribeDownloadInvoice)).subscribe({
      next: dataa => {
        this.downloadFileDisabled = false
        let bolbUrl = URL.createObjectURL(dataa);
        var link = document.createElement("a");
        link.setAttribute("href", bolbUrl);
        link.setAttribute("download", data.AttachmentFilePath.split('\\')[7]);
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);


      },
      error: error => {
        this.downloadFileDisabled = false
      }
    });
  }

  removeAttachment(data: any) {

    let errorData: any = {
      okBtnName: "Delete",
      closeBtnName: "Cancel",
      messgeType: "error",
      title: "Attention",
      titleClass: "text-c-blue",
      icon: "fas fa-exclamation-circle",
      iconClass: "text-c-blue f-70",
      message: 'You are about to delete this Bill Image record.  Continue?'
    };
    const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
    dialogRef.afterClosed().subscribe(result => {
      if (!isValuesUndefined(result)) {
        if (result) {
          this.locationService.removeInvoiceAttachment(data.ExpectedInvoiceID).subscribe({
            next: data => {
              if (data) {
                let errorData: any = {
                  messgeType: "error",
                  title: "Attention",
                  titleClass: "text-c-blue",
                  icon: "fas fa-exclamation-circle",
                  iconClass: "text-c-blue f-70",
                  message: 'Deleted Successfully'
                };
                const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
                dialogRef.afterClosed().subscribe(result => {
                  if (!isValuesUndefined(result)) {
                    this.getInvoiceRetrivalData(this.selectedMonth);
                  }
                });
              }
            },
            error: error => {
              if (error.status === 404) {
                let errorData: any = {
                  messgeType: "error",
                  title: "Attention",
                  titleClass: "text-c-blue",
                  icon: "fas fa-exclamation-circle",
                  iconClass: "text-c-blue f-70",
                  message: error.error
                };
                const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
                dialogRef.afterClosed().subscribe(result => {
                  this.getInvoiceRetrivalData(this.selectedMonth);
                });
              }
            }
          });
        }
      }
    });
  }
  invoiceUpload(data: any) {
    const dialogRef = this.dialog.open(InvoiceForecastingUploadComponent, { data: data, panelClass: 'width-665' });
    dialogRef.afterClosed().subscribe(result => {
      if (result !== false) {
        this.getInvoiceRetrivalData(this.selectedMonth);
      }
    });
  }


  invoiceRetrievalDeactive(data: any) {

    let errorData: any = {
      okBtnName: "Delete",
      closeBtnName: "Cancel",
      messgeType: "error",
      title: "Attention",
      titleClass: "text-c-blue",
      icon: "fas fa-exclamation-circle",
      iconClass: "text-c-blue f-70",
      message: 'You are about to delete this retrieval record.  Continue?'
    };
    const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
    dialogRef.afterClosed().subscribe(result => {
      if (!isValuesUndefined(result)) {
        if (result) {
          this.locationService.invoiceRetrievalDeactive(data.ExpectedInvoiceID).subscribe({
            next: data => {
              if (data) {
                let errorData: any = {
                  messgeType: "error",
                  title: "Attention",
                  titleClass: "text-c-blue",
                  icon: "fas fa-exclamation-circle",
                  iconClass: "text-c-blue f-70",
                  message: 'Deleted Successfully'
                };
                const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
                dialogRef.afterClosed().subscribe(result => {
                  if (!isValuesUndefined(result)) {
                    this.getInvoiceRetrivalData(this.selectedMonth);
                  }
                });
              }
            },
            error: error => {
              if (error.status === 404) {
                let errorData: any = {
                  messgeType: "error",
                  title: "Attention",
                  titleClass: "text-c-blue",
                  icon: "fas fa-exclamation-circle",
                  iconClass: "text-c-blue f-70",
                  message: error.error
                };
                const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
                dialogRef.afterClosed().subscribe(result => {
                  this.getInvoiceRetrivalData(this.selectedMonth);
                });
              }
            }
          });
        }
      }
    });
  }

  ngOnDestroy(): any {
    this.getAllCustomerListByTEMId.next();
    this._unsubscribeGRid.next();
    this._unsubscribeGRid.complete();
    this._unsubscribeTemLists.next();
    this._unsubscribeTemLists.complete();
    this._unsubscribeDownloadInvoice.next();
    this._unsubscribeDownloadInvoice.complete();
  }


  getTemLists() {
    this._unsubscribeTemLists.next();
    this.locationService.getTemLists().pipe(takeUntil(this._unsubscribeTemLists)).subscribe((data) => {
      if (data && data.$values) {
        this.tems = data.$values;
      }
    }, error => {
      this.tems = [];
    });
  }

  filterCustomerGridByTEMId(selectedTem: any) {
    this.selectedTem = selectedTem;
    this.onAgGridReady(this.gridApi)
  }

  onCellDoubleClicked($event: any) {
    this.rowCellDoubleClicked.emit($event);
  }

  onAgGridReadyEmit($event: any) {
    this.onAgGridReadyRetrivalEmit.emit($event);
  }

  createDateFormatter(params: any) {
    if (params && params.value) {
      let date = new Date(params.value);
      return moment(date).format('MM/DD/YYYY');
    } else {
      return '';
    }
  }

}
