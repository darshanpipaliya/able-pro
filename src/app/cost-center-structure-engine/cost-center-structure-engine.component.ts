import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import _ from 'lodash';
import { CostStructureService } from '../services/cost-structure.service';
import { WirelineService } from '../services/wireline.service';
import { LocationService } from '../services/location.service';
import { InvoiceService } from '../services/invoice.service';
import { ErrorWarningPopupComponent } from '../common/error-warning-popup/error-warning-popup.component';
import { SharedModule } from '../demo/shared/shared.module';
import { PrimgModule } from '../demo/shared/primeng.module';
import { InvoiceOverviewIComponent } from '../common/invoice-overview-i/invoice-overview-i.component';
import { AgGridModule } from 'ag-grid-angular';
import { AgGridTableComponent } from '../common/ag-grid-table/ag-grid-table.component';
import { ModuleRegistry, ServerSideRowModelModule } from 'ag-grid-enterprise';
import { PTreetableVpInventoryComponent } from '../cost-center-structure/p-treetable-vp-inventory/p-treetable-vp-inventory.component';
import { PTreetableLocationComponent } from '../cost-center-structure/p-treetable-location/p-treetable-location.component';
import { PTreetablePeopleComponent } from '../cost-center-structure/p-treetable-people/p-treetable-people.component';
import { ChangeLogComponent } from '../common/change-log/change-log.component';

ModuleRegistry.registerModules([ServerSideRowModelModule]);
@Component({
  selector: 'app-cost-center-structure-engine',
  templateUrl: './cost-center-structure-engine.component.html',
  styleUrls: ['./cost-center-structure-engine.component.scss'],
  standalone: true,
  imports: [SharedModule, PrimgModule, InvoiceOverviewIComponent, AgGridModule, AgGridTableComponent,
    PTreetableVpInventoryComponent, PTreetableLocationComponent, PTreetablePeopleComponent, ChangeLogComponent
  ],
  providers: [CostStructureService, WirelineService, LocationService, InvoiceService]
})
export class CostCenterStructureEngineComponent implements OnInit {
  @Input() gridRowData : any;
  @Input() editRecord : any;
  @Input() isAddClicked : any;
  @Input() fromEditIcon : any;

  invoiceOverviewData: any;
  isDisableValues: boolean = false;
  public loadingCompanyList: any = false;
  loadingCC = false;
  public CostAllocationStatus : any;
  public serviceTypes: any = [];
  public loadingServices: any = [];
  public products: any = [];
  public loadingProducts: any = false;
  stopSpinner = false;
  gridApiLocation: any;
  gridColumnApiLocation: any;
  public loadingCustomerAPI = false;
  tems :any= [];
  editedRecordValue : any;
  changelogData: any;
  isVendorDetail: any;

  action = 'edit';
  customers :any= [];
  public sideBar;
  sbInvoiceId: any;
  columnSubAccount: any;
  submitted = false;
  public vendorProductInventoryIds :any= [];
  costAllocationData : any;

  approverList :any= [];
  approverRequired: any = false;
  isDisableApproverOption: any = false;
  loadingApprover: boolean = false;
  isCompanyManager: boolean = false;
  isViewOnly: boolean = false;

  public locationIds :any= [];
  public peopleIds :any= [];
  private _unsubscribeGRid: Subject<any> = new Subject<any>();
  private _unsubscribeGRidStructure: Subject<any> = new Subject<any>();
  private _unsubscribeGetCompanies: Subject<any> = new Subject<any>();
  private _unsubscribeCC: Subject<any> = new Subject<any>();
  private _unsubscribeService: Subject<any> = new Subject<any>();
  private _unsubscribeGetProducts: Subject<any> = new Subject<any>();
  private _unsubscribePeople: Subject<any> = new Subject<any>();
  private _unsubscribeLocation: Subject<any> = new Subject<any>();
  private _unsubscribeInvenotry: Subject<any> = new Subject<any>();
  private _unsubscribeDetail: Subject<any> = new Subject<any>();
  private _unsubscribeCustomer: Subject<any> = new Subject<any>();
  private _unsubscribeTEM: Subject<any> = new Subject<any>();
  private _unsubscribeCostCenterS: Subject<any> = new Subject<any>();
  private _unsubscribeInvenotry1: Subject<any> = new Subject<any>();
  private _unsubscribeApproverDropdown: Subject<any> = new Subject<any>();

  
  @Output() redirectAllocationTab: EventEmitter<any> = new EventEmitter<any>();
  @Output() addClicked: EventEmitter<any> = new EventEmitter<any>();


  public existingLocation : any;
  public existingPeople : any;
  public existingInventory : any;
  public assignments :any= [];
  saveButtonLoader = false;
  saveAddButtonLoader = false;
  costCenterStructureRowData : any;

  gridApi: any;
  gridColumnApi: any;

  
  gridApi1: any;

  gridApiStructure : any;
  isShowDetail = false
  public columnVendorProduct;
  public columnDefs1;
  public columnDefs2;
  public columnDefs3;
  public columnStructure;
  customerAccountName : any;
  temAccountName : any;

  structureForm: FormGroup;
  companies :any= [];
  costCenterData :any= [];
  public RefNumber : any;
  public selectedLocations :any= [];
  public selectedPeoples :any= [];
  public selectedInventories :any= [];
  logLoader = false;

  rowData :any= [];
  rowData1 :any= [];
  rowData3 :any= [];
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
  columns :any= [];
  selectedIds :any= [];
  
  @ViewChild('CostAllocationVendorProduct') CostAllocationVendorProduct!: TemplateRef<any>;
  @ViewChild('CostCenterStructureDetail') CostCenterStructureDetail!: TemplateRef<any>;
  @ViewChild('DistributionOrigin') DistributionOrigin!: TemplateRef<any>;
  @ViewChild('VendorProductInventory') VendorProductInventory!: TemplateRef<any>;
  @ViewChild('serviceDialog') serviceDialog!: TemplateRef<any>;
  @ViewChild('LocationsAssignment') LocationsAssignment!: TemplateRef<any>;
  @ViewChild('PeopleAssignment') PeopleAssignment!: TemplateRef<any>;

  constructor(public dialog: MatDialog,private fb: FormBuilder,private costStructureService: CostStructureService,public wirelineService: WirelineService,private locationService: LocationService, private invoiceService: InvoiceService) {
    this.sideBar = {
      toolPanels: ['columns', 'filters']
    };

    this.columnVendorProduct =  [
      {
        headerName: 'Inventory',
        children: [
          {
            field: 'ServiceNumber',
            headerName: 'Service Number',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 165,
            sortingField: 'ServiceNumber'
          },
          {
            field: 'MainAccountNumber',
            headerName: 'Main Account Number',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 210,
            sortingField: 'MainAccountNumber'
          },
          {
            field: 'SubAccountNumber',
            headerName: 'Sub Account Number',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 200,
            sortingField: 'SubAccountNumber',
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
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 125,
            sortingField: 'VendorAccountName'
          }
        ]
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
            minWidth: 185,
            sortingField: 'VendorProductTypeName'
          },
          {
            field: 'ServiceName',
            headerName: 'Service',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 145,
            sortingField: 'ServiceName'
          },
          {
            field: 'ServiceType',
            headerName: 'Service Type',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 160,
            sortingField: 'ServiceType'
          },
          {
            field: 'ProductName',
            headerName: 'Product',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 150,
            sortingField: 'ProductName'
          },
          {
            field: 'ProductType',
            headerName: 'Product Type',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 175,
            sortingField: 'ProductType'
          },
          {
            field: 'IndustryName',
            headerName: 'Industry',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 175,
            sortingField: 'IndustryName'
          }
        ]
      },
      {
        headerName: 'Assignment',
        children: [
          {
            field: 'PrimaryAssignment',
            headerName: 'Primary',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 121,
            sortingField: 'PrimaryAssignment'
          },
          {
            field: 'PrimaryAssignmentName',
            headerName: 'Name',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 185,
            sortingField: 'PrimaryAssignmentName'
          },
          {
            field: 'PrimaryAssignmentId',
            headerName: 'Id',
            columnGroupShow: 'close',
            filter: 'agNumberColumnFilter',
            editable: false,
            minWidth: 185,
            sortingField: 'PrimaryAssignmentId'
          },
          {
            field: 'PrimaryAssignmentStatus',
            headerName: 'Status',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 135,
            sortingField: 'PrimaryAssignmentStatus'
          }
        ]
      },
      {
        headerName: 'Billed Charges',
        children: [
          {
            field: 'BilledChargesProductTotalDisplay',
            headerName: 'Product Total',
            columnGroupShow: 'close',
            filter: 'agNumberColumnFilter',
            editable: false,
            minWidth: 165,
            sortingField: 'BilledChargesProductTotal',
            cellStyle: { display: 'flex !important', 'justify-content': 'end', 'padding-right': '50px' },
          }
        ]
      },
      {
        headerName: 'Cost Allocation',
        children: [
          {
            field: 'CostAllocatedChargesTotalDisplay',
            headerName: 'Allocated Total',
            columnGroupShow: 'close',
            filter: 'agNumberColumnFilter',
            editable: false,
            minWidth: 155,
            sortingField: 'CostAllocatedChargesTotal',
            cellStyle: { display: 'flex !important', 'justify-content': 'end', 'padding-right': '50px' },
          },
          {
            field: 'CostAllocatedPercentageDisplay',
            headerName: '% Allocated',
            columnGroupShow: 'close',
            filter: 'agNumberColumnFilter',
            editable: false,
            minWidth: 135,
            sortingField: 'CostAllocatedPercentage'
          }
        ],
      }
    ];

    this.columnStructure = [
      {
        headerName: 'Cost Center',
        children: [
          {
            field: 'CostCenterGLCodeFormatted',
            headerName: 'Cost Center',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 155,
            sortingField: 'CostCenterGLCodeFormatted'
          }
        ]
      },
      {
        headerName: 'Service',
        children: [
          {
            field: 'ServiceTypeName',
            headerName: 'Service Type',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 140,
            sortingField: 'ServiceTypeName'
          },
          {
            field: 'ProductName',
            headerName: 'Product',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 160,
            sortingField: 'ProductName'
          }
        ],
      },
      {
        headerName: 'Allocation',
        children: [
          {
            field: 'PercentageDisplay',
            headerName: '%',
            columnGroupShow: 'close',
            filter: 'agNumberColumnFilter',
            editable: false,
            minWidth: 110,
            sortingField: 'Percentage'
          },
        ]
      },
      {
        headerName: 'Allocated',
        children: [
          {
            field: 'ActualAllocatedPercentageDisplay',
            headerName: '%',
            columnGroupShow: 'close',
            filter: 'agNumberColumnFilter',
            editable: false,
            minWidth: 110,
            sortingField: 'ActualAllocatedPercentage'
          }
        ]
      },
      {
        headerName: 'Assignment',
        children: [
          {
            field: 'CostCenterStructureType',
            headerName: 'Assignment',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 155,
            sortingField: 'CostCenterStructureType'
          },
          {
            field: 'ServiceNumber',
            headerName: 'Service Number',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 185,
            sortingField: 'ServiceNumber'
          },
          {
            field: 'VendorProductTypeName',
            headerName: 'Vendor Product',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 185,
            sortingField: 'VendorProductTypeName'
          },
          {
            field: 'PeopleName',
            headerName: 'Name',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 115,
            sortingField: 'PeopleName'
          },
     
          {
            field: 'PeopleEmail',
            headerName: 'Email',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 140,
            sortingField: 'PeopleEmail'
          },
          {
            field: 'LocationName',
            headerName: 'Location Name',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 180,
            sortingField: 'LocationName'
          },
          {
            field: 'LocationId',
            headerName: 'Location ID',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 138,
            sortingField: 'LocationId'
          },
          {
            field: 'LocationAddress1',
            headerName: 'Address1',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 135,
            sortingField: 'LocationAddress1'
          },
          {
            field: 'LocationAddress2',
            headerName: 'Address2',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 135,
            sortingField: 'LocationAddress2'
          },
          {
            field: 'LocationCity',
            headerName: 'City',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 105,
            sortingField: 'LocationCity'
          },
          {
            field: 'StateName',
            headerName: 'State/Province',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 175,
            sortingField: 'StateName'
          },
          {
            field: 'LocationPostalCode',
            headerName: 'Zip/Postal Code',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 165,
            sortingField: 'LocationPostalCode'
          }
        ]
      },
      {
        headerName: 'Status',
        children: [
          {
            field: 'CCStructureStatusDisplay',
            headerName: 'Rule Status',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 130,
            sortingField: 'CCStructureStatusDisplay'
          }
        ]
      }
    ];

    this.columnDefs1 = [
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
        headerName: 'Inventory',
        children: [
          {
            field: 'ServiceNumber',
            headerName: 'Service Number',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 150
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
            minWidth: 145
          },
          {
            field: 'Service',
            headerName: 'Service',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 95
          },
          {
            field: 'ServiceType',
            headerName: 'Service Type',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 126
          },
          {
            field: 'Product',
            headerName: 'Product',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 100
          },
          {
            field: 'ProductType',
            headerName: 'Product Type',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 130
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
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 95
          }
        ]
      },
      {
        headerName: 'Status',
        children: [
          {
            field: 'InventoryStatusDisplayText',
            headerName: 'Vendor Product Status',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 185
          }
        ]
      },
      {
        headerName: 'Current Assignment',
        children: [
          {
            field: 'LocationName',
            headerName: 'Location Name',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 180
          }
        ]
      },
      {
        headerName: 'Address',
        children: [
          {
            field: 'Address1',
            headerName: 'Address One',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 133
          },
          {
            field: 'Address2',
            headerName: 'Address Two',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 133
          },
          {
            field: 'City',
            headerName: 'City',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 100
          },
          {
            field: 'StateName',
            headerName: 'State/Province',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 160
          },
          {
            field: 'PostalCode',
            headerName: 'Zip/Postal Code ',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 150
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
            minWidth: 110
          },
          {
            field: 'PeopleEmail',
            headerName: 'Email',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 140
          }
        ]
      }
    ];

    this.columnDefs2 = [
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
        headerName: 'Location Name',
        children: [
          {
            field: 'LocationName',
            headerName: 'Location Name',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 145
          }
        ],
      },
      {
        headerName: 'Location Type',
        children: [
          {
            field: 'LocationTypeDisplayName',
            headerName: 'Location Type',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 135
          }
        ],
      },
      {
        headerName: 'Address',
        children: [
          {
            field: 'Address1',
            headerName: 'Address One',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 133
          },
          {
            field: 'Address2',
            headerName: 'Address Two',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 133
          },
          {
            field: 'City',
            headerName: 'City',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 100
          },
          {
            field: 'StateName',
            headerName: 'State/Province',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 160
          },
          {
            field: 'PostalCode',
            headerName: 'Zip/Postal Code ',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 150
          }
        ],
      },
      {
        headerName: 'Location Status',
        children: [
          {
            field: 'DisplayText',
            headerName: 'Location Status',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 145
          }
        ]
      },
    ];


    this.columnDefs3 = [
      {
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
        headerName: 'Personal',
        children: [
          {
            field: 'PeopleName',
            headerName: 'Name',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 110
          },
          {
            field: 'PeopleFirstName',
            headerName: 'First Name',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 120
          },
          {
            field: 'PeopleLastName',
            headerName: 'Last Name',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 115
          },
          {
            field: 'PeopleUserTitle',
            headerName: 'User Title',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 130
          },
          {
            field: 'EmployeeId',
            headerName: 'Employee ID',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 130
          },
          {
            field: 'Department',
            headerName: 'Department',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 125
          },
          {
            field: 'PeopleCustomField1',
            headerName: 'Contact Custom 1',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 160
          },
          {
            field: 'PeopleCustomField2',
            headerName: 'Contact Custom 2',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 160
          },
          {
            field: 'PeopleCustomField3',
            headerName: 'Contact Custom 3',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 160
          },
          {
            field: 'PeopleCustomField4',
            headerName: 'Contact Custom 4',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 160
          }
        ],
      },
      {
        headerName: 'Contact',
        children: [
          {
            field: 'PeopleEmail',
            headerName: 'Email',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 145
          },
          {
            field: 'DeskPhone',
            headerName: 'Desk Phone',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 125
          },
          {
            field: 'CellPhone',
            headerName: 'Cell Phone',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 125
          },
          {
            field: 'CustomerContactType',
            headerName: 'Contact Type',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 130
          }
        ]
      },
      {
        headerName: 'Status',
        children: [
          {
            field: 'PeopleStatusDisplayValue',
            headerName: 'User Status',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 120
          },
          {
            field: 'CustomerDisplayRole',
            headerName: 'Role',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 80
          }
        ]
      },
      {
        headerName: 'Location',
        children: [
          {
            field: 'PrimaryLocationDisplayValue',
            headerName: 'Location Name',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 145,
            flex: 0,
            tooltipField: 'PrimaryLocationDisplayValue',
            tooltipComponentParams: { color: '#ececec' },
          },
          {
            field: 'LocationAddress1',
            headerName: 'Address One',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 133
          },
          {
            field: 'LocationAddress2',
            headerName: 'Address Two',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 133
          },
          {
            field: 'LocationCity',
            headerName: 'City',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 100
          },
          {
            field: 'LocationStateName',
            headerName: 'State/Province',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 160
          },
          {
            field: 'LocationPostalCode',
            headerName: 'Zip/Postal Code ',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 150
          }
        ],
      },
      {
        headerName: 'Status',
        children: [
          {
            field: 'LocationStatusDisplayText',
            headerName: 'Location Status',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 145
          }
        ]
      }
    ];
    this.setForm();

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
  onFilterChanged(data: any) {
  }
  setForm() {
    this.structureForm = this.fb.group({
      temId: new FormControl(null),
      companyId: new FormControl(null, [Validators.required]),
      PeopleApproverId: new FormControl('', []),
      customerAccountId: new FormControl(null, [Validators.required]),
      costCenterId: new FormControl(null, [Validators.required]),
      serviceTypeId: [[], [Validators.required]],
      productId: new FormControl(null),
      assignmentType: new FormControl('', [Validators.required]),
      status: new FormControl(true),
      allocationPercentage: new FormControl(null, [Validators.required, Validators.max(100), Validators.min(0)])
    });
  }
  ngOnChanges(changes: any) {
    if (changes && changes['isAddClicked'] && changes['isAddClicked']['currentValue'] == true) {
      this.addAllocation();
    }
  }
  ngOnInit(): void {
    this.getServiceTypes();
    this.getAssignments();
    
    this.isCompanyManager = this.locationService.isUserCompanyManager();
  }

  invoiceOverviewDataOutput($event: any){
    this.invoiceOverviewData = $event;
    if(this.fromEditIcon) {
        this.isDisableValues = true;
        setTimeout(() => {
        this.customerAccountName = this.invoiceOverviewData?.CustomerAccountName;
        this.setValueInFormControl('customerAccountId', this.invoiceOverviewData?.CustomerAccountId);
          this.getCompanyByCustomerId();
          if(this.editRecord?.PrimaryAssignmentCompanyId == null) {
            this.setValueInFormControl('companyId', 'all');
          } else {
            this.setValueInFormControl('companyId', this.editRecord?.PrimaryAssignmentCompanyId);
          }
          this.getApproverDropdown();
          this.getCostCenter();
        }, 1000);

        this.setValueInFormControl('serviceTypeId', [this.editRecord?.ServiceTypeId]);
        this.getProducts();
      
        this.editedRecordValue = this.structureForm.value;
    } else {
      this.isDisableValues = false;
    }
  }

  getApproverDropdown() {

    this._unsubscribeApproverDropdown.next(true);
    this.costStructureService.getApproverDropdown(this.f['customerAccountId'].value, this.f['companyId'].value).pipe(takeUntil(this._unsubscribeApproverDropdown)).subscribe((res: any) => {
      if (res.Success && res.Data.$values.length > 0) {
        this.approverList = res.Data.$values;
      } else {
        this.approverList = [];
        this.f['PeopleApproverId'].setValue(null);
      }
    })
  }

  getAssignments() {
    this.costStructureService.ccStructureTypes().subscribe((data: any) => {
      this.assignments = data.Data.$values;
      let index =  _.findIndex(this.assignments, (x:any) => x.type == 'Customer');
      this.assignments.splice(index, 1);
    })
  }
  onSelectionChanged($event: any) {
    this.locationIds = [];
    this.vendorProductInventoryIds = [];
    this.peopleIds = [];
    
    if(this.action == 'edit') {
    let editData = $event[0];
    
    this.costCenterStructureRowData = $event[0];
    this.customerAccountName = editData.CustomerAccountName;
    this.temAccountName = editData.TEMAccountName;
    this.setValueInFormControl('temId', editData?.TEMAccountId);

      this._unsubscribeDetail.next(null);
      this.costStructureService.getccStructuresDetail(editData.CostCenterStructureId).pipe(takeUntil(this._unsubscribeDetail)).subscribe((res: any) => {
        let serviceTypeIds = _.map(res.Data.CCStructureXServiceTypeProduct.$values, (x: any) => x.ServicetypeId);
        let productIds = _.map(res.Data.CCStructureXServiceTypeProduct.$values, (x: any) => x.ProductId);

        this.customerAccountName = editData.CustomerAccountName;
        this.setValueInFormControl('customerAccountId', editData.CustomerAccountId);
        this.getCompanyByCustomerId();
        if(res.Data.CostCenterStructures.CompanyId == null) {
          this.setValueInFormControl('companyId', 'all');
        } else {
          this.setValueInFormControl('companyId', res.Data.CostCenterStructures.CompanyId);
        }
        this.getCostCenter();
        this.getApproverDropdown();
        this.setValueInFormControl('costCenterId', res.Data.CostCenterStructures.CostCenterId);
        this.setValueInFormControl('serviceTypeId', serviceTypeIds);
        this.getProducts();
        this.setValueInFormControl('productId', productIds[0] != null ? productIds[0] : null);

        if(res.Data.CostCenterStructures?.PeopleApproverId){
          this.setValueInFormControl('PeopleApproverId', res.Data.CostCenterStructures?.PeopleApproverId);
        }

        this.setValueInFormControl('allocationPercentage', res.Data.CostCenterStructures.Percentage);
        this.setValueInFormControl('assignmentType', res.Data.CostCenterStructures.CostCenterStructureType.Type);
        this.changeAssignment();
        this.setValueInFormControl('status', res.Data.CostCenterStructures.Status);
        if (res.Data.CostCenterStructures.CostCenterStructureType.Type == 'Location') {
          let locationIds = _.map(res.Data.CCAllocationAssignment.$values, (x: any) => x.LocationId);
          this.existingLocation = locationIds;
        } else if (res.Data.CostCenterStructures.CostCenterStructureType.Type == 'People') {
          let peopleIds = _.map(res.Data.CCAllocationAssignment.$values, (x: any) => x.PeopleId);
          this.existingPeople = peopleIds;
        } else if (res.Data.CostCenterStructures.CostCenterStructureType.Type == 'Vendor Product') {
          let vendorProductIds = _.map(res.Data.CCAllocationAssignment.$values, (x: any) => x.VendorProductInventoryId);
          // this.getLocationInventories();
          this.existingInventory = vendorProductIds;
        }

        this.editedRecordValue = this.structureForm.value;
      });
    }
  }

  onAgGridReady($event: any, setEmptyData = false) {

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
          if (key == 'BilledChargesProductTotalDisplay') {
            key = 'BilledChargesProductTotal'
          }
          if (key == 'CostAllocatedChargesTotalDisplay') {
            key = 'CostAllocatedChargesTotal'
          }
          if (key == 'CostAllocatedPercentageDisplay') {
            key = 'CostAllocatedPercentage'
          }
          if(key == 'ActualAllocatedPercentageDisplay') {
            key = 'ActualAllocatedPercentage';
          }
          if(key == 'BilledChargesProductTotal' || key == 'CostAllocatedChargesTotal' || key =='CostAllocatedPercentage' || key == 'ActualAllocatedPercentage') {
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
        if(this.costCenterStructureRowData?.CostCenterStructureId) {
          data['costCenterStructureId'] = this.costCenterStructureRowData.CostCenterStructureId;
        }
        data['VendorProductInventoryId'] = this.editRecord.VendorProductInventoryId;
        data['Rno'] = this.editRecord.Rno;
 
        if (paramsRequest.sortModel.length > 0) {

          Object.values(params['columnApi']['columnController']['columnDefs']).forEach((key:any) => {
            if (key['children']) {
              Object.values(key['children']).forEach((k:any) => {
                if (k['field'] === paramsRequest.sortModel[0].colId) {
                  data['OrderBy'] = k['sortingField'];
                  data['SortOrder'] = paramsRequest.sortModel[0].sort;
                }
              });
            }
          });
        }

        this._unsubscribeGRid.next(null);
        this.invoiceService.getcostAllocationVendorProduct(this.gridRowData.InvoiceId, data)
          .pipe(takeUntil(this._unsubscribeGRid))
          .subscribe(
            async (data: any) => {
              if (data && data.Data.$values.length > 0) {
                if(data.Data.$values[0].CostAllocatedPercentage > 0){
                  this.isShowDetail = true;
                } else {
                  this.isShowDetail = false;
                  this.action = 'add';
                  this.getTemLists();
                }
                this.isVendorDetail = data.Data?.$values[0];
                let lastRow = -1;
                if (data.TotalCount <= paramsRequest.startRow + 100) {
                  lastRow = data.TotalCount;
                }
                params.success({
                  rowData: setEmptyData ? [] : data.Data.$values,
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
    this.gridApiStructure = $event.api;
  }
  addAllocation() {
    this.addClicked.emit(false);
    this.onAgGridReady(this.gridApi)
    this.onAgGridReadyStructure(this.gridApiStructure)
    this.action = 'add';
    this.structureForm.reset();
    this.setValueInFormControl('status', true);
    this.submitted = false;

    this.customerAccountName = this.invoiceOverviewData?.CustomerAccountName;
    this.setValueInFormControl('customerAccountId', this.invoiceOverviewData?.CustomerAccountId);
    setTimeout(() => {
      this.getCompanyByCustomerId();
      if(this.editRecord?.PrimaryAssignmentCompanyId == null) {
        this.setValueInFormControl('companyId', 'all');
      } else {
        this.setValueInFormControl('companyId', this.editRecord?.PrimaryAssignmentCompanyId);
      }
      this.getApproverDropdown();
    }, 1000);
    
    this.getCostCenter();
    this.setValueInFormControl('serviceTypeId', [this.editRecord?.ServiceTypeId]);
    this.getProducts();

    this.getTemLists();
  }
  getTemLists() {
    this._unsubscribeTEM.next(null);
    this.locationService
      .getTEMLoggedInUserDropDown()
      .pipe(takeUntil(this._unsubscribeTEM))
      .subscribe((data) => {
        if (data && data.$values) {
          this.tems = data.$values;
          if(this.action == 'add') {
            this.setValueInFormControl('temId', 1000);
            this.changeTem();
          }
        }
      });
  }

  changeTem() {
    if (this.f['temId'].value) {
      this.customers = [];
      // this.companies = [];
      this.loadingCustomerAPI = true;
      this._unsubscribeCustomer.next(null);
      this.locationService.getCustomerDropdownByNewTEM(this.f['temId'].value).pipe(takeUntil(this._unsubscribeCustomer)).subscribe((data) => {
        if (data && data.Data.$values) {
          this.customers = data.Data.$values;
          _.forEach(data.$values,(customer: any) => {
            this.disableOption(customer);
            customer['disabled'] = !customer.CostAllocationStatus;
          })
          this.loadingCustomerAPI = false;
        } else {
          this.customers = []
          this.loadingCustomerAPI = false;
        }
      }, error => {
        this.customers = []
        this.loadingCustomerAPI = false;
      });
    }
  }

  disableOption(item: any): boolean {
    return item.ApprovalsStatus !== true;
  }

  onAgGridReadyStructure($event ?: any, setEmptyData = false) {

    this.gridApiStructure = $event;
    let dataSource: any = {
      rowCount: null,
      getRows: (params: any) => {
        let paramsRequest = params['request'];
        const filterArray:any = [];
        const filterArrayNumber:any = [];
        let arr;
        let arrNumber;

        for (var key in paramsRequest.filterModel) {
          let data = paramsRequest.filterModel[key];

          if (key == 'PercentageDisplay') {
            key = 'Percentage'
          }
          if(key == 'ActualAllocatedPercentageDisplay') {
            key = 'ActualAllocatedPercentage';
          }
          if(key == 'Percentage' || key == 'ActualAllocatedPercentage') {
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
        data['VendorProductInventoryId'] = this.editRecord.VendorProductInventoryId;

        // data['InvoiceCostAllocationIdsArr'] = this.InvoiceCostAllocationIdsArr.length > 0 ? this.InvoiceCostAllocationIdsArr : null
      
        if (paramsRequest.sortModel.length > 0) {
          Object.values(params['columnApi']['columnController']['columnDefs']).forEach((key:any) => {
            if (key['children']) {
              Object.values(key['children']).forEach((k:any) => {
                if (k['field'] === paramsRequest.sortModel[0].colId) {
                  data['OrderBy'] = k['sortingField'];
                  data['SortOrder'] = paramsRequest.sortModel[0].sort;
                }
              });
            }
          });
        }
        this._unsubscribeGRidStructure.next(null);
        this.invoiceService.getcostAllocationStructure(this.gridRowData.InvoiceId, data)
          .pipe(takeUntil(this._unsubscribeGRidStructure))
          .subscribe(
            async (data: any) => {
              if (data && data.Data.$values.length > 0) {
                this.costAllocationData = data.Data.$values;
                this.getCCSChangelogData();
                let lastRow = -1;
                if (data.TotalCount <= paramsRequest.startRow + 100) {
                  lastRow = data.TotalCount;
                }
                params.success({
                  rowData: setEmptyData ? [] : data.Data.$values,
                  rowCount: lastRow
                });
              } else {
                params.success({
                  rowData: [],
                  rowCount: 0
                });
                this.gridApiStructure.showNoRowsOverlay();
              }
              
              if(this.action == 'edit') {
                this.gridApiStructure.forEachNode((rowNode: any) => {
                  if (rowNode.rowIndex == 0) {
                    rowNode.setSelected(true);
                  }
                });
              } else {
                this.gridApiStructure.forEachNode((rowNode: any) => {
                  if (rowNode.rowIndex == 0) {
                    rowNode.setSelected(false);
                  }
                });
              }
            },
            (error) => {
              params.success({
                rowData: [],
                rowCount: 0
              });
              this.gridApiStructure.showNoRowsOverlay();
            }
          );
      },
    };
    if (this.gridApiStructure.api) {
      this.gridApiStructure.api.setGridOption("serverSideDatasource", dataSource);
    } else {
      this.gridApiStructure.setGridOption("serverSideDatasource", dataSource);
    }
  }

  getCCSChangelogData() {
    if(this.costAllocationData) {
      this.logLoader = true;
      this._unsubscribeCostCenterS.next(null);
      this.locationService.getCCSChangelogs(this.costAllocationData[0].CostCenterStructureId).pipe(takeUntil(this._unsubscribeCostCenterS)).subscribe((data: any) => {
        this.logLoader = false;
        if(data.Success) {
          this.changelogData = data.Data.$values;
        } else {
          this.changelogData = [];
        }
      });
    }
  }

  ngOnDestroy() {
    this._unsubscribeCostCenterS.next(null);
    this._unsubscribeCostCenterS.complete();
    this._unsubscribeTEM.next(null);
    this._unsubscribeTEM.complete();
    this._unsubscribeGRidStructure.next(null);
    this._unsubscribeGRidStructure.complete();
    this._unsubscribeGetCompanies.next(null);
    this._unsubscribeGetCompanies.complete();
    this._unsubscribeCC.next(null);
    this._unsubscribeCC.complete();
    this._unsubscribeService.next(null);
    this._unsubscribeService.complete();
    this._unsubscribeGetProducts.next(null);
    this._unsubscribeGetProducts.complete();
    this._unsubscribePeople.next(null);
    this._unsubscribePeople.complete();
    this._unsubscribeLocation.next(null);
    this._unsubscribeLocation.complete();
    this._unsubscribeInvenotry.next(null);
    this._unsubscribeInvenotry.complete();
    this._unsubscribeDetail.next(null);
    this._unsubscribeDetail.complete();
    this._unsubscribeCustomer.next(null);
    this._unsubscribeCustomer.complete();
    this._unsubscribeInvenotry1.next(null);
    this._unsubscribeInvenotry1.complete();
    this._unsubscribeApproverDropdown.next(null);
    this._unsubscribeApproverDropdown.complete();
  }

  getServiceTypes() {

    this.loadingServices = true;
    this._unsubscribeService.next(null);
    let data = {
      "industryId": null,
      "serviceId": null,
      "serviceTypeId": null,
      "productId": null,
      "productTypeId": null
    }
    this.locationService.getServiceTypeList(data).pipe(takeUntil(this._unsubscribeService)).subscribe((data) => {
      if (data.Success) {
        this.serviceTypes = data.Data.$values;
        this.loadingServices = false;
      } else {
        this.loadingServices = false;
        this.serviceTypes = []
      }
    }, error => {
      this.loadingServices = false;
      this.serviceTypes = [];
    });


  }
  changeServiceType() {
    if (this.f['assignmentType'].value == 'Vendor Product') {
      this.setValueInFormControl('assignmentType', '')
    }
  }
  onSelectionChangedLocation(event: any) {
    let Ids:any = [];
    event.forEach((element: any) => {
      Ids.push(element.LocationId)
    });
    this.locationIds = Ids;
    this.selectedLocations = event;
  }
  onSelectionChangedPeople(event: any) {
    let Ids:any = [];
    event.forEach((element: any) => {
      Ids.push(element.PeopleId)
    });
    this.peopleIds = Ids;
    this.selectedPeoples = event;
  }
  onSelectionChangedInventory(event: any) {
    _.forEach(event, (e: any) => {
      if(!this.selectedIds.includes(e.VendorProductInventoryId)) {
        this.selectedIds.push(e.VendorProductInventoryId)
      }
    });
    this.vendorProductInventoryIds = this.selectedIds;
    this.selectedInventories = event;
  }
  getProducts(clickFromHTML = false) {
    if (!this.f['serviceTypeId'].value) {
      return;
    }
    this.products = [];
    
    if(clickFromHTML) {
      this.setValueInFormControl('productId', null)
    }

    if (this.f['assignmentType'].value == 'Vendor Product') {
      this.setValueInFormControl('assignmentType', '')
    }
    if (this.f['serviceTypeId'].value.length == 1) {
      this.loadingProducts = true;
      this._unsubscribeGetProducts.next(null);

      let data = {
        "industryId": null,
        "serviceId": null,
        "serviceTypeId": this.f['serviceTypeId'].value[0],
        "productId": null,
        "productTypeId": null
      }
      this.locationService.getProductList(data).pipe(takeUntil(this._unsubscribeGetProducts)).subscribe((data) => {
        if (data.Success) {
          this.products = data.Data.$values;
          if (data.Data.$values.length) {
            this.products.unshift({ Id: null, Name: 'Select Product...' });
          }
          this.loadingProducts = false;
        } else {
          this.loadingProducts = false;
          this.products = [];
        }
      }, error => {
        this.products = [];
        this.loadingProducts = false;
      });
    }
  }
  changeAssignment() {
    if(this.f['assignmentType'].value == 'Company')  {
      if(this.f['companyId'].value !== 'all') {
        this.locationService.getCompanyById(this.f['companyId'].value).subscribe((data) => {
          if (data) {
            this.RefNumber = data.Data.RefNumber;
          }
        });
      }
    }
  }

  getLocationInventories() {
    this.rowData1 = [];
    this._unsubscribeInvenotry1.next(null);

    let advanceFilter = [
      {
        "filterKey": "InventoryStatusDisplayText",
        "filterOptionType1": "equals",
        "filterOptionValue1": "Pending Activation",
        "filterOperationType": "OR",
        "filterOptionType2": "equals",
        "filterOptionValue2": "Active"
      }
    ];

    const data: any = {
      CustomerAccountId: this.f['customerAccountId'].value,
      advanceFilter: advanceFilter
    };

    if(this.f['serviceTypeId'].value?.length > 0)
      data['serviceTypeIds'] = this.f['serviceTypeId'].value;
    if (this.f['productId'].value !== null) {
      data['productIds'] = [this.f['productId'].value];
    }

    if (this.f['companyId'].value !== 'all') {
      data['companyId'] = this.f['companyId'].value
    }
    this.stopSpinner = false;
    this.locationService.inventoryHierarchy(data).pipe(takeUntil(this._unsubscribeInvenotry1)).subscribe((res: any) => {
      if (res && res.Data.$values) {
        this.stopSpinner = true;
        this.rowData1 = this.processData(res.Data.$values);

        _.forEach(this.rowData1, (node: any) => {
          const d = this.existingInventory.some((r: any) => r === node.VendorProductInventoryId);
          node['isChecked'] = d;
        })
      }
    }, error => {
      this.rowData1 = [];
      this.stopSpinner = true;
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
  getCostCenter() {
    if(this.f['assignmentType'].value !== null && this.action == 'add') {
      this.setValueInFormControl('assignmentType', null);
    }
    if (this.f['customerAccountId'].value) {
      let data :any = {
        "customerAccountId": this.f['customerAccountId'].value
      }

      if (this.f['companyId'].value !== 'all') {
        data['companyId'] = this.f['companyId'].value
      }
      if(this.action == 'add')
        this.setValueInFormControl('costCenterId', null);
      this._unsubscribeCC.next(null);
      this.loadingCC = true;
      this.costCenterData = [];
      this.costStructureService.costCenterDD(data).pipe(takeUntil(this._unsubscribeCC)).subscribe((res: any) => {
        this.loadingCC = false;
        if (res.Success) {
          this.getApproverDropdown();
          this.costCenterData = res?.Data?.$values || [];
          if (this.costCenterData.length === 0) {
            this.setValueInFormControl('costCenterId', null);
          }
        } else {
          this.handleCostCenterError();
        }
      }, error => {
        this.handleCostCenterError();
        this.loadingCC = false;
      });
    }
  }
  private handleCostCenterError(): void {
    this.costCenterData = [];
    this.setValueInFormControl('costCenterId', null);
  }
  getCompanyByCustomerId() {
    if (this.f['customerAccountId'].value) {
      this.loadingCompanyList = true;
      this.companies = [];
      this.setValueInFormControl('companyId', null);
      this.setValueInFormControl('costCenterId', null);
      this.setValueInFormControl('assignmentType', null);

      this._unsubscribeGetCompanies.next(null);
      this.locationService.getCompanyByCustomerId(this.f['customerAccountId'].value).pipe(takeUntil(this._unsubscribeGetCompanies)).subscribe((data) => {
        if (data && data.$values && data.$values.length > 0) {
          this.companies = data.$values;
          if(data.$values.length > 1) {
            this.companies.unshift({ CompanyID: 'all', CompanyName: 'All' });
          } else {
            this.setValueInFormControl('companyId', this.companies[0].CompanyID);
            this.getCostCenter();
            if(this.fromEditIcon) {
              if(this.editRecord?.PrimaryAssignmentCompanyId == null) {
                this.setValueInFormControl('companyId', 'all');
              } else {
                this.setValueInFormControl('companyId', this.editRecord?.PrimaryAssignmentCompanyId);
              }
            }
            this.getApproverDropdown();
          }
          this.loadingCompanyList = false;
        } else {
          this.companies = [];
          this.loadingCompanyList = false;
        }
      }, error => {
        this.companies = [];
        this.loadingCompanyList = false;
      });

      this.locationService.getTemAccountById(this.f['customerAccountId'].value).subscribe((data) => {
        if (data) {
          this.CostAllocationStatus = data.Data.CostAllocationStatus;
          if (data.Data?.ApprovalStatus) {
            this.approverRequired = true;
            this.isDisableApproverOption = false;
            this.structureForm.get('PeopleApproverId')?.setValidators([Validators.required]);
          } else {
            this.approverRequired = false;
            this.isDisableApproverOption = true;
            this.structureForm.get('PeopleApproverId')?.setValidators([]);
          }
          this.structureForm.get('PeopleApproverId')?.updateValueAndValidity();
        }
      });
      
    }
  }
  setValueInFormControl(key: any, value: any) {
    this.f[key].setValue(value);
  }

  TooltipDialog1(): void {
    this.dialog.open(this.CostAllocationVendorProduct, {
      width: '900px',
      data: {
        colseButton: true,
      }
    });
  }
  get f() {
    return this.structureForm.controls;
  }
  TooltipDialog2(): void {
    this.dialog.open(this.CostCenterStructureDetail, {
      width: '900px',
      data: {
        colseButton: true,
      }
    });
  }
  openDialog1(): void {
    this.dialog.open(this.DistributionOrigin, {
      width: '900px',
      data: {
        colseButton: true,
      }
    });
  }

  serviceTooltip(): void {
    this.dialog.open(this.serviceDialog, {
      width: '900px',
      data: {
        colseButton: true,
      }
    });
  }

  openDialog2(): void {
    this.dialog.open(this.VendorProductInventory, {
      width: '900px',
      data: {
        colseButton: true,
      }
    });
  }

  openDialog3(): void {
    this.dialog.open(this.LocationsAssignment, {
      width: '900px',
      data: {
        colseButton: true,
      }
    });
  }

  openDialog4(): void {
    this.dialog.open(this.PeopleAssignment, {
      width: '900px',
      data: {
        colseButton: true,
      }
    });
  }
  getFilteredAssignments(): any[] {
    if (!this.assignments) {
      return [];
    }
    if (this.f['companyId'].value === 'all') {
      return this.assignments.filter((a: any) => a.Type !== 'Company');
    }
    return [...this.assignments];
  }
  saveRule(another = false) {
    this.submitted = true;
     
    if(this.f['assignmentType'].value == 'Company' && this.f['companyId'].value == 'all') {
      this.ErrorWarningPopupOpen('Any single company needs to be selected, when the Assignment Type is company');
      return
    }
    if (this.structureForm.valid) {
      if(this.CostAllocationStatus == null || this.CostAllocationStatus == false) {
        let errorData: any = {
          messgeType: "error",
          okBtnName: 'Close & Review',
          title: "Attention",
          titleClass: "text-c-blue",
          icon: "fas fa-exclamation-circle",
          iconClass: "text-c-blue f-70",
          message: 'Cost Allocation is presently inactive. To utilize these services, please activate Cost Allocation.'
        }
        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
        return 
      } 

      if(this.f['assignmentType'].value == 'Company') {
        if (this.CostAllocationStatus == true && this.RefNumber == null) {
          let errorData: any = {
            messgeType: "error",
            okBtnName: 'Close & Review',
            title: "Attention",
            titleClass: "text-c-blue",
            icon: "fas fa-exclamation-circle",
            iconClass: "text-c-blue f-70",
            message: 'Cost Allocation is presently inactive. To utilize these services, please activate Cost Allocation.'
          }
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
          return 
        }
      }
      let data = this.structureForm.value;
      data['costCenterStructureTypeId'] = _.find(this.assignments, (x:any) => x.Type == this.f['assignmentType'].value).Id;
      data['PeopleApproverId'] = this.structureForm.value?.PeopleApproverId ? this.structureForm.value?.PeopleApproverId : null;

      delete data.assignmentType;
      delete data.temId;
      delete data.productId;
      delete data.serviceTypeId;
      if (this.f['productId'].value !== null)
        data['ProductIds'] = [this.f['productId'].value];

      if (this.f['serviceTypeId'].value !== null)
        data['serviceTypeIds'] = this.f['serviceTypeId'].value;

      if (data.companyId == 'all')
        delete data.companyId

      if (this.vendorProductInventoryIds && this.vendorProductInventoryIds.length > 0)
        data['vendorProductInventoryIds'] = this.vendorProductInventoryIds;

      if (this.peopleIds && this.peopleIds.length > 0)
        data['peopleIds'] = this.peopleIds;

      if (this.locationIds && this.locationIds.length > 0)
        data['locationIds'] = this.locationIds;
      if (another)
        this.saveAddButtonLoader = true
      else
        this.saveButtonLoader = true;

      if (this.action == 'edit') {
        data['CostCenterStructureId'] = this.costCenterStructureRowData.CostCenterStructureId;
      }

      data['TabName'] = 'Invoices';

      this.costStructureService.ccStructuresRule(data).subscribe((res: any) => {
        if (res.Success) {

          this.getCCSChangelogData();

          if (another)
            this.saveAddButtonLoader = false
          else
            this.saveButtonLoader = false;
          this.ErrorWarningPopupOpen(res.Message).afterClosed().subscribe(data => {

            if (another == false) {
              this.redirectAllocationTab.emit({type: 'grid'});
            } else {
              // this.structureForm.reset();
              // this.setValueInFormControl('status', true);
              // this.submitted = false;
              // this.setValueInFormControl('temId', 1000);
              // this.changeTem();
              this.addAllocation()
            }
          })

        } else {
          if (another)
            this.saveAddButtonLoader = false
          else
            this.saveButtonLoader = false;

          if (res.Data?.ValidationKey == 'OverAllocation') {

           let matchedData =  _.map(res.Data.OverAllocation.$values, (x: any)=> x.AssignmentValueId);
           let list;
           if(this.f['assignmentType'].value == 'People') {
            list = matchedData.map((id: any) => this.selectedPeoples.find((item: any) => item.PeopleId === id)?.PeopleName).filter((PeopleName: any) => PeopleName !== undefined)
          } else if(this.f['assignmentType'].value == 'Location') {
            list = matchedData.map((id: any) => this.selectedLocations.find((item: any) => item.LocationId === id)?.LocationName).filter((LocationName: any) => LocationName !== undefined)
          } else if(this.f['assignmentType'].value == 'Vendor Product') {
           
            list = matchedData.map((id: any) => this.selectedInventories.find((item: any) => item.VendorProductInventoryId === id)?.VendorProductName).filter((VendorProductName: any) => VendorProductName !== undefined)

          }
            let errorData: any = {
              messgeType: 'error',
              okBtnName: 'Close & Review',
              title: 'Attention',
              titleClass: 'text-c-blue',
              icon: 'fas fa-question-circle',
              iconClass: 'text-c-blue f-70',
              message: res.Message,
              list: list
            };

            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
              panelClass: 'error-warning',
              data: errorData,
            });
            dialogRef.afterClosed().subscribe((result) => {
              if (result == false) {
              }
            });
          } else if (res.Data?.ValidationKey == "Duplicate") {
            let errorData: any = {
              messgeType: 'error',
              closeBtnName: 'Oops, use the existing rule please',
              okBtnName: 'Close & Review',
              title: 'Attention',
              titleClass: 'text-c-blue',
              icon: 'fas fa-question-circle',
              iconClass: 'text-c-blue f-70',
              message: res.Message,
            };
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
              panelClass: 'error-warning',
              data: errorData,
            });
            dialogRef.afterClosed().subscribe((result) => {
              if (result == false) {
              }
            });
          } else {
            this.ErrorWarningPopupOpen(res.Message)
          }
        }
      }, error => {

        this.ErrorWarningPopupOpen(error.Message)
      });
    }


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
    return dialogRef
  }
  saveAddAnother() {
    this.structureForm.reset();
    this.setValueInFormControl('status', true);
    this.submitted = false;
  }
}
