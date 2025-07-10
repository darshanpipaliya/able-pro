import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import moment from 'moment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import _ from 'lodash';
import { MatDialog } from '@angular/material/dialog';
import { SessionStorageService } from '../services/session-storage.service';
import { FinanceInvoicesService } from '../services/finance-invoices.service';
import { InvoiceService } from '../services/invoice.service';
import { LocalStorageService } from '../services/local-storage.service';
import { LocationService } from '../services/location.service';
import { isValueExist, rolePermission } from '../services/helper';
import { AddInvoiceNoteComponent } from '../add-invoice-note/add-invoice-note.component';
import { FinanceInvoiceSummaryComponent } from '../finance-invoice-summary/finance-invoice-summary.component';
import { InvoiceNotesComponent } from '../invoice-notes/invoice-notes.component';
import { SharedModule } from '../demo/shared/shared.module';

import { ClientSideRowModelModule, ModuleRegistry, ServerSideRowModelModule } from 'ag-grid-enterprise';
import { AgGridModule } from 'ag-grid-angular';
import { AgGridTableComponent } from '../common/ag-grid-table/ag-grid-table.component';
import { InvoiceMainComponent } from '../common/invoice-main/invoice-main.component';
import { NewDistributionInvoiceComponent } from '../new-distribution-invoice/new-distribution-invoice.component';
import { PrimgModule } from '../demo/shared/primeng.module';
import { DistributionEngineCIComponent } from '../distribution-engine-c-i/distribution-engine-c-i.component';
import { DistributionDetailDIComponent } from '../common/distribution-detail-d-i/distribution-detail-d-i.component';
import { AllocationsByProductComponent } from '../common/allocations-by-product/allocations-by-product.component';
import { AllocationsByStructureComponent } from '../allocations-by-structure/allocations-by-structure.component';
import { CostCenterStructureEngineComponent } from '../cost-center-structure-engine/cost-center-structure-engine.component';

ModuleRegistry.registerModules([ServerSideRowModelModule, ClientSideRowModelModule]);
@Component({
  selector: 'app-invoices-module',
  imports: [SharedModule, PrimgModule , AgGridModule, AgGridTableComponent, FinanceInvoiceSummaryComponent, InvoiceNotesComponent, InvoiceMainComponent, DistributionDetailDIComponent, AllocationsByProductComponent, AllocationsByStructureComponent,
    NewDistributionInvoiceComponent, DistributionEngineCIComponent, CostCenterStructureEngineComponent
  ],
  providers: [InvoiceService],
  templateUrl: './invoices-module.component.html',
  styleUrl: './invoices-module.component.scss'
})
export class InvoicesModuleComponent {

  public modules = [ClientSideRowModelModule, ServerSideRowModelModule];
  stopSpinner: boolean = false;
  hasAccess: boolean = false;
  loadingCustomerAPI: boolean = false;
  isDisabledExport: boolean = false;
  isShowExport: boolean = false;
  isShowHeader: boolean = false;
  isShowInvoiceSummary: boolean = false;
  isShowInvoiceSummaryExportDisable: boolean = false;
  isDisableExportAllocation: boolean = false;

  isInvoiceSummaryLoading: boolean = false;
  isInvoiceSummaryChildren: boolean = false;
  isInvoiceNotes: boolean = false;
  isccsDataExist: boolean = false;
  isccsDataExport: boolean = false;
  isFilterData = false;
  isSuperTem = false;
  CustomerAdmin = false;
  isTemUser = false;
  isRerunAccess = false;
  
  @ViewChild(InvoiceNotesComponent) private invoiceNotesComponent: InvoiceNotesComponent;
  @ViewChild('tooltipText') tooltipText!: TemplateRef<any>;

  clickedRowData : any;
  public exportCCsData: any;
  public editRecord : any;
  rowData: any = [];
  tems: any = [];
  filterdTems: any = [];
  customers: any = [];

  selectedTem: any = 'all';
  selectedCustomer: string = 'all';
  selectedTemDD: any;
  gridApi: any;
  gridColumnApi: any;
  selectedTab: any = 0;
  selectedTabChildren: any = 0;
  invoiceSummaryRowData: any;
  isForEditDistribution: any; ;
  selectedSummary = 0;
  allocationTypeValue: any;;
  isAddClicked = false;
  temRoles = false;
  invoiceOvervewData: any;

  invoiceDataCount = 0;
  sideBar: any = {
    toolPanels: ['columns', 'filters'],
  };

  defaultColDef = {
    sortable: true,
    minWidth: 100,
    filter: true,
    resizable: true,
    floatingFilter: true,
    flex: 1
  };
  gridOptions = {
    rowModelType: 'serverSide',
    rowSelection: {
      type: 'multiple',
      enableClickSelection: true
    },
    headerHeight: 35,
    groupHeaderHeight: 37,
    floatingFiltersHeight: 35
  };

  columnDefs: any = [
    {
      headerName: 'Status',
      children: [
        {
          headerName: 'Invoice Status',
          field: 'InvoiceStatusDisplayText',
          filter: 'agTextColumnFilter',
          editable: false,
          columnGroupShow: 'close',
          minWidth: 148,
          flex: 0,
          resizable: true,
          sortingFiled: 'InvoiceStatus'
        }
      ],
    },
    {
      headerName: 'Organization',
      children: [
        {
          field: 'CustomerAccountName',
          headerName: 'Customer',
          columnGroupShow: 'close',
          editable: false,
          filter: 'agTextColumnFilter',
          minWidth: 200,
          flex: 0,
          resizable: true,
          sortingFiled: 'CustomerAccountName'
        },
        {
          field: 'TEMAccountName',
          headerName: 'TEM',
          columnGroupShow: 'open',
          editable: false,
          filter: 'agTextColumnFilter',
          minWidth: 150,
          flex: 0,
          resizable: true,
          sortingFiled: 'TEMAccountName'
        }
      ],
    },
    {
      headerName: 'Vendor',
      children: [
        {
          field: 'VendorAccountName',
          headerName: 'Vendor',
          columnGroupShow: 'close',
          editable: false,
          filter: 'agTextColumnFilter',
          minWidth: 125,
          flex: 0,
          resizable: true,
          sortingFiled: 'VendorAccountName'
        },
        {
          field: 'ParentVendorAccountName',
          headerName: 'Parent Vendor',
          columnGroupShow: 'open',
          editable: false,
          filter: 'agTextColumnFilter',
          minWidth: 165,
          flex: 0,
          resizable: true,
          sortingFiled: 'ParentVendorAccountName'
        },
        {
          field: 'PayableVendor',
          headerName: 'Payable Vendor',
          columnGroupShow: 'open',
          editable: false,
          filter: 'agTextColumnFilter',
          minWidth: 160,
          flex: 0,
          resizable: true,
          sortingFiled: 'ParentVendorAccountName'
        },
      ],
    },
    {
      headerName: 'Account',
      children: [
        {
          field: 'PayableAccountNumber',
          headerName: 'Payable Account Number',
          columnGroupShow: 'close',
          editable: false,
          filter: 'agTextColumnFilter',
          minWidth: 245,
          flex: 0,
          resizable: true,
          sortingFiled: 'PayableAccountNumber'
        },
        {
          field: 'BillingAccountStatus',
          headerName: 'Account Status',
          columnGroupShow: 'open',
          editable: false,
          filter: 'agTextColumnFilter',
          minWidth: 154,
          flex: 0,
          resizable: true,
          sortingFiled: 'BillingAccountStatus'
        },
        {
          field: 'InvoiceStartDate',
          headerName: 'Invoice Start Date',
          resizable: true,
          editable: false,
          columnGroupShow: 'open',
          filter: 'agDateColumnFilter',
          minWidth: 200,
          sortingFiled: 'InvoiceStartDate',
          valueGetter(params : any) {
            if (params.data?.InvoiceStartDate) {
              return moment(params.data?.InvoiceStartDate).format('MM/DD/YYYY');
            }
            return '';
          }
        }
      ],
    },
    {
      headerName: 'Invoice',
      children: [
        {
          headerName: 'Invoice Number',
          field: 'InvoiceNumber',
          columnGroupShow: 'close',
          filter: 'agTextColumnFilter',
          editable: false,
          minWidth: 180,
          flex: 0,
          resizable: true,
          sortingFiled: 'InvoiceNumber'
        }
      ],
    },
    {
      headerName: 'Dates',
      children: [
        {
          headerName: 'Pay By Date',
          field: 'PayByDate',
          filter: 'agDateColumnFilter',
          editable: false,
          columnGroupShow: 'close',
          minWidth: 140,
          flex: 0,
          resizable: true,
          sortingFiled: 'PayByDate',
          valueGetter(params: { data: { PayByDate: any; }; }) {
            if (params.data?.PayByDate) {
              return moment(params.data.PayByDate).format('MM/DD/YYYY');
            }
            return '';
          }
        },
        {
          headerName: 'Invoice Date',
          field: 'InvoiceBillDate',
          columnGroupShow: 'close',
          filter: 'agDateColumnFilter',
          editable: false,
          minWidth: 140,
          flex: 0,
          resizable: true,
          sortingFiled: 'InvoiceBillDate',
          valueGetter(params: { data: { InvoiceBillDate: any; }; }) {
            if (params.data?.InvoiceBillDate) {
              return moment(params.data.InvoiceBillDate).format('MM/DD/YYYY');
            }
            return '';
          }
        },
        {
          headerName: 'Billing Period',
          field: 'BillingPeriod',
          columnGroupShow: 'close',
          filter: 'agTextColumnFilter',
          editable: false,
          minWidth: 145,
          flex: 0,
          resizable: true,
          sortingFiled: 'BillingPeriod',
        },
        {
          headerName: 'Uploaded Date',
          field: 'UploadedDate',
          columnGroupShow: 'open',
          filter: 'agDateColumnFilter',
          editable: false,
          minWidth: 175,
          flex: 0,
          resizable: true,
          sortingFiled: 'UploadedDate',
          valueGetter(params: { data: { UploadedDate: any; }; }) {
            if (params.data?.UploadedDate) {
              return moment(params.data.UploadedDate).format('MM/DD/YYYY');
            }
            return '';
          }
        }
      ],
    },
    {
      headerName: 'Charges',
      children: [
        {
          headerName: 'Amount to Pay',
          field: 'AmountToPayDisplay',
          filter: 'agNumberColumnFilter',
          editable: false,
          columnGroupShow: 'close',
          minWidth: 155,
          width: 155,
          flex: 0,
          resizable: true,
          sortingFiled: 'AmountToPay',
          cellStyle: { display: 'flex !important', 'justify-content': 'end', 'padding-right': '50px' }
        },
        {
          headerName: 'Total Current Charges',
          field: 'TotalCurrentChargesDisplay',
          filter: 'agNumberColumnFilter',
          editable: false,
          columnGroupShow: 'close',
          minWidth: 200,
          width: 200,
          flex: 0,
          resizable: true,
          sortingFiled: 'TotalCurrentCharges',
          cellStyle: { display: 'flex !important', 'justify-content': 'end', 'padding-right': '50px' }
        },
        {
          headerName: 'Previous Charges',
          field: 'PrevBillBalanceDisplay',
          columnGroupShow: 'open',
          filter: 'agNumberColumnFilter',
          editable: false,
          minWidth: 169,
          width: 169,
          flex: 0,
          resizable: true,
          sortingFiled: 'PrevBillBalance',
          cellStyle: { display: 'flex !important', 'justify-content': 'end', 'padding-right': '50px' }
        },
        {
          headerName: 'Difference (%)',
          field: 'DifferencePerSantageDisplay',
          columnGroupShow: 'open',
          filter: 'agNumberColumnFilter',
          editable: false,
          minWidth: 149,
          width: 149,
          flex: 0,
          resizable: true,
          sortingFiled: 'DifferencePerSantage'
        },
        {
          headerName: 'Difference ($)',
          field: 'DifferenceDisplay',
          columnGroupShow: 'open',
          filter: 'agNumberColumnFilter',
          editable: false,
          minWidth: 145,
          width: 145,
          flex: 0,
          resizable: true,
          sortingFiled: 'Difference',
          cellStyle: { display: 'flex !important', 'justify-content': 'end', 'padding-right': '30px' }
        },
        {
          headerName: 'Past Due',
          field: 'PastDueAmountDisplay',
          columnGroupShow: 'open',
          filter: 'agNumberColumnFilter',
          editable: false,
          minWidth: 112,
          width: 112,
          flex: 0,
          resizable: true,
          sortingFiled: 'PastDueAmount',
          cellStyle: { display: 'flex !important', 'justify-content': 'end', 'padding-right': '30px' }
        },
        {
          headerName: 'Pay Past Due',
          field: 'PayPastDueStatus',
          columnGroupShow: 'open',
          filter: 'agTextColumnFilter',
          editable: false,
          minWidth: 140,
          width: 140,
          flex: 0,
          resizable: true,
          sortingFiled: 'PayPastDueStatus'
        },
        {
          headerName: 'Last Payment',
          field: 'LastPaymentDisplay',
          columnGroupShow: 'open',
          filter: 'agNumberColumnFilter',
          editable: false,
          minWidth: 143,
          width: 143,
          flex: 0,
          resizable: true,
          sortingFiled: 'LastPayment',
          cellStyle: { display: 'flex !important', 'justify-content': 'end', 'padding-right': '30px' }
        }
      ],
    },
    {
      headerName: 'Cost Allocation',
      children: [
        {
          headerName: '% Allocated',
          field: 'CostAllocatingPerSantageDisplay',
          // filter: 'agNumberColumnFilter',
          editable: false,
          columnGroupShow: 'close',
          minWidth: 150,
          flex: 0,
          resizable: true,
          sortingFiled: 'CostAllocatingPerSantage',
          filter: 'agMultiColumnFilter',
          filterParams: {
            filters: [
              {
                filter: "agNumberColumnFilter",
              },
              {
                filter: "agTextColumnFilter"
              }
            ],
          },
        }
      ]
    },

    {
      headerName: 'People',
      children: [
        {
          headerName: 'AP Responsible',
          field: 'APResponsible',
          filter: 'agTextColumnFilter',
          editable: false,
          columnGroupShow: 'close',
          minWidth: 180,
          flex: 0,
          resizable: true,
          sortingFiled: 'APResponsible'
        }
      ],
    },
  ];

  billingPeroid: any = [];
  selectedPeroid: string;
  public getDataPath: any = (data: any) => data.dataPath;
  public exportInvoiceData: any;
  public exportInvoiceDetail: any;

  private readonly getTemListsDestroy = new Subject<void>();
  private readonly getBillingPeroidListsDestroy = new Subject<void>();
  private readonly getCustomerUser = new Subject<void>();
  private _unsubscribeGRid: Subject<any> = new Subject<any>();

  refeshGrid = false;
  isDisabledExportNoteVar = false;
  isInvoiceNoteExistVar = false;
  @ViewChild(FinanceInvoiceSummaryComponent) _FinanceInvoiceSummaryComponent: FinanceInvoiceSummaryComponent;

  invoicerowData: { InvoiceId: any; };
  selectedCustom = 0;
  selectedTabChildrenDist = 0;
  selectedTabChildrenAllow = 0;
  advanceDateFilterSaved: any;
  constructor(public dialog: MatDialog, private sessionStorageService: SessionStorageService, private financeInvoicesService: FinanceInvoicesService,
    private invoiceService: InvoiceService, private localStorageService: LocalStorageService,
    private locationService: LocationService) { }

  ngOnInit(): void {
    this.selectedTab == 0 ? this.isShowHeader = true : this.isShowExport = false;
    this.selectedTabChildren == 0 ? this.isShowExport = true : this.isShowExport = false;
    this.selectedSummary == 0 ? this.isInvoiceSummaryChildren = true : this.isInvoiceSummaryChildren = false;
    // this.getInvoiceGriData();
    this.getTemLists();
    this.getCustomerForUser();
    this.getBillingPeroid();
    this.hasAccess = rolePermission(['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser', 'TEMAdmin', 'TEMManager', 'TEMUser', 'CustomerAdmin']);
    this.temRoles = rolePermission(['TEMAdmin', 'TEMUser', 'TEMManager']);
    this.isRerunAccess = rolePermission(['SuperTEMAdmin', 'TEMAdmin']);


    let headerData: any = [];
    let ChildHeaderData: any = [];
    let i = 0;
    let childIndex = 0;
    _.map(this.columnDefs, (x: any) => {
      if (isValueExist(x.headerName) && x.headerName !== " ") {
        i = i + 1;
        headerData.push({ position: i, title: x.headerName });
        if (x.children) {
          _.map(x.children, (y: any) => {
            childIndex = childIndex + 1;
            let obj : any = {
              Position: childIndex, Title: y.headerName, FieldName: y.field, HeaderPosition: i
            }
            if (y.field == 'AmountToPayDisplay' || y.field == 'PrevBillBalanceDisplay' || y.field == 'PastDueAmountDisplay' || y.field == 'LastPaymentDisplay' || y.field == 'DifferenceDisplay' || y.field == 'TotalCurrentChargesDisplay') {
              obj['isCurrency'] = true
            }
            if (y.field == 'CostAllocatingPerSantageDisplay' || y.field == 'DifferencePerSantageDisplay') {
              obj['isPercentage'] = true
            }
            ChildHeaderData.push(obj);
          })
        }
      }
    });

    this.exportInvoiceDetail = {
      ExportToExcelData: {
        HeaderData: headerData,
        ChildHeaderData: ChildHeaderData,
        fileName: "Invoices"
      },
      ExportToExcel: true
    };
    this.exportInvoiceData = this.exportInvoiceDetail;

    // Mihir - changes for auth
    setTimeout(() => {
      this.isSuperTem = this.sessionStorageService.getObjectValue('userRoles').includes("SuperTEMAdmin") || this.sessionStorageService.getObjectValue('userRoles').includes("SuperTEMManager") || this.sessionStorageService.getObjectValue('userRoles').includes("SuperTEMUser");
      this.isTemUser = this.sessionStorageService.getObjectValue('userRoles').includes("TEMAdmin") || this.sessionStorageService.getObjectValue('userRoles').includes("TEMManager") || this.sessionStorageService.getObjectValue('userRoles').includes("TEMUser");
  
    }, 200);

    this.CustomerAdmin = this.sessionStorageService.getObjectValue('userRoles').includes("CustomerAdmin");

  }

  openDialog(): void {
    this.dialog.open(this.tooltipText, {
      width: '900px',
      data: {
        colseButton: true,
      }
    });
  }


  addDistribution() {
    this.selectedTabChildrenDist = 1;
  }

  refresh() {
    this.refeshGrid = true;
  }

  addRuleClicked() {
    this.isAddClicked = true;
  }
  addClickedEmit(value: boolean) {
    this.isAddClicked = value
  }
  resetVariables() {
    this.allocationTypeValue = ''
  }

  isDisabledExportNote(e: boolean) {
    this.isDisabledExportNoteVar = e;
  }

  isInventoryNoteExist($event: boolean) {
    this.isInvoiceNoteExistVar = $event;
  }

  refeshGridOutput($event: boolean) {
    this.refeshGrid = $event;
  }
  redirectTab(value: { type: string; redirect: any; data: any; }) {
    if (value.type == 'add-distribution') {
      this.selectedTabChildrenDist = 1;
    } else if (value.type == 'distribution-rule-engine') {
      this.selectedTab = 2;
      this.selectedTabChildrenDist = 2;
    } else if (value.type == 'distribution-detail') {
      this.selectedTab = 2;
      this.selectedTabChildrenDist = 3;
    } else if (value.type == 'grid') {
      this.selectedTabChildrenDist = 0;
    }
    this.isForEditDistribution = value.redirect;
    this.clickedRowData = value.data;
  }

  items = [{
    label: 'Inventory Assignment',
    styleClass: 'danger-step'
  },
  {
    label: 'Distribution',
    styleClass: 'danger-step'
  },
  {
    label: 'Cost Allocation',
    styleClass: 'danger-step'
  },
  {
    label: 'Finished',
    styleClass: 'danger-step'
  }];

  changeSummaryTab($event: number) {
    this.selectedSummary = $event;
    $event == 0 ? this.isInvoiceSummaryChildren = true : this.isInvoiceSummaryChildren = false;
    $event == 1 ? this.isInvoiceNotes = true : this.isInvoiceNotes = false;
  }

  redirectAllocationTab(data: { type: string; rowData: any; }) {
    if (data.type == 'engine') {
      this.selectedTabChildrenAllow = 2;
      this.editRecord = data.rowData;
    } else if (data.type == 'grid') {
      this.selectedTabChildrenAllow = 0;
    }
  }

  redirectToRuleTab($event: any) {
    this.selectedTabChildrenAllow = 2;
    this.editRecord = $event;
  }

  isRecordFinished($event: any) {
    if ($event) {
      this.selectedTab = 0;
    }
  }

  isDistributionCompleted($event: any) {
    if ($event) {
      this.selectedTab = 3;
    }
  }

  CCSDataExist(data: boolean) {
    this.isccsDataExist = data;
  }
  onAgGridReadyEmit($event: { api: any; columnApi: any; }) {
    this.gridApi = $event.api;
    this.gridColumnApi = $event.columnApi;
  }

  onAgGridReady($event: any, InvoiceMonthYear?: any) {

    if (this.selectedPeroid) {
      this.gridApi = $event;
      let dataSource: any = {
        rowCount: null,
        getRows: (params: any) => {
          let paramsRequest = params['request'];
          const filterArray: any = [];
          const filterArrayDate: any = [];
          const filterArrayNumber: any = [];

          for (var key in paramsRequest.filterModel) {
            let data = paramsRequest.filterModel[key];
            let arr;
            let arrDate;
            let arrNumber;

            if (key == 'TotalCurrentChargesDisplay') {
              key = 'TotalCurrentCharges'
            }
            if (key == 'CostAllocatingPerSantageDisplay') {
              key = 'CostAllocatingPerSantage'
            }
            if (key == 'AmountToPayDisplay') {
              key = 'AmountToPay'
            }
            if (key == 'PrevBillBalanceDisplay') {
              key = 'PrevBillBalance'
            }
            if (key == 'DifferenceDisplay') {
              key = 'Difference'
            }
            if (key == 'PastDueAmountDisplay') {
              key = 'PastDueAmount'
            }
            if (key == 'LastPaymentDisplay') {
              key = 'LastPayment'
            }

            if (key === 'InvoiceStartDate' || key == 'InvoiceBillDate' || key == 'PayByDate' || key == 'UploadedDate') {
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
            } else if (key == 'AmountToPay' || key == 'PrevBillBalance' || key == 'Difference' || key == 'PastDueAmount' || key == 'LastPayment' || key == 'CostAllocatingPerSantage' || key == 'TotalCurrentCharges') {
              arrNumber = {
                filterKey: key,
                filterOptionType1: data['type'] ? data['type'] : data['condition1'].type ? data['condition1'].type : null,
                filterOptionValue1: (data && data.filter) ? data.filter : (data['condition1'] && data['condition1']['filter']) ? data['condition1'].filter : null,
                filterOptionValue1_2: (data && data.filterTo) ? data.filterTo : (data['condition1'] && data['condition1']['filterTo']) ? data['condition1']?.filterTo : null,
                filterOperationType: data['operator'] ? data['operator'] : 'AND',
                filterOptionType2: data['condition2']?.type ? data['condition2']?.type : null,
                filterOptionValue2: (data['condition2'] && data['condition2'].filter) ? data['condition2']?.filter : null,
                filterOptionValue2_2: (data['condition2'] && data['condition2'].filterTo) ? data['condition2']?.filterTo : null
              }
              filterArrayNumber.push(arrNumber);
              // }
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

          if (filterArrayDate && filterArrayDate.length > 0) {
            data['advanceDateFilter'] = filterArrayDate;
          }


          if ((InvoiceMonthYear && Object.keys(InvoiceMonthYear).length > 0) || (this.advanceDateFilterSaved && Object.keys(this.advanceDateFilterSaved).length > 0)) {
            let date
            if (this.advanceDateFilterSaved && Object.keys(this.advanceDateFilterSaved).length > 0) {
              date = this.advanceDateFilterSaved
            } else {
              date = InvoiceMonthYear
            }
            if (!data['advanceDateFilter']) {
              data['advanceDateFilter'] = [];
            }
            data['advanceDateFilter'].push(date);
          }
          if (this.isSuperTem && !this.isFilterData) {

            filterArray.push({
              "filterKey": "CostAllocationValue",
              "filterOptionType1": "equals",
              "filterOptionValue1": "SuperTEM",
              "filterOperationType": "AND",
              "filterOptionType2": null,
              "filterOptionValue2": null
            }, {
              "filterKey": "ReconValue",
              "filterOptionType1": "equals",
              "filterOptionValue1": "SuperTEM",
              "filterOperationType": "AND",
              "filterOptionType2": null,
              "filterOptionValue2": null
            })
          }
          if (this.isTemUser && !this.isFilterData) {
            filterArray.push({
              "filterKey": "CostAllocationValue",
              "filterOptionType1": "equals",
              "filterOptionValue1": "TEM",
              "filterOperationType": "AND",
              "filterOptionType2": null,
              "filterOptionValue2": null
            }, {
              "filterKey": "ReconValue",
              "filterOptionType1": "equals",
              "filterOptionValue1": "TEM",
              "filterOperationType": "AND",
              "filterOptionType2": null,
              "filterOptionValue2": null
            })
          }
          
          if (filterArray && filterArray.length > 0) {
            data['advanceFilter'] = filterArray;
          }

          if (filterArrayNumber && filterArrayNumber.length > 0) {
            data['advanceNumberFilter'] = filterArrayNumber;
          }

          if (this.selectedTem != 'all') {
            data['TemAccountId'] = parseInt(this.selectedTem);
          }

          if (paramsRequest.sortModel.length > 0) {

            Object.values(params['columnApi']['columnController']['columnDefs']).forEach((key: any) => {
              if (key['children']) {
                Object.values(key['children']).forEach((k: any) => {
                  if (k['field'] === paramsRequest.sortModel[0].colId) {
                    data['OrderBy'] = k['sortingFiled'];
                    data['SortOrder'] = paramsRequest.sortModel[0].sort;
                  }
                });
              }
            });
          }
          this.exportInvoiceData = { ...this.exportInvoiceDetail, ...data };
          this.selectedTemDD = this.selectedTem;
          this._unsubscribeGRid.next(null);
          this.financeInvoicesService.getInvoiceGriData(data)
            .pipe(takeUntil(this._unsubscribeGRid))
            .subscribe(
              async (data: any) => {
                this.invoiceDataCount = data.TotalCount;
                if (data && data.Data.$values.length > 0) {
                  this.rowData = data.Data.$values;
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
              (error: any) => {
                params.success({
                  rowData: [],
                  rowCount: 0
                });
                this.gridApi.showNoRowsOverlay();
              }
            );
        },
      };

      if (this.gridApi && this.gridApi.api) {
        this.gridApi.api.setGridOption('serverSideDatasource', dataSource);
      } else {
        this.gridApi.setGridOption('serverSideDatasource', dataSource);
      }
    }

  }

  containsOnlyDigits(str: string) {
    if (/^\d+$/.test(str)) {
      return str;
    } else if (str.search('-') !== -1) {
      return '0';
    } else {
      return '';
    }
  }

  filterGridBySearch() {
    this.onAgGridReady(this.gridApi, this.advanceDateFilterSaved);
  }

  allocationType(type: any) {
    this.allocationTypeValue = type
  }

  costAllocationStructureExport() {
    
    this.isccsDataExport = true;
    this.invoiceService.costAllocationStructureExport(this.invoicerowData.InvoiceId, this.exportCCsData).subscribe({
      next: (data: Blob | MediaSource) => {
        this.isccsDataExport = false;
        let bolbUrl = URL.createObjectURL(data);
        var link = document.createElement("a");
        link.setAttribute("href", bolbUrl);
        link.setAttribute("download", `Cost Center Structure.xlsx`);
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
      },
      error: (error: any) => {
        this.isccsDataExport = false;
      }
    })
  }
  exportCCSExcelData(data: any) {
    this.exportCCsData = data;
  }

  getBillingPeroid() {
    this.getBillingPeroidListsDestroy.next();
    this.locationService.getBillingPeroidForUser().pipe(takeUntil(this.getBillingPeroidListsDestroy))
      .subscribe(
        (response: any) => {
          if (response) {
            this.billingPeroid = response.Data.$values;
            this.selectedPeroid = this.billingPeroid[1].MonthYear;

            if (this.selectedPeroid === 'Latest 3 Billing Periods') {
              let startDate
              let endDate
              const currentDate = new Date();

              startDate = this.getDate(currentDate.getFullYear(), currentDate.getMonth() - 3, 1);
              endDate = this.getDate(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

              const advanceDateFilter =
              {
                "filterKey": "InvoiceMonthYear",
                "filterOptionType1": "inRange",
                "filterOptionValue1": startDate,
                "filterOptionValue1_2": endDate,
                "filterOperationType": "AND",
                "filterOptionType2": null,
                "filterOptionValue2": null,
                "filterOptionValue2_2": null
              }

              this.advanceDateFilterSaved = advanceDateFilter;
              this.filterGridBySearch();
            }

          } else {
            this.billingPeroid = [];
          }
        }, (error: any) => {
          this.billingPeroid = [];
        });

  }

  getTemLists() {
    this.getTemListsDestroy.next();
    this.locationService
      .getTemLists()
      .pipe(takeUntil(this.getTemListsDestroy))
      .subscribe(
        (response: any) => {
          if (response) {
            this.tems = this.filterdTems = response.$values;

            // if (this.hasSuperTemUsers) {
            let id = sessionStorage.getItem("LoggedAccountId");
            const found = this.tems.find((element: { Id: any; }) => Number(element.Id) === Number(id));
            this.tems.unshift(found);

            this.tems = this.tems.filter((object: any, index: any) => {
              if (object) {
                return this.tems.indexOf(object) === index;
              } else {
                return false;
              }
            });
            // }
          }
        },
        (error: any) => { }
      );
  }

  onChangeTem(event: { target: { value: string; }; }) {
    if (event.target.value !== 'all') {
      this.customers = [];
      this.loadingCustomerAPI = true;
      this.selectedTemDD = event.target.value;
      this.getCustomerUser.next();
      this.locationService.getCustomerDropdownByNewTEM(event.target.value).pipe(takeUntil(this.getCustomerUser)).subscribe((data: { Data: { $values: any; }; }) => {
        if (data && data.Data.$values) {
          this.customers = data.Data.$values;
          this.selectedCustomer = 'all';
          this.loadingCustomerAPI = false;
        } else {
          this.loadingCustomerAPI = false;
        }
      }, (error: any) => {
        this.loadingCustomerAPI = false;
      });
    }
  }

  getCustomerForUser() {
    this.getCustomerUser.next();
    this.customers = [];
    this.locationService.getCustomerDropDown().pipe(takeUntil(this.getCustomerUser)).subscribe((data: { $values: any; }) => {
      if (data && data.$values) {
        this.customers = data.$values;
      }
    });
  }

  ngOnDestroy(): any {
    this.getTemListsDestroy.next();
    this.getTemListsDestroy.complete();
    this.getBillingPeroidListsDestroy.next();
    this.getBillingPeroidListsDestroy.complete();
    this.getCustomerUser.next();
    this.getCustomerUser.complete();
    this._unsubscribeGRid.next(null);
    this._unsubscribeGRid.complete();
  }

  onBtnExportDataAsExcel() {
   
    this.isDisabledExport = true;

    this.financeInvoicesService
      .getInvoiceGriDataExport(this.exportInvoiceData)
      .subscribe({
        next: (data: Blob | MediaSource) => {
          this.isDisabledExport = false;
          let bolbUrl = URL.createObjectURL(data);
          var link = document.createElement("a");
          link.setAttribute("href", bolbUrl);
          link.setAttribute("download", "Invoices.xlsx");
          link.style.display = "none";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        },
        error: (error: any) => {
          this.isDisabledExport = false;
        }
      });
  }

  onBtnExportDataAsExcelForSummary() {
    this._FinanceInvoiceSummaryComponent.export();
  }

  changeParentTab($event: number) {
    this.selectedTab = $event;
    $event == 0 ? this.isShowHeader = true : this.isShowHeader = false;
    $event == 1 ? this.isShowInvoiceSummary = true : this.isShowInvoiceSummary = false;
  }

  changeChildTab($event: number) {
    this.selectedTabChildren = $event;
    $event == 0 ? this.isShowExport = true : this.isShowExport = false;
  }

  onCellDoubleClicked($event: { data: any; }) {
    this.invoicerowData = $event.data;
    // this.selectedTabChildren = 1;
    this.selectedTab = 1;
    this.selectedTabChildren = 0;
  }

  onExportDisableEvent($event: boolean) {
    this.isShowInvoiceSummaryExportDisable = $event;
  }

  onExportDisableAllocation($event: boolean) {
    this.isDisableExportAllocation = $event
  }

  onRowDataLength($event: any) {
    this.invoiceSummaryRowData = $event;
  }

  stopSpinnerEvent($event: boolean) {
    this.isInvoiceSummaryLoading = $event;
  }

  addInvoiceSummary() {
    this.selectedTab = 2;
    this.selectedTabChildrenDist = 1;
  }

  clickToTab(e: number) {
    this.selectedTab = e;
    if (e === 1) {
      this.selectedTabChildren = 0;
    }
    if (e === 2) {
      this.selectedTabChildrenDist = 0;
    }
    if (e === 3) {
      this.selectedTabChildrenAllow = 0;
    }
  }
  clickToSubTab(e: any) {
    this.selectedTabChildren = e;
  }

  clickToSubTabDist(e: number) {
    this.selectedTabChildrenDist = e;
  }
  clickToSubTabAllow(e: number) {
    this.selectedTabChildrenAllow = e;
  }

  exportNotes() {
    this.invoiceNotesComponent.export();
  }

  addInvoiceNoteFromSummary() {
    this.selectedTabChildren = 1;
    setTimeout(() => {
      this.invoiceNotesComponent.addInvoiceNote();
    }, 2000);
  }

  AddInvoiceNote() {
    const dialogRef = this.dialog.open(AddInvoiceNoteComponent, {
      width: '900px',
      data: {
        colseButton: true,
        data: {
          gridrowData: this.invoicerowData,
          invoiceOvervewData: this.invoiceOvervewData
        }
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.invoiceNotesComponent.getInoviceNotes();
      }
    });
  }

  invoiceOverviewDataOutput($event: any) {
    this.invoiceOvervewData = $event;

    this.items = [{
      label: 'Inventory Assignment',
      styleClass: this.invoiceOvervewData.IsRecondone ? 'success-step' : 'danger-step',
    },
    {
      label: 'Distribution',
      styleClass: this.invoiceOvervewData.IsDistribution ? 'success-step' : 'danger-step',
    },
    {
      label: 'Cost Allocation',
      styleClass: this.invoiceOvervewData.IsAllocation ? 'success-step' : 'danger-step',
    },
    {
      label: 'Finished',
      styleClass: this.invoiceOvervewData.IsFinished ? 'success-step' : 'danger-step',
    }]
  }

  getDate(year: number, month: number | undefined, day: number | undefined) {
    const date = new Date(Date.UTC(year, month, day));
    const year1 = date.getUTCFullYear();
    const month1 = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day1 = String(date.getUTCDate()).padStart(2, '0');

    const isoDate = `${year1}-${month1}-${day1}`;
    return isoDate;
  }

  onChangePeroid(e: { target: { value: string; }; }) {
    const currentDate = new Date();
    let advanceDateFilter: any;
    this.advanceDateFilterSaved = {};
    if (e.target.value !== 'All') {
      let startDate
      let endDate
      if (e.target.value === 'Latest 3 Billing Periods') {
        startDate = this.getDate(currentDate.getFullYear(), currentDate.getMonth() - 3, 1);
        endDate = this.getDate(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

        advanceDateFilter =
        {
          "filterKey": "InvoiceMonthYear",
          "filterOptionType1": "inRange",
          "filterOptionValue1": startDate,
          "filterOptionValue1_2": endDate,
          "filterOperationType": "AND",
          "filterOptionType2": null,
          "filterOptionValue2": null,
          "filterOptionValue2_2": null
        }

      } else {

        advanceDateFilter =
        {
          "filterKey": "InvoiceMonthYear",
          "filterOptionType1": "equals",
          "filterOptionValue1": this.getMonthNum(e.target.value),
          "filterOptionValue1_2": null,
          "filterOperationType": "AND",
          "filterOptionType2": null,
          "filterOptionValue2": null,
          "filterOptionValue2_2": null
        }

      }

      this.advanceDateFilterSaved = advanceDateFilter;
    }
  }


  getMonthName(month: number): string {
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ];
    return monthNames[month - 1];
  }

  getMonthNum(monthS: string) {

    const [m, y] = monthS.split('-');

    const monthMap:any = {
      Jan: 1,
      Feb: 2,
      Mar: 3,
      Apr: 4,
      May: 5,
      Jun: 6,
      Jul: 7,
      Aug: 8,
      Sep: 9,
      Oct: 10,
      Nov: 11,
      Dec: 12
    };

    const monthNumber = monthMap[m];

    const formattedString = `${y}-${monthNumber}-01`;

    return formattedString;

  }

  exportData($event: any) {
  }

}
