import { Component, EventEmitter, HostListener, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as _ from 'lodash';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ReconVpSelectOnlyOneComponent } from '../recon-vp-select-only-one/recon-vp-select-only-one.component';
import { ReconService } from 'src/app/services/recon.service';
import { extractDataAndLeaf, filterOptionsDate, filterOptionsNumber, filterOptionsText, onChangeEndDate } from 'src/app/services/common-p-table';
import { LocationService } from 'src/app/services/location.service';
import { WirelineService } from 'src/app/services/wireline.service';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
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
  selector: 'app-inventory-assignment-p-table',
  templateUrl: './inventory-assignment-p-table.component.html',
  styleUrls: ['./inventory-assignment-p-table.component.scss'],
  providers: [ReconService],
  imports: [SharedModule, PrimgModule, ]
})
export class InventoryAssignmentPTableComponent implements OnInit {


  @Input() selectedTem: any;
  @Input() selectedCustomer: any;
  @Input() fromWhichPage: any;
  @Input() payableNumber: any;
  @Input() title: any;
  @Input() summaryData: any;
  @Input() selected: any;
  @Input() isShowNext: any;
  selectedNodes: any = [];
  services: any;
  @Output() isBillingAccountExist: EventEmitter<any> = new EventEmitter();
  @Output() exportAccountData: EventEmitter<any> = new EventEmitter();
  @Output() selectedChildrenOfStep1Emit: EventEmitter<any> = new EventEmitter();
  @Output() nextEmit: EventEmitter<any> = new EventEmitter();

  sidebarVisible: boolean = false;

  files: TreeNode[];
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

  selectedOption: any;
  contextMenuPosition: { x: number; y: number } = { x: 0, y: 0 };
  fieldsName: any;
  sorting: any;
  sortingType: any;
  expandedNode: TreeNode | null = null;
  lastNode: TreeNode | null = null;

  countries = filterOptionsText();

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

  pTableContain = { first: 1 };
  finalFilterdArr: any;
  innerLoading = false;
  @ViewChild('treeTable') treeTable!: any;
  @ViewChild('contextMenu') contextMenu: any;
  selectedNode: any;
  public exportAccounts: any;
  selectedRow: any = [];

  @ViewChild('reconTooltip') reconTooltip!: TemplateRef<any>;
  headerCheckboxData = false;
  @HostListener('document:click', ['$event']) onClick(event: Event) {
    const clickedInsideMenu = this.contextMenu.el.nativeElement.contains(event.target);
    if (!clickedInsideMenu) {
      this.contextMenu.hide();
    }
  }

  constructor(public locationService: LocationService, public wirelineService: WirelineService,
    private router: Router, private reconService: ReconService, public dialog: MatDialog
  ) {
  }

  onHeaderCheckboxChange(e: any) {
    this.headerCheckboxData = e.target.checked;
    if (this.headerCheckboxData) {
      // this.loadNodes(this.pTableContain, true, true);
    }
    if (this.files.length > 0 && this.headerCheckboxData) {
      this.selectedNodes = this.files;
      this.selectedRow = this.files.map(x => x.data);
    }
    if (!this.headerCheckboxData) {
      this.selectedNodes = [];
      this.selectedRow = [];
    }

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
    const createColumn = ({
      parent = 0,
      width = '',
      isChildren = false,
      type = 'text',
      header = '',
      field = '',
      childHeader = '',
      columnGroupShow = 'close',
      colspan = 1,
      isicon = 1,
      parentWidth = 150,
      isParentVisible = true,
      displayCheckboxColumns = true,
      isToggle = true,
      sticky = false
    }) => ({
      parent,
      isicon,
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
      isToggle,
      sticky
    });


    this.cols = [
      createColumn({ parent: 1, width: '60px', isChildren: true, field: 'checkbox' }),

      createColumn({ parent: 2, width: '200px', isChildren: true, header: 'Inventory', field: 'ServiceNumber', childHeader: 'Service Number' }),
      // createColumn({ parent: 2, width: '200px', isChildren: true, header: 'Inventory', field: 'ServiceNumber', childHeader: 'Service Number', sticky: true }),

      createColumn({ parent: 3, width: '230px', isChildren: true, header: 'Organization', field: 'CustomerAccountName', childHeader: 'Customer' }),
      createColumn({ parent: 3, width: '210px', isChildren: false, field: 'TEMAccountName', childHeader: 'TEM', columnGroupShow: 'open' }),

      createColumn({ parent: 4, width: '150px', isChildren: true, header: 'Vendor', field: 'VendorAccountName', childHeader: 'Vendor' }),

      createColumn({ parent: 5, width: '180px', isChildren: true, header: 'Product', field: 'VendorProductName', childHeader: 'Vendor Product' }),

      createColumn({ parent: 6, width: '190px', isChildren: true, header: 'Assignment Info', field: 'ChargeDetailAddress1', childHeader: 'Address on Invoice' }),
      createColumn({ parent: 6, width: '200px', isChildren: false, field: 'UserName', childHeader: 'Name on Invoice' }),
      createColumn({ parent: 6, width: '200px', isChildren: false, field: 'UserEmail', childHeader: 'Email on Invoice' }),

      createColumn({ parent: 7, width: '170px', isChildren: true, header: 'Account', field: 'MainAccountNumber', childHeader: 'Main Account Number' }),
      createColumn({ parent: 7, width: '200px', isChildren: false, field: 'SubAccountNumber', childHeader: 'Sub Account Number', columnGroupShow: 'open' }),
      createColumn({ parent: 7, width: '200px', isChildren: false, field: 'PayableAccount', childHeader: 'Payable Account Number', columnGroupShow: 'open' })

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
    this.sidebarVisible = !this.sidebarVisible;
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
    this._unsubscribeGRid.next(null);
    this._unsubscribeGRid.complete();
    this._unsubscribeService.next(null);
    this._unsubscribeService.complete();
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

  
  selectChildCheckbox() {

    if (this.selectedNodes.length === this.files.length) {
      this.headerCheckboxData = true;
    } else {
      this.headerCheckboxData = false;
    }

  }

  loadNodes(event: any, allOptionsClear = false, fromHeaderCheckBox = false) {
    this.loading = true;

    this.isApiAlerdayCall = true;
    this.pTableContain.first = this.pTableContain?.first || 1;
    if (allOptionsClear) {
      this.pTableContain.first = 1;
    }

    if (!this.finalFilterdArr) {
      this.finalFilterdArr = {};
    }

    if (!Array.isArray(this.finalFilterdArr['advanceFilter'])) {
      this.finalFilterdArr['advanceFilter'] = [];
    }

    this.finalFilterdArr['advanceFilter'] = Array.from(
      new Map(this.finalFilterdArr['advanceFilter'].map((item: any) => [JSON.stringify(item), item])).values()
    );


    const data = {
      ...this.finalFilterdArr,
      startRowIndex: this.pTableContain.first,
      maximumRows: 100,
      ...(this.summaryData && this.summaryData.InvoiceId ? { InvoiceId: this.summaryData.InvoiceId } : {}),
      ...(this.selectedTem && this.selectedTem !== 'all' ? { TEMAccountId: this.selectedTem } : {}),
      ...(this.selectedCustomer && this.selectedCustomer !== 'all' ? { customerAccountId: this.selectedCustomer } : {}),
      ...(this.sorting ? { OrderBy: this.sorting, SortOrder: this.sortingType } : {}),
      // ...(this.headerCheckboxData ? { GetAll: this.headerCheckboxData } : {}),
    };


    this.finalAllDetailArr = data;
    this._unsubscribeGRid.next(null);
    if (allOptionsClear) this.files = [];
    this.reconService.getReconGrid(data)
      .pipe(takeUntil(this._unsubscribeGRid))
      .subscribe(
        response => this.handleResponse(response, allOptionsClear, fromHeaderCheckBox),
        () => this.handleError()
      );
    // }
  }

  handleResponse(response: any, allOptionsClear: any, fromHeaderCheckBox: any) {
    this.loading = false;
    this.totalRecords = response.TotalCount;

    if (response?.Data?.$values?.length) {
      const resData = response.Data.$values.map(extractDataAndLeaf.bind(this));
      this.files = allOptionsClear ? resData : [...this.files, ...resData];

      if (this.files.length > 0 && !fromHeaderCheckBox) {
        this.selectChildCheckbox();
      }
      if (this.headerCheckboxData) {
        this.selectedNodes = this.files;
        this.onSelectionChange(this.selectedNodes);
      }

      this.isApiAlerdayCall = false;

    } else {
      this.files = [];
      this.isApiAlerdayCall = false;
    }

    this.files.length > 0 ? this.isBillingAccountExist.emit(true) : this.isBillingAccountExist.emit(false);
  }

  // Extract data and leaf status

  // Handle error case
  handleError() {
    this.loading = false;
    this.files = [];
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
      ...(this.finalFilterdArr === undefined ? {} : this.finalFilterdArr),
      ...(this.selectedTem && this.selectedTem !== 'all' ? { TEMAccountId: this.selectedTem } : {}),
      ...(this.sorting ? { OrderBy: this.sorting, SortOrder: this.sortingType } : {}),
      ...(this.selectedCustomer && this.selectedCustomer !== 'all' ? { customerAccountId: this.selectedCustomer } : {}),
      ...(this.headerCheckboxData ? { GetAll: this.headerCheckboxData } : {}),
    };

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

  validateNumberInput(value: string, allowNegative: boolean): boolean {
    if (value === "") {
      return true;
    }
    const onlyNumberRegex = /^[0-9]*\.?[0-9]*$/;
    const onlyNumberWithNegativeRegex = /^-?[0-9]+(\.[0-9]*)?$/;
    const regex = allowNegative ? onlyNumberWithNegativeRegex : onlyNumberRegex;
    return regex.test(value);
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

  openDialog(): void {
    const dialogRef = this.dialog.open(this.reconTooltip, {
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
    return
  }

  next() {
    this.nextEmit.emit(true);
  }


  onSelectionChange(e: any) {
    this.selectedNodes = e;
    this.selectedRow = this.selectedNodes.map((k: any) => {
      return k['data'];
    });
  }

  redirectTab() {    
    const customerId = this.selectedRow[0]?.CustomerAccountId;

    let isPeople = false;
    let isLocation = false;
    let data1 = false;

    if (this.headerCheckboxData) {
      this.files[0].data.AllReconAssigments == 'People' ? isPeople = true : this.files[0].data.AllReconAssigments == 'Locations' ? isLocation = true : '';
      data1 = this.files[0].data.IsMultipleCustomer ? false : true;
    } else {
      isPeople = this.selectedRow.every((x: any) => x?.ReconAssigments == 'People');
      isLocation = this.selectedRow.every((x: any) => x?.ReconAssigments == 'Locations');
      data1 = this.selectedRow.every((x: any) => x?.CustomerAccountId === customerId);
    }
    if (!data1) {
      this.ErrorWarningPopupOpen('Please select records from within a single customer.');
      return
    }
    if (this.selectedRow?.length > 1) {
      if (isPeople || isLocation) {
        if (isPeople) {
          this.selectedChildrenOfStep1Emit.emit({ selectedRow: this.selectedRow, index: 2, isSelectAll: this.headerCheckboxData ? {value:true, data: this.finalAllDetailArr} : {value:false} });
        } else if (isLocation) {
          this.selectedChildrenOfStep1Emit.emit({ selectedRow: this.selectedRow, index: 1, isSelectAll: this.headerCheckboxData ? {value:true, data: this.finalAllDetailArr} : {value:false } });
        }
      } else {
        let errorData: any = {
          messgeType: 'error',
          title: 'Attention',
          titleClass: 'text-c-blue',
          icon: 'fas fa-question-circle',
          iconClass: 'text-c-blue f-70',
          message: 'The Default Inventory Assignment on these inventory items is different and we are unable to determine what action you want to take.  Please select the type of Assignment you would like to make 1st:  Locations or People.',
        };
        let srt = _.sortBy(this.selectedRow, 'VendorProductId');
        const dialogRef = this.dialog.open(ReconVpSelectOnlyOneComponent, {
          panelClass: 'error-warning',
          data: { errorData: errorData, selectedRow: srt }
        });
        dialogRef.afterClosed().subscribe((result) => {
          if (result == 'locations') {
            this.selectedChildrenOfStep1Emit.emit({ selectedRow: this.selectedRow, index: 1 });
          } else if (result == 'people') {
            this.selectedChildrenOfStep1Emit.emit({ selectedRow: this.selectedRow, index: 2 });
          }
        });
      }

    
    } else {
      if (isPeople) {
        this.selectedChildrenOfStep1Emit.emit({ selectedRow: this.selectedRow, index: 2, isSelectAll: this.headerCheckboxData ? {value:true, data: this.finalAllDetailArr} : {value:false} });
      }

      if (isLocation) {
        this.selectedChildrenOfStep1Emit.emit({ selectedRow: this.selectedRow, index: 1, isSelectAll: this.headerCheckboxData ? {value:true, data: this.finalAllDetailArr} : {value:false} });
      }
    }
  }

}
