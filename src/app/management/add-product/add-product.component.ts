import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { LocationService } from 'src/app/services/location.service';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { SpaceTrimStartEndInputirective } from 'src/app/custom-directives/custom-validation.directive';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.scss'],
  standalone: true,
  imports: [SharedModule, PrimgModule]
})
export class AddProductComponent implements OnInit {
  addProductForm: FormGroup;
  isProductFormSubmit: boolean = false;
  industries: any = [];
  services: any = [];
  serviceTypes: any = [];
  products: any = [];
  productTypes: any = [];
  selectedTab: any = 0;
  statusList = [
    { Id: true, Name: 'Active' },
    { Id: false, Name: 'Inactive' },
  ]
  reconList:any = [];
  private _unsubscribeRecon: Subject<any> = new Subject<any>();
  isSuperTEMManager: boolean = false;
   
  @Input() removeClose: any;
  isShowColseButton: boolean = false;
  @Output() onUserAddEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() currentOpenEditPage: EventEmitter<any> = new EventEmitter<any>();
  saveButtonLoadder = false;
  constructor(public dialog: MatDialog,
    private locationService: LocationService,
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddProductComponent>
  ) {
    dialogRef.disableClose = true;
    this.addProductForm = fb.group({
      industryId: new FormControl('', [Validators.required]),
      serviceId: new FormControl('', [Validators.required]),
      serviceTypeId: new FormControl('', [Validators.required]),
      productId: new FormControl('', [Validators.required]),
      productTypeId: new FormControl('', [Validators.required]),
      keepForProduction: new FormControl(false),
      active: new FormControl(true, [Validators.required]),
      reconAssigmentId:  new FormControl('Locations', [Validators.required]),
      // productStructureId: new FormControl(null)
    })
  }

  ngOnInit(): void {
    this.isSuperTEMManager = this.locationService.isUserHasSuperTEMManagerRole();
 
    this.isShowColseButton = this.removeClose;
    this.currentOpenEditPage.emit(false);
    this.getAllProductData();
    this.reconAssigments();
  }

  getAllProductData = () => {
    this.locationService.getIndustries().subscribe((data: any) => {
      if (data) {
        this.industries = data.Data.$values;
      }
    });

    this.locationService.getProductTypes().subscribe((data: any) => {
      if (data) {
        this.productTypes = data.Data.$values;
      }
    });

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
  }

  get f() : any{
    return this.addProductForm.controls;
  }

  reconAssigments() {
    this.locationService.ReconAssigments().pipe(takeUntil(this._unsubscribeRecon)).subscribe((res: any) => {
      if(res.Success) {
        this.reconList = res.Data.$values;
      }
    })
  }

  ngOnDestroy() {
    this._unsubscribeRecon.next(null);
    this._unsubscribeRecon.complete();  
  }
  
  saveProduct() {
    this.isProductFormSubmit = true;
    if (this.addProductForm.valid) {
      let datas = {
        "industryId": this.addProductForm.value.industryId,
        "serviceId": this.addProductForm.value.serviceId,
        "serviceTypeId": this.addProductForm.value.serviceTypeId,
        "productId": this.addProductForm.value.productId,
        "productTypeId": this.addProductForm.value.productTypeId
      }
      // this.locationService.getproductStructureDetail(datas).subscribe((res: any) => {
      //   if (res.Success) {
      //       this.addProductForm.patchValue({'productStructureId': res.Data.$values[0].Id})
        
          this.saveButtonLoadder = true;
          const data: any = this.addProductForm.value;
          data.reconAssigmentId =  this.reconList.find((f: any) => f.Assignment === data.reconAssigmentId)?.Id;

          this.locationService.addProduct(data).subscribe({
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
                const dialogRef1 = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
                dialogRef1.afterClosed().subscribe(result => {
                  this.onUserAddEvent.emit(true);
                  this.dialogRef?.close(true);
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
                const dialogRef1 = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
                 dialogRef1.afterClosed().subscribe(result => {

                });
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
                const dialogRef1 = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
                dialogRef1.afterClosed().subscribe(result => {
                  // this.onUserAddEvent.emit(true);
                });
              }
            }
          // });
        // } else {
        //   let errorData: any = {
        //     messgeType: "error",
        //     title: "Attention",
        //     titleClass: "text-c-blue",
        //     icon: "fas fa-exclamation-triangle",
        //     iconClass: "text-c-blue f-70",
        //     message: res.Message //if messges is multiple use array
        //   }
        //   const dialogRef1 = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
        //   dialogRef1.afterClosed().subscribe(result => {
        //   });
        // }
      });

    }
  }

  callIndustry() {
    this.services = [];
    this.serviceTypes = [];
    // this.productTypes = [];
    this.addProductForm.controls['serviceId'].setValue('');
    this.addProductForm.controls['serviceTypeId'].setValue('');
    this.addProductForm.controls['productTypeId'].setValue('');
    this.addProductForm.controls['productId'].setValue('');
    this.locationService.getProductStructureServicesIndustry(this.addProductForm.value.industryId).subscribe((data) => {
      if (data && data.$values) {
        this.services = data.$values;
      }
    }, error => {

      if (error.status === 404) {
        let errorData: any = {
          messgeType: "error",
          title: "Attention",
          titleClass: "text-c-blue",
          icon: "fas fa-exclamation-circle",
          iconClass: "text-c-blue f-70",
          message: 'No records found with the selected industry'
        }
        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
        dialogRef.afterClosed().subscribe(result => {
        });
      }
    });
  }

  callService() {
    this.serviceTypes = [];
    // this.productTypes = [];
    this.addProductForm.controls['serviceTypeId'].setValue('');
    this.addProductForm.controls['productTypeId'].setValue('');
    this.locationService.getProductStructureServiceServicetypes(this.addProductForm.value.serviceId).subscribe((data) => {
      if (data && data.$values) {
        this.serviceTypes = data.$values;
      }
    }, error => {
      if (error.status === 404) {
        let errorData: any = {
          messgeType: "error",
          title: "Attention",
          titleClass: "text-c-blue",
          icon: "fas fa-exclamation-circle",
          iconClass: "text-c-blue f-70",
          message: 'No records found with the selected service'
        }
        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
        dialogRef.afterClosed().subscribe(result => {
        });
      }
    });
  }

  callServiceType() {
    this.addProductForm.controls['productTypeId'].setValue('');
    this.locationService.getProductStructureProductsServiceType(this.addProductForm.value.serviceTypeId).subscribe((data) => {
      if (data && data.$values) {
        this.products = data.$values;
      }
    }, error => {
      if (error.status === 404) {
        let errorData: any = {
          messgeType: "error",
          title: "Attention",
          titleClass: "text-c-blue",
          icon: "fas fa-exclamation-circle",
          iconClass: "text-c-blue f-70",
          message: 'No records found with the selected service type'
        }
        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
        dialogRef.afterClosed().subscribe(result => {
        });
      }
    });
  }

}