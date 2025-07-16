import { Component, EventEmitter, HostListener, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import * as _ from 'lodash';
import { SortEvent, TreeNode } from 'primeng/api';
import { filterOptionsText, filterOptionsNumber, filterOptionsDate, onChangeEndDate } from 'src/app/services/common-p-table';
import { checkIsValueExists } from 'src/app/services/helper';
import { SandBoxService } from 'src/app/services/sandbox.service';
import { WirelineService } from 'src/app/services/wireline.service';
import { createColumn } from 'src/app/utils/column-utils';
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
  selector: 'app-final-publish',
  templateUrl: './final-publish.component.html',
  styleUrls: ['./final-publish.component.scss'],
  imports: [SharedModule, PrimgModule],
  providers: [WirelineService, SandBoxService]
})
export class FinalPublishComponent implements OnInit {


  exportAccounts: any;
 
  selectedRecords: any[] = [];
  selectedRow: any[] = [];
  
  @Input() inventoryData: any;
  @Input() sandBoxGridRowData: any;
  @Input() recordPublishedOrCompleted: any;
  @Input() overviewData: any;
 
  @ViewChild('tooltipText') tooltipText!: TemplateRef<any>;
  @ViewChild('tooltipTexttop') tooltipTexttop: TemplateRef<any>;

  @Output() exportAccountData: EventEmitter<any> = new EventEmitter();
  @Output() moveToStep6: EventEmitter<any> = new EventEmitter();
  @Output() moveToStep4: EventEmitter<any> = new EventEmitter();
  @Output() moveToPublish: EventEmitter<any> = new EventEmitter();

  sidebarVisible: boolean = false;
  saveButtonLoader: boolean = false;

  files: any[];
  TotalCount = 0;

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
  isDisabledExport = false;

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

  sortField: string = '';
  sortOrder: number = 1;

  selectedFiles!: any[];

  filesColumns: any = []

  selectedOption1: any = '';
  selectedOption2: any = '';

  textboxValue1: any = '';
  textboxValue2: any = '';

  textboxValue1_1: any = '';
  textboxValue2_1: any = '';

  radiobutton: any = '';
  finalAllDetailArr: any;

  private _unsubscribeGRid: Subject<any> = new Subject<any>();

  public getDataPath: any = (data: any) => data.dataPath;

  pTableContain = { first: 1 };
  finalFilterdArr: any;
  innerLoading = false;
  @ViewChild('treeTable') treeTable!: any;
  @ViewChild('contextMenu') contextMenu: any;
  selectedNode: any;

  @HostListener('document:click', ['$event']) onClick(event: Event) {
    const clickedInsideMenu = this.contextMenu?.el?.nativeElement.contains(event.target);
    if (!clickedInsideMenu) {
      this.contextMenu.hide();
    }
  }

  constructor(public dialog: MatDialog, private fb: FormBuilder,
    private sandboxService: SandBoxService,
    private wirelineService: WirelineService) {
   
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
 


    this.loadNodes(this.pTableContain, true);

  }

  ngOnDestroy() {

    this._unsubscribeGRid.next(null);
    this._unsubscribeGRid.complete();
  }


  /* p-table start */
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
      // Parent Group
      createColumn(1, '90px', true, 'checkbox', '', 'checkbox', ''),

      createColumn(2, '200px', true, 'text', 'Account', 'MainAccountNumber', 'Main Account Number'),
      createColumn(2, '200px', false, 'text', '', 'Subaccount', 'Sub Account Number', 'open'),
      createColumn(2, '100px', false, 'text', '', 'BillingAccountStatus', 'Status', 'open'),

      createColumn(3, '165px', true, 'text', 'Inventory', 'ParentBillingId', 'Primary Billing ID'),
      createColumn(3, '120px', false, 'text', '', 'BillingId', 'Billing ID','close'),
      createColumn(3, '165px', false, 'text', '', 'InventoryStatusDisplayText', 'Inventory Status', 'open'),
      createColumn(3, '140px', false, 'text', '', 'AccrossInventoryDisplay', 'ID Added ?', 'open'),

      createColumn(4, '170px', true, 'text', 'Product', 'VendorProductName', 'Vendor Product'),
      createColumn(4, '120px', false, 'text', '', 'ServiceName', 'Service', 'open'),
      createColumn(4, '130px', false, 'text', '', 'ServiceTypeName', 'Service Type', 'open'),
      createColumn(4, '120px', false, 'text', '', 'ProductName', 'Product', 'open'),
      createColumn(4, '130px', false, 'text', '', 'ProductTypeName', 'Product Type', 'open'),
      createColumn(4, '120px', false, 'text', '', 'IndustryName', 'Industry', 'open'),

      createColumn(5, '170px', true, 'text', 'Charge Code', 'ChargeCodeName', 'Charge Code Name'),
      createColumn(5, '120px', false, 'text', '', 'ChargeCode', 'Charge Code', 'open'),
      createColumn(5, '150px', false, 'text', '', 'ChargeCodeTypeName', 'Charge Code Type', 'open'),
      createColumn(5, '120px', false, 'text', '', 'ChargeTypeName', 'Charge Type', 'open'),
      createColumn(5, '180px', false, 'text', '', 'ChargeCodeOccurrence', 'Charge Occurrence', 'open'),

      createColumn(6, '189px', true, 'numberFilter', 'Current Invoice', 'TotalChargeDisplay', 'Current Product Total'),
      createColumn(6, '150px', false, 'numberFilter', '', 'ChargeDisplay', 'Current Charge', 'close'),
      createColumn(6, '170px', false, 'numberFilter', '', 'DistributionRuleId', 'Distribution Rule ID', 'open'),
      createColumn(6, '170px', false, 'text', '', 'ManualAddedChargesDisplay', 'Charge Correction', 'open'),

      createColumn(7, '189px', true, 'numberFilter', 'Previous Invoice', 'TotalPreChargeCodeChargeDisplay', 'Previous Product Total', 'close'),
      createColumn(7, '150px', false, 'numberFilter', '', 'PreChargeCodeChargeDisplay', 'Previous Charge', 'close'),
      createColumn(7, '182px', false, 'numberFilter', '', 'DistributionRuleId', 'Distribution Rule ID', 'open'),
      createColumn(7, '170px', false, 'text', '', 'PreManualAddedChargesDisplay', 'Charge Correction', 'open'),

      createColumn(8, '150px', true, 'numberFilter', 'Difference', 'ProductDiffPerDisplay', 'Product Diff %', 'close'),
      createColumn(8, '150px', false, 'numberFilter', '', 'ProductDiffDisplay', 'Product Diff $', 'close'),
      createColumn(8, '182px', false, 'numberFilter', '', 'ChargeCodeDiffPerDisplay', 'Charge Code Diff %', 'close'),
      createColumn(8, '170px', false, 'numberFilter', '', 'ChargeCodeDiffDisplay', 'Charge Code Diff $', 'close'),
     
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

  specificDistribution() {
    let data = this.selectedRecords.map(item => item?.data);
    const result = data.map(item => ({
      inventoryId: item.InventoryId,
      status: true,
      chargeCodeId: item.ChargeCodeId,
      chargeCodeType: item.ChargeCodeTypeName == 'Product' || item.ChargeCodeTypeName == 'Feature' || item.ChargeCodeTypeName == 'Usage' || item.ChargeCodeTypeName == 'Equipment' ? true : null,
      VendorProductInventoryId : item.VendorProductInventoryId
    }));

    // Check if any ChargeCodeType is Product, Feature, Usage, or Equipment
    const hasSpecificChargeCodeType = data.some(item => 
      item.ChargeCodeTypeName === 'Product' || 
      item.ChargeCodeTypeName === 'Feature' || 
      item.ChargeCodeTypeName === 'Usage' || 
      item.ChargeCodeTypeName === 'Equipment'
    );

    this.sandboxService.specificDistribution(this.sandBoxGridRowData.SBInvoiceId, result).subscribe((res: any) => {
      if(res.Success){
        this.sandboxService.getInvoiceStep(this.sandBoxGridRowData.SBInvoiceId, true).subscribe(()=> {
        });
        
        // Navigate to step 4 if any ChargeCodeType matches the criteria, otherwise go to step 6
        if (hasSpecificChargeCodeType) {
          this.moveToStep4.emit(data);
        } else {
          this.moveToStep6.emit(data);
        }
      }
    });
  }

  approve(){
    this.saveButtonLoader = true;
    if(this.overviewData.IsApproved){
      this.moveToPublish.emit(true)
    } else {
      this.sandboxService.approveInvoice(this.sandBoxGridRowData.SBInvoiceId).subscribe((res: any) => {
        this.saveButtonLoader = false;
        if(res.Success){
          this.moveToPublish.emit(true)
        }
      });
    }
  }
  
  isRowDisabled(rowData: any) {
    return rowData?.node?.data?.IsRequired == true || checkIsValueExists(rowData?.node?.data?.DistributionRuleId);
  }

  selectChildCheckbox() {
   const data = this.selectedRecords.map(item => {
    const a: any = {};
    a['VendorProductInventoryId'] = item.data.VendorProductInventoryId;
    a['ChargeCodeId'] = item.data.ChargeCodeId;
    a['InventoryId'] = item.data.InventoryId;
    return a;
   });

    this.selectedRow.push(...data);
    this.selectedRow = _.uniqBy(this.selectedRow, item => 
      `${item.VendorProductInventoryId}_${item.ChargeCodeId}_${item.InventoryId}`
    );

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

  loadNodes(event?: any, allOptionsClear = false, initCall = false, productId?: any) {

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

    const payLoad = {
      ...this.finalFilterdArr,
      startRowIndex: this.pTableContain.first,
      maximumRows: 100,
      IsTotalNeed: true,
      ...(this.sandBoxGridRowData?.SBInvoiceId ? { sbInvoiceId: this.sandBoxGridRowData.SBInvoiceId } : {}),
      ...(this.sorting ? { OrderBy: this.sorting  == 'TotalChargeDisplay' ? 'TotalCharge' : this.sorting == 'TotalPreChargeCodeChargeDisplay' ? 'TotalPreChargeCodeCharge' : this.sorting == 'ProductDiffPerDisplay' ? 'ProductDiffPer' : this.sorting == 'ProductDiffDisplay' ? 'ProductDiff' : this.sorting == 'ChargeCodeDiffPerDisplay' ? 'ChargeCodeDiffPer' : this.sorting == 'ChargeCodeDiffDisplay' ? 'ChargeCodeDiff' : this.sorting == 'PreChargeCodeChargeDisplay' ? 'PreChargeCodeCharge' : this.sorting == 'ChargeDisplay' ? 'Charge' : this.sorting == 'ManualAddedChargesDisplay' ? 'ManualAddedCharges' : this.sorting , SortOrder: this.sortingType } : {}),
    };
    this.finalAllDetailArr = payLoad;
    this._unsubscribeGRid.next(null);

    // Clear files if needed
    if (allOptionsClear) this.files = [];

    this.wirelineService.getSandboxSummryBillingNew(payLoad)
      .pipe(takeUntil(this._unsubscribeGRid))
      .subscribe(
        response => this.handleResponse(response, allOptionsClear, initCall),
        () => this.handleError()
      );
  }

  onBtnExportDataAsExcel() {

    this.setColumnDefs();
    this.isDisabledExport = true;
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

  }

  // Handle the response for loadNode
  handleResponse(response: any, allOptionsClear: any, initCall: any) {
    this.loading = false;
    this.totalRecords = response.TotalCount;

    if (response?.Data?.$values?.length) {

      const resData = response.Data.$values.map(this.extractDataAndLeaf.bind(this));
      this.files = allOptionsClear ? resData : [...this.files, ...resData];

      this.selectedRecords = this.files.filter(item => item.selected);

      this.isApiAlerdayCall = false;
    } else {
      this.files = [];
      this.isApiAlerdayCall = false;
    }
  }

  // Extract data and leaf status

  extractDataAndLeaf = (item: any) => {
    return {
      data: this.extractData(item),
      leaf: !item.HasParent,
      selected: !!this.selectedRow.find(t => 
        t.VendorProductInventoryId === item.VendorProductInventoryId && 
        t.ChargeCodeId === item.ChargeCodeId && 
        t.InventoryId === item.InventoryId
      )
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

  setColumnDefs() {

    let headerData: any = [];
    let ChildHeaderData: any = [];
    let i = 0;
    let childIndex = 0;

    let headerDataSheet1: any = [];
    let ChildHeaderDataSheet1: any = [];
    let i1 = 0;
    let childIndex1 = 0;
  
    _.map(this.cols, (x: any) => {
      if(x.childHeader !== 'checkbox' && x.field !== 'checkbox'){
      if (x.isChildren) {
        i1 = i1 + 1;
        headerDataSheet1.push({
          "Position": i1,
          "Title": x.header
        });
      }
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
      if(x.childHeader !== 'checkbox' && x.field !== 'checkbox'){
      if (x.isChildren )  {
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
    }
    });

    this.exportAccounts = {
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
      ExportToExcelInMultipleSheet: true,
      ExportToExcel: true,
      IsTotalNeed: true,
      ...this.finalFilterdArr,
      ...(this.sorting ? { OrderBy: this.sorting, SortOrder: this.sortingType } : {}),
      sbInvoiceId: this.sandBoxGridRowData?.SBInvoiceId

    };
  }

  toggleColumn(index: number, columnGroupShow: string) {
    const closedColumns = this.colsshow.filter(item => item.parent === index && item.columnGroupShow === 'close');

    this.cols.forEach(item => {
      if (item.parent === index) {
        if (columnGroupShow === 'close') {
          item.isicon = 0;
        } else {
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



  sortFiles() {
    if (!this.sortField) return;

    this.files.sort((a, b) => {
      const valA = a.data[this.sortField];
      const valB = b.data[this.sortField];

      if (valA == null) return this.sortOrder * -1;
      if (valB == null) return this.sortOrder * 1;

      if (typeof valA === 'string') {
        return valA.localeCompare(valB) * this.sortOrder;
      }

      return (valA < valB ? -1 : valA > valB ? 1 : 0) * this.sortOrder;
    });
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
      filterOptionValue2: txtVal2 ? txtVal2 : null
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


  filerOutSide(e: any, col: any, i: any) {

    if (col.type === "dateFilter") {
      if (e) {
        const date = new Date(e);
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        this.textboxValue1 = date.toISOString().split('T')[0];
      } else {
        this.textboxValue1 = '';
        if (col.type == 'numberFilter') {
          if (!this.validateNumberInput(e.target.value, true)) {
            return
          }
        }
      }
    } else {
      this.textboxValue1 = e.target.value;
      if (col.type == 'numberFilter') {
        if (!this.validateNumberInput(e.target.value, true)) {
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
        if (!e.node.isparent && !item.isChildren && e.node.parentid === item.parent) {
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

  customSort(event: any) {
    const { field, order } = event;
    this.sortTree(this.files, field, order);
  }

  sortTree(nodes: TreeNode[], field: string, order: number) {
    nodes.sort((a, b) => {
      const val1 = a.data[field];
      const val2 = b.data[field];
      let res = 0;
      if (val1 == null) res = -1;
      else if (val2 == null) res = 1;
      else if (typeof val1 === 'string') res = val1.localeCompare(val2);
      else res = val1 < val2 ? -1 : val1 > val2 ? 1 : 0;
      return order * res;
    });

    for (let node of nodes) {
      if (node.children) {
        this.sortTree(node.children, field, order);
      }
    }
  }

}
