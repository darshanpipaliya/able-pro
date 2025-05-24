import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import moment from 'moment';
import * as _ from 'lodash';
import { LocationService } from 'src/app/services/location.service';
import { SessionStorageService } from 'src/app/services/session-storage.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { isValueExist, rolePermission } from 'src/app/services/helper';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { LinkLocationPopupComponent } from '../link-location-popup/link-location-popup.component';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { SpaceTrimStartEndInputirective } from 'src/app/custom-directives/custom-validation.directive';
@Component({
  selector: 'app-add-people',
  templateUrl: './add-people.component.html',
  styleUrls: ['./add-people.component.scss'],
  standalone: true,
  imports: [
    SharedModule,
    PrimgModule,
    SpaceTrimStartEndInputirective
  ]
})
export class AddPeopleComponent implements OnInit {

  public loadingSetPromary = false;

  submitted: boolean = false;
  saveButtonLoader = false;
  activityDataSource: any = [];
  notesRowData: any[];
  cols: any[];

  customers: any = [];
  contacttypes: any = [];
  companies: any = [];
  sourceLocations: any;
  source: Array<any> = [];
  confirmed: Array<any> = [];
  managerList: any = [];
  companyLocations = [];
  ELEMENT_DATA_ACTIVITY: any = [];
  prevRoles: any = [];
  userVerified: any = false;
  viewNEdit: any = false;
  isDisabled: boolean = false;
  isResetpwdDisable: boolean;
  isCompanyUser: boolean = false;

  peopleForm: any;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  private _unsubscribeManager: Subject<any> = new Subject<any>();
  private _unsubscribeLocation: Subject<any> = new Subject<any>();
  private _unsubscribeState: Subject<any> = new Subject<any>();
  private _unsubscribeContact: Subject<any> = new Subject<any>();
  private _unsubscribeCustomer: Subject<any> = new Subject<any>();
  private _unsubscribeManagerPeople: Subject<any> = new Subject<any>();
  private _unsubscribeNotes: Subject<any> = new Subject<any>();

  primaryLocationId = '';
  setTemDDValue: any;
  customersLoader = false;
  @Input() action: String;
  @Input() peopleData: any;
  @Input() selectedTem: any;
  @Input() selectedWiseTemDD: any;
  @Input() selected: any;
  @Input() clickOnSearchButton: any;
  @Output() onAddButton: EventEmitter<any> = new EventEmitter<any>();
  @Output() currentOpenEditPage: EventEmitter<any> = new EventEmitter<any>();
  @Output() onUserAddEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() onUnlockButtonClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() onUserVerified: EventEmitter<any> = new EventEmitter<any>();
  @Output() setTemDDValueEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() setClickFalse: EventEmitter<any> = new EventEmitter<any>();
  @Output() addPeopleForm: EventEmitter<any> = new EventEmitter<any>();

  @Input() lockUserInput: any;
  @Input() userByEmilData: any;
  @Input() addData: any;
  @ViewChild('BlockEmailTool') BlockEmailTool!: TemplateRef<any>;

  CompanyAdmin = false;
  CustomerAdmin = false;
  CompanyManager = false;
  editTabDisabled: boolean = false;
  selfRecord = false;
  isOnlyCompanyUser = false;

  roleOptions: any = [
    { 'label': 'Customer Admin', 'value': 'CustomerAdmin' },
    { 'label': 'Company Admin', 'value': 'CompanyAdmin' },
    { 'label': 'Company Manager', 'value': 'CompanyManager' },
    { 'label': 'Company User', 'value': 'CompanyUser' },
    { 'label': 'None', 'value': 'None' }
  ];
  portalAccessOptions: any = [
    { 'label': 'Invoice', 'value': 'PortalInvoice' },
    { 'label': 'Ticketing', 'value': 'PortalTicketing' },
    { 'label': 'Wireless', 'value': 'PortalWireless' },

  ];
  otherAccessOptions: any = [
    { 'label': 'Approvals', 'value': 'Approvals' },
    { 'label': 'Bill Pay', 'value': 'BillPay' },
    { 'label': 'Other', 'value': 'Other' }
  ]
  cities = [
    { name: 'New York', value: 'New York' },
    { name: 'Rome', value: 'Rome' },
    { name: 'London', value: 'London' },
    { name: 'Istanbul', value: 'Istanbul' },
    { name: 'Paris', value: 'Paris' }
  ];
  statusList = [
    { Id: true, Name: 'Active' },
    { Id: false, Name: 'Inactive' },
  ]

  blockEmailList = [
    { Id: true, Name: 'Yes' },
    { Id: false, Name: 'No' },
  ]

  userAcccount = [
    { Id: true, Name: 'Locked' },
    { Id: false, Name: 'Unlocked' }
  ]

  emailVerificationList = [
    { Id: true, Name: 'Verified' },
    { Id: false, Name: 'Not Verified' }
  ]

  items: any;
  isRoleAccess: any;
  emailPattern = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$';
  constructor(private locationService: LocationService, private fb: FormBuilder, public dialog: MatDialog, private sessionStorageService: SessionStorageService, private localStorageService: LocalStorageService) {

    this.cols = [
      { field: 'PeopleNoteCreatedDate', header: 'Date' },
      { field: 'Notes', header: 'Note' },
      { field: 'attachment', header: 'Attachment' }
    ];

  }
  isDisablePortal = false;

  ngOnInit(): void {

    this.currentOpenEditPage.emit(this.action === 'Edit' ? true : false);
    this.viewNEdit = rolePermission(['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser', 'SuperTEM', 'CompanyAdmin', 'CustomerAdmin', 'CompanyManager', 'TEMAdmin', 'TEMUser', 'TEMManager']);
    this.isRoleAccess = rolePermission(['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser', 'CompanyAdmin', 'CustomerAdmin', 'CompanyManager', 'CompanyUser', 'TEMAdmin'])
    this.isResetpwdDisable = rolePermission(['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser', 'TEMAdmin']);
    this.isCompanyUser = rolePermission(['CompanyManager', 'CompanyUser', 'CompanyAdmin']);
    this.isOnlyCompanyUser = rolePermission(['CompanyUser']);
    this.setPeopleForm();
    this.CompanyAdmin = this.sessionStorageService.getObjectValue('userRoles')?.includes("CompanyAdmin");
    this.CustomerAdmin = this.sessionStorageService.getObjectValue('userRoles')?.includes("CustomerAdmin");

    this.roleOptions = [
      { 'label': 'Customer Admin', 'value': 'CustomerAdmin', disabled: (this.CustomerAdmin || this.CompanyAdmin) ? true : false },
      { 'label': 'Company Admin', 'value': 'CompanyAdmin', disabled: this.CompanyAdmin ? true : false },
      { 'label': 'Company Manager', 'value': 'CompanyManager', disabled: false },
      { 'label': 'Company User', 'value': 'CompanyUser', disabled: false },
      { 'label': 'None', 'value': 'None', disabled: false }
    ];

    if (this.isOnlyCompanyUser) {
      this.peopleForm.disable();
    }

    this.getCustomerForUser();
    this.getcontacttypes();

    if (this.action == 'Edit') {
      this.getPeopleNotes();
      this.setPeopleData();
      if (this.peopleData && this.peopleData.CustomerAccountId) {
        this.getManagerofPeople(this.peopleData.CustomerAccountId);
      }
    } else {
      if (this.addData) {
        this.form.patchValue(this.addData);
      }
    }

    this.peopleForm.controls['role'].valueChanges.subscribe((value?:any) => {
      if (value !== 'None') {
        this.isDisablePortal = false;
        Object.keys(this.peopleData.UserRolesData).forEach((key) => {

          this.portalAccessOptions.forEach((element:any) => {
            if (element.value === this.peopleData.UserRolesData[key]) {
              element.checked = true;
            }
          });

          this.otherAccessOptions.forEach((element:any) => {
            if (element.value === this.peopleData.UserRolesData[key]) {
              element.checked = true;
            }
          });
          this.peopleForm.patchValue({
            'portalRoles': this.portalAccessOptions,
            'otherRoles': this.otherAccessOptions
          });
        });
      } else {
        this.isDisablePortal = true;
        Object.keys(this.peopleData.UserRolesData).map((key) => {
          this.portalAccessOptions.forEach((element:any) => {
            element.checked = false;
          });
          this.otherAccessOptions.forEach((element:any) => {
            element.checked = false;
          });
          this.peopleForm.patchValue({
            'portalRoles': this.portalAccessOptions,
            'otherRoles': this.otherAccessOptions
          });
        });
      }
    });
  }

  downloadPeopleAttachment(rowData:any) {
    this.locationService.downloadPeopleNote(rowData.PeopleNoteId).subscribe({
      next: dataa => {
        let bolbUrl = URL.createObjectURL(dataa);
        var link = document.createElement("a");
        link.setAttribute("href", bolbUrl);

        link.setAttribute("download", rowData.UploadFileName);
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
      error: error => {

      }
    });
  }

  getPeopleNotes() {


    const data = {
      "peopleId": this.peopleData.PeopleId,
      "privateNote": false,
      "status": true,
      "isNeed3RecordOnly": true
    }
    this._unsubscribeNotes.next(null);
    this.locationService.getPeopleNotes(data).pipe(takeUntil(this._unsubscribeNotes)).subscribe((res: any) => {
      if (res && res.Success) {
        this.notesRowData = res.Data.$values;

        _.map(this.notesRowData, (res: any) => {
          if (res['PeopleNoteCreatedDate']) {
            const d = res;
            let str = res['PeopleNoteCreatedDate'];
            let array = str.split('T');
            d['PeopleNoteCreatedDate'] = moment(res['PeopleNoteCreatedDate']).format('MM/DD/YYYY');
            return d;
          }
        });
      } else {
        this.notesRowData = [];

      }
    }, (error) => {
      this.notesRowData = [];
    });


  }

  getCustomerForUser(id = '') {
      const idd = id ? Number(id) : this.action === 'Add' ? this.selectedWiseTemDD[this.selected].id : id;
      if (idd && idd !== 'all') {
        this.customers = [];
        this.customersLoader = true;
        this._unsubscribeCustomer.next(null);
        this.locationService.getCustomerDropdownByNewTEM(idd).pipe(takeUntil(this._unsubscribeCustomer)).subscribe((data) => {
          if (data && data.Data.$values) {
            this.customersLoader = false;
            this.setTemDDValueEvent.emit(idd);
            this.customers = data.Data.$values.map((r:any) => { 
              let a:any = {};
              a = r;
              a['AccountID'] = r.Id;
              return a;
            });

          } else {
            this.customers = [];
            this.customersLoader = false;
            this.setTemDDValueEvent.emit(idd);
          }
        }, error => {
          this.customers = [];
          this.customersLoader = false;
          this.setTemDDValueEvent.emit(idd);
        });
      } else {
        this.customers = [];
        this.customersLoader = true;
        this._unsubscribeCustomer.next(null);
        this.locationService.getCustomerDropDown().pipe(takeUntil(this._unsubscribeCustomer)).subscribe((data) => {
          if (data && data.$values) {
            this.customers = data.$values;
            this.customersLoader = false;
            this.setTemDDValueEvent.emit((this.action === 'Add' && this.selectedWiseTemDD[this.selected].id === 'all') ? 'all' : idd);
            if (this.peopleData && this.peopleData.CustomerAccountId) {
              const data1:any = this.customers.find((res:any) => res.Id === this.peopleData.CustomerAccountId);
              this.setTemDDValue = data1.TemAccountID;
              this.setTemDDValueEvent.emit(this.setTemDDValue);
            }
          } else {
            this.customers = [];
            this.customersLoader = false;
          }
        }, error => {
          this.customers = [];
          this.customersLoader = false;
        });
      }

  }

  getManagerofPeople(id: any) {
    let KeyString: string = '';
    if (!KeyString && this.peopleData?.PeopleId) {
      KeyString = `?PeopleId=${this.peopleData.PeopleId || ''}`;
    }

    const data = {
      customerAccountId: id
    }
    this._unsubscribeManagerPeople.next(null);
    this.locationService.getManagerByPeople(KeyString, data).pipe(takeUntil(this._unsubscribeManagerPeople)).subscribe((response) => {
      if (response.Success)
        this.managerList = response.Data.$values;
    });
  }

  getManager(id: any) {

    const data = {
      customerAccountId: id
    }
    this._unsubscribeManager.next(null);
    this.locationService
      .getManagerList(data)
      .pipe(takeUntil(this._unsubscribeManager))
      .subscribe((data) => {
        if (data && data.Data.$values) {
          this.managerList = data.Data.$values;
        }
      });
  }

  linkLocationPopup() {
    const dialogRef = this.dialog.open(LinkLocationPopupComponent, {
      width: '900px',
      data: {
        linkLocation: this.companyLocations,
        action: this.action,
        peopleData: this.peopleData,
        customerId: this.f.accountId.value,
        selectedLocation: this.source,
        primaryCompanyLocationId: this.f.primaryCompanyLocationId.value
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result == true) {
        this.getLocationByCustomer(this.f.accountId.value);
      }
      else if (result && result.checkedData) {
        this.source = result.checkedData;
        let locations = result.checkedData;
        this.primaryLocationId = result.primaryCompanyLocationId;
        this.setValueInFormControl('primaryCompanyLocationId', isValueExist(result.primaryCompanyLocationId));

        this.source = locations.map((r:any) => {
          let a:any = {};
          a = r;
          a['LocationDisplay'] = r.CompanyName + '/' + r.LocationName + '/' + r.Address1 + '/' + r.City + '/' + r.StateName
          a['PrimaryLocation'] = result.primaryLocationId == r.LocationId ? true : null
          return a;
        })
      }
    });
  }

  ngOnChanges(changes:any) {
    if (this.clickOnSearchButton && changes && changes['clickOnSearchButton'] && changes['clickOnSearchButton']['currentValue']) {
      this.getCustomerForUser();
      this.clickOnSearchButton = false;
      this.setClickFalse.emit(false);
    }
    if (this.peopleData) {
      this.peopleData.UserAccountState = this.lockUserInput;
      this.updateMenuItems();
    }
  }

  getPeopleDetail(peopleId:any) {

    if (!this.peopleData) {
      this.locationService.getPeopleDetail(peopleId).subscribe((response:any) => {
        this.peopleData = response.Data;
        this.setPeopleData();
      })
    }

  }

  verfiyUser() {
    this.locationService.verifyUser(this.peopleData.PeopleEmail).subscribe({
      next: data => {
        let errorData: any = {
          messgeType: "error",
          title: "Attention",
          titleClass: "text-c-blue",
          icon: "fas fa-exclamation-circle",
          iconClass: "text-c-blue f-70",
          message: data
        }
        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
        dialogRef.afterClosed().subscribe(result => {
        });
        this.peopleData.UserEmailVerified = 'Verified';
        this.onUserVerified.emit(true);
        this.userVerified = true;
        this.updateMenuItems();
        this.getPeopleDetail(this.peopleData.PeopleId);
      },
      error: error => {
        let errorData: any = {
          messgeType: "error",
          title: "Attention",
          titleClass: "text-c-blue",
          icon: "fas fa-exclamation-circle",
          iconClass: "text-c-blue f-70",
          message: error.error
        }
        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
      }
    })
  }

  unlockUser() {
    this.locationService.unlockUser(this.peopleData.PeopleEmail).subscribe((result) => {
      this.peopleData.UserAccountState = 'Unlocked';
      let errorData: any = {
        messgeType: "error",
        title: "Attention",
        titleClass: "text-c-blue",
        icon: "fas fa-exclamation-circle",
        iconClass: "text-c-blue f-70",
        message: result //if messges is multiple use array
      }
      const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
      dialogRef.afterClosed().subscribe(result => {
      });
      this.updateMenuItems();
      this.getPeopleDetail(this.peopleData.PeopleId);
      this.onUnlockButtonClick.emit(true);
    })
  }

  updateMenuItems() {
    this.items = [{
      label: 'Options',
      items: [{
        label: 'Verified',
        icon: 'pi pi-check',
        command: () => {
          this.verfiyUser();
        },
        disabled: this.userVerified
      },
      {
        label: 'Resend Verification',
        icon: 'pi pi-envelope',
        command: () => {
          this.sendEmailVerification();
        },
        disabled: this.userVerified
      },
      {
        label: 'Reset Password',
        icon: 'fas fa-user-lock',
        command: () => {
          this.forgotPassword();
        },
        disabled: !this.userVerified || !this.isResetpwdDisable
      },
      {
        label: this.peopleData.UserAccountState === 'Unlocked' ? 'Lock User' : 'Unlock User',
        icon: this.peopleData.UserAccountState === 'Unlocked' ? 'pi pi-lock' : 'pi pi-unlock',
        command: () => {
          this.peopleData.UserAccountState === 'Unlocked' ? this.lockUser() : this.unlockUser();
        },
      }

      ]
    }
    ];
  }

  forgotPassword() {
    const data = { 'email': this.peopleData.PeopleEmail }
    this.locationService.forgetPwd(data).subscribe({
      next: data => {
        let errorData: any = {
          messgeType: "error",
          title: "Attention",
          titleClass: "text-c-blue",
          icon: "fas fa-exclamation-circle",
          iconClass: "text-c-blue f-70",
          message: "Reset password link sent successfully." //if messges is multiple use array
        }
        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
        dialogRef.afterClosed().subscribe(result => {
        });
      },
      error: error => {
        if (error.status === 200) {
          // this.locationService.showToster({ type: 'error', message: 'Something Wrong !' });
          let errorData: any = {
            messgeType: "error",
            title: "Attention",
            titleClass: "text-c-blue",
            icon: "fas fa-exclamation-circle",
            iconClass: "text-c-blue f-70",
            message: error.error.text //if messges is multiple use array
          }
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
        }
        else {
          let errorData: any = {
            messgeType: "error",
            title: "Attention",
            titleClass: "text-c-blue",
            icon: "fas fa-exclamation-circle",
            iconClass: "text-c-blue f-70",
            message: error.error
          }
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
        }
      }
    });
  }

  sendEmailVerification() {
    this.locationService.emailVerficiationSend(this.peopleData.PeopleEmail).subscribe(() => {
      let errorData: any = {
        messgeType: "error",
        title: "Attention",
        titleClass: "text-c-blue",
        icon: "fas fa-exclamation-circle",
        iconClass: "text-c-blue f-70",
        message: 'Email verification sent successfully'
      }
      const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
      dialogRef.afterClosed().subscribe(result => {
      });
    });
  }

  lockUser() {
    this.locationService.lockUser(this.peopleData.PeopleEmail).subscribe((result) => {
      if (result.includes('successfully')) {
        this.peopleData.UserAccountState = 'Locked';
        this.updateMenuItems();
        this.getPeopleDetail(this.peopleData.PeopleId);
      }
      let errorData: any = {
        messgeType: "error",
        title: "Attention",
        titleClass: "text-c-blue",
        icon: "fas fa-exclamation-circle",
        iconClass: "text-c-blue f-70",
        message: result //if messges is multiple use array
      }
      const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
      dialogRef.afterClosed().subscribe(result => {
      });
      this.onUnlockButtonClick.emit(false);
    })
  }
  getUserByEmail() {
    if(this.peopleData.UserId) {
      if (this.peopleData && this.peopleData.PeopleEmail) {
        this.locationService.getUserByEmail(this.peopleData.UserId).subscribe((data) => {
          if (data) {
            this.createFormInEditMode(data);
          }
        });
      }
    }
  }
  convertToDateTime(date: any) {
    return moment(new Date(date)).format('MM/DD/YYYY h:mm a');
  }

  createFormInEditMode(data: any) {
    let editUserData: any = {};
    editUserData = data;
    editUserData.PrimaryMobile = editUserData.PrimaryMobile ? editUserData.PrimaryMobile : '';
    editUserData.PrimaryLandline = editUserData.PrimaryLandline ? editUserData.PrimaryLandline : '';
    editUserData['UserDefaultCompanyID'] = (editUserData.DefaultCompanyID) ? editUserData.DefaultCompanyID : '';
    this.ELEMENT_DATA_ACTIVITY = (data.ActionHistories) ? data.ActionHistories.$values : [];
    this.activityDataSource = this.ELEMENT_DATA_ACTIVITY;
    if (data.Roles && data.Roles.$values.length > 0) {
      editUserData.roles = [];
      let roleOptions = this.roleOptions;

      data.Roles.$values.map((key:any) => {
        this.portalAccessOptions.forEach((element:any) => {
          if (element.value === this.peopleData.UserRolesData[key]) {
            element.checked = true;
          }
        });
        this.otherAccessOptions.forEach((element:any) => {
          if (element.value === this.peopleData.UserRolesData[key]) {
            element.checked = true;
          }
        });

        this.peopleForm.patchValue(
          {
            'portalRoles': this.portalAccessOptions,
            'otherRoles': this.otherAccessOptions
          });
        roleOptions.forEach((element:any) => {
          if (element.value === data.Roles.$values[key]) {
            element.checked = true;
            editUserData.roles = data.Roles.$values[key];
          }
        });
      });

    }
    this.peopleForm.patchValue(editUserData);
  }

  setPeopleForm() {
    this.peopleForm = this.fb.group({
      accountId: new FormControl('', [Validators.required]),
      companyId: new FormControl('', [Validators.required]),
      userFirstName: new FormControl('', [Validators.maxLength(50),Validators.required]),
      userLastName: new FormControl('', [Validators.maxLength(50),Validators.required]),
      emailAddress: new FormControl('', [Validators.maxLength(250), Validators.required, Validators.pattern(this.emailPattern)]),
      blockEmail: new FormControl(false),
      userDeskPhone: new FormControl('', [Validators.maxLength(100)]),
      cellPhone: new FormControl('', [Validators.maxLength(100)]),
      employeeId: new FormControl('', [Validators.maxLength(50)]),
      managerId: new FormControl(null),
      userTitle: new FormControl('', [Validators.maxLength(50)]),
      department: new FormControl('', [Validators.maxLength(50)]),
      active: new FormControl(true, [Validators.required]),
      customerContactTypeId: new FormControl('', []),
      contactCustomField1: new FormControl('', [Validators.maxLength(120)]),
      contactCustomField2: new FormControl('', [Validators.maxLength(120)]),
      contactCustomField3: new FormControl('', [Validators.maxLength(120)]),
      contactCustomField4: new FormControl('', [Validators.maxLength(120)]),
      countryID: new FormControl('', []),
      stateID: new FormControl('', []),
      primaryCompanyLocationId: new FormControl(''),

      portalRoles: this.fb.array(
        this.portalAccessOptions.map((r:any) =>
          this.fb.group({
            label: r.label,
            value: r.value,
            checked: this.fb.control(r?.checked)
          })
        ),
        [Validators.required]
      ),

      otherRoles: this.fb.array(
        this.otherAccessOptions.map((r:any) =>
          this.fb.group({
            label: r.label,
            value: r.value,
            checked: this.fb.control(r?.checked)
          })
        ),
        [Validators.required]
      ),

      role: new FormControl('None'),
      userAccountStateLock: new FormControl(''),
      emailVerified: new FormControl(''),
      ConfirmLocations: new FormControl(''),
    });
    if (this.f.role.value == 'None') {
      this.isDisablePortal = true;
    }
  }

  get portalRoleList() {
    return <FormArray>this.peopleForm.get("portalRoles");
  }
  get otherRoleList() {
    return <FormArray>this.peopleForm.get("otherRoles");
  }

  setPeopleData() {
    if (this.peopleData) {
      this.setValueInFormControl('accountId', isValueExist(this.peopleData.CustomerAccountId))
      this.setValueInFormControl('companyId', isValueExist(this.peopleData.CompanyId))
      this.setValueInFormControl('customerContactTypeId', isValueExist(this.peopleData.CustomerContactTypeId))
      this.setValueInFormControl('emailAddress', isValueExist(this.peopleData.PeopleEmail))
      this.setValueInFormControl('userFirstName', isValueExist(this.peopleData.PeopleFirstName))
      this.setValueInFormControl('userLastName', isValueExist(this.peopleData.PeopleLastName))
      this.setValueInFormControl('userTitle', isValueExist(this.peopleData.PeopleUserTitle))
      this.setValueInFormControl('employeeId', isValueExist(this.peopleData.EmployeeId))
      this.setValueInFormControl('userDeskPhone', isValueExist(this.peopleData.DeskPhone))
      this.setValueInFormControl('cellPhone', isValueExist(this.peopleData.CellPhone))
      this.setValueInFormControl('department', isValueExist(this.peopleData.Department))
      this.setValueInFormControl('contactCustomField1', isValueExist(this.peopleData.PeopleCustomField1))
      this.setValueInFormControl('contactCustomField2', isValueExist(this.peopleData.PeopleCustomField2))
      this.setValueInFormControl('contactCustomField3', isValueExist(this.peopleData.PeopleCustomField3))
      this.setValueInFormControl('contactCustomField4', isValueExist(this.peopleData.PeopleCustomField4))
      this.setValueInFormControl('userAccountStateLock', this.peopleData.UserAccountState == 'Locked' ? true : false)
      this.setValueInFormControl('active', this.peopleData.PeopleStatusDisplayValue == 'Active' ? true : false)
      this.setValueInFormControl('managerId', isValueExist(this.peopleData.ManagerId));
      this.setValueInFormControl('primaryCompanyLocationId', isValueExist(this.peopleData.PrimaryCompanyLocationId));
      this.setValueInFormControl('blockEmail', this.peopleData.UserBlockEmail == 'Yes' ? true : false);
      this.setValueInFormControl('emailVerified', this.peopleData.UserEmailVerified == 'Verified' ? true : false)
      this.userVerified = this.peopleData.UserEmailVerified == 'Verified' ? true : false;
      if (this.action == 'Edit' && this.peopleData && this.peopleData.UserId !== null) {

        this.getUserByEmail();
      }
      this.getUserompaniesByAccountId(this.peopleData.CustomerAccountId);
      this.updateMenuItems();
      this.primaryLocationId = this.peopleData.PrimaryCompanyLocationId;

      if (this.peopleData.CustomerDisplayRole !== null) {
        Object.keys(this.peopleData.UserRolesData).forEach((key) => {

          this.portalAccessOptions.forEach((element:any) => {
            if (element.value === this.peopleData.UserRolesData[key]) {
              element.checked = true;
            }
          });

          this.otherAccessOptions.forEach((element:any) => {
            if (element.value === this.peopleData.UserRolesData[key]) {
              element.checked = true;
            }
          });
          this.peopleForm.patchValue(
            {
              'portalRoles': this.portalAccessOptions,
              'otherRoles': this.otherAccessOptions
            });
          this.roleOptions.forEach((element:any) => {
            if (element.value === this.peopleData.UserRolesData[key]) {
              element.selected = true;
              this.setValueInFormControl('role', element.value)
            }
          });
        });

        this.CustomerAdmin = this.sessionStorageService.getObjectValue('userRoles')?.includes("CustomerAdmin");
        this.CompanyAdmin = this.sessionStorageService.getObjectValue('userRoles')?.includes("CompanyAdmin");
        this.CompanyManager = this.sessionStorageService.getObjectValue('userRoles')?.includes("CompanyManager");

        // Mihir - changes for auth
        if ((this.CompanyAdmin || this.CustomerAdmin || this.CompanyManager) && this.peopleData.UserId
          === this.sessionStorageService.getObjectValue('userInfo').id) {
          this.selfRecord = true;
        }
        if (this.selfRecord) {
          this.editTabDisabled = false;
          this.peopleForm.enable();
        }

        if (this.CustomerAdmin && (this.peopleData.CustomerDisplayRole === 'CustomerAdmin' || this.peopleData.CustomerDisplayRole === 'Customer Admin') && !this.selfRecord) {
          this.editTabDisabled = true;
        }

        if (this.CompanyAdmin && (this.peopleData.CustomerDisplayRole === 'CompanyAdmin' || this.peopleData.CustomerDisplayRole === 'CustomerAdmin' || this.peopleData.CustomerDisplayRole === 'Company Admin' || this.peopleData.CustomerDisplayRole === 'Customer Admin') && !this.selfRecord) {
          this.editTabDisabled = true;
        }

        if (this.CompanyManager && (this.peopleData.CustomerDisplayRole === 'CompanyAdmin'
          || this.peopleData.CustomerDisplayRole === 'CustomerAdmin' || this.peopleData.CustomerDisplayRole === 'CompanyManager' ||
          this.peopleData.CustomerDisplayRole === 'Company Admin' || this.peopleData.CustomerDisplayRole === 'Customer Admin'
          || this.peopleData.CustomerDisplayRole === 'Company Manager') && !this.selfRecord) {
          this.editTabDisabled = true;
        }

        this.roleOptions = [
          { 'label': 'Customer Admin', 'value': 'CustomerAdmin', disabled: (this.CustomerAdmin || this.CompanyAdmin || this.CompanyManager) ? true : false },
          { 'label': 'Company Admin', 'value': 'CompanyAdmin', disabled: (this.CompanyAdmin || this.CompanyManager) ? true : false },
          { 'label': 'Company Manager', 'value': 'CompanyManager', disabled: this.CompanyManager ? true : false },
          { 'label': 'Company User', 'value': 'CompanyUser', disabled: false },
          { 'label': 'None', 'value': 'None', disabled: false }
        ];
      }


      this.getLocationByCustomer(this.f.accountId.value);
      if (this.f.role.value == "None") {
        this.f.userAccountStateLock.disable();
        this.f.emailVerified.disable();
        this.isDisabled = true;
      }
    }
  }

  BlockEmailTooltip(): void {
    this.dialog.open(this.BlockEmailTool, {
      width: '630px',
      data: {
        colseButton: true,
      }
    });
  }

  closeModal() {
    this.dialog.closeAll();
  }

  roleChange(event:any) {
    if (event.value == 'None') {
      this.isDisabled = true;
      this.f.userAccountStateLock.disable();
      this.f.emailVerified.disable();
    } else {
      this.isDisabled = false;
      this.f.userAccountStateLock.enable();
      this.f.emailVerified.enable();
    }
  }

  getLocationByCustomer(customerAccountId:any) {
    let data:any = {};
    data['customerAccountId'] = customerAccountId;

    this.locationService.getLinkedPeopleLocation(this.peopleData.PeopleId, data).subscribe((data:any) => {
      if (data.Success) {
        this.source = data.Data.$values;
        if (this.source.length > 0) {
          let index = this.source.findIndex(item => item.PrimaryLocation == true);
          let primaryRecord = this.source.find(item => item.PrimaryLocation == true);

          if (primaryRecord) {
            this.setValueInFormControl('primaryCompanyLocationId', primaryRecord.CompanyLocationId);
          }

          this.source.unshift(this.source.splice(index, 1)[0]);
          let datas = this.source.filter(x => x.PrimaryLocation == false);
          if (this.source.length == datas.length) {
            this.setValueInFormControl('primaryCompanyLocationId', '');
          }
        }
      } else {
        this.source = [];
      }
    });
  }

  ngOnDestroy() {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
    this._unsubscribeManager.next(null);
    this._unsubscribeManager.complete();
    this._unsubscribeLocation.next(null);
    this._unsubscribeLocation.complete();
    this._unsubscribeState.next(null);
    this._unsubscribeState.complete();
    this._unsubscribeContact.next(null);
    this._unsubscribeContact.complete();
    this._unsubscribeCustomer.next(null);
    this._unsubscribeCustomer.complete();
    this._unsubscribeManagerPeople.next(null);
    this._unsubscribeManagerPeople.complete();
    this._unsubscribeNotes.next(null);
    this._unsubscribeNotes.complete();

    this.setTemDDValueEvent.emit('');
    this.addPeopleForm.emit(this.form.value);
  }

  get form() {
    return this.peopleForm;
  }

  get f() {
    return this.peopleForm.controls;
  }

  addUser() {
    this.onAddButton.emit(true);
  }

  save() {
    this.submitted = true;
    if (this.peopleForm.valid) {
      if (this.action == 'Add') {
        this.saveButtonLoader = true;
        const data = this.peopleForm.value;
        delete data.ConfirmLocations;
        delete data.countryID;
        delete data.stateID;
        delete data.portalRoles;
        delete data.otherRoles;
        delete data.userAccountStateLock;
        delete data.emailVerified;
        delete data.role;

        data.systemAccess = this.f.role.value == 'None' ? false : this.isRoleAccess;
        data.blockEmail = (data.blockEmail || data.blockEmail === 'true') ? true : false;
        data.active = (data.active || data.active === 'true') ? true : false;
        data.customerContactTypeId = (data.customerContactTypeId === '') ? null : data.customerContactTypeId;
        data.primaryCompanyLocationId = (data.primaryCompanyLocationId == '') ? null : data.primaryCompanyLocationId

        const roles: any = [];
        if (this.f.role.value) {
          roles.push(this.f.role.value)
        }
        data.rolesToAssign = roles;
        // const datas = _.forEach(this.f.portalRoles.value, (x: any) => { if (x.checked == true) roles.push(x.value) });
        if (this.f.role.value == 'None') {
          data.rolesToAssign = []
        }
        this.f.portalRoles.value.forEach((x: any) => {
          if (x.checked) {
            roles.push(x.value);
          }
        });

        this.f.otherRoles.value.forEach((x: any) => {
          if (x.checked) {
            roles.push(x.value);
          }
        });
        if (this.f.role.value === 'None') {
          data.rolesToAssign = [];
        } else {
          data.rolesToAssign = [...new Set(roles)];
        }

        if (this.source && this.source.length > 0) {
          const getIdsFromArray: any = [];
          this.source.forEach((data) => {
            getIdsFromArray.push(data.Id);
          })
          data.companyLocationIds = getIdsFromArray;
        } else {
          data.companyLocationIds = [];
        }

        this.locationService.addPeople(data).pipe(takeUntil(this._unsubscribeAll)).subscribe({
          next: (data) => {
            this.saveButtonLoader = false;
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
            dialogRef.afterClosed().subscribe(result => {
              this.onUserAddEvent.emit(true);
            });
          }
        });
      } else {
        this.saveButtonLoader = true;
        const data = this.peopleForm.value;
        delete data.ConfirmLocations;
        delete data.countryID;
        delete data.stateID;
        delete data.portalRoles;
        delete data.otherRoles;
        delete data.role;
        data.systemAccess = this.f.role.value == 'None' ? false : this.isRoleAccess;
        data.blockEmail = (data.blockEmail || data.blockEmail === 'true') ? true : false;
        data.active = (data.active || data.active === 'true') ? true : false;
        data.customerContactTypeId = (data.customerContactTypeId === '') ? null : data.customerContactTypeId;
        data.primaryCompanyLocationId = (data.primaryCompanyLocationId == '') ? null : data.primaryCompanyLocationId
        data.managerId = data.managerId == "" ? null : data.managerId;
        const roles: any = [];
        if (this.f.role.value) {
          roles.push(this.f.role.value)
        }

        data.rolesToAssign = [...new Set(roles)];

        const datas: any = [];

        // Add checked portalRoles
        _.forEach(this.f.portalRoles.value, (x: any) => {
          if (x.checked === true) {
            roles.push(x.value);
          }
        });

        // Add checked otherRoles
        _.forEach(this.f.otherRoles.value, (x: any) => {
          if (x.checked === true) {
            roles.push(x.value);
          }
        });
        if (this.isRoleAccess == true) {
          data.rolesToAssign = [...new Set(roles)];
        } else {
          data.rolesToAssign = this.peopleData.UserRolesData
        }

        if (this.f.role.value == 'None') {
          data.rolesToAssign = []
        }
        if (this.source && this.source.length > 0) {
          const getIdsFromArray: any = [];
          this.source.forEach((data) => {
            getIdsFromArray.push(data.CompanyLocationId
            );
          })
          data.companyLocationIds = getIdsFromArray;
        } else {
          data.companyLocationIds = [];
        }

        this.locationService.updatePeople(this.peopleData.PeopleId, data).pipe(takeUntil(this._unsubscribeAll)).subscribe({
          next: (data) => {
            if (data.Success) {
              this.saveButtonLoader = false;
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
              dialogRef.afterClosed().subscribe(result => {
                this.onUserAddEvent.emit(false);
              });
            } else {
              this.saveButtonLoader = false;
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
            }
          }
        });
      }
    }
  }



  getcontacttypes() {
    this._unsubscribeContact.next(null);
    this.locationService.getcontacttypes().pipe(takeUntil(this._unsubscribeContact)).subscribe((data:any) => {
      if (data && data.$values) {
        this.contacttypes = data.$values;
      }
    });
  }

  onCustomerSelect() {
    this.sourceLocations = [];
    this.source = [];
    this.confirmed = [];
    this.f.companyId.setValue('');

    if (this.f.accountId.value) {
      this.getUserompaniesByAccountId(this.f.accountId.value, true);
      this.getManager(this.f.accountId.value);
      this.getManagerofPeople(this.f.accountId.value)
    } else {
      this.companies = [];
    }
  }

  getUserompaniesByAccountId(id: any, clickFromHtml = false) {

    this.companies = [];
    this.locationService.getUserCompaniesByAccountId(id).subscribe((data) => {
      if (data && data.$values) {
        this.companies = data.$values;
      }
    }, error => {
      if (error.status === 404) {
        // this.locationService.showToster({ type: 'error', message: 'Something Wrong !' });
        let errorData: any = {
          messgeType: "error",
          title: "Attention",
          titleClass: "text-c-blue",
          icon: "fas fa-exclamation-circle",
          iconClass: "text-c-blue f-70",
          message: 'No company found within the selected customer' //if messges is multiple use array
        }
        this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
      }
    });
  }

  setValueInFormControl(key:any, value:any) {
    this.f[key].setValue(value);
  }

  onPListboxChange(value:any) {
    if (value.length === 1) {
      this.confirmed = value;
    }
    if (value.length > 1) {
      this.confirmed = [value[value.length - 1]];
    }

    // }

    this.peopleForm.controls.ConfirmLocations.patchValue('');

  }

  openPrimaryLOCPopup() {
    this.loadingSetPromary = true;


    if (this.action == 'Edit') {
      this.locationService.setContactsPrimaryLocation(this.peopleData.PeopleId, this.confirmed[0].PeopleCompanyLocationId).subscribe(
        (data) => {
          this.loadingSetPromary = false;
          let errorData: any = {
            messgeType: 'error',
            title: 'Attention',
            titleClass: 'text-c-blue',
            icon: data == 'Primary location set successfully' ? "fas fa-thumbs-up" :'fas fa-exclamation-circle',
            iconClass: 'text-c-blue f-70',
            message: data,
          };
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
            panelClass: 'error-warning',
            data: errorData,
          });
          dialogRef.afterClosed().subscribe(res => {
            if (res) {
              this.getLocationByCustomer(this.f.accountId.value);
              this.f.primaryCompanyLocationId.patchValue(this.confirmed[0].CompanyLocationId);
            }
          })
        }, error => {
          this.loadingSetPromary = false;
        });
    } else {
      this.loadingSetPromary = false;
      this.f.primaryCompanyLocationId.patchValue(this.confirmed[0].Id);
    }
  }




  onUpdateRolesArray(options: any[], isChecked: boolean, formArrayName: string, index: number): void {
    const formArray = this.form.get(formArrayName) as FormArray;

    // If the form array and the index exist, patch the specific checkbox control
    if (formArray && formArray.at(index)) {
      const control = formArray.at(index);
      control.patchValue({ checked: isChecked });
    } else {
    }
  }

}
