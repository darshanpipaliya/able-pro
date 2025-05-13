import { CommonModule } from '@angular/common';
import { Component, OnInit, SecurityContext } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { SpaceTrimStartEndInputirective } from 'src/app/custom-directives/custom-validation.directive';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { LocationService } from 'src/app/services/location.service';
import { SessionStorageService } from 'src/app/services/session-storage.service';
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
  selector: 'app-auth-change-password',
  templateUrl: './auth-change-password.component.html',
  styleUrls: ['./auth-change-password.component.scss'],
  standalone: true,
  imports: [
    SharedModule,
    CommonModule,
    SpaceTrimStartEndInputirective
  ]
})
export class AuthChangePasswordComponent implements OnInit {
  email: any = '';
  token: any = '';
  pwdPattern: any = '((?=.*\d)(?=.*[a-zA-Z]).{6,20})';
  changePwdForm: FormGroup;
  hideCp = true;
  hide = true;
  hide2 = true;

  constructor(private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private fb: FormBuilder,
    private locationService: LocationService,
    private router: Router,
    public dialog: MatDialog,
    private localStorageService: LocalStorageService,
    private sessionStorageService: SessionStorageService) {
    this.route.queryParams.subscribe((data: any) => {
      this.email = data.email;
      this.token = this.sanitizer.sanitize(SecurityContext.HTML, data.token);
    });

    this.changePwdForm = fb.group({
      // currentPassword: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required,Validators.pattern(/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/)
    ]),
      crfPassword: new FormControl('', [Validators.required])
    }, {
      validator: ConfirmedValidator('password', 'crfPassword')
    })
  }

  ngOnInit() {
  }

  get f() {
    return this.changePwdForm.controls;
  }
  changePwd() {
    if (this.changePwdForm.valid) {
      const data = {
        password: this.changePwdForm.value.password,
        confirmPassword: this.changePwdForm.value.crfPassword,
        email: this.email,
        token: this.token,
        // currentPassword: this.changePwdForm.value.currentPassword
      }

      this.locationService.resetPwd(data).subscribe({
        next: (data: any) => {
          let errorData: any = {
            messgeType: "error",
            title: "Attention",
            titleClass: "text-c-blue",
            icon: "fas fa-exclamation-circle",
            iconClass: "text-c-blue f-70",
            message: 'Successfully saved' //if messges is multiple use array
          }
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
            dialogRef.afterClosed().subscribe(result => {
          });
          const user = this.localStorageService.getObjectValue('user');
          if (user && user.email === this.email) {
            this.router.navigate(['/auth/signin/']);
          } else if (user && user.email !== this.email) {
            let errorData: any = {
              messgeType: "error",
              title: "Attention",
              titleClass: "text-c-blue",
              icon: "fas fa-exclamation-circle",
              iconClass: "text-c-blue f-70",
              message: 'One user already logged in from the broswer. Try closing that first'//if messges is multiple use array
            }
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
              dialogRef.afterClosed().subscribe(result => {
            });
          } else {
            this.sessionStorageService.setObjectValue('newUser', true);
            this.router.navigate(['/auth/signin/']);
          }
        },
        error: (error: { status: number; error: any; }) => {
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
            let errorData: any = {
              messgeType: "error",
              title: "Attention",
              titleClass: "text-c-blue",
              icon: "fas fa-exclamation-circle",
              iconClass: "text-c-blue f-70",
              message: 'Successfully saved' //if messges is multiple use array
            }
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
              dialogRef.afterClosed().subscribe(result => {
            });
            this.router.navigate(['/auth/signin/']);
          } else if (error.status === 401) {
            errorMessage = "Bad request";

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
          }

        }
      });
    }
  }



}
