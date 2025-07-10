import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { LocationService } from 'src/app/services/location.service';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';

@Component({
  selector: 'app-add-product-structure-dialog',
  templateUrl: './add-product-structure-dialog.component.html',
  styleUrls: ['./add-product-structure-dialog.component.scss'],
  standalone: true,
  imports: [SharedModule, PrimgModule]
})
export class AddProductStructureDialogComponent implements OnInit {
  dialogData: any;
  addProductForm: FormGroup;
  isProductFormSubmit: boolean = false;
  industries: any = [];
  services: any = [];
  serviceTypes: any = [];
  products: any = [];
  productTypes: any = [];
  selectedTab: any = 0;
  from: any = '';
  isSuperTEMAdmin: any = false;
  disabled: any = false;
  isSuperTEMManager: boolean = false;
  disableStatus: boolean = false;
  saveButtonLoadder = false;
  maxChars = 50;
  statusList = [
    { Id: true, Name: 'Active' },
    { Id: false, Name: 'Inactive' },
  ]

  inventoryList: any = [];
  constructor(private dialogRef: MatDialogRef<AddProductStructureDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    public dialog: MatDialog,
    private locationService: LocationService,
    private fb: FormBuilder) {
    this.dialogData = data;
    dialogRef.disableClose = true;
    if(this.dialogData.disabled && this.dialogData.disabled == 'true'){
      this.disableStatus = true;
    } else {
      this.disableStatus = false;
    }
    
    this.from = this.dialogData ? this.dialogData.from : '';
    this.addProductForm = fb.group({
      name: new FormControl('', [Validators.required, Validators.maxLength(50)]),
      active: new FormControl(true, [Validators.required]),
      // InventoryTypeId: new FormControl('', [Validators.required]),
      keepForProduction:new FormControl(false)
    });

    if(this.from === 'Service Type') {
      this.addProductForm.addControl('inventoryTypeId', new FormControl('', [Validators.required]));
    }
  }

  ngOnInit(): void {
    this.isSuperTEMAdmin = this.locationService.isUserHasSuperTEMAdminRole();
    this.isSuperTEMManager = this.locationService.isUserHasSuperTEMManagerRole();
    if(this.from === 'Service Type') {
      this.getInventoryTypes();
    }
    if (this.dialogData && this.dialogData.data) {
      switch (this.from) {
        case 'Product Type':
          const name = this.dialogData.data.ProductTypeName ? this.dialogData.data.ProductTypeName : '';
          this.f.keepForProduction.patchValue(this.dialogData.data.KeepForProduction ? this.dialogData.data.KeepForProduction : false);
          this.f.name.patchValue(name);
          break;
        case 'Industry':
          const industry = this.dialogData.data.IndustryName ? this.dialogData.data.IndustryName : '';
          this.f.name.patchValue(industry);
          this.f.keepForProduction.patchValue(this.dialogData.data.KeepForProduction ? this.dialogData.data.KeepForProduction : false);
          break;
        case 'Service Type':
          const serviceType = this.dialogData.data.ServiceTypeName ? this.dialogData.data.ServiceTypeName : '';
          const InventoryTypeDisplayName = this.dialogData.data.InventoryTypeId ? this.dialogData.data.InventoryTypeId : ''; 
          this.f.name.patchValue(serviceType);
          this.f.inventoryTypeId.patchValue(InventoryTypeDisplayName);
          this.f.keepForProduction.patchValue(this.dialogData.data.KeepForProduction ? this.dialogData.data.KeepForProduction : false);
          break;
        case 'Product':
          const product = this.dialogData.data.ProductName ? this.dialogData.data.ProductName : '';
          this.f.name.patchValue(product);
          this.f.keepForProduction.patchValue(this.dialogData.data.KeepForProduction ? this.dialogData.data.KeepForProduction : false);
          break;
        case 'Service':
          const service = this.dialogData.data.ServiceName ? this.dialogData.data.ServiceName : '';
          this.f.name.patchValue(service);
          this.f.keepForProduction.patchValue(this.dialogData.data.KeepForProduction ? this.dialogData.data.KeepForProduction : false);
          break;

        default:
          break;
      }

      if (this.dialogData.data.Active !== null) {
        const active = this.dialogData.data.Active;
        this.f.active.patchValue(active);
      }
    }
    if (!this.isSuperTEMAdmin) {
      this.disabled = true;
      this.addProductForm.disable();
    }
  }

  getInventoryTypes(){
    this.locationService.getInventoryTypes().subscribe((res: any) => {
      if(res.Success) {
        this.inventoryList = res.Data.$values;
      }
    });
  }

  onNoClick(data: any) {
    this.dialogRef.close(data);
  }

  get f() : any {
    return this.addProductForm.controls;
  }

  saveProduct() {
    this.isProductFormSubmit = true;
    if (this.addProductForm.valid) {
      this.saveButtonLoadder = true;
      const data: any = this.addProductForm.value;
      data.active = (data.active === 'true' || data.active === true) ? true : false;
      if (this.from === 'Industry') {
        if (this.dialogData.data && this.dialogData.data.IndustryId) {
          const id = this.dialogData.data.IndustryId;
          this.locationService.updateIndustry(id, data).subscribe({
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
                  this.onNoClick('Industry');
                });
              } else {
                this.ErrorWarningPopupOpen(data.Message)
              }
            }
          });
        } else {
          this.locationService.addIndustry(data).subscribe({
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
                  this.onNoClick('Industry');
                });
              } else {
                this.ErrorWarningPopupOpen(data.Message)
              }
            }
          });
        }
      } else if (this.from === 'Service') {
        if (this.dialogData.data && this.dialogData.data.ServiceId) {
          const id = this.dialogData.data.ServiceId;
          this.locationService.updateService(id, data).subscribe({
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
                  this.onNoClick('Service');
                });
              } else {
                this.ErrorWarningPopupOpen(data.Message)
              }
            }
          });
        } else {
          this.locationService.addService(data).subscribe({
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
                this.onNoClick('Service');
              } else {
                this.ErrorWarningPopupOpen(data.Message)
              }
            }
          });
        }
      } else if (this.from === 'Service Type') {
        if (this.dialogData.data && this.dialogData.data.ServiceTypeId) {
          const id = this.dialogData.data.ServiceTypeId;
          this.locationService.updateServiceType(id, data).subscribe({
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
                  this.onNoClick('Service Type');
                });
              } else {
                this.ErrorWarningPopupOpen(data.Message)
              }
            }
          });
        } else {
          this.locationService.addServiceType(data).subscribe({
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
                  this.onNoClick('Service Type');
                });
              }  else {
                this.ErrorWarningPopupOpen(data.Message)
              }
            },
            
          });
        }
      } else if (this.from === 'Product') {
        if (this.dialogData.data && this.dialogData.data.ProductId) {
          const id = this.dialogData.data.ProductId;
          this.locationService.updateProductData(id, data).subscribe({
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
                  this.onNoClick('Product');
                });
              } else {
                this.ErrorWarningPopupOpen(data.Message)
              }
              }
            });
        } else {
          this.locationService.addProductData(data).subscribe({
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
                  this.onNoClick('Product');
                });
              } else {
                this.ErrorWarningPopupOpen(data.Message)
              }

            }
          });
        }
      } else if (this.from === 'Product Type') {
        if (this.dialogData.data && this.dialogData.data.ProductTypeId) {
          const id = this.dialogData.data.ProductTypeId;
          this.locationService.updateProductType(id, data).subscribe({
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
                this.onNoClick('Product Type');
              });
            } else {
              this.ErrorWarningPopupOpen(data.Message)
            }
            }
          });
        } else {
          this.locationService.addProductType(data).subscribe({
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
                  this.onNoClick('Product Type');
                });
              } else {
                this.ErrorWarningPopupOpen(data.Message)
              }
            },
           
          });
        }
      }
    }
  }

  ErrorWarningPopupOpen(message: any) {
    let errorData: any = {
      messgeType: "error",
      title: "Attention",
      titleClass: "text-c-blue",
      icon: "fas fa-exclamation-circle",
      iconClass: "text-c-blue f-70",
      message: message
    }
    const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
    return
  }
}
