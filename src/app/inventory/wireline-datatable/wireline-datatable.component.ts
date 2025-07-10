import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import moment from 'moment';
import * as _ from 'lodash';
import { WirelinePTableComponent } from './wireline-p-table/wireline-p-table.component';
import { AddServiceTypeComponent } from 'src/app/common/add-service-type/add-service-type.component';
import { LinkInventoryCDialogComponent } from 'src/app/customer/contracts/link-inventory-c-dialog/link-inventory-c-dialog.component';
import { rolePermission, isValueExist, checkIsValueExists } from 'src/app/services/helper';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { LocationService } from 'src/app/services/location.service';
import { SessionStorageService } from 'src/app/services/session-storage.service';
import { VariableManageService } from 'src/app/services/variable-manage.service';
import { WirelineService } from 'src/app/services/wireline.service';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { AddWirelineComponent } from 'src/app/common/add-wireline/add-wireline.component';
import { AssignmentsComponent } from 'src/app/common/assignments/assignments.component';
import { InventoryNoteTableComponent } from '../inventory-note-table/inventory-note-table.component';
import { ChildInventoryDatatableComponent } from '../child-inventory-datatable/child-inventory-datatable.component';
import { AddBillingWComponent } from '../add-billing-w/add-billing-w.component';
import { ContractsMComponent } from 'src/app/common/contracts-m/contracts-m.component';
import { ChangeLogComponent } from 'src/app/common/change-log/change-log.component';
import { CommonCcsComponent } from 'src/app/common/common-ccs/common-ccs.component';
import { AddEditContractsComponent } from 'src/app/customer/contracts/add-edit-contracts/add-edit-contracts.component';
import { InventoryCComponent } from 'src/app/customer/contracts/inventory-c/inventory-c.component';
@Component({
  selector: 'app-wireline-datatable',
  templateUrl: './wireline-datatable.component.html',
  styleUrls: ['./wireline-datatable.component.scss'],
  imports: [SharedModule, WirelinePTableComponent, AddWirelineComponent, AssignmentsComponent,
    InventoryNoteTableComponent, ChildInventoryDatatableComponent, AddBillingWComponent, ContractsMComponent,ChangeLogComponent,
    CommonCcsComponent, AddEditContractsComponent, InventoryCComponent
  ],
  providers: [WirelineService]
})
export class WirelineDatatableComponent implements OnInit {

  buttonOptions: any = [
  ];
  selectedMainTab: any = 0;
  selectedChild: any = 0;
  public isEditClicked = false;
  tabsContractArray: any = [];

  selectedButton: any
  selectedTem: any = 'all';
  disableTemSearch: any;
  disableTemSearchDD: any;
  payload: any;
  public services: any = [];

  selectedCustomer: any = 'all';
  isRoleAccess: boolean = false;
  childInventoryAccess: boolean = false;
  isRowSelected: boolean = false;
  isChildInventoryPage: boolean = false;
  isChildInventory: boolean = false;
  isInventoryNotes: boolean = false;
  isInventoryNoteAccess: boolean = false;
  isInventoryNote: boolean = false;
  isAssignmentsTab: boolean = false;
  hasSuperTemUsers: boolean = false;
  hasTemUsers: boolean = false;
  isChildDisable: boolean = false;
  isSelectedChild: any;
  tems: any = [];
  filterdTems: any = [];
  tabsArray: any = [];
  public buttonAction: any;
  public isInventoryPage: boolean = true;
  private getCustomerUser: Subject<any | null> = new Subject<any | null>();
  private getCustomerUser1: Subject<any | null> = new Subject<any | null>();

  private getTemListsDestroy: Subject<any | null> = new Subject<any | null>();
  private geAllCustomerUrlDestroy: Subject<any | null> = new Subject<any | null>();
  private getAllCustomerListByTEMId: Subject<any | null> = new Subject<any | null>();
  private _unsubscribeInventory: Subject<any | null> = new Subject<any | null>();

  sendDataToLinkPopup: any;
  isDisablLinkInventory: boolean = false;
  @ViewChild(WirelinePTableComponent) private WirelinePTableComponent!: WirelinePTableComponent;
  columns: any = [];
  exportRetrievalData: any;
  loadingDataFromEditApi = false;
  public getDataPath: any = (data: any) => data.dataPath;
  isShowSearch = true;
  public exportAccounts: any;
  isAccountsExport = false;
  public advanceFilter: any;
  isDisabledExport = false;
  loadingCustomerAPI = false;
  defaultColDef = {
    sortable: true,
    minWidth: 100,
    filter: true,
    resizable: true,
    floatingFilter: true,
    flex: 1,
  };

  columnDefs: any = [

    {
      headerName: 'Inventory',
      children: [
        {
          field: 'BillingId',
          headerName: 'Billing ID',
          columnGroupShow: 'close',
          editable: false,
          filter: 'agTextColumnFilter',
          minWidth: 140,
          flex: 0,
          resizable: true
        },
        {
          field: 'InventoryCustomField1',
          headerName: 'Service Custom 1',
          columnGroupShow: 'open',
          editable: false,
          filter: 'agTextColumnFilter',
          minWidth: 140,
          flex: 0,
          resizable: true
        },
        {
          field: 'InventoryCustomField2',
          headerName: 'Service Custom 2',
          columnGroupShow: 'open',
          editable: false,
          filter: 'agTextColumnFilter',
          minWidth: 140,
          flex: 0,
          resizable: true
        },
        {
          field: 'InventoryCustomField3',
          headerName: 'Service Custom 3',
          columnGroupShow: 'open',
          editable: false,
          filter: 'agTextColumnFilter',
          minWidth: 140,
          flex: 0,
          resizable: true
        },
        {
          field: 'InventoryCustomField4',
          headerName: 'Service Custom 4',
          columnGroupShow: 'open',
          editable: false,
          filter: 'agTextColumnFilter',
          minWidth: 140,
          flex: 0,
          resizable: true
        },
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
          resizable: true
        },
        {
          field: 'CompanyName',
          headerName: 'Company',
          columnGroupShow: 'close',
          editable: false,
          filter: 'agTextColumnFilter',
          minWidth: 200,
          flex: 0,
          resizable: true
        },
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
          minWidth: 120,
          flex: 0,
          resizable: true
        },
        {
          field: 'ParentVendorAccountName',
          headerName: 'Parent Vendor',
          resizable: true,
          editable: false,
          columnGroupShow: 'open',
          filter: 'agTextColumnFilter',
          minWidth: 200,
          sortingField: 'ParentVendorAccountName'
        },
        {
          field: 'MainAccountNumber',
          headerName: 'Main Account Number',
          columnGroupShow: 'open',
          editable: false,
          filter: 'agTextColumnFilter',
          minWidth: 230,
          flex: 0,
          resizable: true
        },
        {
          field: 'SubAccountNumber',
          headerName: 'Sub Account Number',
          columnGroupShow: 'open',
          editable: false,
          filter: 'agTextColumnFilter',
          minWidth: 230,
          flex: 0,
          resizable: true
        },
        {
          field: 'PayableAccountNumber',
          headerName: 'Payable Account Number',
          columnGroupShow: 'open',
          editable: false,
          filter: 'agTextColumnFilter',
          minWidth: 250,
          flex: 0,
          resizable: true
        },
      ],
    },
    {
      headerName: 'Product',
      children: [

        {
          headerName: 'Vendor Product',
          field: 'VendorProductName',
          columnGroupShow: 'close',
          filter: 'agTextColumnFilter',
          editable: false,
          minWidth: 200,
          flex: 0,
          resizable: true
        },
        {
          headerName: 'Service',
          field: 'ServiceName',
          columnGroupShow: 'open',
          editable: false,
          filter: 'agTextColumnFilter',
          minWidth: 50,
          flex: 0,
          resizable: true
        },
        {
          headerName: 'Service Type',
          field: 'ServiceType',
          columnGroupShow: 'open',
          editable: false,
          filter: 'agTextColumnFilter',
          minWidth: 50,
          flex: 0,
          resizable: true
        },
        {
          headerName: 'Product',
          field: 'ProductName',
          filter: 'agTextColumnFilter',
          editable: false,
          columnGroupShow: 'open',
          minWidth: 200,
          flex: 0,
          resizable: true
        },
        {
          headerName: 'Product Type',
          field: 'ProductType',
          filter: 'agTextColumnFilter',
          editable: false,
          columnGroupShow: 'open',
          minWidth: 200,
          flex: 0,
          resizable: true
        },
      ],
    },
    {
      headerName: 'Cost',
      children: [
        {
          headerName: 'Total Current Charges',
          field: 'TotalCurrentCharges',
          filter: 'agNumberColumnFilter',
          editable: false,
          columnGroupShow: 'close',
          minWidth: 200,
          flex: 0,
          resizable: true,
          cellStyle: { display: 'flex !important', 'justify-content': 'end', 'padding-right': '50px' },
          // valueFormatter: params => this.currencyFormatter(params.data.TotalCurrentCharges, params.data.CurrencySymbol),
          valueFormatter(params: any) {
            if (params?.data?.TotalCurrentCharges) {
              var sansDec = params?.data?.TotalCurrentCharges.toFixed(2);
              return params.data.CurrencySymbol + `${sansDec.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
            }
            return '';
          }
        },
        {
          headerName: 'Previous Charges',
          field: 'PreviousBillBalance',
          columnGroupShow: 'open',
          filter: 'agNumberColumnFilter',
          editable: false,
          minWidth: 50,
          flex: 0,
          resizable: true,
          cellStyle: { display: 'flex !important', 'justify-content': 'end', 'padding-right': '50px' },
          // valueFormatter: params => this.currencyFormatter(params.data.PreviousBillBalance, params.data.CurrencySymbol),
          valueFormatter(params: any) {
            if (params?.data?.PreviousBillBalance) {
              var sansDec = params?.data?.PreviousBillBalance.toFixed(2);
              return params.data.CurrencySymbol + `${sansDec.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
            }
            return '';
          }
        },
        // {
        //   headerName: '6 Mth Variance',
        //   field: 'SixMonthVariance',
        //   columnGroupShow: 'open',
        //   filter: 'agTextColumnFilter',
        //   editable: false,
        //   minWidth: 50,
        //   flex: 0,
        // },
        // {
        //   headerName: '1 Yr Variance',
        //   field: 'OneYearVariance',
        //   columnGroupShow: 'open',
        //   filter: 'agTextColumnFilter',
        //   editable: false,
        //   minWidth: 50,
        //   flex: 0,
        // },
      ],
    },
    {
      headerName: 'Status',
      children: [
        {
          headerName: 'Status',
          field: 'InventoryStatusDisplayText',
          filter: 'agTextColumnFilter',
          editable: false,
          columnGroupShow: 'close',
          minWidth: 200,
          flex: 0,
          resizable: true
        },
        {
          field: 'StartDate',
          headerName: 'Service Start Date',
          filter: 'agDateColumnFilter',
          columnGroupShow: 'open',
          editable: false,
          minWidth: 185,
          flex: 0,
          valueGetter(params: any) {
            if (params.data.StartDate) {
              return moment(params.data && params.data.StartDate).format('MM/DD/YYYY');
            }
            return '';
          },
          filterParams: {
            comparator: (filterLocalDateAtMidnight: Date, cellValue: string) => {
              const cellDate = new Date(cellValue);
              if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
                return 0;
              } else if (cellDate < filterLocalDateAtMidnight) {
                return -1;
              } else {
                return 1;
              }
            },
            browserDatePicker: true,
          },
        },
        {
          field: 'EndDate',
          headerName: 'Disconnection Date',
          filter: 'agDateColumnFilter',
          columnGroupShow: 'open',
          editable: false,
          minWidth: 180,
          flex: 0,
          valueGetter(params: any) {
            if (params.data.EndDate) {
              return moment(params.data && params.data.EndDate).format('MM/DD/YYYY');
            }
            return '';
          },
          filterParams: {
            comparator: (filterLocalDateAtMidnight: Date, cellValue: string) => {
              const cellDate = new Date(cellValue);
              if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
                return 0;
              } else if (cellDate < filterLocalDateAtMidnight) {
                return -1;
              } else {
                return 1;
              }
            },
            browserDatePicker: true,
          },
        },
        {
          field: 'InvoiceCyclesRemaining',
          headerName: 'Invoice Cycles Remaining',
          filter: 'agNumberColumnFilter',
          columnGroupShow: 'open',
          editable: false,
          minWidth: 220,
          flex: 0
        },
        {
          headerName: 'Contract Start Date',
          field: 'ContractStartDate',
          columnGroupShow: 'open',
          filter: 'agDateColumnFilter',
          editable: false,
          minWidth: 50,
          flex: 0,
          resizable: true,
          valueGetter(params: any) {
            if (params.data.ContractStartDate) {
              return moment(params.data.ContractStartDate).format('MM/DD/YYYY');
            }
            return '';
          },
          filterParams: {
            comparator: (filterLocalDateAtMidnight: Date, cellValue: string) => {
              const cellDate = new Date(cellValue);
              if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
                return 0;
              } else if (cellDate < filterLocalDateAtMidnight) {
                return -1;
              } else {
                return 1;
              }
            },
            browserDatePicker: true,
          },
        },
        {
          headerName: 'Contract End Date',
          field: 'ContractEndDate',
          columnGroupShow: 'open',
          filter: 'agDateColumnFilter',
          editable: false,
          minWidth: 50,
          flex: 0,
          resizable: true,
          valueGetter(params: any) {
            if (params.data.ContractEndDate) {
              return moment(params.data.ContractEndDate).format('MM/DD/YYYY');
            }
            return '';
          },
          filterParams: {
            comparator: (filterLocalDateAtMidnight: Date, cellValue: string) => {
              const cellDate = new Date(cellValue);
              if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
                return 0;
              } else if (cellDate < filterLocalDateAtMidnight) {
                return -1;
              } else {
                return 1;
              }
            },
            browserDatePicker: true,
          },
        },
      ],
    },
    {
      headerName: 'Billing',
      children: [
        {
          headerName: 'Billing',
          field: 'BillingChargeDisplayText',
          filter: 'agTextColumnFilter',
          editable: false,
          columnGroupShow: 'close',
          minWidth: 150,
          flex: 0,
          resizable: true
        }
      ]
    },
    {
      headerName: 'Location',
      children: [
        {
          headerName: 'Name',
          field: 'LocationName',
          filter: 'agTextColumnFilter',
          editable: false,
          columnGroupShow: 'close',
          minWidth: 200,
          flex: 0,
          resizable: true
        },
        {
          headerName: 'Address One',
          field: 'Address1',
          columnGroupShow: 'open',
          filter: 'agTextColumnFilter',
          editable: false,
          minWidth: 50,
          flex: 0,
          resizable: true
        },
        {
          headerName: 'Address Two',
          field: 'Address2',
          columnGroupShow: 'open',
          filter: 'agTextColumnFilter',
          editable: false,
          minWidth: 50,
          flex: 0,
          resizable: true
        },
        {
          headerName: 'City',
          field: 'City',
          columnGroupShow: 'open',
          filter: 'agTextColumnFilter',
          editable: false,
          minWidth: 50,
          flex: 0,
          resizable: true
        },
        {
          headerName: 'State/Province/Region',
          field: 'StateName',
          columnGroupShow: 'open',
          filter: 'agTextColumnFilter',
          editable: false,
          minWidth: 260,
          flex: 0,
          resizable: true
        },
        {
          headerName: 'Zip/Postal Code',
          field: 'PostalCode',
          columnGroupShow: 'open',
          filter: 'agTextColumnFilter',
          editable: false,
          minWidth: 50,
          flex: 0,
          resizable: true
        },
        {
          headerName: 'Primary',
          field: 'LocationPrimaryDisplay',
          columnGroupShow: 'open',
          filter: 'agTextColumnFilter',
          editable: false,
          minWidth: 50,
          flex: 0,
          resizable: true
        },
      ],
    },
    {
      headerName: 'People',
      children: [
        {
          headerName: 'People Name',
          field: 'PeopleName',
          filter: 'agTextColumnFilter',
          editable: false,
          columnGroupShow: 'close',
          minWidth: 200,
          flex: 0,
          resizable: true
        },
        {
          headerName: 'People Status',
          field: 'PeopleStatusDisplayValue',
          filter: 'agTextColumnFilter',
          editable: false,
          columnGroupShow: 'open',
          minWidth: 200,
          flex: 0,
          resizable: true
        },
        {
          headerName: 'Primary',
          field: 'PeoplePrimaryDisplay',
          filter: 'agTextColumnFilter',
          editable: false,
          columnGroupShow: 'open',
          minWidth: 200,
          flex: 0,
          resizable: true
        },

      ]
    },
    {
      headerName: 'Contact',
      children: [
        {
          headerName: 'Email',
          field: 'PeopleEmail',
          filter: 'agTextColumnFilter',
          editable: false,
          columnGroupShow: 'close',
          minWidth: 200,
          flex: 0,
          resizable: true
        }
      ]
    }
  ];
  rowSelection: any = 'multiple';
  sideBar: any = {
    toolPanels: ['columns', 'filters'],
  };
  rowData: any = [];
  inventoryData: any = [];
  rowDataForLink: any = []
  customers: any = [];
  stopSpinner: boolean = false;
  countsRecords = {
    TotalChildRecordCount: 0,
    TotalParentRecordCount: 0,
    TotalParentChildRecordCount: 0,
  }
  selectedContractChild: any = 0;
  userInfo: any;

  gridOptions = {
    headerHeight: 35,
    groupHeaderHeight: 37,
    floatingFiltersHeight: 35,
    onSortChanged: (event: any) => {
      this.onSortChanged(event);
    }
  };
  selectedTemTabWise: any = [];
  selectedTemForZero: any;
  selectedCustomerForZero: any;
  sortModel: any;

  serviceIds: any = []
  childRecord = '';
  clickOnSearchButton = false;
  temRoles = false;
  selectedTemDD: any;

  pageMappings: { [key: string]: string } = {
    wireline: 'wireline',
    mobility: 'mobile',
    cloud: 'cloud',
    allinventory: 'allinventory'
  };

  addlinkAssignmentData(data: any, rowData: any) {
    let gridRowData: any = {};
    gridRowData['data'] = rowData;
    this.tabsArray.push({ tabType: data.type, rowData: gridRowData, pageName: 'newAssignment', child: 1 });
    this.selectedMainTab = this.tabsArray.length;
  }
  onSortChanged(event: any) {
    const sortModel = event.api.getSortModel();
    this.sortModel = sortModel;
  }
  isServerSideGroup(dataItem: any) {
    return dataItem.ChildInventory.$values && dataItem.ChildInventory.$values.length > 0 ? true : false;
  }
  currencyFormatter(currency: any, sign: any) {
    if (currency !== null) {
      var sansDec = currency.toFixed(2);
      return sign + `${sansDec}`;
    } else {
      return '';
    }
  }
  isOpenContainerTab($event?: any) {
    this.tabsContractArray = [];
    this.tabsContractArray.push({ tabType: 'contract', selectedChild: 11, docType: $event ? $event.data.data.Type : null, addendumId: $event ? $event.data.data.Id : null, pageName: 'Contract Details', imgSrc: 'assets/images/Contract/fa-solid-fa-file-lock.svg' });
    this.tabsContractArray.push({ tabType: 'contract', selectedChild: 12, docType: $event ? $event.data.data.Type : null, addendumId: $event ? $event.data.data.Id : null, pageName: 'Contract Inventory', imgSrc: 'assets/images/Contract/fa-solid-fa-file-lock.svg' });
    this.selectedChild = null;
    this.selectedContractChild = 0;

  }
  removeContract(currentId: any, page: any) {
    this.tabsContractArray.splice(currentId, 1);
    this.tabsContractArray = _.cloneDeep(this.tabsContractArray);

    if (this.tabsContractArray.length > 0) {
      this.selectedContractChild = this.tabsContractArray.length - 1;
    } else if (this.tabsContractArray.length === 0) {
      this.selectedContractChild = null;
      this.tabsArray = _.cloneDeep(this.tabsArray);
      this.selectedChild = 7;
    }
  }

  wirelinePageName = 'Table';
  accountExist: any;
  fromWhichPage = '';
  payableNumber = '';
  mappedPagename: any;
  buttonName = '';
  isTEMUser = false
  params: any;

  constructor(
    private router: Router,
    private locationService: LocationService,
    public variableManageService: VariableManageService,
    public dialog: MatDialog,
    private wirelineService: WirelineService,
    private cdr: ChangeDetectorRef,
    private sessionStorageService: SessionStorageService,
    private localStorageService: LocalStorageService,
    private activatedRoute: ActivatedRoute,
    
  ) {

    if (this.activatedRoute.snapshot.queryParams) {
      this.params = this.activatedRoute.snapshot.queryParams;
    }
    const pagename = Object.keys(this.pageMappings).find((page) =>
      this.router.url.toLowerCase().includes(page.toLowerCase())
    );

    this.mappedPagename = pagename ? this.pageMappings[pagename] : null;

    if (this.mappedPagename === 'allinventory') {
      this.buttonName = 'All Inventory'
    } else if (this.mappedPagename === 'wireline') {
      this.buttonName = 'Wireline'
    } else if (this.mappedPagename === 'cloud') {
      this.buttonName = 'Cloud'
    }
    this.buttonOptions = [
      { label: this.mappedPagename.charAt(0).toUpperCase() + this.mappedPagename.slice(1), value: this.buttonName, url: '/inventory/' + this.mappedPagename, icon: this.buttonName === 'Wireline' ? 'fas fa-clipboard' : this.buttonName === 'Cloud' ? 'fas fa-cloud' : this.buttonName === 'All Inventory' ? 'fas fa-barcode' : '' },
    ];
    this.selectedButton = this.buttonOptions[0].value;
    this.columns = [
      { field: 'TabModuleDisplayName', header: 'Tab' },
      { field: 'TabSectionModuleDisplayName', header: 'Section' },
      { field: 'DisplayColumnName', header: 'Field Name' },
      { field: 'OldValue', header: 'Previous Value' },
      { field: 'NewValue', header: 'New Value' },
      { field: 'Action', header: 'Action' },
      { field: 'ModificationDate', header: 'Time & Date' },
      { field: 'ModifiedBy', header: 'Who' }
    ];
  }

  wirelinePageNameFn($event: string) {
    this.wirelinePageName = $event;
  }

  ngAfterViewChecked() {
    this.cdr.detectChanges();
  }

  ngOnInit(): void {
    this.temRoles = rolePermission(['TEMAdmin', 'TEMUser', 'TEMManager']);
    if (this.activatedRoute.snapshot.queryParams['frompage'] === 'sandbox') {
      this.fromWhichPage = this.activatedRoute.snapshot.queryParams['frompage'];
      this.payableNumber = this.activatedRoute.snapshot.queryParams['PayableBillingAccountHierarchyId']
    } else {
      this.fromWhichPage = '';
      this.payableNumber = '';
    }

    // Mihir - changes for auth

    this.userInfo = this.sessionStorageService.getObjectValue('userInfo') ? this.sessionStorageService.getObjectValue('userInfo') : null;

    this.isTEMUser = this.locationService.isUserHasTEMUserRole();
    this.isRoleAccess = rolePermission(['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser', 'CustomerAdmin', 'CompanyAdmin', 'CompanyManager', 'TEMAdmin', 'TEMManager'])
    this.childInventoryAccess = rolePermission(['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser', 'CustomerAdmin', 'CompanyAdmin', 'CompanyManager', 'TEMAdmin', 'TEMManager', 'TEMUser']);
    this.isInventoryNoteAccess = rolePermission(['SuperTEMAdmin', 'SuperTEMManager', 'TEMAdmin', 'TEMManager']);
    this.hasSuperTemUsers = rolePermission(['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser']);
    this.hasTemUsers = rolePermission(['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser', 'TEMAdmin', 'TEMManager', 'TEMUser']);
    this.getTemLists();

    this.getCustomerForUser();

    if (!this.hasSuperTemUsers && !this.hasTemUsers) {
      this.isShowSearch = false;
    }

    let headerData: any = [];
    let ChildHeaderData: any = [];
    let i = 0;
    let childIndex = 0;
    _.map(this.columnDefs, (x: any) => {
      if (isValueExist(x.headerName)) {
        if (i == 0) {
          headerData.push({
            "Position": 1,
            "Title": "Service Number"
          });
          i = i + 1;
        }
        i = i + 1;

        headerData.push({ position: i, title: x.headerName });
        if (x.children) {
          _.map(x.children, (y: any) => {
            if (childIndex == 0) {
              ChildHeaderData.push({
                "Position": 1,
                "Title": "Service Number",
                "FieldName": "ServiceNumber",
                "HeaderPosition": 1
              })
              childIndex = childIndex + 1;
            }
            childIndex = childIndex + 1;
            let obj: any = {
              Position: childIndex, Title: y.headerName, FieldName: y.field, HeaderPosition: i
            }
            if (y.field == 'TotalCurrentCharges') {
              obj['FieldName'] = 'TotalCurrentChargesDisplay';
              obj['isCurrency'] = true;
            }
            if (y.field == 'PreviousBillBalance') {
              obj['FieldName'] = 'PreviousBillBalanceDisplay';
              obj['isCurrency'] = true;
            }
            ChildHeaderData.push(obj)
          })
        }
      }
    });

    this.exportAccounts = {
      ExportToExcelData: {
        HeaderData: headerData,
        ChildHeaderData: ChildHeaderData,
        fileName: this.mappedPagename
      },
      ExportToExcel: true
    };
    if (this.advanceFilter) {
      this.exportAccounts['advanceFilter'] = this.advanceFilter
    }

    if (this.userInfo) {
      this.selectedTem = this.userInfo.ManagingAccountId;

      this.selectedTemForZero = Number(this.selectedTem);
      const data = {
        target: {
          value: this.selectedTem
        }
      }

      this.onChangeTem(data)
    }
  }


  setClickFalse(event: boolean) {
    this.clickOnSearchButton = event;
  }

  onDestroyOutput(event: any) {
    if (event) {

      this.getCustomerForUser();
    }
  }
  getInventory(removeCustomerAndTemDD = false, withoutCustTEMAPICall = false, fromEditPage = false) {

    if (removeCustomerAndTemDD) {
      this.selectedTem = 'all';

      this.selectedCustomer = 'all';
    }
    if (this.variableManageService.wirelineWhichPageEnabled == 'Table') {
      this.selectedTemForZero = Number(this.selectedTem);
      if (this.selectedCustomer !== 'all')
        this.selectedCustomerForZero = Number(this.selectedCustomer);


      this.selectedTem = this.selectedTemForZero ? Number(this.selectedTemForZero) : 'all';

      this.selectedCustomer = this.selectedCustomerForZero ? Number(this.selectedCustomerForZero) : 'all';
    }
    if (this.variableManageService.wirelineWhichPageEnabled === 'Edit' && fromEditPage === false) {
      this.clickOnSearchButton = true;
    }

    this.WirelinePTableComponent?.loadNodes('', true);


  }

  inventoryButton(type: any) {
    this.buttonAction = type;
  }

  onChangeTem(event: { target: any; }, notSetAll = true) {

    if (event.target.value !== 'all') {
      this.customers = [];
      this.loadingCustomerAPI = true;
      this.selectedTemDD = event.target.value;
      this.getCustomerUser.next(null);
      this.locationService.getCustomerDropdownByNewTEM(event.target.value).pipe(takeUntil(this.getCustomerUser)).subscribe((data) => {
        if (data && data.Data.$values) {
          this.customers = data.Data.$values;
          if (notSetAll) {
            this.selectedCustomer = 'all';
          }
          this.loadingCustomerAPI = false;
        } else {
          this.loadingCustomerAPI = false;
        }
      }, error => {
        this.loadingCustomerAPI = false;
      });
    } else {
      this.customers = [];
      this.selectedCustomer = 'all';
      this.getCustomerForUser();
    }
  }

  getCustomerForUser() {

    this.getCustomerUser1.next(null);
    this.customers = [];

    this.locationService.getCustomerDropDown().pipe(takeUntil(this.getCustomerUser1)).subscribe((data) => {
      if (data && data.$values) {

        this.customers = data.$values;
      }
    });
  }

  getTemLists() {
    this.getTemListsDestroy.next(null);
    this.locationService
      .getTemLists()
      .pipe(takeUntil(this.getTemListsDestroy))
      .subscribe(
        (response: any) => {
          if (response) {
            this.tems = this.filterdTems = response.$values;

            if (this.hasSuperTemUsers) {
              let id = sessionStorage.getItem("LoggedAccountId");
              const found = this.tems.find((element: { Id: any; }) => Number(element.Id) === Number(id));
              this.tems.unshift(found);

              this.tems = this.tems.filter((object: any, index: number): boolean => {
                return object && this.tems.indexOf(object) === index;
              });
            }
          }
        },
        (error) => { }
      );
  }

  removeTab(addEditTabRemoveIndex: number) {

    this.tabsArray.splice(addEditTabRemoveIndex, 1);
    this.selectedTemTabWise.splice(addEditTabRemoveIndex, 1);
    this.tabsArray = _.cloneDeep(this.tabsArray);
    this.isChildInventory = false;
    this.selectedTemTabWise = _.cloneDeep(this.selectedTemTabWise);
    if (this.tabsArray.length === 0) {
      this.variableManageService.wirelineWhichPageEnabled = 'Table';
      this.wirelinePageName = 'Table';
      setTimeout(() => {
        this.selectedTem = this.selectedTemForZero ? Number(this.selectedTemForZero) : 'all';
        this.selectedCustomer = this.selectedCustomerForZero ? Number(this.selectedCustomerForZero) : 'all';
      }, 100);
    }
    setTimeout(() => {

      if (addEditTabRemoveIndex < this.selectedMainTab) {
        if (this.tabsArray.length > 1) {
          if (this.tabsArray.length < addEditTabRemoveIndex || this.tabsArray.length === addEditTabRemoveIndex) {
            this.selectedMainTab = this.tabsArray.length;
          } else {
            if (this.selectedMainTab > addEditTabRemoveIndex && this.tabsArray.length > 2) {
              this.selectedMainTab = this.selectedMainTab - 1;
            } else {
              this.selectedMainTab = addEditTabRemoveIndex + 1;
            }
          }
        } else if (this.tabsArray.length === 1 || this.tabsArray.length < 1) {
          this.selectedMainTab = 1;
        }
      }
      if (this.selectedMainTab < addEditTabRemoveIndex) {
        this.selectedMainTab = this.selectedMainTab - 1;
        if (this.tabsArray.length > 2) {
          if (this.selectedMainTab === this.tabsArray.length + 1) {
            this.selectedMainTab = this.selectedMainTab = 1;
          }
        }
      }

      if (addEditTabRemoveIndex === 0 && this.tabsArray.length === 0) {
        this.selectedMainTab = 0;
      }

      if (this.tabsArray.length > 0 && this.selectedMainTab === -1) {
        this.selectedMainTab = 0;
      }
      this.selectedCustomer = 'all';
      this.selectedTem = 'all';

      if (this.tabsArray.length) {
        this.tabsArray[this.selectedMainTab - 1]['child'] == 0 ? this.isInventoryPage = true : this.isInventoryPage = false;
        this.tabsArray[this.selectedMainTab - 1]['child'] == 1 ? this.isAssignmentsTab = true : this.isAssignmentsTab = false;
        this.tabsArray[this.selectedMainTab - 1]['child'] == 2 ? this.isInventoryNotes = true : this.isInventoryNotes = false;
        this.tabsArray[this.selectedMainTab - 1]['child'] == 3 ? this.isChildInventory = true : this.isChildInventory = false;
      }
    }, 6);
    this.changeParentTab(addEditTabRemoveIndex);
  }


  goToPage(to: { value: any; url: any; }) {
    this.selectedButton = to.value;
    this.router.navigate([to.url]);
  }
  addNewWireline(tabaction: any) {
    this.tabsArray.push({ tabType: tabaction, rowData: '', pageName: 'newWireline' });
    this.selectedMainTab = this.tabsArray.length;
    this.variableManageService.wirelineWhichPageEnabled = 'New';
    if (this.selectedTem === 'all') {
      this.selectedTemTabWise.push('');
    } else {
      this.selectedTemTabWise.push(Number(this.selectedTem));
    }
  }

  exportAccountData($event: any) {
    this.exportRetrievalData = $event;
  }

  isBillingAccountExist(data: any) {
    this.accountExist = data;
  }

  serachInventory() {
    this.WirelinePTableComponent.loadNodes(this.WirelinePTableComponent.pTableContain, true);
  }

  onBtnExportDataAsExcel() {

    this.WirelinePTableComponent.setColumnDefs();
    this.isAccountsExport = true;
    this.wirelineService.getInventoryDataExport(this.exportRetrievalData)
      .subscribe({
        next: data => {
          this.isAccountsExport = false;
          let bolbUrl = URL.createObjectURL(data);
          var link = document.createElement("a");
          link.setAttribute("href", bolbUrl);
          link.setAttribute("download", this.mappedPagename + ".xlsx");
          link.style.display = "none";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        
        },
        error: error => {
          this.isAccountsExport = false;
          
        }
      });


  }

  addServiceType() {
    const dialogRef = this.dialog.open(AddServiceTypeComponent, {
      width: '900px',
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
      }
    });
  }


  childClicked(data: { data: { ChildInventoryId: any; }; }, i: any) {
    this.selectedChild = 0;
    const childId = (data && data.data && data.data.ChildInventoryId) ? data.data.ChildInventoryId : 'child';

    this.onCellDoubleClicked('Edit', data, childId, true);
  }

  onCellDoubleClicked(tabType = '', rowData: any, childId = '', fromChildTab = false) {
    this.tabsContractArray = [];
    if (tabType === 'Edit') {
      this.selectedChild = 0;
    }
    
    const newTab = {
      parent: this.selectedMainTab,
      tabType: tabType,
      rowData: rowData,
      child: this.selectedChild,
      parentServiceID: rowData?.node?.parent?.data?.ServiceNumber ? rowData?.node.parent.data.ServiceNumber : '',
      childInventoryId: childId || (rowData?.data?.ChildInventoryId ? rowData.data.ChildInventoryId : ''),
      fromChildTab: fromChildTab
    };
    
    this.tabsArray.push(newTab);
    
    newTab.child == 0 ? this.isInventoryPage = true : this.isInventoryPage = false;
    newTab.child == 1 ? this.isAssignmentsTab = true : this.isAssignmentsTab = false;
    newTab.child == 2 ? this.isInventoryNotes = true : this.isInventoryNotes = false;
    newTab.child == 3 ? this.isChildInventory = true : this.isChildInventory = false;

    this.variableManageService.wirelineWhichPageEnabled = 'Edit';

    setTimeout(() => {
      this.selectedMainTab = this.tabsArray.length;
    }, 6);
  }

  childrenContractChange(event: any) {
    this.selectedChild = null;
    this.selectedContractChild = event;
  }
  addWirelineFromData(formData: any, i: string | number) {

    if (this.tabsArray && this.tabsArray[i] && this.tabsArray[i].tabType && this.tabsArray[i].tabType !== 'Edit') {
      if (this.tabsArray[i]) {
        this.tabsArray[i].rowData = formData;
      }
    }
  }
  onLoadContractInventory($event: any) {
    this.sendDataToLinkPopup = $event;
  }

  disableLinkDialog($event: boolean) {
    this.isDisablLinkInventory = $event;
  }
  LinkInventoryCDialog(from?: any) {
    const dialogRef = this.dialog.open(LinkInventoryCDialogComponent, {
      width: '1200px',
      data: {
        colseButton: true,
        whichPage: from,
        data: this.sendDataToLinkPopup
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result.IsLinkedDisplay === 'Yes') {
        this.selectedContractChild = 2;
        this.tabsContractArray.push({ tabType: 'contract', rowData: result, selectedChild: 13, docType: null, addendumId: null, pageName: 'Contract Inventory-detail', imgSrc: 'assets/images/Contract/fa-solid-fa-file-lock.svg' });
      }
      if (checkIsValueExists(result)) {
        this.variableManageService.setCallAPIInventoryData('true');
      }
    });
  }

  onSaveSendDataParent($event: any, i: string | number) {
    if (this.tabsArray && this.tabsArray[i] && this.tabsArray[i].tabType === 'Edit') {
      if (this.tabsArray[i].rowData.data) {
        this.tabsArray[i].rowData.data = $event;
      } else {
        this.tabsArray[i].rowData = $event;
      }
    }
  }
  paramsReset() {
    this.params = {};
  }
  ngOnDestroy(): any {
    this.variableManageService.wirelineWhichPageEnabled = 'Table';
    this.getCustomerUser.next(null);
    this.getCustomerUser.complete();
    this.getCustomerUser1.next(null);
    this.getCustomerUser1.complete();
    this.getTemListsDestroy.next(null);
    this.getTemListsDestroy.complete();
    this.geAllCustomerUrlDestroy.next(null);
    this.geAllCustomerUrlDestroy.complete();
    this.getAllCustomerListByTEMId.next(null);
    this.getAllCustomerListByTEMId.complete();
    this._unsubscribeInventory.next(null);
    this._unsubscribeInventory.complete();
    this.variableManageService.setCallAPIInventoryData('false');
  }

  filterCustomerGridByTEMId() {
    this.rowData = [];
    this.stopSpinner = false;
    if (this.selectedTem && this.selectedTem != 'all') {
      this.getAllCustomerListByTEMId.next(null);
      this.locationService
        .getAllCustomerListByTEMId(this.selectedTem)
        .pipe(takeUntil(this.getAllCustomerListByTEMId))
        .subscribe({
          next: (data) => {
            if (data && data.$values) {
              this.rowData = data.$values;
              this.stopSpinner = true;
            }
          },
          error: (error) => {
            if (error.status === 404) {
              this.stopSpinner = true;
            }
          },
        });
    }
  }

  childInventory(type: any) {
    this.buttonAction = type;
  }

  onChildInventory(event: boolean) {
    event == true ? this.isRowSelected = true : this.isRowSelected = false;
  }

  isInventoryNoteExist(event: boolean) {
    event == true ? this.isInventoryNote = true : this.isInventoryNote = false;
  }

  changeParentTab(event: number) {
    this.buttonAction = '';
    this.selectedMainTab = event;
    this.tabsContractArray = [];

    this.getCustomerForUser();
    if (event === 0) {
      this.variableManageService.wirelineWhichPageEnabled = 'Table';
      this.wirelinePageName = 'Table';
      setTimeout(() => {
        this.selectedTem = this.selectedTemForZero ? Number(this.selectedTemForZero) : 'all';

        this.selectedCustomer = this.selectedCustomerForZero ? Number(this.selectedCustomerForZero) : 'all';
      }, 100);
      this.disableTemSearch = false;
      this.disableTemSearchDD = false;
      this.getInventory(true);
      this.childRecord = '';

    } else {
      const clickedInventory = event - 1;
      if (this.tabsArray[clickedInventory]) {
        this.selectedChild = this.tabsArray[clickedInventory].child;
        
        if (this.tabsArray[clickedInventory].rowData?.data?.ChildInventoryId) {
          this.childRecord = this.tabsArray[clickedInventory].rowData.data.ChildInventoryId;
        } else {
          this.childRecord = '';
        }
      }
      this.variableManageService.wirelineWhichPageEnabled = this.tabsArray[event - 1].tabType;
    }
    if (this.hasSuperTemUsers || this.hasTemUsers) {
      let data = document.getElementsByClassName('custom-select');
      setTimeout(() => {
        if (data.length > 0) {
          this.isShowSearch = true;
        }
        else {
          this.isShowSearch = false;
        }
      }, 6);
    }

    if (this.tabsArray.length > 1) {
      let clickedInventory = event - 1;
      const matchRecord = this.tabsArray.find((a: any, index: any) => index === clickedInventory);
     
      this.isSelectedChild = matchRecord;
      if (matchRecord) {
        matchRecord.rowData?.data?.ChildInventoryId ? this.isChildDisable = true : this.isChildDisable = false;
        matchRecord.child == 0 ? this.isInventoryPage = true : this.isInventoryPage = false;
        matchRecord.child == 3 ? this.isChildInventory = true : this.isChildInventory = false;
        matchRecord.child == 2 ? this.isInventoryNotes = true : this.isInventoryNotes = false;
        matchRecord.child == 1 ? this.isAssignmentsTab = true : this.isAssignmentsTab = false;
      }

    } else if (this.tabsArray.length === 1) {
      this.tabsArray[0]?.rowData?.data?.ChildInventoryId ? this.isChildDisable = true : this.isChildDisable = false;
    }
  }
  editContract() {
    this.isEditClicked = true;
  }
  contractdialogOpenValue(data: { value: boolean; redirectTab: any; }) {
    this.isEditClicked = data.value;
    if (data.redirectTab) {
      this.isOpenContainerTab();
    }
  }
  childrenChange(event: number, i: any) {
    // Only block changing tabs if this is a child inventory opened from Child Inventory tab
    if (this.selectedMainTab > 0 && 
        this.tabsArray[this.selectedMainTab - 1] && 
        this.tabsArray[this.selectedMainTab - 1].childInventoryId &&
        this.tabsArray[this.selectedMainTab - 1].fromChildTab) {
      return;
    }
    
    this.buttonAction = '';
    this.selectedChild = event;
    
    if (this.selectedMainTab > 0 && this.tabsArray[this.selectedMainTab - 1]) {
      this.tabsArray[this.selectedMainTab - 1]['parent'] = this.selectedMainTab - 1;
      this.tabsArray[this.selectedMainTab - 1]['child'] = event;
      
      this.tabsArray[this.selectedMainTab - 1]['child'] == 0 ? this.isInventoryPage = true : this.isInventoryPage = false;
      this.tabsArray[this.selectedMainTab - 1]['child'] == 1 ? this.isAssignmentsTab = true : this.isAssignmentsTab = false;
      this.tabsArray[this.selectedMainTab - 1]['child'] == 2 ? this.isInventoryNotes = true : this.isInventoryNotes = false;
      this.tabsArray[this.selectedMainTab - 1]['child'] == 3 ? this.isChildInventory = true : this.isChildInventory = false;
    }
    
    if (event == 7) {
      this.selectedContractChild = 0;
    }
  }

  isSetNotAction(value: any) {
    this.buttonAction = value;
  }

  setInventoryNotes(type: any) {
    this.buttonAction = '';
    this.buttonAction = type;
  }

  onEditedChildInventory(event: any, index?: number) {
    if (event) {
      this.getInventory(false, true, true)
    } else {
      this.getInventory(true, false, true);
      this.tabsArray.splice(index, 1);
      setTimeout(() => {
        this.selectedMainTab = 0;
      }, 3);
    }

  }

  setTemDDValueEvent(data: string, i: any) {
    if (this.selectedMainTab > 0 && data != '') {
      this.selectedTem = data;

    } else if (data == '' && this.selectedMainTab <= 0) {
      this.selectedTem = 'all';

    }



    if (this.selectedTem) {
      const data = {
        target: {
          value: this.selectedTem
        }
      }

      this.onChangeTem(data, false)
    }

  }

  setCustomerDDValueEvent(data: string, i: any) {

    if (this.selectedMainTab > 0 && data != '') {
      this.selectedCustomer = data;

    } else if (data == '' && this.selectedMainTab <= 0) {
      this.selectedCustomer = 'all';
    }



  }


  onWirelineAddEvent(event: { [x: string]: any; }, index: any) {
    if (event) {
      this.tabsArray.splice(index, 1);
      this.tabsArray = _.cloneDeep(this.tabsArray);
      event['ChildInventoryId'] = null;
      event['serviceNumber'] = event['ServiceNumber'];
      this.onCellDoubleClicked('Edit', event, '', false);
      this.getInventory();
    }
  }

  onWirelineEditEvent(event: any) {
    if (event) {
      this.rowDataForLink = event;
    }
  }
  onInventoryDataFetch(event: boolean) {
    event == true ? this.loadingDataFromEditApi = true : this.loadingDataFromEditApi = false
  }


  redirectTab(value: { redirectIndex: any; }) {
    setTimeout(() => {
      this.selectedChild = value.redirectIndex;
    }, 400);
  }

  removeCCSTab(i: any) {
    this.selectedChild = 4;
  }

  getIdsArray($event: any) {
    if ($event) {
      this.payload = $event;
    }
  }
}
