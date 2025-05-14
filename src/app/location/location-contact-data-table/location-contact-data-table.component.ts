import { Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import _ from 'lodash';
import { TreeNode } from 'primeng/api';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ContactTableComponent } from 'src/app/common/contact-table/contact-table.component';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { extractDataAndLeaf, filterOptionsDate, filterOptionsNumber, filterOptionsText, onChangeEndDate } from 'src/app/services/common-p-table';
import { isValuesUndefined, rolePermission } from 'src/app/services/helper';
import { LocationService } from 'src/app/services/location.service';
import { VariableManageService } from 'src/app/services/variable-manage.service';

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

interface ColumnDefinition {
  parent: number;
  isicon: number;
  width: string;
  valuesset: null;
  isenable: boolean;
  isChildren: boolean;
  type: string;
  header: string;
  columnGroupShow: string;
  field: string;
  childHeader: string;
  colspan: number;
  parentWidth: number;
  isParentVisible: boolean;
  displayCheckboxColumns: boolean;
  isToggle: boolean;
}

@Component({
  selector: 'app-location-contact-data-table',
  templateUrl: './location-contact-data-table.component.html',
  styleUrls: ['./location-contact-data-table.component.scss'],
  standalone: true,
  imports: [
    SharedModule,
    PrimgModule
  ]
})



export class LocationContactDataTableComponent implements OnInit {

  @Input() contactDataEmit: any;
  @Input() location: any;
  @Output() contactSave: EventEmitter<any> = new EventEmitter<any>();
  @Output() peopleEmit: EventEmitter<any> = new EventEmitter<any>();
  private _unsubscribeGetLocationDetail: Subject<any> = new Subject<any>();
  private _unsubscribeGRid: Subject<any> = new Subject<any>();

  columnDefs: any;

  rowData: any;
  companyDetailData: any;
  fixLocation = '';
  CompanyUser = false;
  isDisabledExport: boolean = false;;
  constructor(private locationService: LocationService, private variableManageService: VariableManageService, public dialog: MatDialog) { }

  ngOnInit(): void {
    this.CompanyUser = rolePermission(['CompanyUser']);
    this.peopleEmit.emit(true);

    this.variableManageService.getCallAPIForInventoryDta$.subscribe((res: any) => {
      if (res) {
        this.loadNodes(true);
      } else {
      }
    });

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

  onBtnExportDataAsExcelContact() {

    this.setColumnDefs();
    this.isDisabledExport = true;
    this.locationService
          .getLocationPeopleExport(this.contactDataEmit.Id, this.exportData)
      .subscribe({
        next: (data: any) => {
          this.isDisabledExport = false;
          let bolbUrl = URL.createObjectURL(data);
          var link = document.createElement("a");
          link.setAttribute("href", bolbUrl);
          link.setAttribute("download", "Locations People.xlsx");
          link.style.display = "none";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

        },
        error: (error: any) => {
          this.isDisabledExport = false;
        }
      });
  }

  async openContactGrid() {
    const dialogRef = this.dialog.open(ContactTableComponent, {
      panelClass: ['width-1100', 'location-contact-popup-c'],
      data: [this.contactDataEmit, this.contactDataEmit, this.fixLocation],
      disableClose: true,
      width: '1100px'
    });
    dialogRef.afterClosed().subscribe(async (result) => {
      if (!isValuesUndefined(result)) {

        this.companyDetailData = await this.getCompanyLocationDetail(this.contactDataEmit.Id);
      

        this.contactDataEmit = this.companyDetailData;
      }
    })
  }

  getCompanyLocationDetail(id :any) {
    const isPrime = new Promise<string>((res, rej) => {
      this._unsubscribeGetLocationDetail.next(null);
      this.locationService.getCompanyLocationDetail(id).pipe(takeUntil(this._unsubscribeGetLocationDetail))
        .toPromise()
        .then((data) => {
          if (data) {
            res(data.Data);
          } else {
            rej(data.Data);
          }
        });
    });

    return isPrime;
  }

  ngOnDestroy(): any {
    this._unsubscribeGRid.next(null);
    this._unsubscribeGRid.complete();
    this._unsubscribeService.next(null);
    this._unsubscribeService.complete();
    this._unsubscribeGetLocationDetail.next(null);
    this._unsubscribeGetLocationDetail.complete();
    this.peopleEmit.emit(false);
  }

  /* ========================================================== */

  selectedTem: any;

  services: any;
  @Output() tableDataExist: EventEmitter<any> = new EventEmitter();
  @Output() exportAccountData: EventEmitter<any> = new EventEmitter();
  @Output() selectedRowsEmit: EventEmitter<any> = new EventEmitter();
  @Output() rowCellDoubleClicked: EventEmitter<any> = new EventEmitter();

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

  private _unsubscribeService: Subject<any> = new Subject<any>();

  pTableContain = { first: 1 };
  finalFilterdArr: any;
  innerLoading = false;
  @ViewChild('treeTable') treeTable!: any;
  @ViewChild('contextMenu') contextMenu: any;
  selectedNode: any;
  public exportData: any;
  selectedRecords: any = [];
  headerCheckboxData = false;
  public selectedInventory: any;
  selectedRows: number = 0;

  @HostListener('document:click', ['$event']) onClick(event: Event) {
    const clickedInsideMenu = this.contextMenu?.el?.nativeElement.contains(event.target);
    if (!clickedInsideMenu) {
      this.contextMenu?.hide();
    }
  }

  onSelectionChanged(event: any[]) {
    this.selectedRows = event.length;
    const selectedInventory: any = [];

    event.forEach((e: { VendorProductInventoryId: any; }) => {
      selectedInventory.push(e.VendorProductInventoryId)
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
    const createColumn = (
      parent: number,
      width: string,
      isChildren: boolean,
      type: string,
      header: string,
      field: string,
      childHeader: string,
      columnGroupShow: string = 'close',
      colspan: number = 1,
      parentWidth: number = 150,
      isParentVisible: boolean = true,
      displayCheckboxColumns: boolean = true,
      isToggle: boolean = true
    ): ColumnDefinition => ({
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


    // Initialize parent counter
    let currentParent = 0;

    // Function to determine parent ID
    const getParentId = (isChild: boolean) => isChild ? ++currentParent : currentParent;

    this.cols = [
      // Checkbox column
      // createColumn(currentParent, '50px', false, 'checkbox', '', '', '', 'close', 1, 50, true, true, true),
    
      // Organization group
      createColumn(getParentId(true), '130px', true, 'text', 'Organization', 'CustomerAccountName', 'Customer'),
      createColumn(currentParent, '140px', false, 'text', '', 'CompanyName', 'Company', 'open'),
    
      // Personal group
      createColumn(getParentId(true), '120px', true, 'text', 'Personal', 'PeopleName', 'Name'),
      createColumn(currentParent, '120px', false, 'text', '', 'PeopleFirstName', 'First Name', 'open'),
      createColumn(currentParent, '120px', false, 'text', '', 'PeopleLastName', 'Last Name', 'open'),
      createColumn(currentParent, '130px', false, 'text', '', 'UserTitle', 'User Title', 'open'),
      createColumn(currentParent, '130px', false, 'text', '', 'EmployeeId', 'Employee Id', 'open'),
      createColumn(currentParent, '140px', false, 'text', '', 'Department', 'Department', 'open'),
      createColumn(currentParent, '150px', false, 'text', '', 'PeopleCustomField1', 'Contact Custom 1', 'open'),
      createColumn(currentParent, '140px', false, 'text', '', 'PeopleCustomField2', 'Contact Custom 2', 'open'),
      createColumn(currentParent, '140px', false, 'text', '', 'PeopleCustomField3', 'Contact Custom 3', 'open'),
      createColumn(currentParent, '140px', false, 'text', '', 'PeopleCustomField4', 'Contact Custom 4', 'open'),
    
      // Contact group
      createColumn(getParentId(true), '120px', true, 'text', 'Contact', 'PeopleEmail', 'Email'),
      createColumn(currentParent, '140px', false, 'text', '', 'DeskPhone', 'Desk Phone', 'open'),
      createColumn(currentParent, '120px', false, 'text', '', 'CellPhone', 'Cell Phone', 'open'),
      createColumn(currentParent, '120px', false, 'text', '', 'CustomerContactType', 'Contact Type', 'open'),
    
      // Status group
      createColumn(getParentId(true), '80px', true, 'text', 'Status', 'PeopleStatusDisplayValue', 'Status'),
      createColumn(currentParent, '120px', false, 'text', '', 'CustomerDisplayRole', 'Role', 'close'),
      createColumn(currentParent, '120px', false, 'text', '', 'UserAccountState', 'User Account State', 'open'),
    
      // Location group
      createColumn(getParentId(true), '160px', true, 'text', 'Location', 'LocationDisplay', 'Location')
    ];

    this.cols.forEach((col: any) => {


      if (col.isChildren) {

        let data: any = {
          "label": col.header,
          "isparent": true,
          "parentid": col.parent,
          "expanded": true,
          "children": []
        }
        const colParent = this.cols.filter((item: any) => item.parent === col.parent);
        colParent.forEach((element: any) => {
          data['children'].push(
            {
              "label": element.childHeader,
              "isparent": false,
              "parentid": element.parent
            }
          )
        });
        this.filesColumns.push(data)

        const closedColumns = this.cols.filter((item: any) => item.parent === col.parent && item.columnGroupShow === 'close');
        col.colspan = closedColumns.length;
        col.Parentwidth = closedColumns.map((value: any) => parseInt(value.width.replace('px', ''))).reduce(
          (accumulator: any, currentValue: any) => accumulator + currentValue, 0) + 'px';
      }
    });

    this.selectedFiles = _.cloneDeep(this.filesColumns);
    this.colsshow = JSON.parse(JSON.stringify(this.cols));
    console.log(this.cols);
    this.displaycols = this.cols.filter((col: any) => col.columnGroupShow == 'close');
    this.commonColumnsFn();

  }

  isApiAlerdayCall: boolean = false;
  onScroll(event: Event) {
    const target = event.target as HTMLElement;

    const scrollTop = target.scrollTop;
    const scrollHeight = target.scrollHeight;
    const clientHeight = target.clientHeight;
    if ((scrollTop + clientHeight >= scrollHeight - 1) &&
      this.files.length < this.totalRecords && !this.isApiAlerdayCall
    ) {
      this.lastNode = this.files[this.files.length - 1];
      this.isApiAlerdayCall = true;
      this.pTableContain.first = this.pTableContain.first ? this.pTableContain.first + 100 : 101;
      this.loadNodes();
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
        this.selectedFiles.push(node);
        if (node.children) {

          this.selectAllNodes(node.children);
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


    this.exportData = {
      ExportToExcelData: {
        HeaderData: headerData,
        ChildHeaderData: ChildHeaderData,
        fileName: "Location People",
      },
      ExportToExcel: true,
      ...(this.finalFilterdArr === undefined ? {} : this.finalFilterdArr),
      ...(this.sorting ? { OrderBy: this.sorting, SortOrder: this.sortingType } : {}),
      ...(this.selectedTem != 'all') ? { TemAccountId: this.selectedTem } : {},
    };

    this.exportAccountData.emit(this.exportData);
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
    this.loadNodes(true);
  }

  onFilter(event: any) {
    const filters = event.filters;
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
    this.loadNodes(true);
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
    event.preventDefault();
    this.selectedNode = event1;
    this.contextMenuPosition.x = event.clientX;
    this.contextMenuPosition.y = event.clientY;
    menu.show(event);
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

  selectChildCheckbox() {
    const a = this.selectedRecords;
    if (a.length > 1) {
      this.selectedRecords = [];
      this.selectedRecords.push(a[a.length - 1]);
    }
    let b = this.selectedRecords.map((item: { data: any; }) => item?.data);
    this.selectedRowsEmit.emit(b)
  }

  onSelectionChange(event: TreeNode[]) {
    // Keep only the last selected item
    if (event && event.length) {
      const last = event[event.length - 1];
      // this.selectedRecord = last;
    } else {
      // this.selectedRecord = null;
    }
  }

  onRowDoubleClick(data: any) {
    let datas = {
      data: data
    }
    this.rowCellDoubleClicked.emit(datas);
  }


  loadNodes(allOptionsClear = false) {
    this.loading = true;

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
      ...(this.sorting ? { OrderBy: this.sorting, SortOrder: this.sortingType } : {}),
      ...(this.selectedTem != 'all') ? { TemAccountId: this.selectedTem } : {},
    };

    this.finalAllDetailArr = data;
    this._unsubscribeGRid.next(null);

    if (allOptionsClear) this.files = [];
    this.locationService
          .getLocationPeople(this.contactDataEmit.Id, data)
      .pipe(takeUntil(this._unsubscribeGRid))
      .subscribe(
        (response: any) => this.handleResponse(response, allOptionsClear),
        () => this.handleError()
      );
  }

  onNodeExpand(event: { node: any; }) {
    const node = event.node;

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
        ...(this.sorting ? { OrderBy: this.sorting, SortOrder: this.sortingType } : {}),
        ...(this.selectedTem != 'all') ? { TemAccountId: this.selectedTem } : {},
      };

      this._unsubscribeGRid.next(null);

      // Make the API call
      this.locationService
        .getAllCustomerUrl(data)
        .pipe(takeUntil(this._unsubscribeGRid))
        .subscribe(
          (response: any) => this.handleNodeResponse(response, node),
          () => this.handleNodeError()
        );
    }
  }

  // Handle the API response for node expansion
  handleNodeResponse(response: { Data: { $values: any[]; }; }, node: any) {
    this.innerLoading = false;

    if (response?.Data?.$values?.length) {
      // Map response data to node children
      node.children = response.Data.$values.map(extractDataAndLeaf.bind(this));
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

  handleResponse(response: { TotalCount: number; Data: { $values: any[]; }; }, allOptionsClear: boolean) {
    this.loading = false;
    this.totalRecords = response.TotalCount;

    if (response?.Data?.$values?.length) {
      const resData = response.Data.$values.map(extractDataAndLeaf.bind(this));
      this.files = allOptionsClear ? resData : [...this.files, ...resData];

    } else {
      this.files = [];
    }
    
    this.files.length > 0 ? this.tableDataExist.emit(true) : this.tableDataExist.emit(false);
    this.isApiAlerdayCall = false;
  }

  handleError() {
    this.loading = false;
    this.files = [];
  }



}
