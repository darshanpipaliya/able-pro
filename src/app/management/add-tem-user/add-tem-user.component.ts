import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DualListComponent } from 'angular-dual-listbox';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import * as _ from 'lodash';
import { LocationService } from 'src/app/services/location.service';
import { SelectOptionService } from 'src/app/services/select-option.service';
import { rolePermission } from 'src/app/services/helper';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SpaceTrimStartEndInputirective } from 'src/app/custom-directives/custom-validation.directive';

@Component({
  selector: 'app-add-tem-user',
  templateUrl: './add-tem-user.component.html',
  styleUrls: ['./add-tem-user.component.scss'],
  standalone: true,
  imports: [SharedModule, PrimgModule, SpaceTrimStartEndInputirective]
})
export class AddTemUserComponent implements OnInit {
  addUserForm: FormGroup;
  isUserFormSubmit: boolean = false;
  accounts: any = [];
  hide = true;
  format: any = DualListComponent.DEFAULT_FORMAT;
  keepSorted = true;
  key: string;
  display: any;
  filter = true;
  source: Array<any>;
  confirmed: Array<any>;
  disabled = false;
  sourceCompanies: any;
  targetCompanies: any;
  users: any;
  companies: any = [];
  selectedCustomer: any = '';
  isUserSuperTemOrAdmin: any = false;
  isCompanyAdmin: any = false;
  isTEMManager: any = false;
  isTEMUser: any = false;
  selectedOption = '3';
  isDisabled = true;
  blockEmail = true;
  status = true;
  saveButtonLoadder = false;

  roleOptions: any = [
    { 'label': 'Super TEM Admin', 'value': 'SuperTEMAdmin' },
    { 'label': 'Super TEM Manager', 'value': 'SuperTEMManager' },
    { 'label': 'Super TEM User', 'value': 'SuperTEMUser' },
    { 'label': 'TEM Admin', 'value': 'TEMAdmin' },
    { 'label': 'TEM Manager', 'value': 'TEMManager' },
    { 'label': 'TEM User', 'value': 'TEMUser' }
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

  public separatorKeysCodes = [ENTER, COMMA];
  public emailList: any = [];
  removable = true;
  emailPattern = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$';
  @Output() onUserAddEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() currentOpenEditPage: EventEmitter<any> = new EventEmitter<any>();
  isSuperTEMManager: boolean = false;
  isSuperTEMAdmin: boolean = false;
  isSuperTEMUser: boolean = false;
  isTEMAdmin: boolean = false;
  hasSsuperTemUsers: boolean = false;
  @Input() userData: any;
  @Output() onComponetDestroy: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('BlockEmailTool') BlockEmailTool!: TemplateRef<any>;

  constructor(private locationService: LocationService, public selectOptionService: SelectOptionService,
    public dialog: MatDialog,
    private fb: FormBuilder) {
    this.addUserForm = fb.group({
      email: new FormControl('', [Validators.required, Validators.pattern(this.emailPattern)]),
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      PrimaryLandline: new FormControl('', []),
      PrimaryMobile: new FormControl('', []),
      active: new FormControl('true', [Validators.required]),
      portalRoles: this.fb.array([]),
      otherRoles: this.fb.array([]),
      roles: new FormControl('', [Validators.required]),
      blockEmail: new FormControl('false', [Validators.required]),
      accountID: new FormControl('', [Validators.required]),
      Title: new FormControl('', []),
    })
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

  ngOnInit(): void {
    this.hasSsuperTemUsers = rolePermission(['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser']);
    this.currentOpenEditPage.emit(false);

    if (this.userData) {
      this.addUserForm.patchValue(this.userData);
    }
    this.getTEMAccounts();
    this.isUserSuperTemOrAdmin = this.locationService.isUserHasSuperTEMOrAdminRole();

    this.isUserSuperTemOrAdmin = this.locationService.isUserHasSuperTEMOrAdminRole();

    this.isTEMUser = this.locationService.isUserHasTEMUserRole();
    this.isTEMManager = this.locationService.isUserHasTEMManagerRole();
    this.isTEMAdmin = this.locationService.isUserHasTEMAdminRole();

    this.isSuperTEMAdmin = this.locationService.isUserHasSuperTEMAdminRole();
    this.isSuperTEMManager = this.locationService.isUserHasSuperTEMManagerRole();
    this.isSuperTEMUser = this.locationService.isUserHasSuperTEMUserRole();

    this.roleOptions = [
      { 'label': 'Super TEM Admin', 'value': 'SuperTEMAdmin', disabled: this.isSuperTEMManager || this.isSuperTEMUser },
      { 'label': 'Super TEM Manager', 'value': 'SuperTEMManager', disabled: this.isSuperTEMManager || this.isSuperTEMUser },
      { 'label': 'Super TEM User', 'value': 'SuperTEMUser', disabled: this.isSuperTEMUser },
      { 'label': 'TEM Admin', 'value': 'TEMAdmin', disabled: (this.isTEMManager || this.isTEMUser)},
      { 'label': 'TEM Manager', 'value': 'TEMManager', disabled: this.isTEMUser },
      { 'label': 'TEM User', 'value': 'TEMUser', disabled: false}
    ];

     if (this.isTEMAdmin || this.isTEMManager || this.isTEMUser) {
        this.roleOptions = _.filter(this.roleOptions, (r:any) => r.value !== 'SuperTEMAdmin' && r.value !== 'SuperTEMManager' && r.value !== 'SuperTEMUser')
    }

    this.setCheckboxesOtherRoles();
    this.setCheckboxesPortalRoles();
  }

  // Create checkboxes as FormControls and add to FormArray
  private setCheckboxesOtherRoles() {
    const control = <FormArray>this.addUserForm.get('otherRoles');
    this.otherAccessOptions.forEach((option: any) => {
      control.push(this.fb.control(false));  // Initially unchecked (false)
    });
  }
  // Create checkboxes as FormControls and add to FormArray
  private setCheckboxesPortalRoles() {
    const control = <FormArray>this.addUserForm.get('portalRoles');
    this.portalAccessOptions.forEach((option: any) => {
      control.push(this.fb.control(false));  // Initially unchecked (false)
    });
  }

  ngOnDestroy() {
    this.onComponetDestroy.emit(this.addUserForm.value);
  }
  add(event: any): void {
    if (event.value) {
      if (this.validateEmail(event.value)) {
        this.emailList.push({ value: event.value, invalid: false });
        this.addUserForm.controls['emails'].setErrors(null);
        const emailArray = <FormArray>this.addUserForm.get('emails');
        emailArray.push(new FormControl(event.value));
      } else {
        this.addUserForm.controls['emails'].setErrors({ 'incorrectEmail': true });
      }
    }
    if (event.input) {
      event.input.value = '';
    }
  }

  get f(): any {
    return this.addUserForm.controls;
  }

  removeEmail(data: any): void {
    if (this.emailList.indexOf(data) >= 0) {
      const emailArray: any = <FormArray>this.addUserForm.get('emails');
      let index = emailArray.value.findIndex((x: any) => x == data.value);
      emailArray.value.splice(index, 1);
      this.emailList.splice(this.emailList.indexOf(data), 1);
    }
  }

  private validateEmail(email: any) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  getTEMAccounts() {
    this.locationService.getTEMLoggedInUserDropDown()
      .subscribe((data) => {
        if (data && data.$values) {
          this.accounts = data.$values;

          if (this.hasSsuperTemUsers) {
            let id = sessionStorage.getItem("LoggedAccountId");
            const found = this.accounts.find((element: any) => Number(element.Id) === Number(id));
            this.accounts.unshift(found);

            this.accounts = this.accounts.filter((object: any, index: any) => {
              if (object) {
                return this.accounts.indexOf(object) === index;
              } else {
                return false;
              }
            });
          }
        }
      });
  }

  getUserompaniesByAccountId(id: any) {
    this.locationService.getUserCompaniesByAccountId(id).subscribe((data) => {
      if (data && data.$values) {
        this.companies = data.$values;
      }
    });
  }

  saveUser() {

    const selectedOtherRoleOptions = this.addUserForm.value.otherRoles
      .map((checked: any, index: any) => checked ? this.otherAccessOptions[index].value : null)
      .filter((value: any) => value !== null);
    const selectedPortalRoleOptions = this.addUserForm.value.portalRoles
      .map((checked: any, index: any) => checked ? this.portalAccessOptions[index].value : null)
      .filter((value: any) => value !== null);


    this.isUserFormSubmit = true;
    if (this.addUserForm.valid) {
      this.saveButtonLoadder = true;
      const roles: any = [];
      if (this.addUserForm.controls['roles'].value && this.addUserForm.controls['roles'].value.length > 0) {
        roles.push(this.addUserForm.controls['roles'].value);
      }

      if (selectedOtherRoleOptions.length) {
        roles.push(...selectedOtherRoleOptions);
      }
      if (selectedPortalRoleOptions.length) {
        roles.push(...selectedPortalRoleOptions);
      }

      const data: any = this.addUserForm.value;

      data.active = this.status;
      data.blockEmail = this.blockEmail;
      data.rolesToAssign = roles;
      data.vendorUser = false;
      data.vendorAccountID = 0;

      delete data.roles;
      delete data.otherRoles;
      delete data.portalRoles;
      this.locationService.addUser(data).subscribe({
        next: data => {
          this.saveButtonLoadder = false;
          let errorData: any = {
            messgeType: "error",
            title: "Attention",
            titleClass: "text-c-blue",
            icon: "fas fa-exclamation-triangle",
            iconClass: "text-c-blue f-70",
            message: 'Successfully saved' //if messges is multiple use array
          }
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
          dialogRef.afterClosed().subscribe(result => {
            this.onUserAddEvent.emit(true);
          });

        },
        error: (error: any) => {
          this.saveButtonLoadder = false;
          let errorMessage: any = '';
          if (error.status === 400) {
            errorMessage = error?.error.$values ? error?.error.$values[0] : error?.error;
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
