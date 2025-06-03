import { Component, EventEmitter, HostListener, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as _ from 'lodash';

import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { extractDataAndLeaf, filterOptionsDate, filterOptionsNumber, filterOptionsText, onChangeEndDate } from 'src/app/services/common-p-table';
import { WirelineService } from 'src/app/services/wireline.service';
import { VariableManageService } from 'src/app/services/variable-manage.service';
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
  selector: 'app-p-tree-select-invtry-contract',
  templateUrl: './p-tree-select-invtry-contract.component.html',
  styleUrls: ['./p-tree-select-invtry-contract.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    PrimgModule,
    CommonPTreeTableComponent
  ]
})
export class PTreeSelectInvtryContractComponent implements OnInit {

  @Input() inventoryData: any;
  @Input() serviceIds: any;
  @Input() dialogData:any;
  @Input() isSendVendorProductInventoryId:any;

  services: any;
  @Output() isBillingAccountExist: EventEmitter<any> = new EventEmitter();
  @Output() exportAccountData: EventEmitter<any> = new EventEmitter();
  @Output() selectedRowsEmit: EventEmitter<any> = new EventEmitter();
  @Output() disableLinkDialog: EventEmitter<any> = new EventEmitter();
  @Output() rowDatas: EventEmitter<any> = new EventEmitter();
  @Output() rowCellDoubleClicked: EventEmitter<any> = new EventEmitter();

  sidebarVisible: boolean = false;
  templateRef: any;
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
  @ViewChild('linkInventoryContract') linkInventoryContract!: TemplateRef<any>;
  constructor(public wirelineService: WirelineService,
     public variableManageService: VariableManageService,
    public dialog: MatDialog
  ) {
  }


  openDialog() {
    this.templateRef = this.dialog.open(this.linkInventoryContract, {
      width: '900px'
    });
  }
  
  closeModal() {
    this.templateRef.close();
  }

  onSelectionChanged(event: any) {
    this.selectedRows = event.length;
    const selectedInventory: any = [];

    event.forEach((e: any) => {
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
      createColumn(getParentId(true), '60px', true, 'checkbox', '', 'checkbox', ''),

      createColumn(getParentId(true), '150px', true, 'text', 'Inventory', 'ServiceNumber', 'Service Number'),
      createColumn(currentParent, '150px', false, 'text', '', 'MainAccountNumber', 'Main Account Number', 'open'),
      createColumn(currentParent, '150px', false, 'text', '', 'SubAccountNumber', 'Sub Account Number', 'open'),
      createColumn(currentParent, '150px', false, 'text', '', 'PayableAccountNumber', 'Payable Account Number', 'open'),

      createColumn(getParentId(true), '150px', true, 'text', 'Organization', 'CustomerAccountName', 'Customer'),
      createColumn(currentParent, '150px', false, 'text', '', 'CompanyName', 'Company'),

      createColumn(getParentId(true), '150px', true, 'text', 'Vendor', 'VendorAccountName', 'Vendor'),

      createColumn(getParentId(true), '150px', true, 'text', 'Product', 'VendorProductTypeName', 'Vendor Product'),
      createColumn(currentParent, '150px', false, 'text', '', 'Service', 'Service', 'open'),
      createColumn(currentParent, '150px', false, 'text', '', 'ServiceType', 'Service Type', 'open'),
      createColumn(currentParent, '150px', false, 'text', '', 'Product', 'Product', 'open'),
      createColumn(currentParent, '150px', false, 'text', '', 'ProductType', 'Product Type', 'open'),

      createColumn(getParentId(true), '150px', true, 'text', 'Status', 'InventoryStatusDisplayText', 'Status'),

      createColumn(getParentId(true), '150px', true, 'text', 'Contract', 'ContractDocumentName', 'Existing Contract'),

      createColumn(getParentId(true), '150px', true, 'text', 'Location', 'LocationName', 'Location Name'),
      createColumn(currentParent, '150px', false, 'text', '', 'Address1', 'Address 1', 'open'),
      createColumn(currentParent, '150px', false, 'text', '', 'Address2', 'Address 2', 'open'),
      createColumn(currentParent, '150px', false, 'text', '', 'City', 'City', 'open'),
      // createColumn(currentParent, '150px', false, 'text', '', 'CountryName', 'Country', 'open'),
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

  onNodeSelect(event: any) {
    this.selectedNode = event.node;
  }


  ngOnInit(): void {
    this.preAppliedfilterArr = this.preDefinedFilterFn();

    this.setCols();

    this.payload = {
      ...(this.dialogData?.VendorAccountId) ? { VendorAccountId: this.dialogData?.VendorAccountId } : {},
      ...(this.dialogData?.CustomerAccountId) ? { CustomerAccountId: this.dialogData?.CustomerAccountId } : {},
      ...(this.dialogData?.CompanyId) ? { CompanyId: this.dialogData?.CompanyId } : {},
      ...(this.dialogData?.ContractId) ? { ContractId: this.dialogData?.ContractId } : {},
      ...(this.headerCheckboxData ? { GetAll: this.headerCheckboxData } : {}),
      ...(this.isSendVendorProductInventoryId) ? { VendorProductInventoryId: this.dialogData?.VendorProductInventoryId } : {},
    }
  }

  loadNodes(event?: any, allOptionsClear = false, fromHeaderCheckBox = false) {
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

    if ((this.finalFilterdArr['advanceFilter'] ?? []).length === 0) {
      this.finalFilterdArr['advanceFilter'] = [
        {
          "filterKey": "InventoryStatusDisplayText",
          "filterOptionType1": "equals",
          "filterOptionValue1": "Pending Activation",
          "filterOperationType": "OR",
          "filterOptionType2": "equals",
          "filterOptionValue2": "Active"
        }
      ];
    } else if (this.finalFilterdArr['advanceFilter'].length > 0) {
      this.finalFilterdArr['advanceFilter'].push(
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

    this.finalFilterdArr['advanceFilter'] = Array.from(
      new Map(this.finalFilterdArr['advanceFilter'].map((item: any) => [JSON.stringify(item), item])).values()
    );
    const data = {
      ...this.finalFilterdArr,
      startRowIndex: this.pTableContain.first,
      maximumRows: 100,
      ...(this.sorting ? { OrderBy: this.sorting, SortOrder: this.sortingType } : {}),
      ...(this.dialogData?.VendorAccountId) ? { VendorAccountId: this.dialogData?.VendorAccountId } : {},
      ...(this.dialogData?.CustomerAccountId) ? { CustomerAccountId: this.dialogData?.CustomerAccountId } : {},
      ...(this.dialogData?.CompanyId) ? { CompanyId: this.dialogData?.CompanyId } : {},
      ...(this.dialogData?.ContractId) ? { ContractId: this.dialogData?.ContractId } : {},
      ...(this.headerCheckboxData ? { GetAll: this.headerCheckboxData } : {}),
      ...(this.isSendVendorProductInventoryId) ? { VendorProductInventoryId: this.dialogData?.VendorProductInventoryId } : {},

    };

    this.finalAllDetailArr = data;
    this._unsubscribeGRid.next(null);

    if (allOptionsClear) this.files = [];
    this.wirelineService.getInventoryData(data)
      .pipe(takeUntil(this._unsubscribeGRid))
      .subscribe(
        response => this.handleResponse(response, allOptionsClear, fromHeaderCheckBox),
        () => this.handleError()
      );
  }

  onNodeExpand(event: any) {
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
      ...(this.dialogData?.VendorAccountId) ? { VendorAccountId: this.dialogData?.VendorAccountId } : {},
      ...(this.dialogData?.CustomerAccountId) ? { CustomerAccountId: this.dialogData?.CustomerAccountId } : {},
      ...(this.dialogData?.CompanyId) ? { CompanyId: this.dialogData?.CompanyId } : {},
      ...(this.dialogData?.ContractId) ? { ContractId: this.dialogData?.ContractId } : {},
      ...(this.headerCheckboxData ? { GetAll: this.headerCheckboxData } : {}),
      ...(this.isSendVendorProductInventoryId) ? { VendorProductInventoryId: this.dialogData?.VendorProductInventoryId } : {},
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

  getCheckedNodes(nodes: TreeNode[]): TreeNode[] {
    let selected: TreeNode[] = [];
  
    for (const node of nodes) {
      if (node.data.InventoryLocationAtt === 'Yes') {
        selected.push(node);
      }
    }

    return selected;
  }

  handleResponse(response: any, allOptionsClear: any, fromHeaderCheckBox: any) {
    this.loading = false;
    this.totalRecords = response.TotalCount;

    this.disableLinkDialog.emit(false);
    if (response?.Data?.$values?.length) {
      const resData = response.Data.$values.map(extractDataAndLeaf.bind(this));
      this.files = allOptionsClear ? resData : [...this.files, ...resData];

      let b = this.files.map((item: any) => item?.data);
      this.rowDatas.emit(b)
      if (this.files.length > 0 && !fromHeaderCheckBox) {
        this.selectedRecords = this.getCheckedNodes(this.files);
        this.selectChildCheckbox();
      }
      this.selectedRecords = this.getCheckedNodes(this.files);
      if (this.headerCheckboxData) {
        this.selectedRecords = this.files;
      }

    } else {
      this.files = [];
    }
    
    this.files.length > 0 ? this.isBillingAccountExist.emit(true) : this.isBillingAccountExist.emit(false);
  }

  handleError() {
    this.disableLinkDialog.emit(false);
    this.loading = false;
    this.files = [];
  }

  setColumnDefs() {
  }

  selectChildCheckbox(e?:any) {
    
    if (this.files.length === this.selectedRecords.length){
      this.headerCheckboxData = true;
      } else {
      this.headerCheckboxData = false;
      }

    let b = this.selectedRecords.map((item: any) => item?.data);
    this.selectedRowsEmit.emit(b)
  }


  onRowDoubleClick(data: any) {
    let datas: any = {
      data: data
    }
    this.rowCellDoubleClicked.emit(datas);
  }

  getDisplayValue(rowData: any, field: string): string {
    if (!rowData[field]) return 'None';
  
    if (rowData['ContractId'] === this.dialogData?.ContractId) {
      return rowData[field];
    }
  
    if (rowData['ContractId'] !== null) {
      return `<a href="javascript:void(0);" style="text-decoration: underline;">${rowData[field]}</a>`;
    }
  
    return rowData[field];
  }

  onHeaderCheckboxChange(e: any) {
    this.headerCheckboxData = e.target.checked;
    if (this.headerCheckboxData) {
      this.loadNodes(this.pTableContain, true, true);
    }
    if (this.files.length > 0 && this.headerCheckboxData ) {
      this.selectedRecords = this.files;
    }
    if (!this.headerCheckboxData) {
      this.selectedRecords = [];
    }

    this.selectChildCheckbox();
  }

  preDefinedFilterFn() {
    if ((this.preAppliedfilterArr ?? []).length === 0) {
      this.preAppliedfilterArr = [
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

  payload: any;
  GridAPI: any = api_list.Inventory.GridData;
  refreshbutton: boolean = false;
  preAppliedfilterArr: any[] = [];
  tableDataExist: boolean = false;
  loader: boolean = false;

  refreshbuttonEmitFn(event: any) {
    this.refreshbutton = event;
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
}
