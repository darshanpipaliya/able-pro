import { ColDef, GetDataPath, GridReadyEvent } from '@ag-grid-community/core';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import * as _ from 'lodash';
import { LocationService } from '../services/location.service';
import { isValueExist, rolePermission } from '../services/helper';
import { ErrorWarningPopupComponent } from '../common/error-warning-popup/error-warning-popup.component';
import { SharedModule } from '../demo/shared/shared.module';
import { PrimgModule } from '../demo/shared/primeng.module';
import { SpaceTrimStartEndInputirective } from '../custom-directives/custom-validation.directive';


@Component({
  selector: 'app-edit-payment-settings',
  templateUrl: './edit-payment-settings.component.html',
  styleUrls: ['./edit-payment-settings.component.scss'],
  imports: [SharedModule, PrimgModule, SpaceTrimStartEndInputirective]
})
export class EditPaymentSettingsComponent implements OnInit {
  @Input() billingAccountData: any;
  @Input() setIsReadOnly: boolean;
  paymentSettingForm: FormGroup;
  paymentMethods: any = [];
  paymentType: any = [];
  billingAccount: any = [];
  submitted: boolean = false;
  BillPayOptionEnable: any = '';
  newdata: any = [];
  data: any;
  isSuperTEMManager: boolean = false;
  isSuperTEMAdmin: boolean = false;
  isSuperTEMUser: boolean = false;
  isCompanyUser: boolean = false;
  isTEMUser: boolean = false;
  customerList: any;
  @Output() onSaveAndBackNext: EventEmitter<any> = new EventEmitter<any>();
  @Input() tabInfo: any;
  saveButtonLoadder = false;
  disabledInput = false;
  setRequired = true;
  billPayList = [
    { value: 'Customer', Id: 'Customer' },
    { value: 'TEM', Id: 'TEM' },
  ];
  viewNEditAccount = false;
  constructor(private fb: FormBuilder, private locationService: LocationService,
    public dialog: MatDialog,
  ) {

    this.paymentSettingForm = fb.group({
      paymentResponsible: new FormControl('', [Validators.required]),
      paymentMethodId: new FormControl(null, [Validators.required]),
      paymentMethodNotes: new FormControl('', []),
      billingAccountHierarchyId: new FormControl('', []),
      paymentTransactionId: new FormControl(null, [Validators.required]),
      paymentTransactionDetails: new FormControl('', []),
      customerAccountId: new FormControl('', [Validators.required]),
      PaymentMethodWebUrl: new FormControl('', []),
      PaymentMethodWebLogin: new FormControl('', []),
      PaymentMethodWebPassword: new FormControl('', []),
      PaymentMethodNoteText: new FormControl('', [])
    });
    this.locationService.getCustomerDropDown().subscribe((data) => {
      if (data && data.$values) {
        this.customerList = data.$values;
      }
    });
    this.locationService.getPaymenttypes().subscribe((data) => {
      if (data && data.$values) {
        this.paymentType = data.$values;
      }
    });
    this.locationService.getPaymentmethods().subscribe((data) => {
      if (data && data.$values) {
        this.paymentMethods = data.$values;
      }
    });
  }


  ngOnInit(): void {
    this.isSuperTEMManager = this.locationService.isUserHasSuperTEMManagerRole();
    this.isSuperTEMAdmin = this.locationService.isUserHasSuperTEMAdminRole();
    this.isSuperTEMUser = this.locationService.isUserHasSuperTEMUserRole();
    this.isCompanyUser = this.locationService.isUserCompanyUser();
    this.isTEMUser = this.locationService.isUserHasTEMUserRole();
    this.viewNEditAccount = rolePermission(['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser']);


    this.billingAccountData.Id = this.billingAccountData.Id || this.billingAccountData.BillingAccountID || this.billingAccountData.BillingAccountId;

    this.locationService.getBillingAccountsDetails(this.billingAccountData.Id).subscribe((data) => {

      if (data) {
        this.locationService.getBillingAccountsSettingsDetails(this.billingAccountData.Id).subscribe((accountData) => {
          // let accountDataArray: any = [accountData.Data];
          // this.data = this.treeGridDataMapping(accountDataArray);
          // if (accountData.Data) {
          if (accountData.Data.BillPayOption == 'No') {
            this.paymentSettingForm.disable();
          }
          this.BillPayOptionEnable = accountData.Data.BillPayOption;
          this.paymentSettingForm.controls['paymentResponsible'].setValue((data.Data.InvoicePaymentResponsible) ? _.trim(data.Data.InvoicePaymentResponsible) : null);
          this.paymentSettingForm.controls['paymentMethodId'].setValue((isValueExist(data.Data.PaymentMethodId)));
          this.paymentSettingForm.controls['paymentMethodNotes'].setValue((isValueExist(data.Data.BillingAccountPaymentMethodDetails)));
          this.paymentSettingForm.controls['billingAccountHierarchyId'].setValue((data.Data.BillingAccountHierarchyId) ? _.trim(data.Data.BillingAccountHierarchyId) : null);
          this.paymentSettingForm.controls['paymentTransactionId'].setValue((isValueExist(data.Data.PaymentTransactionId)));
          this.paymentSettingForm.controls['paymentTransactionDetails'].setValue((isValueExist(data.Data.BillingAccountPaymentTransactionDetails)));

          this.paymentSettingForm.controls['customerAccountId'].setValue((isValueExist(data.Data.CustomerAccountId)));
          this.paymentSettingForm.controls['PaymentMethodWebLogin'].setValue((data.Data.BillingAccountPaymentMethodWebLogin) ? _.trim(data.Data.BillingAccountPaymentMethodWebLogin) : null);
          this.paymentSettingForm.controls['PaymentMethodWebPassword'].setValue((data.Data.BillingAccountPaymentMethodWebPassword) ? _.trim(data.Data.BillingAccountPaymentMethodWebPassword) : null);
          this.paymentSettingForm.controls['PaymentMethodWebUrl'].setValue((data.Data.BillingAccountPaymentMethodWebUrl) ? _.trim(data.Data.BillingAccountPaymentMethodWebUrl) : null);
          this.paymentSettingForm.controls['PaymentMethodNoteText'].setValue((data.Data.BillingAccountPaymentMethodNoteText) ? _.trim(data.Data.BillingAccountPaymentMethodNoteText) : null);

          this.setUnsetrequired(data.Data.InvoicePaymentResponsible);
          this.billpaychange(this.paymentSettingForm.controls['paymentResponsible'].value);
          // }
        });
      }
    });
    let isUserHasTEMAdminRole = this.locationService.isUserHasTEMAdminRole();
    if (this.isCompanyUser || this.isTEMUser) {
      this.paymentSettingForm.disable();
      this.setIsReadOnly = true;
    }

  }

  billpaychange($event: any) {
    if ($event === 'Customer') {
      this.setRequired = false;
      this.disabledInput = true;
      this.paymentSettingForm.get('paymentTransactionId')?.setValidators([]);
      this.paymentSettingForm.get('paymentMethodId')?.setValidators([]);
      this.paymentSettingForm.get('paymentMethodNotes')?.setValidators([]);
      this.paymentSettingForm.get('paymentTransactionDetails')?.setValidators([]);
    } else {
      this.paymentSettingForm.get('paymentTransactionId')?.setValidators([Validators.required]);
      this.paymentSettingForm.get('paymentMethodId')?.setValidators([Validators.required]);
      this.paymentSettingForm.get('paymentMethodNotes')?.setValidators([]);
      this.paymentSettingForm.get('paymentTransactionDetails')?.setValidators([]);
      this.setRequired = true;
      this.disabledInput = false;
    }

    this.paymentSettingForm.get('paymentTransactionId')?.updateValueAndValidity();
    this.paymentSettingForm.get('paymentMethodId')?.updateValueAndValidity();
    this.paymentSettingForm.get('paymentMethodNotes')?.updateValueAndValidity();
    this.paymentSettingForm.get('paymentTransactionDetails')?.updateValueAndValidity();

  }

  treeGridDataMapping(data: any) {

    data.forEach((element: any) => {
      if (element.Data.ChildBillingAccounts.$values) {
        element.ChildBillingAccounts = element.Data.ChildBillingAccounts.$values;
        this.treeGridDataMapping(element.Data.ChildBillingAccounts);
      } else {
        element.ChildBillingAccounts = [];
      }
    });
    return data;
  }

  get f() {
    return this.paymentSettingForm.controls;
  }
  setUnsetrequired(value: any = '') {
    let paymentMethodField: any, paymentTransactionField: any;
    paymentMethodField = this.paymentSettingForm.get('paymentMethodId');
    paymentTransactionField = this.paymentSettingForm.get('paymentTransactionId');
    if (value == 'TEM') {
      this.setRequired = true;
      paymentMethodField?.setValidators([Validators.required]);
      paymentTransactionField?.setValidators([Validators.required]);
    } else {
      this.setRequired = false;
      paymentMethodField?.setValidators([]);
      paymentTransactionField?.setValidators([]);
    }
    paymentMethodField?.updateValueAndValidity();
    paymentTransactionField?.updateValueAndValidity();
  }

  savePaymentSetting() {
    this.submitted = true;
    if (this.paymentSettingForm.valid) {
      this.paymentSettingForm.value.paymentTransactionId =
        this.paymentSettingForm.value.paymentTransactionId === "" ? null : this.paymentSettingForm.value.paymentTransactionId;
      this.paymentSettingForm.value.paymentMethodId =
        this.paymentSettingForm.value.paymentMethodId === "" ? null : this.paymentSettingForm.value.paymentMethodId;
      const id = this.billingAccountData.Id || this.billingAccountData.BillingAccountId;
      this.saveButtonLoadder = true;
      this.locationService.savePaymentSetting(this.paymentSettingForm.value, id).subscribe({
        next: data => {
          if (data.Success) {
            // this.paymentSettingForm.disable();
            this.submitted = false;
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

  setValidationLoginPasword(type?: any) {

    if (!type) {
      this.paymentSettingForm.controls['PaymentMethodWebPassword']?.clearValidators();
      this.paymentSettingForm.controls['PaymentMethodWebLogin']?.clearValidators();
      this.paymentSettingForm.controls['PaymentMethodWebPassword']?.updateValueAndValidity();
      this.paymentSettingForm.controls['PaymentMethodWebLogin']?.updateValueAndValidity();
    }
    if (type === 'login') {
      if (this.paymentSettingForm.controls['PaymentMethodWebLogin'].value) {
        this.paymentSettingForm.controls['PaymentMethodWebPassword'].setValidators([Validators.required]);
      } else if (!this.paymentSettingForm.controls['PaymentMethodWebLogin'].value) {
        this.paymentSettingForm.controls['PaymentMethodWebPassword']?.clearValidators();
      }
      this.paymentSettingForm.controls['PaymentMethodWebPassword']?.updateValueAndValidity();
    }


    if (type === 'password') {
      if (this.paymentSettingForm.controls['PaymentMethodWebPassword'].value) {
        this.paymentSettingForm.controls['PaymentMethodWebLogin'].setValidators([Validators.required]);
      } else if (!this.paymentSettingForm.controls['PaymentMethodWebPassword'].value) {
        this.paymentSettingForm.controls['PaymentMethodWebLogin']?.clearValidators();
      }
      this.paymentSettingForm.controls['PaymentMethodWebLogin']?.updateValueAndValidity();
    }

  }

}
