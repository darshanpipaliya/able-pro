import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SharedModule } from 'src/app/demo/shared/shared.module';

@Component({
  selector: 'app-error-warning-popup',
  templateUrl: './error-warning-popup.component.html',
  styleUrls: ['./error-warning-popup.component.scss'],
  standalone: true,
  imports: [
    SharedModule
  ]
})
export class ErrorWarningPopupComponent implements OnInit {
  messageData: any;
  close = 'undefined';
  isSuccess: boolean = false;
  hideOkbtn = false;
  list: any;
  isShowLabel = true;
  textValue: any;
  isRedirect = false;
  VendorProductTypeIds: any;
  redirectFrom: any;
  inventoryList: any;
  currentUrl = window.location.origin;
  constructor(
    public matDialogRef: MatDialogRef<ErrorWarningPopupComponent>,
    @Inject(MAT_DIALOG_DATA) data:any
    
  ) {
    
    matDialogRef.disableClose = true;
    if (typeof data.message == 'string') {
      data.message = [data.message];
    }
    this.messageData = data;
    this.hideOkbtn = this.messageData.hideOkbtn;
    this.list = data?.list;
    this.isShowLabel = data?.fromTab == 'uploadfile' ? false : true
    this.isSuccess = this.messageData.message?.includes('Successfully saved');
    this.textValue = data?.textValue;
    this.isRedirect = data?.link;
    this.VendorProductTypeIds = data?.VendorProductTypeIds ? data?.VendorProductTypeIds[0] : {};
    this.redirectFrom = data?.from;
    this.inventoryList = data?.inventoryList;
  }

  ngOnInit(): void {
  }

  inventoryClick(item: { vendorProductInventoryId: string; }) {
    const link = this.currentUrl + '/inventory/allinventory?VendorProductInventoryId=' + item.vendorProductInventoryId; 
    window.open(link, '_blank');
  }
  redirectTab() {
    const link = this.currentUrl + '/management/vendors/charge-codes-group?GroupId=' + this.VendorProductTypeIds.GroupId + '&GroupXVendorProductTypeId=' + this.VendorProductTypeIds.GroupXVendorProductTypeId + '&VendorProductTypeId=' + this.VendorProductTypeIds.VendorProductTypeId; 
    window.open(link, '_blank');
  }

}
