import { Component, OnInit, Input, EventEmitter, Output, HostListener, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import _ from 'lodash';
import moment from 'moment';
import { TreeNode } from 'primeng/api';
import { LocationService } from '../services/location.service';
import { FinanceInvoicesService } from '../services/finance-invoices.service';
import { createColumn } from '../utils/column-utils';
import { isValueExist } from '../services/helper';
import { onChangeEndDate } from '../services/common-p-table';
import { AddInvoiceNoteComponent } from '../add-invoice-note/add-invoice-note.component';
import { InvoiceOverviewIComponent } from '../common/invoice-overview-i/invoice-overview-i.component';
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
  selector: 'app-invoice-notes',
  templateUrl: './invoice-notes.component.html',
  styleUrls: ['./invoice-notes.component.scss'],
  imports: [SharedModule, PrimgModule, InvoiceOverviewIComponent]
})
export class InvoiceNotesComponent implements OnInit {

  @Input() gridRowData: any;

  hasSsuperTemUsers: boolean = false;
  stopSpinner: boolean = false;

  rowData: any = [];

  public columnDefs1;
  public exportNotes: any;
  public advanceFilter: any;

  sideBar: any;
  invoiceOvervewData: any;
  costOverviewData: any;
  basicOptions: any;
  basicData: any;
  overviewData: any;
  gridApi: any;
  gridColumnApi: any;
  downloadinvoiceloader = false;
  defaultColDef = {
    sortable: true,
    minWidth: 100,
    filter: true,
    resizable: true,
    floatingFilter: true,
    flex: 1,
  };

  private _unsubscribeNotes: Subject<any> = new Subject<any>();
  public getDataPath: any = (data: any) => data.dataPath;

  @Output() invoiceOverviewDataOutput: EventEmitter<any> = new EventEmitter<any>();
  @Output() isInventoryNoteExist: EventEmitter<any> = new EventEmitter<any>();
  @Output() exportData: EventEmitter<any> = new EventEmitter();
  @Output() isDisabledExport: EventEmitter<any> = new EventEmitter();

  // p-table start
  sidebarVisible: boolean = false;
  files: TreeNode[];
  TotalCount = 0;
  selectedRecords: any[] = [];

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

  pTableContain = { first: 1 };
  finalFilterdArr: any;
  innerLoading = false;
  @ViewChild('treeTable') treeTable!: any;
  @ViewChild('contextMenu') contextMenu: any;
  selectedNode: any;
  public exportAccounts: any;
  @HostListener('document:click', ['$event']) onClick(event: Event) {
    const clickedInsideMenu = this.contextMenu.el.nativeElement.contains(event.target);
    if (!clickedInsideMenu) {
      this.contextMenu.hide();
    }
  }

  constructor(public dialog: MatDialog,
    private _LocationService: LocationService,
    private financeInvoicesService: FinanceInvoicesService) {

    this.sideBar = {
      toolPanels: ['columns', 'filters']
    };

    this.columnDefs1 = [
      {
        headerName: 'Account',
        children: [
          {
            field: 'InvoiceNumber',
            headerName: 'Invoice Number',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 161,
            width: 161
          },
          {
            field: 'CustomerAccountName',
            headerName: 'Customer',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 170
          },
          {
            field: 'VendorAccountName',
            headerName: 'Vendor',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 130
          },
          {
            field: 'PayableAccountNumber',
            headerName: 'Payable Account Number',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 225
          }
        ],
      },
      {
        headerName: 'Date',
        children: [
          {
            field: 'InvoiceNoteCreatedDate',
            headerName: 'Date',
            columnGroupShow: 'close',
            filter: 'agDateColumnFilter',
            editable: false,
            minWidth: 102,
            width: 102,
            filterParams: {
              comparator: (filterLocalDateAtMidnight: Date, cellValue: string) => {
                const cellDate = new Date(cellValue);
                if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
                  return 0;
                } else if (cellDate < filterLocalDateAtMidnight) {
                  return -1;
                } else {
                  return 1;
                }
              },
              browserDatePicker: true,
            }
            // maxWidth: 105,
            // minWidth: 103
          }
        ]
      },
      {
        headerName: 'Notes',
        children: [
          {
            field: 'Notes',
            headerName: 'Notes',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 400,
            // ag-grid table notes section vertical scroll bar
            cellClass: "ag-cell-note-scroll",
            wrapText: true,
            autoHeight: true,
          },
          {
            field: 'NotesTags',
            headerName: 'Note Tag',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 140,
            valueGetter(params: any) {
              if (params.data?.NotesTags) {
                return params.data.NotesTags.split(',').join(', ')
              } else {
                return '';
              }
            },
            // ag-grid table section vertical scroll bar
            cellClass: "ag-cell-note-scroll",
            wrapText: true,
            autoHeight: true,
          },
          {
            field: 'NotesTicketNumber',
            headerName: 'Ticket Number',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 153,
            width: 153,
          },
          {
            headerName: 'Note Type',
            sortingField: 'NoteType',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            field: 'NoteType',
            editable: false,
            minWidth: 123,
            maxWidth: 123,
            flex: 0,
            resizable: true,
          },
          {
            field: 'InvoiceNoteCreatedByWithEmail',
            headerName: 'Who',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 200,
            flex: 0,
            resizable: true,
          }
        ],
      }
    ];

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
    this.hasSsuperTemUsers = this._LocationService.isUserHasSuperTEMUsersRole();

    if (this.hasSsuperTemUsers) {
      this.cols = [
        createColumn(1, '161px', true, 'text', 'Account', 'InvoiceNumber', 'Invoice Number'),
        createColumn(1, '170px', false, 'text', '', 'CustomerAccountName', 'Customer', 'open'),
        createColumn(1, '130px', false, 'text', '', 'VendorAccountName', 'Vendor', 'open'),
        createColumn(1, '225px', false, 'text', '', 'PayableAccountNumber', 'Payable Account Number', 'open'),

        createColumn(2, '104px', true, 'dateFilter', 'Date', 'InvoiceNoteCreatedDate', 'Date'),

        createColumn(3, '300px', true, 'text', 'Notes', 'Notes', 'Notes'),
        createColumn(3, '140px', false, 'text', '', 'NotesTags', 'Notes Tag'),
        createColumn(3, '130px', false, 'text', '', 'NotesTicketNumber', 'Ticket'),
        createColumn(3, '123px', false, 'text', '', 'NoteType', 'Note Type'),
        createColumn(3, '280px', false, 'text', '', 'InvoiceNoteCreatedByWithEmail', 'Who'),
      ];
    } else {
      this.cols = [

        createColumn(1, '161px', true, 'text', 'Account', 'InvoiceNumber', 'Invoice Number'),
        createColumn(1, '170px', false, 'text', '', 'CustomerAccountName', 'Customer', 'open'),
        createColumn(1, '130px', false, 'text', '', 'VendorAccountName', 'Vendor', 'open'),
        createColumn(1, '225px', false, 'text', '', 'PayableAccountNumber', 'Payable Account Number', 'open'),

        createColumn(2, '104px', true, 'dateFilter', 'Date', 'InvoiceNoteCreatedDate', 'Date'),

        createColumn(3, '300px', true, 'text', 'Notes', 'Notes', 'Notes'),
        createColumn(3, '140px', false, 'text', '', 'NotesTags', 'Notes Tag'),
        createColumn(3, '130px', false, 'text', '', 'NotesTicketNumber', 'Ticket'),
        createColumn(3, '280px', false, 'text', '', 'InvoiceNoteCreatedByWithEmail', 'Who'),
      ];
    }

    this.cols.forEach((col) => {
      if (col?.isChildren) {

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


  ngOnInit(): void {
    this.hasSsuperTemUsers = this._LocationService.isUserHasSuperTEMUsersRole();

    // this.getInoviceNotes();
    this.getInvoiceCostOverview();
    this.getInvoiceOverview();

    let headerData: any = [];
    let ChildHeaderData: any = [];
    let i = 0;
    let childIndex = 0;
    _.map(this.columnDefs1, (x: any) => {
      if (isValueExist(x.headerName)) {
        i = i + 1;
        headerData.push({ position: i, title: x.headerName });
        if (x.children) {
          _.map(x.children, (y: any) => {
            childIndex = childIndex + 1;
            ChildHeaderData.push({ Position: childIndex, Title: y.headerName, FieldName: y.field, HeaderPosition: i })
          })
        }
      }
    });

    this.exportNotes = {
      ExportToExcelData: {
        HeaderData: headerData,
        ChildHeaderData: ChildHeaderData,
        fileName: "Invoice"
      },
      ExportToExcel: true
    };
    if (this.advanceFilter) {
      this.exportNotes['advanceFilter'] = this.advanceFilter
    }

    this.setCols();
    this.setColumnDefs();
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
  }

  // P-Table code >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

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

    this.finalFilterdArr['advanceFilter'] = Array.from(
      new Map(this.finalFilterdArr['advanceFilter'].map((item: any) => [JSON.stringify(item), item])).values()
    );

    let data = {};

    if (this.hasSsuperTemUsers) {
      data = {
        ...this.finalFilterdArr,
        startRowIndex: this.pTableContain.first,
        maximumRows: 100,
        IsTotalNeed: true,
        ...(this.sorting ? { OrderBy: this.sorting, SortOrder: this.sortingType } : {}),
        "invoiceId": this.gridRowData.InvoiceId,
        "privateNote": null,
        "status": null,
      }
    } else {
      data = {
        ...this.finalFilterdArr,
        startRowIndex: this.pTableContain.first,
        maximumRows: 100,
        IsTotalNeed: true,
        ...(this.sorting ? { OrderBy: this.sorting, SortOrder: this.sortingType } : {}),
        "invoiceId": this.gridRowData.InvoiceId,
        "privateNote": false,
        "status": null,
      }
    }

    this.finalAllDetailArr = data;
    this._unsubscribeNotes.next(true);

    if (allOptionsClear) this.files = [];

    this.financeInvoicesService.getInoviceNotes(data).pipe(takeUntil(this._unsubscribeNotes))
      .subscribe(
        response => this.handleResponse(response, allOptionsClear),
        () => this.handleError()
      );

  }

  // Handle the response for loadNodes
  handleResponse(response: any, allOptionsClear: any) {
    this.loading = false;
    // this.totalRecords = response.TotalCount ? response.TotalCount : response?.Data?.$values?.length;
    this.totalRecords = response?.Data?.$values?.length;

    if (response?.Data?.$values?.length) {
      const resData = response.Data.$values.map(this.extractDataAndLeaf.bind(this));
      this.files = allOptionsClear ? resData : [...this.files, ...resData];
      this.isApiAlerdayCall = false;
    } else {
      this.files = [];
      this.isApiAlerdayCall = false;
    }
    this.files.length > 0 ? this.isInventoryNoteExist.emit(true) : this.isInventoryNoteExist.emit(false);

  }

  // Extract data and leaf status

  extractDataAndLeaf = (item: any) => {
    return {
      data: this.extractData(item),
      leaf: !item.HasParent,
    };
  }

  // Handle error case
  handleError() {
    this.loading = false;
    this.files = [];
  }

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

    this.exportData.emit(this.exportAccounts);
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


  dropdownOptionSelected() {
    navigator.clipboard.writeText(this.selectedNode).then(
      () => {
      },
      (err) => {
      }
    );

  }

  // P-Table code End>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

  addInvoiceNote() {
    const dialogRef = this.dialog.open(AddInvoiceNoteComponent, {
      width: '900px',
      data: {
        colseButton: true,
        data: {
          gridrowData: this.gridRowData,
          invoiceOvervewData: this.invoiceOvervewData
        }
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // this.getInoviceNotes();
        this.loadNodes(this.pTableContain, true);
      }
    });
  }
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

  getInoviceNotes() {
    this.loadNodes(this.pTableContain, true);
  }

  ngOnDestroy() {
    this._unsubscribeNotes.next(true);
    this._unsubscribeNotes.complete();
  }

  export() {
    let exportName = this.invoiceOvervewData?.CustomerAccountName + '_Invoice ' + this.invoiceOvervewData?.InvoiceNumber + '_' + this.invoiceOvervewData?.InvoiceBillDate + '.xlsx';

    this.exportNotes['InvoiceId'] = this.gridRowData.InvoiceId;

    this.isDisabledExport.emit(true);
    this.financeInvoicesService
      .getInoviceNotesExport(this.exportNotes)
      .subscribe({
        next: data => {
          this.isDisabledExport.emit(false);
          let bolbUrl = URL.createObjectURL(data);
          var link = document.createElement("a");
          link.setAttribute("href", bolbUrl);
          link.setAttribute("download", exportName);
          link.style.display = "none";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        },
        error: error => {
          this.isDisabledExport.emit(false);
        }
      });
  }

  onFilterChanged($event: any) {

    const filterModel: any = $event.api.getFilterModel();
    const filterArray: any = [];
    const filterArrayDate: any = [];
    for (const [field, filter] of Object.entries(filterModel) as [string, any[keyof any]][]) {
      if (field == 'InvoiceNoteCreatedDate') {
        let arrDate = {
          filterKey: field,
          filterOptionType1: filter['type'] ? filter['type'] : filter['condition1']?.type ? filter['condition1']?.type : null,
          filterOptionValue1: (filter && filter['dateFrom']) ? filter['dateFrom'].split(' ')[0].toString() : (filter['condition1'] && filter['condition1']['dateFrom']) ? filter['condition1'].dateFrom.split(' ')[0].toString() : null,
          filterOptionValue1_2: (filter && filter['dateTo']) ? filter['dateTo'].split(' ')[0].toString() : (filter['condition1'] && filter['condition1']['dateTo']) ? filter['condition1']?.dateTo.split(' ')[0].toString() : null,
          filterOperationType: filter['operator'] ? filter['operator'] : 'AND',
          filterOptionType2: filter['condition2']?.type ? filter['condition2']?.type : null,
          filterOptionValue2: (filter['condition2'] && filter['condition2'].dateFrom) ? filter['condition2']?.dateFrom.split(' ')[0].toString() : null,
          filterOptionValue2_2: (filter['condition2'] && filter['condition2'].dateTo) ? filter['condition2']?.dateTo.split(' ')[0].toString() : null
        }
        filterArrayDate.push(arrDate);
      } else {
        let filterarr = {
          filterKey: field,
          filterOptionType1: filter['type'] ? filter['type'] : filter['condition1']?.type ? filter['condition1']?.type : null,
          filterOptionValue1: filter['filter'] ? filter['filter'] : filter['condition1'].filter ? filter['condition1'].filter : null,
          filterOperationType: filter['operator'] ? filter['operator'] : 'AND',
          filterOptionType2: filter['condition2']?.type ? filter['condition2']?.type : null,
          filterOptionValue2: filter['condition2']?.filter ? filter['condition2']?.filter : null
        };
        filterArray.push(filterarr);
      }
    }
    if (filterArrayDate && filterArrayDate.length > 0) {
      this.exportNotes['advanceDateFilter'] = filterArrayDate;
    }

    if (filterArray && filterArray.length > 0) {
      this.exportNotes['advanceFilter'] = filterArray;
    }
  }

  async initGrafh() {
     try {
        const ApexCharts = (await import('apexcharts')).default;
  
        const options = {
          series: [{
            name: '',
            data: _.map(this.costOverviewData, (res: any) => {
              return res.TotalCurrentCharges;
            }), 
          }],
          chart: {
            type: 'bar',
            toolbar: {
              show: false
            },
          },
          colors: ["#4680ff"],
          plotOptions: {
            bar: {
              columnWidth: '30%',
              distributed: true,
            }
          },
          dataLabels: {
            enabled: false
          },
          legend: {
            show: false
          },
          xaxis: {
            categories: _.map(this.costOverviewData, (res: any) => {
              return moment(res.InvoiceDate).format('MMM YY');
            }),
            labels: {
              style: {
                fontSize: '12px'
              }
            }
          },
          yaxis: {
            labels: {
                show: true,
                formatter: function (value: any) {
                    return Math.round(value).toString(); // Removes decimals
                },
            },
            axisBorder: {
                show: false,
                color: '#edeff5'
            }
          },
          tooltip: {
            y: {
                formatter: function (val: any) {
                  return "$" + val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                }
            }
          },
        };
  
        setTimeout(() => {
          // Initialize and render the chart
          let overviewChart = document.querySelector('#overview_chart');
          if (overviewChart) {
            overviewChart.innerHTML = '';
            const chart = new ApexCharts(document.querySelector('#overview_chart'), options);
            chart.render();
          }
        }, 500);
  
      } catch (error) {
      }
  }

  overviewDetail(data: any) {
    this.overviewData = data;
  }

  getInvoiceOverview() {
    this.financeInvoicesService.getInvoiceOverview(this.gridRowData.InvoiceId).subscribe((res: any) => {
      this.invoiceOvervewData = res.Data;
      this.invoiceOvervewData.InvoiceBillDate = this.invoiceOvervewData.InvoiceBillDate ? moment(res.Data.InvoiceBillDate).format('MM/DD/YYYY') : '';
      this.invoiceOvervewData.InvoicePayByDate = this.invoiceOvervewData.InvoicePayByDate ? moment(res.Data.InvoicePayByDate).format('MM/DD/YYYY') : '';

      this.invoiceOvervewData['PastDueAmount'] = res.Data.PastDueAmount ? parseFloat(res.Data.PastDueAmount).toFixed(2) : '0.00';
      this.invoiceOvervewData['TotalCurrentCharges'] = res.Data.TotalCurrentCharges ? parseFloat(res.Data.TotalCurrentCharges).toFixed(2) : '0.00';
      this.invoiceOvervewData['AmountToPay'] = res.Data.AmountToPay ? parseFloat(res.Data.AmountToPay).toFixed(2) : '0.00';
      this.invoiceOvervewData['PrevBillBalance'] = res.Data.PrevBillBalance ? parseFloat(res.Data.PrevBillBalance).toFixed(2) : '0.00';
      this.invoiceOvervewData['PaymentAmount'] = res.Data.PaymentAmount ? parseFloat(res.Data.PaymentAmount).toFixed(2) : '0.00';
      this.invoiceOvervewData['Difference'] = res.Data.Difference ? parseFloat(res.Data.Difference).toFixed(2) : '0.00';

      this.invoiceOvervewData['PastDueAmount'] =  res.Data?.PastDueAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      this.invoiceOvervewData['TotalCurrentCharges'] =  res.Data?.TotalCurrentCharges.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      this.invoiceOvervewData['AmountToPay'] = res.Data?.AmountToPay.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      this.invoiceOvervewData['PrevBillBalance'] = res.Data?.PrevBillBalance.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      this.invoiceOvervewData['PaymentAmount'] = res.Data?.PaymentAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      this.invoiceOvervewData['Difference'] = res.Data?.Difference.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

      this.invoiceOverviewDataOutput.emit(this.invoiceOvervewData);
    });
  }

  getInvoiceCostOverview() {
    this.financeInvoicesService.getInvoiceCostOverview(this.gridRowData.InvoiceId).subscribe((res: any) => {
      this.costOverviewData = res.Data.$values;
      this.initGrafh();

      this.costOverviewData[0]['AvgTotalCurrentCharges'] = this.costOverviewData[0]?.AvgTotalCurrentCharges ? parseFloat(this.costOverviewData[0].AvgTotalCurrentCharges).toFixed(2) : '0.00';
      this.costOverviewData[0]['HighestTotalCurrentCharges'] = this.costOverviewData[0]?.HighestTotalCurrentCharges ? parseFloat(this.costOverviewData[0].HighestTotalCurrentCharges).toFixed(2) : '0.00';

      this.costOverviewData[0]['AvgAmountToPay'] = this.costOverviewData[0]?.AvgAmountToPay?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      this.costOverviewData[0]['HighestAmountToPay'] = this.costOverviewData[0]?.HighestAmountToPay?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

      this.costOverviewData[0]['AvgTotalCurrentCharges'] = this.costOverviewData[0]?.AvgTotalCurrentCharges?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      this.costOverviewData[0]['HighestTotalCurrentCharges'] = this.costOverviewData[0]?.HighestTotalCurrentCharges?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
   
    });
  }


  downloadAttachment() {
    this.downloadinvoiceloader = true;

    this._LocationService.downloadInvoiceAttachment(this.overviewData.ExpectedInvoiceId).subscribe((res: any) => {
      var fileURL = URL.createObjectURL(res);
      window.open(fileURL);
      this.downloadinvoiceloader = false;
    });
  }

  onAgGridReadyEmit($event: any) {
    this.gridApi = $event.api;
    this.gridColumnApi = $event.columnApi;
  }

}