import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatAccordion } from '@angular/material/expansion';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import * as _ from 'lodash';
import { LocationService } from 'src/app/services/location.service';
import { rolePermission } from 'src/app/services/helper';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { HeaderSectionComponent } from 'src/app/common/header-section/header-section.component';
import { PTableComponent } from "../../common/p-table/p-table.component";
import { api_list } from 'src/app/services/api-list';
import { createColumn } from 'src/app/utils/column-utils';
import { AddVendorComponent } from '../add-vendor/add-vendor.component';
import { EditVendorComponent } from '../edit-vendor/edit-vendor.component';
import { CommonPTreeTableComponent } from 'src/app/common/common-p-tree-table/common-p-tree-table.component';
@Component({
  selector: 'app-vendors-datatable',
  templateUrl: './vendors-datatable.component.html',
  styleUrls: ['./vendors-datatable.component.scss'],
  imports: [
    SharedModule,
    PrimgModule,
    HeaderSectionComponent,
    CommonPTreeTableComponent,
    AddVendorComponent,
    EditVendorComponent
],
  standalone: true,
})
export class VendorsDatatableComponent implements OnInit {
  selectedButton: any = 'vendor';
  TemDDArray: any = [];
  isManagement: any = false;
  buttonOptions: any = [
    { 'label': 'Vendors', value: 'vendor', icon: "fas fa-snowplow" },
    { 'label': "Billing Alias", value: 'billing-alias', icon: "fas fa-user-ninja" }
  ];
  mngmentButtonOptions: any = [
    { 'label': 'Vendors', value: 'vendors', icon: "fa-snowplow" },
    { 'label': "Billing Alias", value: 'billing-alias', icon: "fa-user-ninja" }
  ];
  @ViewChild(MatAccordion) accordion: MatAccordion;
  public exportVendorData: any;
  public exportVendorDetail: any;

  isDisabledExport = false;
  selectedInEditTab: number = 0;
  selected: any = 0;
  currentIndex: any = 0;
  girdDataCount = 0;
  editVendorArray: any = [];
  addVendorArray: any = [];
  addUserArray: any = [];
  selectedDataset: any = '';
  isCompanyUser: any = true;
  stopSpinner: any = false;
  isShowButton: boolean = true;
  showAddButton: boolean = false;
  vendorRowData = [];
  updateContactForm: FormGroup;
  base64flags = {};

  isSuperTEMUsers: boolean = false;
  parentVendorsListEmitData: any = [];
  vendorApiDataEmitData: any = [];
  sourceEmitData: any = [];
  selectedTem: string = 'all';
  isSuperTEMAdmin: boolean = false;
  isSuperTEMManager: boolean = false;
  isTEMUser: boolean = false;
  isVendorUser: boolean = false;
  viewNEdit: boolean = false;

  private _unsubscribeGRid: Subject<any> = new Subject<any>();
  private _unsubscribeTemLists: Subject<any> = new Subject<any>();

  currentOpenEditPagevar = 'Table';

  /* p-table */
  loaderParent: any = false;
  tableDataExist: any;
  cols: any[];
  GridAPI = api_list.Vendor.Vendor.Grid;
  payload: any;
  refreshbutton: boolean = false;
  exportData: any = {};
  selectedRecords: any[] = [];
  totalRecords: number = 0;
  @ViewChild(PTableComponent) PTableComponent!: PTableComponent;

  constructor(private fb: FormBuilder, private router: Router, private locationService: LocationService,
    public sanitizer: DomSanitizer) {

    this.updateContactForm = fb.group({
      AccountId: new FormControl('', [Validators.required]),
      CompanyId: new FormControl('', []),
      CustomerContactTypeId: new FormControl('', []),
      EmailAddress: new FormControl('', [Validators.required, Validators.email]),
      UserLastName: new FormControl('', [Validators.required]),
      UserFirstName: new FormControl('', [Validators.required]),
      UserTitle: new FormControl('', []),
      EmployeeId: new FormControl('', []),
      UserDeskPhone: new FormControl('', []),
      CellPhone: new FormControl('', []),
      Department: new FormControl('', []),
      ContactCustomField1: new FormControl('', []),
      ContactCustomField2: new FormControl('', []),
      ContactCustomField3: new FormControl('', []),
      ContactCustomField4: new FormControl('', []),
      UserID: new FormControl('', []),
      Active: new FormControl('', [Validators.required]),

    });
    if (this.router.url === '/management/vendors/vendors') {
      this.isManagement = true;
    }
  }

  ngOnInit(): void {
    this.TemDDArray[this.currentIndex] = { id: 'all', type: this.currentOpenEditPagevar };

    this.isCompanyUser = this.locationService.isUserCompanyUser();
    this.isSuperTEMUsers = this.locationService.isUserHasSuperTEMUsersRole();
    this.isSuperTEMAdmin = this.locationService.isUserHasSuperTEMAdminRole();
    this.isSuperTEMManager = this.locationService.isUserHasSuperTEMManagerRole();
    this.isTEMUser = this.locationService.isUserHasTEMUserRole();
    this.isVendorUser = this.locationService.isUserVendor();
    this.viewNEdit = rolePermission(['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEM']);
    this.setCols();

  }
  changeTab(event: any) {
    this.selected = event;
    this.currentOpenEditPagevar = (event === 0) ? 'Table' : this.currentOpenEditPagevar;
  }

  currentOpenEditPage($event: any) {
    this.currentOpenEditPagevar = ($event) ? 'Edit' : 'Add';
  }

  addVendor() {
    this.addVendorArray.push({ name: 'New', vendorData: '' });
    this.setSelectedTab('addVendor');
  }
  onVendorComponentDestroy(data: any, i: any) {
    if (this.addVendorArray[i]) {
      this.addVendorArray[i].vendorData = _.cloneDeep(data);
    }
  }
  addUser(contactData: any) {
    this.addUserArray.push({ name: 'New', contactData: contactData });
    this.setSelectedTab('addUser');

  }

  onCellDoubleClicked($event: any, i = 0) {
    this.selectedInEditTab = i;
    this.editVendorArray.push($event.data);
    this.setSelectedTab('editVendor');
  }
  openEditTab(data: any, i: any) {
    this.removeContact(i);
    this.recordEdited();
    data.data = data.Data;
    this.selectedInEditTab = 1;
    this.onCellDoubleClicked(data, 1);
  }
  removeTab(index: any) {
    this.editVendorArray.splice(index, 1);
    this.editVendorArray = _.cloneDeep(this.editVendorArray);
    this.vendorApiDataEmitData.splice(index, 1);
    this.vendorApiDataEmitData = _.cloneDeep(this.vendorApiDataEmitData);
  }

  removeContact(index: any) {
    this.addVendorArray.splice(index, 1);
    this.addVendorArray = _.cloneDeep(this.addVendorArray);
  }


  setSelectedTab(from: any) {
    setTimeout(() => {
      if (from === 'editVendor') {
        this.selected = this.editVendorArray.length;
      } else if (from === 'addVendor') {
        this.selected = this.editVendorArray.length + this.addVendorArray.length;
      } else if (from === 'addUser') {
        this.selected = this.editVendorArray.length + this.addVendorArray.length + this.addUserArray.length;
      }
    }, 0);
  }


  removeUser(index: any) {
    this.addVendorArray.splice(index, 1);
    this.addVendorArray = _.cloneDeep(this.addVendorArray);
  }


  onVendorAddEvent(event: any, index: any) {
    if (event) {
      this.addVendorArray.splice(index, 1);
      this.addVendorArray = _.cloneDeep(this.addVendorArray);
      this.refreshbuttonEmitFn(true)
    }
  }

  onVendorEditEvent(event: any, index: any) {
    if (event) {
      this.editVendorArray.splice(index, 1);
      this.editVendorArray = _.cloneDeep(this.editVendorArray);
      this.refreshbuttonEmitFn(true)
    }
  }

  recordEdited() {
    this.refreshbuttonEmitFn(true)
  }

  ngOnDestroy() {
    this._unsubscribeGRid.next(null);
    this._unsubscribeGRid.complete();
    this._unsubscribeTemLists.next(null);
    this._unsubscribeTemLists.complete();
  }


  setColumnDefs() {
    this.PTableComponent.setColumnDefs();
  }
  
  onBtnExportDataAsExcel() {
   
    this.isDisabledExport = true;
    this.setColumnDefs();
    this.locationService
      .getVendorExportData(this.exportData)
      .subscribe({
        next: data => {
          this.isDisabledExport = false;
          let bolbUrl = URL.createObjectURL(data);
          var link = document.createElement("a");
          link.setAttribute("href", bolbUrl);
          link.setAttribute("download", "Vendors.xlsx");
          link.style.display = "none";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

        },
        error: error => {
          this.isDisabledExport = false;

        }
      });
  }

  parentVendorsListEmit(data: any, i: any) {
    this.parentVendorsListEmitData[i] = data;
  }
  vendorApiDataEmit(data: any, i: any) {
    this.vendorApiDataEmitData[i] = data;
  }
  sourceEmit(data: any, i: any) {
    this.sourceEmitData[i] = data;
  }

  /* p-table */


  loaderEmitFn(event: any) {
    this.loaderParent = event;
  }

  tableDataExistFn(e?: any) {
    this.tableDataExist = e;
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }

  onButtonClick(value: string): void {
    this.selectedButton = value;
    this.currentIndex = 0;
  }

  setCols() {
    let currentParent = 0;
    const getParentId = (isChild: boolean) => isChild ? ++currentParent : currentParent;

    this.cols = [];

    // Vendor Group
    const vendorParent = getParentId(true);
    this.cols.push(createColumn(vendorParent, '150px', true, 'text', 'Vendor', 'VendorAccountName', 'Vendor'));
    this.cols.push(createColumn(currentParent, '200px', false, 'text', '', 'ParentVendorAccountName', 'Parent Vendor', 'close'));
    this.cols.push(createColumn(currentParent, '140px', false, 'text', '', 'WebAddress', 'Website', 'open'));

    // Invoice Retrieval Group
    const invoiceParent = getParentId(true);
    this.cols.push(createColumn(invoiceParent, '150px', true, 'text', 'Invoice Retrieval', 'InvSource', 'Invoice Source'));
    this.cols.push(createColumn(currentParent, '180px', false, 'text', '', 'InvoiceRetrievalMethod', 'Retrieval Method', 'close'));
    this.cols.push(createColumn(currentParent, '210px', false, 'number', '', 'InvReceiveDay', 'Retrieval # Days', 'close'));
    this.cols.push(createColumn(currentParent, '200px', false, 'number', '', 'InvMissingDay', 'Missing # Days', 'open'));
    this.cols.push(createColumn(currentParent, '200px', false, 'number', '', 'InvPayByDay', 'Pay by # Days', 'open'));
    this.cols.push(createColumn(currentParent, '120px', false, 'text', '', 'InvRetrievalWebURL', 'URL', 'open'));

    // Data Retrieval Group
    const dataParent = getParentId(true);
    this.cols.push(createColumn(dataParent, '150px', true, 'text', 'Data Retrieval', 'DataSource', 'Data Source'));
    this.cols.push(createColumn(currentParent, '190px', false, 'text', '', 'DataRetrievalMethod', 'Retrieval Method', 'close'));
    this.cols.push(createColumn(currentParent, '210px', false, 'number', '', 'DataReceiveDay', 'Retrieval # Days', 'close'));
    this.cols.push(createColumn(currentParent, '200px', false, 'number', '', 'DataMissingDay', 'Missing # Days', 'open'));
    this.cols.push(createColumn(currentParent, '200px', false, 'text', '', 'DataRetrievalProcessingMethodDisplay', 'Processing Method', 'close'));
    this.cols.push(createColumn(currentParent, '170px', false, 'text', '', 'DataRetrievalTemplateType', 'Template Type', 'open'));
    this.cols.push(createColumn(currentParent, '120px', false, 'text', '', 'DataRetrievalWebURL', 'URL', 'open'));
  }

  refreshbuttonEmitFn(event: any) {
    this.refreshbutton = event;
  }

  exportAccountDataFn(event: any) {
    this.exportData = event;
  }

  selectedRowsEmitFn(event: any) {
    this.selectedRecords = event;
  }
  
  rowCellDoubleClickedFn(event: any) {
    this.onCellDoubleClicked(event)
  }

  totalRecordsEmitFn(event: any) {
    this.totalRecords = event;
  }

}
