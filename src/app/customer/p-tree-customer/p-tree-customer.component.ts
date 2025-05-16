import { Component, EventEmitter, HostListener, Input, OnInit, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import * as _ from 'lodash';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { WirelineService } from 'src/app/services/wireline.service';
import { VariableManageService } from 'src/app/services/variable-manage.service';
import { LocationService } from 'src/app/services/location.service';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { CommonPTreeTableComponent } from 'src/app/common/common-p-tree-table/common-p-tree-table.component';
import { api_list } from 'src/app/services/api-list';
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
  imports: [
    CommonModule,
    SharedModule,
    PrimgModule,
    CommonPTreeTableComponent
  ],
  providers: [WirelineService, VariableManageService, LocationService],
  selector: 'app-p-tree-customer',
  templateUrl: './p-tree-customer.component.html',
  styleUrl: './p-tree-customer.component.scss',
})

export class PTreeCustomerComponent implements OnInit {

  @Output() tableDataExist: EventEmitter<any> = new EventEmitter();
  @Output() exportAccountData: EventEmitter<any> = new EventEmitter();
  @Output() selectedRowsEmit: EventEmitter<any> = new EventEmitter();
  @Output() rowCellDoubleClicked: EventEmitter<any> = new EventEmitter();

  cols: any[];
  totalRecords: number = 0;

  
  @ViewChild('ccText') ccText!: TemplateRef<any>;
  @ViewChild(CommonPTreeTableComponent) CommonPTreeTableComponent!: CommonPTreeTableComponent;

  selectedNode: any;

  payload: any = {};
  @Input() GridAPI: any;
  refreshbutton: boolean = false;

  constructor(public wirelineService: WirelineService,
    public variableManageService: VariableManageService,
    public locationService: LocationService,
    public dialog: MatDialog
  ) {}
  
  ngOnInit(): void {
    this.setCols();
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

    let currentParent = 0;

    const getParentId = (isChild: boolean) => isChild ? ++currentParent : currentParent;

    this.cols = [
      createColumn(getParentId(true), '150px', true, 'text', 'Organization', 'AccountName', 'Customer'),
    
      createColumn(getParentId(true), '150px', true, 'text', 'Address', 'WebAddress', 'Website'),
      createColumn(currentParent, '150px', false, 'text', '', 'PhysicalAddress', 'Address One', 'open'),
      createColumn(currentParent, '150px', false, 'text', '', 'PhysicalAddress2', 'Address Two', 'open'),
      createColumn(currentParent, '150px', false, 'text', '', 'City', 'City', 'open'),
      createColumn(currentParent, '150px', false, 'text', '', 'Country', 'Country', 'open'),
      createColumn(currentParent, '150px', false, 'text', '', 'State', 'State/Province/Region', 'open'),
      createColumn(currentParent, '150px', false, 'text', '', 'PostalCode', 'Zip/Postal Code', 'open'),
    
      createColumn(getParentId(true), '150px', true, 'text', 'Status', 'CustomerStatus', 'Status'),
    
      createColumn(getParentId(true), '150px', true, 'text', 'Invoice Workflow', 'ReconciliationOption', 'Inventory Assignment'),
      createColumn(currentParent, '150px', false, 'text', '', 'CostAllocationStatusDisplay', 'Cost Allocation'),
      createColumn(currentParent, '150px', false, 'text', '', 'ApprovalsStatusDisplay', 'Approvals'),
      createColumn(currentParent, '150px', false, 'text', '', 'BillPayStatusDisplay', 'Bill Pay'),
    
    
      createColumn(getParentId(true), '150px', true, 'text', 'Other', 'AllowCCManualEdits', 'Cost Center Edits', 'open'),
      createColumn(currentParent, '150px', false, 'text', '', 'ApprovalDays', 'Approval Days'),
      createColumn(currentParent, '150px', false, 'text', '', 'TwoFactorEnabledDisplay', 'MFA', 'open'),
      createColumn(currentParent, '150px', false, 'text', '', 'NotificationFrequencyDays', 'Notification Frequency', 'open'),
      createColumn(currentParent, '150px', false, 'text', '', 'TEMAccountNumber', 'TEM Account', 'open'),
    
    
    ];
  }

  openPopup() {
    this.dialog.open(this.ccText, {
      width: '900px',
      data: {
        colseButton: true,
      }
    });
  }

  refreshbuttonEmitFn(event: any) {
    this.refreshbutton = event;
  }

  onNodeSelect(event: any) {
    this.selectedNode = event.node;
  }

  tableDataExistFn(event: any) {
    this.tableDataExist.emit(event)
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

  setColumnDefs() {
    this.CommonPTreeTableComponent.setColumnDefs();
  }
}

