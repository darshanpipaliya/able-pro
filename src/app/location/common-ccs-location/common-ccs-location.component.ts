import { Component, Input, OnInit, Output, TemplateRef, ViewChild, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import _ from 'lodash';
import { SessionStorageService } from 'src/app/services/session-storage.service';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
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
  selector: 'app-common-ccs-location',
  templateUrl: './common-ccs-location.component.html',
  styleUrls: ['./common-ccs-location.component.scss'],
  imports: [
    SharedModule,
    PrimgModule,
    CommonPTreeTableComponent
  ]
})
export class CommonCcsLocationComponent implements OnInit {

  responseData: any;
  @Input() selectedTem: any;
  @Input() selectedCustomer: any;
  @Input() payload: any;
  private _unsubscribeGRid: Subject<any> = new Subject<any>();
  @Output() selectedTemCCS: EventEmitter<any> = new EventEmitter<any>();
  @Output() exportCCSExcelData: EventEmitter<any> = new EventEmitter<any>();

  public exportCCData: any;
  public exportCCDetail: any;

  isSuperTem = false;
  isFilterData = false;
  CustomerAdmin = false;


  @ViewChild('PeopleAssignment') PeopleAssignment!: TemplateRef<any>;

  /* Tree Location */
  GridAPI: any = api_list.coststructure.getCCstructures;
  refreshbutton: boolean = false;
  selectedNode: any;
  totalRecords: any = 0;
  loader: boolean = false;
  cols: any[];
  @Output() tableDataExist: EventEmitter<any> = new EventEmitter();
  @Output() exportAccountData: EventEmitter<any> = new EventEmitter();
  @Output() selectedRowsEmit: EventEmitter<any> = new EventEmitter();
  @Output() rowCellDoubleClicked: EventEmitter<any> = new EventEmitter();


  preAppliedfilterArr: any[] = [];
  @ViewChild(CommonPTreeTableComponent) CommonPTreeTableComponent!: CommonPTreeTableComponent;
  
  constructor(public dialog: MatDialog, private sessionStorageService: SessionStorageService) {
  
  }

  ngOnInit(): void {


    this.exportCCData = this.exportCCDetail;
    this.isSuperTem = this.sessionStorageService.getObjectValue('userRoles')?.includes("SuperTEMAdmin") || this.sessionStorageService.getObjectValue('userRoles')?.includes("SuperTEMManager") || this.sessionStorageService.getObjectValue('userRoles')?.includes("SuperTEMUser");
    this.CustomerAdmin = this.sessionStorageService.getObjectValue('userRoles')?.includes("CustomerAdmin");

    this.payload = {
      ...this.payload,
      TemAccountId: this.selectedTem,
      customerAccountId: this.selectedCustomer
    }
  
    this.preAppliedfilterArr = this.preDefinedFilterFn()

    
    this.setCols();

  }

  preDefinedFilterFn(){
    if (this.isSuperTem) {
      return [{
        "filterKey": "ReconValue",
        "filterOptionType1": "equals",
        "filterOptionValue1": "SuperTEM",
        "filterOperationType": "AND",
        "filterOptionType2": null,
        "filterOptionValue2": null
      }]
    }
    if (this.CustomerAdmin) {
      return [{
        "filterKey": "ReconValue",
        "filterOptionType1": "equals",
        "filterOptionValue1": "Customer",
        "filterOperationType": "AND",
        "filterOptionType2": null,
        "filterOptionValue2": null
      }]
    }
    return [];
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
      // Organization
      createColumn(getParentId(true), '140px', true, 'text', 'Organization', 'CustomerAccountName', 'Customer', 'close'),
      createColumn(currentParent, '140px', false, 'text', '', 'CompanyName', 'Company', 'close'),
      createColumn(currentParent, '105px', false, 'text', '', 'TEMAccountName', 'TEM', 'open'),
    
      // Cost Center
      createColumn(getParentId(true), '155px', true, 'text', 'Cost Center', 'CostCenterGLCodeFormatted', 'Cost Center', 'close'),
    
      // Service
      createColumn(getParentId(true), '125px', true, 'text', 'Service', 'ServiceName', 'Service', 'close'),
      createColumn(currentParent, '145px', false, 'text', '', 'ServiceTypeName', 'Service Type ', 'open'),
    
      // Allocation
      createColumn(getParentId(true), '110px', true, 'numberFilter', 'Allocation', 'PercentageDisplay', '%', 'close'),
    
      // Assignment
      createColumn(getParentId(true), '155px', true, 'text', 'Assignment', 'CostCenterStructureType', 'Assignment', 'close'),
      createColumn(currentParent, '185px', false, 'text', '', 'ServiceNumber', 'Service Number', 'open'),
      createColumn(currentParent, '185px', false, 'text', '', 'VendorProductTypeName', 'Vendor Product', 'open'),
      createColumn(currentParent, '115px', false, 'text', '', 'PeopleName', 'Name', 'open'),
      createColumn(currentParent, '140px', false, 'text', '', 'PeopleEmail', 'Email', 'open'),
      createColumn(currentParent, '180px', false, 'text', '', 'LocationName', 'Location name', 'open'),
      createColumn(currentParent, '130px', false, 'text', '', 'LocationAddress1', 'Address', 'open'),
      createColumn(currentParent, '105px', false, 'text', '', 'LocationCity', 'City', 'open'),
      createColumn(currentParent, '175px', false, 'text', '', 'StateName', 'State/Province', 'open'),
      createColumn(currentParent, '165px', false, 'text', '', 'LocationPostalCode', 'Zip/Postal Code ', 'open'),
    
      // Status
      createColumn(getParentId(true), '110px', true, 'text', 'Status', 'CCStructureStatusDisplay', 'Status', 'close'),
      createColumn(currentParent, '135px', false, 'numberFilter', '', 'CCStructureAllocationRuleTotalUsed', 'Times Used', 'open'),
      createColumn(currentParent, '120px', false, 'dateFilter', '', 'CCStructureAllocationRuleLastRan', 'Last Used', 'open'),
      createColumn(currentParent, '135px', false, 'dateFilter', '', 'CreationDate', 'Create Date', 'open'),
      createColumn(currentParent, '155px', false, 'text', '', 'CreatedByUser', 'Created By', 'open'),
      createColumn(currentParent, '160px', false, 'text', '', 'ModifiedByUser', 'Modified By', 'open'),
      createColumn(currentParent, '180px', false, 'dateFilter', '', 'ModificationDate', 'Modified Date', 'open')
    ];
  }
  toggle() {
    if(this.isFilterData){
      this.preAppliedfilterArr = [];
    } else {
      this.preAppliedfilterArr = this.preDefinedFilterFn();
    }
  }
  openDialog4(): void {
    this.dialog.open(this.PeopleAssignment, {
      width: '900px',
      data: {
        colseButton: true,
      }
    });
  }
  onCellDoubleClicked($event: any) {
    this.rowCellDoubleClicked.emit($event.data);
  }

  ngOnDestroy() {
    this._unsubscribeGRid.next(null);
    this._unsubscribeGRid.complete();
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
  }
}