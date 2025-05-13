import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { ContractService } from '../../../contract.service';
import { takeUntil } from 'rxjs/operators';
import _ from 'lodash';
import { WirelineService } from '../../../wireline.service';

@Component({
  selector: 'app-inventory-c',
  templateUrl: './inventory-c.component.html',
  styleUrls: ['./inventory-c.component.scss']
})
export class InventoryCComponent implements OnInit {

  @Input() tabData;
  @Input() fromTab;

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

  constructor(public wirelineService: WirelineService
  ) {
  }

  ngOnInit(): void {
    this.onLoadContractInventory.emit(this.tabData);
    this.disableLinkDialog.emit(true);
    if (this.fromTab == 'inventory-popup') {
      this.fromInventoryLinkDialog.emit(true);
    }

  }

  disableLinkDialogfn(e) {
    this.disableLinkDialog.emit(e);
  }

  onCellDoubleClickedEvent($event) {
    if (this.fromTab !== 'inventory-popup') {
      this.onCellDoubleClickedEventInventory.emit($event.data);
    }
  }

  onOverviewLoaded($event) {
    this.overviewData = $event;    
  }

  ngOnDestroy(): any {
    this._unsubscribeLinkedInventory.next();
    this._unsubscribeLinkedInventory.complete();
  }

}
