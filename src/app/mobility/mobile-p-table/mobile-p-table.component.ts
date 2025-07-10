import { Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { Subject } from 'rxjs';
import { LocationService } from '../../services/location.service';
import { takeUntil } from 'rxjs/operators';
import * as _ from 'lodash';
import { WirelineService } from '../../services/wireline.service';
import { Router } from '@angular/router';
import { rolePermission } from '../../services/helper';
import { createColumn } from 'src/app/utils/column-utils';
import { onChangeEndDate } from 'src/app/services/common-p-table';
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
  selector: 'app-mobile-p-table',
  templateUrl: './mobile-p-table.component.html',
  styleUrls: ['./mobile-p-table.component.scss'],
  imports: [SharedModule, PrimgModule],
})
export class MobilePTableComponent implements OnInit {


  @Input() selectedTem: any;
  @Input() selectedCustomer: any;
  serviceIds: any = [];
  services: any;
  @Output() isBillingAccountExist: EventEmitter<any> = new EventEmitter();
  @Output() exportAccountData: EventEmitter<any> = new EventEmitter();
  @Output() rowCellDoubleClicked: EventEmitter<any> = new EventEmitter();
  
  needToPassTemId: boolean = false;

  rowData: any = [];
  stopSpinner: boolean = false;
  sidebarVisible: boolean = false;

  files: TreeNode[];

  @ViewChild('myModal') myModal: any;
  filterArray: arrDate[];
  filterArrayDate: arrDate[];
  filterArrayNumber: arrDate[];

  cols: any[];
  displaycols: any[];
  items: any[];
  colsshow: any[];
  totalRecords: number;
  loading: boolean = true;
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
 

    this.cols = [
      createColumn(1, '200px', true, 'text', 'Inventory', 'ServiceNumber', 'Service Number'),
      // createColumn(1, '250px', false, 'text', '', 'BillingId', 'Billing ID'),
      createColumn(1, '165px', false, 'text', '', 'InventoryCustomField1', 'Service Custom 1', 'open'),
      createColumn(1, '200px', false, 'text', '', 'InventoryCustomField2', 'Service Custom 2', 'open'),
      createColumn(1, '160px', false, 'text', '', 'InventoryCustomField3', 'Service Custom 3', 'open'),
      createColumn(1, '200px', false, 'text', '', 'InventoryCustomField4', 'Service Custom 4', 'open'),

      createColumn(2, '230px', true, 'text', 'Organization', 'CustomerAccountName', 'Customer', 'close', 1, 150, true, true, false),
      createColumn(2, '210px', false, 'text', '', 'CompanyName', 'Company', 'close', 1, 150, true, true, false),

      createColumn(3, '190px', true, 'text', 'People', 'PeopleName', 'Name'),
      createColumn(3, '175px', false, 'text', '', 'PeopleFirstName', 'First Name', 'open'),
      createColumn(3, '250px', false, 'text', '', 'PeopleLastName', 'Last Name', 'open'),
      createColumn(3, '150px', false, 'text', '', 'PeopleStatusDisplayValue', 'People Status', 'open'),
      createColumn(3, '200px', false, 'text', '', 'PeopleEmail', 'Contact', 'open'),
      createColumn(3, '250px', false, 'text', '', 'PeopleUserTitle', 'Title', 'open'),
      createColumn(3, '250px', false, 'text', '', 'EmployeeId', 'Employee ID', 'open'),
      createColumn(3, '250px', false, 'text', '', 'ManagerName', 'Manager', 'open'),
      createColumn(3, '250px', false, 'text', '', 'ManagerEmail', 'Manager Email', 'open'),
      createColumn(3, '250px', false, 'text', '', 'Department', 'Department', 'open'),
      createColumn(3, '250px', false, 'text', '', 'PeopleCustomField1', 'People Custom 1', 'open'),
      createColumn(3, '250px', false, 'text', '', 'PeopleCustomField2', 'People Custom 2', 'open'),
      createColumn(3, '250px', false, 'text', '', 'PeopleCustomField3', 'People Custom 3', 'open'),
      createColumn(3, '250px', false, 'text', '', 'PeopleCustomField4', 'People Custom 4', 'open'),
      createColumn(3, '120px', false, 'text', '', 'PeoplePrimaryDisplay', 'Primary', 'open'),

      // createColumn(4, '190px', true, 'text', 'Contact', 'PeopleEmail', 'Email'),

      createColumn(4, '190px', true, 'text', 'Vendor', 'VendorAccountName', 'Vendor'),
      createColumn(4, '175px', false, 'text', '', 'ParentVendorAccountName', 'Parent Vendor', 'open'),
      createColumn(4, '250px', false, 'text', '', 'MainAccountNumber', 'Main Account Number', 'open'),
      createColumn(4, '250px', false, 'text', '', 'SubAccountNumber', 'Sub Account Number', 'open'),
      createColumn(4, '250px', false, 'text', '', 'PayableAccountNumber', 'Payable Account Number', 'open'),

      createColumn(5, '180px', true, 'text', 'Product', 'VendorProductTypeName', 'Vendor Product'),
      createColumn(5, '170px', false, 'text', '', 'Service', 'Service', 'open'),
      createColumn(5, '170px', false, 'text', '', 'ServiceType', 'Service Type', 'open'),
      createColumn(5, '170px', false, 'text', '', 'Product', 'Product', 'open'),
      createColumn(5, '170px', false, 'text', '', 'ProductType', 'Product Type', 'open'),

      createColumn(6, '170px', true, 'numberFilter', 'Cost', 'TotalCurrentChargesDisplay', 'Current Charges'),
      createColumn(6, '180px', false, 'numberFilter', '', 'PreviousBillBalanceDisplay', 'Previous Charges', 'open'),
      createColumn(6, '170px', false, 'text', '', 'LastInvoiceDate', 'Last Billing Period', 'open'),
      createColumn(6, '100px', false, 'text', '', 'BillingChargeDisplayText', 'Billing', 'open'),

      createColumn(7, '100px', true, 'text', 'Status', 'InventoryStatusDisplayText', 'Status'),
      createColumn(7, '180px', false, 'dateFilter', '', 'StartDate', 'Service Start Date', 'open'),
      createColumn(7, '190px', false, 'dateFilter', '', 'EndDate', 'Disconnection Date', 'open'),
      createColumn(7, '230px', false, 'numberFilter', '', 'InvoiceCyclesRemaining', 'Invoice Cycles Remaining', 'open'),
      createColumn(7, '190px', false, 'dateFilter', '', 'ContractStartDate', 'Contract Start Date', 'open'),
      createColumn(7, '190px', false, 'dateFilter', '', 'ContractEndDate', 'Contract End Date', 'open'),

      createColumn(8, '200px', true, 'text', 'Location', 'LocationName', 'Name'),
      createColumn(8, '100px', false, 'text', '', 'LocationStatus', 'Status', 'open'),
      createColumn(8, '200px', false, 'text', '', 'Address1', 'Address One', 'open'),
      createColumn(8, '200px', false, 'text', '', 'Address2', 'Address Two', 'open'),
      createColumn(8, '200px', false, 'text', '', 'City', 'City', 'open'),
      createColumn(8, '200px', false, 'text', '', 'StateName', 'State/Province/Region', 'open'),
      createColumn(8, '200px', false, 'text', '', 'PostalCode', 'Zip/Postal Code', 'open'),
      createColumn(8, '120px', false, 'text', '', 'LocationPrimaryDisplay', 'Primary', 'open'),

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
   this.needToPassTemId = rolePermission(['CustomerAdmin','CompanyUser', 'CompanyManager', 'CompanyAdmin']);


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

  getServices() {

    const pageMappings = ['wireline', 'mobility', 'cloud'];
    const pagename = pageMappings.find((page) =>
      this.router.url.toLowerCase().includes(page.toLowerCase())
    ) || null;

    let data = {
      "industryId": null,
      "serviceId": null,
      "serviceTypeId": null,
      "productId": null,
      "productTypeId": null,
      "inventoryType": pagename
    }
    this._unsubscribeService.next(null);
    this.loading = false;
    this.locationService.getServicesList(data).pipe(takeUntil(this._unsubscribeService)).subscribe((data) => {
      if (data.Success) {
        this.services = data.Data.$values;
        const mappedServieIds = _.map(this.services, (obj: any) => {
          if (obj.Name == 'Wireless' || obj.Name == 'Mobility') {
            return obj.Id;
          }
        });
        const filteredIds = _.filter(mappedServieIds, id => id !== undefined);
        this.serviceIds = filteredIds;

        this.loadNodes(this.pTableContain, true)
      } else {
      }
    }, error => {
      this.services = [];
    });
  }

  loadNodes(event: any, allOptionsClear = false) { 
    setTimeout(() => {
    this.loading = true;
    // if (this.serviceIds.length === 0) {
    //   this.getServices();
    // } else {

    const pageMappings = ['wireline', 'mobility', 'cloud'];
    const pagename = pageMappings.find((page) =>
      this.router.url.toLowerCase().includes(page.toLowerCase())
    ) || null;

    // Initialize pagination if not set
    this.isApiAlerdayCall = true;
    this.pTableContain.first = this.pTableContain?.first || 1;
    if (allOptionsClear) {
      this.pTableContain.first = 1;
    }
    const data = {
      ...this.finalFilterdArr,
      startRowIndex: this.pTableContain.first,
      maximumRows: 100,
      ...(!this.needToPassTemId && this.selectedTem && this.selectedTem !== 'all' ? { TEMAccountId: this.selectedTem } : {}),
      ...(this.selectedCustomer && this.selectedCustomer !== 'all' ? { customerAccountId: this.selectedCustomer } : {}),
      ...(this.sorting ? { OrderBy: this.sorting, SortOrder: this.sortingType } : {}),
      IsTotalNeed: true,
      inventoryType: pagename
    };
    this.finalAllDetailArr = data;
    this._unsubscribeGRid.next(null);

    // Clear files if needed
    if (allOptionsClear) this.files = [];

    this.wirelineService.getInventoryData(data)
      .pipe(takeUntil(this._unsubscribeGRid))
      .subscribe(
        response => this.handleResponse(response, allOptionsClear),
        () => this.handleError()
      );
    // }
    }, 100);
  }

  // Handle the response for loadNodes
  handleResponse(response: any, allOptionsClear: any) {
    this.loading = false;
    this.totalRecords = response.TotalCount;

    if (response?.Data?.$values?.length) {
      const resData = response.Data.$values.map(this.extractDataAndLeaf.bind(this));
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
      leaf: !item.HasParent,
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

    // Check if the node has children
    if (!node.children || node.children.length === 0) {
      this.innerLoading = true;

    const pageMappings = ['wireline', 'mobility', 'cloud'];
    const pagename = pageMappings.find((page) =>
      this.router.url.toLowerCase().includes(page.toLowerCase())
    ) || null;

      this.expandedNode = node;
      // Build the data request object
      const data = {
        ...this.finalFilterdArr,
        startRowIndex: 1,
        level: node.data.Level,
        maximumRows: 10000,
        IsTotalNeed: true,
        ParentVendorProductInventoryId: node.data.VendorProductInventoryId,
        ...(this.selectedTem && this.selectedTem !== 'all' ? { TEMAccountId: this.selectedTem } : {}),
        ...(this.selectedCustomer && this.selectedCustomer !== 'all' ? { customerAccountId: this.selectedCustomer } : {}),
        inventoryType: pagename
      };

      this._unsubscribeGRid.next(null);

      // Make the API call
      this.wirelineService.getInventoryData(data)
        .pipe(takeUntil(this._unsubscribeGRid))
        .subscribe(
          response => this.handleNodeResponse(response, node),
          () => this.handleNodeError()
        );
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
        "FieldName": x.field == 'LastInvoiceDate' ? 'LastInvoiceDateDisplay' : x.field,
        "Title": x.childHeader,
        "isCurrency": x.field == 'TotalCurrentChargesDisplay' || x.field == 'PreviousBillBalanceDisplay' ? true : false
      });

    });
    const pageMappings = ['wireline', 'mobility', 'cloud'];
    const pagename = pageMappings.find((page) =>
      this.router.url.toLowerCase().includes(page.toLowerCase())
    ) || null;
    this.exportAccounts = {
      ExportToExcelData: {
        HeaderData: headerData,
        ChildHeaderData: ChildHeaderData,
        fileName: "Inventory"
      },
      IsTotalNeed: true,
      inventoryType: pagename,
      ExportToExcel: true,
      ...(this.finalFilterdArr === undefined ? {} : this.finalFilterdArr),
      ...(this.selectedTem && this.selectedTem !== 'all' ? { TEMAccountId: this.selectedTem } : {}),
      ...(this.sorting ? { OrderBy: this.sorting, SortOrder: this.sortingType } : {}),
      ...(this.selectedCustomer && this.selectedCustomer !== 'all' ? { customerAccountId: this.selectedCustomer } : {}),
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
      filterOptionType2: txtVal2 ? (this.selectedOption2) ? this.selectedOption2 : 'contains' : null,
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
      }
    } else {
      this.textboxValue1 = e.target.value;
      if(col.type == 'numberFilter') {
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

}
