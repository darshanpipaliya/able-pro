import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import _, { result } from 'lodash';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ChargeCodeAssignmentDialogComponent } from '../isd-by-billing-id/add-correction/charge-code-assignment-dialog/charge-code-assignment-dialog.component';
import moment from 'moment';
import { TreeNode } from 'primeng/api';
import { processNumberFilter, processTextFilter } from 'src/app/common/ag-grid-filter';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { checkIsValueExists } from 'src/app/services/helper';
import { InvoiceService } from 'src/app/services/invoice.service';
import { SandBoxService } from 'src/app/services/sandbox.service';
import { WirelineService } from 'src/app/services/wireline.service';
import { createColumn } from 'src/app/utils/column-utils';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { AgGridModule } from 'ag-grid-angular';
import { AgGridTableComponent } from 'src/app/common/ag-grid-table/ag-grid-table.component';

@Component({
  selector: 'app-cost-distribution-suba',
  templateUrl: './cost-distribution-suba.component.html',
  styleUrls: ['./cost-distribution-suba.component.scss'],
  imports: [SharedModule, PrimgModule, AgGridModule, AgGridTableComponent]
})
export class CostDistributionSubaComponent implements OnInit {
  @ViewChild('treeTable') treeTable!: any;
  @ViewChild('agGrid') agGrid: any;

  @Input() sandBoxGridRowData: any;
  @Input() clickedRecord: any;
  @Input() fromTab: any;
  @Input() overViewData: any;
  @Input() sbChargeDetailId: any;
  @Input() SBChargeDetailIdsForCC: any;
  public distributionDetail: any;
  isMultipleCreate: boolean = false;
  openDialogVar: boolean = false;
  SBChargeDetailIds: any;
  rowDataCCCOntext: any = [];
  chargeCodeContextSel: any;
  loading: boolean;
  isApiAlerdayCall: boolean = false;
  pTableContain = { first: 1 };
  finalFilterdArr: any;
  headerCheckboxData: any;
  finalAllDetailArr: any;
  originalFiles: any[];
  files: any[];
  totalRecords: number;
  cols: any[];
  selectedFiles!: any[];
  items: any[];
  contextMenuPosition: { x: number; y: number } = { x: 0, y: 0 };
  totalRowCount: number = 0;
  selected = 0;
  stopSpinner: boolean = false;
  rowDataInventory: any = [];
  gridApi: any;
  rowDataInven: any = [];
  filesColumns: any = [];

  @Input() recordPublishedOrCompleted: any;
  @Output() redirectTab: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('BillingIDInvoice') BillingIDInvoice!: TemplateRef<any>;
  public getDataPath: any = (data: any) => data.dataPath;
  private _unsubscribeLocation: Subject<any> = new Subject<any>();
  private _unsubscribeRule: Subject<any> = new Subject<any>();
  private _unsubscribeMethod: Subject<any> = new Subject<any>();
  private _unsubscribeOrigin: Subject<any> = new Subject<any>();
  private _unsubscribeSubacc: Subject<any> = new Subject<any>();
  private _unsubscribeBId: Subject<any> = new Subject<any>();
  private _unsubscribeCharge: Subject<any> = new Subject<any>();

  
  gridColumnApi: any;
  savedFilterEvent: any;
  savedFilterCol: any;

  public sideBar;
  public columnDefs1;
  sbInvoiceId: any;
  columnSubAccount: any;
  distributionForm: any;
  columnBill: any;
  columnBillInv: any;
  submitted = false;
  matchRecord: any = [];
  displayRule = undefined;
  responseData: any;
  inventoryIds: any = [];
  selectedInventoryData: any = [];
  tableData: any;
  columns: any = [];
  loadChangelog = false;
  displaycols: any[];

  sidebarVisible: boolean = false;

  gridOptions: any = {
    rowModelType: 'serverSide',
    serverSideInfiniteScroll: true,
    enableFiltering: true,
    headerHeight: 35,
    groupHeaderHeight: 37,
    floatingFiltersHeight: 35
  }

  public columnDefs;
  rowData: any = [];
  rowSelection = 'multiple';
  rowData2: any = [];
  rowDataBill: any = [];
  rowDataBillInv: any = [];
  defaultColDef = {
    editable: true,
    sortable: true,
    minWidth: 100,
    resizable: true,
    floatingFilter: true,
    flex: 1,
  };
  distributionLevels: any = [];
  distributionOrigin: any = [];
  distributionType: any = [];
  distributionMethod: any = [];
  distributionMethodAll: any = [];
  private _unsubscribeBillDetail: Subject<any> = new Subject<any>();
  private _unsubscribeInventory: Subject<any> = new Subject<any>();
  private _unsubscribeChangelog: Subject<any> = new Subject<any>();
  private _unsubscribeGRid: Subject<any> = new Subject<any>();

  additionalBillData: any;
  @ViewChild('DistributionLevel') DistributionLevel!: TemplateRef<any>;
  @ViewChild('DistributionType') DistributionType!: TemplateRef<any>;
  @ViewChild('DistributionOrigin') DistributionOrigin!: TemplateRef<any>;
  @ViewChild('DistributionMethod') DistributionMethod!: TemplateRef<any>;
  @ViewChild('SelectBillingTooltip') SelectBillingTooltip!: TemplateRef<any>;
  @ViewChild('bulkassignTooltip') bulkassignTooltip!: TemplateRef<any>;

  changelogData: any = [];
  colsshow: any[];

  public autoGroupColumnDef: any = {
    headerName: 'Billing Id',
    field: 'BillingId',
    cellRendererParams: {
      suppressCount: true,
    },
    filterParams: {
      treeList: true,
    },
    filter: 'agTextColumnFilter',
    minWidth: 280,
    resizable: true,
    checkboxSelection: true,
    editable: false
  };

  public saveButtonLoadder: Boolean = false;
  public distributionMethodTypeBillingAccountHierarchyIds: any;
  distributionMethodTypeInventoryIds: any = [];
  public disType: any;
  public matchMethod: any;
  isDisableSave = false;

  constructor(
    public dialog: MatDialog, private invoiceService: InvoiceService, private wirelineService: WirelineService,
    private _formBuilder: FormBuilder, private sandboxService: SandBoxService) {
    this.sideBar = {
      toolPanels: ['columns', 'filters']
    };

    this.columnDefs1 = [
      {
        headerName: 'Status',
        children: [
          {
            field: 'Status',
            headerName: 'Status',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 115,
            minWidth: 115,
            flex: 0
          },
        ]
      },
      {
        headerName: 'Service',
        children: [
          {
            field: 'BillingId',
            headerName: 'Billing ID',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 130,
            width: 100,
            flex: 0,
            cellClass: "ag-cell-add-btn",
            cellRenderer: function (params: any) {
              return params.data.AccrossInventory == true ? params.data.BillingId + '<div><button class="btn btn-primary grid-cell-btn" style="padding: 2px 8px; font-size: 10px; position: relative; top: -1px; margin-left: 5px;">Added</button></div>' : params.data.BillingId
            }
          },
          {
            field: 'MainAccountNumber',
            headerName: 'Main Account Number',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 210,
            minWidth: 210,
            flex: 0
          },
          {
            field: 'SubAccountNumber',
            headerName: 'Sub Account Number',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 205,
            minWidth: 205,
            flex: 0
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
            editable: false,
            filter: 'agTextColumnFilter',
            width: 195,
            minWidth: 195,
            flex: 0
          },
          {
            field: 'ChargeCode',
            headerName: 'Charge Code',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 150,
            flex: 0
          },
          {
            field: 'Quantity',
            headerName: 'Quantity',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'open',
            editable: false,
            width: 150,
            minWidth: 150
          },
          {
            field: 'ChargeCodeType',
            headerName: 'Charge Code Type',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 175,
            flex: 0
          },
          {
            field: 'ChargeType',
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
            headerName: 'Charge Code Occurrence',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 225,
            minWidth: 225,
            flex: 0
          },

          {
            field: 'UnitOfMesurement',
            headerName: 'Unit of Measure',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 170,
            minWidth: 170,
            flex: 0
          }
        ],
      },
      {
        headerName: 'Charges',
        children: [
          {
            field: 'Charges',
            headerName: 'Charges',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 120,
            minWidth: 120,
            cellStyle: { display: 'flex !important', 'justify-content': 'end', 'padding-right': '44px' },
            flex: 0,
            valueFormatter(params: any) {
              if (params?.data?.Charges) {
                var sansDec = params?.data?.Charges.toFixed(2);
                return params.data.CurrencySymbol + `${sansDec.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
              }
              return '';
            }
          },
          {
            field: 'ChargeLocationType',
            headerName: 'Charge Location',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 170,
            minWidth: 170,
            flex: 0
          },
          {
            field: 'DistributionRuleName',
            headerName: 'Distribution Rule',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 170,
            flex: 0
          },
          {
            field: 'Prorated',
            headerName: 'Prorated',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 130,
            minWidth: 100,
            flex: 0,
            valueFormatter: (params: any) => params.data.Prorated == true ? 'Yes' : 'No',
          }
        ],

      },
      {
        headerName: 'Charge Descriptions',
        children: [
          {
            field: 'ChargeDescription1',
            headerName: 'Charge Description 1',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 270,
            flex: 0
          },
          {
            field: 'ChargeDescription2',
            headerName: 'Charge Description 2',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 200,
            minWidth: 200,
            flex: 0
          },
          {
            field: 'ChargeDescription3',
            headerName: 'Charge Description 3',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 200,
            minWidth: 200,
            flex: 0
          },
          {
            field: 'ChargeDescription4',
            headerName: 'Charge Description 4',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 200,
            minWidth: 200,
            flex: 0
          },
          {
            field: 'ChargeDescription5',
            headerName: 'Charge Description 5',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 200,
            minWidth: 200,
            flex: 0
          },
          {
            field: 'ChargeDescription6',
            headerName: 'Charge Description 6',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 200,
            minWidth: 200,
            flex: 0
          },
          {
            field: 'ChargeDescription7',
            headerName: 'Charge Description 7',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 200,
            minWidth: 200,
            flex: 0
          },
          {
            field: 'ChargeDescription8',
            headerName: 'Charge Description 8',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 200,
            minWidth: 200,
            flex: 0
          },
          {
            field: 'ChargeDescription9',
            headerName: 'Charge Description 9',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 200,
            minWidth: 200,
            flex: 0
          },
          {
            field: 'ChargeDescription10',
            headerName: 'Charge Description 10',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 205,
            minWidth: 205,
            flex: 0
          }
        ],
      }
    ];

    this.columnDefs = [
      {
        headerName: 'Accounts',
        children: [
          {
            field: 'MainAccountNumber',
            headerName: 'Main Billing Account Number',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 250
          },
          {
            field: 'SubAccountNumber',
            headerName: 'Sub Account Number',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 201
          },
          {
            field: 'PayableAccountNumber',
            headerName: 'Payable Account Number',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 230
          }
        ],
      },
      {
        headerName: 'Charge',
        children: [
          {
            field: 'Charges',
            headerName: 'Charge',
            columnGroupShow: 'close',
            filter: 'agNumberColumnFilter',
            editable: false,
            minWidth: 130,
            valueFormatter: (params: any)  => this.currencyFormatter(params.data?.Charges, this.overViewData.CurrencySymbol),
            cellStyle: { display: 'flex !important', 'justify-content': 'end', 'padding-right': '50px' },
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
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 190
          },
          {
            field: 'ChargeCode',
            headerName: 'Charge Code',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 160
          },
          {
            field: 'ChargeCodeType',
            headerName: 'Charge Code Type',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 185
          },
          {
            field: 'ChargeType',
            headerName: 'Charge Type',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 150
          },
          {
            field: 'ChargeLocationType',
            headerName: 'Charge Location',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 175
          }
        ]
      }
    ];

    this.columnSubAccount = [
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
            field: 'SubAccountNumber',
            headerName: 'Sub Account Number',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 201
          },
          {
            field: 'MainAccountNumber',
            headerName: 'Main Account Number',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 250
          },
          {
            field: 'PayableAccountNumber',
            headerName: 'Payable Account Number',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 230
          },
          {
            field: 'BillingIdCount',
            headerName: 'Count of Billing IDs',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 230
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
            minWidth: 130
          }
        ]
      }
    ];

    this.columnBill = [
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
            field: 'BillingID',
            headerName: 'Billing ID',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 128
          }
        ],
      },
      {
        headerName: 'Accounts',
        children: [
          {
            field: 'MainBillingAccountNumber',
            headerName: 'Main Billing Account Number',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 227,
          }
        ]
      },
      {
        headerName: 'Charge',
        children: [
          {
            field: 'Charge',
            headerName: 'Charge',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 94,
            cellStyle: { display: 'flex !important', 'justify-content': 'end', 'padding-right': '50px' },
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
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 189
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
            minWidth: 162
          }
        ]
      }
    ];

    this.columnBillInv = [
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
            headerName: 'Billing ID',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 128,
            sortingField: 'ServiceNumber'
          }
        ],
      },
      {
        headerName: 'Accounts',
        children: [
          {
            field: 'MainAccountNumber',
            headerName: 'Main Billing Account Number',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 227,
            sortingField: 'MainAccountNumber'
          },
          {
            field: 'SubAccountNumber',
            headerName: 'Sub Account Number',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 179,
            sortingField: 'SubAccountNumber'
          },
          {
            field: 'PayableAccountNumber',
            headerName: 'Payable Account Number',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 202,
            sortingField: 'PayableAccountNumber'
          }
        ]
      },
      {
        headerName: 'Charge',
        children: [
          {
            field: 'TotalCurrentCharges',
            headerName: 'Charge',
            columnGroupShow: 'close',
            filter: 'agNumberColumnFilter',
            editable: false,
            minWidth: 94,
            sortingField: 'TotalCurrentCharges',
            cellStyle: { display: 'flex !important', 'justify-content': 'end', 'padding-right': '50px' },
            valueFormatter: (params: any) => this.currencyFormatter(params.data?.TotalCurrentCharges, params.data?.CurrencySymbol),
          }
        ]
      },
      {
        headerName: 'Vendor Product',
        children: [
          {
            field: 'VendorProductTypeName',
            headerName: 'Vendor Product',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 150,
            sortingField: 'VendorProductName'
          },
          {
            field: 'Service',
            headerName: 'Service',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 95,
            sortingField: 'ServiceName'
          },
          {
            field: 'ServiceType',
            headerName: 'Service Type',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 126,
            sortingField: 'ServiceType'
          },
          {
            field: 'Product',
            headerName: 'Product',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 120,
            sortingField: 'ProductName'
          },
          {
            field: 'ProductType',
            headerName: 'Product Type',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 130,
            sortingField: 'ProductType'
          }
        ]
      },
      {
        headerName: 'Status',
        children: [
          {
            field: 'InventoryStatusDisplayText',
            headerName: 'Status',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 90,
            sortingField: 'InventoryStatusDisplayText'
          }
        ]
      }
    ];

    this.columns = [
      { header: 'Rule Status' },
      { header: 'Distribution Level' },
      { header: 'Distribution Type' },
      { header: 'Distribution Origin' },
      { header: 'Distribution Method' },
      { header: 'Rule Option' },
      { header: 'Main Account Number' },
      { header: 'Sub Account Number' },
      { header: 'Billing ID' },
      { header: 'Time & Date' },
      { header: 'Who' }

    ];

  }

  ngOnInit(): void {
    this.formSet();
    this.setCols();

    this.distributionAccountLocationTypes();
    this.distributionRuleTypes();
    this.distributionMethodTypes();

    this.distributionRulesOptions();
    this.getDisType(true);
    if(this.clickedRecord.length == 1) {
      this.chargeCodeContextSel = this.clickedRecord[0];
      this.getAdditionalDetail();
    }
    if(this.clickedRecord.length == 1 && this.clickedRecord[0].DistributionRuleId !== null) {
      this.getDistributionChangelog();
    }
    this.chargecodeContextNew();
    if (this.fromTab == true &&  this.clickedRecord.length == 1 && (this.clickedRecord[0].ChargeCodeType == 'Product' || this.clickedRecord[0].ChargeCodeType == 'Feature' || this.clickedRecord[0].ChargeCodeType == 'Usage' || this.clickedRecord[0].ChargeCodeType == 'Equipment')) {
      this.distributionForm.disable();
      this.isDisableSave = true;
    }
    if(this.clickedRecord[0]?.SpecificDistributionNeeded){
      this.loadNodes(this.pTableContain, true);
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
  
  setCols() {

      this.cols = [
        createColumn(1, '50px', true, '', '', 'checkbox', ''),
 
         createColumn(2, '150px', true, 'text', 'Inventory', 'BillingId', 'Billing ID'),
         createColumn(2, '200px', false, 'text', '', 'MainAccountNumber', 'Main Account Number'),
         createColumn(2, '200px', false, 'text', '', 'SubAccountNumber', 'Sub Account Number'),
         createColumn(2, '200px', false, 'text', '', 'PayableAccountNumber', 'Payable Account Number', 'open'),
       
         createColumn(3, '180px', true, 'text', 'Product', 'VendorProduct', 'Vendor Product', 'close'),
         createColumn(3, '148px', false, 'text', '', 'ServiceType', 'Service Type', 'open'),
         createColumn(3, '117px', false, 'text', '', 'ServiceName', 'Service', 'open'),
         createColumn(3, '152px', false, 'text', '', 'ProductType', 'Product Type', 'open'),
         createColumn(3, '121px', false, 'text', '', 'ProductName', 'Product', 'open'),
         createColumn(3, '121px', false, 'text', '', 'IndustryName', 'Industry', 'open'),
   
         createColumn(4, '189px', true, 'text', 'Charge Code', 'ChargeCodeName', 'Charge Code Name', 'close'),
         createColumn(4, '150px', false, 'text', '', 'ChargeCode', 'Charge Code', 'open'),
         createColumn(4, '182px', false, 'text', '', 'ChargeCodeType', 'Charge Code Type', 'open'),
         createColumn(4, '182px', false, 'text', '', 'ChargeType', 'Charge Type', 'open'),
         createColumn(4, '170px', false, 'text', '', 'ChargeCodeOccurrence', 'Charge Code Occurrence', 'open'),
 
         createColumn(5, '170px', true, 'numberFilter', 'Cost', 'ProductChargeTotalDisplay', 'Product Total', 'close'),
         createColumn(5, '170px', false, 'numberFilter', '', 'ChargesDisplay', 'Charge', 'open'),

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
  nodeSelect(e: any) {
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
  nodeUnselect(e: any) {

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
  currencyFormatter(currency: any, sign: any) {
    if (currency !== null && currency !== undefined) {
      const formatted = currency.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      return sign + formatted;
    }
  }
  onSelectionChanged(event: any) {
    const selectedInventory:any = [];
    event.forEach((e: any) => {
      selectedInventory.push(e.BillingAccountHierarchyId)
    });
    this.distributionMethodTypeBillingAccountHierarchyIds = selectedInventory;
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
  clickMainTab(e: any) {

    this.selected = e;
    if (this.recordPublishedOrCompleted) {
      let arrayTemp = [...this.distributionMethodTypeInventoryIds];
      this.rowData.forEach((node: any) => {
        const d = arrayTemp.some(r => r === node?.InventoryId);
        node['isChecked'] = d;
        if (d) {
          const index = arrayTemp.findIndex(item => item === node.InventoryId);
          if (index !== -1) {
            arrayTemp.splice(index, 1);
          }
        }
      });
      return;
    }

    const interval = setInterval(() => {
      if (this.stopSpinner) {
        if (this.selected == 1 && (_.cloneDeep(this.distributionMethodTypeInventoryIds?.length) > 0)) {
          if (this.rowDataInventory.length > 0) {
            let errorData: any = {
              messgeType: "error",
              title: "Attention",
              titleClass: "text-c-blue",
              icon: "fas fa-exclamation-circle",
              iconClass: "text-c-blue f-70",
              message: 'Would you like to save your selection and continue selecting other Billing IDs?',
              okBtnName: 'Yes, Continue',
              closeBtnName: 'No, Discard Changes'
            }
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
            dialogRef.afterClosed().subscribe((result) => {
              if (result == false) {
                this.distributionMethodTypeInventoryIds = [];
                this.rowData.forEach((node: any) => {
                  node['isChecked'] = false;
                });
              } else {
                let arrayTemp = [...this.distributionMethodTypeInventoryIds];
                this.rowData.forEach((node: any) => {
                  const d = arrayTemp.some(r => r === node.InventoryId);
                  node['isChecked'] = d;
                  if (d) {
                    const index = arrayTemp.findIndex(item => item === node.InventoryId);
                    if (index !== -1) {
                      arrayTemp.splice(index, 1);
                    }
                  }
                });
              }
            })
          } else {
            let arrayTemp = [...this.distributionMethodTypeInventoryIds];
            this.rowData.forEach((node: any) => {
              const d = arrayTemp.some(r => r === node.InventoryId);
              node['isChecked'] = d;
              if (d) {
                const index = arrayTemp.findIndex(item => item === node.InventoryId);
                if (index !== -1) {
                  arrayTemp.splice(index, 1);
                }
              }
            });
          }
        } else if (this.selected == 0 && (_.cloneDeep(this.inventoryIds?.length) > 0)) {

          if (this.rowData.length > 0) {
            let errorData: any = {
              messgeType: "error",
              title: "Attention",
              titleClass: "text-c-blue",
              icon: "fas fa-exclamation-circle",
              iconClass: "text-c-blue f-70",
              message: 'Would you like to save your selection and continue selecting other Billing IDs?',
              okBtnName: 'Yes, Continue',
              closeBtnName: 'No, Discard Changes'
            }
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
            dialogRef.afterClosed().subscribe((result) => {
              if (result == false) {
                this.inventoryIds = [];
                this.rowDataInventory.forEach((node: any) => {
                  node['isChecked'] = false;
                });
              } else {
                let inventoryAr = [...this.inventoryIds];

                this.rowDataInventory.forEach((node: any) => {
                  const d = inventoryAr.some(r => r === node.InventoryId);
                  node['isChecked'] = d;
                  if (d) {
                    const index = inventoryAr.findIndex(item => item === node.InventoryId);
                    if (index !== -1) {
                      inventoryAr.splice(index, 1);
                    }
                  }
                });
              }
            })
          } else {
            let inventoryAr = [...this.inventoryIds];
            this.rowDataInventory.forEach((node: any) => {
              const d = inventoryAr.some(r => r === (this.fromTab == 'true' ? node.VendorProductInventoryId : node.InventoryId));
              node['isChecked'] = d;
              if (d) {
                const index = inventoryAr.findIndex(item => item === node.InventoryId);
                if (index !== -1) {
                  inventoryAr.splice(index, 1);
                }
              }
            });
          }
        }
        clearInterval(interval);
      }
    }, 1000);

  }

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
        const filterArray: any = [];
        const filterArrayNumber: any = [];

        for (var key in paramsRequest.filterModel) {
          let data = paramsRequest.filterModel[key];
          let arr;
          let arrNumber;

          if (key === 'TotalCurrentCharges') {
            arrNumber = processNumberFilter(key, data);
            filterArrayNumber.push(arrNumber);
          } else {
            arr = processTextFilter(key, data);
            filterArray.push(arr);
          }
        }

        // filterArrayNumber.push(
        //   {
        //     "filterKey": "MainBillingAccountHierarchyId",
        //     "filterOptionType1": "equals",
        //     "filterOptionValue1": this.sandBoxGridRowData.MainBillingAccountHierarchyId,
        //     "filterOptionValue1_2": null,
        //     "filterOperationType": "AND",
        //     "filterOptionType2": null,
        //     "filterOptionValue2": null,
        //     "filterOptionValue2_2": null
        //   }
        // )

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
        data['isFromChargeDistributionStep6'] = this.fromTab == 'true' ? true : false;
        data['sbInvoiceId'] = this.sandBoxGridRowData.SBInvoiceId;
        data['isForDistrubation'] = true
        data['isTotalNeed'] = true;
        data['vendorAccountId'] = this.sandBoxGridRowData.VendorAccountId;
        data['customerAccountId'] = this.additionalBillData.CustomerAccountId;

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
        this._unsubscribeInventory.next(null);
        this.stopSpinner = false;
        this.wirelineService.getInventoryData(data)
          .pipe(takeUntil(this._unsubscribeInventory))
          .subscribe(
            async (data: any) => {
              this.stopSpinner = true;
              this.rowDataInventory = data.Data.$values;

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
                this.gridApi?.showNoRowsOverlay();
              }

              if (this.inventoryIds.length > 0) {
                this.selectMatchingNodes();
              }
            },
            (error) => {
              this.stopSpinner = true;
              params.success({
                rowData: [],
                rowCount: 0
              });
              this.gridApi?.showNoRowsOverlay();
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
  loadNodes(event?: any, allOptionsClear = false, initCall = false, rightSelectedData = []) {


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
      inventoryId: this.clickedRecord[0].InventoryId,
      chargeCodeId: this.clickedRecord[0].ChargeCodeId,
    };

  
    this.finalAllDetailArr = passInv;
    this._unsubscribeGRid.next(null);

    // Clear files if needed
    if (allOptionsClear) this.originalFiles = this.files = [];

    this.sandboxService.specificDistributionDetail(this.sandBoxGridRowData.SBInvoiceId, passInv)

      .pipe(takeUntil(this._unsubscribeGRid))
      .subscribe(
        response => this.handleResponse(response, allOptionsClear),
        () => this.handleError()
      );
    // }
  }

  handleResponse(response: any, allOptionsClear: any) {
    this.loading = false;
    this.totalRecords = response.TotalCount;

    if (response?.Data?.$values?.length) {
      const resData = response.Data.$values.map(this.extractDataAndLeaf.bind(this));
      this.originalFiles =  this.files = allOptionsClear ? resData : [...this.files, ...resData];
      this.isApiAlerdayCall = false;

    } else {
      this.files = [];
      this.isApiAlerdayCall = false;
    }

  }

  extractDataAndLeaf = (item: any) => {
    return {
      data: this.extractData(item),
      leaf: !item.HasParent,
    };
  }
  extractData(item: any) {
    const fields = Object.keys(item);

    return fields.reduce((acc: any, field: any) => {
      acc[field] = item[field];
      return acc;
    }, {});
  }

 // Handle error case
 handleError() {
  this.loading = false;
  this.files = [];
}

  selectMatchingNodes() {
    if (!this.gridApi) {
      return;
    }
    this.gridApi.api.forEachNode((node: any) => {
      const match: any = this.inventoryIds.some((x: any) =>
        parseInt(x.inventoryId) === parseInt(node.data.InventoryId) &&
        parseInt(x.vendorProductInventoryId) === parseInt(node.data.VendorProductInventoryId)
      );

      node.setSelected(match);
    });
  }

  getDistributionChangelog() {
    this.loadChangelog = true;
    this._unsubscribeChangelog.next(null);
    this.sandboxService.getDistributionChangeLog(this.chargeCodeContextSel?.SBChargeDetailId).pipe(takeUntil(this._unsubscribeChangelog)).subscribe((data: any) => {
      this.loadChangelog = false;
      if (data.Success) {
        this.tableData = data.Data.$values;
      } else {
        this.tableData = [];
      }
    });
  }

  getDisType(fromTS = false) {
    if (!fromTS)
      this.displayRule = undefined;

    if (this.distributionMethodTypeInventoryIds?.length > 0 && this.rowData) {
      this.rowData.forEach((node: any) => {
        const d = this.distributionMethodTypeInventoryIds.some((r: any) => r === node.InventoryId);
        node['isChecked'] = d;
      })
    }
    this.selected = 0;
    setTimeout(() => {
      if (this.f.distributionRulesTypeId.value === "Billing ID Totals") {
        this.disType = '% of Billing IDs Total'
      } else if (this.f.distributionRulesTypeId.value === "Billing ID Count") {
        this.disType = 'Across All Billing IDs'
      } else {
        this.disType = '% of Vendor Product'
      }

    }, 500);
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(this.DistributionLevel, {
      width: '900px',
      data: {
        colseButton: true,
      }
    });
  }

  openDialogSelectBilling(): void {
    const dialogRef = this.dialog.open(this.SelectBillingTooltip, {
      width: '900px',
      data: {
        colseButton: true,
      }
    });
  }

  openDisTypeTooltip(): void {
    this.dialog.open(this.DistributionType, {
      width: '900px',
      data: {
        colseButton: true,
      }
    });
  }


  openDisOriginTooltip(): void {
    this.dialog.open(this.DistributionOrigin, {
      width: '900px',
      data: {
        colseButton: true,
      }
    });
  }

  openDisMethodTooltip(): void {
    this.dialog.open(this.DistributionMethod, {
      width: '900px',
      data: {
        colseButton: true,
      }
    });
  }

  onSelectionChangedBillingid(event: any) {
    const selectedInventory: any = [];
    event.forEach((e: any) => {
      selectedInventory.push(e.InventoryId)
    });
    this.distributionMethodTypeInventoryIds = selectedInventory;

    if (this.f.distributionRulesTypeId.value == 'Billing ID Count' || this.f.distributionRulesTypeId.value == 'Vendor Product Totals') {
      this.distributionMethodTypeInventoryIds = _.sortedUniq(selectedInventory);
      this.rowData.forEach((node: any) => {
        const d = event.some((r: any) => r === node.InventoryId);
        node['isChecked'] = d;
      });
    }
  }

  onSelectionChanged2(event: any) {
    this.selectedInventoryData = event;
    this.inventoryIds = [];
    event.forEach((e: any) => {
      this.inventoryIds.push({ inventoryId: e.InventoryId, vendorProductInventoryId: e.VendorProductInventoryId })
    });
  }

  distributionRulesOptions() {
    this._unsubscribeOrigin.next(null);
    this.sandboxService.distributionOriginLevelType().pipe(takeUntil(this._unsubscribeOrigin)).subscribe((res: any) => {
      this.distributionOrigin = res.Data.$values;
      // this.changeType('Vendor Global');
    });
  }

  ngOnDestroy() {
    this._unsubscribeLocation.next(null);
    this._unsubscribeLocation.complete();
    this._unsubscribeRule.next(null);
    this._unsubscribeRule.complete();
    this._unsubscribeMethod.next(null);
    this._unsubscribeMethod.complete();
    this._unsubscribeOrigin.next(null);
    this._unsubscribeOrigin.complete();
    this._unsubscribeBillDetail.next(null);
    this._unsubscribeBillDetail.complete();
    this._unsubscribeSubacc.next(null);
    this._unsubscribeSubacc.complete();
  }
  getAdditionalDetail(event?: any) {

    if (this.chargeCodeContextSel.SBChargeDetailId)
      this._unsubscribeBillDetail.next(null);
    this.sandboxService.ChargeCodeContextDetails(this.chargeCodeContextSel.SBChargeDetailId).pipe(takeUntil(this._unsubscribeBillDetail))
      .subscribe((data: any) => {
        if (data.Success) {
          this.additionalBillData = data.Data;
          this.additionalBillData['Charges'] = data.Data.Charges ? parseFloat(data.Data.Charges).toFixed(2) : '0.00';
          this.additionalBillData['Charges'] = data?.Data?.Charges.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

          // this.changeType('Vendor Global');

          if (this.chargeCodeContextSel.DistributionRuleId !== null) {
            this.invoiceService.distributionDetail(this.chargeCodeContextSel.DistributionRuleId).subscribe((res: any) => {

              this.distributionDetail = res.Data;
              // if (this.distributionDetail.DistributionRule.DistributionRulesXOptions.DistributionAccountLocationType.Type !== 'Vendor Global') {

              this.displayRule = this.distributionDetail.DistributionRule.Name;
              this.setValueInFormControl('distributionAccountLocationTypeId', this.distributionDetail.DistributionRule.DistributionRulesXOptions.DistributionAccountLocationType.Type);
              this.changeType(this.distributionDetail.DistributionRule.DistributionRulesXOptions.DistributionAccountLocationType.Type, true);
              this.setValueInFormControl('distributionOriginLevelTypeId', this.distributionDetail.DistributionRule.DistributionRulesXOptions.DistributionOriginLevelType.Type);
              this.changeOrigin({ value: this.distributionDetail.DistributionRule.DistributionRulesXOptions.DistributionOriginLevelType.Type }, true);
              this.setValueInFormControl('distributionMethodTypeId', this.distributionDetail.DistributionRule.DistributionRulesXOptions.DistributionMethodType.Type);
              this.setValueInFormControl('ruleOption', this.distributionDetail.DistributionRule.MonthlyRule == true ? 'monthly' : 'one-time');
              this.setValueInFormControl('ruleStatus', this.distributionDetail.DistributionRule.Status);
              this.changeMethod({ value: this.distributionDetail.DistributionRule.DistributionRulesXOptions.DistributionMethodType.Type }, true);
              this.setValueInFormControl('distributionRulesTypeId', this.distributionDetail.DistributionRule.DistributionRulesType.Type);


              this.getDisType(true);
              // }

            });
          } else {
            this.changeType('Vendor Global');
          }
        }
      });
  }
  setValueInFormControl(key: any, value: any) {
    this.f[key].setValue(value);
  }

  onSelectionChangedCCContext(event: any) {
    if ((event[0] && event[0].BillingId == '') || (event[0] && event[0].BillingId == null)) {
      this.openDialogVar = true;
      // this.showSaveButton = false;
    } else {
      this.openDialogVar = false;
      // this.showSaveButton = true;
    }
    // this.chargeCodeForm.reset();

    // if (event[0].ChargeCodeId !== null) {
    //   this.parentChargeCodeData['chargeCodeId'] = event[0].ChargeCodeId;
    //   this.chargeCodeId = event[0].ChargeCodeId;
    // }

    // this.VendorBillingAliasId = event && event[0] ? event[0].VendorBillingAliasId : 0;
    // this.parentChargeCodeData['vendorBillingAliasId'] = this.VendorBillingAliasId;
    this.chargeCodeContextSel = event[0];
    //this.getParentChargeCode();
    this.getAdditionalDetail(event[0]);
    // this.disabledAssignmentData = event && event.length == 0 ? true : false;
    // this.parentChargeRowData = event && event.length == 0 ? [] : ''
    // this.gridApi?.setFilterModel(null);
  }

  updateRowCount() {
    if (this.agGrid?.gridApi) {
      this.totalRowCount = this.agGrid.gridApi.getModel().getRowCount();
    } else {
      console.warn('Grid API not yet available');
    }
  }

  chargecodeContextNew() {

    if (!checkIsValueExists(this.sandBoxGridRowData.SBInvoiceId)) {
      return;
    }

    this.isMultipleCreate = this.clickedRecord.length > 1;
    let data
    if (this.isMultipleCreate) {
      data = {
        'SBChargeDetailIdsForCC': this.SBChargeDetailIdsForCC,
        'ForDistributionRule': true
      };
    } else if (this.clickedRecord[0].ChargeCodeUnformatted && this.clickedRecord[0].SBChargeDetailId == null) {
      data = {
        'chargeCodeUnformatted': this.clickedRecord[0]?.ChargeCodeUnformatted
      };
    }

    if (data) {
      this._unsubscribeCharge.next(null);
      this.sandboxService.ChargeCodeContextNew(this.sandBoxGridRowData.SBInvoiceId, data).pipe(takeUntil(this._unsubscribeCharge))
        .subscribe((data: any) => {

          if (data.Success) {
            this.rowDataCCCOntext = data.Data.$values;
            if (this.rowDataCCCOntext[0]?.BillingId == '' || this.rowDataCCCOntext[0]?.BillingId == null) {
              this.openDialogVar = true;
              // this.showSaveButton = false;
            } else {
              this.openDialogVar = false;
              // this.showSaveButton = true;
            }
            this.SBChargeDetailIds = _.map(this.rowDataCCCOntext, (x: any) => x.SBChargeDetailId)
            // let statusList = _.map(this.rowDataCCCOntext, (x: any) => x.Status);
            // this.isDisableSave = statusList.every((x) => x == 'Assigned') ? true : false;
            if (this.rowDataCCCOntext.length > 0)
              this.rowDataCCCOntext[0]['isChecked'] = true;

            setTimeout(() => {
              this.updateRowCount(); // Give ag-grid a moment to render
            }, 0);
          }
        });
    }
  }

  changeType(value: any, fromTS = false) {
    if (!fromTS)
      this.displayRule = undefined;

    // If SpecificDistributionNeeded is true, force Customer Specific
    if (this.clickedRecord?.[0]?.SpecificDistributionNeeded && value !== 'Customer Specific') {
      value = 'Customer Specific';
      this.distributionForm.patchValue({
        distributionAccountLocationTypeId: value
      }, { emitEvent: false });
    }

    this.matchRecord = [];
    this.setValueInFormControl('distributionOriginLevelTypeId', '')
    this.setValueInFormControl('distributionMethodTypeId', '')
    if (value === "Vendor Global" || value === "Customer Global") {
      this.matchRecord = this.getDistribution(this.distributionOrigin, ["Any Account", "Any Payable Account", "Any Subaccount", "Any Billing ID"]);
    } else {
      this.matchRecord = this.getDistribution(this.distributionOrigin, ["Any Payable Account", "Any Subaccount", "Any Billing ID", "Specific Subaccount", "Specific Billing ID", "Specific Payable Account"]);
    }

    if (value === "Vendor Global" || value === "Customer Global") {
      if (this.additionalBillData?.BillingId !== null && this.additionalBillData?.BillingId !== "") {
        this.matchRecord = this.getDistribution(this.distributionOrigin, ["Any Billing ID"]);
      } else if (this.additionalBillData?.SubAccountNumber !== null && this.additionalBillData?.SubAccountNumber !== "") {
        this.matchRecord = this.getDistribution(this.distributionOrigin, ["Any Account", "Any Payable Account", "Any Subaccount"]);
      } else {
        this.matchRecord = this.getDistribution(this.distributionOrigin, ["Any Account", "Any Payable Account"]);
      }
    } else {
      if (this.additionalBillData?.BillingId !== null && this.additionalBillData?.BillingId !== "") {
        this.matchRecord = this.getDistribution(this.distributionOrigin, ["Any Billing ID", "Specific Billing ID"]);
      } else if (this.additionalBillData?.SubAccountNumber !== null && this.additionalBillData?.SubAccountNumber !== "") {
        this.matchRecord = this.getDistribution(this.distributionOrigin, ["Any Subaccount", "Specific Subaccount"]);
      } else {
        this.matchRecord = this.getDistribution(this.distributionOrigin, ["Any Payable Account", "Specific Payable Account"]);
      }
    }

    if(this.clickedRecord?.[0]?.SpecificDistributionNeeded){
      this.setValueInFormControl('distributionOriginLevelTypeId', 'Specific Billing ID');
      this.changeOrigin({ value: 'Specific Billing ID' }, true);
    }
  }


  getDistribution(roles: any, filter: any) {
    return roles.filter((name: any) => filter.includes(name.Type));
  }

  removeDuplicates(arr: any) {
    let uniqueIds = new Set();
    return arr.filter((record: any) => {
      if (!uniqueIds.has(record.DistributionOriginLevelTypeId)) {
        uniqueIds.add(record.DistributionOriginLevelTypeId);
        return true;
      }
      return false;
    });
  }

  changeOrigin(item: any, fromTS = false) {
    if (!fromTS)
      this.displayRule = undefined;
    this.setValueInFormControl('distributionMethodTypeId', '')
    let value = item.value;
    this.matchMethod = [];
    if (this.f.distributionAccountLocationTypeId.value === "Vendor Global" || this.f.distributionAccountLocationTypeId.value === "Customer Global") {
      if (value == "Any Account" || value == "Any Billing ID" || value == "Any Subaccount") {
        this.matchMethod = this.getDistribution(this.distributionMethodAll, ["Origin Account", "Payable Account (all inventory/accounts)"]);
      } else if (value == "Any Payable Account") {
        this.matchMethod = this.getDistribution(this.distributionMethodAll, ["Origin Account"]);
      }
    } else {
      if (value == "Any Payable Account" || value == "Specific Payable Account" || value == "Any Subaccount" || value == "Any Billing ID") {
        this.matchMethod = this.getDistribution(this.distributionMethodAll, ["Specific Subaccount", "Specific Billing ID(s)"]);
      } else if (value == "Specific Subaccount" || value == "Specific Billing ID") {
        this.matchMethod = this.getDistribution(this.distributionMethodAll, ["Payable Account (all inventory/accounts)", "Specific Subaccount", "Specific Billing ID(s)"]);
      }
    }
  }

  changeMethod(data: any, fromTS = false) {
    if (!fromTS)
      this.displayRule = undefined;

    if (data.value == "Specific Billing ID(s)") {
      this.billingIds();
    } else if (data.value == "Specific Subaccount") {
      this.subAccounts();
    }
  }

  formSet(data?: any) {
    // Set initial distribution level based on SpecificDistributionNeeded
    const initialDistributionLevel = this.clickedRecord?.[0]?.SpecificDistributionNeeded ? 'Customer Specific' : 'Vendor Global';
    
    this.distributionForm = this._formBuilder.group({
      distributionAccountLocationTypeId: new FormControl(initialDistributionLevel),
      distributionRulesTypeId: new FormControl(this.fromTab == 'true' ? "Vendor Product Totals" : "Billing ID Totals", [Validators.required]),
      distributionOriginLevelTypeId: new FormControl('', [Validators.required]),
      distributionMethodTypeId: new FormControl('', [Validators.required]),
      ruleStatus: new FormControl(true, [Validators.required]),
      ruleOption: new FormControl('monthly', [Validators.required]),
    });

    // If SpecificDistributionNeeded is true, trigger changeType
    if (this.clickedRecord?.[0]?.SpecificDistributionNeeded) {
      setTimeout(() => {
        this.changeType('Customer Specific');
      });
    }
  }

  billingIds(data?: any) {
    this._unsubscribeBId.next(null);
    this.sandboxService.billingIds(this.sandBoxGridRowData.SBInvoiceId).pipe(takeUntil(this._unsubscribeBId)).subscribe((response: any) => {
      if (response.Success) {
        this.rowData = this.processData(response.Data.$values);
        if (this.distributionDetail?.DistributionMethodInventories.$values.length > 0) {
          this.rowData.forEach((node: any) => {
            const d = this.distributionDetail.DistributionMethodInventories.$values.some((r: any) => r.InventoryId === node.InventoryId);
            node['isChecked'] = d;
          });
        }
      }
    })
  }
  BillingIDInvoiceTooltip(data?: any): void {
    this.dialog.open(this.BillingIDInvoice, {
      width: '900px',
      data: {
        colseButton: true,
      }
    });
  }
  private areVendorProductsFromDifferentAccounts(data?: any): boolean {
    if (!this.selectedInventoryData || this.selectedInventoryData.length === 0) {
      return false;
    }
    const uniqueAccounts = new Set(this.selectedInventoryData.map((item: any) => item.BillingAccountHierarchyId));
    return uniqueAccounts.size > 1;
  }

  formSubmit(data?: any) {
    this.submitted = true;

    if (this.distributionForm.valid) {

      if (this.f?.distributionMethodTypeId?.value == "Specific Billing ID(s)" && this.f?.distributionAccountLocationTypeId?.value == "Customer Specific" && this.f.distributionRulesTypeId.value == 'Billing ID Totals') {
        if (this.distributionMethodTypeInventoryIds == undefined || (this.distributionMethodTypeInventoryIds?.length == 0)) {
          // this.ErrorWarningPopupOpen('Billing ID is required');
          let errorData: any = {
            messgeType: "error",
            title: "Attention",
            titleClass: "text-c-blue",
            icon: "fas fa-exclamation-circle",
            iconClass: "text-c-blue f-70",
            message: "No Billing ID's have been selected. Please make a selection.",
            okBtnName: 'Close'
          }
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
          return
        }
      }

      if (this.f?.distributionMethodTypeId?.value == "Specific Billing ID(s)" && this.f?.distributionAccountLocationTypeId?.value == "Customer Specific" && (this.f.distributionRulesTypeId.value == "Billing ID Count" || this.f.distributionRulesTypeId.value == 'Vendor Product Totals')) {
        if (this.distributionMethodTypeInventoryIds?.length == 0 && this.inventoryIds.length == 0) {
          let errorData: any = {
            messgeType: "error",
            title: "Attention",
            titleClass: "text-c-blue",
            icon: "fas fa-exclamation-circle",
            iconClass: "text-c-blue f-70",
            message: "No Billing ID's have been selected. Please make a selection.",
            okBtnName: 'Close'
          }
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
          return
        }
      }

      if (this.f?.distributionMethodTypeId?.value == "Specific Subaccount" && this.f?.distributionAccountLocationTypeId?.value == "Customer Specific") {
        if (this.distributionMethodTypeBillingAccountHierarchyIds == undefined || this.distributionMethodTypeBillingAccountHierarchyIds?.length == 0) {
          this.ErrorWarningPopupOpen('Sub Account is required')
          return
        }
      }

      data['status'] = this.f.ruleStatus.value;
      data['sbInvoiceId'] = this.sandBoxGridRowData.SBInvoiceId;
      if (this.f.ruleOption.value == 'monthly') {
        data['monthlyRule'] = true;
        data['onetimeRule'] = false;
      } else {
        data['onetimeRule'] = true;
        data['monthlyRule'] = false
      }

      let dbo = this.distributionOrigin.find((f: any) => f.Type === this.f.distributionOriginLevelTypeId.value).Id;
      data['distributionOriginLevelTypeId'] = dbo;

      let dboT = this.distributionMethodAll.find((f: any) => f.Type === this.f.distributionMethodTypeId.value).Id;
      data['distributionMethodTypeId'] = dboT;

      let dboLT = this.distributionLevels.find((f: any) => f.Type === this.f.distributionAccountLocationTypeId.value).Id;
      data['distributionAccountLocationTypeId'] = dboLT;

      let dboRT = this.distributionType.find((f: any) => f.Type === this.f.distributionRulesTypeId.value).Id;
      data['distributionRulesTypeId'] = dboRT;

      if (this.clickedRecord[0].DistributionRuleId !== null)
        data['distributionRuleId'] = this.clickedRecord[0].DistributionRuleId;
      if (this.f?.distributionAccountLocationTypeId?.value == "Customer Specific" || this.f?.distributionAccountLocationTypeId?.value == "Customer Global") {
        data['customerId'] = this.additionalBillData.CustomerAccountId
      }
      data['SBChargeDetailId'] = this.clickedRecord[0].SBChargeDetailId;

      if (this.f?.DistributionOriginLevelTypeId?.value == "Any Subaccount") {
        data['distributionOriginLevelTypeIsAnySubAccount'] = true
      }

      if(this.clickedRecord[0].SpecificDistributionNeeded) {
        data['InventoryId'] = this.clickedRecord[0].InventoryId;
      }
      
      if (this.f?.distributionMethodTypeId?.value == 'Specific Billing ID(s)' && this.f?.distributionAccountLocationTypeId?.value == 'Customer Specific' && (this.f.distributionRulesTypeId.value == 'Billing ID Count' || this.f.distributionRulesTypeId.value == 'Vendor Product Totals'
      ) && this.inventoryIds.length > 0) {
        this.selectedInventoryData = _.sortedUniq(this.selectedInventoryData)

        const result = _.map(this.selectedInventoryData, (item: any) => ({
          InventoryId: item.InventoryId,
          VendorProductInventoryId: this.fromTab == 'true' ? item.VendorProductInventoryId : null
        }));

        data['inventoryIds'] = _.sortedUniq(result)
      }

      if (this.fromTab == 'true') {
        data['isFromChargeDistributionStep6'] = true;
      }

      data['distributionMethodTypeBillingAccountHierarchyIds'] = this.distributionMethodTypeBillingAccountHierarchyIds !== undefined ? this.distributionMethodTypeBillingAccountHierarchyIds : null;

      if (this.f?.distributionMethodTypeId.value == "Origin Account") {
        data['distributionMethodTypeBillingAccountHierarchyIds'] = [this.additionalBillData.BillingAccountHierarchyId]
      } else if (this.f?.distributionMethodTypeId.value == "Payable Account (all inventory/accounts)") {
        data['distributionMethodTypeBillingAccountHierarchyIds'] = [this.overViewData.PayableBillingAccountHierarchyId];
      }

      data['distributionMethodTypeInventoryIds'] = this.distributionMethodTypeInventoryIds !== undefined && this.distributionMethodTypeInventoryIds?.length > 0 ? [...new Set(this.distributionMethodTypeInventoryIds)] : null;
      data['distributionOriginLevelTypeBillingAccountHierarchyIds'] = null;
      if (this.f?.distributionOriginLevelTypeId.value == "Specific Payable Account" || this.f?.distributionOriginLevelTypeId.value == "Any Payable Account") {
        data['distributionOriginLevelTypeBillingAccountHierarchyIds'] =
          [this.overViewData.PayableBillingAccountHierarchyId];
      }

      if (this.f.distributionOriginLevelTypeId.value === 'Specific Subaccount') {
        data['distributionOriginLevelTypeBillingAccountHierarchyIds'] = [this.additionalBillData.BillingAccountHierarchyId];
      }

      data['distributionOriginLevelTypeInventoryIds'] = null;
      if (this.f.distributionOriginLevelTypeId.value === 'Specific Billing ID') {
        data['distributionOriginLevelTypeInventoryIds'] = [this.additionalBillData.InventoryId];
      }
      data['distributionRuleName'] = (this.disType) + (this.f?.distributionAccountLocationTypeId?.value ? '/' + this.f?.distributionAccountLocationTypeId?.value :
        '') + (this.f?.distributionOriginLevelTypeId?.value ? '/' + this.f?.distributionOriginLevelTypeId?.value : '') + (this.f.distributionMethodTypeId.value ? '/' + this.f.distributionMethodTypeId.value :
          '') + ('/' + this.additionalBillData?.ChargeCodeName) + (this.additionalBillData?.VendorAccountName ? '/' +
            this.additionalBillData?.VendorAccountName : '') + (this.f.distributionAccountLocationTypeId.value == "Customer Global" ||
              this.f.distributionAccountLocationTypeId?.value == "Customer Specific" ? '/' +
            this.additionalBillData?.CustomerAccountName : '')

      data['chargeCodeId'] = this.clickedRecord[0].ChargeCodeId;

      if (this.f.distributionAccountLocationTypeId.value == "Vendor Global") {
        let errorData: any = {
          messgeType: 'error',
          closeBtnName: 'This is correct, please save it!',
          okBtnName: 'Close & Review',
          title: 'Attention',
          titleClass: 'text-c-blue',
          icon: 'fas fa-question-circle',
          iconClass: 'text-c-blue f-70',
          message: `Vendor Global Rules will apply to all customers with the Vendor and the Charge Code in this rule. Please ensure this should be a rule for ALL customers.`,
        };

        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
          panelClass: 'error-warning',
          data: errorData,
        });
        dialogRef.afterClosed().subscribe((result) => {
          if (result == false) {
            this.saveDistribution(data);
          }
        });
      } else {
        this.saveDistribution(data);
      }
    }
  }


  saveDistribution(data?: any) {
    this.saveButtonLoadder = true;

   let chargeCodes = [...new Set(this.rowDataCCCOntext.map((item: any) => item.ChargeCodeId))]


      if(chargeCodes && chargeCodes.length > 1) {
        data['chargeCodeIds'] = [...new Set(this.rowDataCCCOntext.map((item: any) => item.ChargeCodeId))]
        data['chargeCodeId'] = null;

        this.sandboxService.distributionRulesBulk(this.sandBoxGridRowData.SBInvoiceId, data).subscribe((res: any) => {
          this.saveButtonLoadder = false;

            if (res.Success) {
              let errorData: any = {
                messgeType: "error",
                title: "Attention",
                titleClass: "text-c-blue",
                icon: "fas fa-exclamation-circle",
                iconClass: "text-c-blue f-70",
                message: res.Message //if messges is multiple use array
              }
              const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });

              this.addBulkDistribution();
              dialogRef.afterClosed().subscribe(res => {
                this.redirectTab.emit({ index: 0 });
              })
            } else {
              this.responseData = res.Data;
              if (!this.responseData?.ValidationKey) {
                this.ErrorWarningPopupOpen(res.Message);
                return
              }
              if (this.responseData.ValidationKey == 'SameHierarchyAndInactiveDistributionRule') {
                this.popup({ msg1: res.Message, btnMsg: 'This is correct, please save it!', payload: data })
              } else if (this.responseData.ValidationKey == 'LowerHierarchy') {
                this.popup({ msg1: res.Message, btnMsg: 'Yes I meant to do this...', payload: data })
              } else if (this.responseData.ValidationKey == 'HigerHierarchy') {
                this.popup({ msg1: res.Message, btnMsg: 'This is correct, use it!', payload: data })
              } else if (this.responseData.ValidationKey == 'BlankBillingID') {
                let errorData: any = {
                  messgeType: 'error',
                  okBtnName: 'Add New Rule',
                  closeBtnName: '',
                  title: 'Attention',
                  titleClass: 'text-c-blue',
                  icon: 'fas fa-question-circle',
                  iconClass: 'text-c-blue f-70',
                  message: res.Message,
                };
                const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
                  width: '700px',
                  data: errorData,
                });
                dialogRef.afterClosed().subscribe((result) => {
                  this.getAdditionalDetail();
                });
              } else if (this.responseData.ValidationKey == 'NotBlankBillingID') {
                this.popup({ msg1: res.Message, btnMsg: 'This is correct, please remove it!', payload: data })
              }
            }

            if(res?.Other?.NeedToCheckNextStep) {
              this.sandboxService.getInvoiceStep(this.sandBoxGridRowData.SBInvoiceId).subscribe(()=> {
              })
            }
        });
      } else {
          this.sandboxService.addDistributionRules(this.sandBoxGridRowData.SBInvoiceId, data).subscribe((res: any) => {
            this.saveButtonLoadder = false;

            if (res.Success) {
              let errorData: any = {
                messgeType: "error",
                title: "Attention",
                titleClass: "text-c-blue",
                icon: "fas fa-exclamation-circle",
                iconClass: "text-c-blue f-70",
                message: res.Message //if messges is multiple use array
              }
              const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
              dialogRef.afterClosed().subscribe(res => {
                this.redirectTab.emit({ index: 0 });
              })
            } else {
              this.responseData = res.Data;
              if (!this.responseData?.ValidationKey) {
                this.ErrorWarningPopupOpen(res.Message);
                return
              }
              if (this.responseData.ValidationKey == 'SameHierarchyAndInactiveDistributionRule') {
                this.popup({ msg1: res.Message, btnMsg: 'This is correct, please save it!', payload: data })
              } else if (this.responseData.ValidationKey == 'LowerHierarchy') {
                this.popup({ msg1: res.Message, btnMsg: 'Yes I meant to do this...', payload: data })
              } else if (this.responseData.ValidationKey == 'HigerHierarchy') {
                this.popup({ msg1: res.Message, btnMsg: 'This is correct, use it!', payload: data })
              } else if (this.responseData.ValidationKey == 'BlankBillingID') {
                let errorData: any = {
                  messgeType: 'error',
                  okBtnName: 'Add New Rule',
                  closeBtnName: '',
                  title: 'Attention',
                  titleClass: 'text-c-blue',
                  icon: 'fas fa-question-circle',
                  iconClass: 'text-c-blue f-70',
                  message: res.Message,
                };
                const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
                  width: '700px',
                  data: errorData,
                });
                dialogRef.afterClosed().subscribe((result) => {
                  this.getAdditionalDetail();
                });
              } else if (this.responseData.ValidationKey == 'NotBlankBillingID') {
                this.popup({ msg1: res.Message, btnMsg: 'This is correct, please remove it!', payload: data })
              }
            }

            if(res?.Other?.NeedToCheckNextStep) {
              this.sandboxService.getInvoiceStep(this.sandBoxGridRowData.SBInvoiceId).subscribe(()=> {
              })
            }
          })
        }
  }

  addBulkDistribution() {
    this.sandboxService.addBulkDistribution(this.sandBoxGridRowData.SBInvoiceId, {}).subscribe((res: any) => {
    });
  }

  subAccounts() {
    this._unsubscribeSubacc.next(null);
    this.sandboxService.subAccounts(this.sandBoxGridRowData.SBInvoiceId).pipe(takeUntil(this._unsubscribeSubacc)).subscribe((response: any) => {
      if (response.Success) {
        this.rowData2 = response.Data.$values;
        if (this.distributionDetail.DistributionMethodAccounts.$values.length > 0) {
          this.rowData2.forEach((node: any) => {
            const d = this.distributionDetail.DistributionMethodAccounts.$values.some((r: any) => r.BillingAccountHierarchyId === node.BillingAccountHierarchyId
            );
            node['isChecked'] = d;
          });
        }
      }
    });
  }
  popup(data?: any) {
    const dialogRef = this.dialog.open(ChargeCodeAssignmentDialogComponent, {
      width: '700px',
      data: data
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        let payload = data.payload;
        payload['ValidateKey'] = this.responseData.ValidationKey;
        payload['DistributionRuleIdToInactive'] = this.responseData.DistributionRuleIdToInactive;

        this.saveDistribution(payload)
      }
    });
  }
  convertToDateTime(date: any) {
    return moment(new Date(date)).format('MM/DD/YYYY h:mm');
  }

  distributionAccountLocationTypes() {
    this._unsubscribeLocation.next(null);
    this.sandboxService.distributionAccountLocationTypes().pipe(takeUntil(this._unsubscribeLocation)).subscribe((res: any) => {
      this.distributionLevels = res.Data.$values;
      
      // If SpecificDistributionNeeded is true, filter to only allow Customer Specific
      if (this.clickedRecord?.[0]?.SpecificDistributionNeeded) {
        this.distributionLevels = this.distributionLevels.map((level: any) => ({
          ...level,
          disabled: level.Type !== 'Customer Specific'
        }));
      }
      
      this.distributionLevels = this.swapFirstAndLast(this.distributionLevels);
      this.getDisType(true);
    })
  }

  get f() {
    return this.distributionForm.controls;
  }


  distributionRuleTypes() {
    this._unsubscribeRule.next(null);
    this.sandboxService.distributionRuleTypes().pipe(takeUntil(this._unsubscribeRule)).subscribe((res: any) => {
      let data = this.swapFirstAndLast(res.Data.$values);
      _.map(data, (x: any) => {
        if (x.Type == "Billing ID Totals") {
          x.label = '% of Billing IDs Total'
        } else if (x.Type == "Billing ID Count") {
          x.label = 'Across All Billing IDs'
        } else {
          x.label = '% of Vendor Product'
        }
      })

      this.distributionType = data;
      if (this.fromTab == 'true') {
        this.distributionType.splice(0, 2)
        this.distributionType = _.cloneDeep(this.distributionType)
      } else {
        this.distributionType.splice(2, 1);
        this.distributionType = _.cloneDeep(this.distributionType)
      }
    })
  }

  distributionMethodTypes() {
    this._unsubscribeMethod.next(null);
    this.sandboxService.distributionMethodTypes().pipe(takeUntil(this._unsubscribeMethod)).subscribe((res: any) => {
      this.distributionMethodAll = res.Data.$values;
    })
  }

  swapFirstAndLast(arr: any) {
    if (arr.length < 2) {
      return arr;
    }
    [arr[0], arr[arr.length - 1]] = [arr[arr.length - 1], arr[0]];
    return arr;
  }

  processData(data: any[]) {
    const flattenedData: any[] = [];
    const flattenRowRecursive = (row: any, parentPath: string[]) => {
      const dataPath = [...parentPath, row.$id];
      flattenedData.push({ ...row, dataPath });
      if (row.BillingIdChargeCodes && row.BillingIdChargeCodes.$values.length > 0) {
        row.BillingIdChargeCodes.$values.forEach((underling: any) => {
          flattenRowRecursive(underling, dataPath)
        }
        );
      }
    };
    data.forEach((row) => flattenRowRecursive(row, []));
    return flattenedData;
  }

  openAssTooltip() {
    const dialogRef = this.dialog.open(this.bulkassignTooltip, {
      width: '900px',
      data: {
        colseButton: true,
      }
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
    dialogRef.afterClosed().subscribe(result => {
      if(result && message.startsWith('Of')) {
        this.redirectTab.emit({ index: 0 });
      }
    });
    return true
  }

}