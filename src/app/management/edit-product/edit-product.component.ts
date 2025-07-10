import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import moment from 'moment';
import _ from 'lodash';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { LocationService } from 'src/app/services/location.service';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';

@Component({
  selector: 'app-edit-product',
  templateUrl: './edit-product.component.html',
  styleUrls: ['./edit-product.component.scss'],
  standalone: true,
  imports: [SharedModule, PrimgModule]
})
export class EditProductComponent implements OnInit {
  @Input() productData: any;
  dialogData: any;
  editProductForm: FormGroup;
  isProductFormSubmit: boolean = false;
  industries: any = [];
  services: any = [];
  serviceTypes: any = [];
  products: any = [];
  productTypes: any = [];
  selectedTab: any = 0;
  activityDataSource: any = [];
  activityDisplayedColumns: any = [];
  isTEMManager: boolean = false;
  isTemUser: boolean = false;
  isTemAdmin: boolean = false;
  isSuperTEMManager: boolean = false;
  isSuperTEMUser: boolean = false;
  isSuperTEMAdmin: boolean;
  @Output() onUserAddEvent: EventEmitter<any> = new EventEmitter();
  @Output() currentOpenEditPage: EventEmitter<any> = new EventEmitter<any>();
  private _unsubscribeRecon: Subject<any> = new Subject<any>();
  reconList:any = [];
  
  saveButtonLoadder = false;
  statusList = [
    { Id : true, Name : 'Active'},
    { Id : false, Name : 'Inactive'},
  ]
  constructor(
    private locationService: LocationService,
    public dialog: MatDialog,
    private fb: FormBuilder) {
    this.editProductForm = fb.group({
      industryId: new FormControl('', [Validators.required]),
      serviceId: new FormControl('', [Validators.required]),
      serviceTypeId: new FormControl('', [Validators.required]),
      productId: new FormControl('', [Validators.required]),
      productTypeId: new FormControl('', [Validators.required]),
      active: new FormControl('', [Validators.required]),
      keepForProduction: new FormControl(false),
      reconAssigmentId:  new FormControl('', [Validators.required]),
    });
    this.activityDisplayedColumns = ['Protyp', 'Pro', 'ServiceTyp', 'Service', 'ind', 'status', 'crtby', 'crtdt', 'modfby', 'moddt'];
  }

  ngOnInit(): void {
    this.currentOpenEditPage.emit(true);

    this.isTEMManager = this.locationService.isUserHasTEMManagerRole();
    this.isTemUser = this.locationService.isUserHasTEMUserRole();
    this.isTemAdmin = this.locationService.isUserHasTEMAdminRole();
    this.isSuperTEMManager = this.locationService.isUserHasSuperTEMManagerRole();
    this.isSuperTEMUser = this.locationService.isUserHasSuperTEMUserRole();
    this.isSuperTEMAdmin = this.locationService.isUserHasSuperTEMAdminRole();
    this.getProductById();
    this.getAllProductData();
    this.reconAssigments();
  }

  reconAssigments() {
    this._unsubscribeRecon.next(null);
    this.locationService.ReconAssigments().pipe(takeUntil(this._unsubscribeRecon)).subscribe((res: any) => {
      if(res.Success) {
        this.reconList = res.Data.$values;
      }
    })
  }

  async getProductById() {
    if (this.productData && this.productData.ProductStructureId) {
      const id: any = this.productData.ProductStructureId;
      this.locationService.getProductById(id).subscribe((data) => {
        if (data) {
          this.createFormInEditMode(data);
        }
      });
    }
  }

  createFormInEditMode(data: any) {
    let editProductrData: any = {};
    editProductrData.industryId = data.Data.IndustryId ? data.Data.IndustryId : '';
    editProductrData.productId = data.Data.ProductId ? data.Data.ProductId : '';
    editProductrData.productTypeId = data.Data.ProductTypeId ? data.Data.ProductTypeId : '';
    editProductrData.serviceId = data.Data.ServiceId ? data.Data.ServiceId : '';
    editProductrData.serviceTypeId = data.Data.ServiceTypeId ? data.Data.ServiceTypeId : '';
    editProductrData.active = data.Data.ProductStructureActive;
    editProductrData.keepForProduction = data.Data.KeepForProduction ? data.Data.KeepForProduction : false;
    this.activityDataSource = data.Data.ProductStructureLogs.$values;
    editProductrData.reconAssigmentId = data.Data.ReconAssigmentsName ? data.Data.ReconAssigmentsName : '';
    this.editProductForm.patchValue(editProductrData);

    if (!this.isSuperTEMAdmin) {
      this.editProductForm.disable();
    }
  }


  convertToDateTime(date: any) {
    if (date) {
      return moment(new Date(date)).format('MM/DD/YYYY h:mm a');
    } else {
      return null;
    }
  }
  callIndustry(id?:any){
    this.services = [];
    this.serviceTypes = [];
    this.editProductForm.controls['serviceId'].setValue('');
    this.editProductForm.controls['serviceTypeId'].setValue('');
    // this.editProductForm.controls['productTypeId'].setValue('');
    this.editProductForm.controls['productId'].setValue('');

    const idd = id ? id : this.productData.IndustryId;
    this.locationService.getProductStructureServicesIndustry(idd).subscribe((data) => {
      if (data.Success) {
        this.services = data.Data.$values;
      } else {
        let errorData: any = {
          messgeType: "error",
          title: "Attention",
          titleClass: "text-c-blue",
          icon: "fas fa-exclamation-circle",
          iconClass: "text-c-blue f-70",
          message: 'No records found with the selected industry'
        }
        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning',data: errorData });
        dialogRef.afterClosed().subscribe(result => {
        });
      }
    });
  }

  callService(id?: any) {
    const idd = id ? id : this.productData.ServiceId;

    this.serviceTypes = [];
    this.editProductForm.controls['serviceTypeId'].setValue('');
    // this.editProductForm.controls['productTypeId'].setValue('');
    this.locationService.getProductStructureServiceServicetypes(idd).subscribe((data) => {
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
        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning',data: errorData });
        dialogRef.afterClosed().subscribe(result => {
        });
      }
    });
  }

  callServiceType(id?: any) {
    const idd = id ? id : this.productData.ServiceTypeId;

    if (id) {
      this.editProductForm.controls['productId'].setValue('');
    }
    this.locationService.getProductStructureProductsServiceType(idd).subscribe((data) => {
      if (data) {
        this.products = data.Data.$values;
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
        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning',data: errorData });
        dialogRef.afterClosed().subscribe(result => {
        });
      }
    });
  }

  getProductTypes() {
    this.locationService.getProductTypes(true).subscribe((data: any) => {
      if (data.Success) {
        this.productTypes = data.Data.$values;
      } else {
        this.ErrorWarningPopupOpen(data.Message)
      }
    });
  }
  getAllProductData = () => {
    this.locationService.getIndustries().subscribe((data: any) => {
      if (data.Success) {
        this.industries = data.Data.$values;
        if (this.productData) {
          // this.callIndustry();
          // this.callService();
          // this.callServiceType();
          // this.getProductTypes();
        }
      } else {
        this.ErrorWarningPopupOpen(data.Message)
      }
    });
    this.locationService.getProductTypes().subscribe((data: any) => {
      if (data.Success) {
        this.productTypes = data.Data.$values;
      } else {
        this.ErrorWarningPopupOpen(data.Message)
      }
    });

    this.locationService.getServices().subscribe((data: any) => {
      if (data.Success) {
        this.services = data.Data.$values;
      } else {
        this.ErrorWarningPopupOpen(data.Message)
      }
    });

    this.locationService.getServiceTypes().subscribe((data: any) => {
      if (data.Success) {
        this.serviceTypes = data.Data.$values;
      } else {
        this.ErrorWarningPopupOpen(data.Message)
      }
    });

    this.locationService.getProductsForVendor().subscribe((data: any) => {
      if (data) {
        this.products = data.Data.$values;
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
  get f() : any {
    return this.editProductForm.controls;
  }

  updateProduct() {
    this.isProductFormSubmit = true;
    if (this.editProductForm.valid) {
      this.saveButtonLoadder = true;
      const data:any = this.editProductForm.value;

      if (data.active === 'true' || data.active === true ) {
        data.active = true;
      } else {
        data.active = false;
      }
      data.reconAssigmentId =  this.reconList.find((f: any) => f.Assignment === data.reconAssigmentId)?.Id;

      this.locationService.updateProduct(this.productData.ProductStructureId, data).subscribe({
        next: data => {
          this.saveButtonLoadder = false;
          if(data.Success) {
            let errorData: any = {
              messgeType: "error",
              title: "Attention",
              titleClass: "text-c-blue",
              icon: "fas fa-exclamation-circle",
              iconClass: "text-c-blue f-70",
              message: 'Successfully saved' //if messges is multiple use array
            };
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
            dialogRef.afterClosed().subscribe(result => {
              this.onUserAddEvent.emit(true);
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
        }
      });
    }
  }
}
