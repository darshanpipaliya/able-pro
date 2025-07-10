import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { InvoiceOverviewComponent } from '../invoice-overview/invoice-overview.component';
import { DistributionRuleMainGridComponent } from './distribution-rule-main-grid/distribution-rule-main-grid.component';

@Component({
  selector: 'app-distribution-rule',
  templateUrl: './distribution-rule.component.html',
  styleUrls: ['./distribution-rule.component.scss'],
  imports: [SharedModule, PrimgModule, InvoiceOverviewComponent, DistributionRuleMainGridComponent]
})
export class DistributionRuleComponent implements OnInit {

  @Input() selectedTab: any;
  @Input() sandBoxGridRowData: any;
  overviewData: any;

  index = 1;
  selectedIndex = 0;
  dataRefresh: any;

  @Output() invoiceOverviewDataOP: EventEmitter<any> = new EventEmitter<any>();
  @Output() clickOnSaved: EventEmitter<any> = new EventEmitter<any>();
  constructor() { }

  ngOnInit(): void {
  }

  changedTab(index: any) {
    this.selectedIndex = index;
  }
  invoiceOverviewDataOutput(event: any){
    this.overviewData = event;
    this.invoiceOverviewDataOP.emit(event);
  }  

  clickOnSavedfn($event: any) {
    this.clickOnSaved.emit($event);
  }

  refreshData(event: any) {
    this.dataRefresh = event; 
  }
}
