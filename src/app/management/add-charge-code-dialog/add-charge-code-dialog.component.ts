import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { LocationService } from 'src/app/services/location.service';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { SpaceTrimStartEndInputirective } from 'src/app/custom-directives/custom-validation.directive';

@Component({
  selector: 'app-add-charge-code-dialog',
  templateUrl: './add-charge-code-dialog.component.html',
  styleUrls: ['./add-charge-code-dialog.component.scss'],
  standalone: true,
  imports: [SharedModule, PrimgModule, SpaceTrimStartEndInputirective]
})
export class AddChargeCodeDialogComponent implements OnInit {
  dialogData: any;
  addChargeCodeForm: FormGroup;
  isChargeCodeFormSubmit: boolean = false;
  billingAlias: any = [];
  chargeCodeTypes: any = [];
  taxTypes: any = [];
  origins: any = [];
  vendors: any = [];
  selectedTab: any = 0;

  constructor(private dialogRef: MatDialogRef<AddChargeCodeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    public dialog: MatDialog,
    private locationService: LocationService,
    private fb: FormBuilder) {
    this.dialogData = data;
    this.addChargeCodeForm = fb.group({
      vendorAccountId: new FormControl('', [Validators.required]),
      chargeCodeTypeId: new FormControl('', [Validators.required]),
      chargeTypeId: new FormControl('', [Validators.required]),
      vendorBillingAliasId: new FormControl('', [Validators.required]),
      chargeCodeOriginId: new FormControl('', [Validators.required]),
      chargeCodeName: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required]),
      status: new FormControl(true, [Validators.required])
    })
  }

  ngOnInit(): void {
    this.getVendorsForUser();
    this.getChargeCodeTypes();
    this.getChargeCodeOrigins();
  }

  getVendorsForUser() {
    this.locationService.getVendorDropdown().subscribe((data) => {
      if (data && data.Data.$values) {
        this.vendors = data.Data.$values;
      }
    });
  }

  onVendorChange() {
    if (this.f.vendorAccountId.valid && this.f.vendorAccountId.value) {
      const id = Number(this.f.vendorAccountId.value);
      this.getVendorBillingAlias(id);
    } else {
      this.billingAlias = [];
      this.f.vendorBillingAliasId.patchValue('');
    }
  }

  onChargeCodeTypeChange() {
    if (this.f.chargeCodeTypeId.valid && this.f.chargeCodeTypeId.value) {
      const id = Number(this.f.chargeCodeTypeId.value);
      this.getTaxRegulatoryTypes(id);
    } else {
      this.taxTypes = [];
      this.f.chargeTypeId.patchValue('');
    }
  }

  getChargeCodeTypes() {
    this.locationService.getChargeCodeTypes().subscribe((data) => {
      if (data.Success) {
        this.chargeCodeTypes = data.Data.$values;
      }
    });
  }

  getChargeCodeOrigins() {
    this.locationService.getChargeCodeOrigins().subscribe((data) => {
      if (data && data.$values) {
        this.origins = data.$values;
      }
    });
  }

  getVendorBillingAlias(id: any) {
    this.locationService.getVendorBillingAlias(id).subscribe((data) => {
      if (data && data.$values) {
        this.billingAlias = data.$values;
      }
    });
  }

  getTaxRegulatoryTypes(id: any) {
    this.locationService.getTaxRegulatoryTypes(id).subscribe((data) => {
      if (data.Success) {
        this.taxTypes = data.Data.$values;
      }
    });
  }

  get f(): any {
    return this.addChargeCodeForm.controls;
  }

  saveChargeCode() {
    this.isChargeCodeFormSubmit = true;
    if (this.addChargeCodeForm.valid) {
      const data: any = this.addChargeCodeForm.value;
      this.locationService.addChargeCode(data).subscribe({
        next: data => {
          if(data.Success) {
        
          let errorData: any = {
            messgeType: "error",
            title: "Attention",
            titleClass: "text-c-blue",
            icon: "fas fa-exclamation-triangle",
            iconClass: "text-c-blue f-70",
            message: 'Successfully saved' //if messges is multiple use array
          }
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {panelClass: 'error-warning', data: errorData });
          dialogRef.afterClosed().subscribe(result => {
          });
          this.dialogRef.close();
        } else {
          this.ErrorWarningPopupOpen(data.Message)
        }
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
}
