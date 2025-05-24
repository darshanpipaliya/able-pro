import { Component, EventEmitter, HostListener, Inject, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { Subject, takeUntil } from 'rxjs';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { rolePermission } from 'src/app/services/helper';
import { LocationService } from 'src/app/services/location.service';
import { VariableManageService } from 'src/app/services/variable-manage.service';
import { ErrorWarningPopupComponent } from '../error-warning-popup/error-warning-popup.component';
import { TreeNode } from 'primeng/api';
import { filterOptionsText } from 'src/app/services/common-p-table';
import { CommonPTreeTableComponent } from '../common-p-tree-table/common-p-tree-table.component';
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
  selector: 'app-contact-table',
  templateUrl: './contact-table.component.html',
  styleUrls: ['./contact-table.component.scss'],
  imports: [
    SharedModule,
    PrimgModule,
    CommonPTreeTableComponent
  ]
})
export class ContactTableComponent implements OnInit {
  locationRowData: any;
  saveButtonDisabled = false;
  companyLocationId: any;
  viewNEdit: boolean = false;
  private _unsubscribe: Subject<any> = new Subject<any>();
  request: any = {};
  fixLocation;
  @Output() onContactAddEvent: EventEmitter<any> = new EventEmitter<any>();

  sidebarVisible: boolean = false;
  files: TreeNode[];
  cols: any[];
  totalRecords: number = 0;

  private _unsubscribeGRid: Subject<any> = new Subject<any>();
  private _unsubscribeService: Subject<any> = new Subject<any>();

  selectedRecords: any = [];
  selectedRows: number = 0;
  refreshbutton: boolean = false;
  @Output() tableDataExist: EventEmitter<any> = new EventEmitter();
  @Output() exportAccountData: EventEmitter<any> = new EventEmitter();
  @Output() selectedRowsEmit: EventEmitter<any> = new EventEmitter();
  @Output() rowCellDoubleClicked: EventEmitter<any> = new EventEmitter();
  
  @ViewChild(CommonPTreeTableComponent) CommonPTreeTableComponent!: CommonPTreeTableComponent;
  @Output() loaderEmitParent: EventEmitter<any> = new EventEmitter();
  
  selectedNode: any;
  payload: any = {};
  loader: boolean = false;
  GridAPI: any = api_list.Location.Location.peoplesLoggedInUserData;
  
  close = "undefined";
  constructor(
    private variableManageService: VariableManageService,
    private sanitized: DomSanitizer,
    public dialog: MatDialog,
    private locationService: LocationService,
    @Inject(MAT_DIALOG_DATA) data:any,
    private dialogRef: MatDialogRef<ContactTableComponent>
  ) {
    dialogRef.disableClose = true;
    this.locationRowData = data[0];
    this.companyLocationId = data[1].Id;
    this.fixLocation = data[2];
    this.payload = {
      customerAccountId: this.locationRowData.AccountId ? this.locationRowData.AccountId : null,
      companyLocationId: this.locationRowData.Id ? this.locationRowData.Id : null
    };
  }

  ngOnInit(): void {
    this.viewNEdit = rolePermission(['CustomerAdmin','CompanyAdmin','SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser', 'SuperTEM', 'TEMAdmin', 'TEMUser', 'TEMManager']);
    this.setCols();
  }

  setColumnDefs() {
    this.CommonPTreeTableComponent.setColumnDefs();
  }

  onRowDoubleClick(data: any) {
    let datas = {
      data: data
    }
    this.rowCellDoubleClicked.emit(datas);
  }

  setCols() {

    // Initialize parent counter
    let currentParent = 0;

    // Function to determine parent ID
    const getParentId = (isChild: boolean) => isChild ? ++currentParent : currentParent;

    this.cols = [
      createColumn(getParentId(true), '60px', true, 'checkbox', 'checkbox', 'checkbox', 'checkbox'),
      // Organization
      createColumn(getParentId(true), '160px', true, 'text', 'Organization', 'CustomerAccountName', 'Customer', 'close'),
      createColumn(currentParent, '140px', false, 'text', '', 'CompanyName', 'Company', 'open'),
    
      // Personal
      createColumn(getParentId(true), '150px', true, 'text', 'Personal', 'PeopleName', 'Name', 'close'),
      createColumn(currentParent, '120px', false, 'text', '', 'PeopleFirstName', 'First Name', 'open'),
      createColumn(currentParent, '120px', false, 'text', '', 'PeopleLastName', 'Last Name', 'open'),
      createColumn(currentParent, '130px', false, 'text', '', 'PeopleUserTitle', 'User Title', 'open'),
      createColumn(currentParent, '130px', false, 'text', '', 'EmployeeId', 'Employee Id', 'open'),
      createColumn(currentParent, '140px', false, 'text', '', 'Department', 'Department', 'open'),
      createColumn(currentParent, '150px', false, 'text', '', 'PeopleCustomField1', 'Contact Custom 1', 'open'),
      createColumn(currentParent, '140px', false, 'text', '', 'PeopleCustomField2', 'Contact Custom 2', 'open'),
      createColumn(currentParent, '140px', false, 'text', '', 'PeopleCustomField3', 'Contact Custom 3', 'open'),
      createColumn(currentParent, '140px', false, 'text', '', 'PeopleCustomField4', 'Contact Custom 4', 'open'),
    
      // Contact
      createColumn(getParentId(true), '210px', true, 'text', 'Contact', 'PeopleEmail', 'Email', 'close'),
      createColumn(currentParent, '140px', false, 'text', '', 'DeskPhone', 'Desk Phone', 'open'),
      createColumn(currentParent, '120px', false, 'text', '', 'CellPhone', 'Cell Phone', 'open'),
      createColumn(currentParent, '120px', false, 'text', '', 'CustomerContactType', 'Contact Type', 'open'),
    
      // Status
      createColumn(getParentId(true), '120px', true, 'text', 'Status', 'PeopleStatusDisplayValue', 'Status', 'close'),
      createColumn(currentParent, '120px', false, 'text', '', 'CustomerDisplayRole', 'Role', 'close'),
      createColumn(currentParent, '120px', false, 'text', '', 'UserAccountState', 'User Account State', 'open'),
    
      // Location
      createColumn(getParentId(true), '160px', true, 'text', 'Location', 'PrimaryLocationDisplayValue', 'Location', 'close'),
    ];
  }

  onSelectionChanged(event:any) {
    const selectedIds:any = [];
    event.forEach((e: any) => {
      selectedIds.push(e.PeopleId)
    });
    this.request['ContactIds'] = selectedIds;
  }
  ngOnDestroy() {
    this._unsubscribe.next(null);
    this._unsubscribe.complete();
    this._unsubscribeGRid.next(null);
    this._unsubscribeGRid.complete();
    this._unsubscribeService.next(null);
    this._unsubscribeService.complete();
  }

  update() {
    this.saveButtonDisabled = true;
    this.locationService.updateCompanyLocationContacts(this.companyLocationId, this.request).pipe(takeUntil(this._unsubscribe)).subscribe((data) => {
      
      this.saveButtonDisabled = false;
      let errorData: any = {
        messgeType: "error",
        title: "Attention",
        titleClass: "text-c-blue",
        icon: data?.Data?.$values?.length ? "fas fa-exclamation-circle" : "fas fa-thumbs-up",
        iconClass: "text-c-blue f-70",
        message: this.tooltip(data.Message.replace(/(?:\r\n|\r|\n)/g, '<br>')),
        innerHtml: true
      }
      const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
      dialogRef.afterClosed().subscribe(result => {
        this.onContactAddEvent.emit(true);
      });
      this.dialogRef.close(true);

    }, error => {
      this.saveButtonDisabled = false;

    });
  }

  tooltip(data:any) {
    return `<span >${data} </span>`;
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
