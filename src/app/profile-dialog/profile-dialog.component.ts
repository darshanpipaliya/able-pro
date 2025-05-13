import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { ErrorWarningPopupComponent } from '../common/error-warning-popup/error-warning-popup.component';
import { LocationService } from '../services/location.service';
import { SessionStorageService } from '../services/session-storage.service';
import { LocalStorageService } from '../services/local-storage.service';
import { MatTabGroup, MatTabLabel, MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../demo/shared/shared.module';
import { SpaceTrimStartEndInputirective } from '../custom-directives/custom-validation.directive';
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
  selector: 'app-profile-dialog',
  templateUrl: './profile-dialog.component.html',
  styleUrls: ['./profile-dialog.component.scss'],
  standalone: true,
  imports: [
    SharedModule,
    CommonModule,
    SpaceTrimStartEndInputirective
  ]
})
export class ProfileDialogComponent implements OnInit {
  dialogData: any;
  selectedTab: any = 0;
  pwdPattern: any = '((?=.*\d)(?=.*[a-zA-Z]).{6,20})';
  changePwdForm: FormGroup;
  hideCp = true;
  hide = true;
  hide2 = true;
  userInfo: any;
  userRole: any = 'No role';
  isTemUser: any = false;
  isSuperTEMUsers: boolean = false;

  constructor(private dialogRef: MatDialogRef<ProfileDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data:any,
    private fb: FormBuilder,
    private locationService: LocationService,
    private localStorageService: LocalStorageService,
    private sessionStorageService: SessionStorageService,
    public dialog: MatDialog,
    private router: Router) {
    this.dialogData = data;
    dialogRef.disableClose = true;
    this.changePwdForm = fb.group({
      currentPassword: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required, Validators.pattern(/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/)]),
      crfPassword: new FormControl('', [Validators.required])
    }, {
      validator: ConfirmedValidator('password', 'crfPassword')
    })
  }

  ngOnInit(): void {

    if (this.dialogData.disableClose) {
      this.selectedTab = 1;
    }
    //const userInfo = this.sessionStorageService.getObjectValue('userInfo');
    //this.userInfo = userInfo;
    // const userRoles = this.sessionStorageService.getObjectValue('userRoles');
    this.userInfo = this.sessionStorageService.getObjectValue('userInfo') ? this.sessionStorageService.getObjectValue('userInfo') : null;
    //this.userInfo = userInfo;
    this.isTemUser = this.locationService.isUserHasTEMRole();
    this.isSuperTEMUsers = this.locationService.isUserHasSuperTEMUsersRole();
    const userRoles = this.sessionStorageService.getObjectValue('userRoles') ? this.sessionStorageService.getObjectValue('userRoles') : null;
    userRoles.forEach((role: any) => {
      switch (role) {

        case 'SuperTEM':
          this.userRole = 'Super TEM';
          break;
        case 'SuperTEMAdmin':
          this.userRole = 'Super TEM Admin';
          break;
        case 'SuperTEMManager':
          this.userRole = 'Super TEM Manager';
          break;
        case 'SuperTEMUser':
          this.userRole = 'Super TEM User';
          break;
        case 'CompanyUser':
          this.userRole = 'Company User';
          break;
        case 'CompanyManager':
          this.userRole = 'Company Manager';
          break;
        case 'CompanyAdmin':
          this.userRole = 'Company Admin';
          break;
        case 'CustomerAdmin':
          this.userRole = 'Customer Admin';
          break;
        case 'VendorUser':
          this.userRole = 'Vendor User';
          break;
        case 'TEMAdmin':
          this.userRole = 'TEM Admin';
          break;
        case 'TEMManager':
          this.userRole = 'TEM Manager';
          break;
        case 'TEMUser':
          this.userRole = 'TEM User';
          break;
        default:
          break;
      }
    });
  }

  onNoClick() {
    this.dialogRef.close();
  }

  editUser() {
    const userId = this.userInfo.id;
    this.router.navigateByUrl('/data-table/users', { state: { id: userId } }).then(() => {
      setTimeout(() => {
        this.dialogRef.close();
      }, 0);
    });
  }

  onFileUploaded(message: any) {
    this.getLoggedinUserInfo().then((allow) => {
      if (allow) {
        let errorData: any = {
          messgeType: "error",
          title: "Attention",
          titleClass: "text-c-blue",
          icon: "fas fa-thumbs-up",
          iconClass: "text-c-blue f-40",
          message: message //if messges is multiple use array
        }
        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
        dialogRef.afterClosed().subscribe(result => {
          if (this.userRole == 'Company Admin' || this.userRole == 'Company Manager') {
            this.router.navigate(['/organization/customer']).then(() => {
              window.location.reload();
            });
          } else if (this.userRole == 'Company User') {
            this.router.navigate(['/people/users']).then(() => {
              window.location.reload();
            });
          } else {
            this.router.navigate(['/dashboard/home']).then(() => {
              window.location.reload();
            });
          }
        });
      } else {
        let errorData: any = {
          messgeType: "error",
          title: "Attention",
          titleClass: "text-c-blue",
          icon: "fas fa-exclamation-circle",
          iconClass: "text-c-blue f-70",
          message: message //if messges is multiple use array
        }
        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
      }
    });
  }

  getLoggedinUserInfo(): Promise<any> {
    let promise = new Promise((resolve, reject) => {
      this.locationService.getLoggedinUserInfo().subscribe((result: { Roles: { $values: string | any[]; }; Id: any; Email: any; FullName: any; PrimaryMobile: any; PrimaryLandline: any; UserProfileImage: any; CompanyLogo: { ImageData: any; }; AccountLogo: { ImageData: any; }; VendorAccountName: any; VendorUser: any; }) => {
        if (result && result.Roles && result.Roles.$values && result.Roles.$values.length > 0) {
          const userRoles = result.Roles.$values;
          const userInfo = {
            id: result.Id,
            email: result.Email,
            name: result.FullName,
            mobile: result.PrimaryMobile,
            landline: result.PrimaryLandline,
            userImage: result.UserProfileImage ? result.UserProfileImage : '',
            headerLogo: (result.CompanyLogo && result.CompanyLogo.ImageData) ? result.CompanyLogo.ImageData : (result.AccountLogo && result.AccountLogo.ImageData) ? result.AccountLogo.ImageData : '',
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

  get f() {
    return this.changePwdForm.controls;
  }
  changePwd() {
    if (this.changePwdForm.valid) {
      const data = {
        Email: this.userInfo.email,
        password: this.changePwdForm.value.password,
        confirmPassword: this.changePwdForm.value.crfPassword,
        currentPassword: this.changePwdForm.value.currentPassword
      }

      this.locationService.userResetPwd(data).subscribe({
        next: (data: any) => {
          let errorData: any = {
            messgeType: "error",
            title: "Attention",
            titleClass: "text-c-blue",
            icon: "fas fa-exclamation-circle",
            iconClass: "text-c-blue f-70",
            message: 'Password changed successfully!' //if messges is multiple use array
          }
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });

          dialogRef.afterClosed().subscribe((reslut) => {
            this.dialogRef.close();
          });
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
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });

          } else if (error.status === 200) {
            let errorData: any = {
              messgeType: "error",
              title: "Attention",
              titleClass: "text-c-blue",
              icon: "fas fa-exclamation-circle",
              iconClass: "text-c-blue f-70",
              message: 'Password changed successfully' //if messges is multiple use array
            }
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
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
          }
        }
      });
    }
  }
}
