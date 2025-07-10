import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { SpaceTrimStartEndInputirective } from 'src/app/custom-directives/custom-validation.directive';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { LocationService } from 'src/app/services/location.service';

@Component({
  selector: 'app-add-new-vba',
  templateUrl: './add-new-vba.component.html',
  styleUrls: ['./add-new-vba.component.scss'],
  imports: [SharedModule, PrimgModule, SpaceTrimStartEndInputirective]
})
export class AddNewVbaComponent implements OnInit {
  vendorsList: any = [];
  statusList = [
    { Id : true, Name : 'Active'},
    { Id : false, Name : 'Inactive'},
  ]
  constructor(private fb: FormBuilder,public dialog: MatDialog, private locationService: LocationService,
    private dialogRef: MatDialogRef<AddNewVbaComponent>) { }
  addVendorBillingAliasForm: FormGroup;
  isFormSubmit: boolean = false;
  saveButtonLoadder = false;

  ngOnInit(): void {
    this.addVendorBillingAliasForm = this.fb.group({
      vendorAccountId: new FormControl('', [Validators.required]),
      name: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required]),
      status: new FormControl(true, [Validators.required]),
      invoiceAlias: new FormControl(false),
      chargeCodeAlias: new FormControl(false)
    });

    this.locationService.getVendorDropdown().subscribe((data) => {
      if (data && data.Data.$values) {
        this.vendorsList = data.Data.$values;
      }
    });
  }
  get f() : any{
    return this.addVendorBillingAliasForm.controls;
  }

  addBillingAlias() {
    this.isFormSubmit = true;
    if (this.addVendorBillingAliasForm.valid) {
      this.saveButtonLoadder = true;
      this.addVendorBillingAliasForm.value.status = (this.addVendorBillingAliasForm.value.status || this.addVendorBillingAliasForm.value.status == 'true') ? true : false;
      this.locationService.addVendorBillingAlias(this.addVendorBillingAliasForm.value).subscribe({
        next: data => {
          this.saveButtonLoadder = false;
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
            this.dialogRef.close();
          });
          this.isFormSubmit = false;
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
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {panelClass: 'error-warning', data: errorData });
          }
        }
      });
    }
  }
}
