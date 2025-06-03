import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import _ from 'lodash';
import { WirelineService } from 'src/app/services/wireline.service';
import { ContractService } from 'src/app/services/contract.service';
import { checkIsValueExists } from 'src/app/services/helper';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PTreeSelectInvtryContractComponent } from './p-tree-select-invtry-contract/p-tree-select-invtry-contract.component';

@Component({
  selector: 'app-link-inventory-c-dialog',
  templateUrl: './link-inventory-c-dialog.component.html',
  styleUrls: ['./link-inventory-c-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    PTreeSelectInvtryContractComponent
  ],
  providers: [
    WirelineService,
    ContractService
  ]
})
export class LinkInventoryCDialogComponent implements OnInit {

  customers: any = [];
  rowData: any = [];
  dialogData: any;
  serviceIds: any = [];
  services: any = [];
  stopSpinner: boolean = false;
  saveButtonLoader: boolean = false;
  isSendVendorProductInventoryId: boolean = false;
  whichPage: any;
  checkedData: any;
  inventoryData: any;
 
  private _unsubscribeInventory: Subject<any> = new Subject<any>();
  private _unsubscribeService: Subject<any> = new Subject<any>();
  constructor(public dialog: MatDialog,
    public wirelineService: WirelineService,
    private dialogRef: MatDialogRef<LinkInventoryCDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    private contractService: ContractService,
  ) {
    this.dialogData = data.data;
    this.whichPage = data.whichPage;
    this.isSendVendorProductInventoryId = data?.isSendVendorProductInventoryId;
    dialogRef.disableClose = true;
  }

  ngOnInit(): void {
  }

  onSelectionChanged(event: any) {
    this.checkedData = event;

    let data: any = {};
    let VendorProductInventoryIds:any = [];
    event.forEach((element: any) => {
      VendorProductInventoryIds.push(element.VendorProductInventoryId)
    });
    data['VendorProductInventoryIds'] = VendorProductInventoryIds;
    this.inventoryData = data;
  }

  onCellDoubleClicked($event: any) {
    if($event?.data?.ContractDocumentName && $event?.data?.ContractId !== this.dialogData?.ContractId){
      this.dialogRef.close($event.data);
    }
  }

  saveAssociatedInventory() {
    if (checkIsValueExists(this.inventoryData)) {
      this.saveButtonLoader = true;

      let id = this.dialogData?.ContractId ? this.dialogData?.ContractId : this.dialogData?.AddendumId;

      this.contractService.linkInventory(id, this.dialogData?.ContractDocumentType, this.inventoryData)
        .subscribe((res: any) => {
          this.saveButtonLoader = false;
          if (res['Success']) {
            this.errorPopup(res);
          } else {
            this.errorPopup(res);
          }
        }, error => {
          this.saveButtonLoader = false;
          this.errorPopup(error);
        });
    } else {

      const isSelectedRowData = this.rowData.some((arr: any) => arr.IsSelected === true);
      if (this.rowData && this.rowData.length > 0 && isSelectedRowData) {
        let data: any = {};
        let VendorProductInventoryIds:any = [];
        this.rowData.forEach((element: any) => {
          if (element.IsSelected) {
            VendorProductInventoryIds.push(element.VendorProductInventoryId);
          }
        });

        data['VendorProductInventoryIds'] = VendorProductInventoryIds;
        this.saveButtonLoader = true;

        let id = this.dialogData?.ContractId ? this.dialogData?.ContractId : this.dialogData?.AddendumId;

        this.contractService.linkInventory(id, this.dialogData?.ContractDocumentType, data)
          .subscribe((res: any) => {
            this.saveButtonLoader = false;
            if (res['Success']) {
              this.errorPopup(res);
            } else {
              this.errorPopup(res);
            }
          }, error => {
            this.saveButtonLoader = false;
            this.errorPopup(error);
          });

      } else {
        const response = {
          'Message': 'Please select At least one Inventory'
        }
        this.errorPopup(response, false);
      }
    }
  }

  rowDatas($event: any){
    this.rowData = $event;
  }
  ngOnDestroy(): any {
    this._unsubscribeInventory.next(null);
    this._unsubscribeInventory.complete();
    this._unsubscribeService.next(null);
    this._unsubscribeService.complete();
  }

  errorPopup(data: any, popupCloseToRefresh = true) {
    let errorData: any = {
      messgeType: 'error',
      title: 'Attention',
      titleClass: 'text-c-blue',
      icon: 'fas fa-exclamation-circle',
      iconClass: 'text-c-blue f-70',
      message: data.Message,
    };
    const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
      panelClass: 'error-warning',
      data: errorData,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (popupCloseToRefresh) {
        this.dialogRef.close(result);
      }
    });
  }

}
