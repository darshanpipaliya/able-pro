
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { InvoiceOverviewComponent } from '../invoice-overview/invoice-overview.component';
import { CostDistributionTabComponent } from '../cost-distribution-tab/cost-distribution-tab.component';
import { DistributionDetail1Component } from '../distribution-detail1/distribution-detail1.component';
import { DistributionDetail2Component } from '../distribution-detail2/distribution-detail2.component';

@Component({
  selector: 'app-cost-distribution-main-tab',
  templateUrl: './cost-distribution-main-tab.component.html',
  styleUrls: ['./cost-distribution-main-tab.component.scss'],
  imports: [SharedModule, PrimgModule, InvoiceOverviewComponent, CostDistributionTabComponent, DistributionDetail1Component, DistributionDetail2Component]
})
export class CostDistributionMainTabComponent implements OnInit {
  @Input() sandBoxGridRowData: any;
  // @Output() clickedRefresh: EventEmitter<any> = new EventEmitter<any>();

  reloadData: any ;

  constructor() { }

  ngOnInit(): void {
  }
  refreshClick() {
    // this.clickedRefresh.emit(true);
    this.reloadData = true;
  }
}
