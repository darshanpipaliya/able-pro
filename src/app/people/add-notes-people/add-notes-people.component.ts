import { Component, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import moment from 'moment';
import _ from 'lodash';
import { TreeNode } from 'primeng/api';
import { LocationService } from 'src/app/services/location.service';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { AddPeopleNotesDialogComponent } from '../add-people-notes-dialog/add-people-notes-dialog.component';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { createColumn } from 'src/app/utils/column-utils';

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
  selector: 'app-add-notes-people',
  templateUrl: './add-notes-people.component.html',
  styleUrls: ['./add-notes-people.component.scss'],
  imports: [
    PrimgModule,
    SharedModule
  ]
})
export class AddNotesPeopleComponent implements OnInit {

  @Input() peopleData: any;

  selectedRows: number = 0;
  public peopleId: any;
  public peopleNoteIds: any;
  // public peopleNotesData;
  public rowData: any = [];
  public columnDefs: any;
  public defaultColDef = {
    sortable: true,
    minWidth: 100,
    // filter: true,
    resizable: true,
    // floatingFilter: true,
    flex: 1,
  };
  sideBar = {
    // toolPanels: ['columns', 'filters']
    toolPanels: ['columns']
  };
  rowSelection = 'multiple';

  stopSpinner: boolean = false;
  hasSsuperTemUsers: boolean = false;

  private _unsubscribeNotes: Subject<any> = new Subject<any>();
  private _unsubscribeActive: Subject<any> = new Subject<any>();

  // p-table start
  sidebarVisible: boolean = false;
  files: TreeNode[];
  TotalCount = 0;
  selectedRecords: any[] = [];
  public selectedNotes = [];

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
  isAllSelected: boolean = false; // Track "Select All" state
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

  private _unsubscribeService: Subject<any> = new Subject<any>();

  public getDataPath: any = (data: any) => data.dataPath;

  pTableContain = { first: 1 };
  finalFilterdArr: any;
  innerLoading = false;
  @ViewChild('treeTable') treeTable!: any;
  @ViewChild('contextMenu') contextMenu: any;
  selectedNode: any;
  public exportAccounts: any;
  headerCheckboxData = false;
  @HostListener('document:click', ['$event']) onClick(event: Event) {
    const clickedInsideMenu = this.contextMenu.el.nativeElement.contains(event.target);
    if (!clickedInsideMenu) {
      this.contextMenu.hide();
    }
  }


  constructor(private locationService: LocationService, public dialog: MatDialog) { }

  ngAfterViewInit() {
    const scrollableBody = this.treeTable.el.nativeElement.querySelector(
      '.p-treetable-scrollable-body'
    );

    if (scrollableBody) {
      scrollableBody.addEventListener('scroll', this.onScroll.bind(this));
    }
  }

  setCols() {
    this.hasSsuperTemUsers = this.locationService.isUserHasSuperTEMUsersRole();

    if (this.hasSsuperTemUsers) {
      this.cols = [
        createColumn(1, '54px', true, '', '', 'checkbox', ''),
        createColumn(2, '170px', true, '', '', 'PeopleName', 'Name'),
        createColumn(3, '104px', true, '', '', 'PeopleNoteCreatedDate', 'Date'),
        createColumn(4, '300px', true, '', '', 'Notes', 'Notes'),
        createColumn(5, '140px', true, '', '', 'IsPeopleNoteAttachment', 'Attachments'),
        createColumn(6, '130px', true, '', '', 'PeopleNoteStatus', 'Note Status'),
        createColumn(7, '110px', true, '', '', 'NoteType', 'Note Type'),
        createColumn(8, '300px', true, '', '', 'PeopleNoteCreatedByWithEmail', 'Who')
      ];
    } else {
      this.cols = [
        createColumn(1, '54px', true, '', '', 'checkbox', ''),
        createColumn(2, '170px', true, '', '', 'PeopleName', 'Name'),
        createColumn(3, '104px', true, '', '', 'PeopleNoteCreatedDate', 'Date'),
        createColumn(4, '300px', true, '', '', 'Notes', 'Notes'),
        createColumn(5, '140px', true, '', '', 'IsPeopleNoteAttachment', 'Attachments'),
        createColumn(6, '130px', true, '', '', 'PeopleNoteStatus', 'Note Status'),
        createColumn(7, '300px', true, '', '', 'PeopleNoteCreatedByWithEmail', 'Who')
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
        if (col.field != 'checkbox') {
          this.filesColumns.push(data)
        }

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
    this.hasSsuperTemUsers = this.locationService.isUserHasSuperTEMUsersRole();
    if (this.hasSsuperTemUsers) {
      this.cols = [
        { field: 'PeopleName', header: 'Name', width: '160px', spinner: true },
        { field: 'PeopleNoteCreatedDate', header: 'Date', width: '104px', spinner: true },
        { field: 'Notes', header: 'Notes', width: '160px', spinner: true },
        { field: 'IsPeopleNoteAttachment', header: 'Attachments', width: '140px', spinner: true },
        { field: 'PeopleNoteStatus', header: 'Note Status', width: '132px', spinner: true },
        { field: 'NoteType', header: 'Note Type', width: '123px', spinner: true },
        { field: 'PeopleNoteCreatedByWithEmail', header: 'Who', width: '200px', spinner: true },
      ];
    } else {
      this.cols = [
        { field: 'PeopleName', header: 'Name', width: '160px', spinner: true },
        { field: 'PeopleNoteCreatedDate', header: 'Date', width: '104px', spinner: true },
        { field: 'Notes', header: 'Notes', width: '160px', spinner: true },
        { field: 'IsPeopleNoteAttachment', header: 'Attachments', width: '140px', spinner: true },
        { field: 'PeopleNoteStatus', header: 'Note Status', width: '132px', spinner: true },
        { field: 'PeopleNoteCreatedByWithEmail', header: 'Who', width: '200px', spinner: true },
      ];
    }

    // this.getPeopleNotes();
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
  }

  getPeopleNotes() {

    let data;

    if (this.hasSsuperTemUsers) {
      data = {
        "peopleId": this.peopleData.PeopleId,
        "privateNote": null,
        "status": null,
        "isNeed3RecordOnly": null
      }
    } else {
      data = {
        "peopleId": this.peopleData.PeopleId,
        "privateNote": false,
        "status": null,
        "isNeed3RecordOnly": null
      }
    }

    this._unsubscribeNotes.next(null);
    this.locationService.getPeopleNotes(data).pipe(takeUntil(this._unsubscribeNotes)).subscribe((res: any) => {
      if (res && res.Success) {
        this.stopSpinner = true;
        this.rowData = res.Data.$values;
        _.map(this.rowData, (x: any) => {
          const a = x;
          a['PeopleNoteCreatedDate'] = x.PeopleNoteCreatedDate ? this.createDateFormatter(x.PeopleNoteCreatedDate) : '';
          return a;
        });
      } else {
        this.stopSpinner = true;
        this.rowData = [];
      }
    }, (error) => {
      this.stopSpinner = true;
      this.rowData = [];
    });
  }

  buttonClickedForPeople(rowData: any) {
    this.locationService.downloadPeopleNote(rowData.PeopleNoteId).subscribe({
      next: (dataa: any) => {
        let bolbUrl = URL.createObjectURL(dataa);
        var link = document.createElement("a");
        link.setAttribute("href", bolbUrl);

        link.setAttribute("download", rowData.UploadFileName);
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
      error: error => {

      }
    });
  }

  createDateFormatter(data: any) {
    if (data) {
      let date = new Date(data);
      return moment(date).format('MM/DD/YYYY');
    }
    return '';
  }

  addNotes() {
    const dialogRef = this.dialog.open(AddPeopleNotesDialogComponent, {
      panelClass: ['width-900', 'popup-custom-design'],
      data: { rowData: this.rowData, peopleData: this.peopleData },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // this.getPeopleNotes();
        this.loadNodes(this.pTableContain, true);
      }
    });
  }


  onHeaderCheckboxChange(e: any) {
    this.headerCheckboxData = e.target.checked;

    if (this.files.length > 0 && this.headerCheckboxData) {
      this.selectedRecords = this.files;
      const selectedInventory: any = [];
      this.selectedRecords.forEach((e: any) => {
        selectedInventory.push(e['data']['PeopleNoteId'])
      });
      this.peopleNoteIds = selectedInventory;
    }
    if (!this.headerCheckboxData) {
      this.selectedRecords = [];
      this.peopleNoteIds = [];
    }

  }

  selectChildCheckbox(e: any) {
    if (this.selectedRecords.length === this.files.length) {
      this.headerCheckboxData = true;
    } else {
      this.headerCheckboxData = false;
    }
  }


  setInventoryNotes(type: any) {
    const selectedPeopleNotesId: any = [];
    // const selectedPeopleNotes: any = [];
    this.selectedRecords.forEach((e: any) => {
      this.peopleId = this.peopleData.PeopleId;
      selectedPeopleNotesId.push(e['data']['PeopleNoteId']);
      // selectedPeopleNotes.push(e);
    });
    this.peopleNoteIds = selectedPeopleNotesId;
    // this.peopleNotesData = selectedPeopleNotes;

    if (this.selectedRecords.length == 0) {
      let errorData: any = {
        messgeType: "error",
        title: "Attention",
        titleClass: "text-c-blue",
        icon: "fas fa-exclamation-circle",
        iconClass: "text-c-blue f-70",
        message: 'Please select at least 1 note.'
      }
      this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
    } else {
      if (this.selectedRecords.length >= 1) {
        let isInActive = _.some(this.selectedRecords, (x: any) => x['data'].PeopleNoteStatus == 'Inactive');
        let isActive = _.some(this.selectedRecords, (x: any) => x['data'].PeopleNoteStatus == 'Active');
        if (isInActive && type == 'inactive') {
          let errorData: any = {
            messgeType: "error",
            title: "Attention",
            titleClass: "text-c-blue",
            icon: "fas fa-exclamation-circle",
            iconClass: "text-c-blue f-70",
            message: 'Please select Active notes to change the status to Inactive.'
          }
          this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
        } else if (isActive && type == 'active') {
          let errorData: any = {
            messgeType: "error",
            title: "Attention",
            titleClass: "text-c-blue",
            icon: "fas fa-exclamation-circle",
            iconClass: "text-c-blue f-70",
            message: 'Please select Inactive notes to change the status to Active.'
          }
          this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
        } else {
          const data: any = {};
          data['peopleId'] = this.peopleId;
          data['peopleNoteIds'] = this.peopleNoteIds;
          data['active'] = (type == 'active') ? true : false;
          this._unsubscribeActive.next(null);
          this.locationService.makePeopleNotesStatusActive(data).pipe(takeUntil(this._unsubscribeActive)).subscribe((response) => {
            if (response.Success) {
              // this.selectedRows = 0;
              this.errorPopup(response);
              this.selectedRecords = [];
              // this.getPeopleNotes();
              this.loadNodes(this.pTableContain, true);
              this.headerCheckboxData = false;
            } else {
              // this.selectedRows = 0;
              this.selectedRecords = [];
              this.errorPopup(response);
            }
          }, error => {
            // this.selectedRows = 0;
            this.selectedRecords = [];
            this.errorPopup(error);
          });
        }
      }
    }
  }

  errorPopup(data: any) {
    let errorData: any = {
      messgeType: 'error',
      title: 'Attention',
      titleClass: 'text-c-blue',
      icon: 'fas fa-exclamation-circle',
      iconClass: 'text-c-blue f-70',
      message: data.Message,
    };
    const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
      panelClass: 'error-warning',
      data: errorData,
    });
    dialogRef.afterClosed().subscribe((result) => {
    });
  }
  // P-Table code >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

  loadNodes(event?: any, allOptionsClear = false) {
    if (!event?.sortField) {
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



      let data;

      if (this.hasSsuperTemUsers) {
        data = {
          "peopleId": this.peopleData.PeopleId,
          "privateNote": null,
          "status": null,
          "isNeed3RecordOnly": null
        }
      } else {
        data = {
          "peopleId": this.peopleData.PeopleId,
          "privateNote": false,
          "status": null,
          "isNeed3RecordOnly": null
        }
      }

      this.finalAllDetailArr = data;
      this._unsubscribeNotes.next(null);
      if (allOptionsClear) this.files = [];

      this.locationService.getPeopleNotes(data).pipe(takeUntil(this._unsubscribeNotes)).subscribe(
        response => this.handleResponse(response, allOptionsClear),
        () => this.handleError()
      );

    }
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

  toggleSelectAll(event: any) {
    this.isAllSelected = event.checked;

    if (this.isAllSelected) {
      this.selectedRecords = this.files.map(node => node.data);
    } else {
      this.selectedRecords = [];
    }
  }

  onChangeEndDate(e: any, fromFront = true) {

    const date = new Date(e);
    if (isNaN(date.getTime())) {
      return '';
    }
    if (date) {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();

      if (fromFront) {
        return `${day}-${month}-${year}`
      } else {
        return `${year}-${month}-${day}`;
      }
    }
    return '';
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
      // ...(this.sorting ? { OrderBy: this.sorting, SortOrder: this.sortingType } : {}),
    };

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
  sortField: string = '';
  sortOrder: number = 1;
  compare(a: any, b: any) {
    if (typeof a === 'string') {
      return a.localeCompare(b) * this.sortOrder;
    } else {
      return (a - b) * this.sortOrder;
    }
  }

  OrderBy(field: any) {

    if (!this.sorting || this.sorting === '') {
      this.sorting = field;
      this.cols.forEach((item) => {
        if (item.field === field) {
          item.sorting = 'asc';
          this.sortingType = item.sorting;
        } else {
          item.sorting = 'None';
        }
      });
    } else if (this.sorting === field) {
      this.sorting = field;
      this.cols.forEach((item) => {
        if (item.field === field) {
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
    } else if (this.sorting != field) {
      this.sorting = field;
      this.cols.forEach((item) => {
        if (item.field === field) {
          item.sorting = 'asc';
          this.sortingType = item.sorting;
        } else {
          item.sorting = 'None';
        }
      });
    }
    
    if (this.sortField === field) {
      this.sortOrder = this.sortOrder * -1;
    } else {
      this.sortField = field;
      this.sortOrder = 1;
    }
    this.files = [...this.files.sort((a, b) => this.compare(a.data[field], b.data[field]))];

    this.files.forEach(node => {
      if (node.children) {
        node.children = [...node.children.sort((a, b) => this.compare(a.data[field], b.data[field]))];
      }
    });

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

        textboxValue1 = this.onChangeEndDate(textboxValue1, false);
        textboxValue2 = textboxValue2 ? this.onChangeEndDate(textboxValue2, false) : null;

        selectedOption1 = this.filterArrayDate[index].filterOptionType1;
        selectedOption2 = this.filterArrayDate[index].filterOptionType2;

        model = { option: this.model.option };

        if (selectedOption1 === 'inrange') {
          this.textboxValue1_1 = this.onChangeEndDate(this.filterArrayDate[index].filterOptionValue1_2, false);
        }

        if (selectedOption2 === 'inrange') {
          this.textboxValue2_1 = this.onChangeEndDate(this.filterArrayDate[index].filterOptionValue2_2, false);
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
      txtVal1 = txtVal1 ? this.onChangeEndDate(this.textboxValue1, false) : null;
      txtVal2 = txtVal2 ? this.onChangeEndDate(this.textboxValue2, false) : null;
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
        arrDate['filterOptionValue1_2'] = this.onChangeEndDate(this.textboxValue1_1, false);
      } else {
        arrDate['filterOptionValue1_2'] = this.textboxValue1_1;
      }
    }

    if (arrDate.filterOptionType2 === 'inrange' && (this.textboxValue2_1 != null && this.textboxValue2_1 !== '')) {
      if (this.fieldsName.type === 'dateFilter') {
        arrDate['filterOptionValue2_2'] = this.onChangeEndDate(this.textboxValue2_1, false);
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

  onFilterChangedFirst(value: any) {
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
        if (col.type == 'numberFilter') {
          if (!this.validateNumberInput(e.target.value, true)) {
            return
          }
        }
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

  updateSelectAllState() {
    this.isAllSelected = this.selectedRecords.length === this.files.length;
  }

  dropdownOptionSelected() {
    navigator.clipboard.writeText(this.selectedNode).then(
      () => {
      },
      (err) => {
      }
    );
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

  ngOnDestroy() {
    this._unsubscribeNotes.next(null);
    this._unsubscribeNotes.complete();
    this._unsubscribeActive.next(null);
    this._unsubscribeActive.complete();
  }
}
