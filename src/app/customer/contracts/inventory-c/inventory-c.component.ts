import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import _ from 'lodash';
import { ContractOverviewComponent } from '../contract-overview/contract-overview.component';
import { PTreeInventoryContractComponent } from '../p-tree-inventory-contract/p-tree-inventory-contract.component';

@Component({
  selector: 'app-inventory-c',
  templateUrl: './inventory-c.component.html',
  styleUrls: ['./inventory-c.component.scss'],
  imports : [ContractOverviewComponent, PTreeInventoryContractComponent]
})
export class InventoryCComponent implements OnInit {

  @Input() tabData: any;
  @Input() fromTab: any;

  @Output() onLoadContractInventory: EventEmitter<any> = new EventEmitter<any>();
  @Output() onCellDoubleClickedEventInventory: EventEmitter<any> = new EventEmitter<any>();
  @Output() disableLinkDialog: EventEmitter<any> = new EventEmitter<any>();
  @Output() fromInventoryLinkDialog: EventEmitter<any> = new EventEmitter<any>();

  customers: any = [];
  serviceIds: any = [];
  services: any = [];

  stopSpinner: boolean = false;

  overviewData: any;

  private _unsubscribeLinkedInventory: Subject<any> = new Subject<any>();

  constructor() {
  }

  ngOnInit(): void {
    this.onLoadContractInventory.emit(this.tabData);
    this.disableLinkDialog.emit(true);
    if (this.fromTab == 'inventory-popup') {
      this.fromInventoryLinkDialog.emit(true);
    }

  }

  disableLinkDialogfn(e: any) {
    this.disableLinkDialog.emit(e);
  }

  onCellDoubleClickedEvent(event: any) {
    if (this.fromTab !== 'inventory-popup') {
      this.onCellDoubleClickedEventInventory.emit(event.data);
    }
  }

  onOverviewLoaded(event: any) {
    this.overviewData = event;    
  }

  ngOnDestroy(): any {
    this._unsubscribeLinkedInventory.next(null);
    this._unsubscribeLinkedInventory.complete();
  }

}
