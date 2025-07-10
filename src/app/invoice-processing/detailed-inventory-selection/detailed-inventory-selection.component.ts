import { Component, Input, OnInit, EventEmitter, Output, ViewChild, TemplateRef } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import * as _ from 'lodash';
import { VenderProductDialogComponent } from './vender-product-dialog/vender-product-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { TreeNode } from 'primeng/api';
import { SandBoxService } from 'src/app/services/sandbox.service';
import { createColumn } from 'src/app/utils/column-utils';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { filterOptionsDate, filterOptionsNumber, filterOptionsText, onChangeEndDate } from 'src/app/services/common-p-table';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';

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
  selector: 'app-detailed-inventory-selection',
  templateUrl: './detailed-inventory-selection.component.html',
  styleUrls: ['./detailed-inventory-selection.component.scss'],
  imports: [SharedModule, PrimgModule]
})
export class DetailedInventorySelectionComponent implements OnInit {
  @Output() onCellClicked: EventEmitter<any> = new EventEmitter<any>();

  @Input() parentRowData: any;
  @Input() sandBoxGridRowData: any;
  @Input() field: any;
  @Input() overviewData: any;
  files: any[];
  selectedCodeRow: any= [];  
  @Input() recordPublishedOrCompleted: any;

  dialogRef: any;
  disableRefres: boolean = false;
  @ViewChild('tooltipText') tooltipText!: TemplateRef<any>;
  @ViewChild('InventorySelection') InventorySelection!: TemplateRef<any>;
  @ViewChild('treeTable') treeTable!: any;
  @ViewChild('contextMenu') contextMenu: any;
  
  filesColumns: any = []
  selectedFiles!: any[];
  colsshow: any[];
  displaycols: any[];
  finalFilterdArr: any;
  loading: boolean;
  isApiAlerdayCall: boolean = false;
  headerCheckboxData = false;

  displayModal: boolean = false;
  displayModal1: boolean = false;

  contextMenuPosition: { x: number; y: number } = { x: 0, y: 0 };
  sidebarVisible: boolean = false;
  totalRecords: number;
  fieldsName: any;
  model = { option: 'AND' };

  radioItems: Array<any>;

  filterArray: arrDate[];
  filterArrayDate: arrDate[];
  filterArrayNumber: arrDate[];

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
  
  textboxValue1: any = '';
  textboxValue2: any = '';

  textboxValue1_1: any = '';
  textboxValue2_1: any = '';

  finalAllDetailArr: any;
  private _unsubscribeGRid: Subject<any> = new Subject<any>();
  selectedNode: any;

  rowData: any = [];
  rowSelection = 'multiple';
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
  payloadData: any;
  cols: any[];
  pTableContain = { first: 1 };
  lastNode: TreeNode | null = null;

  sorting: any;
  sortingType: any;
  items: any[];
  filters: any = {};

  constructor(public sandBoxService: SandBoxService, public dialog: MatDialog) {
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

  openDialog1() {
    const dialogRef = this.dialog.open(this.InventorySelection, {
      width: '900px',
      data: {
        colseButton: true,
      }
    });
  }

  openDialog() {
    const dialogRef = this.dialog.open(this.tooltipText, {
      width: '900px',
      data: {
        colseButton: true,
      }
    });
  }
  ngOnInit(): void {
    this.setCols();
    this.radioItems = ['AND', 'OR'];
    this.filterArray = [];
    this.filterArrayNumber = [];
    this.filterArrayDate = [];

    this.items = [
      {
        label: ' Copy',
        icon: 'pi pi-copy',
        command: () => this.dropdownOptionSelected(),
      },
    ];
   
  }
  openSidebar() {
    this.sidebarVisible = this.sidebarVisible ? false : true;
    this.selectAllNodes(this.filesColumns);
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

  dropdownOptionSelected() {
    navigator.clipboard.writeText(this.selectedNode).then(
      () => {
      },
      (err) => {
      }
    );

  }

  
  showContextMenu(event: MouseEvent, menu: any, event1: any) {
    event.preventDefault();
    this.selectedNode = event1;
    this.contextMenuPosition.x = event.clientX;
    this.contextMenuPosition.y = event.clientY;
    menu.show(event);
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


    this.cols = [
      // createColumn(1, '90px', true, 'text', 'New', 'NewChargecode','New Charge Code',),

      createColumn(1, '60px', true, '', '', 'checkbox',''),

      // Parent Group
      createColumn(2, '110px', true, 'text', 'New', 'NewChargecode','New Code'),

      // Inventory Group
      createColumn(3, '140px', true, 'text', 'Inventory', 'BillingId', 'Billing ID'),
      createColumn(3, '120px', false, 'text', '', 'ParentVendorProductInventoryNumber', 'Parent', 'open'),
      createColumn(3, '165px', false, 'text', '', 'ParentAccountNumber', 'Parent Account', 'open'),
      createColumn(3, '165px', false, 'text', '', 'InventoryDetail1', 'Inventory Detail 1', 'open'),
      createColumn(3, '165px', false, 'text', '', 'InventoryDetail2', 'Inventory Detail 2', 'open'),
      createColumn(3, '165px', false, 'text', '', 'InventoryDetail3', 'Inventory Detail 3', 'open'),
      createColumn(3, '165px', false, 'text', '', 'InventoryDetail4', 'Inventory Detail 4', 'open'),
      createColumn(3, '165px', false, 'text', '', 'InventoryDetail5', 'Inventory Detail 5', 'open'),
      createColumn(3, '165px', false, 'text', '', 'InventoryDetail6', 'Inventory Detail 6', 'open'),
      createColumn(3, '165px', false, 'text', '', 'InventoryDetail7', 'Inventory Detail 7', 'open'),
      createColumn(3, '165px', false, 'text', '', 'InventoryDetail8', 'Inventory Detail 8', 'open'),
      createColumn(3, '165px', false, 'text', '', 'InventoryDetail9', 'Inventory Detail 9', 'open'),
      createColumn(3, '165px', false, 'text', '', 'InventoryDetail10', 'Inventory Detail 10', 'open'),

      createColumn(4, '130px', true, 'numberFilter', 'Charge', 'chargeDisplay', 'Charge', 'close'),
      createColumn(4, '115px', false, 'numberFilter', '', 'Quantity', 'QTY', 'open'),
      createColumn(4, '160px', false, 'numberFilter', '', 'UnitOfMeasure', 'Unit of Measure', 'open'),  
      createColumn(4, '189px', false, 'text', '', 'DistributionEventId', 'Distribution Event ID', 'open'),
      createColumn(4, '191px', false, 'numberFilter', '', 'DistributionAmountDistributedDisplay', 'Original Distribution Amt', 'open'),  

      createColumn(5, '189px', true, 'text', 'Charge Code', 'ChargeCodeName', 'Charge Code Name', 'close'),
      createColumn(5, '150px', false, 'text', '', 'ChargeCode', 'Charge Code', 'close'),
      createColumn(5, '182px', false, 'text', '', 'ChargeCodeTypeName', 'Charge Code Type', 'open'),
      createColumn(5, '200px', false, 'text', '', 'ChargeCodeOccurrence', 'Charge Code Occurrence', 'open'),

      createColumn(6, '110px', true, 'text', 'Vendor', 'VendorBillingAlias', 'VBA'),
      createColumn(6, '150px', false, 'text', '', 'VendorAccountName', 'Charge Code Vendor', 'open'),

      createColumn(7, '180px', true, 'text', 'Assignment', 'ChargeDetailAddress1', 'Address on Invoice'),

      createColumn(8, '90px', true, 'numberFilter', 'VPID', 'ParentVendorProductInventoryId', 'VPID'),
      createColumn(8, '130px', false, 'numberFilter', '', 'GroupId', 'Group ID', 'open'),


      // Product Group
      createColumn(9, '180px', true, 'text', 'Product', 'VendorProductTypeName', 'Vendor Product', 'close'),
      createColumn(9, '117px', false, 'text', '', 'ServiceName', 'Service', 'open'),
      createColumn(9, '148px', false, 'text', '', 'ServiceTypeName', 'Service Type', 'open'),
      createColumn(9, '121px', false, 'text', '', 'ProductName', 'Product', 'open'),
      createColumn(9, '152px', false, 'text', '', 'ProductTypeName', 'Product Type', 'open'),
      createColumn(9, '152px', false, 'text', '', 'IndustryName', 'Industry', 'open'),

      // Account Group
      createColumn(10, '180px', true, 'text', 'Account', 'MainAccountNumber', 'Main Account Number'),
      createColumn(10, '200px', false, 'text', '', 'SubAccountNumber', 'Sub Account Number', 'open'),
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

  loadNodes(event?: { first: number; }, allOptionsClear = false, fromHeaderCheckBox = false) {
    this.loading = true;


    this.pTableContain.first = this.pTableContain?.first || 1;
    if (allOptionsClear) {
      this.pTableContain.first = 1;
    }
    
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
      // vendorProductTypeId: this.addProductForm.value.vendorProductTypeId ? this.addProductForm.value.vendorProductTypeId : this.inventoryData[0].VendorProductTypeId,
      // sbChargeDetailIds: data,
      // InventorySelectionType: "MainAccountNumber",
      ...this.finalFilterdArr,
      startRowIndex: this.pTableContain.first,
      maximumRows: 100,
      sbInvoiceId: this.sandBoxGridRowData.SBInvoiceId,
      ...(this.sorting ? { OrderBy: this.sorting, SortOrder: this.sortingType } : {}),
      // ...(this.headerCheckboxData ? { GetAll: this.headerCheckboxData } : {}),
    };


    if (this.field == 'MainAccountNumber') {
      passInv['mainAccountNumber'] = this.parentRowData.MainAccountNumber;
      passInv['InventorySelectionType'] = 'MainAccountNumber';
    } else if (this.field == 'SubAccountNumber') {
      passInv['subAccountNumber'] = this.parentRowData.SubAccountNumber;
      passInv['InventorySelectionType'] = 'SubAccountNumber';
    } else if (this.field == 'BillingId') {
      passInv['inventoryId'] = this.parentRowData?.InventoryId;
      passInv['InventorySelectionType'] = 'BillingID';
    }

    this.finalAllDetailArr = passInv;
    this._unsubscribeGRid.next(null);

    // Clear files if needed
    if (allOptionsClear) {
      this.files = [];
    }

    this.sandBoxService.vpaBySBInvoiceInventory(passInv)

      .pipe(takeUntil(this._unsubscribeGRid))
      .subscribe(
        response => this.handleResponse(response, allOptionsClear, fromHeaderCheckBox),
        () => this.handleError()
      );
    // }
  }

  handleError() {
    this.loading = false;
    this.files = [];
  }

  // Handle the response for loadNodes
  handleResponse(response: Object, allOptionsClear: boolean, fromHeaderCheckBox: boolean) {
    this.loading = false;
    this.totalRecords = (response as any).TotalCount;

    if ((response as any)?.Data?.$values?.length) {
      const resData = (response as any).Data.$values.map(this.extractDataAndLeaf.bind(this));
      
      // If clearing all options, replace the files array
      if (allOptionsClear) {
        this.files = resData;
      } else {
        // Otherwise append to existing files
        this.files = [...this.files, ...resData];
      }
      
      // Handle header checkbox selection more efficiently
      if (this.headerCheckboxData && fromHeaderCheckBox) {
        // Create a new array reference to avoid memory issues
        this.selectedCodeRow = [...this.files];
      }
      
    } else {
      this.files = [];
    }

    this.isApiAlerdayCall = false;
  }

  onFilterChangedFirst(value: any, col: any) {
    if (value == '') {
      this.displayModal1 = false;
    } else {
      this.displayModal1 = true;
    }
  }

  onHeaderCheckboxChange(e: { target: { checked: boolean; }; }) {
    this.headerCheckboxData = e.target.checked;
    if (this.headerCheckboxData) {
      // Instead of directly assigning files, we'll load them in chunks
      // this.loadNodes(this.pTableContain, true, true);
      this.selectedCodeRow = [...this.files];
    } else {
      // When unchecking, clear the selection
      this.selectedCodeRow = [];
    }
  }


  extractDataAndLeaf = (item: { HasParent: any; }) => {
    return {
      data: this.extractData(item),
      leaf: !item.HasParent,
    };
  }

  extractData(item: { [x: string]: any; }) {
    const fields = Object.keys(item);

    return fields.reduce((acc: any, field: any) => {
      acc[field] = item[field];
      return acc;
    }, {});
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

  refresh() {
    this.disableRefres = true;
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

    this.sandBoxService.refreshButton(this.sandBoxGridRowData.SBInvoiceId, {}).subscribe((res: any) => {
      this.dialogRef.close();
      if (res.Success) {
        this.disableRefres = false;
        // let errorData: any = {
        //   messgeType: "error",
        //   title: "Attention",
        //   titleClass: "text-c-blue",
        //   icon: "fas fa-exclamation-triangle",
        //   iconClass: "text-c-blue f-70",
        //   message: res.Message
        // }
        // const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
        // dialogRef.afterClosed().subscribe(result => {
        // });
        // this.getvpaBySBInvoiceInventory();
        this.loadNodes(this.pTableContain, true);

      } else {
        this.disableRefres = false;
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
    });
  }

  rerun() {
    this.disableRefres = true;
    let errorData: any = {
      messgeType: "error",
      title: "Please wait",
      titleClass: "text-c-blue",
      icon: "fas fa-exclamation-circle",
      iconClass: "text-c-blue f-70",
      message: 'Good things take time. Great things take another query.',
      hideOkbtn: true
    };
    this.dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });

    const data = {
      isCheckAll: true
    }

    this.sandBoxService.refreshButton(this.sandBoxGridRowData.SBInvoiceId, data).subscribe((res: any) => {
      this.dialogRef.close();
      if (res.Success) {
        this.disableRefres = false;
        // let errorData: any = {
        //   messgeType: "error",
        //   title: "Attention",
        //   titleClass: "text-c-blue",
        //   icon: "fas fa-exclamation-triangle",
        //   iconClass: "text-c-blue f-70",
        //   message: res.Message
        // }
        // const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
        // dialogRef.afterClosed().subscribe(result => {
        // });
        // this.getvpaBySBInvoiceInventory();
        this.loadNodes(this.pTableContain, true);

      } else {
        this.disableRefres = false;
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
    });
  }

  filterOutSide(e: string | number | Date, col: { type: any; }, i: any) {

    if (col.type === "dateFilter") {
      if (e) {
        const date = new Date(e);
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        this.textboxValue1 = date.toISOString().split('T')[0];
      } else {
        this.textboxValue1 = '';
        if (col.type === 'numberFilter') {
          if (!this.validateNumberInput((e as any).target.value, true)) {
            return
          }
        }
      }
    } else {
      this.textboxValue1 = (e as any).target.value;
      if (col.type === 'numberFilter') {
        if (!this.validateNumberInput((e as any).target.value, true)) {
          return
        }
      }
    }
    this.fieldsName = col;
    this.model = { option: 'AND' };

     // Set correct filter options based on field type
     if (col.type === 'text') {
      this.countries = filterOptionsText();
    } else if (col.type === 'numberFilter') {
      this.countries = filterOptionsNumber();
    } else if (col.type === 'dateFilter') {
      this.countries = filterOptionsDate();
    }

    this.selectedOption1 = this.selectedOption2 = this.countries[0].name,
      this.textboxValue2 = null,
      this.onFilterChangedValue();

  }

  validateNumberInput(value: string, allowNegative: boolean): boolean {
    if (value === "") {
      return true;
    }
    const onlyNumberRegex = /^[0-9]*\.?[0-9]*$/;
    const onlyNumberWithNegativeRegex = /^-?[0-9]+(\.[0-9]*)?$/;
    const regex = allowNegative ? onlyNumberWithNegativeRegex : onlyNumberRegex;
    return regex.test(value);
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

  selectChildCheckbox() {
    if (this.selectedCodeRow.length === this.files.length) {
      this.headerCheckboxData = true;
    } else {
      this.headerCheckboxData = false;
    }

  }

  redirectProduct() {
    const rowSelectData = this.selectedCodeRow.map((item: { data: any; }) => ({ ...item.data }));
    // const allSameInventoryId = rowSelectData.every((item:any) => item.InventoryId === rowSelectData[0]['InventoryId']);
    
    let allSameInventoryId;
    
    if (this.headerCheckboxData) {
      allSameInventoryId = !this.files[0].data.IsMultipleInventoryId;
    } else {
      allSameInventoryId = rowSelectData.every((item:any) => item.InventoryId === rowSelectData[0]['InventoryId']);
    }
    if (rowSelectData.length > 1 && !allSameInventoryId) {
      let errorData: any = {
        messgeType: "error",
        title: "Attention",
        titleClass: "text-c-blue",
        icon: "fas fa-question-circle",
        iconClass: "text-c-blue f-70",
        message: "<p><b>Confirm Billing ID Relationship</b><br>You've selected multiple Billing IDs. Adding these to a single Vendor Product will establish a <b>parent-child hierarchy</b> between them.<br> Proceed with this configuration?</p>",
        closeBtnName : 'Please proceed',
        okBtnName: 'Close & review',
        innerHtml: true
      }
      const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData, width: '700px' });
      dialogRef.afterClosed().subscribe(result => {
        if (!result) {
          this.redirecProductFn();
        }
      });
    } else {
      this.redirecProductFn();
    }
  }

  redirecProductFn() {
    const rowSelectData = this.selectedCodeRow.map((item: { data: any; }) => ({ ...item.data }));

    let data1 = _.map(rowSelectData, (e: any) => { return e.VendorProductTypeId });
    data1 = _.filter(data1, id => id !== null);
    let c = _.sortedUniq(data1); // vendor product
 
    if (rowSelectData.length > 0) {
      if(c.length !== 1 && c.length !== 0) {
        let errorData: any = {
          messgeType: "error",
          title: "Attention",
          titleClass: "text-c-blue",
          icon: "fas fa-question-circle",
          iconClass: "text-c-blue f-70",
          okBtnName: 'Close & Review',
          closeBtnName: 'Proceed to allow correction',
          message: 'You have selected multiple inventory items associated with distinct Vendor Products to correct the assignment of at least 1 Vendor Product. Merging these items will consolidate them under a single Vendor Product. If multiple Billing IDs are included in the selection, the system will automatically establish hierarchical parent-child relationships between the Billing IDs to preserve billing structure and historical alignment.'
        }
        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData, width: '700px' });
        dialogRef.afterClosed().subscribe(result => {
          if(!result) {
            this.onCellClicked.emit({ rowData: rowSelectData, index: 2, payloadData: this.finalAllDetailArr, headerCheckboxData: this.headerCheckboxData })
          }
        });
        return
      } else {
        this.onCellClicked.emit({ rowData: rowSelectData, index: 2, payloadData: this.finalAllDetailArr, headerCheckboxData: this.headerCheckboxData })
      }
    } else {
    }
  }

  removeAcc() {

    const rowSelectData = this.selectedCodeRow.map((item: { data: any; }) => ({ ...item.data }));
    const allSameInventoryId = rowSelectData.every((item:any) => item.InventoryId === rowSelectData[0]['InventoryId']);

    if (rowSelectData.length > 1 && !allSameInventoryId) {
      let errorData: any = {
        messgeType: "error",
        title: "Attention",
        titleClass: "text-c-blue",
        icon: "fas fa-question-circle",
        iconClass: "text-c-blue f-70",
        message: "<p><b>Confirm Billing ID Relationship</b><br>You've selected multiple Billing IDs. Adding these to a single Vendor Product will establish a <b>parent-child hierarchy</b> between them.<br> Proceed with this configuration?</p>",
        closeBtnName : 'Please proceed',
        okBtnName: 'Close & review',
        innerHtml: true
      }
      const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData, width: '700px' });
      dialogRef.afterClosed().subscribe(result => {
        if (!result) {
          this.removeAccFn();
        }
      });
    } else {
      this.removeAccFn();
    }
  }

  removeAccFn() {
    const rowSelectData = this.selectedCodeRow.map((item: { data: any; }) => ({ ...item.data }));   
    if (rowSelectData.length > 0) {
    //  if (d.length !== 1) {
    //     let errorData: any = {
    //       messgeType: "error",
    //       title: "Attention",
    //       titleClass: "text-c-blue",
    //       icon: "fas fa-exclamation-circle",
    //       iconClass: "text-c-blue f-70",
    //       message: 'Vendor Product are created by VBA. Please ensure your selection of Charge Codes only 1 VBA.'
    //     }
    //     const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData, width: '400px' });
    //     dialogRef.afterClosed().subscribe(result => {
    //     });
    //     return
    //   } else {
        this.onCellClicked.emit({ rowData: rowSelectData, index: 3, payloadData: this.finalAllDetailArr, headerCheckboxData: this.headerCheckboxData })
      // }
    }
  }

  addChargeCodeDialog(data: any) {
    const dialogRef = this.dialog.open(VenderProductDialogComponent, {
      data: {
        rowData: data
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      // this.getBlankAssignment();
    })
  }

  onCellClicked1(data: { colDef: { field: string; }; data: any; }) {
    if (data.colDef.field == "ChargeCodeName") {
      this.addChargeCodeDialog(data.data)
    }
  }


  ngOnDestroy() {
    this._unsubscribeGRid.next(null)
    this._unsubscribeGRid.complete()
  }

  currencyFormatter(currency: number | null, sign: string) {
    if (currency !== null) {
      var sansDec = currency.toFixed(2);
      return sign + `${sansDec.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
    } else {
      return '';
    }
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
}
