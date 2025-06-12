import { formatDate } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DualListComponent } from 'angular-dual-listbox';
 
import * as _ from 'lodash';
import { LocationService } from '../services/location.service';
import { ManageService } from '../services/manage.service';
import { checkIsValueExists, isValueExist, rolePermission } from '../services/helper';
import { ErrorWarningPopupComponent } from '../common/error-warning-popup/error-warning-popup.component';
import { SharedModule } from '../demo/shared/shared.module';
import { CustomDualListComponent } from '../common/custom-dual-list/custom-dual-list.component';

@Component({
  selector: 'app-auto-approval',
  templateUrl: './auto-approval.component.html',
  styleUrls: ['./auto-approval.component.scss'],
  imports: [
    SharedModule,
    CustomDualListComponent
  ]
})
export class AutoApprovalComponent implements OnInit {
  @Input() billingAccountData: any;
  @Input() setIsReadOnly: any;
  autoApprovalIsChecked: boolean = false;
  approvalTimelineIsChecked: boolean = false;
  varianceLimitIsChecked: boolean = false;
  autoApprovalForm: FormGroup;
  format: any = DualListComponent.DEFAULT_FORMAT;
  keepSorted = true;
  key: string;
  display: any;
  filter = true;
  source: any = [];
  confirmed: any = [];
  customers: any;
  disabled = false;
  isSuperTEMManager: boolean = false;
  isSuperTEMAdmin: boolean = false;
  isSuperTEMUser: boolean = false;
  isCompanyUser:boolean = false;
  isTEMUser: boolean = false;
  @Output() onSaveAndBackNext: EventEmitter<any> = new EventEmitter<any>();
  @Input() tabInfo: any;
  saveButtonLoadder = false;
  isautoApprovalFormSubmit = false;
  viewNEditAccount = false;
  temRoles = false;
  constructor(private fb: FormBuilder, private locationService: LocationService,
    public dialog: MatDialog,
    public manageService: ManageService,
  ) {
    this.format.all = 'Select All';
    this.format.none = 'Remove All';
    this.autoApprovalForm = fb.group({
      autoApprovalStatus: new FormControl(false),
      autoApprovalTimelineStatus: new FormControl(false),
      approvalVarianceLimitStatus: new FormControl(false),
      approvalEndDate: new FormControl(''),
      approvalVariance: new FormControl('', [Validators.max(100), Validators.min(1), Validators.pattern("^[0-9]*$")]),
    });

  }

  ngOnInit(): void {
    this.temRoles = rolePermission(['TEMAdmin', 'TEMUser', 'TEMManager']);
    this.isSuperTEMManager = this.locationService.isUserHasSuperTEMManagerRole();
    this.isSuperTEMAdmin = this.locationService.isUserHasSuperTEMAdminRole();
    this.isSuperTEMUser = this.locationService.isUserHasSuperTEMUserRole();
    this.isCompanyUser = this.locationService.isUserCompanyUser();
    this.isTEMUser = this.locationService.isUserHasTEMUserRole();
    this.viewNEditAccount = rolePermission(['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser']);

    this.billingAccountData.Id = this.billingAccountData.BillingAccountID || this.billingAccountData.Id || this.billingAccountData.BillingAccountId;

    this.locationService.getBillingAccountsDetails(this.billingAccountData.Id).subscribe((data) => {
      if (data) {
        this.f['autoApprovalStatus'].setValue(checkIsValueExists(data.Data.AutoApproval));
        this.autoApprovalIsChecked = checkIsValueExists(data.Data.AutoApproval);
        this.f['autoApprovalTimelineStatus'].setValue(checkIsValueExists(data.Data.AutoApprovalTimeline));
        this.approvalTimelineIsChecked = checkIsValueExists(data.Data.AutoApprovalTimeline);
        this.f['approvalVarianceLimitStatus'].setValue(checkIsValueExists(data.Data.ApprovalVarianceLimit));
        this.varianceLimitIsChecked = checkIsValueExists(data.Data.ApprovalVarianceLimit);
        this.f['approvalEndDate'].setValue(data.Data.ApprovalEndDate ? isValueExist(this.manageService.convertDate(data.Data.ApprovalEndDate, '', '/')) : '');
        this.f['approvalVariance'].setValue(isValueExist(data.Data.Variance));
        this.getCustomerForUser(data.Data.CustomerAccountId);
        this.confirmed = data.Data.APResponsibles?.$values ?? [];

      }
    });
    this.autoApprovalChecked(this.f['autoApprovalStatus'].value);
    if (this.isCompanyUser || this.isTEMUser) {
      this.autoApprovalForm.disable();
      this.setIsReadOnly = true;
      this.disabled = true;
    }
  }

  get f() {
    return this.autoApprovalForm.controls;
  }
  getCustomerForUser(customerAccountId: any) {
    this.locationService.getAPResponsibleUsers(customerAccountId).subscribe((data) => {
      if (data && data.$values) {
        this.customers = data.$values;
        this.customers = this.customers.map((d: any) => {
          let k: any = {};
          k = d;
          k['FullName'] = k['FullName'] + ' ' + '(' +k['Logon'] + ')';
          return k;
        })
        this.source = JSON.parse(JSON.stringify(this.customers));
        this.key = 'UserId';
        this.display = 'FullName';
      }
    });
  }
  autoApprovalChecked(event: any) {
    this.autoApprovalIsChecked = event;
    this.approvalTimelineChecked(false);
    this.varianceLimitChecked(false);
  }
  approvalTimelineChecked(event: any) {
    this.approvalTimelineIsChecked = event;
    let approvalEndDateValid:any = null;
    this.f['autoApprovalTimelineStatus'].setValue(event);
    approvalEndDateValid = this.autoApprovalForm.get('approvalEndDate');
    if (this.approvalTimelineIsChecked) {      
      approvalEndDateValid?.setValidators([Validators.required]);
    } else {
      approvalEndDateValid?.setValidators([]);
    }
    approvalEndDateValid?.updateValueAndValidity();
  }

  varianceLimitChecked(event: any) {
    this.varianceLimitIsChecked = event;
    let approvalVarValid:any = null;
    this.f['approvalVarianceLimitStatus'].setValue(event);
    approvalVarValid = this.autoApprovalForm.get('approvalVariance');
    if (this.varianceLimitIsChecked) {
      approvalVarValid?.setValidators([Validators.required]);
    } else {
      approvalVarValid?.setValidators();
    }
    approvalVarValid?.updateValueAndValidity();
  }

  submitAutoApproval() {
    this.managerVariance();
    this.isautoApprovalFormSubmit = true;
    let apResponsible: any = [];
    this.confirmed?.forEach((obj: any) => {
      apResponsible.push(obj.UserId);
    });

    this.approvalTimelineChecked(this.f['autoApprovalTimelineStatus'].value);
    this.varianceLimitChecked(this.f['approvalVarianceLimitStatus'].value);
    this.managerVariance();

    if (this.autoApprovalForm.valid) {
      this.autoApprovalForm.value['apResponsible'] =  _.cloneDeep(apResponsible);
      
      const approvalVariancelimitStatus = this.autoApprovalForm.value.approvalVarianceLimitStatus;
      this.autoApprovalForm.value.approvalVariance = (approvalVariancelimitStatus) ? 
      this.f['approvalVariance'].setValue(Number(this.autoApprovalForm.value.approvalVariance)) :
      null;

      const autoApprovalTimelineStatus = this.autoApprovalForm.value.autoApprovalTimelineStatus;
      
      this.autoApprovalForm.value.approvalEndDate = (autoApprovalTimelineStatus) ? this.autoApprovalForm.value.approvalEndDate : null;
      this.saveButtonLoadder = true;

      
      const data = {
        apResponsible : _.cloneDeep(apResponsible),
        approvalEndDate : this.autoApprovalForm.value.approvalEndDate ? _.cloneDeep(this.onselectSetDate(this.autoApprovalForm.value.approvalEndDate, '-')) : null,
        approvalVariance : this.autoApprovalForm.value.approvalVariance,
        approvalVarianceLimitStatus : approvalVariancelimitStatus,
        autoApprovalStatus : this.autoApprovalForm.value.autoApprovalStatus,
        autoApprovalTimelineStatus : autoApprovalTimelineStatus
      };
      this.locationService.updateautoApprovalSettings(data, this.billingAccountData.Id).subscribe({
        next: data => {
          if (data.Success) {
          this.saveButtonLoadder = false;
          let errorData: any = {
            messgeType: "error",
            title: "Attention",
            titleClass: "text-c-blue",
            icon: "fas fa-exclamation-circle",
            iconClass: "text-c-blue f-70",
            message: "Successfully saved" //if messges is multiple use array
          }
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
          dialogRef.afterClosed().subscribe(result => {
            this.onSaveAndBackNext.emit(data.Data);
          });
        } else {
          this.saveButtonLoadder = false;
          let errorMessage: any = '';
          if (data.Success === false) {
            errorMessage = data.Message ? data.Message : 'Bad request';
            let errorData: any = {
              messgeType: 'error',
              title: 'Attention',
              titleClass: 'text-c-blue',
              icon: 'fas fa-exclamation-circle',
              iconClass: 'text-c-blue f-70',
              message: errorMessage, //if messges is multiple use array
            };
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
              panelClass: 'error-warning',
              data: errorData,
            });
          }
        }

        },
        error: error => {
          this.saveButtonLoadder = false;
          let errorMessage: any = '';
          if (error.StatusCode === 400) {
            errorMessage = error.Message ? error.Message : 'Bad request';
            let errorData: any = {
              messgeType: "error",
              title: "Attention",
              titleClass: "text-c-blue",
              icon: "fas fa-exclamation-circle",
              iconClass: "text-c-blue f-70",
              message: errorMessage //if messges is multiple use array
            }
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });

          }
        }

      });
    }
  }

  changeApprovalVariance($ev: any){
    if (Number($ev.target.value)  < 1) {
      this.f['approvalVariance'].setValue('');
    }
  }

  managerVariance(){
    this.f['approvalVariance'].setValue(this.f['approvalVariance'].value);
    if (this.f['approvalVariance'].value > 100 || this.f['approvalVariance'].value == 0 || !this.f['approvalVariance'].value) {
      this.autoApprovalForm.get('approvalVariance')?.setValidators([Validators.required, Validators.min(1) ,Validators.max(100)]);
    }
    if (!this.f['approvalVarianceLimitStatus'].value) {
      this.autoApprovalForm.get('approvalVariance')?.setValidators([]);
    }
    this.autoApprovalForm.get('approvalVariance')?.updateValueAndValidity();
  }

  onselectSetDate($event: any, regex = '/') {
    if ($event && !$event.toString().includes('/')) {
      let d = $event;
      let dd = d.getDate();
      let mm = d.getMonth() + 1;
      let yy = d.getFullYear();

      let userAgent = navigator.userAgent;
      let browserName;

      if (userAgent.match(/chrome|chromium|crios/i)) {
        browserName = "chrome";
      } else if (userAgent.match(/firefox|fxios/i)) {
        browserName = "firefox";
      } else if (userAgent.match(/safari/i)) {
        browserName = "safari";
      } else if (userAgent.match(/opr\//i)) {
        browserName = "opera";
      } else if (userAgent.match(/edg/i)) {
        browserName = "edge";
      } else {
        browserName = "No browser detection";
      }

      if (browserName === 'firefox') {
        return isValueExist(this.manageService.convertDate(`${mm}-${dd}-${yy}`, 'saveDatePicker', regex));
      } else {
        return isValueExist(this.manageService.convertDate(`${mm}-${dd}-${yy}T0000`, 'saveDatePicker', regex));
      }
    } else {
      return isValueExist(this.manageService.convertDate(`${$event}T0000`, 'saveDatePicker', regex));
    }
  }
  
}
