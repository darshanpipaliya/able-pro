import { Component, Inject, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { takeUntil } from 'rxjs/operators';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { LocationService } from 'src/app/services/location.service';
import { WirelineService } from 'src/app/services/wireline.service';
import { ErrorWarningPopupComponent } from '../../error-warning-popup/error-warning-popup.component';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { PTreeTableSelectInventoryMakeChildComponent } from './select-inventory-make-child/select-inventory-make-child.component';

@Component({
  selector: 'app-make-child-popup',
  templateUrl: './make-child-popup.component.html',
  styleUrls: ['./make-child-popup.component.scss'],
  imports : [
    SharedModule,
    PrimgModule,
    PTreeTableSelectInventoryMakeChildComponent
  ]
})
export class MakeChildPopupComponent implements OnInit {
  
  public inventoryData;
  isRowSelected: boolean = false;
  vendorProductInventory: number;
  inventoryStatusList: any = [];
  loadingInventorySts: any = [];
  inventoryForm: FormGroup;
  customerList: any = [];
  loadingCustomerList: any = false;
  public saveButtonLoader: Boolean = false;

  private _unsubscribeInventory: Subject<any> = new Subject<any>();
  private _unsubscribeInventoryStatus: Subject<any> = new Subject<any>();
  private _unsubscribeAllCustomer: Subject<any> = new Subject<any>();
  private _unsubscribeChildInventory: Subject<any> = new Subject<any>();

  constructor(@Inject(MAT_DIALOG_DATA) data: any, private locationService: LocationService,
    private wirelineService: WirelineService, private fb: FormBuilder, public dialog: MatDialog,
    private dialogRef: MatDialogRef<MakeChildPopupComponent>) {
    this.inventoryData = data;
    dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    this.setForm();
    this.getInventorystatuses();
    this.getCustomerList();
  }

  getCustomerList() {
    this.customerList = [];
    this.loadingCustomerList = true;
    this._unsubscribeAllCustomer.next(null);
    this.locationService.getCustomerDropDown().pipe(takeUntil(this._unsubscribeAllCustomer)).subscribe((data) => {
      if (data && data.$values) {
        this.customerList = data.$values;
        this.loadingCustomerList = false;
      } else {
        this.customerList = [];
        this.loadingCustomerList = false;
      }
    }, error => {
      this.customerList = [];
      this.loadingCustomerList = false;
    });
  }

  setForm() {
    this.inventoryForm = this.fb.group({
      customerId: new FormControl(this.inventoryData.editedData.CustomerAccountId),
      VendorIdDisplay: new FormControl(this.inventoryData.editedData.VendorAccountId),
      BillingAccountHierarchyIdDisplay: new FormControl(this.inventoryData.editedData.MainAccountNumber),
      subAccountNumberDisplay: new FormControl(this.inventoryData.editedData.subAccountNumber),
      payableAccountNumberDisplay: new FormControl(this.inventoryData.editedData.PayableAccountNumber),
      serviceDisplay: new FormControl(this.inventoryData.editedData.ServiceId),
      serviceTypeDisplay: new FormControl(this.inventoryData.editedData.ServiceTypeId),
      InventoryOriginId: new FormControl(this.inventoryData.editedData.ProductId),
      productTypeDisplay: new FormControl(this.inventoryData.editedData.ProductTypeId),
      vendorProductTypeId: new FormControl(this.inventoryData.editedData.VendorProductTypeId),
      vendorProductInventoryDescription: new FormControl(this.inventoryData.editedData.VendorProductInventoryDescription),
      serviceNumber: new FormControl(this.inventoryData.editedData.ServiceNumber),
      billingId: new FormControl(this.inventoryData.editedData.BillingId),
      statusId: new FormControl(this.inventoryData.editedData.Status),
      assignedChildren: new FormControl(this.inventoryData.editedData.TotalChildInventory),
      isPhoneNumber: new FormControl(this.inventoryData.editedData.IsPhoneNumber),
      service: new FormControl(this.inventoryData.editedData.Service),
      serviceType: new FormControl(this.inventoryData.editedData.ServiceType),
      product: new FormControl(this.inventoryData.editedData.Product),
      productType: new FormControl(this.inventoryData.editedData.ProductType)
    })
  }

  getInventorystatuses() {
    this.loadingInventorySts = true;
    this._unsubscribeInventoryStatus.next(null);
    this.locationService.getInventorystatuses().pipe(takeUntil(this._unsubscribeInventoryStatus)).subscribe((data: any) => {
      if (data && data.Data && data.Data.$values) {
        this.inventoryStatusList = data.Data.$values;
        this.loadingInventorySts = false;
      } else {
        this.loadingInventorySts = false;
        this.inventoryStatusList = [];
      }
    }, error => {
      this.loadingInventorySts = false;
      this.inventoryStatusList = [];
    });
  }

 
  onSelectionChanged(event: any) {
    event.length > 0 ? this.isRowSelected = true : this.isRowSelected = false;
    event.forEach((e: any) => {
      this.vendorProductInventory = e.VendorProductInventoryId;
    });
  }

  saveChild() {
    const data: any = {};
    data['vendorProductInventoryId'] = this.inventoryData.editedData.VendorProductInventoryId;
    data['parentVendorProductInventoryId'] = this.vendorProductInventory;
    this._unsubscribeChildInventory.next(null);
    const id = this.inventoryData.editedData.InventoryId;
    this.saveButtonLoader = true;
    this.wirelineService.makeChild(id, data).pipe(takeUntil(this._unsubscribeInventoryStatus)).subscribe(
      (data) => {
        this.saveButtonLoader = false;
        this.errorPopup(data);
        
      }, error => {
        this.saveButtonLoader = false;
        this.errorPopup(error);
      })
  }

  errorPopup(data: any) {
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
      this.dialogRef.close(data);
    });
  }

}
