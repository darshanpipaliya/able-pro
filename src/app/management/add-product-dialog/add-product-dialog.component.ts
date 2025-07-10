import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { LocationService } from 'src/app/services/location.service';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';

@Component({
  selector: 'app-add-product-dialog',
  templateUrl: './add-product-dialog.component.html',
  styleUrls: ['./add-product-dialog.component.scss'],
  standalone: true,
  imports: [SharedModule, PrimgModule]
})
export class AddProductDialogComponent implements OnInit {
  dialogData: any;
  addProductForm: FormGroup;
  isProductFormSubmit: boolean = false;
  industries: any = [];
  services: any = [];
  serviceTypes: any = [];
  products: any = [];
  productTypes: any = [];
  selectedTab: any = 0;

  constructor(private dialogRef: MatDialogRef<AddProductDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    public dialog: MatDialog,
    private locationService: LocationService,
    private fb: FormBuilder) {
    this.dialogData = data;
    this.addProductForm = fb.group({
      industryId: new FormControl('', [Validators.required]),
      serviceId: new FormControl('', [Validators.required]),
      serviceTypeId: new FormControl('', [Validators.required]),
      productId: new FormControl('', [Validators.required]),
      productTypeId: new FormControl('', [Validators.required])
    })
  }

  ngOnInit(): void {
    this.getAllProductData();
  }

  getAllProductData = () => {
    this.locationService.getIndustries().subscribe((data: any) => {
      if (data) {
        this.industries = data.Data.$values;
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
    this.locationService.getProductTypeUrlDropDowns().subscribe((data: any) => {
      if (data) {
        this.productTypes = data.Data.$values;
      }
    });
  }

  get f() : any{
    return this.addProductForm.controls;
  }

  saveProduct() {
    this.isProductFormSubmit = true;
    if (this.addProductForm.valid) {
      const data: any = this.addProductForm.value;

      this.locationService.addProduct(data).subscribe({
        next: data => {
          let errorData: any = {
            messgeType: "error",
            title: "Attention",
            titleClass: "text-c-blue",
            icon: "fas fa-exclamation-triangle",
            iconClass: "text-c-blue f-70",
            message: 'Successfully saved' //if messges is multiple use array
          }
          const dialogRef1 = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning',data: errorData });
          dialogRef1.afterClosed().subscribe(result => {
            this.dialogRef.close();
          });
     
        },
        error: error => {
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
              this.dialogRef.close();
            });
          }
        }
      });
    }
  }
}
