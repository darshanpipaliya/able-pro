import { Component, EventEmitter, HostListener, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as _ from 'lodash';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { extractDataAndLeaf, filterOptionsDate, filterOptionsNumber, filterOptionsText, onChangeEndDate } from 'src/app/services/common-p-table';
import { LocationService } from 'src/app/services/location.service';
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
  selector: 'app-p-treetable-people',
  templateUrl: './p-treetable-people.component.html',
  styleUrls: ['./p-treetable-people.component.scss'],
  imports: [SharedModule, PrimgModule]
})
export class PTreetablePeopleComponent implements OnInit {

  @Input() companyId: any;
  @Input() costCenterStructuresid: any;
  @Input() CustomerAccountId: any;
  @Input() existingPeople: any;
  @Input() action: any;
  @Input() fromPage: any;
  @Input() PeopleId: any;
  @Input() primaryPeopleId: any;

  serviceIds: any = [];
  services: any;
  @Output() isBillingAccountExist: EventEmitter<any> = new EventEmitter();
  @Output() exportAccountData: EventEmitter<any> = new EventEmitter();
  @Output() rowCellDoubleClicked: EventEmitter<any> = new EventEmitter();
  @Output() selectedRowsEmit: EventEmitter<any> = new EventEmitter();

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
  selectedRecords: any[] = [];
  headerCheckboxData = false;
  public selectedInventory: any;
  selectedRows: number = 0;
  @ViewChild('PeopleAssignment') PeopleAssignment!: TemplateRef<any>;
  @HostListener('document:click', ['$event']) onClick(event: Event) {
    const clickedInsideMenu = this.contextMenu?.el?.nativeElement.contains(event.target);
    if (!clickedInsideMenu) {
      this.contextMenu.hide();
    }
  }

  constructor(public locationService: LocationService, public wirelineService: WirelineService,
    private router: Router, public dialog: MatDialog
  ) {
  }

  onHeaderCheckboxChange(e: any) {
    this.headerCheckboxData = e.target.checked;
    if (this.headerCheckboxData) {
      this.loadNodes(this.pTableContain, true, true);
    }
    if (this.files.length > 0 && this.headerCheckboxData) {
      this.selectedRecords = this.files;
      const selectedInventory: any = [];
      this.selectedRecords.forEach((e: any) => {
        selectedInventory.push(e['data']['PeopleId'])
      });
      this.selectedInventory = selectedInventory;

    }
    if (!this.headerCheckboxData) {
      this.selectedRecords = [];
      this.selectedInventory = [];
    }

    let a = this.selectedRecords.map(item => item.data);
    this.selectedRowsEmit.emit(a);

  }

  selectChildCheckbox() {
    this.selectedRecords = [...new Map(this.selectedRecords.map(item => [item.data.PeopleId, item])).values()];
    let a = this.selectedRecords.map(item => item.data);
    this.selectedRowsEmit.emit(a);
    if (this.selectedRecords.length === this.files.length) {
      this.headerCheckboxData = true;
    } else {
      this.headerCheckboxData = false;
    }
  }


  onSelectionChanged(event: any) {
    this.selectedRows = event.length;
    const selectedInventory: any = [];

    event.forEach((e: any) => {
      selectedInventory.push(e.PeopleId)
    });
    this.selectedInventory = selectedInventory;
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
      createColumn(1, '50px', true, '', '', 'checkbox', ''),

      createColumn(2, '200px', true, 'text', 'Personal', 'PeopleName', 'Name'),
      createColumn(2, '200px', false, 'text', '', 'PeopleFirstName', 'First Name','open'),
      createColumn(2, '200px', false, 'text', '', 'PeopleLastName', 'Last Name','open'),
      createColumn(2, '200px', false, 'text', '', 'PeopleUserTitle', 'User Title','open'),
      createColumn(2, '200px', false, 'text', '', 'EmployeeId', 'Employee ID','open'),
      createColumn(2, '200px', false, 'text', '', 'Department', 'Department','open'),
      createColumn(2, '200px', false, 'text', '', 'PeopleCustomField1', 'Contact Custom 1','open'),
      createColumn(2, '200px', false, 'text', '', 'PeopleCustomField2', 'Contact Custom 2','open'),
      createColumn(2, '200px', false, 'text', '', 'PeopleCustomField3', 'Contact Custom 3','open'),
      createColumn(2, '200px', false, 'text', '', 'PeopleCustomField4', 'Contact Custom 4','open'),

      createColumn(3, '200px', true, 'text', 'Contact', 'PeopleEmail', 'Email'),
      createColumn(3, '200px', false, 'text', '', 'DeskPhone', 'Desk Phone','open'),
      createColumn(3, '200px', false, 'text', '', 'CellPhone', 'Cell Phone','open'),
      createColumn(3, '200px', false, 'text', '', 'CustomerContactType', 'Contact Type','open'),

      createColumn(4, '200px', true, 'text', 'Status', 'PeopleStatusDisplayValue', 'User Status'),
      createColumn(4, '200px', false, 'text', '', 'CustomerDisplayRole', 'Role'),

      createColumn(5, '200px', true, 'text', 'Location', 'PrimaryLocationDisplayValue', 'Location Name'),
      createColumn(5, '200px', false, 'text', '', 'LocationAddress1', 'Address One','open'),
      createColumn(5, '200px', false, 'text', '', 'LocationAddress2', 'Address Two','open'),
      createColumn(5, '200px', false, 'text', '', 'LocationCity', 'City','open'),
      createColumn(5, '200px', false, 'text', '', 'LocationStateName', 'State/Province','open'),
      createColumn(5, '200px', false, 'text', '', 'LocationPostalCode', 'Zip/Postal Code','open'),

      createColumn(6, '190px', true, 'text', 'Status', 'LocationStatusDisplayText', 'Location Status'),

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

  loadNodes(event?: any, allOptionsClear = false, fromHeaderCheckBox = false) {
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

    // if (!this.finalFilterdArr['advanceFilter'].length) {
    //   this.finalFilterdArr['advanceFilter'] = [{
    //     "filterKey": "PeopleStatusDisplayValue",
    //     "filterOptionType1": "equals",
    //     "filterOptionValue1": 'Active',
    //     "filterOperationType": "AND",
    //     "filterOptionType2": null,
    //     "filterOptionValue2": null
    //   }];
    // } else {
    //   this.finalFilterdArr['advanceFilter'].push({
    //     "filterKey": "PeopleStatusDisplayValue",
    //     "filterOptionType1": "equals",
    //     "filterOptionValue1": 'Active',
    //     "filterOperationType": "AND",
    //     "filterOptionType2": null,
    //     "filterOptionValue2": null
    //   });

    // }

    this.finalFilterdArr['advanceFilter'] = Array.from(
      new Map(this.finalFilterdArr['advanceFilter'].map((item: any) => [JSON.stringify(item), item])).values()
    );
    let data = {
      ...this.finalFilterdArr,
      startRowIndex: this.pTableContain.first,
      maximumRows: 100,
      ...(this.companyId && this.companyId !== 'all' ? { companyId: this.companyId } : {}),
      ...(this.CustomerAccountId && this.CustomerAccountId !== 'all' ? { CustomerAccountId: this.CustomerAccountId } : {}),
      ...(this.costCenterStructuresid && this.costCenterStructuresid ? { costCenterStructureId: this.costCenterStructuresid } : {}),
      ...(this.headerCheckboxData ? { GetAll: this.headerCheckboxData } : {}),
      ...(this.sorting ? { OrderBy: this.sorting, SortOrder: this.sortingType } : {}),
      ...(this.primaryPeopleId ? { PeopleId: this.primaryPeopleId } : {}),

    };

    if(this.action == 'add' && this.PeopleId) {
      data['PeopleId'] = this.PeopleId;
      data['ForPreSelect'] = true;
    }
    if (this.action === 'add' ) {
      delete data['costCenterStructureId'];
    }
    
    if(this.action == 'edit' && this.PeopleId) {
      data['PeopleId'] = this.PeopleId;
    }
    this.finalAllDetailArr = data;
    this._unsubscribeGRid.next(null);

    if (allOptionsClear) this.files = [];
    this.locationService.getPeopleList(data)
      .pipe(takeUntil(this._unsubscribeGRid))
      .subscribe(
        response => this.handleResponse(response, allOptionsClear, fromHeaderCheckBox),
        () => this.handleError()
      );
    // }
  }

  getCheckedNodes(nodes: any): TreeNode[] {
    let selected: any = [];
  
    for (const node of nodes) {
      // if (this.existingPeople?.some(r => r === node.data['PeopleId']) && node.data.IsSelected) {
      //   selected.push(node);
      // }
      if (node.data.IsSelected) {
        selected.push(node);
      }
    }

    return selected;
  }

  // Handle the response for 
  handleResponse(response: any, allOptionsClear: any, fromHeaderCheckBox = false) {
    this.loading = false;
    this.totalRecords = response.TotalCount;

    if (response.Data.$values?.length) {
      const resData = response.Data.$values.map(extractDataAndLeaf.bind(this));
      this.files = allOptionsClear ? resData : [...this.files, ...resData];

      if (this.files.length > 0 && !fromHeaderCheckBox) {
        this.selectedRecords = this.getCheckedNodes(this.files);
        this.selectChildCheckbox();
      }
      if (this.headerCheckboxData) {
        this.selectedRecords = this.files;
        const selectedInventory: any = [];
        this.selectedRecords.forEach((e: any) => {
          selectedInventory.push(e['data']['PeopleId'])
        });
        this.selectedInventory = selectedInventory;

        let a = this.selectedRecords.map(item => item.data);
        this.selectedRowsEmit.emit(a);
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
        "isCurrency": false
      });
    });


    this.exportAccounts = {
      ExportToExcelData: {
        HeaderData: headerData,
        ChildHeaderData: ChildHeaderData,
        fileName: "Inventory",
      },
      ExportToExcel: true,
      ...(this.companyId && this.companyId !== 'all' ? { companyId: this.companyId } : {}),
      ...(this.CustomerAccountId && this.CustomerAccountId !== 'all' ? { CustomerAccountId: this.CustomerAccountId } : {}),
      ...(this.costCenterStructuresid && this.costCenterStructuresid ? { costCenterStructuresid: this.costCenterStructuresid } : {}),
      ...(this.headerCheckboxData ? { GetAll: this.headerCheckboxData } : {}),
      ...(this.sorting ? { OrderBy: this.sorting, SortOrder: this.sortingType } : {}),
    };

    this.exportAccountData.emit(this.exportAccounts);
  }


  onRowDoubleClick(data: any) {
    let datas = {
      data: data
    }
    this.rowCellDoubleClicked.emit(datas);
  }

  toggleColumn(index: number, columnGroupShow: string) {
    const closedColumns = this.colsshow.filter(item => item.parent === index && item.columnGroupShow === 'close');

    this.cols.forEach((item: any) => {
      if (item.parent === index) {
        if (columnGroupShow === 'close') {
          item.isicon = 0;
        }
        else {
          item.isicon = 1;
        }
        const isHeaderClosed = closedColumns.some((closedItem: any) => closedItem.childHeader === item.childHeader);
        if (!isHeaderClosed && item.displayCheckboxColumns) {
          item.columnGroupShow = columnGroupShow;
        }
      }
    });

    if (!this.cols.some((it: any) => it.parent === index && it.columnGroupShow === 'close')) {
      let children = this.cols.filter((k: any) => k.parent === index && k.displayCheckboxColumns);
      if (children) {
        children[0].columnGroupShow = 'close';
      }
    }

    this.commonColumnsFn();
  }

  commonColumnsFn() {

    this.cols.forEach((col) => {
      if (col.isChildren) {

        const closedColumns = this.cols.filter((item: any) => item.parent === col.parent && item.columnGroupShow === 'close');
        col.colspan = closedColumns.length;
        if (this.cols.filter((item: any) => item.parent === col.parent && item.displayCheckboxColumns).length === 1 ||
          this.colsshow.filter((item: any) => item.parent === col.parent && item.columnGroupShow === 'open').length === 0) {
          col.isToggle = false;
        } else {
          col.isToggle = true;
        }

        if (this.cols.filter((item: any) => item.parent === col.parent && item.displayCheckboxColumns).length === 0) {
          col.isParentVisible = false;
        } else {
          col.isParentVisible = true;
        }

        col.Parentwidth = closedColumns.map((value) => parseInt(value.width.replace('px', ''))).reduce(
          (accumulator, currentValue) => accumulator + currentValue, 0) + 'px';
      }
    });
    this.displaycols = this.cols.filter((col: any) => col.columnGroupShow == 'close');
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
      this.cols.forEach((item: any) => {
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
    this.cols.forEach((item: any) => {
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

    this.cols.forEach((item: any) => {
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

  openDialog4(): void {
    this.dialog.open(this.PeopleAssignment, {
      width: '900px',
      data: {
        colseButton: true,
      }
    });
  }

}
