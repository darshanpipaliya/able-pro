import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router, RouterModule } from '@angular/router';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { SpaceTrimStartEndInputirective } from 'src/app/custom-directives/custom-validation.directive';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { LocationService } from 'src/app/services/location.service';

@Component({
  selector: 'app-auth-reset-password',
  templateUrl: './auth-reset-password.component.html',
  styleUrls: ['./auth-reset-password.component.scss'],
  standalone: true,
  imports: [
    RouterModule,
    SharedModule,
    CommonModule,
    SpaceTrimStartEndInputirective
  ]
})
export class AuthResetPasswordComponent implements OnInit {
  resetPwdForm: FormGroup;
  disable: boolean = false;
  constructor(private locationService: LocationService,
    public dialog: MatDialog,
    private router: Router) {
    this.resetPwdForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email])
    });
  }

  ngOnInit() {
  }

  getErrorMessage() {
    if (this.resetPwdForm.controls['email'].hasError('required')) {
      return 'You must enter a email';
    }

    return this.resetPwdForm.controls['email'].hasError('email') ? 'Not a valid email' : '';
  }

  resetPwd() {
    if (this.resetPwdForm.valid) {
      this.disable = true;
      this.locationService.forgetPwd(this.resetPwdForm.value).subscribe({
        next: (data: any) => {
        },
        error: (error: { status: number; error: { ErrorMessage: any; }; }) => {
          let errorMessage: any = '';
          if (error.status === 400) {
            errorMessage = "Please enter valid user";
          } else if (error.status === 200) {
            errorMessage = 'Password Reset Notification Sent Successfully!';

            this.router.navigate(['/auth/signin']);
          } else if (error.status === 401) {
            errorMessage = error.error.ErrorMessage;
          }
          let errorData: any = {
            messgeType: "error",
            title: "Attention",
            titleClass: "text-c-blue",
            icon: "fas fa-exclamation-triangle",
            iconClass: "text-c-blue f-70",
            message: errorMessage //if messges is multiple use array
          }
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {panelClass: 'error-warning', data: errorData });
          dialogRef.afterClosed().subscribe(result => {
          });
        }
      });
    }
  }

}
