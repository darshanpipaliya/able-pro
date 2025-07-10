import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatTabGroup } from '@angular/material/tabs';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { InvoiceOverviewComponent } from '../invoice-overview/invoice-overview.component';
import { FinalPublishComponent } from '../final-publish/final-publish.component';
import { FinalReviewComponent } from '../final-review/FinalReviewComponent';

@Component({
  selector: 'app-final-review-tab',
  templateUrl: './final-review-tab.component.html',
  styleUrls: ['./final-review-tab.component.scss'],
  imports: [SharedModule, PrimgModule, InvoiceOverviewComponent, FinalPublishComponent, FinalReviewComponent]
})
export class FinalReviewTabComponent implements OnInit {

  @Input() selectedTab: any;
  @Input() recordPublishedOrCompleted: any;
  selectedTabIndex = 0;
  overviewData: any;
  refreshDatas: any;
  isFetchedNew = false;

  @Output() invoiceOverviewDataOP: EventEmitter<any> = new EventEmitter<any>();
  
  @Input() sandBoxGridRowData: any;
  @Output() onClickHyperlinkSend: EventEmitter<any> = new EventEmitter<any>();
  @Output() clickOnSaved: EventEmitter<any> = new EventEmitter<any>();
  @Output() moveToGridPage: EventEmitter<any> = new EventEmitter<any>();
  @Output() moveToStep6Tab: EventEmitter<any> = new EventEmitter<any>();
  @Output() moveToStep4Tab: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  ngOnInit(): void {
  }

  onClickHyperlink($event: any){
    this.onClickHyperlinkSend.emit($event);
  }

  clickOnSavedfn($event: any) {
    this.clickOnSaved.emit($event);
  }

  moveToGridPageFn($event: any) {
    this.moveToGridPage.emit($event);
  }

  invoiceOverviewDataOutput(event: any){
    this.overviewData = event;
    this.invoiceOverviewDataOP.emit(event);
    if(this.isFetchedNew && this.overviewData?.IsApproved) {
      this.selectedTabIndex = 1;
      this.isFetchedNew = false;
    }
 
  }  

  moveToStep6($event: any) {
    this.moveToStep6Tab.emit($event);
  }

  moveToStep4($event: any) {
    this.moveToStep4Tab.emit($event);
  }

  moveToPublish() {
    
    if(this.overviewData?.IsApproved){
      this.selectedTabIndex = 1;
    } else {
      this.refreshDatas = true;
      this.isFetchedNew = true;
    }
  }

  ngOnDestroy() {
    this.isFetchedNew = false;
  }
}
