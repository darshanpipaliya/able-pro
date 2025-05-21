import { Component, EventEmitter, HostListener, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import _ from 'lodash';
import { TreeNode } from 'primeng/api';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonPTreeTableComponent } from 'src/app/common/common-p-tree-table/common-p-tree-table.component';
import { ContactTableComponent } from 'src/app/common/contact-table/contact-table.component';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { api_list } from 'src/app/services/api-list';
import { extractDataAndLeaf, filterOptionsDate, filterOptionsNumber, filterOptionsText, onChangeEndDate } from 'src/app/services/common-p-table';
import { isValuesUndefined, rolePermission } from 'src/app/services/helper';
import { LocationService } from 'src/app/services/location.service';
import { VariableManageService } from 'src/app/services/variable-manage.service';

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
  selector: 'app-location-contact-data-table',
  templateUrl: './location-contact-data-table.component.html',
  styleUrls: ['./location-contact-data-table.component.scss'],
  standalone: true,
  imports: [
    SharedModule,
    PrimgModule,
    CommonPTreeTableComponent
  ],
})



export class LocationContactDataTableComponent implements OnInit {

  @Input() contactDataEmit: any;
  @Input() location: any;
  @Output() contactSave: EventEmitter<any> = new EventEmitter<any>();
  @Output() peopleEmit: EventEmitter<any> = new EventEmitter<any>();
  private _unsubscribeGetLocationDetail: Subject<any> = new Subject<any>();
  private _unsubscribeGRid: Subject<any> = new Subject<any>();

  columnDefs: any;

  rowData: any;
  companyDetailData: any;
  fixLocation = '';
  CompanyUser = false;
  isDisabledExport: boolean = false;;

  @ViewChild(CommonPTreeTableComponent) CommonPTreeTableComponent!: CommonPTreeTableComponent;
  refreshbutton: boolean = false;
  loader: boolean = false;
  payload: any = {};
  GridAPI: any = api_list.Location.Location.getLocationPeople;
  ids: any = {};
  constructor(private locationService: LocationService, private variableManageService: VariableManageService, public dialog: MatDialog) { }
  exportData: any;
  ngOnInit(): void {
    this.ids = { id: this.contactDataEmit.Id };
    this.CompanyUser = rolePermission(['CompanyUser']);
    this.peopleEmit.emit(true);
    this.setCols();

  }

  onBtnExportDataAsExcel() {

      this.setColumnDefs();
      this.isDisabledExport = true;
      this.locationService
        .callPTreeTabAPIExport(this.GridAPI,this.exportData,'POST',this.ids)
        .subscribe({
          next: (data: any) => {
            this.isDisabledExport = false;
            let bolbUrl = URL.createObjectURL(data);
            var link = document.createElement("a");
            link.setAttribute("href", bolbUrl);
            link.setAttribute("download", "Companies.xlsx");
            link.style.display = "none";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          },
          error: (error: any) => {
            this.isDisabledExport = false;
          }
        });
  }

  async openContactGrid() {
    const dialogRef = this.dialog.open(ContactTableComponent, {
      panelClass: ['width-1100', 'location-contact-popup-c'],
      data: [this.contactDataEmit, this.contactDataEmit, this.fixLocation],
      disableClose: true,
      width: '1100px'
    });
    dialogRef.afterClosed().subscribe(async (result) => {
      if (!isValuesUndefined(result)) {

        this.companyDetailData = await this.getCompanyLocationDetail(this.contactDataEmit.Id);
      

        this.contactDataEmit = this.companyDetailData;
      }
    })
  }

  getCompanyLocationDetail(id :any) {
    const isPrime = new Promise<string>((res, rej) => {
      this._unsubscribeGetLocationDetail.next(null);
      this.locationService.getCompanyLocationDetail(id).pipe(takeUntil(this._unsubscribeGetLocationDetail))
        .toPromise()
        .then((data) => {
          if (data) {
            res(data.Data);
          } else {
            rej(data.Data);
          }
        });
    });

    return isPrime;
  }

  ngOnDestroy(): any {
    this._unsubscribeGRid.next(null);
    this._unsubscribeGRid.complete();
    this._unsubscribeGetLocationDetail.next(null);
    this._unsubscribeGetLocationDetail.complete();
    this.peopleEmit.emit(false);
  }

  /* ========================================================== */
  @Output() tableDataExist: EventEmitter<any> = new EventEmitter();
  @Output() exportAccountData: EventEmitter<any> = new EventEmitter();
  @Output() selectedRowsEmit: EventEmitter<any> = new EventEmitter();
  @Output() rowCellDoubleClicked: EventEmitter<any> = new EventEmitter();

  cols: any[];
  totalRecords: number = 0;

  @ViewChild('ccText') ccText!: TemplateRef<any>;
  selectedNode: any;


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


    // Initialize parent counter
    let currentParent = 0;

    // Function to determine parent ID
    const getParentId = (isChild: boolean) => isChild ? ++currentParent : currentParent;

    this.cols = [
      // Checkbox column
      // createColumn(currentParent, '50px', false, 'checkbox', '', '', '', 'close', 1, 50, true, true, true),
    
      // Organization group
      createColumn(getParentId(true), '130px', true, 'text', 'Organization', 'CustomerAccountName', 'Customer'),
      createColumn(currentParent, '140px', false, 'text', '', 'CompanyName', 'Company', 'open'),
    
      // Personal group
      createColumn(getParentId(true), '120px', true, 'text', 'Personal', 'PeopleName', 'Name'),
      createColumn(currentParent, '120px', false, 'text', '', 'PeopleFirstName', 'First Name', 'open'),
      createColumn(currentParent, '120px', false, 'text', '', 'PeopleLastName', 'Last Name', 'open'),
      createColumn(currentParent, '130px', false, 'text', '', 'UserTitle', 'User Title', 'open'),
      createColumn(currentParent, '130px', false, 'text', '', 'EmployeeId', 'Employee Id', 'open'),
      createColumn(currentParent, '140px', false, 'text', '', 'Department', 'Department', 'open'),
      createColumn(currentParent, '150px', false, 'text', '', 'PeopleCustomField1', 'Contact Custom 1', 'open'),
      createColumn(currentParent, '140px', false, 'text', '', 'PeopleCustomField2', 'Contact Custom 2', 'open'),
      createColumn(currentParent, '140px', false, 'text', '', 'PeopleCustomField3', 'Contact Custom 3', 'open'),
      createColumn(currentParent, '140px', false, 'text', '', 'PeopleCustomField4', 'Contact Custom 4', 'open'),
    
      // Contact group
      createColumn(getParentId(true), '120px', true, 'text', 'Contact', 'PeopleEmail', 'Email'),
      createColumn(currentParent, '140px', false, 'text', '', 'DeskPhone', 'Desk Phone', 'open'),
      createColumn(currentParent, '120px', false, 'text', '', 'CellPhone', 'Cell Phone', 'open'),
      createColumn(currentParent, '120px', false, 'text', '', 'CustomerContactType', 'Contact Type', 'open'),
    
      // Status group
      createColumn(getParentId(true), '80px', true, 'text', 'Status', 'PeopleStatusDisplayValue', 'Status'),
      createColumn(currentParent, '120px', false, 'text', '', 'CustomerDisplayRole', 'Role', 'close'),
      createColumn(currentParent, '120px', false, 'text', '', 'UserAccountState', 'User Account State', 'open'),
    
      // Location group
      createColumn(getParentId(true), '160px', true, 'text', 'Location', 'LocationDisplay', 'Location')
    ];

 
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
    this.exportData = event;
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
  }
}
