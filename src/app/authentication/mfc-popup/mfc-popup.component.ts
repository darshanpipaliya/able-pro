import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { loginUser } from '../auth-signin/auth-signin.component';
import { Router } from '@angular/router';
import { LocationService } from 'src/app/services/location.service';
import { SessionStorageService } from 'src/app/services/session-storage.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { SpaceTrimStartEndInputirective } from 'src/app/custom-directives/custom-validation.directive';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mfc-popup',
  templateUrl: './mfc-popup.component.html',
  styleUrls: ['./mfc-popup.component.scss'],
  standalone: true,
  imports: [
    SharedModule,
    CommonModule,
    SpaceTrimStartEndInputirective
  ]
})
export class MfcPopupComponent implements OnInit {

  otpForm: FormGroup;
  loginUser: loginUser;

  loginEmail: any;
  isOtpFormSubmit: boolean = false;
  saveButtonLoadder: boolean = false;
  isUserIsSuperTEM: any = false;
  isCompanyUser: boolean = false;
  isLoggedSuperTemUser = false;
  supportMail: any;

  constructor(public matDialogRef: MatDialogRef<MfcPopupComponent>,
    private locationService: LocationService,
    private router: Router,
    private sessionStorageService: SessionStorageService,
    private localStorageService: LocalStorageService,
    @Inject(MAT_DIALOG_DATA) data: any,
    public dialog: MatDialog
  ) {
    this.loginEmail = data;
    matDialogRef.disableClose = true;
    this.otpForm = new FormGroup({
      email: new FormControl(''),
      otp: new FormControl('', [Validators.maxLength(6), Validators.required, Validators.pattern("^[0-9]*$")])
    });
  }

  ngOnInit(): void {
  }

  close() {
    this.matDialogRef.close();
  }

  finish() {
    this.isOtpFormSubmit = true;
    if (this.otpForm.valid) {
      this.saveButtonLoadder = true;
      const data = {
        email: this.loginEmail,
        otp: this.f['otp'].value.toString()
      }
      this.locationService.twoStepVerification(data).subscribe({
        next: (res: { IsAuthSuccessful: any; email: any; Token: any; }) => {
          if (res && res.IsAuthSuccessful) {
            // this.saveButtonLoadder = false;
            res.email = this.loginEmail;
            this.locationService.loginUser = res;
            this.sessionStorageService.setObjectValue('user', res);
            this.sessionStorageService.setObjectValue('token', res.Token);
            this.localStorageService.setObjectValue('user', res);
            this.localStorageService.setObjectValue('token', res.Token);
            this.getLoggedinUserInfo().then((allow) => {
              this.isUserIsSuperTEM = this.locationService.isUserHasSuperTEMRole();
              this.isLoggedSuperTemUser = this.locationService.isUserHasSuperTEMUserRole();

              if (this.sessionStorageService.getObjectValue('userRoles').includes("CompanyUser")) {
                this.isCompanyUser = true
              }
              this.close();
              if (allow) {
                if (this.isUserIsSuperTEM) {
                  this.router.navigate(['/management/tem']);
                } else if (this.isLoggedSuperTemUser) {
                  this.router.navigate(['/finances/accounting']);
                } else if (this.isCompanyUser) {
                  this.router.navigate(['/people/users']);
                } else {
                  this.router.navigate(['/organization/customer']);
                }
              } else {
                this.saveButtonLoadder = false;
                let errorData: any = {
                  messgeType: "error",
                  title: "Attention",
                  titleClass: "text-c-blue",
                  icon: "fas fa-exclamation-circle",
                  iconClass: "text-c-blue f-70",
                  message: 'Please assign roles to the user' //if messges is multiple use array
                }
                const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
                dialogRef.afterClosed().subscribe(result => {
                });
              }
            });
          } else {
            this.saveButtonLoadder = false;
            let errorData: any = {
              messgeType: "error",
              title: "Attention",
              titleClass: "text-c-blue",
              icon: "fas fa-exclamation-circle",
              iconClass: "text-c-blue f-70",
              message: 'Please try again'
            }
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
            dialogRef.afterClosed().subscribe(result => {
            });
          }
        }, error: (error: { error: any; }) => {
          this.close();

          this.saveButtonLoadder = false;
          let errorData: any = {
            messgeType: "error",
            title: "Attention",
            titleClass: "text-c-blue",
            icon: "fas fa-exclamation-circle",
            iconClass: "text-c-blue f-70",
            message: error.error,
            okBtnName: 'Resend Code',
            closeBtnName: 'Cancel',
          }
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
          dialogRef.afterClosed().subscribe(result => {

            if (result == true || result == 'true') {
              this.resendOtp(true);
            }
          });
        }
      });
    }
  }

  resendOtp(reOpenLogin?: boolean) {

    this.locationService.resendOtp(this.loginEmail).subscribe({
      next: (res: any) => {

      }, error: (error: { error: { text: string; }; }) => {

        let errorData: any = {
          messgeType: "error",
          title: "Attention",
          titleClass: "text-c-blue",
          icon: "fas fa-exclamation-circle",
          iconClass: "text-c-blue f-70",
          message: error?.error?.text
        }
        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
        dialogRef.afterClosed().subscribe(result => {

          if (result && reOpenLogin && error?.error?.text == 'One time passcode sent successfully') {
            this.dialog.open(MfcPopupComponent, { data: this.loginEmail, disableClose: true });
          }
        });
      }
    });
  }

  support() {
    this.locationService.supportEmail(this.loginEmail).subscribe({
      next: (res: any) => {

      }, error: (error: { error: { text: string; }; }) => {
        const linkElement = document.getElementById('someLink');
        if (linkElement instanceof HTMLAnchorElement) {
          linkElement.href = 'mailto:' + error?.error?.text;
        }
      }
    });
  }

  get f() {
    return this.otpForm.controls;
  }

  getLoggedinUserInfo(): Promise<any> {
    let promise = new Promise((resolve, reject) => {
      this.locationService.getLoggedinUserInfo().subscribe((result: { AccountId: string; Roles: { $values: string | any[]; }; Id: any; Email: any; FullName: any; AccountName: any; DefaultCompanyName: any; PrimaryMobile: any; PrimaryLandline: any; UserProfileImage: any; CompanyLogo: { ImageData: any; }; AccountLogo: { ImageData: string; ImageType: { ContentType: string; }; }; VendorAccountName: any; VendorUser: any; }) => {
        sessionStorage.setItem("LoggedAccountId", result.AccountId)
        if (result && result.Roles && result.Roles.$values && result.Roles.$values.length > 0) {
          const userRoles = result.Roles.$values;
          const userInfo = {
            id: result.Id,
            email: result.Email,
            name: result.FullName,
            customer: result.AccountName,
            company: result.DefaultCompanyName,
            mobile: result.PrimaryMobile,
            landline: result.PrimaryLandline,
            userImage: result.UserProfileImage ? result.UserProfileImage : '',
            headerLogo: (result.CompanyLogo && result.CompanyLogo.ImageData) ? result.CompanyLogo.ImageData : (result.AccountLogo && result.AccountLogo.ImageData) ? 'data:' + result.AccountLogo.ImageType.ContentType + ';base64,' + result.AccountLogo.ImageData : '',
            VendorAccountName: result.VendorAccountName,
            VendorUser: result.VendorUser
          }
          this.sessionStorageService.setObjectValue('userInfo', userInfo);
          this.localStorageService.setObjectValue('userInfo', userInfo);
          this.sessionStorageService.setObjectValue('userRoles', userRoles);
          this.localStorageService.setObjectValue('userRoles', userRoles);
          return resolve(true);
        } else {
          return resolve(false);
        }
      });
    });
    return promise;
  }
}
