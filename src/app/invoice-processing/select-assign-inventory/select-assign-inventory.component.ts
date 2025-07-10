import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import * as _ from 'lodash';
import { TreeNode } from 'primeng/api';
import { MatDialog } from '@angular/material/dialog';
import { processNumberFilter, processTextFilter } from 'src/app/common/ag-grid-filter';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { filterOptionsText, filterOptionsNumber, filterOptionsDate, onChangeEndDate } from 'src/app/services/common-p-table';
import { isValuesUndefined, isValueExist } from 'src/app/services/helper';
import { SandBoxService } from 'src/app/services/sandbox.service';
import { WirelineService } from 'src/app/services/wireline.service';
import { ButtonRendererComponent } from '../assign-vendor-product/button-renderer.component';
import { RadioButtonRender } from './radio-button-ag-grid.component';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { AgGridTableComponent } from 'src/app/common/ag-grid-table/ag-grid-table.component';

interface arrDate {
  filterKey: any;
  filterOptionType1: any;
  filterOptionValue1: any;
  filterOptionValue1_2?: any;
  filterOptionValue2_2?: any;
  filterOperationType: any;
  filterOptionType2: any;
  filterOptionValue2: any;
}

@Component({
  selector: 'app-select-assign-inventory',
  templateUrl: './select-assign-inventory.component.html',
  styleUrls: ['./select-assign-inventory.component.scss'],
  imports: [SharedModule, PrimgModule, AgGridTableComponent]
})
export class SelectAssignInventoryComponent implements OnInit {
  dummySource = [];
  source: any = [];
  confirmed: any = [];
  selectedCCVLeft:any = [];
  selectedCCVRight:any = [];
  rowData :any= [];
  rowDatan :any= [];
  @Input() sandBoxGridRowData: any;
  @Input() inventoryData: any;
  @Input() inventoryPayload: any;
  @Input() recordPublishedOrCompleted: any;
  @Input() overviewData: any;
  @Input() headerCheckboxData: any;

  gridOptions: any = {
    rowModelType: 'serverSide',
    serverSideInfiniteScroll: true,
    enableFiltering: true,
    headerHeight: 35,
    groupHeaderHeight: 37,
    floatingFiltersHeight: 35
  };
  public exportAccounts: any;
  model = { option: 'AND' };
  radioItems: Array<any>;

  dialogRef: any;
  disable = false
  public columnDefs1;
  public columnDefs;
  public columnDefsn;
  frameworkComponents: any;
  selectedRadio: any;
  showMessage = false;
  selectedDetail: any = [];
  private _unsubscribeParent: Subject<any> = new Subject<any>();
  private _unsubscribeFromOtherSBInvoice: Subject<any> = new Subject<any>();
  private _unsubscribeFromOtherSBInvoiceData: Subject<any> = new Subject<any>();
  saveButtonDisabled = false;
  isParent: any;
  sbRemove: any = [];
  dataFrom: any;
  isShowLoader = false;
  fieldsName: any;
  items: any[];
  leftToRightLoading: boolean = false;
  displayModal: boolean = false;
  displayModal1: boolean = false;

  public selectedSBChargeDetailId = null;
  @Output() switchTab: EventEmitter<any> = new EventEmitter<any>();
  pTableContain = { first: 1 };
  finalAllDetailArr: any;
  @Output() exportAccountData: EventEmitter<any> = new EventEmitter();
  @Output() rowCellDoubleClicked: EventEmitter<any> = new EventEmitter();
  
  @ViewChild('tooltipText') tooltipText!: TemplateRef<any>;
  @ViewChild('tooltipText2') tooltipText2!: TemplateRef<any>;
  displaycols: any[];
  cols: any[];
  colsshow: any[];
  totalRecords: number;
  loading: boolean;
  sorting: any;
  sortingType: any;
  expandedNode: TreeNode | null = null;
  lastNode: TreeNode | null = null;
  contextMenuPosition: { x: number; y: number } = { x: 0, y: 0 };
  filterArray: arrDate[];
  filterArrayDate: arrDate[];
  filterArrayNumber: arrDate[];
  types = ['Product', 'Feature', 'Usage', 'Equipment'];

  textboxValue1: any = '';
  textboxValue2: any = '';

  textboxValue1_1: any = '';
  textboxValue2_1: any = '';

  rowSelection = 'single';
  rowSelection1 = 'multiple';
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
  VendorBillingAliasId: any;
  filesColumns: any = []
  selectedFiles!: any[];
  countries = [
    {
      id: 1,
      name: 'contains',
      display: 'Contains',
    },
    {
      id: 2,
      name: 'notContains',
      display: 'Not contains',

    },
    {
      id: 3,
      name: 'equals',
      display: 'Equals',

    },
    {
      id: 4,
      name: 'notEqual',
      display: 'Not equal',
    },
    {
      id: 5,
      name: 'startsWith',
      display: 'Starts with',
    },
    {
      id: 6,
      name: 'endsWith',
      display: 'Ends with',
    },
  ];
  selectedOption1: any = '';
  selectedOption2: any = '';
  isLoading: boolean = false;

  sidebarVisible: boolean = false;
  selectedNode: any;
  finalFilterdArr: any;
  private _unsubscribeGRid: Subject<any> = new Subject<any>();

  assignParentLoader = false;
  leftSelectedRow:any = [];
  disabledAddBtn = false;
  savedFilterEvent: any;
  savedFilterCol: any;
  // Add this debounced function property
  private debouncedLoadNodes: () => void;

  constructor(public sandBoxService: SandBoxService, public dialog: MatDialog, public wirelineService: WirelineService) {
    this.columnDefs = [
      {
        headerCheckboxSelection: false,
        checkboxSelection: true,
        floatingFilter: true,
        suppressMenu: true,
        minWidth: 150,
        maxWidth: 50,
        width: 100,
        flex: 0,
        resizable: true,
        sortable: false,
        filter: false,
        suppressColumnsToolPanel: true,
      },
      {
        headerName: 'Account',
        children: [
          {
            headerName: 'Main Account Number',
            field: 'MainAccountNumber',
            columnGroupShow: 'close',
            editable: false,
            minWidth: 209,
            flex: 0,
            filter: 'agTextColumnFilter'
          },
          {
            headerName: 'Sub Account',
            field: 'SubAccountNumber',
            columnGroupShow: 'open',
            editable: false,
            width: 150,
            minWidth: 150,
            flex: 0,
            filter: 'agTextColumnFilter'
          },
          {
            headerName: 'Payable Account',
            field: 'PayableAccountNumber',
            columnGroupShow: 'open',
            editable: false,
            width: 172,
            minWidth: 172,
            flex: 0,
            filter: 'agTextColumnFilter'
          },
        ]
      },
      {
        headerName: 'Inventory',
        children: [
          {
            field: 'BillingId',
            headerName: 'Billing ID',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 167,
            flex: 0
          },
          {
            field: 'ServiceNumber',
            headerName: 'Service ID',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 133,
            minWidth: 133,
            flex: 0
          },

          {
            field: 'ParentVendorProductInventoryNumber',
            headerName: 'Parent',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 120,
            minWidth: 120,
            flex: 0
          },
          {
            field: 'ParentAccountNumber',
            headerName: 'Parent Account',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 165,
            minWidth: 165,
            flex: 0
          }
        ]
      },
      {
        headerName: 'Charge Code',
        children: [
          {
            field: 'ChargeCodeName',
            headerName: 'Charge Code Name',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 189,
            minWidth: 189,
            flex: 0
          },
          {
            field: 'ChargeCode',
            headerName: 'Charge Code',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 165,
            minWidth: 165,
            flex: 0
          },

          {
            field: 'ChargeCodeTypeName',
            headerName: 'Charge Code Type',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            widrh: 190,
            minWidth: 190,
            flex: 0
          },
          {
            field: 'ChargeTypeName',
            headerName: 'Charge Type',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 150,
            minWidth: 150,
            flex: 0
          },
          {
            field: 'ChargeCodeOccurrence',
            headerName: 'Charge Occurrence',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 190,
            minWidth: 190,
            flex: 0
          },
        ],
      },
      {
        headerName: 'Charge',
        children: [
          {
            field: 'charge',
            headerName: 'Charge',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 135,
            flex: 0,
            cellStyle: { display: 'flex !important', 'justify-content': 'end', 'padding-right': '50px' },
            valueFormatter: (params: { data: { charge: any; CurrencySymbol: any; }; }) => this.currencyFormatter(params.data?.charge, params.data?.CurrencySymbol),
          }
        ],

      },
      {
        headerName: 'Additional Information',
        children: [
          {
            field: 'DistributionAmountDistributedDisplay',
            headerName: 'Original Distribution Amount',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 225,
            flex: 0,
            cellStyle: { display: 'flex !important', 'justify-content': 'end', 'padding-right': '50px' }
          },
          {
            field: 'DistributionEventId',
            headerName: 'Distribution Event',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 159,
            flex: 0
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
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 167,
            flex: 0
          },
          {
            field: 'ServiceTypeName',
            headerName: 'Service Type',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 150,
            minWidth: 150,
            flex: 0
          },
          {
            field: 'ServiceName',
            headerName: 'Service',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 150,
            minWidth: 150,
            flex: 0
          },
          {
            field: 'ProductTypeName',
            headerName: 'Product Type',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 155,
            minWidth: 155,
            flex: 0
          },
          {
            field: 'ProductName',
            headerName: 'Product',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 121,
            minWidth: 121,
            flex: 0
          },

        ],
      },
      {
        headerName: 'Location',
        children: [
          {
            field: 'LocationName',
            headerName: 'Location Name',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 200,
            flex: 0
          },
          {
            field: 'Address1',
            headerName: 'Address One',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 150,
            minWidth: 150,
            flex: 0
          },
          {
            field: 'Address2',
            headerName: 'Address Two',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 150,
            minWidth: 150,
            flex: 0
          },
          {
            field: 'City',
            headerName: 'City',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 150,
            minWidth: 150,
            flex: 0
          },
          {
            field: 'StateName',
            headerName: 'State/Provice/Region',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 200,
            flex: 0
          },
          {
            field: 'PostalCode',
            headerName: 'Zip/Postal Code',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 168,
            minWidth: 168,
            flex: 0
          },
          {
            field: 'LocationCode',
            headerName: 'Location Code',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 159,
            minWidth: 159,
            flex: 0
          },
          {
            field: 'LocationCustomField1',
            headerName: 'Location Custom1',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 180,
            minWidth: 180,
            flex: 0
          },
          {
            field: 'LocationCustomField2',
            headerName: 'Location Custom2',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 181,
            minWidth: 181,
            flex: 0
          },
          {
            field: 'LocationCustomField3',
            headerName: 'Location Custom3',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 181,
            minWidth: 181,
            flex: 0
          },
          {
            field: 'LocationCustomField4',
            headerName: 'Location Custom4',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 181,
            minWidth: 181,
            flex: 0
          },
        ]
      }

    ]

    this.columnDefsn = [
      {
        headerName: 'Account',
        children: [
          {
            headerName: 'Main Account Number',
            field: 'MainAccountNumber',
            columnGroupShow: 'close',
            editable: false,
            minWidth: 209,
            flex: 0,
            filter: 'agTextColumnFilter'
          },
          {
            headerName: 'Sub Account Number',
            field: 'SubAccountNumber',
            columnGroupShow: 'open',
            editable: false,
            width: 186,
            minWidth: 186,
            flex: 0,
            filter: 'agTextColumnFilter'
          },
          {
            headerName: 'Payable Account Number',
            field: 'PayableAccountNumber',
            columnGroupShow: 'open',
            editable: false,
            width: 202,
            minWidth: 202,
            flex: 0,
            filter: 'agTextColumnFilter'
          },
          {
            headerName: 'Vendor',
            field: 'VendorAccountName',
            columnGroupShow: 'open',
            editable: false,
            width: 117,
            minWidth: 117,
            flex: 0,
            filter: 'agTextColumnFilter'
          },
          {
            headerName: 'Charge Code Vendor',
            field: 'VendorAccountName',
            columnGroupShow: 'open',
            editable: false,
            width: 177,
            minWidth: 177,
            flex: 0,
            filter: 'agTextColumnFilter'
          },
          {
            headerName: 'VBA',
            field: 'VendorBillingAliasName',
            columnGroupShow: 'open',
            editable: false,
            width: 100,
            minWidth: 100,
            flex: 0,
            filter: 'agTextColumnFilter'
          },
        ]
      },
      {
        headerName: 'Inventory',
        children: [
          {
            field: 'ServiceNumber',
            headerName: 'Billing ID',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 128,
            flex: 0,
            cellClass: "ag-cell-add-btn",
            cellRenderer: function (params: { data: { AccrossInventory: any; ServiceNumber: any; }; }) {
              return  params.data.AccrossInventory == true ? params.data.ServiceNumber + '<div><button class="btn btn-primary grid-cell-btn" style="padding: 2px 8px; font-size: 10px; position: relative; top: -1px; margin-left: 5px;">Added</button></div>' : params.data.ServiceNumber
            }
          },
          {
            field: '',
            headerName: 'Parent',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 120,
            minWidth: 120,
            flex: 0
          },
          {
            field: '',
            headerName: 'Parent Account',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 165,
            minWidth: 165,
            flex: 0
          },
          {
            field: 'InventoryStatusDisplayText',
            headerName: 'Status',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 89,
            minWidth: 89,
            flex: 0
          },
          // {
          //   field: 'ServiceNumber',
          //   headerName: 'Service ID',
          //   columnGroupShow: 'open',
          //   editable: false,
          //   filter: 'agTextColumnFilter',
          //   width: 133,
          //   minWidth: 133,
          //   flex: 0
          // }
        ]
      },
      {
        headerName: 'Charges',
        children: [
          // {
          //   field: 'charge',
          //   headerName: 'Charge',
          //   columnGroupShow: 'close',
          //   editable: false,
          //   filter: 'agTextColumnFilter',
          //   minWidth: 135,
          //   flex: 0,
          //   cellStyle: {display: 'flex !important', 'justify-content': 'end','padding-right':'50px'}
          // }
          {
            field: 'TotalCurrentCharges',
            headerName: 'Product Total',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agNumberColumnFilter',
            width: 145,
            minWidth: 145,
            flex: 0,
            cellStyle: {display: 'flex !important', 'justify-content': 'end','padding-right':'30px'},
            valueFormatter: (params: { data: { TotalCurrentCharges: any; CurrencySymbol: any; }; }) => this.currencyFormatter(params?.data?.TotalCurrentCharges, params?.data?.CurrencySymbol),
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
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 167,
            flex: 0
          },
          {
            field: 'ServiceType',
            headerName: 'Service Type',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 150,
            minWidth: 150,
            flex: 0
          },
          {
            field: 'Service',
            headerName: 'Service',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 150,
            minWidth: 150,
            flex: 0
          },
          {
            field: 'ProductType',
            headerName: 'Product Type',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 155,
            minWidth: 155,
            flex: 0
          },
          {
            field: 'Product',
            headerName: 'Product',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 121,
            minWidth: 121,
            flex: 0
          },

        ],
      },
      {
        headerName: 'Location',
        children: [
          {
            field: 'LocationName',
            headerName: 'Location Name',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 164,
            minWidth: 164,
            flex: 0
          },
          {
            field: 'Address1',
            headerName: 'Address One',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 150,
            minWidth: 150,
            flex: 0
          },
          {
            field: 'Address2',
            headerName: 'Address Two',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 150,
            minWidth: 150,
            flex: 0
          },
          {
            field: 'City',
            headerName: 'City',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 150,
            minWidth: 150,
            flex: 0
          },
          {
            field: 'CountryName',
            headerName: 'Country',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 125,
            minWidth: 125,
            flex: 0
          },
          {
            field: 'StateName',
            headerName: 'State/Provice/Region',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 200,
            flex: 0
          },
          {
            field: 'PostalCode',
            headerName: 'Zip/Postal Code',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 168,
            minWidth: 168,
            flex: 0
          },
          {
            field: 'LocationCode',
            headerName: 'Location Code',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 159,
            minWidth: 159,
            flex: 0
          },
          {
            field: 'LocationCustomField1',
            headerName: 'Location Custom1',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 180,
            minWidth: 180,
            flex: 0
          },
          {
            field: 'LocationCustomField2',
            headerName: 'Location Custom2',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 181,
            minWidth: 181,
            flex: 0
          },
          {
            field: 'LocationCustomField3',
            headerName: 'Location Custom3',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 181,
            minWidth: 181,
            flex: 0
          },
          {
            field: 'LocationCustomField4',
            headerName: 'Location Custom4',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 181,
            minWidth: 181,
            flex: 0
          },
        ]
      },
      {
        headerName: 'People',
        children: [
          {
            field: 'PeopleName',
            headerName: 'Name',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 110,
            minWidth: 110,
            flex: 0,
          },
          {
            field: 'PeopleEmail',
            headerName: 'Email',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 120,
            minWidth: 120,
            flex: 0,
          },
          {
            field: 'PeopleUserTitle',
            headerName: 'User Title',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 130,
            minWidth: 130,
            flex: 0
          },

          {
            field: 'Department',
            headerName: 'Department',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 124,
            minWidth: 124,
            flex: 0
          },
          {
            field: 'PeopleCustomField1',
            headerName: 'User Custom 1',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 136,
            minWidth: 136,
            flex: 0
          },
          {
            field: 'PeopleCustomField2',
            headerName: 'User Custom 2',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 138,
            minWidth: 138,
            flex: 0
          },
          {
            field: 'PeopleCustomField3',
            headerName: 'User Custom 3',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 138,
            minWidth: 138,
            flex: 0
          },
          {
            field: 'PeopleCustomField4',
            headerName: 'User Custom 4',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 139,
            minWidth: 139,
            flex: 0
          }
        ],
      }
    ]

    this.columnDefs1 = [
      {
        headerName: '',
        children: [
          {
            headerName: 'Parent',
            columnGroupShow: 'open',
            editable: false,
            minWidth: 74,
            flex: 0,
            floatingFilter: true,
            suppressMenu: true,
            resizable: true,
            sortable: true,
            filter: false,
            suppressColumnsToolPanel: true,
            cellRenderer: RadioButtonRender,
            cellRendererParams: {
              onClick: this.radioSelect.bind(this)
            }
          },
          {
            headerName: 'Required',
            columnGroupShow: 'open',
            editable: false,
            minWidth: 90,
            flex: 0,
            floatingFilter: true,
            suppressMenu: true,
            resizable: true,
            sortable: true,
            filter: false,
            suppressColumnsToolPanel: true,
            checkboxSelection: true
          },
        ],
      },

      {
        headerName: 'Account',
        children: [
          {
            field: 'MainAccountNumber',
            headerName: 'Main Account Number',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 210,
            flex: 0
          },
          {
            field: 'SubAccountNumber',
            headerName: 'Sub Account',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 150,
            minWidth: 150,
            flex: 0
          },
          {
            field: 'PayableAccountNumber',
            headerName: 'Payable Account',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 172,
            minWidth: 172,
            flex: 0
          },
        ]
      },
      {
        headerName: 'Inventory',
        children: [

          {
            field: 'BillingId',
            headerName: 'Billing ID',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 165,
            minWidth: 165,
            flex: 0,
            cellClass: "ag-cell-add-btn",
            cellRenderer: function (params: { data: { AccrossInventory: any; BillingId: any; }; }) {
              return params.data.AccrossInventory == true ? params.data.BillingId + '<div><button class="btn btn-primary grid-cell-btn" style="padding: 2px 8px; font-size: 10px; position: relative; top: -1px; margin-left: 5px;">Added</button></div>' : params.data.BillingId
            }
          },
          {
            field: 'ServiceNumber',
            headerName: 'Service ID',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 133,
            minWidth: 133,
            flex: 0
          },
          {
            field: 'ParentVendorProductInventoryNumber',
            headerName: 'Parent',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 120,
            minWidth: 120,
            flex: 0
          },
          {
            field: 'ParentAccountNumber',
            headerName: 'Parent Account',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 165,
            minWidth: 165,
            flex: 0
          }
        ]
      },
      {
        headerName: 'Charge Code',
        children: [
          {
            field: 'ChargeCodeName',
            headerName: 'Charge Code Name',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 250,
            flex: 0
          },
          {
            field: 'ChargeCode',
            headerName: 'Charge Code',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 165,
            minWidth: 165,
            flex: 0
          },
          {
            field: 'ChargeCodeTypeName',
            headerName: 'Charge Code Type',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 200,
            minWidth: 200,
            flex: 0
          },
          {
            field: 'ChargeTypeName',
            headerName: 'Charge Type',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 150,
            minWidth: 150,
            flex: 0
          },
          {
            field: 'ChargeCodeOccurrence',
            headerName: 'Charge Occurrence',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 190,
            minWidth: 190,
            flex: 0
          },
        ]
      },
      {
        headerName: 'Charge',
        children: [
          {
            field: 'charge',
            headerName: 'Charge',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 135,
            flex: 0,
            cellStyle: { display: 'flex !important', 'justify-content': 'end', 'padding-right': '30px' },
            valueFormatter: (params: { data: { charge: any; CurrencySymbol: any; }; }) => this.currencyFormatter(params.data?.charge, params.data?.CurrencySymbol),
          }
        ]
      },
      {
        headerName: 'Additional Information',
        children: [
          {
            field: 'DistributionAmountDistributed',
            headerName: 'Original Distribution Amount',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agNumberColumnFilter',
            minWidth: 225,
            flex: 0,
            valueFormatter: (params: { data: { DistributionAmountDistributed: any; }; }) => this.currencyFormatter(params.data?.DistributionAmountDistributed, this.overviewData.CurrencySymbol),
            cellStyle: { display: 'flex !important', 'justify-content': 'end', 'padding-right': '30px' }
          },
          {
            field: 'DistributionEventId',
            headerName: 'Distribution Event',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 150,
            flex: 0
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
            editable: false,
            filter: 'agTextColumnFilter',
            width: 167,
            minWidth: 167,
            flex: 0
          },
          {
            field: 'ServiceTypeName',
            headerName: 'Service Type',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 150,
            minWidth: 150,
            flex: 0
          },
          {
            field: 'ServiceName',
            headerName: 'Service',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 150,
            minWidth: 150,
            flex: 0
          },
          {
            field: 'ProductTypeName',
            headerName: 'Product Type',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 155,
            minWidth: 155,
            flex: 0
          },
          {
            field: 'ProductName',
            headerName: 'Product',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 121,
            minWidth: 121,
            flex: 0
          }
        ]
      },
      {
        headerName: 'Location',
        children: [
          {
            field: 'LocationName',
            headerName: 'Location Name',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 200,
            minWidth: 200,
            flex: 0
          },
          {
            field: 'Address1',
            headerName: 'Address One',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 150,
            minWidth: 150,
            flex: 0
          },
          {
            field: 'Address2',
            headerName: 'Address Two',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 150,
            minWidth: 150,
            flex: 0
          },
          {
            field: 'City',
            headerName: 'City',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 150,
            minWidth: 150,
            flex: 0
          },
          // {
          //   field: 'CountryName',
          //   headerName: 'Country',
          //   columnGroupShow: 'open',
          //   editable: false,
          //   filter: 'agTextColumnFilter',
          //   minWidth: 200,
          //   flex: 0
          // },
          {
            field: 'StateName',
            headerName: 'State/Provice/Region',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 200,
            flex: 0
          },
          {
            field: 'PostalCode',
            headerName: 'Zip/Postal Code',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 168,
            minWidth: 168,
            flex: 0
          },
          {
            field: 'LocationCode',
            headerName: 'Location Code',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 159,
            minWidth: 159,
            flex: 0
          },
          {
            field: 'LocationCustomField1',
            headerName: 'Location Custom1',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 180,
            minWidth: 180,
            flex: 0
          },
          {
            field: 'LocationCustomField2',
            headerName: 'Location Custom2',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 181,
            minWidth: 181,
            flex: 0
          },
          {
            field: 'LocationCustomField3',
            headerName: 'Location Custom3',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 181,
            minWidth: 181,
            flex: 0
          },
          {
            field: 'LocationCustomField4',
            headerName: 'Location Custom4',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 181,
            minWidth: 181,
            flex: 0
          },
        ]
      },
      {
        headerName: 'Remove',
        children: [
          {
            headerName: 'Remove',
            columnGroupShow: 'open',
            editable: false,
            minWidth: 93,
            flex: 0,
            floatingFilter: true,
            suppressMenu: true,
            resizable: true,
            sortable: true,
            filter: false,
            suppressColumnsToolPanel: true,
            cellRenderer: 'buttonRenderer',
            cellRendererParams: {
              onClick: this.onBtnClick1.bind(this)
            }
          }

        ],

      }

    ];

    this.frameworkComponents = {
      buttonRenderer: ButtonRendererComponent,
      radioButtonRender: RadioButtonRender
    }

    // Initialize the debounced function in the constructor
    this.debouncedLoadNodes = _.debounce(() => {
        this.pTableContain.first = 1; // Reset to first page when filtering
        this.loadNodes(this.pTableContain, true); // Pass true to clear existing data
    }, 500); // 500ms debounce time (adjust as needed)


    console.log(this.inventoryPayload, 'this.inventoryPayload', this.headerCheckboxData);
  }

  gridApi: any;
  gridColumnApi: any;
  files: any[];
  originalFiles: any[];
  
  onAgGridReadyEmit($event: any) {
    this.gridApi = $event;
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

          if(key === 'TotalCurrentCharges') {
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

        if(filterArrayNumber && filterArrayNumber.length > 0) {
          data['advanceNumberFilter'] = filterArrayNumber;
        }
        // data['VendorBillingAliasId'] = this.inventoryData[0].VendorBillingAliasId;
        data['vendorAccountId'] = this.overviewData.VendorAccountId;
        data['customerAccountId'] = this.sandBoxGridRowData.CustomerAccountId;
        data['sbInvoiceId'] = this.sandBoxGridRowData.SBInvoiceId;
        data['IsTotalNeed'] = true;
        if (paramsRequest.sortModel.length > 0) {

          Object.values(params['columnApi']['columnController']['columnDefs']).forEach((key:any) => {
            if (key['children']) {
              Object.values(key['children']).forEach((k:any) => {
                if (k['field'] === paramsRequest.sortModel[0].colId) {
                  data['OrderBy'] = k['field'];
                  data['SortOrder'] = paramsRequest.sortModel[0].sort;
                }
              });
            }
          });
        }
        this._unsubscribeFromOtherSBInvoice.next(null);
        
        this.wirelineService.getInventoryData(data)
          .pipe(takeUntil(this._unsubscribeFromOtherSBInvoice))
          .subscribe(
            async (data: any) => {
              this.isShowLoader = false;
              this.rowData = data.Data.$values;

              // this.selectedIds = data.Data.$values[0].LinkVendorProductInventoryId ? data.Data.$values[0].LinkVendorProductInventoryId.split(',').map(part =>parseInt(part, 10)) : [];

              if (data && data.Data.$values.length > 0) {
                let lastRow = -1;
                if (data.TotalCount <= paramsRequest.startRow + 100) {
                  lastRow = data.TotalCount;
                }
                params.successCallback(
                  data.Data.$values,
                  lastRow
                );
              } else {
                params.successCallback([], 0 );
                let a = this.gridApi.api ? this.gridApi.api : this.gridApi;
                a?.showNoRowsOverlay();
              }

              params.api.forEachNode(function (node: any) {
                node.setSelected(node.data.InventoryLocationAtt == 'Yes' ? true : false );
              });
            },
            (error) => {
              this.isShowLoader = true;
              params.successCallback([], 0 );
              let a = this.gridApi.api ? this.gridApi.api : this.gridApi;
              a?.showNoRowsOverlay();
            }
          );
      },
    };
    this.gridApi?.setServerSideDatasource(dataSource);
  }


  openDialog(): void {
    const dialogRef = this.dialog.open(this.tooltipText, {
      width: '900px',
      data: {
        colseButton: true,
      }
    });
  }

  openDialog2(): void {
    const dialogRef = this.dialog.open(this.tooltipText2, {
      width: '900px',
      data: {
        colseButton: true,
      }
    });
  }

  radioSelect(e: any) {
    this.selectedRadio = e;
    const indexFile = this.originalFiles.findIndex((item) => item.data.SBChargeDetailId === e.SBChargeDetailId);
    this.originalFiles[indexFile]['data']['isChecked'] =  true;

    this.originalFiles = _.map(this.originalFiles, (node: any) => {
      let a: any = {}
      a = node;
      a['data']['parent'] = node.data.SBChargeDetailId === e.SBChargeDetailId
      return a;
    });

    this.VendorBillingAliasId = e.VendorBillingAliasId;
    if (this.selectedRadio) {
        this.showMessage = false;
    }
  }
  currencyFormatter(currency: number | null | undefined, sign: string) {
    if (currency !== null && currency !== undefined) {
      var sansDec: any = currency.toFixed(2);
      return sign + `${sansDec.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
    } else {
      return '';
    }
  }
  onBtnClick1(e: { SBChargeDetailId: any; }) {

    if (this.selectedRadio?.SBChargeDetailId == e.SBChargeDetailId) {
      let errorData: any = {
        messgeType: "error",
        title: "Attention",
        titleClass: "text-c-blue",
        icon: "fas fa-exclamation-triangle",
        iconClass: "text-c-blue f-70",
        message: 'You must 1st select a new Parent Charge Code prior to removing this Charge Code from the Vendor Product'
      }
      const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
        width: '600px',
        panelClass: 'error-warning',
        data: errorData
      });
    } else {
      let errorData: any = {
        messgeType: "error",
        title: "Attention",
        titleClass: "text-c-blue",
        icon: "fas fa-exclamation-triangle",
        iconClass: "text-c-blue f-70",
        okBtnName: 'Do not remove Association',
        closeBtnName: 'Remove Association',
        message: 'Removing a Charge Code from this list will: Remove the Charge Code from the Parent/child relationship and from the Vendor Product if it was a part of the Product and it will need to be assigned separately after removal. Do you want to proceed?' //if messges is multiple use array
      }
      const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
        width: '600px',
        panelClass: 'error-warning', data: errorData
      });
      dialogRef.afterClosed().subscribe(result => {
        if (!isValuesUndefined(result)) {
          if (!result) {
            this.sbRemove.push(e.SBChargeDetailId);
            if (this.selectedRadio && this.selectedRadio['SBChargeDetailId'] === e.SBChargeDetailId) {
              this.selectedRadio = {};
            }
            
           this.originalFiles = this.originalFiles.filter((x) => x.data.SBChargeDetailId !== e.SBChargeDetailId)

           this.selectedDetail = _.map(
            _.filter(this.originalFiles, (x: any) => x.data.isChecked),
            (x: any) => x.data.SBChargeDetailId
          );

            this.addButtonDisableFn(this.originalFiles);
            // let sbIds = _.map(this.dataFrom, (x) => x.SBChargeDetailId);
            // if(sbIds.includes(e.rowData.SBChargeDetailId)) {
            // }
            // this.saveChargeCodeGroupAndVendorProduct();
          }
        }
      });
    }

    // if(e.rowData.GroupId !== ) {
    // }
    // dialogRef.afterClosed().subscribe(result => {
    //   if (!result) {
    //     let dataIndex = _.findIndex(this.rowData, (x: any) => x.SBChargeDetailId == e.rowData.SBChargeDetailId);
    //     this.rowData.splice(dataIndex, 1);
    //     this.rowData = _.cloneDeep(this.rowData);
    //   }
    // });
  }

  ngOnInit(): void {
    this.setCols();
    this.items = [
      {
        label: ' Copy',
        icon: 'pi pi-copy',
        command: () => this.dropdownOptionSelected(),
      },
    ];
    this.radioItems = ['AND', 'OR'];
    this.filterArray = [];
    this.filterArrayNumber = [];
    this.filterArrayDate = [];
    this.files = [];
    this.originalFiles = [];

    this.loading = false;

    this.loadNodes(this.pTableContain, true);
  }

  getFromOtherSBInvoice() {
    this.isShowLoader = true;
    const data = {
      customerAccountId: this.sandBoxGridRowData.CustomerAccountId,
      vendorAccountId : this.sandBoxGridRowData.VendorAccountId,
      // VendorBillingAliasId: this.inventoryData[0].VendorBillingAliasId
    }
    this.rowDatan = [];
    this._unsubscribeFromOtherSBInvoice.next(null);
    this.sandBoxService.FromOtherSBInvoice(this.sandBoxGridRowData.SBInvoiceId, data).pipe(takeUntil(this._unsubscribeFromOtherSBInvoice))
      .subscribe((data: any) => {
        this.rowDatan = data.Data.$values;
        this.isShowLoader = false;
      });

  }

  leftToRightDataMove() {
    this.leftToRightLoading = true;
    this.assignParentLoader = true;
    const selectedRecord = this.selectedCCVLeft[0];

    const inventory = {
      data: {
        ...selectedRecord,
        newRecordAdded: true,
        isChecked: true,
        parent: true, 
        PrimaryChargeCode: true, 
        bypassDisableCheck: true,
        // Set service and product type related fields
        BillingId: selectedRecord.ServiceNumber,
        ServiceTypeName: selectedRecord.ServiceType,
        ServiceName: selectedRecord.Service,
        ProductTypeName: selectedRecord.ProductType,
        ProductName: selectedRecord.Product
      }
    };

    this.files.push(inventory);
    this.originalFiles = this.files;
    this.displaycols = _.map(this.displaycols, (col: any) => {
      col.valuesset = null;
      return col;
    });
    this.selectedRadio = inventory.data;
    if(this.selectedRadio) {
      this.showMessage = false;
    }

    this.selectedCCVRight.push(inventory.data);
    this.selectedDetail.push(inventory.data.SBChargeDetailId);

    this.onSelectionChanged(inventory.data, true);
    this.originalFiles = this.files = _.sortedUniq(this.originalFiles);
    this.selectedCCVLeft = [];
    this.addButtonDisableFn(this.originalFiles);
    this.leftToRightLoading = false;
    this.assignParentLoader = false;
    this.leftSelectedRow.push(inventory.data.SBChargeDetailId);
  }

  rightToLeftDataMove() {

    this.selectedCCVRight.forEach((element: { SBChargeDetailId: null; }) => {
      if(this.selectedSBChargeDetailId == element.SBChargeDetailId) {
        const i = this.files.findIndex(f => f.data.SBChargeDetailId == element.SBChargeDetailId ); 
        this.files.splice(i, 1);
        this.selectedSBChargeDetailId = null;
        this.disable = true
      }
    });
    this.originalFiles = _.cloneDeep(this.files);
    this.displaycols = _.map(this.displaycols, (col: any) => {
      col.valuesset = null;
      return col;
    });

    const firstIds = new Set(this.originalFiles.map(i => i.data.SBChargeDetailId));
    this.selectedCCVRight = this.selectedCCVRight.filter((i: { SBChargeDetailId: any; }) => firstIds.has(i.SBChargeDetailId));

    this.rowDatan = _.cloneDeep(this.rowDatan);
    this.loadNodes(this.pTableContain, true, false, this.selectedCCVRight);

    let matchRecord = _.find(this.originalFiles, (element:any) =>
      element.data.PrimaryChargeCode == true
    );
    if (matchRecord == undefined) {
      this.selectedRadio = '';
    } else {
      this.selectedRadio = matchRecord;
      if(this.selectedRadio) {
        this.showMessage = false;
      }
    }
    this.selectedCCVRight = [];
    this.addButtonDisableFn(this.originalFiles);
    
  }

  addButtonDisableFn(data: any) {
    let matchRecordd = _.find(data, (element: any) =>
      element.data.newRecordAdded == true
    ); 
    if (matchRecordd) {
      this.disabledAddBtn = true;
    } else {
      this.disabledAddBtn = false;
    }
  }


  saveChargeCodeGroupAndVendorProduct() {
    
    if (!this.selectedRadio) {
      this.showMessage = true
      return;
    }

    // if(this.selectedCCVRight.length == 1) {
    //   let errorData: any = {
    //     messgeType: "error",
    //     title: "Attention",
    //     titleClass: "text-c-blue",
    //     icon: "fas fa-exclamation-circle",
    //     iconClass: "text-c-blue f-70",
    //     message: 'There should be one another record required for assigning a parent.'
    //   }
    //   const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
    //   dialogRef.afterClosed().subscribe(result => {
    //   });
    //   return
    // }
    const allowedTypes = ['Product', 'Feature', 'Usage', 'Equipment'];

    // if (!this.inventoryData[0]?.VendorProductTypeId) {
    //   let errorData: any = {
    //     messgeType: "error",
    //     title: "Attention",
    //     titleClass: "text-c-blue",
    //     icon: "fas fa-exclamation-circle",
    //     iconClass: "text-c-blue f-70",
    //     message: 'Assigning Vendor product is required'
    //   }
    //   const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
    //   dialogRef.afterClosed().subscribe(result => {
    //   });
    // }
    let rowDataFetch:any = [];
    let sbChargeDetailIds:any = [];
    let getGroupIds:any = [];
    this.originalFiles.forEach((element:any) => {
      getGroupIds.push(element.data.GroupId);
      if(isValueExist(element.data.chargeCodeId)) {
        rowDataFetch.push({
          "chargeCodeId": element.data.chargeCodeId,
          "primaryChargeCode": element.data.SBChargeDetailId == this.selectedRadio?.SBChargeDetailId ? true : false,
          "inventoryId": element.data.InventoryId,
          "billingAccountHierarchyId": element.data.BillingAccountHierarchyId,
          "vendorProductInventoryId": element.data.ParentVendorProductInventoryId,
          "childInventoryId": element.data.ChildInventoryId,
          "sbChargeDetailId": element.data.SBChargeDetailId,
          "IsNeedToAdd": this.types.includes(element.data.ChargeCodeTypeName)
        });
      }
      if(isValueExist(element.data.SBChargeDetailId)) {
        sbChargeDetailIds.push(element.data.SBChargeDetailId);
      }
    });

    let a :any = _.sortedUniq(getGroupIds);

    if (this.selectedRadio?.VendorProductTypeId == null) {
      let errorData: any = {
        messgeType: "error",
        title: "Attention",
        titleClass: "text-c-blue",
        icon: "fas fa-exclamation-circle",
        iconClass: "text-c-blue f-70",
        message: 'Assigning Vendor product is required'
      }
      const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
      dialogRef.afterClosed().subscribe(result => {
      });
      rowDataFetch = [];
      getGroupIds = [];
      sbChargeDetailIds = [];
      return;
    }

    if (a.length === 1) {
      a = a[0];
    } else {
      a = null;
    }
    rowDataFetch.forEach((el: { sbChargeDetailId: any; required: boolean; }) => {
      this.selectedDetail?.forEach((element: any) => {
        if (element == el.sbChargeDetailId || el.sbChargeDetailId == this.selectedRadio.SBChargeDetailId) {
          el.required = true;
        }
      });
    });
    rowDataFetch.forEach((el: { required: boolean; }) => {
      if (!el.required) {
        el.required = false;
      }
    });
    const data = {
      // "vendorBillingAliasId": this.VendorBillingAliasId ? this.VendorBillingAliasId : this.selectedRadio.VendorBillingAliasId,
      "VendorAccountId": this.selectedRadio?.VendorAccountId,
      "chargeCodes": rowDataFetch,
      "groupId": a,
      "isParentChange": true,
      "vendorProductInventoryDescription": null,
      "vendorProductTypeId": this.selectedRadio?.VendorProductTypeId,
      "sbInvoiceId": this.sandBoxGridRowData.SBInvoiceId,
      "sbChargeDetailIds": sbChargeDetailIds,
      "fromParentDifferentAccountTab": true,
      "sbChargeDetailIdsToRemove": [...new Set(this.sbRemove)],
      "ParentVendorProductInventoryId": this.selectedRadio.VendorProductInventoryId
      // "DiffSBChargeDetailsId": this.leftSelectedRow
    };

    rowDataFetch.forEach((x: any, index: any) => {
      if (this.sbRemove.includes(x.sbChargeDetailId)) {
        rowDataFetch.splice(index, 1)
      }
    });

    if (this.selectedRadio) {
      let value = this.selectedDetail?.includes(this.selectedRadio.SBChargeDetailId);
      if (value == undefined || value == false) {
        let errorData: any = {
          messgeType: "error",
          title: "Attention",
          titleClass: "text-c-blue",
          icon: "fas fa-exclamation-circle",
          iconClass: "text-c-blue f-70",
          message: 'A Parent charge code must be selected as required.'
        }
        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
        dialogRef.afterClosed().subscribe(result => {
        });
      } else {

        let errorData: any = {
          messgeType: "error",
          title: "Please wait",
          titleClass: "text-c-blue",
          icon: "fas fa-exclamation-circle",
          iconClass: "text-c-blue f-70",
          message: 'Hold the phone while we check for Vendor Products!',
          hideOkbtn: true
        };
        this.dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
    
        this.saveButtonDisabled = true;
        this.sandBoxService.chargeCodeGroupAndVendorProduct(data).pipe().subscribe((res: any) => {
          this.dialogRef.close();
          this.leftSelectedRow = [];
          if (res.Success) {
            this.saveButtonDisabled = false;
            let errorData: any = {
              messgeType: "error",
              title: "Attention",
              titleClass: "text-c-blue",
              icon: "fas fa-exclamation-circle",
              iconClass: "text-c-blue f-70",
              message: res.Message
            }
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
            dialogRef.afterClosed().subscribe(result => {
              if(res.Success) {
                this.switchTab.emit(1);
              }
            });
          } else {
            this.saveButtonDisabled = false;
            let errorData: any = {
              messgeType: "error",
              title: "Attention",
              titleClass: "text-c-blue",
              icon: "fas fa-exclamation-circle",
              iconClass: "text-c-blue f-70",
              message: res.Message
            }
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
            dialogRef.afterClosed().subscribe(result => {
            });
          }

          if(res?.Other?.NeedToCheckNextStep) {
            this.sandBoxService.getInvoiceStep(this.sandBoxGridRowData.SBInvoiceId).subscribe(()=> {
            })
          }
        })
      }
    }
  }
  isRowDisabled(rowData: any): boolean {
    if (rowData.bypassDisableCheck) {
      return false;
    }
    return !this.types.includes(rowData.ChargeCodeTypeName);
  }
  checkIfAllRowsDisabled(): boolean {
    return this.originalFiles.every((element: any) => !this.types.includes(element.data.ChargeCodeTypeName));
  }
  onSelectionChangedLeft($event: string | any[]) {
    this.isParent = $event.length > 0 ? true : false;
    this.selectedCCVLeft = $event;
  }
  onSelectionChanged(obj: { SBChargeDetailId: any; }, callFromLeftTable = false) {
    
    if (!callFromLeftTable) {
      const indexFile = this.originalFiles.findIndex((item) => item.data.SBChargeDetailId === obj.SBChargeDetailId);
      this.originalFiles[indexFile]['data']['isChecked'] = this.originalFiles[indexFile]['data']['isChecked'] === true ? false : true;
    }

    if (!callFromLeftTable) {
      const findSelectedRow = this.selectedCCVRight.some((item: { SBChargeDetailId: any; }) => item.SBChargeDetailId === obj.SBChargeDetailId);
      const findSelectedRowInd = this.selectedCCVRight.findIndex((item: { SBChargeDetailId: any; }) => item.SBChargeDetailId === obj.SBChargeDetailId);
      if(findSelectedRow) {
        this.selectedCCVRight.splice(findSelectedRowInd, 1);
      } else {
        this.selectedCCVRight.push(obj)
      }
    }
      
    if (this.selectedCCVRight.length) {
      
      let data =  _.some(this.selectedCCVRight, (x: any) => x.SBChargeDetailId == this.selectedSBChargeDetailId) ;
       if(data) {
        this.disable = false;
       } else {
        this.disable = true
       }

    }
   
    this.selectedDetail = _.map(
      _.filter(this.originalFiles, (x: any) => x.data.isChecked),
      (x: any) => x.data.SBChargeDetailId
    );


  }
  
    setCols() {
      const createColumn = (parent: number, width: string, isChildren: boolean, type: string, header: string, field: string, childHeader: string, columnGroupShow = 'close', colspan = 1, parentWidth = 150, isParentVisible = true, displayCheckboxColumns = true, isToggle = true) => ({
        parent,
        isicon: 1,
        width,
        valuesset: null,
        isenable: false,
        isChildren,
        type,
        header,
        columnGroupShow,
        field,
        childHeader,
        colspan,
        parentWidth,
        isParentVisible,
        displayCheckboxColumns,
        isToggle
      });
  
  
      this.cols = [
        // Parent Group
        createColumn(1, '90px', true, '', 'Parent', 'Parent', ''),
        createColumn(2, '100px', true, '', 'Required', 'Required', ''),
  
        // Account Group
        createColumn(3, '200px', true, 'text', 'Account', 'MainAccountNumber', 'Main Account Number'),
        createColumn(3, '200px', false, 'text', '', 'SubAccountNumber', 'Sub Account', 'open'),
        createColumn(3, '200px', false, 'text', '', 'PayableAccountNumber', 'Payable Account', 'open'),
  
        // Inventory Group
        createColumn(4, '165px', true, 'text', 'Inventory', 'BillingId', 'Billing ID'),
        createColumn(4, '120px', false, 'text', '', 'ServiceNumber', 'Service ID', 'open'),
        createColumn(4, '120px', false, 'text', '', 'ParentVendorProductInventoryNumber', 'Parent', 'open'),
        createColumn(4, '165px', false, 'text', '', 'ParentAccountNumber', 'Parent Account', 'open'),
  
        // Charge Code Group
        createColumn(5, '189px', true, 'text', 'Charge Code', 'ChargeCodeName', 'Charge Code Name', 'close'),
        createColumn(5, '150px', false, 'text', '', 'ChargeCode', 'Charge Code', 'open'),
        createColumn(5, '182px', false, 'text', '', 'ChargeCodeTypeName', 'Charge Code Type', 'open'),
        createColumn(5, '170px', false, 'text', '', 'ChargeCodeOccurrence', 'Charge Code Occurrence', 'open'),

        createColumn(6, '150px', true, 'numberFilter', 'Charge', 'charge', 'Charge', 'close'),
        
        // Additional Information Group
        createColumn(7, '215px', true, 'numberFilter', 'Additional Information', 'DistributionAmountDistributed', 'Original Distribution Amount', 'close'),
        createColumn(7, '250px', false, 'numberFilter', '', 'DistributionEventId', 'Distribution Event', 'open'),

        // Product Group
        createColumn(8, '180px', true, 'text', 'Product', 'VendorProductTypeName', 'Vendor Product', 'close'),
        createColumn(8, '148px', false, 'text', '', 'ServiceTypeName', 'Service Type', 'open'),
        createColumn(8, '117px', false, 'text', '', 'ServiceName', 'Service', 'open'),
        createColumn(8, '152px', false, 'text', '', 'ProductTypeName', 'Product Type', 'open'),
        createColumn(8, '121px', false, 'text', '', 'ProductName', 'Product', 'open'),
  
        // Charge Group
        createColumn(9, '187px', true, 'text','Location', 'LocationName', 'Location Name', 'close'),
        createColumn(9, '152px', false, 'text', '', 'Address1', 'Address One', 'open'),
        createColumn(9, '152px', false, 'text', '', 'Address2', 'Address Two', 'open'),
        createColumn(9, '152px', false, 'text', '', 'City', 'City', 'open'),
        createColumn(9, '152px', false, 'text', '', 'StateName', 'State/Provice/Region', 'open'),
        createColumn(9, '152px', false, 'text', '', 'PostalCode', 'Zip/Postal Code', 'open'),
        createColumn(9, '152px', false, 'text', '', 'LocationCode', 'Location Code', 'open'),
        createColumn(9, '152px', false, 'text', '', 'LocationCustomField1', 'Location Custom1', 'open'),
        createColumn(9, '152px', false, 'text', '', 'LocationCustomField2', 'Location Custom2', 'open'),
        createColumn(9, '152px', false, 'text', '', 'LocationCustomField3', 'Location Custom3', 'open'),
        createColumn(9, '152px', false, 'text', '', 'LocationCustomField4', 'Location Custom4', 'open'),
  
  
        // // Remove Group
        createColumn(10, '100px', true, '', 'Remove', 'Remove', ''),
     
      ];
  
      this.cols.forEach((col) => {
  
  
        if (col.isChildren) {
  
          let data: any = {
            "label": col.header,
            "isparent": true,
            "parentid": col.parent,
            "expanded": true,
            "children": []
          }
          const colParent = this.cols.filter(item => item.parent === col.parent);
          colParent.forEach(element => {
            data['children'].push(
              {
                "label": element.childHeader,
                "isparent": false,
                "parentid": element.parent
              }
            )
          });
          this.filesColumns.push(data)
  
          const closedColumns = this.cols.filter(item => item.parent === col.parent && item.columnGroupShow === 'close');
          col.colspan = closedColumns.length;
          col.Parentwidth = closedColumns.map((value) => parseInt(value.width.replace('px', ''))).reduce(
            (accumulator, currentValue) => accumulator + currentValue, 0) + 'px';
        }
      });
      this.selectedFiles = _.cloneDeep(this.filesColumns);
      this.colsshow = JSON.parse(JSON.stringify(this.cols));
  
      this.displaycols = this.cols.filter(col => col.columnGroupShow == 'close');
      this.commonColumnsFn();
    }
    isApiAlerdayCall: boolean = false;
    onScroll(event: Event) {
      const target = event.target as HTMLElement;
  
      // For vertical scroll
      const scrollTop = target.scrollTop;
      const scrollHeight = target.scrollHeight;
      const clientHeight = target.clientHeight;
      if ((scrollTop + clientHeight >= scrollHeight - 1) &&
        this.files.length < this.totalRecords && !this.isApiAlerdayCall
      ) {
        this.lastNode = this.files[this.files.length - 1];
        this.isApiAlerdayCall = true;
        this.pTableContain.first = this.pTableContain.first ? this.pTableContain.first + 100 : 101;
        this.loadNodes(this.pTableContain);
      }
    }
  
    openSidebar() {
      this.sidebarVisible = this.sidebarVisible ? false : true;
      this.selectAllNodes(this.filesColumns);
    }
  
    private selectAllNodes(nodes: TreeNode[]) {
  
  
      nodes.forEach((node: any) => {
        if (node.isparent && this.cols.some(e => e.header === node.label && e.displayCheckboxColumns === false) || !node.isparent && this.cols.some(e => e.childHeader === node.label && e.displayCheckboxColumns === false)) {
  
        } else {
          this.selectedFiles.push(node); // Select the node
          if (node.children) {
  
            this.selectAllNodes(node.children); // Recursively select children
          }
        }
  
      });
    }
  
    closeSidebar() {
      this.sidebarVisible = false;
    }
  
    onNodeSelect(event: any) {
      this.selectedNode = event.node;
    }
  
    dropdownOptionSelected() {
      navigator.clipboard.writeText(this.selectedNode).then(
        () => {
        },
        (err) => {
        }
      );
  
    }
  
    loadNodes(event?: { first: number; }, allOptionsClear = false, initCall = false, rightSelectedData = []) {
      let data = _.map(this.inventoryData, (e: any) => { return e.SBChargeDetailId });
  
      this.loading = true;
  
  
      // Initialize pagination if not set
      this.isApiAlerdayCall = true;
      this.pTableContain.first = this.pTableContain?.first || 1;
      if (allOptionsClear) {
        this.pTableContain.first = 1;
      }
      // Build the data request object with optional chaining
  
      // Ensure finalFilterdArr is initialized if it's not already
      if (!this.finalFilterdArr) {
        this.finalFilterdArr = {};
      }
  
      // Ensure advanceFilter is initialized as an array
      if (!Array.isArray(this.finalFilterdArr['advanceFilter'])) {
        this.finalFilterdArr['advanceFilter'] = [];
      }
  
      this.finalFilterdArr['advanceFilter'] = Array.from(
        new Map(this.finalFilterdArr['advanceFilter'].map((item: any) => [JSON.stringify(item), item])).values()
      );
  
      let passInv = {
        // VendorAccountId: this.inventoryData[0].VendorAccountId,
      //  VendorBillingAliasId: this.inventoryData[0].VendorBillingAliasId,
       vendorProductTypeId: this.inventoryData && this.inventoryData[0]?.VendorProductTypeId ? this.inventoryData[0]?.VendorProductTypeId : null,
        // vendorProductTypeId: this.addProductForm.value.vendorProductTypeId ? this.addProductForm.value.vendorProductTypeId : this.inventoryData[0].VendorProductTypeId,
        sbChargeDetailIds: this.headerCheckboxData ? null : data,
        InventorySelectionType: "MainAccountNumber",
        ...this.finalFilterdArr
      };
  
      if(this.headerCheckboxData) {
        passInv['from5ASelectAll'] = true;
        passInv['from5ASBInvoiceInventory'] = {...this.inventoryPayload};
      }
      this.finalAllDetailArr = passInv;
      this._unsubscribeGRid.next(null);
  
      // Clear files if needed
      if (allOptionsClear) this.originalFiles = this.files = [];
  
      this.sandBoxService.addVPChargeCodeGroups(this.sandBoxGridRowData.SBInvoiceId, passInv)
  
        .pipe(takeUntil(this._unsubscribeGRid))
        .subscribe(
          response => this.handleResponse(response, allOptionsClear, initCall, rightSelectedData),
          () => this.handleError()
        );
      // }
    }
  
    // Handle the response for loadNodes
    handleResponse(response: any, allOptionsClear: boolean, initCall: boolean, rightSelectedData: any) {
      this.loading = false;
      this.totalRecords = response.TotalCount;
  
      if (response?.Data?.$values?.length) {
        const resData = response.Data.$values.map((this.extractDataAndLeaf as any).bind(this));
        
        this.originalFiles = this.files = allOptionsClear ? resData : [...this.files, ...resData];

        this.selectedCCVRight = rightSelectedData;
        // const idMap = Object.fromEntries(this.selectedCCVRight.map(i => [i.SBChargeDetailId, { isChecked: i.isChecked, parent: i.parent }]));
        const idMap = this.selectedCCVRight.reduce((acc: { [x: string]: { isChecked: any; parent: any; }; }, i: { SBChargeDetailId: string | number; isChecked: any; parent: any; }) => {
          acc[i.SBChargeDetailId] = { isChecked: i.isChecked, parent: i.parent };
          return acc;
        }, {});

        this.originalFiles.forEach(i => Object.assign(i.data, idMap[i.data.SBChargeDetailId]));
        
        this.originalFiles.forEach((node: any) => {
          const d = node.data.RequiredChargeCode == true || node.data.isChecked ? true : false;
          d === true ? this.selectedDetail.push(node.data) : '';
          const s = node.data.PrimaryChargeCode == true || node.data.parent ? true : false;
          node['data']['isChecked'] = d;
          node['data']['parent'] = s;
        });
        let matched = _.map(this.originalFiles, (x: any) => x.VendorProductTypeId);
        let a = _.sortedUniq(matched);
      
  
        this.selectedRadio = _.find(this.originalFiles, (x: any) => x.data.PrimaryChargeCode == true)?.data;
  
        this.isApiAlerdayCall = false;
        this.files = this.originalFiles;
        
      } else {
        this.originalFiles = this.files = [];
        this.isApiAlerdayCall = false;

      }
  
    }
  
    // Extract data and leaf status
  
    extractDataAndLeaf = (item: { HasParent: any; }) => {
      return {
        data: this.extractData(item),
        leaf: !item.HasParent,
      };
    }
  
    // Handle error case
    handleError() {
      this.loading = false;
      this.originalFiles = this.files = [];
    }
  
  
    // Helper method to extract data fields
  
    extractData(item: any) {
      const fields = Object.keys(item);
  
      return fields.reduce((acc: any, field: any) => {
        acc[field] = item[field];
        return acc;
      }, {});
    }

  
    setColumnDefs() {
  
      let headerData: any = [];
      let ChildHeaderData: any = [];
      let i = 0;
      let childIndex = 0;
  
      _.map(this.cols, (x: any) => {
        if (x.isChildren) {
          i = i + 1;
  
          headerData.push({
            "Position": i,
            "Title": x.header
          });
  
        }
  
        childIndex = childIndex + 1;
  
        ChildHeaderData.push({
          "HeaderPosition": i,
          "Position": childIndex,
          "FieldName": x.field,
          "Title": x.childHeader,
          "isCurrency": x.field == 'TotalCurrentChargesDisplay' || x.field == 'PreviousBillBalanceDisplay' ? true : false
        });
      });
  
      this.exportAccounts = {
        ExportToExcelData: {
          HeaderData: headerData,
          ChildHeaderData: ChildHeaderData,
          fileName: "Accounts",
        },
        ExportToExcel: true,
        IsTotalNeed: true,
        ...this.finalFilterdArr,
        ...(this.sorting ? { OrderBy: this.sorting, SortOrder: this.sortingType } : {}),
      };
  
      this.exportAccountData.emit(this.exportAccounts);
    }
  
    isEditable() {
      // let isCustomerAdmin = this.locationService.isUserCustomerAdmin();
      // let isCompanyAdmin = this.locationService.isUserCompanyAdmin();
      // let isCompanyManager = this.locationService.isUserCompanyManager();
      // let isCompanyUser = this.locationService.isUserCompanyUser();
      // if ((isCustomerAdmin || isCompanyAdmin || isCompanyManager || isCompanyUser)) {
      //   return false;
      // }
      // return true;
  
    }
  
  
    onRowDoubleClick(data: any) {
      let datas = {
        data: data
      }
      this.rowCellDoubleClicked.emit(datas);
    }
  
    toggleColumn(index: number, columnGroupShow: string) {
      const closedColumns = this.colsshow.filter(item => item.parent === index && item.columnGroupShow === 'close');
  
      this.cols.forEach(item => {
        if (item.parent === index) {
          if (columnGroupShow === 'close') {
            item.isicon = 0;
          }
          else {
            item.isicon = 1;
          }
          const isHeaderClosed = closedColumns.some(closedItem => closedItem.childHeader === item.childHeader);
          if (!isHeaderClosed && item.displayCheckboxColumns) {
            item.columnGroupShow = columnGroupShow;
          }
        }
      });
  
      if (!this.cols.some(it => it.parent === index && it.columnGroupShow === 'close')) {
        let children = this.cols.filter(k => k.parent === index && k.displayCheckboxColumns);
        if (children) {
          children[0].columnGroupShow = 'close';
        }
      }
  
      this.commonColumnsFn();
    }
  
    commonColumnsFn() {
  
      this.cols.forEach((col) => {
        if (col.isChildren) {
  
          const closedColumns = this.cols.filter(item => item.parent === col.parent && item.columnGroupShow === 'close');
          col.colspan = closedColumns.length;
          if (this.cols.filter(item => item.parent === col.parent && item.displayCheckboxColumns).length === 1 ||
            this.colsshow.filter(item => item.parent === col.parent && item.columnGroupShow === 'open').length === 0) {
            col.isToggle = false;
          } else {
            col.isToggle = true;
          }
  
          if (this.cols.filter(item => item.parent === col.parent && item.displayCheckboxColumns).length === 0) {
            col.isParentVisible = false;
          } else {
            col.isParentVisible = true;
          }
  
          col.Parentwidth = closedColumns.map((value) => parseInt(value.width.replace('px', ''))).reduce(
            (accumulator, currentValue) => accumulator + currentValue, 0) + 'px';
        }
      });
      this.displaycols = this.cols.filter(col => col.columnGroupShow == 'close');
    }
    OrderBy(columnName: any) {
      if (!this.sorting || this.sorting === '') {
        this.sorting = columnName;
        this.cols.forEach((item) => {
          if (item.field === columnName) {
            item.sorting = 'asc';
            this.sortingType = item.sorting;
          } else {
            item.sorting = 'None';
          }
        });
      } else if (this.sorting === columnName) {
        this.sorting = columnName;
        this.cols.forEach((item) => {
          if (item.field === columnName) {
            if (item.sorting === 'desc') {
              this.sorting = '';
              item.sorting = 'None';
            } else {
              item.sorting = 'desc';
              this.sortingType = item.sorting;
            }
          } else {
            item.sorting = 'None';
          }
        });
      } else if (this.sorting != columnName) {
        this.sorting = columnName;
        this.cols.forEach((item) => {
          if (item.field === columnName) {
            item.sorting = 'asc';
            this.sortingType = item.sorting;
          } else {
            item.sorting = 'None';
          }
        });
      }
      this.loadNodes(this.pTableContain, true, true);
    }
  
    onFilter(event: any) {
      const filters = event.filters; // Get the filters object
      for (const field in filters) {
        if (filters.hasOwnProperty(field)) {
        }
      }
    }
    filterOutSideDebounced = _.debounce(this.filterOutSide.bind(this), 300);

    openContextMenu(event: MouseEvent, value: any) {
      event.preventDefault();
  
  
      this.fieldsName = value;
      this.contextMenuPosition.x = event.clientX;
      this.contextMenuPosition.y = event.clientY;
  
  
      let selectedOption1 = this.countries[0].name;
      let selectedOption2 = this.countries[0].name;
      let textboxValue1: any = '';
      let textboxValue2: any = '';
      let model = { option: 'AND' };
  
      if (this.fieldsName.type === 'text') {
        const index = this.filterArray.findIndex(
          (user) => user.filterKey === this.fieldsName.field
        );
        if (index !== -1) {
          textboxValue1 = this.filterArray[index].filterOptionValue1;
          textboxValue2 = this.filterArray[index].filterOptionValue2;
  
  
          selectedOption1 = this.filterArray[index].filterOptionType1;
          selectedOption2 = this.filterArray[index].filterOptionType2;
          model = { option: this.model.option };
        }
  
        this.countries = filterOptionsText();
  
      } else if (this.fieldsName.type === 'numberFilter') {
        const index = this.filterArrayNumber.findIndex(
          (user) => user.filterKey === this.fieldsName.field
        );
        if (index !== -1) {
          textboxValue1 = this.filterArrayNumber[index].filterOptionValue1;
          textboxValue2 = this.filterArrayNumber[index].filterOptionValue2;
  
          selectedOption1 = this.filterArrayNumber[index].filterOptionType1;
          selectedOption2 = this.filterArrayNumber[index].filterOptionType2;
  
          if (selectedOption1 === 'inrange') {
            this.textboxValue1_1 = this.filterArrayNumber[index].filterOptionValue1_2;
          }
  
          if (selectedOption2 === 'inrange') {
            this.textboxValue2_1 = this.filterArrayNumber[index].filterOptionValue2_2;
          }
          model = { option: this.model.option };
  
        }
  
        this.countries = filterOptionsNumber();
  
      } else {
        const index = this.filterArrayDate.findIndex(
          (user) => user.filterKey === this.fieldsName.field
        );
        if (index !== -1) {
  
          textboxValue1 = this.filterArrayDate[index].filterOptionValue1;
          textboxValue2 = this.filterArrayDate[index].filterOptionValue2;
  
          textboxValue1 = onChangeEndDate(textboxValue1, false);
          textboxValue2 = textboxValue2 ? onChangeEndDate(textboxValue2, false) : null;
  
          selectedOption1 = this.filterArrayDate[index].filterOptionType1;
          selectedOption2 = this.filterArrayDate[index].filterOptionType2;
  
          model = { option: this.model.option };
  
          if (selectedOption1 === 'inrange') {
            this.textboxValue1_1 = onChangeEndDate(this.filterArrayDate[index].filterOptionValue1_2, false);
          }
  
          if (selectedOption2 === 'inrange') {
            this.textboxValue2_1 = onChangeEndDate(this.filterArrayDate[index].filterOptionValue2_2, false);
          }
        }
  
        this.countries = filterOptionsDate();
      }
  
      this.textboxValue1 = textboxValue1;
      this.textboxValue2 = textboxValue2;
  
      this.selectedOption1 = selectedOption1;
      this.selectedOption2 = selectedOption2;
      this.model = model;
  
      this.displayModal = true;
      this.displayModal1 = textboxValue1 ? true : false;
  
      if ((event.clientX + 240) > window.innerWidth) {
        this.contextMenuPosition.x = event.clientX - 240;
      }
      event.stopPropagation();
    }
  
    onFilterChangedValue() {
  
      let txtVal1 = this.textboxValue1;
      let txtVal2 = this.textboxValue2;
      if (this.fieldsName.type === 'dateFilter') {
        txtVal1 = txtVal1 ? onChangeEndDate(this.textboxValue1, false) : null;
        txtVal2 = txtVal2 ? onChangeEndDate(this.textboxValue2, false) : null;
      }
  
      this.displayModal1 = false;
      let arrDate: any = {
        filterKey: this.fieldsName.field,
        filterOptionType1: this.selectedOption1,
        filterOptionValue1: txtVal1,
        filterOperationType: this.model.option,
        filterOptionType2: txtVal2 ? this.selectedOption2 : null,
        filterOptionValue2: txtVal2 ? txtVal2 : null,
  
      };
  
      if (arrDate.filterOptionType1 === 'inrange' && (this.textboxValue1_1 != null && this.textboxValue1_1 !== '')) {
        if (this.fieldsName.type === 'dateFilter') {
          arrDate['filterOptionValue1_2'] = onChangeEndDate(this.textboxValue1_1, false);
        } else {
          arrDate['filterOptionValue1_2'] = this.textboxValue1_1;
        }
      }
  
      if (arrDate.filterOptionType2 === 'inrange' && (this.textboxValue2_1 != null && this.textboxValue2_1 !== '')) {
        if (this.fieldsName.type === 'dateFilter') {
          arrDate['filterOptionValue2_2'] = onChangeEndDate(this.textboxValue2_1, false);
        } else {
          arrDate['filterOptionValue2_2'] = this.textboxValue2_1 ? this.textboxValue2_1 : null;
        }
      }
  
      if (this.fieldsName.type === 'text') {
        const index = this.filterArray.findIndex(
          (user) => user.filterKey === this.fieldsName.field
        );
  
        if (index !== -1) {
          this.filterArray[index] = arrDate;
        } else {
          this.filterArray.push(arrDate);
        }
      } else if (this.fieldsName.type === 'numberFilter') {
        const index = this.filterArrayNumber.findIndex(
          (user) => user.filterKey === this.fieldsName.field
        );
  
        if (index !== -1) {
          this.filterArrayNumber[index] = arrDate;
        } else {
          this.filterArrayNumber.push(arrDate);
        }
      } else {
        const index = this.filterArrayDate.findIndex(
          (user) => user.filterKey === this.fieldsName.field
        );
  
        if (index !== -1) {
          this.filterArrayDate[index] = arrDate;
        } else {
          this.filterArrayDate.push(arrDate);
        }
      }
  
      this.displayModal = false;
  
      let data: any = {};
  
      this.filterArray = this.filterArray.filter(f => f.filterOptionValue1 !== '')
      this.filterArrayDate = this.filterArrayDate.filter(f => f.filterOptionValue1 !== '')
      this.filterArrayNumber = this.filterArrayNumber.filter(f => f.filterOptionValue1 !== '')
      if (this.filterArray && this.filterArray.length > 0) {
        data['advanceFilter'] = this.filterArray;
      }
      if (this.filterArrayDate && this.filterArrayDate.length > 0) {
        data['advanceDateFilter'] = this.filterArrayDate;
      }
      if (this.filterArrayNumber && this.filterArrayNumber.length > 0) {
        data['advanceNumberFilter'] = this.filterArrayNumber;
      }
  
      this.finalFilterdArr = data;
  
      if (this.textboxValue1 !== null && this.textboxValue1 !== '') {
        this.cols.forEach((item) => {
          if (item.field === this.fieldsName.field) {
  
            if (this.textboxValue2 !== null && this.textboxValue2 !== '') {
  
              if (this.selectedOption2 === 'inrange') {
                item.valuesset = this.textboxValue1 + '-' + this.textboxValue1_1 + ' ' + this.model.option + ' ' + this.textboxValue2 + '-' + this.textboxValue2_1;
                item.isenable = true;
              } else if (this.selectedOption1 === 'inrange') {
                item.valuesset = this.textboxValue1 + '-' + this.textboxValue1_1 + ' ' + this.model.option + ' ' + this.textboxValue2;
                item.isenable = true;
              } else {
                item.valuesset = this.textboxValue1 + ' ' + this.model.option + ' ' + this.textboxValue2;
                item.isenable = true;
              }
  
            } else {
              if (this.selectedOption1 === 'inrange') {
                item.valuesset = this.textboxValue1 + '-' + this.textboxValue1_1;
                item.isenable = true;
              } else {
                item.valuesset = this.textboxValue1;
                item.isenable = false;
              }
  
            }
          }
        });
      }
      if ((this.textboxValue1 === null || this.textboxValue1 === '') && (this.textboxValue2 === null || this.textboxValue2 === '')) {
        this.cols.forEach((item) => {
          if (item.field === this.fieldsName.field) {
            item.valuesset = null;
            item.isenable = false;
          }
        });
      }
      this.loadNodes(this.pTableContain, true);
    }
  
    onFilterChangedFirst(value: any, col: any) {
      if (value == '') {
        this.displayModal1 = false;
      } else {
        this.displayModal1 = true;
      }
    }

  
    showContextMenu(event: MouseEvent, menu: any, event1: any) {
      event.preventDefault(); // Prevent default context menu from showing
      this.selectedNode = event1;
      this.contextMenuPosition.x = event.clientX;
      this.contextMenuPosition.y = event.clientY;
      menu.show(event); // Show the PrimeNG context menu
    }
  
    nodeSelect(e: { node: { isparent: any; parentid: number; label: any; }; }) {
      this.cols.forEach(item => {
        if (e.node.isparent && item.parent === e.node.parentid || !e.node.isparent && item.parent === e.node.parentid && item.childHeader === e.node.label) {
          let closedColumns = false;
          if (e.node.isparent && this.cols.some(it => it.parent === e.node.parentid && it.isChildren && it.isicon === 0)) {
            closedColumns = true;
          } else {
            closedColumns = this.colsshow.some(it => it.parent === e.node.parentid && it.columnGroupShow === 'close' && (!item.isChildren && it.childHeader === item.childHeader) || (item.isChildren && it.header === item.header));
          }
          if (!e.node.isparent && !item.isChildren && e.node.parentid === item.parent ) {
            closedColumns = true;
          }
          if (closedColumns) {
            item.columnGroupShow = 'close';
            item.isParentVisible = true;
          }
          item.displayCheckboxColumns = true;
        }
      });
  
      if (this.cols.some(it => it.parent === e.node.parentid && it.isChildren && it.isicon === 1)) {
        this.toggleColumn(e.node.parentid, 'open')
      }
      this.commonColumnsFn();
    }
  
    nodeUnselect(e: { node: { isparent: any; parentid: any; label: any; parent: { children: any; }; }; }) {
  
      this.cols.forEach(item => {
        if (e.node.isparent && item.parent === e.node.parentid) {
          item.columnGroupShow = 'open';
          item.displayCheckboxColumns = false;
        } else if (!e.node.isparent && item.parent === e.node.parentid && item.childHeader === e.node.label) {
  
          item.columnGroupShow = 'open';
          item.displayCheckboxColumns = false;
  
          if (!this.cols.some(it => it.parent === e.node.parentid && it.displayCheckboxColumns)) {
            item.isParentVisible = false;
          } else {
            item.isParentVisible = true;
            if (!this.cols.some(it => it.parent === e.node.parentid && it.columnGroupShow === 'close')) {
  
              for (let child of e.node.parent.children) {
                if (this.selectedFiles.includes(child)) {
                  let i = this.cols.findIndex(k => k.parent === e.node.parentid && k.childHeader === child.label)
                  if (i !== -1) {
                    this.cols[i].columnGroupShow = 'close';
                  }
                  return;
                }
              }
            }
          }
        }
      });
  
      this.commonColumnsFn();
    }
  
    handleColumnResize(event: any) {
      const resizedElement = event.element.cellIndex;
  
      if (event.element?.attributeStyleMap?.size == 1) {
        const parentId = parseInt(event.element?.dataset?.parentId || '0', 10);
        let i = this.displaycols.findIndex(k => k.isChildren && k.parent === parentId)
        let column = this.displaycols[i];
        column.width = (parseInt(column.width.replace('px', '')) + event.delta) + 'px';
  
        let column1 = this.displaycols[resizedElement];
        column1.width = (parseInt(column.width.replace('px', '')) - event.delta) + 'px';
        return;
      }
    }

  ngOnDestroy() {
    this._unsubscribeParent.next(null);
    this._unsubscribeParent.complete();
    this._unsubscribeFromOtherSBInvoice.next(null);
    this._unsubscribeFromOtherSBInvoice.complete();
    this._unsubscribeFromOtherSBInvoiceData.next(null);
    this._unsubscribeFromOtherSBInvoiceData.complete();
  }


  filterOutSide(event: any, column: any) {
    this.savedFilterEvent = event;
    this.savedFilterCol = column;
    setTimeout(() => {
      const activeFilters = this.displaycols.filter(col => !!col.valuesset?.toString().trim());
      // Always start from original source
      const sourceData = JSON.parse(JSON.stringify(this.files));
  
      if (activeFilters.length === 0) {
        this.files = this.originalFiles = sourceData;
        this.totalRecords = this.files.length;
        return;
      }
  
      const filtered = sourceData.filter((node: any) => {
        return activeFilters.every((col: any) => {
          let fieldValue = node.data?.[col.field];
          const filterValue = col.valuesset;
  
          if (col.type === 'numberFilter') {
            const fieldVal = (fieldValue ?? '').toString().replace(/[^0-9.\-]/g, '');
            const filterVal = (filterValue ?? '').toString().replace(/[^0-9.\-]/g, '');
            const cleanedFieldValue = parseFloat(fieldVal);
            const cleanedFilterValue = parseFloat(filterVal);
            if (isNaN(cleanedFieldValue) || isNaN(cleanedFilterValue)) return false;
            return cleanedFieldValue.toString().includes(cleanedFilterValue.toString());
          }
          return (fieldValue ?? '').toString().toLowerCase().includes(filterValue.toString().toLowerCase());
        });
      });
  
      this.originalFiles = filtered;
      this.totalRecords = this.files.length;
    }, 100);
  }
}
