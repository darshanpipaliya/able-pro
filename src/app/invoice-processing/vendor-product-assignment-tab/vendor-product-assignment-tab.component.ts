import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import _ from 'lodash';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { InvoiceOverviewComponent } from '../invoice-overview/invoice-overview.component';
import { InventorySelectionComponent } from '../inventory-selection/inventory-selection.component';
import { DetailedInventorySelectionComponent } from '../detailed-inventory-selection/detailed-inventory-selection.component';
import { AssignVendorProductComponent } from '../assign-vendor-product/assign-vendor-product.component';
import { SelectAssignInventoryComponent } from '../select-assign-inventory/select-assign-inventory.component';
import { ParentInventorySelectionComponent } from '../parent-inventory-selection/parent-inventory-selection.component';

@Component({
  selector: 'app-vendor-product-assignment-tab',
  templateUrl: './vendor-product-assignment-tab.component.html',
  styleUrls: ['./vendor-product-assignment-tab.component.scss'],
  imports: [SharedModule, PrimgModule, InvoiceOverviewComponent, InventorySelectionComponent, DetailedInventorySelectionComponent,
    AssignVendorProductComponent, SelectAssignInventoryComponent, ParentInventorySelectionComponent
   ],
})
export class VendorProductAssignmentTabComponent implements OnInit {
  @Input() selectedTab: any;
  @Input() sandBoxGridRowData: any;
  @Output() invoiceOverviewDataOP: EventEmitter<any> = new EventEmitter<any>();
  @Output() redirectNext: EventEmitter<any> = new EventEmitter<any>();
  @Input() recordPublishedOrCompleted: any;
  refreshGrid: boolean = false;
  index = 0;  
  enableTab = 0;
  stepComplete = 0;
  rowData: any;
  field: any;
  inventoryData: any;
  overviewData: any;
  inventoryPayload: any;
  isEnableTab = false;
  isDisplayVendorProduct = false;
  headerCheckboxData: any;
  
  constructor() { }

  ngOnInit(): void {
  }

  
  redirectTab(data: { index: number; rowData: any; field: any; }) {
    this.isEnableTab = true
    this.enableTab = data.index;
    this.rowData = data.rowData;
    this.field = data.field;
    setTimeout(() => {
      this.index = data.index;
    }, 50);
  }
  redirectToNext(event: any) {
    this.redirectNext.emit(event);
  }
  switchTab(index: number) {
    this.index = index;
  }
  reloadGrid(event: boolean) {
    this.refreshGrid = event;
  }
  onCellClicked(event: { index: number; rowData: any; payloadData: any; headerCheckboxData: any; }) {
    this.index = event.index;
    this.inventoryData = event.rowData;
    this.inventoryPayload = event.payloadData;
    this.headerCheckboxData = event.headerCheckboxData;
    // this.enableTab = data.index;
    // this.sbChargeDetailId = data.rowData.SBChargeDetailId;
    // if(data.index == 1) {
    //   this.stepComplete = 1;
    // }
    // setTimeout(() => {
    //   this.index = data.index;
    // }, 50);
  }
  invoiceOverviewDataOutput($event: { IsDisplayAddVendorProduct: boolean; }) {
    this.overviewData = $event;
    this.isDisplayVendorProduct = $event.IsDisplayAddVendorProduct;
    this.invoiceOverviewDataOP.emit($event);
  }
}
