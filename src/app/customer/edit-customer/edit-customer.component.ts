import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as _ from 'lodash';
import { LocationService } from 'src/app/services/location.service';
import { SelectOptionService } from 'src/app/services/select-option.service';
import { isValueExist, rolePermission } from 'src/app/services/helper';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SpaceTrimStartEndInputirective } from 'src/app/custom-directives/custom-validation.directive';
import { ChangeLogComponent } from 'src/app/common/change-log/change-log.component';
// import { MatDialogRef } from '@angular/material/dialog';
@Component({
  selector: 'app-edit-customer',
  templateUrl: './edit-customer.component.html',
  styleUrls: ['./edit-customer.component.scss'],
  standalone: true,
  imports: [
    SharedModule,
    PrimgModule,
    SpaceTrimStartEndInputirective,
    ChangeLogComponent
  ],
  providers: [LocationService, SelectOptionService]
})
export class EditCustomerComponent implements OnInit {
  @Input() accountData: any;
  selectedButton: any = 'customer';
  buttonOptions: any = [
    //{ 'label': 'Dashboard', value: 'dashboard' },
    { 'label': "Customer", value: 'customer' },
    { 'label': 'Company', value: 'company' }
  ];
  public columnDefs: any;
  public rowSelection: any;
  public editCustomerForm: FormGroup;
  isCustomerFormSubmit: boolean = false;
  isBillPay: any = false;
  countryStateArray: any = [];
  countries: any = [];
  states: any = [];
  isSuperTEMUsers: boolean = false;
  isShowAsterisk: boolean = false;
  isCompanyUser: boolean = false;
  isVendorUser: boolean = false;
  hasSsuperTemUsers: boolean = false;
  reconStatusFlag: boolean = false;
  isMFAon: boolean = false;
  changelogData: any;
  columns: any = [];
  logLoader = false;

  saveButtonLoadder = false;
  @Output() onCustomerEditEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() currentOpenEditPage: EventEmitter<any> = new EventEmitter<any>();
  @Output() customerTemValue: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('TEMAccount') TEMAccount!: TemplateRef<any>;
  @ViewChild('Reconciliation') Reconciliation!: TemplateRef<any>;
  @ViewChild('CostAllocation') CostAllocation!: TemplateRef<any>;
  @ViewChild('CostCenterEdits') CostCenterEdits!: TemplateRef<any>;
  @ViewChild('Approvals') Approvals!: TemplateRef<any>;
  @ViewChild('ApprovalDays') ApprovalDays!: TemplateRef<any>;
  @ViewChild('NotificationFrequency') NotificationFrequency!: TemplateRef<any>;
  @ViewChild('BillPay') BillPay!: TemplateRef<any>;

  private _unsubscribeTEM: Subject<any> = new Subject<any>();
  private _unsubscribeChangelog: Subject<any> = new Subject<any>();

  tems: any = [];

  days:any = [];
  statusList = [
    { Id: true, Name: 'Active' },
    { Id: false, Name: 'Inactive' },
  ]
  billPayList = [
    { Id: 'SuperTEM', Name: 'SuperTEM'},
    { Id: 'TEM', Name: 'TEM' },
    // { Id: 'Customer', Name: 'Customer' },
  ]
  yesNoList = [
    { Id: 'Yes', Name: 'Yes' },
    { Id: 'No', Name: 'No' },
  ]

  reconciliationList = [
    { Id: 'SuperTEM', Name: 'SuperTEM'},
    { Id: 'TEM', Name: 'TEM' },
    { Id: 'Customer', Name: 'Customer' },
  ];

  costAllocationList = [
    { Id: 'SuperTEM', Name: 'SuperTEM'},
    { Id: 'TEM', Name: 'TEM' },
    { Id: 'Customer', Name: 'Customer' },
  ];

  temReqired = false;
  viewNEdit = false;

  isCostAllocationValue: boolean = false;
  isApprovalValue: boolean = false;

  constructor(private locationService: LocationService, public dialog: MatDialog, public selectOptionService: SelectOptionService,
    // public matDialogRef: MatDialogRef<EditCustomerComponent>,
    private fb: FormBuilder) {
    this.editCustomerForm = fb.group({
      ManagingAccountId: new FormControl('', []),
      AccountName: new FormControl('', [Validators.required, Validators.maxLength(100)]),
      Active: new FormControl('', [Validators.required]),
      WebAddress: new FormControl('', [Validators.maxLength(400)]),
      PhysicalAddress: new FormControl('', [Validators.maxLength(100)]),
      PhysicalAddress2: new FormControl('', [Validators.maxLength(100)]),
      CountryId: new FormControl('', []),
      City: new FormControl('', [Validators.maxLength(50)]),
      StateId: new FormControl('', []),
      PostalCode: new FormControl('',[Validators.maxLength(10)]),
      PaymentResponsibility: new FormControl(''),
      TEMAccountNumber: new FormControl('', [Validators.required]),
      // AllowCCManualEditOptions: new FormControl('Yes', [Validators.required]),
      KeepForProduction:new FormControl(false),

      // invoiceSetting controls
      ReconStatus: new FormControl(true),
      ReconOption: new FormControl(''),
      CostAllocationStatus: new FormControl(false),
      CostAllocationOption: new FormControl(''),
      CostAllocationEditStatus: new FormControl(''),
      ApprovalStatus: new FormControl(false),
      ApprovalDays: new FormControl(''),
      NotificationFrequencyDays: new FormControl(''),
      BillPayStatus: new FormControl(false),
      BillPayOption: new FormControl(''),

      TwoFactorEnabled: new FormControl(''),
      MFAContactName: new FormControl('', [Validators.maxLength(60)]),
      MFAContactEmail: new FormControl('', [Validators.maxLength(60),Validators.email, Validators.pattern('^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[a-z]{2,4}$')])
    });

    for (let i = 1; i <= 31; i++) {
      this.days.push({ Id: i, value: i, stringValue: i.toString() });
    }
    this.days.unshift({ Id: "none", value: "none", stringValue: "None" })

    this.columns = [
      { field: 'TabModuleDisplayName', header: 'Tab' },
      { field: 'TabSectionModuleDisplayName', header: 'Section' },
      { field: 'DisplayColumnName', header: 'Field Name' },
      { field: 'OldValue', header: 'Previous Value' },
      { field: 'NewValue', header: 'New Value' },
      { field: 'ModificationDate', header: 'Time & Date' },
      { field: 'ModifiedBy', header: 'Who' }
    ];
  }

  ngOnInit() {
    this.customerTemValue.emit(this.accountData.TEMAccountID);
    this.hasSsuperTemUsers = rolePermission(['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser']);
    this.currentOpenEditPage.emit(true);
    this.viewNEdit = rolePermission(['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser', 'SuperTEM', 'TEMAdmin', 'TEMUser', 'TEMManager']);
  
    if (!this.viewNEdit) {
      this.editCustomerForm.disable();
    }
    this.isSuperTEMUsers = this.locationService.isUserHasSuperTEMUsersRole();
    this.isCompanyUser = this.locationService.isUserCompanyUser();
    this.isVendorUser = this.locationService.isUserVendor();
    this.getCountry();
    this.getAccountById(this.accountData.AccountId);
    if (this.isSuperTEMUsers) {
      this.getTemLists();
      this.temReqired = true;
      this.editCustomerForm.get('ManagingAccountId')?.setValidators([Validators.required]);
    } else {
      this.temReqired = false;
      this.editCustomerForm.get('ManagingAccountId')?.setValidators([]);
    }
    this.editCustomerForm.get('ManagingAccountId')?.updateValueAndValidity();
    if (this.isCompanyUser || this.isVendorUser) {
      this.editCustomerForm.disable();
    }

    this.getChangeLogData();
  }

  getChangeLogData() {
    this.logLoader = true;
    this._unsubscribeChangelog.next(null);
    this.locationService.getCustomerChangelogs(this.accountData.AccountId).pipe(takeUntil(this._unsubscribeChangelog)).subscribe((data: any) => {
      this.logLoader = false;
      if(data.Success) {
        this.changelogData = data.Data.$values;
      } else {
        this.changelogData = [];
      }
    });
  }

  changeMFAvalue($event: any){
    if($event == true || $event == 'true'){
      this.isMFAon = true;
      this.editCustomerForm.get('MFAContactEmail')?.setValidators([Validators.required,Validators.maxLength(60),Validators.email, Validators.pattern('^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[a-z]{2,4}$')]);
      this.editCustomerForm.get('MFAContactName')?.setValidators([Validators.required,Validators.maxLength(60)]);
    } else {
      this.isMFAon = false;
      this.editCustomerForm.get('MFAContactEmail')?.setValidators([Validators.maxLength(60),Validators.email, Validators.pattern('^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[a-z]{2,4}$')]);
      this.editCustomerForm.get('MFAContactName')?.setValidators([Validators.maxLength(60)]);
      // this.f.MFAContactEmail.patchValue('');
      // this.f.MFAContactName.patchValue('');
    }
    this.editCustomerForm.get('MFAContactEmail')?.updateValueAndValidity();
    this.editCustomerForm.get('MFAContactName')?.updateValueAndValidity();
  }

  TEMAccountTooltip(): void {
    this.dialog.open(this.TEMAccount, {
       width: '380px',
           data: {
             colseButton: true,
           }
     });
   }

   ReconciliationTooltip(): void {
    this.dialog.open(this.Reconciliation, {
       width: '900px',
           data: {
             colseButton: true,
           }
     });
   }

   CostAllocationTooltip(): void {
    this.dialog.open(this.CostAllocation, {
       width: '900px',
           data: {
             colseButton: true,
           }
     });
   }

   onCostAllocationChange($event: any) {
    if($event) {
      this.isCostAllocationValue = $event.value;
        if($event.value == false){
          this.f['CostAllocationStatus'].patchValue(false);
          this.f['CostAllocationEditStatus'].patchValue(false);
          this.f['ApprovalStatus'].patchValue(false);
          this.isApprovalValue = false;
          this.isCostAllocationValue = false;
        }
      }
   }

   onApprovalStatus($event: any) {
    if($event) {
      this.isApprovalValue = $event.value;
    }
   }

   CostCenterEditsTooltip(): void {
    this.dialog.open(this.CostCenterEdits, {
       width: '900px',
           data: {
             colseButton: true,
           }
     });
   }

   ApprovalsTooltip(): void {
    this.dialog.open(this.Approvals, {
       width: '900px',
           data: {
             colseButton: true,
           }
     });
   }

   ApprovalDaysTooltip(): void {
    this.dialog.open(this.ApprovalDays, {
       width: '900px',
           data: {
             colseButton: true,
           }
     });
   }

   NotificationFrequencyTooltip(): void {
    this.dialog.open(this.NotificationFrequency, {
       width: '900px',
           data: {
             colseButton: true,
           }
     });
   }

   BillPayTooltip(): void {
    this.dialog.open(this.BillPay, {
       width: '900px',
           data: {
             colseButton: true,
           }
     });
   }

   closeModal() {
    this.dialog.closeAll();
  }
  

  onChangeReconciliation($event: any){
    this.reconStatusFlag = $event.value;
    if($event.value == false){
      this.f['CostAllocationStatus'].patchValue(false);
      this.f['CostAllocationEditStatus'].patchValue(false);
      this.f['ApprovalStatus'].patchValue(false);
      this.isApprovalValue = false;
      this.isCostAllocationValue = false;
    }
  }
  

  onStatusChange(event: any) {
    if(event.value == false) {
      let errorData: any = {
        messgeType: "error",
        title: "Attention",
        titleClass: "text-c-blue",
        icon: "fas fa-exclamation-circle",
        iconClass: "text-c-blue f-70",
        message: 'The associated location or people will become inactive.',
      }
      const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData, disableClose: true  });
        dialogRef.afterClosed().subscribe(result => {
          if(result == 'undefined') {
            this.setFormValue('Active', this.accountData.Active == true ? true: false)
          }
      });
    }
  }
  ngOnDestroy(): void {
    this._unsubscribeChangelog.next(null);
    this._unsubscribeChangelog.complete();
  }
  getTemLists() {
    this._unsubscribeTEM.next(null);
    this.locationService
      .getTEMLoggedInUserDropDown()
      .pipe(takeUntil(this._unsubscribeTEM))
      .subscribe((data) => {
        if (data && data.$values) {
          this.tems = data.$values;

          if (this.hasSsuperTemUsers) {
            let id = sessionStorage.getItem("LoggedAccountId");
            const found = this.tems.find((element: any) => Number(element.Id) === Number(id));
            this.tems.unshift(found);

            this.tems = this.tems.filter((object: any, index: number): boolean => {
              return object && this.tems.indexOf(object) === index;
            });
          }
        }
      });
  }

  onTemChange($event: any){
    this.customerTemValue.emit($event.value);
  }

  counter(i: number) {
    return new Array(i);
  }


  get f() {
    return this.editCustomerForm.controls;
  }

  setFormValue(key: any, data: any) {
    if (this.f[key]) {
      this.f[key].setValue(data);
    }
  }

  getAccountById(id: any) {
    this.locationService.getTemAccountById(id).subscribe((data) => {
      if (data) {
        Object.keys(data.Data).forEach(key => {
          this.setFormValue(_.cloneDeep(key), isValueExist(_.cloneDeep(data.Data[key])))
        });
        
        this.changeMFAvalue(data.Data?.TwoFactorEnabled);
        this.f['ReconStatus'].patchValue(data.Data.ReconStatus == true ? true : false);
        this.f['CostAllocationStatus'].patchValue(data.Data.CostAllocationStatus == true ? true : false);
        this.f['CostAllocationEditStatus'].patchValue(data.Data.CostAllocationEditStatus == true ? true : false);
        this.f['ApprovalStatus'].patchValue(data.Data.ApprovalStatus == true ? true : false);
        this.f['BillPayStatus'].patchValue(data.Data.BillPayStatus == true ? true : false);
        this.f['ReconOption'].patchValue(data.Data.ReconOption ? data.Data.ReconOption : this.reconciliationList[0].Id);
        this.f['CostAllocationOption'].patchValue(data.Data.CostAllocationOption ? data.Data.CostAllocationOption : this.costAllocationList[0].Id);
        this.f['BillPayOption'].patchValue(data.Data.BillPayOption ? data.Data.BillPayOption : this.billPayList[0].Id);

        this.isApprovalValue = data.Data.ApprovalStatus == true ? true : false;
        this.isCostAllocationValue = data.Data.CostAllocationStatus == true ? true : false;
        // this.f.AllowCCManualEditOptions.patchValue(data.Data.AllowCCManualEdits);
        this.onCountrySelect();
      }
    });
  }
  checkAddressValidation(clickFromTs = false) {
    if (this.f['PhysicalAddress'].value || this.f['City'].value || this.f['CountryId'].value || this.f['StateId'].value || this.f['PostalCode'].value) {
      if (!clickFromTs) {
        this.isShowAsterisk = true;
      }
      this.editCustomerForm.get('PhysicalAddress')?.setValidators([Validators.required]);
      this.editCustomerForm.get('City')?.setValidators([Validators.required]);
      this.editCustomerForm.get('CountryId')?.setValidators([Validators.required]);
      this.editCustomerForm.get('StateId')?.setValidators([Validators.required]);
      this.editCustomerForm.get('PostalCode')?.setValidators([Validators.required]);
    } else {
      this.isShowAsterisk = false;
      this.editCustomerForm.get('PhysicalAddress')?.clearValidators();
      this.editCustomerForm.get('City')?.clearValidators();
      this.editCustomerForm.get('CountryId')?.clearValidators();
      this.editCustomerForm.get('StateId')?.clearValidators();
      this.editCustomerForm.get('PostalCode')?.clearValidators();
    }

    this.editCustomerForm.get('PhysicalAddress')?.updateValueAndValidity();
    this.editCustomerForm.get('City')?.updateValueAndValidity();
    this.editCustomerForm.get('CountryId')?.updateValueAndValidity();
    this.editCustomerForm.get('StateId')?.updateValueAndValidity();
    this.editCustomerForm.get('PostalCode')?.updateValueAndValidity();
  }

  checkAddressValidation2() {
    if (this.f['PhysicalAddress2'].value !== '') {
      if (this.f['PhysicalAddress'].value == '') {
        this.editCustomerForm.get('PhysicalAddress')?.setValidators([Validators.required])
        this.editCustomerForm.get('PhysicalAddress')?.updateValueAndValidity();
      }

      if (this.f['City'].value == '') {
        this.editCustomerForm.get('City')?.setValidators([Validators.required])
        this.editCustomerForm.get('City')?.updateValueAndValidity();
      }

      if (this.f['CountryId'].value == '') {
        this.editCustomerForm.get('CountryId')?.setValidators([Validators.required])
        this.editCustomerForm.get('CountryId')?.updateValueAndValidity();
      }

      if (this.f['StateId'].value == '') {
        this.editCustomerForm.get('StateId')?.setValidators([Validators.required])
        this.editCustomerForm.get('StateId')?.updateValueAndValidity();
      }

      if (this.f['PostalCode'].value == '') {
        this.editCustomerForm.get('PostalCode')?.setValidators([Validators.required])
        this.editCustomerForm.get('PostalCode')?.updateValueAndValidity();
      }
    } else {
      this.editCustomerForm.get('PhysicalAddress')?.clearValidators();
      this.editCustomerForm.get('City')?.clearValidators();
      this.editCustomerForm.get('CountryId')?.clearValidators();
      this.editCustomerForm.get('StateId')?.clearValidators();
      this.editCustomerForm.get('PostalCode')?.clearValidators();
      this.editCustomerForm.get('PhysicalAddress')?.updateValueAndValidity();
      this.editCustomerForm.get('City')?.updateValueAndValidity();
      this.editCustomerForm.get('CountryId')?.updateValueAndValidity();
      this.editCustomerForm.get('StateId')?.updateValueAndValidity();
      this.editCustomerForm.get('PostalCode')?.updateValueAndValidity();
    }
  }


  getCountry() {
    this.locationService.getCountries().subscribe((data: any) => {
      if (data) {
        let countrystateArray = data.$values;
        this.countries = countrystateArray;
        this.onCountrySelect();
      }
    });
  }

  onCountrySelect() {
    if (this.f['CountryId'].valid && this.f['CountryId'].value) {

      this.locationService.getStates(this.f['CountryId'].value).subscribe((data: any) => {
        if (data) {
          this.states = data.$values;
        }
      });
    }

  }

  // onBillPayChange() {
  //   if (this.f.BillPayOption.value && this.f.BillPayOption.value === 'Yes') {
  //     this.isBillPay = true;
  //     this.f.PaymentResponsibility.patchValue('TEM');
  //   } else {
  //     this.isBillPay = false;
  //     this.f.PaymentResponsibility.patchValue('Customer');
  //   }
  // }

  updateCustomer():any {
    // this.checkAddressValidation(true);
    this.isCustomerFormSubmit = true;
    if(this.f['ReconStatus'].value == false && this.f['CostAllocationStatus'].value == true){
      return this.editCustomerForm.invalid;
    }

    if(this.f['ApprovalStatus'].value == true && (this.f['CostAllocationStatus'].value == false || this.f['ReconStatus'].value == false)){
      return this.editCustomerForm.invalid;
    }

    if (this.editCustomerForm.valid) {
      this.saveButtonLoadder = true;
      const formData = this.editCustomerForm.value;
      const data: any = {};
      data.active = (formData.Active === true || formData.Active === 'true') ? true : false;
      data.accountName = formData.AccountName;
      data.webAddress = formData.WebAddress;
      data.physicalAddress = formData.PhysicalAddress;
      data.physicalAddress2 = formData.PhysicalAddress2;
      data.city = formData.City;
      data.stateId = formData.StateId ? formData.StateId : 0;
      data.postalCode = formData.PostalCode;
      data.paymentResponsibility = formData.PaymentResponsibility;
      data.temAccountNumber = formData.TEMAccountNumber;
      // data.allowCCManualEditOptions = formData.AllowCCManualEditOptions;
      data.CountryId = formData.countryId;
      data.ManagingAccountId = formData.ManagingAccountId;
      data.KeepForProduction = formData.KeepForProduction;
      
      //invoiceSetting save data

      data.reconStatus = formData.ReconStatus;
      data.reconOption = formData.ReconOption;
      data.costAllocationStatus = formData.CostAllocationStatus;
      data.costAllocationOption = formData.CostAllocationOption;
      data.NotificationFrequencyDays = formData.NotificationFrequencyDays;
      data.approvalStatus = formData.ApprovalStatus;
      data.approvalDays = formData.ApprovalDays;
      data.costAllocationEditStatus = formData.CostAllocationEditStatus;
      data.BillPayStatus = formData.BillPayStatus;
      data.billPayOption = formData.BillPayOption;

      data.TwoFactorEnabled = formData.TwoFactorEnabled;
      data.MFAContactName = formData.MFAContactName;
      data.MFAContactEmail = formData.MFAContactEmail;

      this.locationService.updateAccount(this.accountData.AccountId, data).subscribe({
        next: data => {
          this.saveButtonLoadder = false;
          let errorData: any = {
            messgeType: "error",
            title: "Attention",
            titleClass: "text-c-blue",
            icon: "fas fa-exclamation-circle",
            iconClass: "text-c-blue f-70",
            message: data.Message //if messges is multiple use array
          }
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
          dialogRef.afterClosed().subscribe(result => {
            if(data.Success) {
              this.onCustomerEditEvent.emit(true);
              this.getChangeLogData();
            }
          });
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
              icon: "fas fa-exclamation-circle",
              iconClass: "text-c-blue f-70",
              message: errorMessage //if messges is multiple use array
            }
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
            dialogRef.afterClosed().subscribe(result => {

            });
          }
        }
      });
    } else {
      return this.editCustomerForm.invalid;
    }
  }
}
