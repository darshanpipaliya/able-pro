import { Component, EventEmitter, forwardRef, HostListener, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
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
import { LocationService } from 'src/app/services/location.service';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonPTreeTableComponent } from 'src/app/common/common-p-tree-table/common-p-tree-table.component';
import { api_list } from 'src/app/services/api-list';
import { createColumn } from 'src/app/utils/column-utils';
import { PTableComponent } from 'src/app/common/p-table/p-table.component';

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
  selector: 'app-p-tree-company',
  imports: [
    CommonModule,
    SharedModule,
    PrimgModule,
    CommonPTreeTableComponent
    // PTableComponent
  ],
  providers: [WirelineService, VariableManageService, LocationService,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PTreeCompanyComponent),
      multi: true,
    },
  ],
  templateUrl: './p-tree-company.component.html',
  styleUrl: './p-tree-company.component.scss'
})

export class PTreeCompanyComponent implements OnInit {

  @Output() tableDataExist: EventEmitter<any> = new EventEmitter();
  @Output() exportAccountData: EventEmitter<any> = new EventEmitter();
  @Output() selectedRowsEmit: EventEmitter<any> = new EventEmitter();
  @Output() rowCellDoubleClicked: EventEmitter<any> = new EventEmitter();

  cols: any[];
  totalRecords: number = 0;

  @ViewChild('ccText') ccText!: TemplateRef<any>;
  @ViewChild(PTableComponent) PTableComponent!: PTableComponent;

  selectedNode: any;
  @Output() loaderEmitParent: EventEmitter<any> = new EventEmitter();

  payload: any = {};
  @Input() GridAPI: any;
  refreshbutton: boolean = false;
  loader: boolean = false;
  constructor(public wirelineService: WirelineService,
    public variableManageService: VariableManageService,
    public locationService: LocationService,
    public dialog: MatDialog
  ) {
  }

  ngOnInit(): void {
    this.setCols();
  }

  setCols() {
    // Initialize parent counter
    let currentParent = 0;

    // Function to determine parent ID
    const getParentId = (isChild: boolean) => isChild ? ++currentParent : currentParent;

    this.cols = [
        // Organization
        createColumn(getParentId(true), '140px', true, 'text', 'Organization', 'CompanyName', 'Company', 'close'),
        createColumn(currentParent, '140px', false, 'text', '', 'CustomerAccountName', 'Customer', 'close'),
      
        // Status
        createColumn(getParentId(true), '120px', true, 'text', 'Status', 'CompanyStatus', 'Status', 'close'),
        createColumn(currentParent, '140px', false, 'text', '', 'PrimaryDisplay', 'Primary', 'close'),
      
        // AP Settings
        createColumn(getParentId(true), '200px', true, 'text', 'AP Settings', 'APSystemName', 'AP System', 'close'),
        createColumn(currentParent, '250px', false, 'text', '', 'Alias', 'Import Company Name', 'open'),
        createColumn(currentParent, '100px', false, 'text', '', 'RefNumber', 'AP ID', 'open'),
        createColumn(currentParent, '200px', false, 'text', '', 'APSystemExportTypeDisplay', 'AP Export Type', 'open'),
        createColumn(currentParent, '200px', false, 'text', '', 'GLRefNumber', 'GL Structure', 'open'),
        createColumn(currentParent, '200px', false, 'text', '', 'JobRefNumber', 'Job Structure', 'open')
    ];
  }
 
  setColumnDefs() {
    this.PTableComponent.setColumnDefs();
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
  loaderEmitFn(event: any) {
    this.loader = event;
    this.loaderEmitParent.emit(event);
  }
}
