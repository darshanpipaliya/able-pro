import { Component, EventEmitter, HostListener, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as _ from 'lodash';

import { MatDialog } from '@angular/material/dialog';
import { extractDataAndLeaf, filterOptionsDate, filterOptionsNumber, filterOptionsText, onChangeEndDate } from 'src/app/services/common-p-table';
import { WirelineService } from 'src/app/services/wireline.service';
import { VariableManageService } from 'src/app/services/variable-manage.service';
import { DatePipe } from '@angular/common';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { createColumn } from 'src/app/utils/column-utils';
import { api_list } from 'src/app/services/api-list';
import { CommonPTreeTableComponent } from 'src/app/common/common-p-tree-table/common-p-tree-table.component';

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
  selector: 'app-p-tree-inventory-contract',
  templateUrl: './p-tree-inventory-contract.component.html',
  styleUrls: ['./p-tree-inventory-contract.component.scss'],
  providers: [DatePipe, WirelineService, VariableManageService],
  imports: [
    SharedModule,
    PrimgModule,
    CommonPTreeTableComponent
  ]
})
export class PTreeInventoryContractComponent implements OnInit {

  @Input() inventoryData: any;
  @Input() serviceIds: any;
  @Input() tabData: any;
  @Input() overviewData: any;

  services: any;
  @Output() isBillingAccountExist: EventEmitter<any> = new EventEmitter();
  @Output() exportAccountData: EventEmitter<any> = new EventEmitter();
  @Output() selectedRowsEmit: EventEmitter<any> = new EventEmitter();
  @Output() disableLinkDialog: EventEmitter<any> = new EventEmitter();
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

  private _unsubscribeGRid: Subject<any> = new Subject<any>();
  private _unsubscribeService: Subject<any> = new Subject<any>();

  pTableContain = { first: 1 };
  finalFilterdArr: any;
  innerLoading = false;
  @ViewChild('treeTable') treeTable!: any;
  @ViewChild('contextMenu') contextMenu: any;
  selectedNode: any;
  public exportAccounts: any;
  selectedRecords: any = [];
  headerCheckboxData = false;
  public selectedInventory: any;
  selectedRows: number = 0;
  @ViewChild('VendorProductInventory') VendorProductInventory!: TemplateRef<any>;


  payload: any;
  GridAPI: any = api_list.Inventory.GridData;
  refreshbutton: boolean = false;
  preAppliedfilterArr: any[] = [];
  tableDataExist: boolean = false;
  loader: boolean = false;
  constructor(public wirelineService: WirelineService,
    public variableManageService: VariableManageService,
    public dialog: MatDialog
  ) {
  }

  onSelectionChanged(event: any[]) {
    this.selectedRows = event.length;
    const selectedInventory: any = [];

    event.forEach((e: { VendorProductInventoryId: any; }) => {
      selectedInventory.push(e.VendorProductInventoryId)
    });
    this.selectedInventory = selectedInventory;
  }

  setCols() {

    // Initialize parent counter
    let currentParent = 0;

    // Function to determine parent ID
    const getParentId = (isChild: boolean) => isChild ? ++currentParent : currentParent;

    this.cols = [
      createColumn(getParentId(true), '150px', true, 'text', 'Inventory', 'ServiceNumber', 'Service Number'),
      createColumn(currentParent, '150px', false, 'text', '', 'MainAccountNumber', 'Main Account Number', 'open'),
      createColumn(currentParent, '150px', false, 'text', '', 'SubAccountNumber', 'Sub Account Number', 'open'),
      createColumn(currentParent, '150px', false, 'text', '', 'PayableAccountNumber', 'Payable Account Number', 'open'),

      createColumn(getParentId(true), '150px', true, 'text', 'Organization', 'CustomerAccountName', 'Customer'),
      createColumn(currentParent, '150px', false, 'text', '', 'CompanyName', 'Company'),

      createColumn(getParentId(true), '150px', true, 'text', 'Vendor', 'VendorAccountName', 'Vendor'),

      createColumn(getParentId(true), '150px', true, 'text', 'Product', 'VendorProductName', 'Vendor Product'),
      createColumn(currentParent, '150px', false, 'text', '', 'Service', 'Service', 'open'),
      createColumn(currentParent, '150px', false, 'text', '', 'ServiceType', 'Service Type', 'open'),
      createColumn(currentParent, '150px', false, 'text', '', 'Product', 'Product', 'open'),
      createColumn(currentParent, '150px', false, 'text', '', 'ProductType', 'Product Type', 'open'),

      createColumn(getParentId(true), '150px', true, 'text', 'Status', 'InventoryStatusDisplayText', 'Status'),

      createColumn(getParentId(true), '150px', true, 'text', 'Location', 'LocationName', 'Location Name'),
      createColumn(currentParent, '150px', false, 'text', '', 'Address1', 'Address One', 'open'),
      createColumn(currentParent, '150px', false, 'text', '', 'Address2', 'Address Two', 'open'),
      createColumn(currentParent, '150px', false, 'text', '', 'City', 'City', 'open'),
      createColumn(currentParent, '150px', false, 'text', '', 'CountryName', 'Country', 'open'),
      createColumn(currentParent, '150px', false, 'text', '', 'StateName', 'State/Province', 'open'),
      createColumn(currentParent, '150px', false, 'text', '', 'PostalCode', 'Zip/Postal Code', 'open'),

      createColumn(getParentId(true), '150px', true, 'text', 'Person', 'PeopleName', 'Name'),
      createColumn(currentParent, '150px', false, 'text', '', 'PeopleEmail', 'Email', 'open'),
      createColumn(currentParent, '150px', false, 'text', '', 'PeopleStatusDisplayValue', 'User Status', 'open'),
    ];


  }

  ngOnDestroy(): void {
    this._unsubscribeGRid.next(null);
    this._unsubscribeGRid.complete();
    this._unsubscribeService.next(null);
    this._unsubscribeService.complete();
  }

  ngOnInit(): void {
    this.preAppliedfilterArr = this.preDefinedFilterFn();
    this.payload = {
      ...(this.tabData?.VendorAccountId) ? { VendorAccountId: this.tabData?.VendorAccountId } : {},
      ...(this.tabData?.CustomerAccountId) ? { CustomerAccountId: this.tabData?.CustomerAccountId } : {},
      ...(this.tabData?.CompanyId) ? { CompanyId: this.tabData?.CompanyId } : {},
      ...(this.tabData?.ContractId) ? { ContractId: this.tabData?.ContractId } : {},
    }
    this.setCols();
  }

  preDefinedFilterFn() {
    if (!Array.isArray(this.preAppliedfilterArr) || this.preAppliedfilterArr.length === 0) {
      this.preAppliedfilterArr = [
        {
          "filterKey": "InventoryLocationAtt",
          "filterOptionType1": "Equal",
          "filterOptionValue1": "Yes",
          "filterOperationType": "AND",
          "filterOptionType2": null,
          "filterOptionValue2": null
        },
        {
          "filterKey": "InventoryStatusDisplayText",
          "filterOptionType1": "equals",
          "filterOptionValue1": "Pending Activation",
          "filterOperationType": "OR",
          "filterOptionType2": "equals",
          "filterOptionValue2": "Active"
        }
      ];
    } else if (this.preAppliedfilterArr.length > 0) {
      this.preAppliedfilterArr.push(
        {
          "filterKey": "InventoryLocationAtt",
          "filterOptionType1": "Equal",
          "filterOptionValue1": "Yes",
          "filterOperationType": "AND",
          "filterOptionType2": null,
          "filterOptionValue2": null
        },
        {
          "filterKey": "InventoryStatusDisplayText",
          "filterOptionType1": "equals",
          "filterOptionValue1": "Pending Activation",
          "filterOperationType": "OR",
          "filterOptionType2": "equals",
          "filterOptionValue2": "Active"
        }
      );
    }
    return this.preAppliedfilterArr;

  }

  refreshbuttonEmitFn(event: any) {
    this.refreshbutton = event;
  }

  onNodeSelect(event: any) {
    this.selectedNode = event.node;
  }

  tableDataExistFn(event: any) {
    this.tableDataExist = event;
    this.disableLinkDialog.emit(false);
  }

  exportAccountDataFn(event: any) {
    this.exportAccountData.emit(event)
  }

  selectedRowsEmitFn(event: any) {
    this.selectedRowsEmit.emit(event)
  }

  rowCellDoubleClickedFn(event: any) {
    this.rowCellDoubleClicked.emit(event)
  }
  totalRecordsEmitFn(event: any) {
    this.totalRecords = event;
  }
  loaderEmitFn(event: any) {
    this.loader = event;
  }
  setColumnDefs() {

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

  onRowDoubleClick(data: any) {
    let datas = {
      data: data
    }
    this.rowCellDoubleClicked.emit(datas);
  }
}
