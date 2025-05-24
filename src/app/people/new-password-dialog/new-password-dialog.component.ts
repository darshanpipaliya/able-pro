import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { SpaceTrimStartEndInputirective } from 'src/app/custom-directives/custom-validation.directive';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { LocationService } from 'src/app/services/location.service';

export function ConfirmedValidator(controlName: string, matchingControlName: string) {
  return (formGroup: FormGroup) => {
    const control = formGroup.controls[controlName];
    const matchingControl = formGroup.controls[matchingControlName];
    if (matchingControl.errors && !matchingControl.errors['confirmedValidator']) {
      return;
    }
    if (control.value !== matchingControl.value) {
      matchingControl.setErrors({ confirmedValidator: true });
    } else {
      matchingControl.setErrors(null);
    }
  }
}

@Component({
  selector: 'app-new-password-dialog',
  templateUrl: './new-password-dialog.component.html',
  styleUrls: ['./new-password-dialog.component.scss'],
  imports: [
    SharedModule,
    SpaceTrimStartEndInputirective
  ]
})

export class NewPasswordDialogComponent implements OnInit {
  passwordForm: FormGroup;
  cphide = true;
  hide = true;
  hide2 = true;
  isUserFormSubmit: boolean = false;
  saveButtonLoader: boolean = false;
  dialogData: any;

  constructor(private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) data: any,
    public dialog: MatDialog,
    private locationService: LocationService,
    public dialogRef: MatDialogRef<NewPasswordDialogComponent>) {
    this.dialogData = data;
  }

  ngOnInit(): void {
    this.passwordForm = this.fb.group({
      // currentPassword: new FormControl(''),
      NewPassword: new FormControl('', [Validators.required,Validators.pattern(/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/)]),
      ConfirmPassword: new FormControl('', []),
    }, {
      validator: ConfirmedValidator('NewPassword', 'ConfirmPassword')
    });
  }

  get f() {
    return this.passwordForm.controls;
  }

  setValidation(event: any) {
    if (event.target.value !== '') {
      this.passwordForm.controls['ConfirmPassword']?.setValidators([Validators.required]);
      this.passwordForm.get('ConfirmPassword')?.updateValueAndValidity();
    }
  }

  savePassword() {
    this.isUserFormSubmit = true;
    if (this.passwordForm.valid && this.passwordForm.value.NewPassword !== '' && this.passwordForm.value.ConfirmPassword !== '' && this.dialogData.email) {
      this.saveButtonLoader = true;
      const data = {
        password: this.passwordForm.value.NewPassword,
        confirmPassword: this.passwordForm.value.ConfirmPassword,
        email: this.dialogData.email,
        // currentPassword: this.passwordForm.value.currentPassword,
        skipCurrentPassword: true
      }
   
      this.locationService.userResetPwd(data).subscribe({
        next: (data: any) => {
          this.saveButtonLoader = false;
          let errorData: any = {
            messgeType: "error",
            title: "Attention",
            titleClass: "text-c-blue",
            icon: data == 'Password change successfully' ? "fas fa-thumbs-up" :'fas fa-exclamation-circle',
            iconClass: "text-c-blue f-70",
            message: 'Password change successfully'
          }
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
          dialogRef.afterClosed().subscribe(result => {
          });
          this.closeDialog();
        },
        error: (error: any) => {
          this.saveButtonLoader = false;
          let errorMessage: any = '';
          if (error.status === 400) {
            // let errors = error.error.Errors.$values;
            // if (errors && errors.length > 0) {
            //   let message = '';
            //   errors.forEach(element => {
            //     message = message + element + '<br>';
            //   });
            //   errorMessage = message;
            // }
            let errorData: any = {
              messgeType: "error",
              title: "Attention",
              titleClass: "text-c-blue",
              icon: "fas fa-exclamation-circle",
              iconClass: "text-c-blue f-70",
              message: error.error
            }
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {panelClass: 'error-warning', data: errorData });

          } else if (error.status === 200) {
            this.saveButtonLoader = false;
            let errorData: any = {
              messgeType: "error",
              title: "Attention",
              titleClass: "text-c-blue",
              icon: "fas fa-thumbs-up",
              iconClass: "text-c-blue f-70",
              message: 'Successfully saved' //if messges is multiple use array
            }
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
            dialogRef.afterClosed().subscribe(result => {
            });
            this.closeDialog()
          } else if (error.status === 401) {
            errorMessage = "Bad request";
            this.saveButtonLoader = false;

            let errorData: any = {
              messgeType: "error",
              title: "Attention",
              titleClass: "text-c-blue",
              icon: "fas fa-exclamation-triangle",
              iconClass: "text-c-blue f-70",
              message: errorMessage //if messges is multiple use array
            }
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
            dialogRef.afterClosed().subscribe(result => {
            });
            this.closeDialog()
          }

        }
      });
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
