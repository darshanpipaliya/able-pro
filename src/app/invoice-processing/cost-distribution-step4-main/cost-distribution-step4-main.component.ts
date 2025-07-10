import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import _ from 'lodash';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { InvoiceOverviewComponent } from '../invoice-overview/invoice-overview.component';
import { CostDistributionStep4Component } from '../cost-distribution-step4/cost-distribution-step4.component';
import { CostDistributionSubaComponent } from '../cost-distribution-suba/cost-distribution-suba.component';
import { CostDistributionSubbComponent } from '../cost-distribution-subb/cost-distribution-subb.component';

@Component({
  selector: 'app-cost-distribution-step4-main',
  templateUrl: './cost-distribution-step4-main.component.html',
  styleUrls: ['./cost-distribution-step4-main.component.scss'],
  imports: [SharedModule, PrimgModule, InvoiceOverviewComponent, CostDistributionStep4Component, CostDistributionSubaComponent, CostDistributionSubbComponent]
})
export class CostDistributionStep4MainComponent implements OnInit {
  @Input() sandBoxGridRowData: any;
  @Input() selectedTab: any;
  @Input() fromTab: any;
  @Output() invoiceOverviewDataOP: EventEmitter<any> = new EventEmitter<any>();
  @Input() recordPublishedOrCompleted: any;

  @Output() switchTab: EventEmitter<any> = new EventEmitter<any>();

  refreshGrid: boolean = false;
  overViewData: any;
  SBChargeDetailIdsForCC: any;
  sbChargeDetailId: any;
  fetchedData: any;

  index = 0;
  reloadOverview: boolean = false;
  reloadData: any;
  rowData: any;

  constructor() { }

  ngOnInit(): void {
  }

  invoiceOverviewDataOutput($event: any) {
    this.overViewData = $event;
    this.invoiceOverviewDataOP.emit($event);
  }

  switchNext(data: any) {
    this.switchTab.emit(data.index)
  }

  refreshClick() {
    this.reloadData = true;
  }

  redirectTab(data: any) {

    if (data.multiCheckBox && data.rowData.length > 1) {
      this.rowData = data.rowData;
      this.index = data.index;
      
      this.SBChargeDetailIdsForCC = data.rowData.map((k: any) => k['SBChargeDetailId']);
    } else {
      
        this.sbChargeDetailId = data.rowData?.[0]?.SBChargeDetailId;
        this.rowData = data.rowData;
        this.index = data.index;
      

      //  this.rowData = data.rowData;
      // setTimeout(() => {
      // this.index = data.index;
      // }, 50);
    }
  }

  callOverview(event: any) {
    this.reloadOverview = true;
  }

  reloadGrid(event: any) {
    this.refreshGrid = event;
  }
  redirectTab2(data: any) {
    this.rowData = data.rowData;
    setTimeout(() => {
      this.index = data.index;
    }, 50);
  }

  changedTab(index: any) {
    this.index = index;
  }

  fetchedDataDataOutput($event: any) {
    this.fetchedData = $event;
  }

  onCellClicked($event: any) {
    this.changedTab(1);
  }
}
