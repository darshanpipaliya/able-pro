import { DatePipe, formatDate } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { Subject, Subscriber, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as _ from 'lodash';
import { LocationService } from '../services/location.service';
import { ManageService } from '../services/manage.service';
import { checkIsValueExists, checkIsValueExistswithZero, isValueExist, isValuesUndefined, rolePermission } from '../services/helper';
import { ErrorWarningPopupComponent } from '../common/error-warning-popup/error-warning-popup.component';
import { SharedModule } from '../demo/shared/shared.module';
import { PrimgModule } from '../demo/shared/primeng.module';
import { SpaceTrimStartEndInputirective } from '../custom-directives/custom-validation.directive';
import { AddNewAddressDialogComponent } from '../add-new-address-dialog/add-new-address-dialog.component';
import { AccoutNoteDialogComponent } from '../accout-note-dialog/accout-note-dialog.component';

@Component({
  selector: 'app-add-billing-account',
  templateUrl: './add-billing-account.component.html',
  styleUrls: ['./add-billing-account.component.scss'],
  imports: [SharedModule, PrimgModule, SpaceTrimStartEndInputirective]
})
export class AddBillingAccountComponent implements OnInit, OnDestroy {
  addBillingAccountForm: FormGroup;
  customerList: any = [];
  vendorsList: any = [];
  CountriesList: any = [];
  stateList: any = [];
  currenciesList: any = [];
  MainBillingAccountDD: any = [];
  statusList: any = [];

  submitted: boolean = false;
  billedAddressChanged: boolean;
  remitAddressesList: any = [];
  invoicefrequenciesList = [];
  @Input() billingAccountData: any;
  @Input() action: any;
  @Input() setIsReadOnly: any;
  @Input() tabInfo: any;
  @Input() selectedTem: any;
  fromDate: any;
  isSuperTEMManager: boolean = false;
  isSuperTEMAdmin: boolean = false;
  isSuperTEMUser: boolean = false;
  isUserHasSuperTEMUsersRole: boolean = false;
  isUserHasTEMUsersRole: boolean = false;
  invoiceAttachDisabled = false;
  isCompanyUser: boolean = false;
  isShowPastDateDialog: boolean = false;
  tableData: any;
  cols: any[];
  isAllowAccess: boolean = false;
  disconnectionDateReq: boolean = false;
  invoiceStartDateReq: boolean = false;

  isTEMUser: boolean = false;
  disabledRemitDD: boolean = false;
  setTemDDValue: any;
  days: any = [];
  tems: any = [];
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  private _unsubscribeAllCustomerVendor: Subject<any> = new Subject<any>();
  private _unsubscribeCustomer: Subject<any> = new Subject<any>();
  private _unsubscribeCountry: Subject<any> = new Subject<any>();
  private _unsubscribeVendor: Subject<any> = new Subject<any>();
  private _unsubscribeAllAnyPayableBillingAccount: Subject<any> =
    new Subject<any>();

  private _unsubscribeBillingStatus: Subject<any> = new Subject<any>();

  private _unsubscribeParentChild: Subject<any> = new Subject<any>();

  @Output() onSaveAndBackNext: EventEmitter<any> = new EventEmitter<any>();
  @Output() onSaveAndNext: EventEmitter<any> = new EventEmitter<any>();
  @Output() onComponentDestroy: EventEmitter<any> = new EventEmitter<any>();
  @Output() setTemDDValueEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() sendAccHirercyToTable: EventEmitter<any> = new EventEmitter<any>();
  saveButtonLoadder = false;
  mainPayableDisabled = false;
  mainAccountDDReqired = true;
  vendoraccountsDetail: any = '';
  disabledOnIsAnyPayable = false;
  selectedCustomerId: any;
  varCustomerAccountId = null;
  varVendorAccountId = null;
  varPayableAccount = null;
  varParentBillingAccountHierarchyId = null;

  customerChangeDetect: any = true;
  vendorChangeDetect: any = true;
  mainAccChangeDetect: any = true;
  payableChangeDetect: any = true;
  viewNEditAccount: any = false;
  oldPayByDays: any;
  isManually = false;

  customerListLoading = false;

  remitAddId: any;
  payableVendorId: any;
  isSubAccount: boolean = false;
  setMindate: any;
  RemoveInvoiceRetrievals = false;
  payableVendorDisabled = false;

  constructor(
    public dialog: MatDialog,
    private fb: FormBuilder,
    private locationService: LocationService,
    public manageService: ManageService,
  ) {
    this.addBillingAccountForm = fb.group({
      customerAccountId: new FormControl('', [Validators.required]),
      vendorAccountId: new FormControl('', [Validators.required]),
      remitAddressId: new FormControl('', [Validators.required]),
      addressLine1: new FormControl(''),
      addressLine2: new FormControl(''),
      city: new FormControl(''),
      stateID: new FormControl(''),
      TEM: new FormControl(''),
      postalCode: new FormControl(''),
      countryID: new FormControl(''),
      active: new FormControl(true),
      currencyId: new FormControl(null),
      invoiceStartDate: new FormControl(''),
      payableAccountNumber: new FormControl('', [Validators.required]),
      invoiceBillDay: new FormControl('', [Validators.required]),
      invoiceFrequencyId: new FormControl('', [Validators.required]),
      billedAddressChanged: new FormControl(false, [Validators.required]),
      // remitAddressesId: new FormControl('', [Validators.required]),
      payByDay: new FormControl('', [Validators.required]),
      parentBillingAccountHierarchyId: new FormControl(null, [Validators.required]),
      isMainAccountBeingAdd: new FormControl(true, [Validators.required]),
      isPayableAccount: new FormControl(true, [Validators.required]),
      IsUpdateToPayableAccount: new FormControl(false, [Validators.required]),
      billingAccountHierarchyId: new FormControl(null),
      IsUpdateToCustomerAccount: new FormControl(false, [Validators.required]),
      IsUpdateToVendorAccount: new FormControl(false, [Validators.required]),
      // PayableVendorAccountId: new FormControl(null, [Validators.required]),
      PayableVendorName: new FormControl(null, [Validators.required]),
      BillingAccountStatusId: new FormControl(null, [Validators.required]),
      ProcessingBilling: new FormControl(false, [Validators.required]),
      InvoiceDisconnectionDate: new FormControl(null)
    });

    this.getCountry();
    this.getCurrencies();
    this.getInvoicefrequencies();

    this.cols = [
      { field: 'type', header: 'Type' },
      { field: 'accountNumber ', header: 'Account Number' },
      { field: 'accountStatus', header: 'Account Status' },
      { field: 'processBilling', header: 'Process Billing' },
      { field: 'payable', header: 'Payable' }
    ];
  }

  getInvoicefrequencies() {
    this.locationService.getInvoicefrequencies().pipe(takeUntil(this._unsubscribeAll)).subscribe((data) => {
      if (data && data.$values) {
        this.invoicefrequenciesList = data.$values;
        if(this.action === 'add') {
          const selectedItem = this.invoicefrequenciesList.find((item: any) => item.DisplayName.trim() === "Monthly") as any;
          if (selectedItem) {
              this.setValueInFormControl('invoiceFrequencyId', isValueExist(selectedItem.Id));
          }
        }
      }
    });
  }

  getCurrencies() {
    this.locationService
      .getCurrencies()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((data) => {
        if (data && data.$values) {
          this.currenciesList = data.$values;
          const foundIdx = this.currenciesList.findIndex(
            (el: any) => el.CurrencyCode == 'USD'
          );
          let currenyItem: any = this.currenciesList[foundIdx];
          this.currenciesList.splice(foundIdx, 1);
          this.currenciesList = _.cloneDeep(this.currenciesList);
          this.currenciesList.unshift(currenyItem);
          this.currenciesList.map((c: any) => {
            let a: any = {};
            a = c;
            a['label'] = c['CurrencyCode'] + '/' + c['Name'] + '/' + c['Symbol'];
            return a;
          });

        }
      });
  }

  getCountry() {
    this.locationService
      .getCountries()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((data) => {
        if (data && data.$values) {
          this.CountriesList = data.$values;
          this.CountriesList.filter((country: any) => {
            if (country.Abbreviation == 'US') {
              this.setValueInFormControl('countryID', Number(country.Id));
              this.onCountryChange(country.Id);
            }
          });
        }
      });
  }

  clickToMainAccountRadio(bool: any) {
    this.isSubAccount = bool;
    this.dynamicValidation(bool);
    this.mainPayableDisabled = !bool;

    this.payableVendorDisabled = false;
    if (this.action === 'add') {
      if (!bool) {
        this.setValueInFormControl('isPayableAccount', false);
      }

      if (bool) {
        this.payableVendorDisabled = false;
      } else {
        this.payableVendorDisabled = true;
      }

    }

  }

  onChangeStatus(data: any) {
    if (data.value == 30) {
      this.disconnectionDateReq = true;
      this.addBillingAccountForm.get('InvoiceDisconnectionDate')?.setValidators([Validators.required]);
      this.form.get('InvoiceDisconnectionDate')?.updateValueAndValidity();
    } else {
      this.disconnectionDateReq = false;
      this.addBillingAccountForm.get('InvoiceDisconnectionDate')?.setValidators([]);
      this.form.get('InvoiceDisconnectionDate')?.updateValueAndValidity();
      this.f['InvoiceDisconnectionDate'].setValue('');
    }
  }

  dynamicValidation(bool: any, data?: any) {
    if (!bool) {
      this.form.get('parentBillingAccountHierarchyId')?.setValidators([Validators.required]);
      this.form.get('parentBillingAccountHierarchyId')?.updateValueAndValidity();
    } else {
      this.form.get('parentBillingAccountHierarchyId')?.clearValidators();
      this.setValueInFormControl('parentBillingAccountHierarchyId', null);
      this.form.get('parentBillingAccountHierarchyId')?.updateValueAndValidity();
    }
    if (!bool) {
      this.getMainBillingAccountDD(data);
    } else if (this.action === 'edit') {
      this.getIsAnyPayableBillingAcc(this.billingAccountData);
    }
  }

  setValidationForMainAccountNumber() {
    if (this.action === 'edit') {
      this.mainAccountDDReqired = false;
      this.form.get('parentBillingAccountHierarchyId')?.setValidators([]);
      this.form.get('parentBillingAccountHierarchyId')?.updateValueAndValidity();
    } else {
      this.mainAccountDDReqired = true;
    }
  }

  ngOnInit(): void {
    for (let i = 1; i <= 31; i++) {
      this.days.push({ Id: i, value: i, stringValue: i.toString() });
    }
    this.isSuperTEMManager = this.locationService.isUserHasSuperTEMManagerRole();
    this.isUserHasSuperTEMUsersRole = this.locationService.isUserHasSuperTEMUsersRole();
    this.isSuperTEMAdmin = this.locationService.isUserHasSuperTEMAdminRole();
    this.isUserHasTEMUsersRole = this.locationService.isUserHasTEMUsersRole();
    this.isSuperTEMUser = this.locationService.isUserHasSuperTEMUserRole();
    this.isCompanyUser = this.locationService.isUserCompanyUser();

    this.isTEMUser = this.locationService.isUserHasTEMUserRole();
    this.isAllowAccess = rolePermission(['SuperTEMAdmin', 'TEMAdmin', 'SuperTEMManager']);
    this.viewNEditAccount = rolePermission(['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser']);

    if (!this.viewNEditAccount) {
      this.addBillingAccountForm.disable();
    }
    this.filterVendorGridByTEMId();

    if (this.action === 'add') {
      this.clickToMainAccountRadio(true);
      this.setValueInFormControl('TEM', isValueExist(this.selectedTem !== 'all' ? Number(this.selectedTem) : ''));
      this.filterCustomerGridByTEMId();
    }

    if (this.billingAccountData) {
      if (this.isCompanyUser || this.isTEMUser || !this.viewNEditAccount) {
        this.form.disable();
        this.setIsReadOnly = true;
      }
      if (this.action === 'edit') {
        this.getBillingAccountRecord();
      } else {
        this.setDataWithoutId(this.billingAccountData);
        this.filterCustomerGridByTEMId();
        this.getRemitaddresses();
      }
    } else {
      this.filterCustomerGridByTEMId();
      this.getRemitaddresses();
    }
    this.getTemLists();
    this.billingAccountStatus();
  }

  getBillingAccountRecord() {
    let BillingAccountId =
      this.billingAccountData.BillingAccountID || this.billingAccountData.Id || this.billingAccountData.BillingAccountId ||
      this.billingAccountData.BillingAccountHierarchyId;
    this.locationService
      .getBillingAccountsDetails(BillingAccountId)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((data) => {
        if (data) {
          this.billingAccountData = data.Data;
          this.setValueInFormControl('vendorAccountId', isValueExist(this.billingAccountData.VendorAccountId));
          this.getProcessBilling();
          this.setData(this.billingAccountData);
          this.getRemitaddresses();
          this.filterCustomerGridByTEMId();
        }
      });
  }
  setDataWithoutId(data: any) {
    this.setValueInFormControl('TEM', isValueExist(data.TEM));
    this.setValueInFormControl('city', isValueExist(data.city));
    this.setValueInFormControl('active', isValueExist(data.active));
    this.setValueInFormControl('stateID', isValueExist(data.stateID));
    this.setValueInFormControl('payByDay', isValueExist(data.payByDay));
    this.setValueInFormControl('countryID', isValueExist(Number(data.countryID)));
    this.setValueInFormControl('currencyId', isValueExist(data.currencyId, true));
    this.setValueInFormControl('postalCode', isValueExist(data.postalCode));
    this.setValueInFormControl('addressLine1', isValueExist(data.addressLine1));
    this.setValueInFormControl('addressLine2', isValueExist(data.addressLine2));
    this.setValueInFormControl('invoiceBillDay', isValueExist(data.invoiceBillDay));
    this.setValueInFormControl('vendorAccountId', isValueExist(data.vendorAccountId));
    this.setValueInFormControl('isPayableAccount', isValueExist(data.isPayableAccount));
    this.setValueInFormControl('remitAddressId', isValueExist(data.remitAddressId));
    this.setValueInFormControl('customerAccountId', isValueExist(data.customerAccountId));
    this.setValueInFormControl('invoiceFrequencyId', isValueExist(data.invoiceFrequencyId));
    this.setValueInFormControl('payableAccountNumber', isValueExist(data.payableAccountNumber));
    this.setValueInFormControl('billedAddressChanged', isValueExist(data.billedAddressChanged));
    this.setValueInFormControl('BillingAccountStatusId', isValueExist(data.BillingAccountStatusId));
    this.setValueInFormControl('ProcessingBilling', isValueExist(data.ProcessingBilling));
    if (data?.ProcessingBilling) {
      this.invoiceStartDateReq = true;
    } else {
      this.invoiceStartDateReq = false;
    }
    this.setValueInFormControl('isMainAccountBeingAdd', isValueExist(data.isMainAccountBeingAdd));
    this.clickToMainAccountRadio(data.isMainAccountBeingAdd);
    this.setValueInFormControl('IsUpdateToPayableAccount', isValueExist(data.IsUpdateToPayableAccount));
    this.setValueInFormControl('billingAccountHierarchyId', isValueExist(data.billingAccountHierarchyId));
    this.setValueInFormControl('parentBillingAccountHierarchyId', isValueExist(data.parentBillingAccountHierarchyId));
    this.setValueInFormControl('invoiceStartDate', data.InvoiceStartDate ? isValueExist(this.manageService.convertDate(data.InvoiceStartDate, '', '/')) : '');
    this.setValueInFormControl('InvoiceDisconnectionDate', data.InvoiceDisconnectionDate ? isValueExist(this.manageService.convertDate(data.InvoiceDisconnectionDate, '', '/')) : '');
    // this.setValueInFormControl('PayableVendorAccountId', isValueExist(data.PayableVendorAccountId));
    this.setValueInFormControl('PayableVendorName', isValueExist(data.PayableVendorAccountName));
    this.onChangeStartDate(data.InvoiceStartDate);
    this.dynamicValidation(this.f['isMainAccountBeingAdd'].value, data);
  }
  setData(data: any) {
    this.varPayableAccount = data.PayableAccount;
    this.mainPayableDisabled = !data.IsMainBillingAccount;
    this.invoiceAttachDisabled = data.IsSandboxInvoiceAttached || data.IsInvoiceAttached ? true : false;
    this.setValueInFormControl('active', isValueExist(data.Status));
    this.setValueInFormControl('TEM', isValueExist(data.TEMAccountId));
    this.setValueInFormControl('payByDay', isValueExist(data.PayByDays ? data.PayByDays.toString() : ''));
    this.setValueInFormControl('currencyId', isValueExist(data.CurrencyId, true));
    this.setValueInFormControl('remitAddressId', isValueExist(data.RemitAddressId));
    this.setValueInFormControl('invoiceBillDay', isValueExist(data.InvoiceBillDay));
    this.setValueInFormControl('isPayableAccount', isValueExist(data.PayableAccount));
    this.setValueInFormControl('payableAccountNumber', isValueExist(data.AccountNumber));
    this.setValueInFormControl('invoiceFrequencyId', isValueExist(data.InvoiceFrequencyID));
    this.setValueInFormControl('isMainAccountBeingAdd', isValueExist(data.IsMainBillingAccount));
    this.clickToMainAccountRadio(data.IsMainBillingAccount);
    this.setValueInFormControl('billedAddressChanged', isValueExist(data.BilledAddressChangedValue));
    this.setValueInFormControl('BillingAccountStatusId', isValueExist(data.BillingAccountStatusId));
    this.setValueInFormControl('ProcessingBilling', isValueExist(data.ProcessingBilling));
    if (data?.ProcessingBilling) {
      this.invoiceStartDateReq = true;
    } else {
      this.invoiceStartDateReq = false;
    }
    this.setValueInFormControl('invoiceStartDate', data.InvoiceStartDate ? isValueExist(this.manageService.convertDate(data.InvoiceStartDate, '', '/')) : '');
    this.setValueInFormControl('InvoiceDisconnectionDate', data.InvoiceDisconnectionDate ? isValueExist(this.manageService.convertDate(data.InvoiceDisconnectionDate, '', '/')) : '');
    this.dynamicValidation(this.f['isMainAccountBeingAdd'].value, data);
    this.onChangeStartDate(data.InvoiceStartDate);
    // this.setValueInFormControl('PayableVendorAccountId', isValueExist(data.PayableVendorAccountId));
    this.setValueInFormControl('PayableVendorName', isValueExist(data.PayableVendorAccountName));


    if (this.f['isMainAccountBeingAdd'].value === false && this.f['isPayableAccount'].value === false) {
      this.payableVendorDisabled = true;
    }

    if (this.f['isMainAccountBeingAdd'].value === false && this.f['isPayableAccount'].value === true) {
      this.payableVendorDisabled = false;
    }
  }
  billingAccountStatus() {
    this.statusList = [];
    this._unsubscribeBillingStatus.next(null);
    this.locationService.getBillingAccountStatus().pipe(takeUntil(this._unsubscribeBillingStatus))
      .subscribe((data: any) => {
        if (data.Data.$values) {
          this.statusList = data.Data.$values;
          if(this.action === 'add') {
             const selectedItem = this.statusList.find((item: any) => item.DisplayText.trim() === "Active");
            if (selectedItem) {
                this.setValueInFormControl('BillingAccountStatusId', isValueExist(selectedItem.Id));
            }
          }
        }
      });
  }

  onChangeProcessBilling($event: any) {
    if ($event?.value == true) {
      this.invoiceStartDateReq = true;
      this.addBillingAccountForm.get('invoiceStartDate')?.setValidators([Validators.required]);
    } else {
      this.invoiceStartDateReq = false;
      this.addBillingAccountForm.get('invoiceStartDate')?.setValidators([]);
    }
    this.addBillingAccountForm.get('invoiceStartDate')?.updateValueAndValidity();
  }

  getProcessBilling() {
    this._unsubscribeParentChild.next(null);
    let data = {
      billingAccountHierarchyId: this.billingAccountData.BillingAccountHierarchyId
    }
    this.tableData = [];
    this.locationService.getProcessBillingData(data).pipe(takeUntil(this._unsubscribeParentChild))
      .subscribe((data: any) => {
        this.tableData = data.Data.$values;
      });
  }

  getTemLists() {
    this.locationService
      .getTEMLoggedInUserDropDown()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((data) => {
        if (data && data.$values) {
          this.tems = data.$values;
        }
      });
  }

  setTemDDId() {
    if (this.f['customerAccountId'].value) {
      this.setValueInFormControl('TEM', _.cloneDeep(
        this.customerList.find(
          (data: any) => data.Id == this.f['customerAccountId'].value
        ).TemAccountID
      ));
    }
  }

  getMainBillingAccountDD(data?: any, callFromPayableAPI = false) {
    let updatedBillData = data ? data : this.billingAccountData;


    let KeyString = this.f['customerAccountId'].value ? `?customerId=${this.f['customerAccountId'].value}` : '';

    if (this.f['vendorAccountId'].value) {
      const vendorParam = `VendorId=${this.f['vendorAccountId'].value}`;
      KeyString += KeyString === '' ? `?${vendorParam}` : `&${vendorParam}`;

    }

    if (updatedBillData && updatedBillData.BillingAccountHierarchyId) {
      if (updatedBillData.BillingAccountHierarchyId) {
        const billingParam = `billingAccountHierarchyId=${updatedBillData.BillingAccountHierarchyId}`;
        KeyString += KeyString === '' ? `?${billingParam}` : `&${billingParam}`;

      }
    }



    this._unsubscribeAllCustomerVendor.next(null);
    this.locationService
      .mainBillingAccountsDD(KeyString)
      .pipe(takeUntil(this._unsubscribeAllCustomerVendor))
      .subscribe((data) => {
        if (data && data.Data.$values) {
          this.MainBillingAccountDD = data.Data.$values;

          if (
            updatedBillData &&
            this.billingAccountData.ParentBillingAccountHierarchyId
          ) {

            setTimeout(() => {
              let findMainBillId = '';
              findMainBillId = this.MainBillingAccountDD.find((a: any) => {
                return (
                  a.Id === this.billingAccountData.ParentBillingAccountHierarchyId
                );
              });
              if (findMainBillId) {
                this.setValueInFormControl('parentBillingAccountHierarchyId', isValueExist(this.billingAccountData.ParentBillingAccountHierarchyId));
                this.getIsAnyPayableBillingAcc(updatedBillData, callFromPayableAPI);                
              } else {
                this.setValueInFormControl('parentBillingAccountHierarchyId', null);
              }
              this.form.get('parentBillingAccountHierarchyId')?.updateValueAndValidity();
            }, 50);
          } else {
            this.getIsAnyPayableBillingAcc(updatedBillData, callFromPayableAPI);
          }
        }
      });
  }


  vendoraccountsDetailWithId() {
    if (this.billingAccountData && this.billingAccountData.PayByDays) {
      this.oldPayByDays = _.cloneDeep(this.billingAccountData.PayByDays);
    }

    this.locationService.vendoraccountsDetailWithId(this.f['vendorAccountId'].value).subscribe((data) => {
      this.vendoraccountsDetail = data.Data.PayByDays;
      this.setValueInFormControl('payByDay', isValueExist(data.Data.PayByDays ? data.Data.PayByDays.toString() : ''));
    });

    if (this.action === 'add') {
      this.getVendoraccountsDetails(this.f['vendorAccountId'].value);
    }
  }

  getVendoraccountsDetails(id: any) {
    this.locationService.getVendoraccountsDetails(id).subscribe((data) => {
      if (data.Data && data?.Data?.SavedInvoiceAndDataRetrieval) {
        this.isShowPastDateDialog = true;
      } else {
        this.isShowPastDateDialog = false;
      }
    });
  }

  onCustomerSelect($event: any) {
    const data1 = this.customerList.find((res: any) => res.Id === $event.value);
    this.setTemDDValue = data1.TemAccountID;
    this.setTemDDValueEvent.emit(this.setTemDDValue);
  }

  filterVendorGridByTEMId() {
    this.vendorsList = [];
    this._unsubscribeVendor.next(null);
    this.locationService
      .getVendorDropdown()
      .pipe(takeUntil(this._unsubscribeVendor))
      .subscribe({
        next: (data) => {
          if (data && data.Data.$values) {
            this.vendorsList = data.Data.$values;
            if (
              this.billingAccountData &&
              this.billingAccountData.VendorAccountId
            ) {
              this.setValueInFormControl('vendorAccountId', isValueExist(this.billingAccountData.VendorAccountId));
              // this.setValueInFormControl('PayableVendorAccountId', isValueExist(this.billingAccountData.PayableVendorAccountId));
              this.setValueInFormControl('PayableVendorName', isValueExist(this.billingAccountData?.PayableVendorAccountName));
              if (this.f['isMainAccountBeingAdd'].value === false) {
                this.getMainBillingAccountDD(data);
              } else if (this.action === 'edit') {
                this.getIsAnyPayableBillingAcc(this.billingAccountData);
              }

              const vendorID = this.form.value.vendorAccountId;
              if (vendorID) {
                let result = this.vendorsList.find((n: any) => {
                  if (n.Id === vendorID) {
                    return n;
                  }
                })
                if (!result) {
                  this.setValueInFormControl('vendorAccountId', '');
                }
              }
            }

            let error: any = {};
            this.setError(error);
          }
        },
        error: (error) => { },
      });
  }

  setError(error: any) {
    if (this.customerList.length === 0 && this.vendorsList.length === 0) {
      error.message = 'No customer and vendor found within the selected TEM';
      error.status = 111;
      this.errorPopup(error);
    } else if (this.customerList.length > 0 && this.vendorsList.length === 0) {
      error.message = 'No vendor found within the selected TEM';
      error.status = 111;
      this.errorPopup(error);
    }
  }

  errorPopup(error: any) {
    let errorData: any = {
      messgeType: 'error',
      title: 'Attention',
      titleClass: 'text-c-blue',
      icon: 'fas fa-exclamation-circle',
      iconClass: 'text-c-blue f-70',
    };

    if (error.status === 111) {
      errorData.message = error.message;
    }
    if (error.status === 400) {
      errorData.message = 'Bad request please try again later ';
    } else if (error.status === 401) {
      errorData.message = error.error.ErrorMessage;
    }
    const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
      panelClass: 'error-warning',
      data: errorData,
    });
    dialogRef.afterClosed().subscribe(() => { });
  }

  filterCustomerGridByTEMId(editFromHtml = false) {
    this.customerList = [];
    if (editFromHtml) {
      this.setValueInFormControl('customerAccountId', '');
    }
    if (this.form.value.TEM) {
      this.customerListLoading = true;
      this._unsubscribeCustomer.next(null);
      this.locationService.getCustomerDropdownByNewTEM(this.form.value.TEM)
        .pipe(takeUntil(this._unsubscribeCustomer))
        .subscribe({
          next: (data) => {
            if (data && data.Data.$values) {
              this.customerList = data.Data.$values;
              this.customerListLoading = false;

              const data1 = this.customerList.find((res: any) => res.Id === this.billingAccountData.CustomerAccountId);
              this.setTemDDValue = data1.TemAccountID;
              this.setTemDDValueEvent.emit(this.setTemDDValue);

              if (
                this.billingAccountData &&
                this.billingAccountData.CustomerAccountId
              ) {
                if (editFromHtml) {
                  this.setValueInFormControl('customerAccountId', '');
                } else {
                  this.setValueInFormControl('customerAccountId', this.billingAccountData.CustomerAccountId);
                }
                if (this.f['isMainAccountBeingAdd'].value === false) {
                  this.getMainBillingAccountDD(this.billingAccountData);
                } else if (this.action === 'edit') {
                  this.getIsAnyPayableBillingAcc(this.billingAccountData);
                }
              }
            } else {
              this.customerListLoading = false;
              this.customerList = [];
            }
          },
          error: (error) => {
            this.customerListLoading = false;
            this.customerList = [];
            if (
              this.customerList.length === 0 &&
              this.vendorsList.length > 0 &&
              this.form.value.TEM
            ) {
              error.message = 'No customer found within the selected TEM';
              error.status = 111;
              this.errorPopup(error);
            }
            if (editFromHtml) {
              this.setValueInFormControl('customerAccountId', '');
            }
          },
        });
    } else {
      this.customerListLoading = true;
      this._unsubscribeCustomer.next(null);
      this.locationService
        .getCustomerDropDown()
        .pipe(takeUntil(this._unsubscribeCustomer))
        .subscribe({
          next: (data) => {
            if (data && data.$values) {
              this.customerList = data.$values;
              this.customerListLoading = false;
              const data1 = this.customerList.find((res: any) => res.Id === this.billingAccountData && this.billingAccountData.CustomerAccountId);
              this.setTemDDValue = data1 && data1.TemAccountID;
              this.setTemDDValueEvent.emit(this.setTemDDValue);

              if (
                this.billingAccountData &&
                this.billingAccountData.CustomerAccountId
              ) {
                this.setValueInFormControl('customerAccountId', this.billingAccountData.CustomerAccountId);
                if (this.f['isMainAccountBeingAdd'].value === false) {
                  this.getMainBillingAccountDD(this.billingAccountData);
                } else if (this.action === 'edit') {
                  this.getIsAnyPayableBillingAcc(this.billingAccountData);
                }
              }
            } else {
              this.customerListLoading = false;
              this.customerList = [];
            }
          },
          error: (error) => {
            this.customerListLoading = false;
            this.customerList = [];
          },
        });
    }
  }

  counter(i: number) {
    return new Array(i);
  }

  openNewAddressDialog() {
    const dialogRef = this.dialog.open(AddNewAddressDialogComponent, {
      panelClass: 'width-665',
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (!isValuesUndefined(result)) {
        if (result) {
          this.setValueInFormControl('billedAddressChanged', result);
          this.getRemitaddresses();
        }
      }
    });
  }

  AccountDialog() {
    let BillingAccountId =
      this.billingAccountData.BillingAccountID || this.billingAccountData.Id || this.billingAccountData.BillingAccountId ||
      this.billingAccountData.BillingAccountHierarchyId;

    const dialogRef = this.dialog.open(AccoutNoteDialogComponent, {
      panelClass: 'width-900',
      disableClose: true,
      // data: this.billingAccountData
      data: BillingAccountId
    });
  }

  get f() {
    return this.addBillingAccountForm.controls;
  }

  get form() {
    return this.addBillingAccountForm;
  }
  getRemitaddresses() {
    this.locationService
      .getRemitaddressesDD()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((data) => {
        if (data && data.$values) {
          this.remitAddressesList = JSON.parse(
            JSON.stringify(data.$values).replace(/\:null/gi, ':""')
          );
          this.remitAddressesList.map((c: any) => {
            let a: any = {};
            a = c;
            a['label'] = c['Line1'] + ' ' + c['Line2'] + ' ' + c['Line3'] + c['City'] + ' ' + c['State']['Name'] + ' ' + c['PostalCode'];
            return a;
          });
          if (
            this.billingAccountData &&
            (this.billingAccountData.RemitAddressId ||
              this.billingAccountData.remitAddressId)
          ) {
            const id =
              this.billingAccountData.RemitAddressId ||
              this.billingAccountData.remitAddressId
            this.onChangeRemitAddress(id.toString());
          }
        }
      });
  }
  addBillingAccount() {
    this.submitted = true;
    // this.form.get('remitAddressId')?.clearValidators();
    // this.form.get('remitAddressId')?.updateValueAndValidity();
    if (this.action === 'add') {
      delete this.form.value.InvoiceDisconnectionDate;
    }
    if (this.form.valid) {
      if (this.form.value.invoiceStartDate) {
        this.compareDates(_.cloneDeep(this.onselectSetDate(new Date(), '-')), _.cloneDeep(this.onselectSetDate(this.form.value.invoiceStartDate, '-')), 'add')
      } else {
        if (this.action === 'add') {
          if(this.f['ProcessingBilling'].value == false) {
            let errorData: any = {
              messgeType: 'error',
              closeBtnName: `Change It!`,
              okBtnName: 'Opps! Don’t change it!',
              title: 'Attention',
              titleClass: 'text-c-blue',
              icon: 'fas fa-question-circle',
              iconClass: 'text-c-blue f-70',
              message: `This account is not configured to process billing. Would you like to change the status to 'Process Billing'?`,
              removeLink: true
            };
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
              panelClass: 'error-warning',
              data: errorData,
            });
            dialogRef.afterClosed().subscribe((result) => {
              if (!isValuesUndefined(result)) {
                if(!result) {
                  this.setValueInFormControl('ProcessingBilling', true);
                  this.addBillingFn();
                }
              }
            });
          } else {
            this.addBillingFn();
          }
         
        } else {
          this.updateBillFn();
        }
      }
    }
  }
  addBillingFn(createPastInvoiceRetrievals = false) {
    this.saveButtonLoadder = true;
    delete this.form.value.addressLine1;
    delete this.form.value.addressLine2;
    delete this.form.value.city;
    delete this.form.value.stateID;
    delete this.form.value.postalCode;
    delete this.form.value.countryID;
    delete this.form.value.remitAddressesId;

    this.form.value.active =
      this.form.value.active ||
        this.form.value.active == 'true'
        ? true
        : false;

    if (this.f['isMainAccountBeingAdd'].value === false) {
      this.getIsAnyPayableBillingAcc().then((value) => {
        this.addBillingAccountFn(createPastInvoiceRetrievals);
      });
    } else {
      this.addBillingAccountFn(createPastInvoiceRetrievals);
    }
  }
  updateBillFn(createPastInvoiceRetrievals = false) {
    // this.saveButtonLoadder = true;
    delete this.form.value.addressLine1;
    delete this.form.value.addressLine2;
    delete this.form.value.city;
    delete this.form.value.stateID;
    delete this.form.value.postalCode;
    delete this.form.value.countryID;
    delete this.form.value.remitAddressesId;
    this.confirmPopupForChangeCustomer().then((customerChanged) => {
      this.confirmPopupForChangeVendor().then((vendorChanged) => {
        this.confirmPopupForChangeMainAccount().then((mainAccChanged) => {
          if (mainAccChanged) {
            this.confirmPopupForChangePayble().then((payableChanged) => {
              if (this.f['isMainAccountBeingAdd'].value === false) {
                this.getIsAnyPayableBillingAcc().then((isPayable) => {
                  this.updateBillingAccount(createPastInvoiceRetrievals);
                });
              } else {
                this.updateBillingAccount(createPastInvoiceRetrievals);
              }
            });
          } else {
            this.getIsAnyPayableBillingAcc().then((isPayable1) => {
              this.confirmPopupForChangePayble().then((payableChanged) => {
                if (this.f['isMainAccountBeingAdd'].value === false) {
                  this.getIsAnyPayableBillingAcc().then((isPayable2) => {
                    this.updateBillingAccount(createPastInvoiceRetrievals);
                  });
                } else {
                  this.updateBillingAccount(createPastInvoiceRetrievals);
                }
              });
            });
          }
        });
      });
    });
  }
  onCountryChange(contryID: any) {
    this._unsubscribeCountry.next(null);
    this.locationService
      .getStateDetails(contryID)
      .pipe(takeUntil(this._unsubscribeCountry))
      .subscribe((data) => {
        if (data && data.States.$values) {
          this.stateList = data.States.$values;
        }
      });
  }

  async editBillingAccount() {
    if (this.billingAccountData.InvoiceBillDay != this.form.value.invoiceBillDay ||
      this.billingAccountData.PayByDays != this.form.value.payByDay
    ) {
      let errorData: any = {
        messgeType: 'error',
        closeBtnName: `Yes, this is correct! Update away!`,
        okBtnName: 'Close & Review',
        title: 'Attention',
        titleClass: 'text-c-blue',
        icon: 'fas fa-question-circle',
        iconClass: 'text-c-blue f-70',
        message: `You have made a change that affects existing Invoice & Data Retrievals.  We need to update any open records with your change.  Do you want to proceed?`,
        removeLink: true
      };
      const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
        panelClass: 'error-warning',
        data: errorData,
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (!isValuesUndefined(result)) {
          if (!result) {
            this.setValueInFormControl('invoiceBillDay', this.form.value.invoiceBillDay);
            this.setValueInFormControl('payByDay', this.form.value.payByDay);
            this.updateBillAccount();
          }
        }
      });
    } else {
      this.updateBillAccount();
    }
  }

  updateBillAccount() {
    this.form.value.active = this.form.value.active || this.form.value.active == 'true' ? true : false;
    this.submitted = true;
    if (
      this.billingAccountData &&
      this.billingAccountData.BillingAccountHierarchyId
    ) {
      this.setValueInFormControl('billingAccountHierarchyId', this.billingAccountData.BillingAccountHierarchyId);
    }

    if (!checkIsValueExists(this.f['payByDay'].value)) {
      this.setValueInFormControl('payByDay', null);
    }
    if (!checkIsValueExists(this.f['currencyId'].value)) {
      this.setValueInFormControl('currencyId', null);
    }
    if (this.form.valid) {
      if (this.form.value.invoiceStartDate) {
        this.compareDates(_.cloneDeep(this.onselectSetDate(new Date(), '-')),
          _.cloneDeep(this.onselectSetDate(this.form.value.invoiceStartDate, '-')), 'edit')
      } else {
        this.updateBillFn();
      }

    }
  }
  compareDates = (d1: any, d2: any, formType: any) => {
    let date1 = new Date(d1).getTime();
    let date2 = new Date(d2).getTime();

    if (!this.f['ProcessingBilling'].value && this.billingAccountData?.ProcessingBilling !== this.f['ProcessingBilling'].value && this.action === 'edit') {
      let errorData: any = {
        messgeType: 'error',
        title: 'Attention',
        titleClass: 'text-c-blue',
        icon: 'fas fa-exclamation-circle',
        iconClass: 'text-c-blue f-70',
        closeBtnName: 'Remove Retrievals',
        okBtnName: 'Close & Review',
        message: 'You have opted not to process Invoices anymore in the system.  Would you like to remove All the open Retrieval records from the system for this account?',
        removeLink: true
      };
      const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
        panelClass: 'error-warning',
        data: errorData,
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (!isValuesUndefined(result)) {
          if (!_.cloneDeep(result)) {
            if (formType === 'add') {
              this.addBillingFn(true);
            } else {
              this.RemoveInvoiceRetrievals = true;
              this.updateBillFn(false);
            }
          } else {
            // if (formType === 'add') {
            //   this.addBillingFn(false);
            // } else {
            //   this.updateBillFn(false);
            // }
          }
        }
      });
    } else if (date1 > date2 && (this.billingAccountData?.AskToCreatePastRetrieval || this.isShowPastDateDialog) && this.f['ProcessingBilling'].value && this.f['isPayableAccount'].value) {
      let errorData: any = {
        messgeType: 'error',
        title: 'Attention',
        titleClass: 'text-c-blue',
        icon: 'fas fa-exclamation-circle',
        iconClass: 'text-c-blue f-70',
        closeBtnName: 'Please create them!',
        okBtnName: 'Do not create',
        message: 'Would you like to create Invoice & Data Retrieval records for dates that have passed? ',
        removeLink: true
      };
      const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
        panelClass: 'error-warning',
        data: errorData,
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (!isValuesUndefined(result)) {
          if (!_.cloneDeep(result)) {
            if (formType === 'add') {
              this.addBillingFn(true);
            } else {
              this.updateBillFn(true);
            }
          } else {
            if (formType === 'add') {
              this.addBillingFn(false);
            } else {
              this.updateBillFn(false);
            }
          }
        }
      });
    } else {
      if (formType === 'add') {
        this.addBillingFn();
      } else {
        this.updateBillFn();
      }
    }
  };
  confirmPopupForChangePayble() {
    return new Promise((resolve) => {
      let res = false;
      if (
        this.f['isMainAccountBeingAdd'].value === true &&
        (this.billingAccountData.PayableAccount !==
          this.f['isPayableAccount'].value ||
          this.varPayableAccount !== this.f['isPayableAccount'].value)
      ) {
        this.saveButtonLoadder = false;

        let errorData: any = {
          messgeType: 'error',
          closeBtnName: 'Do not update the Payable Account',
          okBtnName: 'Update the Payable Account',
          title: 'Attention',
          titleClass: 'text-c-blue',
          icon: 'fas fa-question-circle',
          iconClass: 'text-c-blue f-70',
          message:
            'Please confirm the change to the Payable Account.  By rule the system will update any associated Payable Account(s) and these will no longer be listed as Payable. ',
        };
        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
          panelClass: 'error-warning',
          data: errorData,
        });
        dialogRef.afterClosed().subscribe((result) => {
          this.payableChangeDetect = result;
          if (!isValuesUndefined(result)) {
            this.setValueInFormControl('IsUpdateToPayableAccount', result);
            res = result;
            resolve(res);
          }
        });
      } else {
        resolve(false);
      }
    });
  }

  confirmPopupForChangeMainAccount() {
    return new Promise((resolve) => {
      let res = false;
      if (
        this.billingAccountData.IsMainBillingAccount !==
        this.f['isMainAccountBeingAdd'].value
      ) {
        this.saveButtonLoadder = false;

        let errorData: any = {
          messgeType: 'error',
          closeBtnName: `Do not change`, //  the ${this.billingAccountData.IsMainBillingAccount ? 'Main ' : 'Sub '} Account
          okBtnName: 'Change it!',
          title: 'Attention',
          titleClass: 'text-c-blue',
          icon: 'fas fa-question-circle',
          iconClass: 'text-c-blue f-70',
          message: `Please confirm that you want to change this ${this.f['isMainAccountBeingAdd'].value
            ? 'Sub Account to a Main Account?'
            : 'Main Account to a Sub Account?'
            }`,
        };
        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
          panelClass: 'error-warning',
          data: errorData,
        });
        dialogRef.afterClosed().subscribe((result) => {
          this.mainAccChangeDetect = result;
          if (!isValuesUndefined(result)) {
            if (!result) {
              this.setValueInFormControl('isMainAccountBeingAdd', this.billingAccountData.IsMainBillingAccount);
              this.setValueInFormControl('parentBillingAccountHierarchyId', this.billingAccountData.ParentBillingAccountHierarchyId);
            }

            res = result;
            resolve(res);
          }
        });
      } else {
        resolve(true);
      }
    });
  }

  confirmPopupForChangeCustomer() {
    return new Promise((resolve) => {
      let res = false;
      if (
        this.f['isMainAccountBeingAdd'].value === true &&
        this.billingAccountData.CustomerAccountId !==
        this.f['customerAccountId'].value
      ) {
        this.saveButtonLoadder = false;
        let errorData: any = {
          messgeType: 'error',
          closeBtnName: 'Do not change the Customer',
          okBtnName: 'Change it!',
          title: 'Attention',
          titleClass: 'text-c-blue',
          icon: 'fas fa-question-circle',
          iconClass: 'text-c-blue f-70',
          message:
            'Please confirm that you want to change the Customer of record for this Account and any related Sub Accounts?',
          removeLink: true
        };
        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
          panelClass: 'error-warning',
          data: errorData,
        });
        dialogRef.afterClosed().subscribe((result) => {
          this.customerChangeDetect = result;
          if (!isValuesUndefined(result)) {
            this.setValueInFormControl('IsUpdateToCustomerAccount', result);
            res = result;
            resolve(res);
          }
        });
      } else {
        resolve(false);
      }
    });
  }

  confirmPopupForChangeVendor() {
    return new Promise((resolve) => {
      let res = false;

      if (
        this.f['isMainAccountBeingAdd'].value === true &&
        this.billingAccountData.VendorAccountId !== this.f['vendorAccountId'].value
      ) {
        this.saveButtonLoadder = false;
        let errorData: any = {
          messgeType: 'error',
          closeBtnName: 'Change it!',
          okBtnName: 'Do not change the Vendor',
          title: 'Attention',
          titleClass: 'text-c-blue',
          icon: 'fas fa-question-circle',
          iconClass: 'text-c-blue f-70',
          message:
            'Please confirm that you want to change the Vendor of record for this Account and any related Sub Accounts?',
          removeLink: true
        };
        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
          panelClass: 'error-warning',
          data: errorData,
        });
        dialogRef.afterClosed().subscribe((result) => {
          this.vendorChangeDetect = result;
          // if (!isValuesUndefined(result)) {
          if (result == false) {
            let d = true;
            this.setValueInFormControl('IsUpdateToVendorAccount', d);
            res = d;
            resolve(res);
          }
        });
      } else {
        resolve(false);
      }
    });
  }

  addBillingAccountFn(createPastInvoiceRetrievals = false) {
    delete this.form.value.billingAccountHierarchyId;
    this.form.value.invoiceStartDate = this.form.value.invoiceStartDate ? _.cloneDeep(this.onselectSetDate(this.form.value.invoiceStartDate, '-')) : null;
    this.form.value['createPastInvoiceRetrievals'] = createPastInvoiceRetrievals;
    if (!isValueExist(this.form.value.InvoiceDisconnectionDate)) {
      delete this.form.value.InvoiceDisconnectionDate;
    }
    this.locationService
      .addBillingAccount(_.cloneDeep(this.form.value))
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (data) => {
          if (data.Success) {
            if (data.Data.MissingInvoiceAndDataRetrievalData) {
              this.saveButtonLoadder = false;
              let errorData: any = {
                messgeType: 'error',
                title: 'Attention',
                titleClass: 'text-c-blue',
                icon: 'fas fa-question-circle',
                iconClass: 'text-c-blue f-70',
                closeBtnName: 'Ignore it, it’s fine!',
                okBtnName: 'Let me fill in the gaps!',
                message: 'Would you like to complete the required information to create the retrieval records? If not, the records will contain missing details.'
              };
              const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
                panelClass: 'error-warning',
                data: errorData,
              });

              dialogRef.afterClosed().subscribe((result) => {
                if (!isValuesUndefined(result)) {
                  if (result) {
                    this.billingAccountData = data.Data;
                    this.getBillingAccountRecord();
                    this.action = 'edit';
                    this.onSaveAndBackNext.emit(data.Data);
                    this.onSaveAndNext.emit(true)
                  } else {
                    this.successPopup(data);
                  }
                } else {
                  this.successPopup(data);
                }
              })
            } else {
              this.successPopup(data);
            }


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
        error: (error) => {
          this.saveButtonLoadder = false;
          let errorMessage: any = '';
          if (error.StatusCode === 400) {
            errorMessage = error.Message ? error.Message : 'Bad request';
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
        },
      });
  }

  successPopup(data: any) {
    this.saveButtonLoadder = false;
    let errorData: any = {
      messgeType: 'error',
      title: 'Attention',
      titleClass: 'text-c-blue',
      icon: 'fas fa-exclamation-circle',
      iconClass: 'text-c-blue f-70',
      message: 'Successfully saved', //if messges is multiple use array
    };
    const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
      panelClass: 'error-warning',
      data: errorData,
    });
    this.billingAccountData = data.Data;
    this.getBillingAccountRecord();
    dialogRef.afterClosed().subscribe(() => {
      this.action = 'edit';
      this.onSaveAndBackNext.emit(data.Data);
    });
  }
  setRemitData(remitId: any, selectedAddress: any, manually = false) {
    this.setValueInFormControl('remitAddressId', Number(remitId));
    this.setValueInFormControl('city', selectedAddress?.City);
    this.setValueInFormControl('stateID', selectedAddress?.State.Id);
    this.setValueInFormControl('addressLine1', selectedAddress?.Line1);
    this.setValueInFormControl('addressLine2', selectedAddress?.Line2);
    this.setValueInFormControl('postalCode', selectedAddress?.PostalCode);
    this.setValueInFormControl('countryID', Number(selectedAddress?.State.Country.Id));
    this.isManually = manually;
    if (this.isManually) {
      this.remitAddId = remitId;
      this.payableVendorId = this.f['PayableVendorName'].value;
    }
  }

  onChangeRemitAddress(remitId: any, manually = false) {

    if (remitId) {
      let selectedAddress = this.remitAddressesList.find(
        (remitAdd: any) => remitAdd.Id == remitId
      );
      setTimeout(() => {
        if (this.f['countryID'].value !== Number(selectedAddress?.State.Country.Id)) {
          this.onCountryChange(selectedAddress?.State.Country.Id);
        }
        this.setRemitData(remitId, selectedAddress, manually);
      }, 100);
    } else {
      this.setValueInFormControl('city', null);
      this.setValueInFormControl('stateID', null);
      this.setValueInFormControl('countryID', null);
      this.setValueInFormControl('postalCode', null);
      this.setValueInFormControl('addressLine1', null);
      this.setValueInFormControl('addressLine2', null);
      this.setValueInFormControl('remitAddressId', null);
    }
  }

  checkValidDate() {
    if (!this.f['invoiceStartDate'].value)
      this.setValueInFormControl('invoiceStartDate', '');
  }

  updateBillingAccount(createPastInvoiceRetrievals: any) {


    // this.saveButtonLoadder = true;
    if (this.form.value.parentBillingAccountHierarchyId) {
      this.setValueInFormControl('isMainAccountBeingAdd', false);
    } else {
      this.setValueInFormControl('isMainAccountBeingAdd', true);
    }

    if(this.form.value.payableAccountNumber != this.billingAccountData?.AccountNumber){
      let errorData: any = {
        messgeType: "error",
        title: "Attention",
        titleClass: "text-c-blue",
        icon: "fas fa-exclamation-circle",
        iconClass: "text-c-blue f-70",
        message: 'You are about to change the account number. This change will affect future reporting, inventory, and retrieval records. Please verify that the new account number matches the invoice before proceeding.',
        okBtnName: 'Close & Review',
        closeBtnName: 'Change it!'
      }
      const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
      dialogRef.afterClosed().subscribe(res => {
        
        if(res == false) {
          this.saveButtonLoadder = true;
          this.compareValues().then((da: any) => {
            if (!this.vendorChangeDetect) {
              this.setValueInFormControl('payByDay', isValueExist(this.oldPayByDays.toString()));
            }
            this.form.value.invoiceStartDate = this.form.value.invoiceStartDate ? _.cloneDeep(this.onselectSetDate(this.form.value.invoiceStartDate, '-')) : null;
            this.form.value.InvoiceDisconnectionDate = this.form.value.InvoiceDisconnectionDate ? _.cloneDeep(this.onselectSetDate(this.form.value.InvoiceDisconnectionDate, '-')) : null;
            this.form.value['createPastInvoiceRetrievals'] = createPastInvoiceRetrievals;
            this.form.value['RemoveInvoiceRetrievals'] = this.RemoveInvoiceRetrievals;
            delete this.form.value.remitAddressesId; // back-end team said not used in API
            delete this.form.value.addressLine1;
            delete this.form.value.addressLine2;
            delete this.form.value.city;
            delete this.form.value.stateID;
            delete this.form.value.postalCode;
            delete this.form.value.countryID;
            if (!isValueExist(this.form.value.InvoiceDisconnectionDate)) {
              delete this.form.value.InvoiceDisconnectionDate;
            }
            this.locationService
              .editBillingAccount(
                this.form.value,
                this.billingAccountData.Id
              )
              .pipe(takeUntil(this._unsubscribeAll))
              .subscribe({
                next: (data) => {
                  if (data.Success) {
                    this.billingAccountData = data.Data;
                    this.RemoveInvoiceRetrievals = false;
                    this.setData(this.billingAccountData);
                    this.getProcessBilling();
                    this.setCustomerValue(this.billingAccountData, !this.customerChangeDetect);
                    this.setVendorValue(this.billingAccountData);
                    this.saveButtonLoadder = false;
      
                    if (this.mainAccChangeDetect && this.customerChangeDetect && this.vendorChangeDetect
                      && this.payableChangeDetect) {
                      this.setTrueAllDetect();
                      let errorData: any = {
                        messgeType: 'error',
                        title: 'Attention',
                        titleClass: 'text-c-blue',
                        icon: 'fas fa-exclamation-circle',
                        iconClass: 'text-c-blue f-70',
                        message: data.Message, //if messges is multiple use array
                      };
                      const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
                        panelClass: 'error-warning',
                        data: errorData,
                      });
                      dialogRef.afterClosed().subscribe(() => {
                        this.onSaveAndBackNext.emit(this.billingAccountData);
                      });
                    } else {
      
                      // da['TEM'] && 
                      if (da['active'] && da['billedAddressChanged'] && da['billingAccountHierarchyId'] &&
                        da['currencyId'] && da['invoiceBillDay'] && da['invoiceFrequencyId'] && da['invoiceStartDate'] &&
                        da['parentBillingAccountHierarchyId'] && da['payByDay'] && da['payableAccountNumber'] &&
                        da['remitAddressId']) {
                      } else {
                        this.setTrueAllDetect();
                        let errorData: any = {
                          messgeType: 'error',
                          title: 'Attention',
                          titleClass: 'text-c-blue',
                          icon: 'fas fa-exclamation-circle',
                          iconClass: 'text-c-blue f-70',
                          message: data.Message, //if messges is multiple use array
                        };
                        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
                          panelClass: 'error-warning',
                          data: errorData,
                        });
                        dialogRef.afterClosed().subscribe(() => {
                          this.onSaveAndBackNext.emit(this.billingAccountData);
                        });
                      }
      
                      this.onSaveAndBackNext.emit(this.billingAccountData);
                      this.setTrueAllDetect();
                    }
                  } else {
                    this.saveButtonLoadder = false;
                    let errorData: any = {
                      messgeType: 'error',
                      title: 'Attention',
                      titleClass: 'text-c-blue',
                      icon: 'fas fa-exclamation-circle',
                      iconClass: 'text-c-blue f-70',
                      message: data.Message,
                    };
                    const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
                      panelClass: 'error-warning',
                      data: errorData,
                    });
                  }
                },
                error: (error) => {
                  this.saveButtonLoadder = false;
                  let errorMessage: any = '';
                  if (error.status === 400) {
                    errorMessage = error.error ? error.error : 'Bad request';
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
                },
              });
          });
        } else {
          
        }
      });
    } else {
      this.saveButtonLoadder = true;
      this.compareValues().then((da: any) => {
        if (!this.vendorChangeDetect) {
          this.setValueInFormControl('payByDay', isValueExist(this.oldPayByDays.toString()));
        }
        this.form.value.invoiceStartDate = this.form.value.invoiceStartDate ? _.cloneDeep(this.onselectSetDate(this.form.value.invoiceStartDate, '-')) : null;
        this.form.value.InvoiceDisconnectionDate = this.form.value.InvoiceDisconnectionDate ? _.cloneDeep(this.onselectSetDate(this.form.value.InvoiceDisconnectionDate, '-')) : null;
        this.form.value['createPastInvoiceRetrievals'] = createPastInvoiceRetrievals;
        this.form.value['RemoveInvoiceRetrievals'] = this.RemoveInvoiceRetrievals;
        delete this.form.value.remitAddressesId; // back-end team said not used in API
        delete this.form.value.addressLine1;
        delete this.form.value.addressLine2;
        delete this.form.value.city;
        delete this.form.value.stateID;
        delete this.form.value.postalCode;
        delete this.form.value.countryID;
        if (!isValueExist(this.form.value.InvoiceDisconnectionDate)) {
          delete this.form.value.InvoiceDisconnectionDate;
        }
        this.locationService
          .editBillingAccount(
            this.form.value,
            this.billingAccountData.Id
          )
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe({
            next: (data) => {
              if (data.Success) {
                this.billingAccountData = data.Data;
                this.RemoveInvoiceRetrievals = false;
                this.setData(this.billingAccountData);
                this.getProcessBilling();
                this.setCustomerValue(this.billingAccountData, !this.customerChangeDetect);
                this.setVendorValue(this.billingAccountData);
                this.saveButtonLoadder = false;
  
                if (this.mainAccChangeDetect && this.customerChangeDetect && this.vendorChangeDetect
                  && this.payableChangeDetect) {
                  this.setTrueAllDetect();
                  let errorData: any = {
                    messgeType: 'error',
                    title: 'Attention',
                    titleClass: 'text-c-blue',
                    icon: 'fas fa-exclamation-circle',
                    iconClass: 'text-c-blue f-70',
                    message: data.Message, //if messges is multiple use array
                  };
                  const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
                    panelClass: 'error-warning',
                    data: errorData,
                  });
                  dialogRef.afterClosed().subscribe(() => {
                    this.onSaveAndBackNext.emit(this.billingAccountData);
                  });
                } else {
  
                  // da['TEM'] && 
                  if (da['active'] && da['billedAddressChanged'] && da['billingAccountHierarchyId'] &&
                    da['currencyId'] && da['invoiceBillDay'] && da['invoiceFrequencyId'] && da['invoiceStartDate'] &&
                    da['parentBillingAccountHierarchyId'] && da['payByDay'] && da['payableAccountNumber'] &&
                    da['remitAddressId']) {
                  } else {
                    this.setTrueAllDetect();
                    let errorData: any = {
                      messgeType: 'error',
                      title: 'Attention',
                      titleClass: 'text-c-blue',
                      icon: 'fas fa-exclamation-circle',
                      iconClass: 'text-c-blue f-70',
                      message: data.Message, //if messges is multiple use array
                    };
                    const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
                      panelClass: 'error-warning',
                      data: errorData,
                    });
                    dialogRef.afterClosed().subscribe(() => {
                      this.onSaveAndBackNext.emit(this.billingAccountData);
                    });
                  }
  
                  this.onSaveAndBackNext.emit(this.billingAccountData);
                  this.setTrueAllDetect();
                }
              } else {
                this.saveButtonLoadder = false;
                let errorData: any = {
                  messgeType: 'error',
                  title: 'Attention',
                  titleClass: 'text-c-blue',
                  icon: 'fas fa-exclamation-circle',
                  iconClass: 'text-c-blue f-70',
                  message: data.Message,
                };
                const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
                  panelClass: 'error-warning',
                  data: errorData,
                });
              }
            },
            error: (error) => {
              this.saveButtonLoadder = false;
              let errorMessage: any = '';
              if (error.status === 400) {
                errorMessage = error.error ? error.error : 'Bad request';
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
            },
          });
      });
    }
  }

  compareValues() {
    return new Promise((resolve) => {
      const TEM = this.compareBothVal(this.form.value.TEM, this.billingAccountData.TEMAccountId)
      const active = this.compareBothVal(this.form.value.active, this.billingAccountData.Status)
      const payByDay = this.compareBothVal(this.form.value.payByDay, this.billingAccountData.PayByDays)
      const currencyId = this.compareBothVal(this.form.value.currencyId, this.billingAccountData.CurrencyId)
      const remitAddressId = this.compareBothVal(this.form.value.remitAddressId, this.billingAccountData.RemitAddressId)
      const invoiceBillDay = this.compareBothVal(this.form.value.invoiceBillDay, this.billingAccountData.InvoiceBillDay)
      const vendorAccountId = this.compareBothVal(this.form.value.vendorAccountId, this.billingAccountData.VendorAccountId)
      const invoiceStartDate = this.compareBothVal(this.form.value.invoiceStartDate, formatDate(this.billingAccountData.InvoiceStartDate, 'yyyy-MM-dd', 'en'))
      const isPayableAccount = this.compareBothVal(this.form.value.isPayableAccount, this.billingAccountData.PayableAccount)
      const customerAccountId = this.compareBothVal(this.form.value.customerAccountId, this.billingAccountData.CustomerAccountId)
      const invoiceFrequencyId = this.compareBothVal(this.form.value.invoiceFrequencyId, this.billingAccountData.InvoiceFrequencyID)
      const payableAccountNumber = this.compareBothVal(this.form.value.payableAccountNumber, this.billingAccountData.AccountNumber)
      const billedAddressChanged = this.compareBothVal(this.form.value.billedAddressChanged, this.billingAccountData.BilledAddressChangedValue)
      const isMainAccountBeingAdd = this.compareBothVal(this.form.value.isMainAccountBeingAdd, this.billingAccountData.IsMainBillingAccount)
      const billingAccountHierarchyId = this.compareBothVal(this.form.value.billingAccountHierarchyId, this.billingAccountData.BillingAccountHierarchyId)
      const parentBillingAccountHierarchyId = this.compareBothVal(this.form.value.parentBillingAccountHierarchyId, this.billingAccountData.ParentBillingAccountHierarchyId)

      const manage = {
        TEM, active, payByDay, currencyId, remitAddressId, invoiceBillDay, vendorAccountId, invoiceStartDate, isPayableAccount, customerAccountId, invoiceFrequencyId, payableAccountNumber, billedAddressChanged, isMainAccountBeingAdd, billingAccountHierarchyId, parentBillingAccountHierarchyId,
      }
      resolve(manage);
    });

  }

  compareBothVal(d1: any, d2: any) {
    return d1 === d2 ? true : false;
  }

  setTrueAllDetect() {
    this.mainAccChangeDetect = true;
    this.customerChangeDetect = true;
    this.vendorChangeDetect = true;
    this.payableChangeDetect = true;
  }
  setCustomerValue(data: any, callCustomerAPI = false) {
    this.setValueInFormControl('customerAccountId', data.CustomerAccountId);

    setTimeout(() => {
      this.filterCustomerGridByTEMId();
    }, 100);
  }

  setVendorValue(data: any) {
    this.setValueInFormControl('vendorAccountId', data.VendorAccountId);
  }

  getMainAccDetail() {

    const a = _.find(this.MainBillingAccountDD, (k: any) => k.Id === this.f['parentBillingAccountHierarchyId'].value)
    if (a) {
      const mainBillId = a['BillingAccount'].$values[0]['Id'];

      if (mainBillId) {
        this.locationService
          .getBillingAccountsDetails(mainBillId)
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((data) => {
            if (data && data.Data) {
              data = data.Data;
              this.onChangeRemitAddress(isValueExist(data.RemitAddressId))
              this.setValueInFormControl('payByDay', isValueExist(data.PayByDays ? data.PayByDays.toString() : ''));
              this.setValueInFormControl('currencyId', isValueExist(data.CurrencyId, true));
              this.setValueInFormControl('invoiceFrequencyId', isValueExist(data.InvoiceFrequencyID));
              this.setValueInFormControl('invoiceBillDay', isValueExist(data.InvoiceBillDay));
              this.setValueInFormControl('BillingAccountStatusId', isValueExist(data.BillingAccountStatusId));
              this.setValueInFormControl('invoiceStartDate', data.InvoiceStartDate ? isValueExist(this.manageService.convertDate(data.InvoiceStartDate, '', '/')) : '');
              this.onChangeStartDate(data.InvoiceStartDate);
              if(isValueExist(data.PayableVendorAccountName))
                // this.setValueInFormControl('PayableVendorAccountId', data.PayableVendorAccountId);
              this.setValueInFormControl('PayableVendorName', data.PayableVendorAccountName);
            }
          })
      }
    }

  }
  getIsAnyPayableBillingAcc(data?: any, recursion = false) {


    let updatedBillData = data ? data : this.billingAccountData;
    return new Promise((resolve) => {
      let KeyString: any = '';
      if (checkIsValueExistswithZero(this.f['parentBillingAccountHierarchyId'].value)) {
        KeyString =
          '?parentBillingAccountHierarchyId=' +
          this.f['parentBillingAccountHierarchyId'].value;
      }
      if (updatedBillData && updatedBillData.BillingAccountHierarchyId) {
        if (KeyString === '') {
          KeyString +=
            '?billingAccountHierarchyId=' +
            updatedBillData.BillingAccountHierarchyId;
        } else {
          KeyString +=
            '&billingAccountHierarchyId=' +
            updatedBillData.BillingAccountHierarchyId;
        }
      }

      if (KeyString) {
        this._unsubscribeAllAnyPayableBillingAccount.next(null);
        this.locationService
          .IsAnyPayableBillingAccount(KeyString)
          .pipe(takeUntil(this._unsubscribeAllAnyPayableBillingAccount))
          .subscribe((data) => {

            if (typeof data === 'object' && data !== null) {
              this.varPayableAccount = data.Data.PayableAccount;

              if ((data.Data.IsInvoiceAttached || data.Data.IsSandboxInvoiceAttached) && !this.f['isMainAccountBeingAdd'].value) {
                this.setValueInFormControl('isPayableAccount', data.Data.PayableAccount);
                this.invoiceAttachDisabled = data.IsSandboxInvoiceAttached || data.IsInvoiceAttached ? true : false;
              } else {
                this.setValueInFormControl('isPayableAccount', data.Data.PayableAccount);
              }

              this.remitAccess();
              if (this.isManually) {
                this.setValueInFormControl('remitAddressId', this.remitAddId);
                // this.setValueInFormControl('PayableVendorAccountId', this.payableVendorId);
                this.setValueInFormControl('PayableVendorName', this.payableVendorId);
                
              } else {
                this.setValueInFormControl('remitAddressId', data.Data.RemitAddressId);
                // this.setValueInFormControl('PayableVendorAccountId', data.Data.PayableVendorAccountId);
                this.setValueInFormControl('PayableVendorName', data.Data.PayableVendorAccountName);
              }

              if (data.Data.RemitAddressId && data.Data.PayableVendorAccountName) {
                this.onChangeRemitAddress(this.f['remitAddressId'].value.toString());
              } else {
                if (this.billingAccountData?.RemitAddressId) {
                  this.setValueInFormControl('remitAddressId', isValueExist(this.billingAccountData.RemitAddressId));
                  // this.setValueInFormControl('PayableVendorAccountId', isValueExist(this.billingAccountData.PayableVendorAccountId));
                  this.setValueInFormControl('PayableVendorName', isValueExist(this.billingAccountData.PayableVendorAccountName));
                  this.onChangeRemitAddress(this.billingAccountData.RemitAddressId);
                }
                this.setValueInFormControl('city', null);
                this.setValueInFormControl('stateID', null);
                this.setValueInFormControl('countryID', null);
                this.setValueInFormControl('postalCode', null);
                this.setValueInFormControl('addressLine1', null);
                this.setValueInFormControl('addressLine2', null);
                this.setValueInFormControl('remitAddressId', null);
              }

              if (this.action === 'edit') {
                this.disabledOnIsAnyPayable = data.IsEditable;
                if (!this.f['isMainAccountBeingAdd'].value) {
                  this.mainPayableDisabled = true;
                } else {
                  this.mainPayableDisabled = this.disabledOnIsAnyPayable;
                }
              }
              resolve(data.Data.PayableAccount);
            }
          });
      }
    });
  }

  setCustomerAndVendor(data: any) {
    this.setCustomerValue(data);
    this.setVendorValue(data);
  }

  setValueInFormControl(key: any, value: any) {
    this.f[key].setValue(value);
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
    this._unsubscribeAllCustomerVendor.next(null);
    this._unsubscribeAllCustomerVendor.complete();
    this._unsubscribeAllAnyPayableBillingAccount.next(null);
    this._unsubscribeAllAnyPayableBillingAccount.complete();
    this._unsubscribeCustomer.next(null);
    this._unsubscribeCustomer.complete();
    this._unsubscribeCountry.next(null);
    this._unsubscribeCountry.complete();
    this._unsubscribeVendor.next(null);
    this._unsubscribeVendor.complete();

    if (this.action === 'add') {
      let data: any = '';
      data = this.form.value;
      if (this.billingAccountData && this.billingAccountData.Id) {
        data['newAdded'] = false;
      }
      this.onComponentDestroy.emit(data);
    } else {
      this.onComponentDestroy.emit(this.billingAccountData);
    }

    this.setTemDDValueEvent.emit('');
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

      if (browserName === 'firefox' || browserName === 'safari') {
        return isValueExist(this.manageService.convertDate(`${mm}-${dd}-${yy}`, 'saveDatePicker', regex));
      } else {
        return isValueExist(this.manageService.convertDate(`${mm}-${dd}-${yy}T0000`, 'saveDatePicker', regex));
      }
    } else {
      return isValueExist(this.manageService.convertDate(`${$event}T0000`, 'saveDatePicker', regex));
    }
  }

  openRowRecord(data: any) {
    this.sendAccHirercyToTable.emit(data);
  }

  disConnDate(date: any) {

    const day = String(date.getDate()).padStart(2, '0'); // Ensure two digits
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = date.getFullYear();

    // Format the date as MM/DD/YYYY
    const formattedDate = `${month}/${day}/${year}`;


    if (this.form.value.invoiceStartDate && formattedDate) {
      if (new Date(formattedDate) >= new Date(this.form.value.invoiceStartDate)) {
      } else {
        this.setValueInFormControl('InvoiceDisconnectionDate', null)
      }
    }

  }

  convertToMMDDYYYY(dateString: any) {
    // Split the input date string (DD/MM/YYYY)
    const [day, month, year] = dateString.split("/");

    // Return the formatted date string (MM/DD/YYYY)
    return `${month}/${day}/${year}`;
  }

  onChangeStartDate($event: any) {
    let date: any;
    let endDate: any;
    if ($event && this.f['InvoiceDisconnectionDate'].value) {
      date = new Date($event);
      endDate = new Date(this.f['InvoiceDisconnectionDate'].value);
      this.setMindate = date;
      if (date > endDate) {
        this.f['InvoiceDisconnectionDate'].patchValue(null);
      }
    } else {
      date = new Date($event);
      this.setMindate = date;
    }
  }

  isPayableAccountChange(bool: any) {

    if (!bool && this.action === 'add') {
      // this.addBillingAccountForm.get('PayableVendorAccountId')?.setValidators([]);
      // this.form.get('PayableVendorAccountId')?.updateValueAndValidity();
      this.addBillingAccountForm.get('PayableVendorName')?.setValidators([]);
      this.form.get('PayableVendorName')?.updateValueAndValidity();
    }

    if (this.f['isMainAccountBeingAdd'].value) {
      this.addBillingAccountForm.get('remitAddressId')?.setValidators([Validators.required]);
      this.form.get('remitAddressId')?.updateValueAndValidity();
    }
    this.payableVendorPopulate()

  }

  payableVendorPopulate() {
    if (this.f['isPayableAccount'].value && this.f['vendorAccountId'].value) {
      // this.setValueInFormControl('PayableVendorAccountId', this.f.vendorAccountId.value);
      let obj = this.vendorsList.find((res: any) => res.Id == this.f['vendorAccountId'].value)
      
      this.setValueInFormControl('PayableVendorName', obj['AccountName']);
    }
  }

  remitAccess() {

    if (this.f['isPayableAccount'].value === false) {
      this.disabledRemitDD = true;
    } else {
      this.disabledRemitDD = false;
    }

    if (this.f['isMainAccountBeingAdd'].value === false && this.f['isPayableAccount'].value === true) {
      this.payableVendorDisabled = false;
    }
    if (this.f['isMainAccountBeingAdd'].value === false && this.f['isPayableAccount'].value === false) {
      this.payableVendorDisabled = true;
    }
  }

  payableAccChange(e: any) {
    if( e.value === false) {
      this.f['ProcessingBilling'].patchValue(false);
    }
  }
}
