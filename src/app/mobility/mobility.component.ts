import { Component, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { LocationService } from 'src/app/services/location.service';
import { VariableManageService } from 'src/app/services/variable-manage.service';
import _ from 'lodash';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import moment from 'moment';
import { MobilePTableComponent } from './mobile-p-table/mobile-p-table.component';
import { WirelineService } from '../services/wireline.service';
import { SessionStorageService } from '../services/session-storage.service';
import { LocalStorageService } from '../services/local-storage.service';
import { LinkInventoryCDialogComponent } from '../customer/contracts/link-inventory-c-dialog/link-inventory-c-dialog.component';
import { checkIsValueExists, isValueExist, rolePermission } from '../services/helper';
import { SharedModule } from '../demo/shared/shared.module';
import { PrimgModule } from '../demo/shared/primeng.module';
import { AddMobilityComponent } from './add-mobility/add-mobility.component';
import { InventoryNoteTableMComponent } from './inventory-note-table-m/inventory-note-table-m.component';
import { AddBillingMComponent } from './add-mobility/add-billing-m/add-billing-m.component';
import { ContractsMComponent } from '../common/contracts-m/contracts-m.component';
import { ChangeLogComponent } from '../common/change-log/change-log.component';
import { CommonCcsComponent } from '../common/common-ccs/common-ccs.component';
import { AddEditContractsComponent } from '../customer/contracts/add-edit-contracts/add-edit-contracts.component';
import { InventoryCComponent } from '../customer/contracts/inventory-c/inventory-c.component';
import { AssignmentsMComponent } from './assignments-m/assignments-m.component';
import { DatePipe } from '@angular/common';
import { CustomPipe } from '../custom-pipe/date.pipe';

@Component({
  selector: 'app-mobility',
  templateUrl: './mobility.component.html',
  styleUrls: ['./mobility.component.scss'],
  imports: [SharedModule, PrimgModule, MobilePTableComponent, AddMobilityComponent, InventoryNoteTableMComponent, AddBillingMComponent, ContractsMComponent, ChangeLogComponent, CommonCcsComponent, AddEditContractsComponent, InventoryCComponent, AssignmentsMComponent],
  providers: [WirelineService, DatePipe, CustomPipe]
})
export class MobilityComponent implements OnInit {

  buttonOptions: any = [
    { label: 'Mobile', value: 'mobile', url: '/inventory/mobility', icon: 'fa fa-mobile-alt'},
  ];
  gridOptions = {
    headerHeight: 35,
    groupHeaderHeight: 37,
    floatingFiltersHeight: 35,
    onSortChanged: (event: any) => {
      this.onSortChanged(event);
    }
  };
  selectedTabOption = this.buttonOptions[0].value;
  selectedButton = this.buttonOptions[0].value;
  isInventoryNote: boolean = false;
  private getCustomerUser: Subject<any | null> = new Subject<any | null>();
  private getTemListsDestroy: Subject<any | null> = new Subject<any | null>();
  isDisabledExport = false;
  isDisablLinkInventory: boolean = false;
  sendDataToLinkPopup: any;
  selectedTemForZero: any;
  selectedCustomerForZero: any;
  private _unsubscribeChangelog: Subject<any> = new Subject<any>();

  public addendumId: any;
  public doctype: any;

  public sideBar;
  public columnDefs;
  customers: any = [];
  tems: any = [];
  filterdTems: any = [];
  public advanceFilter: any;
  isHideTab = true;

  public buttonAction: any;
  public services: any = [];
  public isEditClicked = false;

  sbInvoiceId: any;
  rowData1: any = [];
  tabsArray: any = [];
  tabsContractArray: any = [];
  selectedTab: any = 0;
  selectedChild: any = 0;
  selectedContractChild: any = 0;
  isShowSearch = true;
  isInventoryNotes: boolean = false;
  isInventoryDetails: boolean = false;
  isInventoryAssignmnet: boolean = false;
  disableTemSearchDD: any;
  isInventoryNoteAccess: boolean = false;
  hasSuperTemUsers: boolean = false;
  serviceIds:any = []

  rowSelection = 'multiple';
  defaultColDef = {
    editable: false,
    sortable: true,
    minWidth: 100,
    resizable: true,
    floatingFilter: true,
    flex: 1,
  };
  public autoGroupColumnDef: any = {
    headerName: 'Service Number',
    field: 'ServiceNumber',
    cellRendererParams: {
      suppressCount: true,
    },
    filterParams: {
      treeList: true,
    },
    filter: 'agTextColumnFilter',
    minWidth: 185,
    width: 185,
    resizable: true,
  };
  rowData: any = [];
  childRecord = '';
  stopSpinner: boolean = false;
  selectedTem: any = 'all';
  selectedCustomer: any = 'all';
  private _unsubscribeInventory: Subject<any> = new Subject<any>();
  @ViewChild(MobilePTableComponent) private MobilePTableComponent: MobilePTableComponent
  inventoryData: any = [];
  public getDataPath: any = (data: any) => data.dataPath;
  loadingCustomerAPI = false;
  itCallOneTime = false;
  clickOnSearchButton = false;
  selectedTemDD: any;
  wirelinePageName = 'Table';
  public exportAccounts: any;
  userInfo: any;
  columns: any = [];

  gridApi: any;
  gridColumnApi: any;
  payload: any;
  sortModel: any;
  exportRetrievalData: any;
  accountExist: any;
  temRoles = false;
  constructor(public locationService: LocationService,
    private wirelineService: WirelineService,
    private sessionStorageService: SessionStorageService,
    private localStorageService: LocalStorageService,
    public variableManageService: VariableManageService, private router: Router, public dialog: MatDialog) {

    this.sideBar = {
      toolPanels: ['columns', 'filters']
    };

    this.columnDefs = [
      {
        headerName: 'Inventory',
        children: [
          // {
          //   field: 'ServiceNumber',
          //   headerName: 'Service Number',
          //   columnGroupShow: 'close',
          //   filter: 'agTextColumnFilter',
          //   editable: false,
          //   minWidth: 170,
          //   flex: 0
          // },
          {
            field: 'BillingId',
            headerName: 'Billing ID',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'close',
            editable: false,
            minWidth: 130,
            flex: 0
          },
          {
            field: 'InventoryCustomField1',
            headerName: 'Service Custom 1',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'open',
            editable: false,
            minWidth: 150,
            flex: 0
          },
          {
            field: 'InventoryCustomField2',
            headerName: 'Service Custom 2',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'open',
            editable: false,
            minWidth: 150,
            flex: 0
          },
          {
            field: 'InventoryCustomField3',
            headerName: 'Service Custom 3',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'open',
            editable: false,
            minWidth: 150,
            flex: 0
          },
          {
            field: 'InventoryCustomField4',
            headerName: 'Service Custom 4',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'open',
            editable: false,
            minWidth: 150,
            flex: 0
          }
        ],
      },
      {
        headerName: 'Organization',
        children: [
          {
            field: 'CustomerAccountName',
            headerName: 'Customer',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'close',
            editable: false,
            minWidth: 150,
            flex: 0
          },
          {
            field: 'CompanyName',
            headerName: 'Company',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'open',
            editable: false,
            minWidth: 100,
            flex: 0,
          }
        ],
      },
      {
        headerName: 'People',
        children: [
          {
            field: 'PeopleName',
            headerName: 'Name',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 150,
            flex: 0
          },
          {
            field: 'PeopleFirstName',
            headerName: 'First Name',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'open',
            editable: false,
            minWidth: 100,
            flex: 0
          },
          {
            field: 'PeopleLastName',
            headerName: 'Last Name',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'open',
            editable: false,
            minWidth: 100,
            flex: 0
          },
          {
            field: 'PeopleStatusDisplayValue',
            headerName: 'People Status',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'open',
            editable: false,
            minWidth: 155,
            flex: 0,
          },
          {
            field: 'PeopleUserTitle',
            headerName: 'Title',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'open',
            editable: false,
            minWidth: 70,
            flex: 0
          },
          {
            field: 'EmployeeId',
            headerName: 'Employee ID',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'open',
            editable: false,
            minWidth: 100,
            flex: 0
          },
          {
            field: 'ManagerName',
            headerName: 'Manager',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'open',
            editable: false,
            minWidth: 70,
            flex: 0
          },
          {
            field: 'ManagerEmail',
            headerName: 'Manager Email',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'open',
            editable: false,
            minWidth: 150,
            flex: 0
          },
          {
            field: 'Department',
            headerName: 'Department',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'open',
            editable: false,
            minWidth: 70,
            flex: 0
          },
          {
            field: 'PeopleCustomField1',
            headerName: 'People Custom 1',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'open',
            editable: false,
            minWidth: 180,
            flex: 0
          },
          {
            field: 'PeopleCustomField2',
            headerName: 'People Custom 2',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'open',
            editable: false,
            minWidth: 180,
            flex: 0
          },
          {
            field: 'PeopleCustomField3',
            headerName: 'People Custom 3',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'open',
            editable: false,
            minWidth: 180,
            flex: 0
          },
          {
            field: 'PeopleCustomField4',
            headerName: 'People Custom 4',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'open',
            editable: false,
            minWidth: 180,
            flex: 0
          },
        ],
      },
      {
        headerName: 'Contact',
        children: [
          {
            field: 'PeopleEmail',
            headerName: 'Email',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'close',
            editable: false,
            minWidth: 180,
            flex: 0
          }
        ],
      },
      {
        headerName: 'Vendor',
        children: [
          {
            field: 'VendorAccountName',
            headerName: 'Vendor',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'close',
            editable: false,
            minWidth: 108,
            flex: 0
          },
          {
            field: 'ParentVendorAccountName',
            headerName: 'Parent Vendor',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'open',
            editable: false,
            minWidth: 160,
            flex: 0,
          },
          {
            field: 'MainAccountNumber',
            headerName: 'Main Account Number',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'open',
            editable: false,
            minWidth: 230,
            flex: 0,
          },
          {
            field: 'SubAccountNumber',
            headerName: 'Sub Account Number',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'open',
            editable: false,
            minWidth: 230,
            flex: 0,
          },
          {
            field: 'PayableAccountNumber',
            headerName: 'Payable Account Number',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'open',
            editable: false,
            minWidth: 250,
            flex: 0,
          }
        ],
      },
      {
        headerName: 'Vendor Product',
        children: [
          {
            field: 'VendorProductName',
            headerName: 'Vendor Product',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'close',
            editable: false,
            minWidth: 250,
            flex: 0
          },
          {
            field: 'ServiceName',
            headerName: 'Service',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'open',
            editable: false,
            minWidth: 80,
            flex: 0
          },
          {
            field: 'ServiceType',
            headerName: 'Service Type',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'open',
            editable: false,
            minWidth: 120,
            flex: 0
          },
          {
            field: 'ProductName',
            headerName: 'Product',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'open',
            editable: false,
            minWidth: 80,
            flex: 0
          },
          {
            field: 'ProductType',
            headerName: 'Product Type',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'open',
            editable: false,
            minWidth: 250,
            flex: 0
          }
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
            cellStyle: {display: 'flex !important', 'justify-content': 'end','padding-right':'50px'},
            valueFormatter: (params: any) => this.currencyFormatter(params.data.TotalCurrentCharges, params.data.CurrencySymbol),
          }
        ],
      },
      {
        headerName: 'Status',
        children: [
          {
            field: 'InventoryStatusDisplayText',
            headerName: 'Status',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'close',
            editable: false,
            minWidth: 120,
            flex: 0
          },
          {
            field: 'StartDate',
            headerName: 'Service Start Date',
            filter: 'agDateColumnFilter',
            columnGroupShow: 'open',
            editable: false,
            minWidth: 185,
            flex: 0,
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
            valueGetter(params: any) {
              if (params.data.StartDate) {
                return moment(params.data && params.data.StartDate).format('MM/DD/YYYY');
              }
              return '';
            }
          },
          {
            field: 'EndDate',
            headerName: 'Disconnection Date',
            filter: 'agDateColumnFilter',
            columnGroupShow: 'open',
            editable: false,
            minWidth: 180,
            flex: 0,
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
            valueGetter(params: any) {
              if (params.data.EndDate) {
                return moment(params.data && params.data.EndDate).format('MM/DD/YYYY');
              }
              return '';
            }
          },
          {
            field: 'InvoiceCyclesRemaining',
            headerName: 'Invoice Cycles Remaining',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'open',
            editable: false,
            minWidth: 220,
            flex: 0
          },
          {
            field: 'ContractStartDate',
            headerName: 'Contract Start Date',
            filter: 'agDateColumnFilter',
            columnGroupShow: 'open',
            editable: false,
            minWidth: 185,
            flex: 0,
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
            valueGetter(params: any) {
              if (params.data.ContractStartDate) {
                return moment(params.data && params.data.ContractStartDate).format('MM/DD/YYYY');
              }
              return '';
            }
          },
          {
            field: 'ContractEndDate',
            headerName: 'Contract End Date ',
            filter: 'agDateColumnFilter',
            columnGroupShow: 'open',
            editable: false,
            minWidth: 185,
            flex: 0,
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
            valueGetter(params: any) {
              if (params.data.ContractEndDate) {
                return moment(params.data && params.data.ContractEndDate).format('MM/DD/YYYY');
              }
              return '';
            }
          }
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
            field: 'LocationName',
            headerName: 'Location Name',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'close',
            editable: false,
            minWidth: 180,
            flex: 0
          },
          {
            field: 'Address1',
            headerName: 'Address One',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'open',
            editable: false,
            minWidth: 150,
            flex: 0
          },
          {
            field: 'Address2',
            headerName: 'Address Two',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'open',
            editable: false,
            minWidth: 150,
            flex: 0
          },
          {
            field: 'City',
            headerName: 'City',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'open',
            editable: false,
            minWidth: 100,
            flex: 0
          },
          {
            field: 'StateName',
            headerName: 'State/Province/Region',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'open',
            editable: false,
            minWidth: 205,
            flex: 0
          },
          {
            field: 'PostalCode',
            headerName: 'Zip/Postal Code',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'open',
            editable: false,
            minWidth: 100,
            flex: 0
          },
          {
            field: 'LocationPrimaryDisplay',
            headerName: 'Primary',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'open',
            editable: false,
            minWidth: 80,
            flex: 0
          }
        ],
      }

    ];

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

  wirelinePageNameFn($event: any) {
    this.wirelinePageName = $event;
  }
  onSortChanged(event: any) {
    const sortModel = event.api.getSortModel();
    this.sortModel = sortModel;
  }
  disableLinkDialog($event: any) {
    this.isDisablLinkInventory = $event;
  }
  onLoadContractInventory($event: any) {
    this.sendDataToLinkPopup = $event;
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
        this.tabsContractArray.push({ tabType: 'contract', rowData: result, selectedChild: 12, docType: null, addendumId: null, pageName: 'Contract Inventory-detail', imgSrc: 'assets/images/Contract/fa-solid-fa-file-lock.svg' });
      }
      if (checkIsValueExists(result)) {
        this.variableManageService.setCallAPIInventoryData('true');
      }
    });
  }

  currencyFormatter(currency: any, sign: any) {
    if (currency !== null) {
      var sansDec = currency.toFixed(2);
      return sign + `${sansDec}`;
    } else {
      return '';
    }
  }
  isSetNotAction(value: any) {
    this.buttonAction = value;
  }

  setInventoryNotes(type: any) {
    this.buttonAction = '';
    this.buttonAction = type;
  }

  setClickFalse(event: any) {
    this.clickOnSearchButton = event;
  }
  contractdialogOpenValue(data: any) {
    this.isEditClicked = data.value;
    if (data.redirectTab) {
      this.isOpenContainerTab();
    }
  }

  isOpenContainerTab($event?: any) {
    this.tabsContractArray = [];
    this.tabsContractArray.push({ tabType: 'contract', selectedChild: 10, docType: $event ? $event.data.data.Type : null, addendumId: $event ? $event.data.data.Id : null, pageName: 'Contract Details', imgSrc: 'assets/images/Contract/fa-solid-fa-file-lock.svg' });
    this.tabsContractArray.push({ tabType: 'contract', selectedChild: 11, docType: $event ? $event.data.data.Type : null, addendumId: $event ? $event.data.data.Id : null, pageName: 'Contract Inventory', imgSrc: 'assets/images/Contract/fa-solid-fa-file-lock.svg' });
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
      this.selectedChild = 6;
    }
  }

  childrenContractChange(event: any) {
    this.selectedChild = null;
    this.selectedContractChild = event;
  }

  ngOnInit(): void {
    // Mihir - changes for auth
    // this.userInfo = this.sessionStorageService.getObjectValue('userInfo')
    // ? this.sessionStorageService.getObjectValue('userInfo')
    // : this.localStorageService.getObjectValue('userInfo')
    //   ? this.localStorageService.getObjectValue('userInfo')
    //   : null;

    this.userInfo = this.sessionStorageService.getObjectValue('userInfo') ? this.sessionStorageService.getObjectValue('userInfo')  : null;

    this.getTemLists();
    this.getCustomerForUser();
    this.temRoles = rolePermission(['TEMAdmin', 'TEMUser', 'TEMManager']);
    this.isInventoryNoteAccess = rolePermission(['SuperTEMAdmin', 'SuperTEMManager', 'TEMAdmin', 'TEMManager']);
    this.hasSuperTemUsers = rolePermission(['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser']);
  
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
            // ChildHeaderData.push({ Position: childIndex, Title: y.headerName, FieldName: y.field, HeaderPosition: i })
            let obj: any = {
              Position: childIndex, Title: y.headerName, FieldName: y.field, HeaderPosition: i
            }
            if(y.field == 'TotalCurrentCharges') {
              obj['FieldName'] = 'TotalCurrentChargesDisplay';
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
        fileName: "Mobility"
      },
      ExportToExcel: true
    };
    if (this.advanceFilter) {
      this.exportAccounts['advanceFilter'] = this.advanceFilter
    }
    if(this.userInfo) {
      this.selectedTem = this.userInfo.ManagingAccountId;
      this.selectedTemForZero = Number(this.selectedTem);
      const data = {
        target :{
          value: this.selectedTem
        }
      }
      this.onChangeTem(data)
    }

  }

  getCustomerForUser() {
    this.getCustomerUser.next(null);
    this.customers = [];
    this.locationService.getCustomerDropDown().pipe(takeUntil(this.getCustomerUser)).subscribe((data) => {
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
              const found = this.tems.find((element: any) => Number(element.Id) === Number(id));
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
  isInventoryNoteExist(event: any) {
    event == true ? this.isInventoryNote = true : this.isInventoryNote = false;
  }
  onChangeTem(event: any) {
    if (event.target.value !== 'all') {
      this.loadingCustomerAPI = true;
      this.selectedTemDD = event.target.value;
      this.getCustomerUser.next(null);
      this.locationService.getCustomerDropdownByNewTEM(event.target.value).pipe(takeUntil(this.getCustomerUser)).subscribe((data) => {
        if (data && data.Data.$values) {
          this.loadingCustomerAPI = false;
          this.customers = data.Data.$values;
          this.selectedCustomer = 'all';
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
  getInventory(fromEditPage = false) {
    if (fromEditPage) {
      this.selectedTem = this.selectedTemForZero ? Number(this.selectedTemForZero) : 'all';
      this.selectedCustomer = this.selectedCustomerForZero ? Number(this.selectedCustomerForZero) : 'all';
    }

    if (this.variableManageService.mobilityWhichPageEnabled === 'Edit' && fromEditPage === false) {
      this.clickOnSearchButton = true;
    } 
    if(this.variableManageService.mobilityWhichPageEnabled == 'Table') {
      this.selectedTemForZero = Number(this.selectedTem);
      if(this.selectedCustomer !== 'all')
        this.selectedCustomerForZero = Number(this.selectedCustomer);
    }
    this.rowData = [];
    this.stopSpinner = false;
    const data: any = {};
    if (this.selectedTem != 'all') {
      data['TemAccountId'] = parseInt(this.selectedTem);
    }
    if (this.selectedCustomer != 'all') {
      data['customerAccountId'] = parseInt(this.selectedCustomer);
    }
    data['serviceIds'] = this.serviceIds;


    this.serachInventory();

  }
  onFilterChanged(data: any) {

    let filterarr;
    let filterArray:any = [];
    let filterArrayDate:any = [];
    let filterArrayNumber:any = [];

    this.exportAccounts['advanceFilter'] = [];
    this.exportAccounts['advanceDateFilter'] = [];
    this.exportAccounts['advanceNumberFilter'] = [];

    _.forEach(data.api.filterManager.activeAdvancedFilters, (item: any, i) => 
    {
      if(item.filterNameKey == "dateFilter") {
       let arrDate = {
          filterKey: item.dateFilterParams.column.colId,
          filterOptionType1: item.appliedModel['type'] ? item.appliedModel['type'] : item.appliedModel['condition1'].type ? item.appliedModel['condition1'].type : null,
          filterOptionValue1: (item.appliedModel && item.appliedModel.dateFrom) ? item.appliedModel.dateFrom.split(' ')[0].toString() : (item.appliedModel['condition1'] && item.appliedModel['condition1']['dateFrom']) ? item.appliedModel['condition1'].dateFrom.split(' ')[0].toString() : null,
          filterOptionValue1_2: (item.appliedModel && item.appliedModel.dateTo) ? item.appliedModel.dateTo.split(' ')[0].toString() : (item.appliedModel['condition1'] && item.appliedModel['condition1']['dateTo']) ? item.appliedModel['condition1']?.dateTo.split(' ')[0].toString() : null,
          filterOperationType: item.appliedModel.condition1 ? item.appliedModel.operator : item.defaultJoinOperator,
          filterOptionType2: item.appliedModel['condition2']?.type ? item.appliedModel['condition2']?.type : null,
          filterOptionValue2: (item.appliedModel['condition2'] && item.appliedModel['condition2'].dateFrom) ? item.appliedModel['condition2']?.dateFrom.split(' ')[0].toString() : null,
          filterOptionValue2_2: (item.appliedModel['condition2'] && item.appliedModel['condition2'].dateTo) ? item.appliedModel['condition2']?.dateTo.split(' ')[0].toString() : null
        }
        filterArrayDate.push(arrDate);
      } else if(item.filterNameKey == "numberFilter") {
        let arrNumber = {
          filterKey: item.numberFilterParams.column.colId,
          filterOptionType1: item.appliedModel['type'] ? item.appliedModel['type'] : item.appliedModel['condition1'].type ? item.appliedModel['condition1'].type : null,
          filterOptionValue1: item.appliedModel['filter'] ? item.appliedModel['filter'] : item.appliedModel['condition1']['filter'] ? item.appliedModel['condition1'].filter : null,
          filterOptionValue1_2 : item.appliedModel['filter'] ? item.appliedModel['filter'] : item.appliedModel['condition1']['filterTo'] ? item.appliedModel['condition1']?.filterTo : null,
          filterOperationType: item.appliedModel['operator'] ? item.appliedModel['operator'] : 'AND',
          filterOptionType2: item.appliedModel['condition2']?.type ? item.appliedModel['condition2']?.type : null,
          filterOptionValue2: item.appliedModel['condition2']?.filter ? item.appliedModel['condition2']?.filter : null,
          filterOptionValue2_2: item.appliedModel['condition2']?.filterTo ? item.appliedModel['condition2']?.filterTo : null
        }
        filterArrayNumber.push(arrNumber)
      } else {
        filterarr = {
          filterKey: item.textFilterParams ? (item.textFilterParams.column.colId == 'ag-Grid-AutoColumn' ? 'ServiceNumber' : item.textFilterParams.column.colId) : item.numberFilterParams.column.colId,
          filterOptionType1: item.appliedModel.condition1 ? item.appliedModel.condition1.type : item.appliedModel.type,
          filterOptionValue1: item.appliedModel.condition1 ? item.appliedModel.condition1.filter :  item.appliedModel.filter,
          filterOperationType: item.appliedModel.condition1 ? item.appliedModel.operator : item.defaultJoinOperator,
          filterOptionType2: item.appliedModel.condition2 ? item.appliedModel.condition2.type : null,
          filterOptionValue2: item.appliedModel.condition2 ? item.appliedModel.condition2.filter :  null
        }
        filterArray.push(filterarr);
      }
    });

    this.advanceFilter = filterarr;
    if(filterArrayDate && filterArrayDate.length > 0) {
      this.exportAccounts['advanceDateFilter'] = filterArrayDate;
    }
    if(filterArray && filterArray.length > 0) {
      this.exportAccounts['advanceFilter'] = filterArray;
    }
    if(filterArrayNumber && filterArrayNumber.length > 0) {
      this.exportAccounts['advanceNumberFilter'] = filterArrayNumber;
    }

  }

  
  onBtnExportDataAsExcel() {

    this.MobilePTableComponent.setColumnDefs();
    this.isDisabledExport = true;
    this.wirelineService.getInventoryDataExport(this.exportRetrievalData)
      .subscribe({
        next: data => {
          this.isDisabledExport = false;
          let bolbUrl = URL.createObjectURL(data);
          var link = document.createElement("a");
          link.setAttribute("href", bolbUrl);
          link.setAttribute("download", "Mobility.xlsx");
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

 
  processData(data: any[]) {
    const flattenedData: any[] = [];
    const flattenRowRecursive = (row: any, parentPath: string[]) => {
      const dataPath = [...parentPath, row.$id];
      flattenedData.push({ ...row, dataPath });
      if (row.ChildInventory && row.ChildInventory.$values.length > 0) {
        row.ChildInventory.$values.forEach((underling: any) => {
          flattenRowRecursive(underling, dataPath)
        }
        );
      }
    };
    data.forEach((row) => flattenRowRecursive(row, []));
    return flattenedData;
  }
  addNewWireline(tabaction: any) {
    this.tabsArray.push({ tabType: tabaction, rowData: '', pageName: 'newWireline' });
    this.selectedTab = this.tabsArray.length;
    this.variableManageService.mobilityWhichPageEnabled = 'New';
  }

  removeTab(tabIndex: any) {
    this.tabsArray.splice(tabIndex, 1);
    this.tabsArray = _.cloneDeep(this.tabsArray);

    if (this.tabsArray.length === 0) {
      this.variableManageService.mobilityWhichPageEnabled = 'Table';
      setTimeout(() => {
        this.selectedTem = this.selectedTemForZero ? Number(this.selectedTemForZero) : 'all';
        this.selectedCustomer = this.selectedCustomerForZero ? Number(this.selectedCustomerForZero) : 'all';
      }, 100);
    }
    setTimeout(() => {
      this.selectedTab = this.tabsArray.length;
      this.selectedCustomer = 'all';
      this.selectedTem = 'all';
    }, 6);
  }

  goToPage(to: any) {
    this.selectedButton = to.value;
    this.selectedTabOption = to.value;
    this.router.navigate([to.url]);
  }

  getIdsArray($event: any) {
    if ($event) {
      this.payload = $event;
    }
  }

  ngOnDestroy(): any {
    this.variableManageService.mobilityWhichPageEnabled = 'Table';
    this.getCustomerUser.next(null);
    this.getCustomerUser.complete();
    this.getTemListsDestroy.next(null);
    this.getTemListsDestroy.complete();
    this._unsubscribeInventory.next(null);
    this._unsubscribeInventory.complete();
    this._unsubscribeChangelog.next(null);
    this._unsubscribeChangelog.complete();
    this.variableManageService.setCallAPIInventoryData('false');
  }
  onCellDoubleClicked(tabType = '', rowData: any) {
    this.tabsContractArray = [];
    this.childRecord = (rowData && rowData.data && rowData.data.ChildInventoryId) ? rowData.data.ChildInventoryId : null;
    this.selectedChild = 0;
    this.tabsArray.push(
      {
        parent: this.selectedTab,
        tabType: tabType,
        rowData: rowData,
        child: 0,
        parentServiceID: rowData?.node?.parent?.data?.ServiceNumber ? rowData?.node.parent.data.ServiceNumber : ''
      });
    this.variableManageService.mobilityWhichPageEnabled = 'Edit';

    setTimeout(() => {
      this.selectedTab = this.tabsArray.length;
    }, 6);

  }

  changeParentTab(event: any) {
    this.selectedTab = event;
    this.isEditClicked = false;
    this.tabsContractArray = [];
    if (event === 0) {
      this.variableManageService.mobilityWhichPageEnabled = 'Table';
      this.isInventoryNotes = false;
      this.wirelinePageName = 'Table';
      // this.selectedTem = 'all';
      // this.selectedCustomer = 'all';
      setTimeout(() => {
        this.selectedTem = this.selectedTemForZero ? Number(this.selectedTemForZero) : 'all';
        this.selectedCustomer = this.selectedCustomerForZero ? Number(this.selectedCustomerForZero) : 'all';
      }, 100);
    } else {
      this.selectedChild = this.tabsArray[this.selectedTab - 1].child;
      this.getCustomerForUser();
      this.variableManageService.mobilityWhichPageEnabled = this.tabsArray[event - 1].tabType;
    }

    if (this.tabsArray.length > 1) {
      let clickedInventory = event - 1;
      const matchRecord = this.tabsArray.find((a: any, index: any) => index === clickedInventory);
      matchRecord?.child == 2 ? this.isInventoryNotes = true : this.isInventoryNotes = false;
      this.childRecord = (matchRecord?.rowData?.data?.ChildInventoryId) ? matchRecord?.rowData.data.ChildInventoryId : null;
    } else {
      this.childRecord = (this.tabsArray[0] && this.tabsArray[0].rowData && this.tabsArray[0].rowData.data && this.tabsArray[0].rowData.data.ChildInventoryId) ? this.tabsArray[0].rowData.data.ChildInventoryId : null;
    }
  }

  childrenChange(event: any) {
    this.selectedChild = event;
    this.tabsArray[this.selectedTab - 1]['parent'] = this.selectedTab - 1;
    this.tabsArray[this.selectedTab - 1]['child'] = event;
    this.tabsArray[this.selectedTab - 1]['child'] == 0 ? this.isInventoryDetails = true : this.isInventoryDetails = false;
    this.tabsArray[this.selectedTab - 1]['child'] == 1 ? this.isInventoryAssignmnet = true : this.isInventoryAssignmnet = false;
    this.tabsArray[this.selectedTab - 1]['child'] == 2 ? this.isInventoryNotes = true : this.isInventoryNotes = false;
    if (event == 6) {
      this.selectedContractChild = 0;
    }
  }

  editContract() {
    this.isEditClicked = true;
  }
  addMobilityFromData(formData: any, i: any) {

    if (this.tabsArray && this.tabsArray[i] && this.tabsArray[i].tabType && this.tabsArray[i].tabType !== 'Edit') {
      if (this.tabsArray[i]) {
        this.tabsArray[i].rowData = formData;
      }
    }
  }


  onSaveSendDataParent($event: any, i: any) {
    if (this.tabsArray && this.tabsArray[i] && this.tabsArray[i].tabType === 'Edit') {
      if (this.tabsArray[i].rowData.data) {
        this.tabsArray[i].rowData.data = $event;
      } else {
        this.tabsArray[i].rowData = $event;
      }
    }
  }

  setCustomerDDValueEvent(data: any, i: any) {

    if (this.selectedTab > 0 && data != '') {
      // this.getCustomerForUser();
      this.selectedCustomer = data;
    } else if (data == '' && this.selectedTab <= 0) {
      this.selectedCustomer = 'all';
    }

  }

  redirectTab(value: any) {
    setTimeout(() => {
      this.selectedChild = value.redirectIndex;
    }, 400);
  }

  removeCCSTab(i: any) {
    this.selectedChild = 3;
  }

  onDestroyOutput(event: any) {
    if (event) {

      this.getCustomerForUser();
    }
  }

  onMobilityAddEvent(event: any, index: any) {
    if (event) {
      this.tabsArray.splice(index, 1);
      this.tabsArray = _.cloneDeep(this.tabsArray);
      event['ChildInventoryId'] = null;
      event['serviceNumber'] = event['ServiceNumber'];
      this.onCellDoubleClicked('Edit', event)
      this.getInventory();
    }
  }


  onEditedChildInventory(event: any, index?: number, fromEditPage = false) {
    if (event) {
      this.getInventory(fromEditPage)
    } else {
      this.getInventory(fromEditPage);
      this.selectedTab = 0;
      this.tabsArray.splice(index, 1);
    }
  }

  setTemDDValueEvent(data: any, i: any) {
    if (this.selectedTab > 0 && data != '') {

      this.selectedTem = data;

    } else if (data == '' && this.selectedTab <= 0) {
      this.selectedTem = 'all';
    }
  }

  clickToTab(e: any) {
    this.selectedTab = e;

  }

  exportAccountData($event: any) {
    this.exportRetrievalData = $event;
  }

  isBillingAccountExist(data: any) {
    this.accountExist = data;
  }

  serachInventory()
  {
    this.MobilePTableComponent.loadNodes(this.MobilePTableComponent.pTableContain, true);
  }

}
