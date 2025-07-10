import { AfterViewInit, Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import _ from 'lodash';
import { LocationService } from 'src/app/services/location.service';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SpaceTrimStartEndInputirective } from 'src/app/custom-directives/custom-validation.directive';

@Component({
  selector: 'app-add-vendor-product',
  templateUrl: './add-vendor-product.component.html',
  styleUrls: ['./add-vendor-product.component.scss'],
  standalone: true,
  imports: [SharedModule, PrimgModule, SpaceTrimStartEndInputirective]
})
export class AddVendorProductComponent implements OnInit {
  addProductForm: FormGroup;
  isProductFormSubmit: boolean = false;
  industries: any = [];
  services: any = [];
  serviceTypes: any = [];
  products: any = [];
  productTypes: any = [];
  selectedTab: any = 0;
  reconList:any = [];

  vendors: any = [];
  saveButtonLoadder = false;
  maxChars = 100;
  @Input() removeClose: any;
  @Input() disableStatus: any;
  @Input() vendorProductData: any;

  isShowColseButton: boolean = false;

  private _unsubscribeRecon: Subject<any> = new Subject<any>();
  
  selected: any;
  previousTableRowData: any;
  
  @Output() onAddVendorProductDestroy: EventEmitter<any> = new EventEmitter<any>();

  @Output() onUserAddEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() emitRecordData: EventEmitter<any> = new EventEmitter<any>();
  @Output() currentOpenEditPage: EventEmitter<any> = new EventEmitter<any>()
  statusList = [
    { Id: true, Name: 'Active' },
    { Id: false, Name: 'Inactive' },
  ]

  constructor(
    private locationService: LocationService,
    public dialog: MatDialog,
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddVendorProductComponent>,
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    this.selected = data.selected;
    this.previousTableRowData = data.previousTableRowData;
    dialogRef.disableClose = true;
    this.addProductForm = fb.group({
      name: new FormControl('', [Validators.required, Validators.maxLength(100)]),
      description: new FormControl(''),
      productTypeId: new FormControl('', [Validators.required]),
      status: new FormControl(true, [Validators.required]),
      vendorAccountId: new FormControl('', [Validators.required]),
      industryId: new FormControl('', [Validators.required]),
      serviceTypeId: new FormControl('', [Validators.required]),
      serviceId: new FormControl('', [Validators.required]),
      productId: new FormControl('', [Validators.required]),
      keepForProduction: new FormControl(false),
      reconAssigmentId:  new FormControl('', [Validators.required]),
      productStructureId: new FormControl('')
    })
  }


  ngOnInit(): void {
    this.isShowColseButton = this.removeClose;
    this.currentOpenEditPage.emit(false);
    this.getAllProductData();
    this.getVendorsForUser();
    this.reconAssigments();

    if(this.vendorProductData) {
      this.addProductForm.patchValue(this.vendorProductData);
      this.callIndustry()
    }
  }

  ngAfterViewInit() {
  }

  getAllProductData = () => {
    this.locationService.getVendorDropdown().subscribe((data) => {
      if (data && data.Data.$values) {
        this.vendors = data.Data.$values;
        this.addProductForm.controls['vendorAccountId'].setValue(this.previousTableRowData[0]?.VendorAccountId);
      }
    });
    this.locationService.getIndustries().subscribe((data: any) => {
      if (data) {
        this.industries = data.Data.$values;
      }
    });
  }


  callIndustry() {
    this.services = [];
    this.serviceTypes = [];
    this.products = [];
    this.productTypes = [];
    this.addProductForm.controls['serviceId'].setValue(null);
    this.addProductForm.controls['serviceTypeId'].setValue(null);
    this.addProductForm.controls['productId'].setValue(null);
    this.addProductForm.controls['productTypeId'].setValue(null);
    let data = {
      "industryId": this.addProductForm.value.industryId,
      "serviceId": null,
      "serviceTypeId": null,
      "productId": null,
      "productTypeId": null
    }
    this.locationService.getServicesList(data).subscribe((data) => {
      if (data.Success) {
        this.services = data.Data.$values;
        if(this.vendorProductData) {
          this.addProductForm.controls['serviceId'].setValue(this.vendorProductData.serviceId);
          this.callService();
        }
      } else {
        this.ErrorWarningPopupOpen(data.Message)
      }
    });

  }
  ErrorWarningPopupOpen(message: any) {
    let errorData: any = {
      messgeType: "error",
      title: "Attention",
      titleClass: "text-c-blue",
      icon: "fas fa-exclamation-circle",
      iconClass: "text-c-blue f-70",
      message: message //if messges is multiple use array
    }
    const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
    return
  }
  callService() {
    this.serviceTypes = [];
    this.products = [];
    this.productTypes = [];
    this.addProductForm.controls['serviceTypeId'].setValue(null);
    this.addProductForm.controls['productId'].setValue(null);
    this.addProductForm.controls['productTypeId'].setValue(null);
    let data = {
      "industryId": this.addProductForm.value.industryId,
      "serviceId": this.addProductForm.value.serviceId,
      "serviceTypeId": null,
      "productId": null,
      "productTypeId": null
    }
    this.locationService.getServiceTypeList(data).subscribe((data) => {
      if (data.Success) {
        this.serviceTypes = data.Data.$values;
        if(this.vendorProductData) {
          this.addProductForm.controls['serviceTypeId'].setValue(this.vendorProductData.serviceTypeId);
          this.callServiceType();
        }
      } else {
        this.ErrorWarningPopupOpen(data.Message)
      }

    });
    // this.locationService.getServiceServicetypes(this.addProductForm.value.serviceId).subscribe((data) => {
    //     if (data && data.$values) {
    //         this.serviceTypes = data.$values;
    //     }
    // }, error => {
    //     if (error.status === 404) {
    //         let errorData: any = {
    //             messgeType: "error",
    //             title: "Attention",
    //             titleClass: "text-c-blue",
    //             icon: "fas fa-exclamation-circle",
    //             iconClass: "text-c-blue f-70",
    //             message: 'No records found with the selected service'
    //         }
    //         const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
    //         dialogRef.afterClosed().subscribe(result => {
    //         });
    //     }
    // });
  }

  callServiceType() {
    this.products = [];
    this.productTypes = [];
    this.addProductForm.controls['productId'].setValue(null);
    this.addProductForm.controls['productTypeId'].setValue(null);

    let data = {
      "industryId": this.addProductForm.value.industryId,
      "serviceId": this.addProductForm.value.serviceId,
      "serviceTypeId": this.addProductForm.value.serviceTypeId,
      "productId": null,
      "productTypeId": null
    }
    this.locationService.getProductList(data).subscribe((data) => {
      if (data.Success) {
        this.products = data.Data.$values;
        if(this.vendorProductData) {
          this.addProductForm.controls['productId'].setValue(this.vendorProductData.productId);
          this.callProduct();
        }
      } else {
        this.ErrorWarningPopupOpen(data.Message)
      }
    });

  }

  callProduct() {
    this.productTypes = [];
    // this.addProductForm.controls['productTypeId'].setValue(null);
    let data = {
      "industryId": this.addProductForm.value.industryId,
      "serviceId": this.addProductForm.value.serviceId,
      "serviceTypeId": this.addProductForm.value.serviceTypeId,
      "productId": this.addProductForm.value.productId,
      "productTypeId": null
    }
    this.locationService.getProductTypeList(data).subscribe((data) => {
      if (data.Success) {
        this.productTypes = data.Data.$values;
        if(this.vendorProductData) {
          this.addProductForm.controls['productTypeId'].setValue(this.vendorProductData.productTypeId);
          this.callProductType();
        }
      } else {
        this.ErrorWarningPopupOpen(data.Message)
      }
    });
    // this.locationService.getProducttypes(this.addProductForm.value.productId).subscribe((data) => {
    //     if (data && data.$values) {
    //         this.productTypes = data.$values;
    //     }
    // }, error => {
    //     if (error.status === 404) {
    //         let errorData: any = {
    //             messgeType: "error",
    //             title: "Attention",
    //             titleClass: "text-c-blue",
    //             icon: "fas fa-exclamation-circle",
    //             iconClass: "text-c-blue f-70",
    //             message: 'No records found with the selected product'
    //         }
    //         const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
    //         dialogRef.afterClosed().subscribe(result => {
    //         });
    //     }
    // });
  }

  callProductType() {
    let data = {
      "industryId": this.addProductForm.value.industryId,
      "serviceId": this.addProductForm.value.serviceId,
      "serviceTypeId": this.addProductForm.value.serviceTypeId,
      "productId": this.addProductForm.value.productId,
      "productTypeId": this.addProductForm.value.productTypeId
    }
    this.locationService.getproductStructureDetail(data).subscribe((data) => {
      if (data.Success) {

        const getReconValue: any = this.reconList.find((e: any) => {
          return e.Id == data.Data.$values[0].ReconAssigmentId;
        });
      
        this.addProductForm.controls['reconAssigmentId'].setValue(getReconValue.Assignment);
        this.addProductForm.patchValue({ 'productStructureId': data.Data.$values[0].Id })
      }
    });
    
  }

  getVendorsForUser() {
    this.locationService.getVendorDropdown().subscribe((data) => {
      if (data && data.Data.$values) {
        this.vendors = data.Data.$values;
      }
    });
  }

  reconAssigments() {
    this.locationService.ReconAssigments().pipe(takeUntil(this._unsubscribeRecon)).subscribe((res: any) => {
      if (res.Success) {
        this.reconList = res.Data.$values;
      }
    })
  }


  get f() : any {
    return this.addProductForm.controls;
  }

  saveProduct() {
    this.isProductFormSubmit = true;
    if (this.addProductForm.valid) {
      this.saveButtonLoadder = true;
      const data: any = this.addProductForm.value;
      data.status = data.status || data.status === 'true' ? true : false;
      data.reconAssigmentId =  this.reconList.find((f: any) => f.Assignment === data.reconAssigmentId).Id;
      delete data.serviceId;
      delete data.productTypeId;
      delete data.productId;
      delete data.serviceTypeId;

      // data.productTypeId = Number(data.productTypeId);
      this.locationService.addVendorProduct(data).subscribe({
        next: data => {
          this.saveButtonLoadder = false;
          if (data.Success) {
            let errorData: any = {
              messgeType: "error",
              title: "Attention",
              titleClass: "text-c-blue",
              icon: "fas fa-exclamation-triangle",
              iconClass: "text-c-blue f-70",
              message: 'Successfully saved' //if messges is multiple use array
            }
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
            dialogRef.afterClosed().subscribe(result => {
              this.onUserAddEvent.emit(true);
              if (data.Success) {
                this.emitRecordData.emit(data);
              }
              this.dialogRef?.close(data.Id);
            });
          } else {
            let errorData: any = {
              messgeType: "error",
              title: "Attention",
              titleClass: "text-c-blue",
              icon: "fas fa-exclamation-triangle",
              iconClass: "text-c-blue f-70",
              message: data.Message //if messges is multiple use array
            }
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
          }
        },
        error: error => {
          this.saveButtonLoadder = false;
          let errorMessage: any = '';
          if (error.status === 400) {
            errorMessage = error.error ? error.error : 'Bad request';
            let errorData: any = {
              messgeType: "error",
              title: "Attention",
              titleClass: "text-c-blue",
              icon: "fas fa-exclamation-triangle",
              iconClass: "text-c-blue f-70",
              message: errorMessage //if messges is multiple use array
            }
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
          }
        }
      });
    }
  }

  ngOnDestroy(): void {
    this._unsubscribeRecon.next(null);
    this._unsubscribeRecon.complete();
    this.onAddVendorProductDestroy.emit(this.addProductForm.value);

  }

}
