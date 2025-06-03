import { Component, EventEmitter, HostListener, Input, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import _ from 'lodash';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { extractData, extractDataAndLeaf, extractDataPtable, filterOptionsDate, filterOptionsNumber, filterOptionsText, onChangeEndDate } from 'src/app/services/common-p-table';
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

@Component({
  selector: 'app-p-table',
  templateUrl: './p-table.component.html',
  styleUrl: './p-table.component.scss',
  imports: [SharedModule, PrimgModule],
  standalone: true,
})
export class PTableComponent {


  @Input() APIParams: any;
  @Input() childPayload: any;
  @Input() refreshbutton: any = false;
  @Input() payload: any;
  @Input() GridAPI: any;
  @Input() cols: any;
  @Input() ids: any;
  @Input() headerCheckboxVisible: any = false;
  @Input() selectionField: string | string[] = 'IsSelected';
  @Input() selectionCondition: 'AND' | 'OR' = 'OR';
  @Input() selectionFieldWithValues: any;
  @Input() selectedFromArray: any = [];
  @Input() preAppliedfilterArr: any;
  @Input() toggler: any = false;
  @Input() checkboxes: any = false;
  @Input() togglerWithCheckbox: any = false;
  @Input() doubleHeader: any = true;
  @Input() filters: any = true;
  @Input() multipleSelection: any = false;
  @Input() SSRWithHeaderCheckbox: any = false;
  @Input() buttonTemplate!: TemplateRef<any>;
  @Input() arrayKey: any;
  @Input() nodeKey: any;
  files: any[];
  displaycols: any[];
  loading: boolean = false;
  pTableContain = { first: 1 };
  finalFilterdArr: any;
  sorting: any;
  sortingType: any;
  totalRecords: number = 0;
  isApiAlerdayCall: boolean = false;
  expandedNode: any | null = null;
  colsshow: any[];
  selectedFiles: any[] = [];
  filesColumns: any = []

  countries = filterOptionsText();
  selectedOption1: any = this.countries[0].name;
  selectedOption2: any = this.countries[0].name;

  textboxValue1: any = '';
  textboxValue2: any = '';

  textboxValue1_1: any = '';
  textboxValue2_1: any = '';
  fieldsName: any;
  model = { option: 'AND' };
  displayModal1: boolean = false;

  filterArray: arrDate[];
  filterArrayDate: arrDate[];
  filterArrayNumber: arrDate[];

  displayModal: boolean = false;
  headerCheckboxData = false;

  @ViewChild('table') table!: any;
  @ViewChild('contextMenu') contextMenu: any;
  @ViewChild('ccText') ccText!: TemplateRef<any>;

  private _unsubscribeGRid: Subject<any> = new Subject<any>();
  lastNode: any | null = null;
  sidebarVisible: boolean = false;
  radioItems: Array<any>;
  contextMenuPosition: { x: number; y: number } = { x: 0, y: 0 };
  nodeCopy: any;
  items: any[];
  public exportAccounts: any;
  selectedRecords: any = [];
  selectedRows: number = 0;
  selectedInventory: any;
  @Output() exportAccountData: EventEmitter<any> = new EventEmitter();
  @Output() tableDataExist: EventEmitter<any> = new EventEmitter();
  @Output() selectedRowsEmit: EventEmitter<any> = new EventEmitter();
  @Output() rowCellDoubleClicked: EventEmitter<any> = new EventEmitter();
  @Output() refreshbuttonEmit: EventEmitter<any> = new EventEmitter();
  @Output() totalRecordsEmit: EventEmitter<any> = new EventEmitter();
  @Output() loaderEmit: EventEmitter<any> = new EventEmitter();
  @Output() dataValues: EventEmitter<any> = new EventEmitter();

  @HostListener('document:click', ['$event']) onClick(event: Event) {
    const clickedInsideMenu = this.contextMenu?.el?.nativeElement.contains(event.target);
    if (!clickedInsideMenu) {
      this.contextMenu?.hide();
    }
  }


  constructor(public locationService: LocationService, public variableManageService: VariableManageService,
    public dialog: MatDialog
  ) { }

  ngAfterViewInit() {
    const scrollableBody = this.table.el.nativeElement.querySelector(
      '.p-datatable-scrollable'
    );


    if (scrollableBody) {
      scrollableBody.addEventListener('scroll', this.onScroll.bind(this));
    }
  }

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


  ngOnChanges(changes: SimpleChanges) {


    if (changes['preAppliedfilterArr'] && changes['preAppliedfilterArr'].currentValue !== changes['preAppliedfilterArr'].previousValue) {
      this.preAppliedfilterArr = changes['preAppliedfilterArr'].currentValue;
      this.loadNodes(true);
      return;
    }

    if (changes['refreshbutton'] && changes['refreshbutton'].currentValue === true) {
      this.selectedRecords = [];
      this.headerCheckboxData = false;
      this.loadNodes(true);
    }
  }

  ngOnInit() {
    this.variableManageService.getCallAPIForInventoryDta$.subscribe((res: any) => {
      if (res) {
        this.loadNodes(true);
      }
    });

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
    this.loaderEmit.emit(this.loading);
    this.setColumnDefs();

    this.filesColumns = [];
    const parentMap = new Map();
    let parentIndex = 0;

    this.cols.forEach((col: any) => {

      if (col.field === 'checkbox' || col.type === 'checkbox') {
        return;
      }
      if (col.isChildren && !parentMap.has(col.parent)) {
        const parentKey = parentIndex.toString();

        const parentNode: any = {
          key: parentKey,
          label: col.header,
          isparent: true,
          parentid: col.parent,
          expanded: true,
          children: []
        };

        this.filesColumns.push(parentNode);
        const closedColumns = this.cols.filter((item: any) => item.parent === col.parent && item.columnGroupShow === 'close');
        col.colspan = closedColumns.length;
        col.Parentwidth = closedColumns.map((value: any) => parseInt(value.width.replace('px', ''))).reduce(
          (accumulator: any, currentValue: any) => accumulator + currentValue, 0) + 'px';
        parentMap.set(col.parent, { node: parentNode, index: parentIndex });
        parentIndex++;
      }

      const parentData = parentMap.get(col.parent);

      if (parentData) {
        const childKey = `${parentData.index}-${parentData.node.children.length}`;

        parentData.node.children.push({
          key: childKey,
          label: col.childHeader,
          isparent: false,
          parentid: col.parent
        });
      }
    });


    this.selectedFiles = _.cloneDeep(this.filesColumns);
    this.colsshow = JSON.parse(JSON.stringify(this.cols));

    this.displaycols = this.cols.filter((col: any) => col.columnGroupShow == 'close');
    this.commonColumnsFn();
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
        fileName: "Customer",
      },
      ExportToExcel: true,
      ...(this.finalFilterdArr === undefined ? {} : this.finalFilterdArr),
      ...(this.sorting ? { OrderBy: this.sorting, SortOrder: this.sortingType } : {}),
      ...(this.payload ? this.payload : {})
    };

    this.exportAccountData.emit(this.exportAccounts);
  }

  loadNodes(allOptionsClear = false) {
    if (this.loading) {
      return;
    }
    this.loading = true;
    this.loaderEmit.emit(this.loading);

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

    if (Array.isArray(this.preAppliedfilterArr) && this.preAppliedfilterArr.length > 0) {
      if (!Array.isArray(this.finalFilterdArr['advanceFilter'])) {
        this.finalFilterdArr['advanceFilter'] = [];
        this.finalFilterdArr['advanceFilter'] = [...this.preAppliedfilterArr];
      } else {
        const existingFilters = new Map(this.finalFilterdArr['advanceFilter'].map(item => [JSON.stringify(item), item]));
        this.preAppliedfilterArr.forEach((filter: any) => existingFilters.set(JSON.stringify(filter), filter));
        this.finalFilterdArr['advanceFilter'] = Array.from(existingFilters.values());
      }
    } else {
      this.finalFilterdArr['advanceFilter'] = [];
    }

    this.finalFilterdArr['advanceFilter'] = Array.from(
      new Map(this.finalFilterdArr['advanceFilter'].map((item: any) => [JSON.stringify(item), item])).values()
    );
    let data = {
      ...this.finalFilterdArr,
      startRowIndex: this.pTableContain.first,
      maximumRows: 100,
      ...(this.sorting ? { OrderBy: this.sorting, SortOrder: this.sortingType } : {}),

    };
    let payloadData = {
      ...data,
      ...(this.payload ? this.payload : {})
    }
    this._unsubscribeGRid.next(null);
    if (allOptionsClear) this.files = [];
    this.locationService
      .callPTreeTabAPI(this.GridAPI, payloadData, 'POST', this.ids)
      .pipe(takeUntil(this._unsubscribeGRid))
      .subscribe(
        {
          next: (response: any) => this.handleResponse(response, allOptionsClear),
          error: () => this.handleError()
        }
      );
  }


  handleResponse(response: any, allOptionsClear: boolean) {
    this.totalRecords = response?.TotalCount ?? response?.TotalRecordCount;
    this.totalRecordsEmit.emit(this.totalRecords);

    const data =
      Array.isArray(response?.Data?.$values) && response.Data.$values.length > 0
        ? response.Data.$values
        : response?._companyLocationDto?.$values ?? [];

    if (data.length) {
      const resData = data.map(extractData.bind(this));
      this.files = allOptionsClear ? resData : [...this.files, ...resData];

      this.dataValues.emit(this.files);
      this.selectedRecords = this.getCheckedNodes(this.files);

      if (this.selectedRecords.length > 0) {
        this.selectChildCheckbox();
      }
    } else {
      this.files = [];
      this.dataValues.emit(this.files);

    }

    this.files.length > 0 ? this.tableDataExist.emit(true) : this.tableDataExist.emit(false);
    this.refreshbuttonEmit.emit(false);
    this.isApiAlerdayCall = false;
    this.loading = false;
    this.loaderEmit.emit(this.loading);
  }


  getCheckedNodes(nodes: any[]): any[] {
    let selected: any[] = [];

    for (const node of nodes) {
      if (!node.data) continue;

      if (this.selectedFromArray.length > 0) {
        const d = this.selectedFromArray.some((r: any) => {
          return r[this.arrayKey] === node.data[this.nodeKey]
        });
        if (d) {
          selected.push(node);
        }
      }
      if (this.selectionFieldWithValues) {
        if (typeof this.selectionFieldWithValues === 'string') {
          if (typeof this.selectionField === 'string' &&
            node.data.hasOwnProperty(this.selectionField) &&
            node.data[this.selectionField] === this.selectionFieldWithValues) {
            selected.push(node);
          }
          continue;
        }

        if (typeof this.selectionFieldWithValues === 'object' &&
          Object.keys(this.selectionFieldWithValues).length > 0) {
          let isSelected = true;
          for (const [field, expectedValue] of Object.entries(this.selectionFieldWithValues)) {
            if (!node.data.hasOwnProperty(field) || node.data[field] !== expectedValue) {
              isSelected = false;
              break;
            }
          }
          if (isSelected) {
            selected.push(node);
          }
          continue;
        }
      }

      if (typeof this.selectionField === 'string') {
        if (node.data.hasOwnProperty(this.selectionField) && !!node.data[this.selectionField]) {
          selected.push(node);
        }
      }

      else if (Array.isArray(this.selectionField) && this.selectionField.length > 0) {
        let isSelected = false;

        if (this.selectionCondition === 'AND') {
          isSelected = this.selectionField.every(field =>
            node.data.hasOwnProperty(field) && !!node.data[field]
          );
        } else {
          isSelected = this.selectionField.some(field =>
            node.data.hasOwnProperty(field) && !!node.data[field]
          );
        }

        if (isSelected) {
          selected.push(node);
        }
      }
    }

    return selected;
  }

  handleError() {
    this.loading = false;
    this.files = [];
    this.loaderEmit.emit(this.loading);
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
        const isHeaderClosed = closedColumns.some(closedItem => closedItem.childHeader === item.childHeader);
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

    this.cols.forEach((col: any) => {
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

        col.Parentwidth = closedColumns.map((value: any) => parseInt(value.width.replace('px', ''))).reduce(
          (accumulator: any, currentValue: any) => accumulator + currentValue, 0) + 'px';
      }
    });
    this.displaycols = this.cols.filter((col: any) => col.columnGroupShow == 'close');
  }

  OrderBy(columnName: any) {
    if (!this.sorting || this.sorting === '') {
      this.sorting = columnName;
      this.cols.forEach((item: any) => {
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
      this.cols.forEach((item: any) => {
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

  validateNumberInput(value: string, allowNegative: boolean): boolean {
    if (value === "") {
      return true;
    }
    const onlyNumberRegex = /^[0-9]*\.?[0-9]*$/;
    const onlyNumberWithNegativeRegex = /^-?[0-9]+(\.[0-9]*)?$/;
    const regex = allowNegative ? onlyNumberWithNegativeRegex : onlyNumberRegex;
    return regex.test(value);
  }

  updateFilterArray(targetArray: any, newFilter: any) {
    const index = targetArray.findIndex((f: any) => f.filterKey === newFilter.filterKey);
    if (index !== -1) {
      targetArray[index] = newFilter;
    } else {
      targetArray.push(newFilter);
    }

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

      this.updateFilterArray(this.filterArray, arrDate);
    } else if (this.fieldsName.type === 'numberFilter') {
      this.updateFilterArray(this.filterArrayNumber, arrDate);
    } else {
      this.updateFilterArray(this.filterArrayDate, arrDate);
    }


    this.displayModal = false;


    this.filterArray = this.filterArray.filter((f: any) => f.filterOptionValue1 !== '')
    this.filterArrayDate = this.filterArrayDate.filter((f: any) => f.filterOptionValue1 !== '')
    this.filterArrayNumber = this.filterArrayNumber.filter((f: any) => f.filterOptionValue1 !== '')

    let data: any = {};

    if (Array.isArray(this.filterArray) && this.filterArray.length > 0) {
      const copy = [...this.filterArray];

      data['advanceFilter'] = copy;
    }

    if (Array.isArray(this.filterArrayDate) && this.filterArrayDate.length > 0) {
      data['advanceDateFilter'] = [...this.filterArrayDate];
    }

    if (Array.isArray(this.filterArrayNumber) && this.filterArrayNumber.length > 0) {
      data['advanceNumberFilter'] = [...this.filterArrayNumber];
    }


    this.finalFilterdArr = data;

    if (this.textboxValue1 !== null && this.textboxValue1 !== '') {
      this.cols.forEach((item: any) => {
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
      this.cols.forEach((item: any) => {
        if (item.field === this.fieldsName.field) {
          item.valuesset = null;
          item.isenable = false;
        }
      });
    }

    this.loadNodes(true);
  }

  openSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
    this.selectAllNodes(this.filesColumns);
  }


  private selectAllNodes(nodes: any[]) {
    nodes.forEach((node: any) => {
      if (node.isparent && this.cols.some((e: any) => e.header === node.label && e.displayCheckboxColumns === false) || !node.isparent && this.cols.some((e: any) => e.childHeader === node.label && e.displayCheckboxColumns === false)) {
      } else {
        this.selectedFiles.push(node);
        if (node.children) {

          this.selectAllNodes(node.children);
        }
      }
    });
  }


  ngOnDestroy(): void {
    this._unsubscribeGRid.next(null);
    this._unsubscribeGRid.complete();
  }

  closeSidebar() {
    this.sidebarVisible = false;
  }

  onNodeSelect(event: any) {
    this.nodeCopy = event.node;
  }

  dropdownOptionSelected() {
    navigator.clipboard.writeText(this.nodeCopy).then(
      () => {
      },
      (err) => {
      }
    );

  }

  showContextMenu(event: MouseEvent, menu: any, event1: any) {
    event.preventDefault();
    this.nodeCopy = event1;
    this.contextMenuPosition.x = event.clientX;
    this.contextMenuPosition.y = event.clientY;
    menu.show(event);
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

  onFilterChangedFirst(value: any, col: any) {
    if (value == '') {
      this.displayModal1 = false;
    } else {
      this.displayModal1 = true;
    }
  }


  nodeSelect(e: any) {
    this.cols.forEach((item: any) => {
      if (e.node.isparent && item.parent === e.node.parentid || !e.node.isparent && item.parent === e.node.parentid && item.childHeader === e.node.label) {
        let closedColumns = false;
        if (e.node.isparent && this.cols.some((it: any) => it.parent === e.node.parentid && it.isChildren && it.isicon === 0)) {
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

    if (this.cols.some((it: any) => it.parent === e.node.parentid && it.isChildren && it.isicon === 1)) {
      this.toggleColumn(e.node.parentid, 'open')
    }

    this.commonColumnsFn();
  }

  nodeUnselect(e: any) {
    const ee = e.node;
    this.cols.forEach((item: any) => {
      if (ee.isparent && item.parent === ee.parentid) {
        item.columnGroupShow = 'open';
        item.displayCheckboxColumns = false;
      } else if (!ee.isparent && item.parent === ee.parentid && item.childHeader === ee.label) {
        item.columnGroupShow = 'open';
        item.displayCheckboxColumns = false;

        if (!this.cols.some((it: any) => it.parent === ee.parentid && it.displayCheckboxColumns)) {
          item.isParentVisible = false;
        } else {
          item.isParentVisible = true;
          if (!this.cols.some((it: any) => it.parent === ee.parentid && it.columnGroupShow === 'close')) {

            for (let child of ee.parent.children) {
              if (this.selectedFiles.includes(child)) {
                let i = this.cols.findIndex((k: any) => k.parent === ee.parentid && k.childHeader === child.label)
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

  selectChildCheckbox(): void {
    if (!this.multipleSelection && this.selectedRecords.length > 1) {
      this.selectedRecords = [this.selectedRecords[this.selectedRecords.length - 1]];
    }

    const selectedData = this.selectedRecords.map((item: any) => item?.data);
    this.headerCheckboxData = this.selectedRecords.length === this.files.length;

    this.selectedRowsEmit.emit(selectedData);
  }

  onHeaderCheckboxChange(event?: any): void {
    this.headerCheckboxData = event?.target?.checked ?? false;

    if (this.headerCheckboxData) {
      if (this.SSRWithHeaderCheckbox) {
        this.loadNodes();
      }
      this.selectedRecords = [...this.files];
    } else {
      this.selectedRecords = [];
    }

    this.selectChildCheckbox();
  }

  onRowDoubleClick(data: any) {
    let datas = {
      data: data
    }
    this.rowCellDoubleClicked.emit(datas);
  }
}