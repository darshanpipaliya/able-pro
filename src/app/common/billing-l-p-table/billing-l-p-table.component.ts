import { Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as _ from 'lodash';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { WirelineService } from 'src/app/services/wireline.service';
import { LocationService } from 'src/app/services/location.service';
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

@Component({
  selector: 'app-billing-l-p-table',
  templateUrl: './billing-l-p-table.component.html',
  styleUrls: ['./billing-l-p-table.component.scss'],
  imports: [
    SharedModule,
    PrimgModule,
    CommonPTreeTableComponent
  ],
})
export class BillingLPTableComponent implements OnInit {

  @Input() rowData: any;
  @Input() pageName: any;
  @Input() fromTab: any;
  public exportData: any;

  cols: any[];
  totalRecords: number = 0;

  isDisabledExport = false;
  selectedNode: any;

  /* p-table */
  loader: boolean = false;
  refreshbutton: boolean = false;
  payload: any;
  childPayload: any;
  GridAPI: any = api_list.Inventory.getInvoiceSummryBillingNew;
  @Output() tableDataExist: EventEmitter<any> = new EventEmitter();
  @Output() exportAccountData: EventEmitter<any> = new EventEmitter();
  @Output() selectedRowsEmit: EventEmitter<any> = new EventEmitter();
  @Output() rowCellDoubleClicked: EventEmitter<any> = new EventEmitter();
  @Output() loaderEmitParent: EventEmitter<any> = new EventEmitter();
  @ViewChild(CommonPTreeTableComponent) CommonPTreeTableComponent!: CommonPTreeTableComponent;

  constructor(public locationService: LocationService, public wirelineService: WirelineService
  ) {}

  setCols() {
  
    this.cols = [
      createColumn(1, '200px', true, 'text', 'Inventory', 'BillingId', 'Service Number'),

      createColumn(2, '220px', true, 'text', 'Account', 'PayableAccount', 'Payable Account Number', 'close', 1, 150,  true, true, false),
      createColumn(2, '200px', false, 'text', '', 'MainAccountNumber', 'Main Account Number', this.fromTab == 'wireline' ? 'open' : 'close', 1, 150, true, true, false),
      createColumn(2, '200px', false, 'text', '', 'Subaccount', 'Sub Account Number', this.fromTab == 'wireline' ? 'open' : 'close', 1, 150, true, true, false),

      createColumn(3, '200px', true, 'dateFilter', 'Invoice', 'InvoiceDate', 'Invoice Date', 'close'),
      createColumn(3, '160px', false, 'text', '', 'InvoiceNumber', 'Invoice Number', 'open'),

      createColumn(4, '150px', true, 'text', 'Vendor', 'VendorAccountName', 'Vendor', 'close'),

      createColumn(5, '180px', true, 'text', 'Product', 'VendorProductName', 'Vendor Product'),
      createColumn(5, '165px', false, 'text', '', 'ServiceTypeName', 'Service Type', 'open'),
      createColumn(5, '170px', false, 'text', '', 'ServiceName', 'Service', 'open'),
      createColumn(5, '190px', false, 'text', '', 'ProductTypeName', 'Product Type', 'open'),
      createColumn(5, '155px', false, 'text', '', 'ProductName', 'Product', 'open'),

      createColumn(6, '220px', true, 'text', 'Charge Code', 'ChargeCodeName', 'Charge Code Name'),
      createColumn(6, '165px', false, 'text', '', 'ChargeCode', 'Charge Code', 'open'),
      createColumn(6, '210px', false, 'text', '', 'ChargeCodeTypeName', 'Charge Code Type', 'open'),
      createColumn(6, '210px', false, 'text', '', 'ChargeTypeName', 'Charge Type', 'open'),
      createColumn(6, '210px', false, 'text', '', 'ChargeCodeOccurrence', 'Charge Occurrence', 'open'),

      createColumn(7, '180px', true, 'numberFilter', 'Charges', 'TotalChargeDisplay', 'Product Total', 'close', 1, 150, true, true, false),
      createColumn(7, '120px', false, 'numberFilter', '', 'ChargeDisplay', 'Charge', 'close', 1, 150, true, true, false),
      createColumn(7, '210px', false, 'numberFilter', '', 'DistributionEventId', 'Distribution Event ID', this.fromTab == 'wireline' ? 'open' : 'close', 1, 150, true, true, false)
    ];
  }
  ngOnInit(): void {

    this.setCols();
    this.payload = {
      ...(this.pageName == 'inventory-tab' ? { IsTotalNeed: true } : {}),
      ...(this.rowData.Id ? { CompanyLocationId: this.rowData.Id } : {}),
      ...(this.pageName == 'location-tab' ? { CompanyLocationId: this.rowData.Id } : this.pageName == 'people-tab' ? { PeopleId: this.rowData.PeopleId } : this.pageName == 'inventory-tab' ? { VendorProductInventoryId: this.rowData.VendorProductInventoryId } : {}),
    };
    this.childPayload = {
      ParentInvoiceChargeDetailsId : null
    }
  }

  isEditable() {
    let isCustomerAdmin = this.locationService.isUserCustomerAdmin();
    let isCompanyAdmin = this.locationService.isUserCompanyAdmin();
    let isCompanyManager = this.locationService.isUserCompanyManager();
    let isCompanyUser = this.locationService.isUserCompanyUser();
    if ((isCustomerAdmin || isCompanyAdmin || isCompanyManager || isCompanyUser)) {
      return false;
    }
    return true;

  }

  onRowDoubleClick(data:any) {
    let datas = {
      data: data
    }
    this.rowCellDoubleClicked.emit(datas);
  }

  /* p-table */

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
  loaderEmitFn(event: any) {
    this.loader = event;
    this.loaderEmitParent.emit(event);
  }

  
  setColumnDefs() {
    this.CommonPTreeTableComponent.setColumnDefs();
  }
  onBtnExportDataAsExcel() {
    this.isDisabledExport = true;
    this.setColumnDefs();

    this.locationService
      .callPTreeTabAPIExport(this.GridAPI,this.exportData,'POST')
      .subscribe({
        next: (data:any) => {
          this.isDisabledExport = false;
          let bolbUrl = URL.createObjectURL(data);
          var link = document.createElement("a");
          link.setAttribute("href", bolbUrl);
          link.setAttribute("download", "Invoice Summary.xlsx");
          link.style.display = "none";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        },
        error: (error:any) => {
          this.isDisabledExport = false;
        }
      });
  }
}
