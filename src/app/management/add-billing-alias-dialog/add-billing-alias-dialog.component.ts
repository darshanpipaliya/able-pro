import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { SpaceTrimStartEndInputirective } from 'src/app/custom-directives/custom-validation.directive';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { LocationService } from 'src/app/services/location.service';
import { NgSelectModule } from '@ng-select/ng-select';
@Component({
  selector: 'app-add-billing-alias-dialog',
  templateUrl: './add-billing-alias-dialog.component.html',
  styleUrls: ['./add-billing-alias-dialog.component.scss'],
  standalone: true,
  imports : [SharedModule, PrimgModule, SpaceTrimStartEndInputirective, NgSelectModule]
})
export class AddBillingAliasDialogComponent implements OnInit {
  vendorsList: any = [];

  aliasType: any = [
    {
      title: "Invoice Alias",
      value: "invoiceAlias"
    },
    {
      title: "Charge Code Alias",
      value: "chargeCodeAlias"
    },

  ];
  selectedAliasType = [];

  addVendorBillingAliasForm: FormGroup;
  isFormSubmit: boolean = false;
  constructor(private locationService: LocationService,
    private fb: FormBuilder,
    public dialog: MatDialog,
    private dialogRef: MatDialogRef<AddBillingAliasDialogComponent>) {

  }

  ngOnInit(): void {
    this.addVendorBillingAliasForm = this.fb.group({
      vendorAccountId: new FormControl('', [Validators.required]),
      name: new FormControl('', [Validators.required]),
      description: new FormControl('')
    })
    this.locationService.getVendorDropdown().subscribe((data) => {
      if (data && data.Data.$values) {
        this.vendorsList = data.Data.$values;
      }
    });
  }

  get f():any {
    return this.addVendorBillingAliasForm.controls;
  }

  saveBillingAlias() {
    this.isFormSubmit = true;
    this.aliasType.forEach((e: any) => {
      this.addVendorBillingAliasForm.value[e.value] = false;
    });
    if (this.addVendorBillingAliasForm.valid && this.selectedAliasType.length > 0) {
      this.selectedAliasType.forEach(e => {
        this.addVendorBillingAliasForm.value[e] = true;
      });
      this.locationService.addVendorBillingAlias(this.addVendorBillingAliasForm.value).subscribe({
        next: data => {
          let errorData: any = {
            messgeType: "error",
            title: "Attention",
            titleClass: "text-c-blue",
            icon: "fas fa-exclamation-triangle",
            iconClass: "text-c-blue f-70",
            message: 'Successfully saved' //if messges is multiple use array
          }
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning',data: errorData });
          dialogRef.afterClosed().subscribe(result => {
          });
          this.isFormSubmit = false;
          this.dialogRef.close();
        },
        error: error => {
          let errorMessage: any = '';
          if (error.status === 400) {
            errorMessage = error.error ? error.error : 'Bad request';
            let errorData: any = {
              messgeType: "error",
              title: "Error",
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
