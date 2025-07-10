import { Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as _ from 'lodash';
import { Router } from '@angular/router';
import { LocationService } from '../services/location.service';
import { WirelineService } from '../services/wireline.service';
import { createColumn } from '../utils/column-utils';
import { isValueExist } from '../services/helper';
import { onChangeEndDate } from '../services/common-p-table';
import { SharedModule } from '../demo/shared/shared.module';
import { PrimgModule } from '../demo/shared/primeng.module';

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
  selector: 'app-invoice-summary-p-table',
  templateUrl: './invoice-summary-p-table.component.html',
  styleUrls: ['./invoice-summary-p-table.component.scss'],
  imports: [SharedModule, PrimgModule],
  providers: [WirelineService]
})
export class InvoiceSummaryPTableComponent implements OnInit {

  @Input() rowData: any;
  @Input() fromPage: any;
  @Input() sandBoxGridRowData: any;
  @Input() recordPublishedOrCompleted: any;

  serviceIds: any = [];
  services: any;
  @Output() isBillingAccountExist: EventEmitter<any> = new EventEmitter();
  @Output() exportAccountData: EventEmitter<any> = new EventEmitter();
  @Output() rowCellDoubleClicked: EventEmitter<any> = new EventEmitter();
  @Output() redirectTab: EventEmitter<any> = new EventEmitter<any>();

  @Output() onRowDataLength: EventEmitter<any> = new EventEmitter<any>();
  @Output() stopSpinnerEvent: EventEmitter<any> = new EventEmitter<any>();

  sidebarVisible: boolean = false;

  files: TreeNode[];
  TotalCount = 0;
  parentInvoiceChargeDetailsId: any;

  @ViewChild('myModal') myModal: any;
  filterArray: arrDate[];
  filterArrayDate: arrDate[];
  filterArrayNumber: arrDate[];

  cols: any[];
  displaycols: any[];
  items: any[];
  colsshow: any[];
  totalRecords: number;
  loading: boolean;
  radioItems: Array<any>;

  model = { option: 'AND' };
  filterText: any = '';

  displayModal: boolean = false;
  displayModal1: boolean = false;

  selectedOption: any;
  contextMenuPosition: { x: number; y: number } = { x: 0, y: 0 };
  fieldsName: any;
  sorting: any;
  sortingType: any;
  expandedNode: TreeNode | null = null;
  lastNode: TreeNode | null = null;

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

  selectedFiles!: any[];

  filesColumns: any = []

  selectedOption1: any = this.countries[0].name;
  selectedOption2: any = this.countries[0].name;

  textboxValue1: any = '';
  textboxValue2: any = '';

  textboxValue1_1: any = '';
  textboxValue2_1: any = '';

  radiobutton: any = '';
  finalAllDetailArr: any;

  private _unsubscribeGRid: Subject<any> = new Subject<any>();
  private _unsubscribeService: Subject<any> = new Subject<any>();

  public getDataPath: any = (data: any) => data.dataPath;

  pTableContain = { first: 1 };
  finalFilterdArr: any;
  innerLoading = false;
  isDisabledExport = false;
  @ViewChild('treeTable') treeTable!: any;
  @ViewChild('contextMenu') contextMenu: any;
  selectedNode: any;
  public exportAccounts: any;
  @HostListener('document:click', ['$event']) onClick(event: Event) {
    const clickedInsideMenu = this.contextMenu?.el?.nativeElement.contains(event.target);
    if (!clickedInsideMenu) {
      this.contextMenu.hide();
    }
  }

  constructor(public locationService: LocationService, public wirelineService: WirelineService,
    private router: Router
  ) {
  }

  ngAfterViewInit() {
    const scrollableBody = this.treeTable.el.nativeElement.querySelector(
      '.p-treetable-scrollable-body'
    );

    if (scrollableBody) {
      scrollableBody.addEventListener('scroll', this.onScroll.bind(this));
    }
  }

  setCols() {

    if (this.fromPage === 'step7') {
      this.cols = [
        createColumn(1, '180px', true, 'text', 'Inventory', 'ParentBillingId', 'Primary Billing ID', 'close'),
        createColumn(1, '180px', false, 'text', '', 'BillingId', 'Billing ID', 'close'),
        createColumn(1, '120px', false, 'text', '', 'AccrossInventoryDisplay', 'ID Added', 'close'),
        createColumn(1, '120px', false, 'text', '', 'AnotherAccountInventoryDisplay', 'Secondary Account', 'open'),

        createColumn(2, '200px', true, 'text', 'Account', 'MainAccountNumber', 'Main Account Number'),
        createColumn(2, '210px', false, 'text', '', 'Subaccount', 'Sub Account Number', 'open'),
        createColumn(2, '140px', false, 'text', '', 'BillingAccountStatus', 'Account Status', 'open'),

        createColumn(3, '120px', true, 'text', 'Vendor', 'VendorAccountName', 'Vendor', 'close'),
        createColumn(3, '140px', false, 'text', '', 'ParentVendorAccountName', 'Parent Vendor', 'open'),

        createColumn(4, '180px', true, 'text', 'Product', 'VendorProductName', 'Vendor Product'),
        createColumn(4, '170px', false, 'text', '', 'ServiceName', 'Service', 'open'),
        createColumn(4, '165px', false, 'text', '', 'ServiceTypeName', 'Service Type', 'open'),
        createColumn(4, '155px', false, 'text', '', 'ProductName', 'Product', 'open'),
        createColumn(4, '190px', false, 'text', '', 'ProductTypeName', 'Product Type', 'open'),
        createColumn(4, '190px', false, 'text', '', 'IndustryName', 'Industry', 'open'),

        createColumn(5, '200px', true, 'text', 'Charge Code', 'ChargeCodeName', 'Charge Code Name'),
        createColumn(5, '165px', false, 'text', '', 'ChargeCode', 'Charge Code', 'open'),
        createColumn(5, '180px', false, 'text', '', 'ChargeCodeTypeName', 'Charge Code Type', 'open'),
        createColumn(5, '190px', false, 'text', '', 'ChargeCodeOccurrence', 'Charge Occurrence', 'open'),

        createColumn(6, '180px', true, 'numberFilter', 'Charges', 'TotalChargeDisplay', 'Product Total', 'close'),
        createColumn(6, '150px', false, 'numberFilter', '', 'ChargeDisplay', 'Charge', 'open'),
        createColumn(6, '200px', false, 'numberFilter', '', 'DistributionEventId', 'Distribution Event ID', 'open'),
        createColumn(6, '200px', false, 'text', '', 'ManualAddedChargesDisplay', 'Charge Correction', 'open')
      ];
    } else {
      this.cols = [
        createColumn(1, '180px', true, 'text', 'Inventory', 'BillingId', 'Service Number', 'close'),
        createColumn(1, '120px', false, 'text', '', 'AccrossInventoryDisplay', 'ID Added', 'open'),
        createColumn(1, '120px', false, 'text', '', 'AnotherAccountInventoryDisplay', 'Secondary Account', 'open'),

        createColumn(2, '200px', true, 'text', 'Account', 'MainAccountNumber', 'Main Account Number', 'close'),
        createColumn(2, '210px', false, 'text', '', 'Subaccount', 'Sub Account Number', 'open'),
        createColumn(2, '140px', false, 'text', '', 'BillingAccountStatus', 'Account Status', 'open'),

        createColumn(3, '120px', true, 'text', 'Vendor', 'VendorAccountName', 'Vendor', 'close'),
        createColumn(3, '140px', false, 'text', '', 'ParentVendorAccountName', 'Parent Vendor', 'open'),
        createColumn(3, '150px', false, 'text', '', '', 'Payable Vendor', 'open'),

        createColumn(4, '180px', true, 'text', 'Product', 'VendorProductName', 'Vendor Product', 'close'),
        createColumn(4, '165px', false, 'text', '', 'ServiceTypeName', 'Service Type', 'open'),
        createColumn(4, '170px', false, 'text', '', 'ServiceName', 'Service', 'open'),
        createColumn(4, '190px', false, 'text', '', 'ProductTypeName', 'Product Type', 'open'),
        createColumn(4, '155px', false, 'text', '', 'ProductName', 'Product', 'open'),
        createColumn(4, '190px', false, 'text', '', 'IndustryName', 'Industry', 'open'),

        createColumn(5, '200px', true, 'text', 'Charge Code', 'ChargeCodeName', 'Charge Code Name'),
        createColumn(5, '165px', false, 'text', '', 'ChargeCode', 'Charge Code', 'open'),
        createColumn(5, '180px', false, 'text', '', 'ChargeCodeTypeName', 'Charge Code Type', 'open'),
        createColumn(5, '180px', false, 'text', '', 'ChargeTypeName', 'Charge Type', 'open'),
        createColumn(5, '190px', false, 'text', '', 'ChargeCodeOccurrence', 'Charge Occurrence', 'open'),

        createColumn(6, '180px', true, 'numberFilter', 'Charges', 'TotalChargeDisplay', 'Product Total', 'close'),
        createColumn(6, '150px', false, 'numberFilter', '', 'ChargeDisplay', 'Charge', 'close'),
        createColumn(6, '80px', false, 'numberFilter', '', 'Quantity', 'QTY', 'close'),
        createColumn(6, '180px', false, 'numberFilter', '', 'DistributionEventId', 'Distribution Event ID', 'close')
      ];
    }


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

  clickDistribution(event: any) {
    let data = {
      redirect: true,
      type: 'distribution-detail',
      data: event
    }
    this.redirectTab.emit(data)
  }
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

  ngOnDestroy(): void {
    this._unsubscribeGRid.next(true);
    this._unsubscribeGRid.complete();
    this._unsubscribeService.next(true);
    this._unsubscribeService.complete();
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

    this.loading = false;

    this.setColumnDefs();


  }


  loadNodes(event?: any, allOptionsClear = false) {
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

    // Check if advanceFilter is empty

    this.finalFilterdArr['advanceFilter'] = Array.from(
      new Map(this.finalFilterdArr['advanceFilter'].map((item:any) => [JSON.stringify(item), item])).values()
    );
    const data = {
      ...this.finalFilterdArr,
      startRowIndex: this.pTableContain.first,
      maximumRows: 100,
      IsTotalNeed: true,
      ...(this.rowData?.InvoiceId ? { InvoiceId: this.rowData.InvoiceId } : {}),
      ...(this.sandBoxGridRowData?.SBInvoiceId ? { sbInvoiceId: this.sandBoxGridRowData.SBInvoiceId } : {}),
      ...(this.sorting ? { OrderBy: this.sorting == 'TotalChargeDisplay' ? 'TotalCharge' : this.sorting == 'ChargeDisplay' ? 'Charge' : this.sorting, SortOrder: this.sortingType } : {}),
    };
    this.finalAllDetailArr = data;
    this._unsubscribeGRid.next(true);

    // Clear files if needed
    if (allOptionsClear) this.files = [];
    this.stopSpinnerEvent.emit(false);

    if (this.fromPage === 'step7') {
      this.wirelineService.getSandboxSummryBillingNew(data)
        .pipe(takeUntil(this._unsubscribeGRid))
        .subscribe(
          response => {
            this.stopSpinnerEvent.emit(true);
            this.handleResponse(response, allOptionsClear)
          },
          () => this.handleError()
        );
    } else {
      this.wirelineService.getInvoiceSummryBillingNew(data)
        .pipe(takeUntil(this._unsubscribeGRid))
        .subscribe(
          response => {
            this.stopSpinnerEvent.emit(true);
            this.handleResponse(response, allOptionsClear)
          },
          () => this.handleError()
        );
    }

  }

  // Handle the response for loadNodes
  handleResponse(response: any, allOptionsClear: any) {
    this.loading = false;
    this.totalRecords = response.TotalCount;

    if (response?.Data?.$values?.length) {
      const resData = response.Data.$values.map(this.extractDataAndLeaf.bind(this));
      this.onRowDataLength.emit(response?.Data?.$values);

      this.files = allOptionsClear ? resData : [...this.files, ...resData];
      this.isApiAlerdayCall = false;

    } else {
      this.files = [];
      this.isApiAlerdayCall = false;
    }

    this.files.length > 0 ? this.isBillingAccountExist.emit(true) : this.isBillingAccountExist.emit(false);
  }

  // Extract data and leaf status

  extractDataAndLeaf = (item: any) => {
    return {
      data: this.extractData(item),
      leaf: !item.HasParent
    };
  }

  // Handle error case
  handleError() {
    this.loading = false;
    this.files = [];
  }


  // Helper method to extract data fields

  extractData(item: any) {
    const fields = Object.keys(item);

    return fields.reduce((acc: any, field: any) => {
      acc[field] = item[field];
      return acc;
    }, {});
  }

  onNodeExpand(event: any) {
    const node = event.node;
    this.parentInvoiceChargeDetailsId = node.data.InvoiceChargeDetailsId
    // Check if the node has children
    if (!node.children || node.children.length === 0) {
      this.innerLoading = true;

      this.expandedNode = node;
      // Build the data request object
      const data = {
        ...this.finalFilterdArr,
        startRowIndex: 1,
        level: node.data.Level,
        maximumRows: 10000,
        IsTotalNeed: true,
        ParentInvoiceChargeDetailsId: node.data.InvoiceChargeDetailsId,
        ...(this.rowData?.InvoiceId ? { InvoiceId: this.rowData.InvoiceId } : {}),
        ...(this.sandBoxGridRowData?.SBInvoiceId ? { sbInvoiceId: this.sandBoxGridRowData.SBInvoiceId } : {}),
      };

      this._unsubscribeGRid.next(true);

      if (this.fromPage === 'step7') {
        this.wirelineService.getSandboxSummryBillingNew(data)
          .pipe(takeUntil(this._unsubscribeGRid))
          .subscribe(
            response => this.handleNodeResponse(response, node),
            () => this.handleNodeError()
          );
      } else {
        this.wirelineService.getInvoiceSummryBillingNew(data)
          .pipe(takeUntil(this._unsubscribeGRid))
          .subscribe(
            response => this.handleNodeResponse(response, node),
            () => this.handleNodeError()
          );
      }

    }
  }

  // Handle the API response for node expansion
  handleNodeResponse(response: any, node: any) {
    this.innerLoading = false;

    if (response?.Data?.$values?.length) {
      // Map response data to node children
      node.children = response.Data.$values.map(this.extractDataAndLeaf.bind(this));
      this.files = [...this.files]; // Trigger change detection if necessary
    } else {
      node.children = []; // Clear children if no data
    }
  }

  // Handle error case
  handleNodeError() {
    this.innerLoading = false;
    // Optionally, log the error or provide feedback
  }

  setColumnDefs() {
    let headerData: any = [];
    let ChildHeaderData: any = [];
    let i = 0;
    let childIndex = 0;
   

    let headerDataSheet1: any = [];
    let ChildHeaderDataSheet1: any = [];
    let i1 = 0;
    let childIndex1 = 0;
    i1 = i1 + 1;

    headerDataSheet1.push({
      "Position": i1,
      "Title": 'Inventory'
    })

    childIndex1 = childIndex1 + 1;

    ChildHeaderDataSheet1.push({
      "HeaderPosition": i1,
      "Position": childIndex1,
      "FieldName": 'ParentBillingId',
      "Title": 'Primary Service Number',
      
    })

    _.map(this.cols, (x: any) => {
      if (x.isChildren && x.isForSheet1) {
        i1 = i1 + 1;

        headerDataSheet1.push({
          "Position": i1,
          "Title": x.header
        });

      }

      if(x.isForSheet1) {
        childIndex1 = childIndex1 + 1;

        ChildHeaderDataSheet1.push({
          "HeaderPosition": i1,
          "Position": childIndex1,
          "FieldName": x.field,
          "Title": x.childHeader,
          "isCurrency": x.field == 'TotalChargeDisplay' || x.field == 'ChargeDisplay' ? true : false
        });
      }
    });

    _.map(this.cols, (x: any) => {
      if (x.isChildren) {
        i = i + 1;

        headerData.push({
          "Position": i,
          "Title": x.header
        });

      }

      childIndex = childIndex + 1;
       if(this.fromPage !== 'step7' && i == 1 && childIndex == 1) {
        ChildHeaderData.push({
          "HeaderPosition": i,
          "Position": childIndex,
          "FieldName": 'ParentBillingId',
          "Title": 'Primary Service Number',
        })
        childIndex = childIndex + 1;
      } 

      ChildHeaderData.push({
        "HeaderPosition": i,
        "Position": childIndex,
        "FieldName": x.field,
        "Title": x.childHeader,
        "isCurrency": x.field == 'TotalChargeDisplay' || x.field == 'ChargeDisplay' ? true : false
      });
    });

    this.exportAccounts = {
      ...(this.fromPage === 'step7' ? { 
        
        ExportToExcelData: {
          HeaderData: headerData,
          ChildHeaderData: ChildHeaderData,
          fileName: "Invoice Summary",
        }
      } : {
        ExportToExcelData: {
          HeaderData: headerDataSheet1,
          ChildHeaderData: ChildHeaderDataSheet1,
          fileName: "Invoice Summary",
          SheetName: 'Invoice Summary'
        },
        ExportToExcelDataSheet2: {
          HeaderData: headerData,
          ChildHeaderData: ChildHeaderData,
          fileName: "Invoice Summary",
          SheetName: 'Invoice Detail'
        },
        ExportToExcelInMultipleSheet: true
      }),

      
      ExportToExcel: true,
      IsTotalNeed: true,
      ...this.finalFilterdArr,
      ...(this.sorting ? { OrderBy: this.sorting, SortOrder: this.sortingType } : {}),
      ...(this.rowData?.InvoiceId ? { InvoiceId: this.rowData.InvoiceId } : {}),
      ...(this.sandBoxGridRowData?.SBInvoiceId ? { sbInvoiceId: this.sandBoxGridRowData.SBInvoiceId } : {}),
    };

    if (isValueExist(this.parentInvoiceChargeDetailsId)) {
      this.exportAccounts['parentInvoiceChargeDetailsId'] = this.parentInvoiceChargeDetailsId;
    }

    this.exportAccountData.emit(this.exportAccounts);
  }

  isEditable() {
    let isCustomerAdmin = this.locationService.isUserCustomerAdmin();
    let isCompanyAdmin = this.locationService.isUserCompanyAdmin();
    let isCompanyManager = this.locationService.isUserCompanyManager();
    let isCompanyUser = this.locationService.isUserCompanyUser();
    if ((isCustomerAdmin || isCompanyAdmin || isCompanyManager || isCompanyUser)) {
      return false;
    }
    return true;

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
    this.loadNodes(this.pTableContain, true);
  }

  onFilter(event: any) {
    const filters = event.filters; // Get the filters object
    for (const field in filters) {
      if (filters.hasOwnProperty(field)) {
      }
    }
  }

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

      this.countries = [
        { id: 1, name: 'contains', display: 'Contains' },
        { id: 2, name: 'notContains', display: 'Not contains' },
        { id: 3, name: 'equals', display: 'Equals' },
        { id: 4, name: 'notEqual', display: 'Not equal' },
        { id: 5, name: 'startsWith', display: 'Starts with' },
        { id: 6, name: 'endsWith', display: 'Ends with' },
      ];

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

      this.countries = [
        { id: 1, name: 'contains', display: 'Contains' },
        { id: 2, name: 'notContains', display: 'Not contains' },
        { id: 3, name: 'equals', display: 'Equals' },
        { id: 4, name: 'notequal', display: 'Not equal' },
        { id: 5, name: 'lessthan', display: 'Less than' },
        { id: 6, name: 'greaterthan', display: 'Greater than' },
        { id: 7, name: 'lessthanorequal', display: 'Less than or equals' },
        { id: 8, name: 'greaterthanorequal', display: 'Greater than or equals' },
        { id: 9, name: 'inrange', display: 'In range' },
      ];

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

      this.countries = [
        { id: 1, name: 'equals', display: 'Equals' },
        { id: 2, name: 'greaterthan', display: 'Greater than' },
        { id: 3, name: 'lessthan', display: 'Less than' },
        { id: 4, name: 'Notequal', display: 'Not equal' },
        { id: 5, name: 'inrange', display: 'In range' },
      ];
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

    let data: any = [];

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

  filerOutSide(e: any, col: any) {

    if (col.type === "dateFilter") {
      if (e) {
        const date = new Date(e);
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        this.textboxValue1 = date.toISOString().split('T')[0];
      } else {
        this.textboxValue1 = '';
      }
    } else {
      this.textboxValue1 = e.target.value;
    }
    this.fieldsName = col;
    this.model = { option: 'AND' };
    this.selectedOption1 = this.selectedOption2 = this.countries[0].name,
    this.textboxValue2 = null,
    this.onFilterChangedValue();

  }

  showContextMenu(event: MouseEvent, menu: any, event1: any) {
    event.preventDefault(); // Prevent default context menu from showing
    this.selectedNode = event1;
    this.contextMenuPosition.x = event.clientX;
    this.contextMenuPosition.y = event.clientY;
    menu.show(event); // Show the PrimeNG context menu
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


  onBtnExportDataAsExcel() {

    this.setColumnDefs();
    this.isDisabledExport = true;

    if (this.fromPage === 'step7') {
      this.exportAccounts['exportToExcelInPlainForm'] = true;
      this.wirelineService.getSandboxSummryBillingNewExport(this.exportAccounts)
      .subscribe({
        next: data => {
          this.isDisabledExport = false;
          let bolbUrl = URL.createObjectURL(data);
          var link = document.createElement("a");
          link.setAttribute("href", bolbUrl);
          link.setAttribute("download", "Invoice Summary.xlsx");
          link.style.display = "none";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
        },
        error: error => {
          this.isDisabledExport = false;
          
        }
      });
    } else {
      this.wirelineService.getInvoiceSummryBillingNewExport(this.exportAccounts)
      .subscribe({
        next: data => {
          this.isDisabledExport = false;
          let bolbUrl = URL.createObjectURL(data);
          var link = document.createElement("a");
          link.setAttribute("href", bolbUrl);
          link.setAttribute("download", "Invoice Summary.xlsx");
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

}
