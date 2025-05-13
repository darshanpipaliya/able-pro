import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { SpaceTrimStartEndInputirective } from 'src/app/custom-directives/custom-validation.directive';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { rolePermission } from 'src/app/services/helper';
import { LocationService } from 'src/app/services/location.service';
import { SelectOptionService } from 'src/app/services/select-option.service';

@Component({
  selector: 'app-add-customer',
  templateUrl: './add-customer.component.html',
  styleUrls: ['./add-customer.component.scss'],
  standalone: true,
  imports: [
    SharedModule,
    PrimgModule,
    SpaceTrimStartEndInputirective,
  ],
  providers: [LocationService, SelectOptionService]
})
export class AddCustomerComponent implements OnInit, OnDestroy {
  addCustomerForm: FormGroup;
  isCustomerFormSubmit: boolean = false;
  isBillPay: any = false;
  countryStateArray: any = [];
  countries: any = [];
  states: any = [];
  AccountNumber: any;
  @Input() accountData: any;
  @Input() selectedTem: any;
  @Input() currentIndexPage: any;
  @Input() selectedTemCustomer: any;
  @Input() selected: any;

  saveButtonLoadder = false;
  isShowAsterisk:boolean = false;
  isMFAon: boolean = false;
  isSuperTEMUsers:boolean = false;
  hasSsuperTemUsers: boolean = false;
  @Output() onCustomerAddEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() onCustomerComponetDestroy: EventEmitter<any> = new EventEmitter<any>();
  @Output() currentOpenEditPage: EventEmitter<any> = new EventEmitter<any>();

  isShowAsterisk2: boolean = false;

  isaddressTwo:boolean = false;

  private _unsubscribeTEM: Subject<any> = new Subject<any>();
  tems:any = [];

  days:any = [];
  temReqired = false;
  statusList = [
    { Id : true, Name : 'Active'},
    { Id : false, Name : 'Inactive'},
  ]
  billPayList = [
    { Id : 'TEM', Name : 'TEM'},
    { Id: 'SuperTEM', Name: 'SuperTEM'}
    // { Id : 'Customer', Name : 'Customer'},
  ]

  yesNoList = [
    { Id : 'Yes', Name : 'Yes'},
    { Id : 'No', Name : 'No'},
  ];

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

  isCostAllocationValue: boolean = false;
  isApprovalValue: boolean = false;
  reconStatusFlag: boolean = false;
  viewNEdit: boolean = false;

  @ViewChild('Reconciliation') Reconciliation!: TemplateRef<any>;
  @ViewChild('CostAllocation') CostAllocation!: TemplateRef<any>;
  @ViewChild('CostCenterEdits') CostCenterEdits!: TemplateRef<any>;
  @ViewChild('Approvals') Approvals!: TemplateRef<any>;
  @ViewChild('ApprovalDays') ApprovalDays!: TemplateRef<any>;
  @ViewChild('NotificationFrequency') NotificationFrequency!: TemplateRef<any>;
  @ViewChild('BillPay') BillPay!: TemplateRef<any>;

  customersLoader = false;
  @Input() clickOnSearchButton: any;
  @Input() selectedWiseTemDD: any;
  @Output() setClickFalse: EventEmitter<any> = new EventEmitter<any>();
  constructor(private locationService: LocationService,
    public dialog: MatDialog,
    public selectOptionService: SelectOptionService,
    private fb: FormBuilder) {
    this.addCustomerForm = fb.group({
      ManagingAccountId: new FormControl(null, [Validators.required]),
      AccountName: new FormControl('', [Validators.required, Validators.maxLength(100)]),
      Active: new FormControl(true, [Validators.required]),
      WebAddress: new FormControl('', [Validators.maxLength(400)]),
      PhysicalAddress: new FormControl('', [Validators.maxLength(100)]),
      PhysicalAddress2: new FormControl('', [Validators.maxLength(100)]),
      Country: new FormControl('', []),
      City: new FormControl('', [Validators.maxLength(50)]),
      StateId: new FormControl('', []),
      PostalCode: new FormControl('', [Validators.maxLength(10)]),
      PaymentResponsibility: new FormControl(''),
      //TemAccountNumber: new FormControl(''),
      AllowCCManualEditOptions: new FormControl('Yes', [Validators.required]),
      KeepForProduction:new FormControl(false),
      TwoFactorEnabled: new FormControl(false),
      MFAContactName: new FormControl('', [Validators.maxLength(60)]),
      MFAContactEmail: new FormControl('', [Validators.maxLength(60),Validators.email, Validators.pattern('^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[a-z]{2,4}$')]),

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
      BillPayOption: new FormControl('', []),
    });

    for (let i = 1; i <= 31; i++) {
      this.days.push({ Id: i, value: i, stringValue: i.toString() });
    }
    this.days.unshift({Id: "none", value : "none", stringValue: "None" })
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.clickOnSearchButton && changes && changes['clickOnSearchButton'] && changes['clickOnSearchButton']['currentValue']) {
      this.addCustomerForm.controls['ManagingAccountId'].setValue(this.selectedWiseTemDD[this.selected].id);
      this.clickOnSearchButton = false;
      this.setClickFalse.emit(false);
    }
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

            if (this.selectedTem && this.selectedTem !== 'all') {
              this.addCustomerForm.controls['ManagingAccountId'].setValue(Number(this.selectedTem));
            }
          }

          if (this.selectedWiseTemDD[this.selected]?.id !== 'all') {
            // this.addCustomerForm.controls['ManagingAccountId'].setValue(this.selectedWiseTemDD[this.selected].id);
          }
        }
      });
  }
  
  ngOnInit() {
    this.viewNEdit = rolePermission(['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser', 'SuperTEM']);
    this.hasSsuperTemUsers = rolePermission(['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser']);
    this.currentOpenEditPage.emit(false);
    this.isSuperTEMUsers = this.locationService.isUserHasSuperTEMUsersRole();
    if(this.isSuperTEMUsers) {
      this.getTemLists();
      this.temReqired = true;
      this.addCustomerForm.get('ManagingAccountId')?.setValidators([Validators.required]);
    } else {
      this.temReqired = false;
      this.addCustomerForm.get('ManagingAccountId')?.setValidators([]);
    }
    this.addCustomerForm.get('ManagingAccountId')?.updateValueAndValidity();
    if (this.accountData) {
      this.addCustomerForm.patchValue(this.accountData);
    }
    this.getCountry();
  }

  counter(i: number) {
    return new Array(i);
  }

  changeMFAvalue($event: any){
    if($event.value == true || $event.value == 'true'){
      this.addCustomerForm.get('MFAContactEmail')?.setValidators([Validators.required,Validators.maxLength(60),Validators.email, Validators.pattern('^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[a-z]{2,4}$')]);
      this.isMFAon = true;
      this.addCustomerForm.get('MFAContactName')?.setValidators([Validators.required,Validators.maxLength(60)]);
    } else {
      this.isMFAon = false;
      this.addCustomerForm.get('MFAContactEmail')?.setValidators([Validators.maxLength(60),Validators.email, Validators.pattern('^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[a-z]{2,4}$')]);
      this.addCustomerForm.get('MFAContactName')?.setValidators([Validators.maxLength(60)]);
    }
    this.addCustomerForm.get('MFAContactEmail')?.updateValueAndValidity();
    this.addCustomerForm.get('MFAContactName')?.updateValueAndValidity();
  }

  get f() {
    return this.addCustomerForm.controls;
  }

  getCountry() {
    this.locationService.getCountries().subscribe((data: any) => {
      if (data) {
        let countryArray = data.$values;
        this.countries =countryArray;
        this.onCountrySelect();
      }
    });
  }

  onCountrySelect() {
    if (this.f['Country'].valid && this.f['Country'].value) {
      this.locationService.getStates(this.f['Country'].value).subscribe((data: any) =>{
          if (data){
              this.states =data.$values;
          }
      });

    }
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

  onBillPayChange() {
    if (this.f['BillPayOption'].value && this.f['BillPayOption'].value === 'Yes') {
      this.isBillPay = true;
      this.f['PaymentResponsibility'].patchValue('TEM');
    } else {
      this.isBillPay = false;
      this.f['PaymentResponsibility'].patchValue('Customer');
    }
  }

  checkAddressValidation() {
  
    if ((this.f['PhysicalAddress'].value !== '') || (this.f['City'].value && !this.f['City'].value.startsWith(" ")) || (this.f['Country'].value !== '') || (this.f['StateId'].value !== '') || (this.f['PostalCode'].value && !this.f['PostalCode'].value.startsWith(" ")) ) {
      this.isShowAsterisk = true;
      
      this.addCustomerForm.get('PhysicalAddress')?.setValidators([Validators.required]);
      this.addCustomerForm.get('City')?.setValidators([Validators.required]);
      this.addCustomerForm.get('Country')?.setValidators([Validators.required]);
      this.addCustomerForm.get('StateId')?.setValidators([Validators.required]);
      this.addCustomerForm.get('PostalCode')?.setValidators([Validators.required]);
    } else {
      this.isShowAsterisk = false;
      this.addCustomerForm.get('PhysicalAddress')?.clearValidators();
      this.addCustomerForm.get('City')?.clearValidators();
      this.addCustomerForm.get('Country')?.clearValidators();
      this.addCustomerForm.get('StateId')?.clearValidators();
      this.addCustomerForm.get('PostalCode')?.clearValidators();
    }

    this.addCustomerForm.get('PhysicalAddress')?.updateValueAndValidity();
    this.addCustomerForm.get('City')?.updateValueAndValidity();
    this.addCustomerForm.get('Country')?.updateValueAndValidity();
    this.addCustomerForm.get('StateId')?.updateValueAndValidity();
    this.addCustomerForm.get('PostalCode')?.updateValueAndValidity();
  }



  saveCustomer(): any {
    this.isCustomerFormSubmit = true;

    if(this.f['ReconStatus'].value == false && this.f['CostAllocationStatus'].value == true){
      return this.addCustomerForm.invalid;
    }

    if(this.f['ApprovalStatus'].value == true && (this.f['CostAllocationStatus'].value == false || this.f['ReconStatus'].value == false)){
      return this.addCustomerForm.invalid;
    }

    if (this.addCustomerForm.valid) {
      this.saveButtonLoadder = true;
      const formData = this.addCustomerForm.value;
      const data = this.addCustomerForm.getRawValue();
      data.CostAllocationEditStatus = formData.CostAllocationEditStatus ? formData.CostAllocationEditStatus : null;
      // data.Active = data.Active == 'true' ? true : false;
      // data.Active = data.Active || data.Active == 'true' ? true : false;
      data.StateId = data.StateId === '' ? 0 : data.StateId;
      this.locationService.addAccount(data).subscribe({
        next: data => {
          this.saveButtonLoadder = false;
          let errorData: any = {
            messgeType: "error",
            title: "Attention",
            titleClass: "text-c-blue",
            icon: "fas fa-exclamation-circle",
            iconClass: "text-c-blue f-70",
            message: data.Message
          }
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
          dialogRef.afterClosed().subscribe(result => {
            if(data.Success)
              this.onCustomerAddEvent.emit(true);
          });

        },
        error: error => {
          this.saveButtonLoadder = false;
          let errorMessage: any = '';
          if (error.status === 400) {
            errorMessage = error.error ? 'Customer account  with same Customer Name already  exists.' : 'Bad request';
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
      return this.addCustomerForm.invalid;
    }
  }
  ngOnDestroy() {
    this._unsubscribeTEM.next(null);
    this._unsubscribeTEM.complete();
    this.onCustomerComponetDestroy.emit(this.addCustomerForm.value);
  }

  checkAddressValidation2() {
    if ((this.f['PhysicalAddress2'].value && !this.f['PhysicalAddress2'].value.startsWith(" "))) {
      this.isShowAsterisk = true;
      this.addCustomerForm.get('PhysicalAddress')?.setValidators([Validators.required]);
      this.addCustomerForm.get('City')?.setValidators([Validators.required]);
      this.addCustomerForm.get('Country')?.setValidators([Validators.required]);
      this.addCustomerForm.get('StateId')?.setValidators([Validators.required]);
      this.addCustomerForm.get('PostalCode')?.setValidators([Validators.required]);
    } else {
      this.isShowAsterisk = false;
      this.addCustomerForm.get('PhysicalAddress')?.clearValidators();
      this.addCustomerForm.get('City')?.clearValidators();
      this.addCustomerForm.get('Country')?.clearValidators();
      this.addCustomerForm.get('StateId')?.clearValidators();
      this.addCustomerForm.get('PostalCode')?.clearValidators();
    }
    this.addCustomerForm.get('PhysicalAddress')?.updateValueAndValidity();
    this.addCustomerForm.get('City')?.updateValueAndValidity();
    this.addCustomerForm.get('Country')?.updateValueAndValidity();
    this.addCustomerForm.get('StateId')?.updateValueAndValidity();
    this.addCustomerForm.get('PostalCode')?.updateValueAndValidity();
  }
}
