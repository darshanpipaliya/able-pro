import { Component, HostListener, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { SessionStorageService } from 'src/app/services/session-storage.service';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { LocationService } from 'src/app/services/location.service';
import { MfcPopupComponent } from '../mfc-popup/mfc-popup.component';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ProfileDialogComponent } from 'src/app/profile-dialog/profile-dialog.component';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { CommonModule } from '@angular/common';
import { SpaceTrimStartEndInputirective } from 'src/app/custom-directives/custom-validation.directive';
export class loginUser {
  email: any;
  password: any;
}

@Component({
  selector: 'app-auth-signin',
  templateUrl: './auth-signin.component.html',
  styleUrls: ['../../demo/pages/auth/authentication-1/authentication-1.scss', '../../demo/pages/auth/authentication.scss'],
  standalone: true,
  imports: [
    SharedModule,
    CommonModule,
    SpaceTrimStartEndInputirective
  ],
})
export class AuthSigninComponent implements OnInit {
  loginForm: FormGroup;
  loginUser: loginUser;
  hide = true;
  isUserIsSuperTEM: any = false;
  isCompanyUser: boolean = false;
  isLoggedSuperTemUser = false;
  dataas: any
  isClicked: any = false;
  safeHtmlContent: SafeHtml;
  isCompanyAdmin = false;
  isCompanyManager = false;

  constructor(private router: Router,
    private locationService: LocationService,
    private sessionStorageService: SessionStorageService,
    public dialog: MatDialog,
    private localStorageService: LocalStorageService, private sanitizer: DomSanitizer) {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required])
    });
  }

  ngOnInit() {
    const newUser = this.sessionStorageService.getObjectValue('newUser');
    if (!newUser && this.localStorageService.getObjectValue('token') != null) {
      let user = this.localStorageService.getObjectValue('user');
      let token = this.localStorageService.getObjectValue('token');
      this.locationService.loginUser = user;
      this.sessionStorageService.setObjectValue('user', user);
      this.localStorageService.setObjectValue('token', token);
      this.isUserIsSuperTEM = this.locationService.isUserHasSuperTEMRole();

      this.isCompanyAdmin = this.locationService.isUserCompanyAdmin();
      this.isCompanyManager = this.locationService.isUserCompanyManager();
      if (this.sessionStorageService?.getObjectValue('userRoles')?.includes("CompanyUser")) {
        this.isCompanyUser = true
      }

      if (this.isCompanyUser) {
        this.router.navigate(['/people/users']);
      } else if (this.isCompanyAdmin || this.isCompanyManager) {
        this.router.navigate(['/organization/customer']);
      } else {
        this.router.navigate(['/dashboard/home']);
      }

      //   if (this.isUserIsSuperTEM) {
      //   this.router.navigate(['/management/tem']);
      //  } else {
      //    this.router.navigate(['/organization/customer']);
      //  }
      // this.router.navigate(['/dashboard/home']);

      //this.openSSO();
    }
  }

  openSSO() {
    this.locationService.openSSO().subscribe((data: BlobPart) => {
      this.isClicked = false;
      //this.safeHtmlContent = this.sanitizer.bypassSecurityTrustHtml(data);
      var winUrl = URL.createObjectURL(new Blob([data], { type: 'text/html' }));
      window.open(winUrl, '_self');

    })
  }
  getErrorMessage() {
    if (this.loginForm.controls['email'].hasError('required')) {
      return 'You must enter a email';
    }

    return this.loginForm.controls['email'].hasError('email') ? 'Not a valid email' : '';
  }

  getErrorMessage1() {
    if (this.loginForm.controls['password'].hasError('required')) {
      return 'You must enter a Password';
    } else {
      return '';
    }
  }

  signIn() {
    // this.dialog.open(MfcPopupComponent)
    if (this.loginForm.valid) {
      this.isClicked = true;
      this.loginUser = this.loginForm.value;
      this.locationService.login(this.loginUser).subscribe({
        next: (data: { email: any; Token: any; }) => {
          data.email = this.loginUser.email;
          this.locationService.loginUser = data;
          this.sessionStorageService.setObjectValue('user', data);
          this.sessionStorageService.setObjectValue('token', data.Token);
          this.localStorageService.setObjectValue('user', data);
          this.localStorageService.setObjectValue('token', data.Token);

          this.getLoggedinUserInfo().then((allow) => {
            this.isUserIsSuperTEM = this.locationService.isUserHasSuperTEMRole();
            this.isLoggedSuperTemUser = this.locationService.isUserHasSuperTEMUserRole();

            this.isCompanyAdmin = this.locationService.isUserCompanyAdmin();
            this.isCompanyManager = this.locationService.isUserCompanyManager();
            if (this.sessionStorageService.getObjectValue('userRoles').includes("CompanyUser")) {
              this.isCompanyUser = true
            }
            if (allow) {
              //  if (this.isUserIsSuperTEM) {
              //   this.router.navigate(['/management/tem']);
              //  } else if (this.isLoggedSuperTemUser) {
              //    this.router.navigate(['/finances/accounting']);
              //  } else if (this.isCompanyUser) {
              //    this.router.navigate(['/people/users']);
              //  } else {
              //    this.router.navigate(['/organization/customer']);
              //  }
              //this.openSSO();

              if (this.isCompanyUser) {
                this.router.navigate(['/people/users']);
              } else if (this.isCompanyAdmin || this.isCompanyManager) {
                this.router.navigate(['/organization/customer']);
              } else {
                this.router.navigate(['/dashboard/home']);
              }

              this.locationService.checkPasswordExpiration(this.loginForm.value.email).subscribe({
                next: (res: { StatusCode: number; Message: string; }) => {
                  if (res.StatusCode == 200 && res.Message == "Your password is expired and must be changed.") {
                    let errorData: any = {
                      messgeType: 'error',
                      title: 'Attention',
                      titleClass: 'text-c-blue',
                      icon: 'fas fa-exclamation-circle',
                      iconClass: 'text-c-blue f-70',
                      okBtnName: 'Ok',
                      message: res.Message,
                      removeLink: true
                    };
                    const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
                      panelClass: 'error-warning',
                      data: errorData,
                    });
                    dialogRef.afterClosed().subscribe((result) => {
                      const dialogRef = this.dialog.open(ProfileDialogComponent, {
                        panelClass: 'width-665',
                        data: { disableClose: true },
                        disableClose: true 
                      });

                      dialogRef.afterClosed().subscribe(result => {
                      });
                    });
                  }
                },
                error: (err: any) => {
                }
              });

            } else {
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
        },
        error: (error: { status: number; error: { ErrorMessage: any; text: string; }; }) => {
          this.isClicked = false;
          let errorMessage: any = '';
          if (error.status === 400) {
            errorMessage = error.error;
          } else if (error.status === 401) {
            errorMessage = error.error.ErrorMessage;
          } else if (error.status === 200 && error?.error?.text == 'One time passcode sent successfully') {
            errorMessage = 'One time passcode sent successfully';
          } else {
            errorMessage = "Please try again";
          }

          let errorData: any = {
            messgeType: "error",
            title: "Attention",
            titleClass: "text-c-blue",
            icon: "fas fa-exclamation-circle",
            iconClass: "text-c-blue f-70",
            message: errorMessage //if messges is multiple use array
          }
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData, disableClose: true });
          dialogRef.afterClosed().subscribe(result => {

            if (error.status === 200 && error?.error?.text == 'One time passcode sent successfully') {
              this.dialog.open(MfcPopupComponent, { data: this.loginForm.value.email, disableClose: true });
            }

          });
        }
      });
    }
  }




  getLoggedinUserInfo(): Promise<any> {
    let promise = new Promise((resolve, reject) => {
      this.locationService.getLoggedinUserInfo().subscribe((result: any) => {
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
            VendorUser: result.VendorUser,
            ManagingAccountId: result.AccountType == 'TEM' ? result.AccountId : result.ManagingAccountId
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



  getUserRoles(): Promise<any> {
    let promise = new Promise((resolve, reject) => {
      this.locationService.getUserRoles().subscribe((roles: { $values: string | any[]; }) => {
        if (roles && roles.$values.length > 0) {
          const userRoles = roles.$values;
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

  forgetPassword() {
    this.router.navigate(['/auth/reset-password']);
  }


}