import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { InvoiceOverviewComponent } from '../invoice-overview/invoice-overview.component';
import { PayableAccountComponent } from '../payable-account/payable-account.component';
import { IsdByAccountComponent } from '../isd-by-account/isd-by-account.component';
import { IsdByChargeLocationComponent } from '../isd-by-charge-location/isd-by-charge-location.component';
import { IsdByBillingIdComponent } from '../isd-by-billing-id/isd-by-billing-id.component';
import { CdAccountLevelComponent } from '../cd-account-level/cd-account-level.component';

@Component({
  selector: 'app-charge-validation-tab',
  templateUrl: './charge-validation-tab.component.html',
  styleUrls: ['./charge-validation-tab.component.scss'],
  imports: [SharedModule, PrimgModule, InvoiceOverviewComponent, PayableAccountComponent, IsdByAccountComponent, IsdByChargeLocationComponent, IsdByBillingIdComponent, CdAccountLevelComponent]
})
export class ChargeValidationTabComponent implements OnInit {

  @Input() selectedTab: any;
  @Input() sendTo4D: any;
  @Output() invoiceOverviewDataOP: EventEmitter<any> = new EventEmitter<any>();
  @Output() mainTabRedirect: EventEmitter<any> = new EventEmitter<any>();
  @Output() chargeValidationDestroy: EventEmitter<any> = new EventEmitter<any>();
  @Input() recordPublishedOrCompleted: any;
  @Input() sandBoxGridRowData: any;
  index = 1;
  selectedIndex = 0;
  overViewData: any;
  from4A: boolean = false;
  from4AData: any = [];
  dataRefresh: any;
  refreshGrid: boolean = false;
  constructor() { }

  ngOnInit(): void {
    if(this.sendTo4D){
      this.selectedIndex = 4;
    } 
  }

  invoiceOverviewDataOutput($event: any) {
    this.overViewData = $event;
    this.invoiceOverviewDataOP.emit($event);
  }

  changedTab(index: any) {
    this.selectedIndex = index;
  }

  mainTabRedirect1(event: any) {
    this.mainTabRedirect.emit(event);
  }
  refreshData(event: any) {
    this.dataRefresh = event; 
  }
  redirectTab(data: any) {
    this.selectedIndex = data.index;
    if(data.index === 4){
      this.from4A = true;
      this.from4AData = data.rowData;
    }
  }
  reloadGrid(event: any) {
    this.refreshGrid = event;
  }

  ngOnDestroy() {
    this.chargeValidationDestroy.emit(true);
  }
}
