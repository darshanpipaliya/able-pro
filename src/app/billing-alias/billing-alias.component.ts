import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatAccordion } from '@angular/material/expansion';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import * as _ from 'lodash';
import { LocationService } from '../services/location.service';
import { rolePermission } from '../services/helper';
import { SharedModule } from '../demo/shared/shared.module';
import { CommonPTreeTableComponent } from '../common/common-p-tree-table/common-p-tree-table.component';
import { api_list } from '../services/api-list';
import { HeaderSectionComponent } from '../common/header-section/header-section.component';
import { createColumn } from '../utils/column-utils';
import { AddBillingAliasComponent } from './add-billing-alias/add-billing-alias.component';
import { EditBillingAliasComponent } from './edit-billing-alias/edit-billing-alias.component';
@Component({
  selector: 'app-billing-alias',
  templateUrl: './billing-alias.component.html',
  styleUrls: ['./billing-alias.component.scss'],
  imports: [
    SharedModule,
    CommonPTreeTableComponent,
    HeaderSectionComponent,
    AddBillingAliasComponent,
    EditBillingAliasComponent
  ]
})
export class BillingAliasComponent implements OnInit {
  selectedButton: any = 'billing-alias';
  buttonOptions: any = [
    { 'label': 'Vendors', value: 'vendors', icon: "fas fa-snowplow" },
    { 'label': "Billing Alias", value: 'billing-alias', icon: "fas fa-user-ninja" }
  ];
  panelOpenState = false;
  @ViewChild(MatAccordion) accordion: MatAccordion;
  isShowButton: boolean = true;
  public rowData: any = [];
  public billingAliasLogsEmitData: any = [];
  public vendorsListEmitData: any = [];
  selected: any = 0;
  sourceLeft = true;
  keepSorted = true;
  filter = true;
  isCompanyAdmin: any = false;
  stopSpinner: any = false;
  addeditBillingAliasTabs: any = [];
  BillingAliasRowDetails: any;
  viewNEdit: boolean = false;
  private _unsubscribeGRid: Subject<any> = new Subject<any>();
  gridApi: any;
  gridColumnApi: any;
  currentOpenEditPagevar = 'Table';
  public exportBillingData: any;
  public exportBillingDetail: any;

  isDisabledExport = false;

  payload: any = {};
  GridAPI = api_list.Vendor.BillingAlias.Grid;
  refreshbutton: boolean = false;
  loader: boolean = false;
  cols: any[];
  totalRecords: number = 0;
  currentIndex: number = 0;
  selectedNode: any;
  tableDataExist: any;
  exportData: any;
  selectedRows: any;
  loaderParent: any = false;
  @ViewChild(CommonPTreeTableComponent) CommonPTreeTableComponent!: CommonPTreeTableComponent;

  constructor(private router: Router,
    private locationService: LocationService) {
  }

  ngOnInit(): void {
    this.viewNEdit = rolePermission(['SuperTEMAdmin', 'SuperTEMManager']);
    this.setCols();
  }

  currentOpenEditPage($event: any) {
    this.currentOpenEditPagevar = ($event) ? 'Edit' : 'Add';
  }

  changeTab(event: any) {
    this.selected = event;
    this.currentIndex = event;
    this.currentOpenEditPagevar = (event === 0) ? 'Table' : this.currentOpenEditPagevar;

    if (event == 0) {
      this.isShowButton = true;
    } else {
      this.isShowButton = false;
    }
  }

  onCellDoubleClicked($event: any) {
    this.addeditBillingAliasTabs.push({ tab: "edit", rowData: $event.data });
    this.selected = this.addeditBillingAliasTabs.length;
    this.currentIndex = this.selected;
    this.setSelectedTab('edit');

  }

  removeAddEditBillingAliasTab(index: any) {
    this.refreshbutton = true;
    this.addeditBillingAliasTabs.splice(index, 1);
    this.addeditBillingAliasTabs = _.cloneDeep(this.addeditBillingAliasTabs);

  }

  onAddBillingAliasComponentDestroy(data: any, i: any) {
    this.addeditBillingAliasTabs[i].rowData = data;
  }

  goToPage(to: any) {
    if (to === 'vendors') {
      this.router.navigate(['/vendors/vendors']);
    }
  }

  addNewBillingAlias() {
    this.addeditBillingAliasTabs.push({ tab: "add", rowData: '' });
    this.selected = this.addeditBillingAliasTabs.length;
    this.currentIndex = this.selected;
    this.setSelectedTab('add');
  }

  setSelectedTab(from: any) {
    if (from === 'edit') {
      this.currentOpenEditPagevar = 'Edit';
    } else if (from === 'add') {
      this.currentOpenEditPagevar = 'Add';
    }
  }

  ngOnDestroy() {
    this._unsubscribeGRid.next(null);
    this._unsubscribeGRid.complete();
  }

  onBtnExportDataAsExcel() {
    this.isDisabledExport = true;
    this.locationService
      .getVendorBillingAliasExportData(this.exportBillingData)
      .subscribe({
        next: data => {
          this.isDisabledExport = false;
          let bolbUrl = URL.createObjectURL(data);
          var link = document.createElement("a");
          link.setAttribute("href", bolbUrl);
          link.setAttribute("download", "Billing Alias.xlsx");
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

  refreshbuttonEmitFn(event: any) {
    this.refreshbutton = event;
  }

  onNodeSelect(event: any) {
    this.selectedNode = event.node;
  }

  tableDataExistFn(event: any) {
    this.tableDataExist = event;
  }

  exportAccountDataFn(event: any) {
    this.exportData = event;
  }

  selectedRowsEmitFn(event: any) {
    this.selectedRows = event;
  }

  rowCellDoubleClickedFn(event: any) {
    this.onCellDoubleClicked(event);
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

  trackByIndex(index: number, item: any): number {
    return index;
  }

  onButtonClick(value: string): void {
    this.selectedButton = value;
    this.currentIndex = 0;
    setTimeout(() => this.goToPage(value), 0);  // Avoid layout thrash
  }

  setCols() {
    let currentParent = 0;
    const getParentId = (isChild: boolean) => isChild ? ++currentParent : currentParent;
  
    this.cols = [];
  
    // Vendor Group
    const vendorParent = getParentId(true);
    this.cols.push(createColumn(vendorParent, '120px', true, 'text', 'Vendor', 'VendorAccountName', 'Vendor', 'close'));
  
    // Vendor Billing Alias Group
    const billingParent = getParentId(true);
    this.cols.push(createColumn(billingParent, '250px', true, 'text', 'Vendor Billing Alias', 'VendorBillingAliasName', 'Vendor Billing Alias', 'close'));
    this.cols.push(createColumn(currentParent, '150px', false, 'text', '', 'Description', 'Description', 'open'));
  
    // Status Group
    const statusParent = getParentId(true);
    this.cols.push(createColumn(statusParent, '120px', true, 'text', 'Status', 'StatusDisplayValue', 'Status', 'close'));
    this.cols.push(createColumn(currentParent, '180px', false, 'text', '', 'InvoiceAliasDisplayValue', 'Payable Alias', 'open'));
    this.cols.push(createColumn(currentParent, '200px', false, 'text', '', 'ChargeCodeAliasDisplayValue', 'Charge Code Alias', 'open'));
  
    // History Group
    const historyParent = getParentId(true);
    this.cols.push(createColumn(historyParent, '130px', true, 'text', 'History', 'CreatedByUser', 'Created By', 'close'));
    this.cols.push(createColumn(currentParent, '180px', false, 'date', '', 'CreatedDate', 'Created Date', 'open'));
    this.cols.push(createColumn(currentParent, '180px', false, 'text', '', 'ModifiedByUser', 'Modified By', 'open'));
    this.cols.push(createColumn(currentParent, '180px', false, 'date', '', 'ModifiedDate', 'Modified Date', 'open'));
  }

}
