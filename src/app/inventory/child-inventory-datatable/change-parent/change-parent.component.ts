import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { LocationService } from 'src/app/services/location.service';
import { WirelineService } from 'src/app/services/wireline.service';
import { isValueExist } from 'src/app/services/helper';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { PTreeTableSelectInventoryComponent } from './p-tree-table-select-inventory/p-tree-table-select-inventory.component';

@Component({
  selector: 'app-change-parent',
  templateUrl: './change-parent.component.html',
  styleUrls: ['./change-parent.component.scss'],
  imports: [SharedModule, PrimgModule,PTreeTableSelectInventoryComponent  ],
  providers: [WirelineService]
})
export class ChangeParentComponent implements OnInit {

  public inventoryId;
  public vendorInventoryId;
  saveButtonDisabled = false;

  inventoryForm: FormGroup;
  customers: any = [];
  vendorsList: any = [];
  inventoryStatusList: any = [];
  vendorProducts: any = [];
  isRowSelected: boolean = false;
  vendorProductInventory: number;

  public inventoryData;

  public loadingDetails: boolean = false;
  serviceIds:any = [];

  private _unsubscribeInventoryDetail: Subject<any> = new Subject<any>();
  private _unsubscribeCustomer: Subject<any> = new Subject<any>();
  private _unsubscribeVendor: Subject<any> = new Subject<any>();
  private _unsubscribeInventoryStatus: Subject<any> = new Subject<any>();
  private _unsubscribeGetServiceDetail: Subject<any> = new Subject<any>();
  private _unsubscribeVendorProducts: Subject<any> = new Subject<any>();
  private _unsubscribeInventory: Subject<any> = new Subject<any>();
  private _unscubscribeUpdateChild: Subject<any> = new Subject<any>();

  constructor(public dialog: MatDialog, @Inject(MAT_DIALOG_DATA) data: any,
    private locationService: LocationService,
    private dialogRef: MatDialogRef<ChangeParentComponent>,
    private wirelineService: WirelineService, private fb: FormBuilder) {

    this.inventoryId = data.data.ChildInventoryId;
    this.vendorInventoryId = data.data.VendorProductInventoryId;
    dialogRef.disableClose = true;
    this.inventoryData = data.data;
    this.serviceIds = data.serviceIds;

    this.getCustomerForUser();
    this.getInventoryDetails();
    this.getVendorList();
    this.getServiceDetail();
    this.getInventorystatuses();
    this.getVendorProduct();
  }

  ngOnInit(): void {
    this.setInventoryForm()
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


  getServiceDetail() {
    this.loadingDetails = true;
    this._unsubscribeGetServiceDetail.next(null);
    this.wirelineService.getServiceDetail(this.vendorInventoryId)
      .pipe(takeUntil(this._unsubscribeGetServiceDetail))
      .subscribe((data) => {
        const servicedata = data.Data;

        if (data && data.Data) {
          this.setValueInFormControl('VendorProductDescription', servicedata.VendorProductDescription);
          this.setValueInFormControl('serviceNumber2', servicedata.ServiceNumber);
          this.setValueInFormControl('billingId2', servicedata.BillingId);
          this.setValueInFormControl('MainAccountNumber2', servicedata.MainAccountNumber);
          this.setValueInFormControl('subAccountNumber2', servicedata.SubAccountNumber);
          this.setValueInFormControl('product', servicedata.ProductName)
          this.setValueInFormControl('productType', servicedata.ProductType)
          this.setValueInFormControl('statusId', servicedata.Status)
          this.setValueInFormControl('vendorProductTypeId', servicedata.VendorProductTypeId)
          this.loadingDetails = false;
        }
      })

  }
  getInventoryDetails() {
    this.loadingDetails = true;

    this._unsubscribeInventoryDetail.next(null);
    this.wirelineService.getChildinventoriesDetails(this.inventoryId).pipe(takeUntil(this._unsubscribeInventoryDetail)).subscribe((response) => {
      if (response.Success) {
        const inventoydata = response.Data;
        if (inventoydata) {
          this.setValueInFormControl('customerId', isValueExist(inventoydata.CustomerAccountId))
          this.setValueInFormControl('VendorId', isValueExist(inventoydata.VendorAccountId))
          this.setValueInFormControl('subAccountNumber', isValueExist(inventoydata.SubAccountNumber));
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

  onSelectionChanged(event: any) {
    event.length > 0 ? this.isRowSelected = true : this.isRowSelected = false;
    event.forEach((e: any) => {
      this.vendorProductInventory = e.VendorProductInventoryId;
    });
  }

  saveChangedParent() {
    this._unscubscribeUpdateChild.next(null);
    let data: any = {};
    data['vendorProductInventoryId'] = this.vendorProductInventory;

    this.saveButtonDisabled = true;
    this.wirelineService.updateParent(this.inventoryId, data).pipe(takeUntil(this._unscubscribeUpdateChild)).subscribe((response) => {
      this.saveButtonDisabled = false;
      this.errorPopup(response)
      this.dialogRef.close(true);
    }, error => {
      this.saveButtonDisabled = false;
      this.errorPopup(error);
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

  getInventorystatuses() {
    this._unsubscribeInventoryStatus.next(null);
    this.locationService.getInventorystatuses().pipe(takeUntil(this._unsubscribeInventoryStatus)).subscribe((data: any) => {
      if (data && data.Data && data.Data.$values) {
        this.inventoryStatusList = data.Data.$values;
      }
    });
  }

  getCustomerForUser() {
    this._unsubscribeCustomer.next(null);
    this.locationService.getCustomerDropDown().pipe(takeUntil(this._unsubscribeCustomer)).subscribe((data) => {
      if (data && data.$values) {
        this.customers = data.$values;
      }
    });
  }

  setValueInFormControl(key: any, value: any) {
    this.f[key].setValue(value);
  }

  get f() {
    return this.inventoryForm.controls;
  }

  setInventoryForm() {
    this.inventoryForm = this.fb.group({
      customerId: new FormControl({ value: '', disabled: true }),
      VendorId: new FormControl({ value: '', disabled: true }),
      subAccountNumber: new FormControl({ value: '', disabled: true }),
      MainAccountNumber: new FormControl({ value: '', disabled: true }),
      serviceNumber: new FormControl({ value: '', disabled: true }),
      billingId: new FormControl({ value: '', disabled: true }),
      statusId: new FormControl({ value: '', disabled: true }),
      product: new FormControl({ value: '', disabled: true }),
      productType: new FormControl({ value: '', disabled: true }),
      vendorProductTypeId: new FormControl({ value: '', disabled: true }),
      VendorProductDescription: new FormControl({ value: '', disabled: true }),
      inventoryCustomField1: new FormControl({ value: '', disabled: true }),
      inventoryCustomField2: new FormControl({ value: '', disabled: true }),
      inventoryCustomField3: new FormControl({ value: '', disabled: true }),
      inventoryCustomField4: new FormControl({ value: '', disabled: true }),
      serviceNumber2: new FormControl({ value: '', disabled: true }),
      billingId2: new FormControl({ value: '', disabled: true }),
      MainAccountNumber2: new FormControl({ value: '', disabled: true }),
      subAccountNumber2: new FormControl({ value: '', disabled: true }),
    })
  }

  getVendorProduct() {
    this._unsubscribeVendorProducts.next(null);
    this.locationService.getVendorProducts().pipe(takeUntil(this._unsubscribeVendorProducts)).subscribe((data) => {
      if (data && data.Data.$values) {
        this.vendorProducts = data.Data.$values;
      }
    });
  }

  ngOnDestroy() {
    this._unsubscribeInventoryDetail.next(null);
    this._unsubscribeInventoryDetail.complete();
    this._unsubscribeCustomer.next(null);
    this._unsubscribeCustomer.complete();
    this._unsubscribeVendor.next(null);
    this._unsubscribeVendor.complete();
    this._unsubscribeInventoryStatus.next(null);
    this._unsubscribeInventoryStatus.complete();
    this._unsubscribeGetServiceDetail.next(null);
    this._unsubscribeGetServiceDetail.complete();
    this._unsubscribeVendorProducts.next(null);
    this._unsubscribeVendorProducts.complete();
    this._unsubscribeInventory.next(null);
    this._unsubscribeInventory.complete();
    this._unscubscribeUpdateChild.next(null);
    this._unscubscribeUpdateChild.complete();
  }
}
