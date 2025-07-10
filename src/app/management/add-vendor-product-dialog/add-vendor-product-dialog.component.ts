import { AfterViewInit, Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { SpaceTrimStartEndInputirective } from 'src/app/custom-directives/custom-validation.directive';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { LocationService } from 'src/app/services/location.service';

@Component({
  selector: 'app-add-vendor-product-dialog',
  templateUrl: './add-vendor-product-dialog.component.html',
  styleUrls: ['./add-vendor-product-dialog.component.scss'],
  standalone: true,
  imports: [SharedModule, PrimgModule, SpaceTrimStartEndInputirective]
})
export class AddVendorProductDialogComponent implements OnInit, AfterViewInit {
  dialogData: any;
  addProductForm: FormGroup;
  isProductFormSubmit: boolean = false;
  industries: any = [];
  services: any = [];
  serviceTypes: any = [];
  products: any = [];
  productTypes: any = [];
  selectedTab: any = 0;
  vendors: any = [];
  statusList = [
    { Id : true, Name : 'Active'},
    { Id : false, Name : 'Inactive'},
  ]
  @Output() onUserAddEvent: EventEmitter<any> = new EventEmitter<any>();


  constructor(private dialogRef: MatDialogRef<AddVendorProductDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    private locationService: LocationService,
    public dialog: MatDialog,
    private fb: FormBuilder) {
    this.dialogData = data;
    this.addProductForm = fb.group({
      name: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required]),
      productTypeId: new FormControl('', [Validators.required]),
      status: new FormControl('', [Validators.required]),
      vendorAccountId: new FormControl('', [Validators.required])
    })
  }

  ngOnInit(): void {
    this.getAllProductData();
    this.getVendorsForUser();
  }

  ngAfterViewInit() {
    // const element = $( ".mat-dialog-container" );
    // element.toggleClass("mat-dialog-container");
    // element.addClass("mat-dialog-container");
  }

  onNoClick() {
    this.dialogRef.close();
  }

  getAllProductData = () => {
    this.locationService.getProductmapp().subscribe((data: any) => {
      if (data) {
        this.productTypes = data.$values;
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


  get f() : any {
    return this.addProductForm.controls;
  }

  saveProduct() {
    this.isProductFormSubmit = true;
    if (this.addProductForm.valid) {
      const data: any = this.addProductForm.value;
      data.status = data.status === 'true' ? true : false;
      data.productTypeId = Number(data.productTypeId);
      this.locationService.addVendorProduct(data).subscribe({
        next: data => {
          let errorData: any = {
            messgeType: "error",
            title: "Attention",
            titleClass: "text-c-blue",
            icon: "fas fa-exclamation-triangle",
            iconClass: "text-c-blue f-70",
            message: 'Successfully saved' //if messges is multiple use array
          }
          this.onUserAddEvent.emit(true);
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning',data: errorData });
          dialogRef.afterClosed().subscribe(result => {
            this.onNoClick();
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
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {panelClass: 'error-warning', data: errorData });
          }
        }
      });
    }
  }
}


