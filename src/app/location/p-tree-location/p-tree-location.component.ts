import { Component, EventEmitter, HostListener, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { Subject } from 'rxjs';
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
  selector: 'app-p-tree-location',
  templateUrl: './p-tree-location.component.html',
  styleUrl: './p-tree-location.component.scss'
})

export class PTreeLocationComponent implements OnInit {

  @Output() tableDataExist: EventEmitter<any> = new EventEmitter();
  @Output() exportAccountData: EventEmitter<any> = new EventEmitter();
  @Output() selectedRowsEmit: EventEmitter<any> = new EventEmitter();
  @Output() rowCellDoubleClicked: EventEmitter<any> = new EventEmitter();

  cols: any[];
  totalRecords: number = 0;

  @ViewChild('ccText') ccText!: TemplateRef<any>;
  selectedNode: any;

  payload: any = {};
  @Input() GridAPI: any;
  refreshbutton: boolean = false;
  loader: boolean = false;
  @Output() loaderEmitParent: EventEmitter<any> = new EventEmitter();
  @ViewChild(CommonPTreeTableComponent) CommonPTreeTableComponent!: CommonPTreeTableComponent;

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
    

    let currentParent = 0;

    const getParentId = (isChild: boolean) => isChild ? ++currentParent : currentParent;

    this.cols = [
      // createColumn(getParentId(true), '60px', true, 'checkbox', 'checkbox', 'checkbox', 'checkbox', 'close'),

      createColumn(getParentId(true), '190px', true, 'text', 'Location', 'LocationName', 'Location Name', 'close'),
      createColumn(currentParent, '190px', false, 'text', '', 'Id', 'Location ID', 'close'),
      createColumn(currentParent, '180px', false, 'text', '', 'LocationCode', 'Location Code', 'open'),
      createColumn(currentParent, '180px', false, 'text', '', 'Alias', 'Location Alias', 'open'),
      createColumn(currentParent, '150px', false, 'text', '', 'LocationCustomField1', 'Location Custom 1', 'open'),
      createColumn(currentParent, '150px', false, 'text', '', 'LocationCustomField2', 'Location Custom 2', 'open'),
      createColumn(currentParent, '150px', false, 'text', '', 'LocationCustomField3', 'Location Custom 3', 'open'),
      createColumn(currentParent, '150px', false, 'text', '', 'LocationCustomField4', 'Location Custom 4', 'open'),

      createColumn(getParentId(true), '156px', true, 'text', 'Status', 'DisplayText', 'Location Status', 'close'),
      createColumn(currentParent, '185px', false, 'text', '', 'LocationTypeDisplayName', 'Location Type', 'open'),
      createColumn(currentParent, '180px', false, 'text', '', 'LocationTermName', 'Location Term', 'open'),

      createColumn(getParentId(true), '148px', true, 'text', 'Organization', 'AccountName', 'Customer', 'close'),
      createColumn(currentParent, '140px', false, 'text', '', 'CompanyName', 'Company', 'close'),

      createColumn(getParentId(true), '200px', true, 'text', 'Address', 'Address1', 'Street Address One', 'open'),
      createColumn(currentParent, '200px', false, 'text', '', 'Address2', 'Street Address Two', 'open'),
      createColumn(currentParent, '145px', false, 'text', '', 'City', 'City', 'close'),
      createColumn(currentParent, '206px', false, 'text', '', 'StateName', 'State/Province/Region', 'close'),
      createColumn(currentParent, '100px', false, 'text', '', 'PostalCode', 'Zip/Postal Code', 'open'),
      createColumn(currentParent, '170px', false, 'text', '', 'CountryName', 'Country', 'open'),
      createColumn(currentParent, '232px', false, 'text', '', 'SameMailAddressDisplayValue', 'Same as Location Address', 'open'),
      createColumn(currentParent, '240px', false, 'text', '', 'MailingAddress1', 'Mailing Street Address One', 'open'),
      createColumn(currentParent, '240px', false, 'text', '', 'MailingAddress2', 'Mailing Street Address Two', 'open'),
      createColumn(currentParent, '175px', false, 'text', '', 'MailingAddressCity', 'Mailing City', 'open'),
      createColumn(currentParent, '265px', false, 'text', '', 'MailingAddressStateName', 'Mailing State/Province/Region', 'open'),
      createColumn(currentParent, '220px', false, 'text', '', 'MailingAddressPostalCode', 'Mailing Zip/Postal Code', 'open'),
      createColumn(currentParent, '180px', false, 'text', '', 'MailingAddressCountryName', 'Mailing Country', 'open'),

      createColumn(getParentId(true), '185px', true, 'dateFilter', 'Date', 'StartDate', 'Location Start Date', 'close'),
      createColumn(currentParent, '120px', false, 'dateFilter', '', 'EndDate', 'Location End Date', 'open'),

      createColumn(getParentId(true), '175px', true, 'numberFilter', 'Inventory', 'TotalCurrentLocChargeCount', 'Inventory Count', 'close'),
      createColumn(currentParent, '175px', false, 'numberFilter', '', 'TotalCurrentLocChargeDisplay', 'Current Charges', 'close'),
      createColumn(currentParent, '175px', false, 'numberFilter', '', 'PreviousTotalCurrentLocChargeDisplay', 'Previous Charges', 'open'),
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

  loaderEmitFn(event: any) {
    this.loader = event;
    this.loaderEmitParent.emit(event);
  }
}
