import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { WirelineService } from 'src/app/services/wireline.service';
import { LocationService } from 'src/app/services/location.service';
import { checkIsValueExists } from 'src/app/services/helper';
import { ErrorWarningPopupComponent } from '../error-warning-popup/error-warning-popup.component';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';

@Component({
  selector: 'app-add-edit-child-inventory',
  templateUrl: './add-edit-child-inventory.component.html',
  styleUrls: ['./add-edit-child-inventory.component.scss'],
  imports: [
    SharedModule,
    PrimgModule
  ]
})
export class AddEditChildInventoryComponent implements OnInit {
  inventoryForm: FormGroup;
  subAccountNumberRequired = true;
  public saveButtonLoader: Boolean = false;

  isSameParent: boolean = true;
  data: any;
  subBillingAccountDD:any = [];
  statusList = [
    { Id: true, Name: 'Active' },
    { Id: false, Name: 'Inactive' },
  ]
  loadingsubBillAccDD: any = false;
  mainBillingAccDD: any = false;

  isFormSubmit: boolean = false;
  inventoryStatusList: any = [];
  loadingInventorySts: any = [];

  private _unsubscribeSubBilingAccount: Subject<any> = new Subject<any>();
  private _unsubscribeChildInventory: Subject<any> = new Subject<any>();
  private _unsubscribeAllCustomerVendor: Subject<any> = new Subject<any>();
  private _unsubscribeInventoryStatus: Subject<any> = new Subject<any>();

  constructor(@Inject(MAT_DIALOG_DATA) data: any, public dialog: MatDialog,
    private fb: FormBuilder, private wirelineService: WirelineService,
    private locationService: LocationService, private dialogRef: MatDialogRef<AddEditChildInventoryComponent>) {
    this.data = data;
    dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    this.data.editedData = this.data.editedData ? this.data.editedData : this.data.savedData;
    this.setForm();
    this.getInventorystatuses();
  }

  parentChange() {
    this.isFormSubmit = false;
    // this.inventoryForm.get('statusId').reset();
    this.inventoryForm.get('serviceNumber')?.reset();

    if (!this.isSameParent) {
      this.inventoryForm.get('payableAccountChildNumber')?.setValidators([Validators.required])
      this.inventoryForm.get('BillingAccountChildHierarchyIdDisplay')?.setValidators([Validators.required])
      this.inventoryForm.get('subAccountNumberChild')?.setValidators([Validators.required])
    } else {
      this.inventoryForm.get('payableAccountChildNumber')?.clearValidators();
      this.inventoryForm.get('BillingAccountChildHierarchyIdDisplay')?.clearValidators();
      this.inventoryForm.get('subAccountNumberChild')?.clearValidators();
    }
    this.inventoryForm.get('payableAccountChildNumber')?.updateValueAndValidity();
    this.inventoryForm.get('BillingAccountChildHierarchyIdDisplay')?.updateValueAndValidity();
    this.inventoryForm.get('subAccountNumberChild')?.updateValueAndValidity();
  }

  getInventorystatuses() {
    this.loadingInventorySts = true;
    this._unsubscribeInventoryStatus.next(null);
    this.locationService.getInventorystatuses().pipe(takeUntil(this._unsubscribeInventoryStatus)).subscribe((data: any) => {
      if (data && data.Data && data.Data.$values) {
        this.inventoryStatusList = data.Data.$values;
        this.loadingInventorySts = false;

        // this.getInventorystatusesCode();
      } else {
        this.loadingInventorySts = false;
        this.inventoryStatusList = [];
      }
    }, error => {
      this.loadingInventorySts = false;
      this.inventoryStatusList = [];
    });
  }

  setForm() {
    this.inventoryForm = this.fb.group({
      VendorIdDisplay: new FormControl(this.data.editedData.VendorAccountId),
      VendorIdChildDisplay: new FormControl(this.data.editedData.VendorAccountId),
      BillingAccountHierarchyIdDisplay: new FormControl(this.data.editedData.MainAccountNumber),
      BillingAccountChildHierarchyIdDisplay: new FormControl(''),
      subAccountNumberDisplay: new FormControl(this.data.editedData.SubAccountNumber),
      subAccountNumberChild: new FormControl(''),
      payableAccountNumberDisplay: new FormControl(this.data.editedData.PayableAccountNumber),
      payableAccountChildNumber: new FormControl(''),
      serviceDisplay: new FormControl(this.data.editedData.ServiceId),
      serviceTypeDisplay: new FormControl(this.data.editedData.ServiceTypeId),
      productDisplay: new FormControl(this.data.editedData.ProductId),
      productTypeDisplay: new FormControl(this.data.editedData.ProductTypeId),
      vendorProductTypeIdDisplay: new FormControl(this.data.editedData.VendorProductTypeId),
      vendorProductInventoryDescriptionDisplay: new FormControl(this.data.editedData.VendorProductInventoryDescription ? this.data.editedData.VendorProductInventoryDescription : this.data.editedData.VendorProductDescription),
      serviceNumber: new FormControl('', [Validators.required]),
      statusId: new FormControl(this.data.editedData.Status ? this.data.editedData.Status : this.data.editedData.InventoryStatusId, [Validators.required]),
      inventoryCustomField1: new FormControl(''),
      inventoryCustomField2: new FormControl(''),
      inventoryCustomField3: new FormControl(''),
      inventoryCustomField4: new FormControl(''),
      assignedChildren: new FormControl(this.data.editedData.TotalChildInventory)
    })
  }

  get f() {
    return this.inventoryForm.controls;
  }

  setValueInFormControl(key: any, value: any) {
    this.f[key].setValue(value);
  }

  getSubBillingAccountDD() {
    this.setValueInFormControl('payableAccountChildNumber', '');
    this.inventoryForm.get('payableAccountChildNumber')?.updateValueAndValidity();
    this.subBillingAccountDD = [];

    const findObj = this.data.MainBillingAccountDD.find((a: any) => a.Id === this.f['BillingAccountChildHierarchyIdDisplay'].value);
    
    if (findObj && findObj.PayableAccount) {
      this.setValueInFormControl('payableAccountChildNumber', findObj.AccountNumber);
      this.inventoryForm.get('subAccountNumberChild')?.setValidators([]);
      this.subAccountNumberRequired = false;
    } else {
      this.subAccountNumberRequired = true;
      this.inventoryForm.get('subAccountNumberChild')?.setValidators([Validators.required]);
    }
    this.inventoryForm.get('subAccountNumberChild')?.updateValueAndValidity();
    this.loadingsubBillAccDD = true;

    this._unsubscribeSubBilingAccount.next(null);
    this.wirelineService.getSubBillingAccountsDD(this.f['BillingAccountChildHierarchyIdDisplay'].value)
      .pipe(takeUntil(this._unsubscribeSubBilingAccount))
      .subscribe((data) => {
        if (data && data.Data.$values) {
          this.subBillingAccountDD = data.Data.$values;
          this.loadingsubBillAccDD = false;

          if (checkIsValueExists(this.f['subAccountNumberChild'].value)) {
            this.clickToSubAccNumber();
          }
        } else {
          this.subBillingAccountDD = [];
          this.loadingsubBillAccDD = false;
        }
      }, error => {
        this.subBillingAccountDD = [];
        this.loadingsubBillAccDD = false;
      });
  }

  clickToSubAccNumber() {
    const findObj = this.subBillingAccountDD.find((a: any) => a.Id === this.f['subAccountNumberChild'].value);
    if (findObj && findObj.PayableAccount) {
      this.setValueInFormControl('payableAccountChildNumber', findObj.AccountNumber);
    }
  }

  getMainBillingAccountDD() {

    let KeyString: string = '';

    if (this.f['VendorIdChildDisplay'].value || this.data.editedData.CustomerAccountId) {
      KeyString = `?customerId=${this.data.editedData.CustomerAccountId ?? ''}`;

      if (this.f['VendorIdChildDisplay'].value) {
        KeyString += `&VendorId=${this.f['VendorIdChildDisplay'].value}`;
      }

      KeyString += '&getOnlyMain=true';
    }

    this.mainBillingAccDD = true;
    this._unsubscribeAllCustomerVendor.next(null);
    this.locationService
      .mainBillingAccountsDD(KeyString)
      .pipe(takeUntil(this._unsubscribeAllCustomerVendor))
      .subscribe((data) => {
        if (data && data.$values) {
          this.mainBillingAccDD = false;
          this.getSubBillingAccountDD();
        } else {
          this.mainBillingAccDD = false;
        }
      }, error => {
        this.mainBillingAccDD = false;
      });
  }

  save() {
    const data = {
      'inventoryId': null,
      'vendorProductInventoryId': this.data.editedData.VendorProductInventoryId,
      'billingAccountHierarchyId': this.isSameParent ? this.data.editedData.BillingAccountHierarchyId :
        this.f['subAccountNumberChild'].value ? this.f['subAccountNumberChild'].value : this.f['BillingAccountChildHierarchyIdDisplay'].value,
      'billingId': null,
      'serviceNumber': this.f['serviceNumber'].value,
      'alias': null,
      'description': this.f['vendorProductInventoryDescriptionDisplay'].value,
      'inventoryCustomField1': this.f['inventoryCustomField1'].value,
      'inventoryCustomField2': this.f['inventoryCustomField2'].value,
      'inventoryCustomField3': this.f['inventoryCustomField3'].value,
      'inventoryCustomField4': this.f['inventoryCustomField4'].value,
      'statusId': this.f['statusId'].value,
      'inventoryOriginId': this.data.editedData.InventoryOriginId
    }

    this.isFormSubmit = true;
    if (this.inventoryForm.valid) {
      this.saveButtonLoader = true;
      this._unsubscribeChildInventory.next(null);
      this.wirelineService.addChildInventory(data)
        .pipe(takeUntil(this._unsubscribeChildInventory))
        .subscribe(
          (data) => {
            if(data.Success) {
              this.saveButtonLoader = false;
              this.errorPopup(data)
              this.dialogRef.close(data);
            } else {
              this.saveButtonLoader = false;
              this.errorPopup(data)
            }
        }, error => {
          this.saveButtonLoader = false;
          this.errorPopup(error);
        });
    }
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
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeChildInventory.next(null);
    this._unsubscribeChildInventory.complete();
    this._unsubscribeSubBilingAccount.next(null);
    this._unsubscribeSubBilingAccount.complete();
    this._unsubscribeAllCustomerVendor.next(null);
    this._unsubscribeAllCustomerVendor.complete();
  }
}
