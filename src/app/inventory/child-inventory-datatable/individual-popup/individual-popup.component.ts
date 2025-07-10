import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { WirelineService } from 'src/app/services/wireline.service';
import { LocationService } from 'src/app/services/location.service';
import { isValueExist } from 'src/app/services/helper';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';

@Component({
  selector: 'app-individual-popup',
  templateUrl: './individual-popup.component.html',
  styleUrls: ['./individual-popup.component.scss'],
  imports: [SharedModule, PrimgModule],
})
export class IndividualPopupComponent implements OnInit {
  inventoryId;
  customers: any = [];
  vendorsList: any = [];
  vendorProductNames = [];
  services: any;
  serviceTypes: any;
  products: any;
  productTypes: any;
  isRowSelected: boolean = false;
  vendorProductTypeId: number;
  public loadingDetails: boolean = false;
  saveButtonDisabled = false;
  public loadingServiceDetail: boolean = false;

  private _unsubscribeInventoryDetail: Subject<any> = new Subject<any>();
  private _unsubscribeCustomer: Subject<any> = new Subject<any>();
  private _unsubscribeVendor: Subject<any> = new Subject<any>();
  private _unsubscribeIndividual: Subject<any> = new Subject<any>();

  constructor(public dialog: MatDialog, @Inject(MAT_DIALOG_DATA) data: any,
    private locationService: LocationService,
    private wirelineService: WirelineService, private fb: FormBuilder,private dialogRef: MatDialogRef<IndividualPopupComponent> ) {
    this.inventoryId = data.data.ChildInventoryId;
    dialogRef.disableClose = true;
  }
  inventoryForm: FormGroup;

  ngOnInit(): void {
    this.setInventoryForm()
    this.getInventoryDetails();
    this.getCustomerForUser();
    this.getVendorList();
    this.getProductData();
  }
  getInventoryDetails() {
    this.loadingDetails = true;
    this._unsubscribeInventoryDetail.next(null);
    this.wirelineService.getChildinventoriesDetails(this.inventoryId).pipe(takeUntil(this._unsubscribeInventoryDetail)).subscribe((response) => {
      if (response.Success) {
        const inventoydata = response.Data;
        if (inventoydata) {
          this.getVendorProductList(inventoydata['VendorAccountId']);
          this.setValueInFormControl('customerId', isValueExist(inventoydata.CustomerAccountId))
          this.setValueInFormControl('VendorId', isValueExist(inventoydata.VendorAccountId))
          this.setValueInFormControl('subAccountNumber', isValueExist(inventoydata.SubAccountNumber));
          this.setValueInFormControl('payableAccountNumber', isValueExist(inventoydata.PayableAccountNumber));
          this.setValueInFormControl('MainAccountNumber', isValueExist(inventoydata.MainAccountNumber));
          this.setValueInFormControl('inventoryCustomField1', isValueExist(inventoydata.InventoryCustomField1));
          this.setValueInFormControl('inventoryCustomField2', isValueExist(inventoydata.InventoryCustomField2));
          this.setValueInFormControl('inventoryCustomField3', isValueExist(inventoydata.InventoryCustomField3));
          this.setValueInFormControl('inventoryCustomField4', isValueExist(inventoydata.InventoryCustomField4));
          this.setValueInFormControl('serviceNumber', isValueExist(inventoydata.ServiceNumber));
          this.setValueInFormControl('billingId', isValueExist(inventoydata.BillingId));
          this.loadingDetails = false;
        }
      }
    })
  }

  getProductData() {
    this.locationService.getServices().subscribe((data: any) => {
      if (data) {
        this.services = data.Data.$values;
      }
    });
    this.locationService.getServiceTypes().subscribe((data: any) => {
      if (data) {
        this.serviceTypes = data.Data.$values;
      }
    });
    this.locationService.getProductsForVendor().subscribe((data: any) => {
      if (data) {
        this.products = data.Data.$values;
      }
    });
    this.locationService.getProductTypes().subscribe((data: any) => {
      if (data) {
        this.productTypes = data.Data.$values;
      }
    });
  }

  getVendorProductList(vendorAccountId: any) {
    this.wirelineService.vendorProductType(vendorAccountId).subscribe({
      next: (data) => {
        if (data && data.Data.$values) {
          this.vendorProductNames = data.Data.$values;
        }
      }
    });
  }

  setValueInFormControl(key: any, value: any) {
    this.f[key].setValue(value);
  }

  get f() {
    return this.inventoryForm.controls;
  }

  getCustomerForUser() {
    this._unsubscribeCustomer.next(null);
    this.locationService.getCustomerDropDown().pipe(takeUntil(this._unsubscribeCustomer)).subscribe((data) => {
      if (data && data.$values) {
        this.customers = data.$values;
      }
    });
  }
  setInventoryForm() {
    this.inventoryForm = this.fb.group({
      customerId: new FormControl({ value: '', disabled: true }),
      VendorId: new FormControl({ value: '', disabled: true }),
      subAccountNumber: new FormControl({ value: '', disabled: true }),
      MainAccountNumber: new FormControl({ value: '', disabled: true }),
      serviceNumber: new FormControl({ value: '', disabled: true }),
      payableAccountNumber: new FormControl({ value: '', disabled: true }),
      statusId: new FormControl({ value: '', disabled: true }),
      inventoryCustomField1: new FormControl({ value: '', disabled: true }),
      inventoryCustomField2: new FormControl({ value: '', disabled: true }),
      inventoryCustomField3: new FormControl({ value: '', disabled: true }),
      inventoryCustomField4: new FormControl({ value: '', disabled: true }),
      billingId: new FormControl({ value: '', disabled: true }),
      productName: new FormControl(''),
      description: new FormControl({ value: '', disabled: true }),
      productTypeId: new FormControl({ value: '', disabled: true }),
      productId: new FormControl({ value: '', disabled: true }),
      serviceTypeId: new FormControl({ value: '', disabled: true }),
      serviceId: new FormControl({ value: '', disabled: true }),
    })
  }

  getVendorList() {
    this.vendorsList = [];
    this._unsubscribeVendor.next(null);
    this.locationService
      .getVendorDropdown()
      .pipe(takeUntil(this._unsubscribeVendor))
      .subscribe({
        next: (data) => {
          if (data && data.Data.$values) {
            this.vendorsList = data.Data.$values;
          }
        },
        error: (error) => { },
      });
  } 

  ngOnDestroy() {
      this._unsubscribeInventoryDetail.next(null);
      this._unsubscribeInventoryDetail.complete();
      this._unsubscribeCustomer.next(null);
      this._unsubscribeCustomer.complete();
      this._unsubscribeVendor.next(null);
      this._unsubscribeVendor.complete();
      this._unsubscribeIndividual.next(null);
      this._unsubscribeIndividual.complete();
  }
 
  vendorProductTypesDetails() {
    
    let id: any = this.inventoryForm.controls['productName'].value;
    if (id) {
      this.loadingServiceDetail = true;
      this.wirelineService.vendorProductTypeDetail(id).subscribe((data) => {
        if (data && data.Success) {
          this.isRowSelected = true;
          let vendorProductDetails = data.Data;
          this.vendorProductTypeId = vendorProductDetails.VendorProductTypeId;
          this.f['serviceId'].setValue(vendorProductDetails.ServiceId);
          this.f['serviceTypeId'].setValue(vendorProductDetails.ServiceTypeId);
          this.f['productId'].setValue(vendorProductDetails.ProductId);
          this.f['productTypeId'].setValue(vendorProductDetails.ProductTypeId);
          this.f['description'].setValue(vendorProductDetails.Description);
          this.loadingServiceDetail = false;
        }
      });
    }
  }
  saveIndividual() {
    const data: any = {};
    data['vendorProductTypeId'] = this.vendorProductTypeId;
    this._unsubscribeIndividual.next(null);
    this.saveButtonDisabled = true;
    this.wirelineService.makeIndividual(this.inventoryId, data).pipe(takeUntil(this._unsubscribeIndividual)).subscribe((response) => {
      this.errorPopup(response);
      this.saveButtonDisabled = false;
      this.dialogRef.close(true)
    }, error => {
      this.saveButtonDisabled = false;
      this.errorPopup(error)
    });
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
}
