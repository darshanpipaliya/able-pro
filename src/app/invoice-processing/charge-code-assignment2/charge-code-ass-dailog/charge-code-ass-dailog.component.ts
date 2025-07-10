import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { LocationService } from 'src/app/services/location.service';

@Component({
  selector: 'app-charge-code-ass-dailog',
  templateUrl: './charge-code-ass-dailog.component.html',
  styleUrls: ['./charge-code-ass-dailog.component.scss'],
  imports: [SharedModule, PrimgModule]
})
export class ChargeCodeAssDailogComponent implements OnInit {

  chargeCodeTypes = [];
  chargeCodeForm: FormGroup;
  parenttaxTypes: any;
  parentChargeCodeData: any = {};
  codeOccurence = [];
  VendorBillingAliasId: number = 0;
  ChargeCode: any;
  isChargeCodeFormSubmit: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) data: any, public fb: FormBuilder,
    private locationService: LocationService, public dialog: MatDialog,
    private dialogRef: MatDialogRef<ChargeCodeAssDailogComponent>) {
    this.chargeCodeTypes = data.chargeCodeType;
    this.VendorBillingAliasId = data.vendorBillingAliasId;
    this.ChargeCode = data.chargeCode;


    this.chargeCodeForm = this.fb.group({
      chargeCodeTypeId: new FormControl('', [Validators.required]),
      chargeCodeName: new FormControl('', [Validators.required]),
      chargeCodeOccurrenceId: new FormControl('', [Validators.required]),
      chargeTypeId: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required]),
      chargeCode: new FormControl('', [Validators.required]),
    });
  }

  ngOnInit(): void {
    this.getChargeCodeOccurrence();
    this.chargeCodeForm.patchValue({ 'chargeCode': this.ChargeCode })
  }
  getChargeCodeOccurrence() {
    this.locationService.getChargeCodeOccurrence().subscribe((data) => {
      if (data && data.$values) {
        this.codeOccurence = data.$values;
      }
    });
  }
  onChargeCodeTypeChange(data: any) {
    if (this.f.chargeCodeTypeId.valid && this.f.chargeCodeTypeId.value) {
      const id = Number(this.f.chargeCodeTypeId.value);
      this.f.chargeTypeId.setValue('');
      this.parentgetTaxRegulatoryTypes(id);
      this.parentChargeCodeData['chargeCodeType'] = data.originalEvent.target.textContent;
      this.parentChargeCodeData['chargeCodeTypeId'] = data.value;
      // this.getParentChargeCode();
    } else {
      this.parenttaxTypes = [];
      this.f.chargeTypeId.setValue('');
    }
  }
  get f() : any {
    return this.chargeCodeForm.controls;
  }

  parentChargeType(data: any) {
    this.parentChargeCodeData['chargeType'] = data.originalEvent.target.textContent;
    this.parentChargeCodeData['chargeTypeId'] = data.value;
    // this.getParentChargeCode();
  }
  parentgetTaxRegulatoryTypes(id: any) {
    let passData = {
      IsOnlyActiveNeed: true
    }
    this.locationService.getTaxRegulatoryTypes(id, passData).subscribe((data) => {
      if (data.Success) {
        this.parenttaxTypes = data.Data.$values;
      } else {
        this.parenttaxTypes = [];
      }
    });
  }

  saveChargeCode() {
    let data = this.chargeCodeForm.value;
    data['status'] = true;
    data['chargeCodeDisplayName'] = this.chargeCodeForm.value.chargeCode;
    data['vendorBillingAliasId'] = this.VendorBillingAliasId;
    this.isChargeCodeFormSubmit = true;
    if (this.chargeCodeForm.valid) {
      this.locationService.addChargeCode(data).subscribe({
        next: data => {
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
            });
            this.dialogRef.close();
          } else {
            let errorData: any = {
              messgeType: "error",
              title: "Attention",
              titleClass: "text-c-blue",
              icon: "fas fa-exclamation-triangle",
              iconClass: "text-c-blue f-70",
              message: data.Message//if messges is multiple use array
            }
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
            dialogRef.afterClosed().subscribe(result => {
            });
          }
        },
        error: error => {
        }
      });
    }
  }
}
