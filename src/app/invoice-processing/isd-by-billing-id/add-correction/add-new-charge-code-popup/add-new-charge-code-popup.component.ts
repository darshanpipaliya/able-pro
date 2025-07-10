import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AddNewVbaComponent } from '../add-new-vba/add-new-vba.component';
import { AddNewVendorComponent } from '../add-new-vendor/add-new-vendor.component';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { LocationService } from 'src/app/services/location.service';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';

@Component({
  selector: 'app-add-new-charge-code-popup',
  templateUrl: './add-new-charge-code-popup.component.html',
  styleUrls: ['./add-new-charge-code-popup.component.scss'],
  imports: [SharedModule, PrimgModule]
})
export class AddNewChargeCodePopupComponent implements OnInit {
  isChargeCodeFormSubmit: boolean = false;
  addChargeCodeForm: FormGroup;
  saveButtonLoadder = false;
  saveButtonAddDist = false;

  codeOccurence: any = [];
  taxTypes: any = [];
  chargeCodeTypes: any = [];
  billingAlias: any = [];
  vendors: any = [];
  vendorLoading = false;
  invoiceData: any;
  SBInvoiceId: any;
  isSaveAndAddClicked = false;

  constructor(private fb: FormBuilder, public dialog: MatDialog, private locationService: LocationService,
    private dialogRef: MatDialogRef<AddNewChargeCodePopupComponent>, @Inject(MAT_DIALOG_DATA) data: any) {
    
     this.invoiceData = data;
     this.addChargeCodeForm = fb.group({
      vendorAccountId: new FormControl(data.redirectFromTabB ? this.invoiceData?.VendorAccountName: Number(this.invoiceData?.VendorAccountId), [Validators.required]),
      vendorBillingAliasId: new FormControl(data.redirectFromTabB ? this.invoiceData?.VendorBillingAliasName : Number(this.invoiceData?.VendorBillingAliasId), [Validators.required]),
      chargeCodeOccurrenceId: new FormControl('', [Validators.required]),
      chargeCodeTypeId: new FormControl('', [Validators.required]),
      chargeTypeId: new FormControl('', [Validators.required]),
      chargeCode: new FormControl('', [Validators.required]),
      chargeCodeName: new FormControl('', [Validators.required]),
      chargeCodeDisplayName: new FormControl('', [Validators.required]),
      description: new FormControl(''),
    })
  }

  ngOnInit(): void {
    this.getChargeCodeTypes();
    this.getChargeCodeOccurrence();
    if(!this.invoiceData.redirectFromTabB)
      this.onVendorChange();
    this.getVendorsForUser();
  }

  refreshData() {
    this.isChargeCodeFormSubmit = false;
    this.f.vendorAccountId.patchValue('');
    this.f.vendorAccountId?.updateValueAndValidity();
    this.f.vendorBillingAliasId.patchValue('');
    this.f.vendorBillingAliasId?.updateValueAndValidity();
  }
  onVendorChange() {
    if(!this.invoiceData.redirectFromTabB) {
      if (this.f.vendorAccountId.valid && this.f.vendorAccountId.value) {
        const id = Number(this.f.vendorAccountId.value);
        this.getVendorBillingAlias(id);
      } else {
        this.billingAlias = [];
        this.f.vendorBillingAliasId.patchValue('');
      }
    }
  }
  saveAndAdd() {
    this.isSaveAndAddClicked = true
  }
  getVendorsForUser() {
    this.vendorLoading = true;
    this.locationService.getVendorDropdown().subscribe(
      (data) => {
      if (data && data.Data.$values) {
        this.vendors = data.Data.$values;
        this.vendorLoading = false;
      } else {
        this.vendorLoading = false;
        this.vendors = []
      }
    },
    error=> {
      this.vendorLoading = false;
      this.vendors = []
    });
  }
  addNewVBA() {
    const dialogRef = this.dialog.open(AddNewVbaComponent, {
      width: '900px',
    })
    dialogRef.afterClosed().subscribe(result => {
      this.getVendorsForUser();
      const id = Number(this.f.vendorAccountId.value);
      this.getVendorBillingAlias(id);
    });
  }
  addNewVendor() {
    const dialogRef = this.dialog.open(AddNewVendorComponent, {
      width: '900px',
    })

    dialogRef.afterClosed().subscribe(result => {
      this.getVendorsForUser();
        
        const id = Number(this.f.vendorAccountId.value);
        this.getVendorBillingAlias(id);
    
    });
  }
  getVendorBillingAlias(id: any) {
    this.locationService.getVendorBillingAlias(id).subscribe((data) => {
      if (data && data.$values) {
        this.billingAlias = data.$values;
      }
    });
  }

  onChargeCodeTypeChange() {
    if (this.f.chargeCodeTypeId.valid && this.f.chargeCodeTypeId.value) {
      const id = Number(this.f.chargeCodeTypeId.value);
      this.f.chargeTypeId.patchValue('');
      this.getTaxRegulatoryTypes(id);
    } else {
      this.taxTypes = [];
      this.f.chargeTypeId.patchValue('');
    }

    if(this.f.chargeCodeTypeId.value == 1002) {
      const usageId = this.codeOccurence.find((item: any) => item.Occurrence === 'Usage')?.Id;
      this.f.chargeCodeOccurrenceId.setValue(usageId);
    } else {
      this.f.chargeCodeOccurrenceId.setValue(null);
    }
  }

  get f() : any{
    return this.addChargeCodeForm.controls;
  }
  getChargeCodeTypes() {
    let passData = {
      IsOnlyActiveNeed: true
    }
    this.locationService.getChargeCodeTypes(passData).subscribe((data) => {
      if (data.Success) {
        this.chargeCodeTypes = data.Data.$values.filter((type: any) => type.Name !== 'System Adjustment');
      }
    });
  }

  getTaxRegulatoryTypes(id: any) {
    let passData = {
      IsOnlyActiveNeed: true
    }
    this.locationService.getTaxRegulatoryTypes(id, passData).subscribe((data) => {
      if (data.Success) {
        this.taxTypes = data.Data.$values;
      } else {
        this.taxTypes = [];
      }
    });
  }

  getChargeCodeOccurrence() {
    this.locationService.getChargeCodeOccurrence().subscribe((data) => {
      if (data && data.$values) {
        this.codeOccurence = data.$values;
      }
    });
  }

  saveChargeCode(addDistribution = false) {
    this.f.chargeCodeDisplayName.patchValue(this.f.chargeCodeName.value);
    this.isChargeCodeFormSubmit = true;
    if (this.addChargeCodeForm.valid) {

      if(addDistribution) {
        this.saveButtonAddDist = true
      } else {
        this.saveButtonLoadder = true;
      }
      
      let data: any = this.addChargeCodeForm.value;
      if(this.invoiceData.redirectFromTabB) {
        data['vendorAccountId'] = this.invoiceData.VendorAccountId;
        data['vendorBillingAliasId'] = this.invoiceData.VendorBillingAliasId;
      }

      data['sbInvoiceId'] = this.invoiceData.SBInvoiceId;
      this.locationService.addChargeCode(data).subscribe({
        next: data => {
          if (data.Success) {
            this.saveButtonLoadder = false;
            if(addDistribution) {
              this.dialogRef.close({fromAdd: true, data: data.Data});
            } else {
              this.dialogRef.close();
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
                // this.afterChargeCodeAdd.emit(data);
                // this.onUserAddEvent.emit(true);
                this.dialogRef.close();
              });
            }
          } else {
            this.saveButtonLoadder = false;
            this.ErrorWarningPopupOpen(data.Message)
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
            // this.onUserAddEvent.emit(true);
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
