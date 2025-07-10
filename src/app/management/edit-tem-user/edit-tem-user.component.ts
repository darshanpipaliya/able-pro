import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DualListComponent } from 'angular-dual-listbox';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

import moment from 'moment';
import { MenuItem, PrimeNGConfig } from 'primeng/api';
import { MatDialog } from '@angular/material/dialog';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import _ from 'lodash';
import { LocationService } from 'src/app/services/location.service';
import { SessionStorageService } from 'src/app/services/session-storage.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { rolePermission } from 'src/app/services/helper';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SpaceTrimStartEndInputirective } from 'src/app/custom-directives/custom-validation.directive';
import { ChangeLogComponent } from 'src/app/common/change-log/change-log.component';
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
    selector: 'app-edit-tem-user',
    templateUrl: './edit-tem-user.component.html',
    styleUrls: ['./edit-tem-user.component.scss'],
    standalone: true,
    imports: [SharedModule, PrimgModule, SpaceTrimStartEndInputirective, ChangeLogComponent]
})
export class EditTemUserComponent implements OnInit {
    activityDisplayedColumns: any = [];
    activityDataSource: any = [];

    ELEMENT_DATA_ACTIVITY: any = [];
    editUserForm: FormGroup;
    isUserFormSubmit: boolean = false;
    accounts: any = [];
    hide = true;
    cphide = true;
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
    userID: any;
    companies: any = [];
    selectedCustomer: any = '';
    isUserSuperTemOrAdmin: any = false;
    isCompanyAdmin: any = false;
    isTEMManager: any = false;
    isTEMUser: any = false;
    selectedOption = '3';
    isDisabled = true;
    timeLeft = 5;
    editTabDisabled = false;
    changelogData = [];
    columns: any = [];
    logLoader = false;

    @ViewChild('BlockEmailTool') BlockEmailTool!: TemplateRef<any>;

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

    @Input() userData: any;
    @Input() isTemUser: any;
    @Input() lockUserInput: any;

    emailPattern = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$';
    @Output() onUserAddEvent: EventEmitter<any> = new EventEmitter<any>();
    @Output() onUserEditEvent: EventEmitter<any> = new EventEmitter<any>();
    @Output() onAddButton: EventEmitter<any> = new EventEmitter<any>();
    @Output() currentOpenEditPage: EventEmitter<any> = new EventEmitter<any>();

    @Output() onUnlockButtonClick: EventEmitter<any> = new EventEmitter<any>();
    private _unsubscribeChangelog: Subject<any> = new Subject<any>();

    items: MenuItem[];
    userVerified: any = false;
    userUnlocked: any = false;
    prevRoles: any = [];
    isSuperTEMManager: boolean = false;
    isSuperTEMAdmin: boolean = false;
    isSuperTEMUser: boolean = false;
    isTEMAdmin: boolean = false;
    hasSsuperTemUsers: boolean = false;

    systemUSer = true;
    blockEmail = true;
    status = true;
    saveButtonLoadder = false;

    selfRecord = false
    private _unsubscribeTEM: Subject<any> = new Subject<any>();
    private _unsubscribeEmail: Subject<any> = new Subject<any>();

    constructor(private locationService: LocationService,
        private fb: FormBuilder,
        public dialog: MatDialog,
        private sessionStorageService: SessionStorageService,
        public localStorageService: LocalStorageService,
        private primengConfig: PrimeNGConfig) {


        this.primengConfig.ripple = true;


        this.activityDisplayedColumns = ['User', 'Action', 'dt'];

        this.editUserForm = fb.group({
            Email: new FormControl('', [Validators.required, Validators.pattern(this.emailPattern)]), //
            NewPassword: new FormControl('', [Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[A-Za-z\d$@$!%*?&].{6,}')
            ]),
            ConfirmPassword: new FormControl('', []),
            FirstName: new FormControl('', [Validators.required]),
            LastName: new FormControl('', [Validators.required]),
            PrimaryLandline: new FormControl('', []),
            PrimaryMobile: new FormControl('', []),
            Active: new FormControl('', [Validators.required]),
            EmailVerification: new FormControl('', []),
            Title: new FormControl('', []),
            portalRoles: this.fb.array([]),
            otherRoles: this.fb.array([]),
            roles: new FormControl('', [Validators.required]),
            BlockEmail: new FormControl(false),
            AccountId: new FormControl('', [Validators.required]),
            UserDefaultCompanyID: new FormControl('', [Validators.required]),
        },
            {
                validator: ConfirmedValidator('NewPassword', 'ConfirmPassword')
            });


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

    ngOnChanges() {
        this.userData.UserAccount = this.lockUserInput;
        this.updateMenuItems();
    }
    ngOnInit(): void {
        this.hasSsuperTemUsers = rolePermission(['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser']);
        this.currentOpenEditPage.emit(true);

        this.setCheckboxesOtherRoles();
        this.setCheckboxesPortalRoles();

        this.getTEMAccounts();
        this.isUserSuperTemOrAdmin = this.locationService.isUserHasSuperTEMOrAdminRole();

        this.isTEMUser = this.locationService.isUserHasTEMUserRole();
        this.isTEMManager = this.locationService.isUserHasTEMManagerRole();
        this.isTEMAdmin = this.locationService.isUserHasTEMAdminRole();

        this.isSuperTEMAdmin = this.locationService.isUserHasSuperTEMAdminRole();
        this.isSuperTEMManager = this.locationService.isUserHasSuperTEMManagerRole();
        this.isSuperTEMUser = this.locationService.isUserHasSuperTEMUserRole();
        if (this.isTEMAdmin || this.isTEMManager || this.isTEMUser) {
            this.roleOptions = _.filter(this.roleOptions, (r:any) => r.value !== 'SuperTEMAdmin' && r.value !== 'SuperTEMManager' && r.value !== 'SuperTEMUser')
        }
        this.getUserByEmail();
        this.userVerified = this.userData.EmailVerification === 'Verified' ? true : false;
        this.userUnlocked = this.userData.UserAccount === 'Unlocked' ? true : false;
        this.updateMenuItems();

        this.getUserChangelogs();
    }

    // Create checkboxes as FormControls and add to FormArray
    private setCheckboxesOtherRoles() {
        const control = <FormArray>this.editUserForm.get('otherRoles');
        this.otherAccessOptions.forEach((option: any) => {
            control.push(this.fb.control(false));  // Initially unchecked (false)
        });
    }
    // Create checkboxes as FormControls and add to FormArray
    private setCheckboxesPortalRoles() {
        const control = <FormArray>this.editUserForm.get('portalRoles');
        this.portalAccessOptions.forEach((option: any) => {
            control.push(this.fb.control(false));  // Initially unchecked (false)
        });
    }


    getUserChangelogs() {
        this.logLoader = true;
        this._unsubscribeChangelog.next(null);
        this.locationService.getUserChangelogs(this.userData.UserId).pipe(takeUntil(this._unsubscribeChangelog))
            .subscribe((data: any) => {
                this.logLoader = false;
                if (data.Success) {
                    this.changelogData = data.Data.$values;
                } else {
                    this.changelogData = [];
                }
            });
    }

    getTEMAccounts() {
        this._unsubscribeTEM.next(null);
        this.locationService.getTEMLoggedInUserDropDown()
            .pipe(takeUntil(this._unsubscribeTEM)).subscribe((data) => {
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

    ngOnDestroy(): void {
        this._unsubscribeTEM.next(null);
        this._unsubscribeTEM.complete();
        this._unsubscribeEmail.next(null);
        this._unsubscribeEmail.complete();
        this._unsubscribeChangelog.next(null);
        this._unsubscribeChangelog.complete();
    }

    getUserByEmail() {
        if (this.userData && this.userData.Email) {
            // const email: any = this.userData.Email;
            const email: any = this.userData.UserId;
            this._unsubscribeEmail.next(null);
            this.locationService.getUserByEmail(email).pipe(takeUntil(this._unsubscribeEmail)).subscribe((data) => {
                if (data) {
                    this.createFormInEditMode(data);
                    this.userID = data?.Id;
                }
            });
        }
    }

    createFormInEditMode(data: any) {
        let editUserData: any = {};
        editUserData = data;
        editUserData.PrimaryMobile = editUserData.PrimaryMobile ? editUserData.PrimaryMobile : '';
        editUserData.PrimaryLandline = editUserData.PrimaryLandline ? editUserData.PrimaryLandline : '';
        editUserData['UserDefaultCompanyID'] = editUserData.DefaultCompanyID;
        this.ELEMENT_DATA_ACTIVITY = data.ActionHistories?.$values;
        this.activityDataSource = this.ELEMENT_DATA_ACTIVITY;
        if (data.Roles && data.Roles.$values.length > 0) {
            const chkArrayPortal = <FormArray>this.editUserForm.get('portalRoles');
            const chkArray = <FormArray>this.editUserForm.get('otherRoles');

            editUserData.roles = [];
            let portalOptions = this.portalAccessOptions;
            let otherOptions = this.otherAccessOptions;
            let roleOptions = this.roleOptions;
            Object.keys(data.Roles?.$values).map(function (key: any) {

                const index = portalOptions.findIndex((option: any) => option.value === data.Roles?.$values[key]);
                if (index !== -1) {
                    chkArrayPortal.at(index).setValue(true); // Mark the checkbox as checked
                }
                const index1 = otherOptions.findIndex((option: any) => option.value === data.Roles?.$values[key]);
                if (index1 !== -1) {
                    chkArray.at(index1).setValue(true); // Mark the checkbox as checked
                }
                roleOptions.forEach((element: any) => {
                    if (element.value === data.Roles?.$values[key]) {
                        element.checked = true;
                        editUserData.roles = data.Roles?.$values[key];
                    }
                });
            });
            this.prevRoles = editUserData.roles;
            this.roleOptions = roleOptions;
        }

        // Mihir - changes for auth
        if ((this.isSuperTEMAdmin || this.isSuperTEMManager || this.isSuperTEMUser || this.isTEMAdmin || this.isTEMManager || this.isTEMUser) && editUserData.Id
            === this.sessionStorageService.getObjectValue('userInfo').id) {
            this.selfRecord = true;
        }

        if ((data.roles === 'SuperTEMAdmin' || data.roles === 'SuperTEMManager') && (this.isSuperTEMManager || this.isSuperTEMUser)) {
            this.editTabDisabled = true;
        }
        if ((data.roles === 'SuperTEMAdmin' || data.roles === 'SuperTEMManager' || data.roles === 'SuperTEMUser') && (this.isSuperTEMUser)) {
            this.editTabDisabled = true;
        }
        // if ((data.roles === 'TEMAdmin')&& (this.isTEMAdmin)) {
        //     this.editTabDisabled = true;
        // }

        // if ((data.roles === 'TEMManager')&& (this.isTEMManager)) {
        //     this.editTabDisabled = true;
        // }

        if (this.selfRecord) {
            this.editTabDisabled = false;
        }

        this.roleOptions = [
            { 'label': 'Super TEM Admin', 'value': 'SuperTEMAdmin', disabled: this.isSuperTEMUser || (!this.selfRecord && (this.isSuperTEMManager || this.isSuperTEMUser || this.isTEMAdmin || this.isTEMManager || this.isTEMUser)) },
            { 'label': 'Super TEM Manager', 'value': 'SuperTEMManager', disabled: this.isSuperTEMUser || (!this.selfRecord && (this.isSuperTEMManager || this.isSuperTEMUser || this.isTEMAdmin || this.isTEMManager || this.isTEMUser)) },
            { 'label': 'Super TEM User', 'value': 'SuperTEMUser', disabled: !this.selfRecord && this.isSuperTEMUser || this.isTEMAdmin || this.isTEMManager || this.isTEMUser },
            { 'label': 'TEM Admin', 'value': 'TEMAdmin', disabled: (this.isTEMManager || this.isTEMUser)},
            { 'label': 'TEM Manager', 'value': 'TEMManager', disabled: this.isTEMUser},
            { 'label': 'TEM User', 'value': 'TEMUser', disabled: false }
        ];

        if (this.isTEMAdmin || this.isTEMManager || this.isTEMUser) {
            this.roleOptions = _.filter(this.roleOptions, (r:any) => r.value !== 'SuperTEMAdmin' && r.value !== 'SuperTEMManager' && r.value !== 'SuperTEMUser')
        }
        this.editUserForm.patchValue(editUserData);
        if (this.isTEMUser) {
            this.editUserForm.disable();
        }
    }

    convertToDateTime(date: any) {
        return moment(new Date(date)).format('MM/DD/YYYY h:mm:ss a');
    }

    add(event: any): void {
        if (event.value) {
            if (this.validateEmail(event.value)) {
                this.emailList.push({ value: event.value, invalid: false });
                this.editUserForm.controls['emails'].setErrors(null);
                const emailArray = <FormArray>this.editUserForm.get('emails');
                emailArray.push(new FormControl(event.value));
            } else {
                this.editUserForm.controls['emails'].setErrors({ 'incorrectEmail': true });
            }
        }
        if (event.input) {
            event.input.value = '';
        }
    }


    removeEmail(data: any): void {
        if (this.emailList.indexOf(data) >= 0) {
            const emailArray: any = <FormArray>this.editUserForm.get('emails');
            let index = emailArray.value.findIndex((x: any) => x == data.value);
            emailArray.value.splice(index, 1);
            this.emailList.splice(this.emailList.indexOf(data), 1);
        }
    }

    private validateArrayNotEmpty(c: FormControl) {
        if (c.value && c.value.length === 0) {
            return {
                validateArrayNotEmpty: { valid: false }
            };
        }
        return null;
    }

    private validateEmail(email: any) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }


    onUpdatePortalRolesArray(option: any, isChecked: any, key: any) {
        const chkArray = <FormArray>this.editUserForm.get(key);
        if (isChecked) {
            option.checked = true;
            chkArray.push(new FormControl(option.value));
        } else {
            option.checked = false;
            let index = chkArray.controls.findIndex((x: any) => x.value == option.value);
            chkArray.removeAt(index);
        }
    }


    getUserompaniesByAccountId(id: any) {
        this.locationService.getUserCompaniesByAccountId(id).subscribe((data) => {
            if (data && data.$values) {
                this.companies = data.$values;
            }
        });
    }

    onCustomerSelect() {
        if (this.editUserForm.controls['AccountId'].value) {
            this.getUserompaniesByAccountId(this.editUserForm.controls['AccountId'].value);
        } else {
            this.companies = [];
        }
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
                disabled: !this.userVerified
            },
            {
                label: this.userData.UserAccount === 'Unlocked' ? 'Lock User' : 'Unlock User',
                icon: this.userData.UserAccount === 'Unlocked' ? 'pi pi-lock' : 'pi pi-unlock',
                command: () => {
                    this.userData.UserAccount === 'Unlocked' ? this.lockUser() : this.unlockUser();
                },
            }
            ]
        }
        ];
    }

    verfiyUser() {
        this.locationService.verifyUser(this.userData.Email).subscribe((res) => {
            let errorData: any = {
                messgeType: "error",
                title: "Attention",
                titleClass: "text-c-blue",
                icon: res == "Email verified successfully" ? "fas fa-thumbs-up" : "fas fa-exclamation-triangle",
                iconClass: "text-c-blue f-70",
                message: res //if messges is multiple use array
            }
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
            this.userData.EmailVerification = 'Verified';
            this.userVerified = true;
            this.updateMenuItems();
            this.editUserForm.patchValue({ 'EmailVerification': 'Verified' })
            this.getUserByEmail();
        });
    }

    sendEmailVerification() {
        this.locationService.emailVerficiationSend(this.userData.Email).subscribe(() => {
            let errorData: any = {
                messgeType: "error",
                title: "Attention",
                titleClass: "text-c-blue",
                // icon: "fas fa-exclamation-triangle",
                icon: "fas fa-thumbs-up",
                iconClass: "text-c-blue f-70",
                message: 'Email verification sent successfully' //if messges is multiple use array
            }
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
        });
    }

    lockUser() {
        this.locationService.lockUser(this.userData.Email).subscribe((result) => {
            if (result.includes('successfully')) {
                this.userData.UserAccount = 'Locked';
                this.userUnlocked = false;
                this.updateMenuItems();
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

    unlockUser() {
        this.locationService.unlockUser(this.userData.Email).subscribe((result) => {
            if (result.includes('successfully')) {
                this.userData.UserAccount = 'Unlocked';
                this.userUnlocked = true;
                this.updateMenuItems();
            }
            let errorData: any = {
                messgeType: "error",
                title: "Attention",
                titleClass: "text-c-blue",
                icon: "fas fa-exclamation-triangle",
                iconClass: "text-c-blue f-70",
                message: result //if messges is multiple use array
            }
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData }); this.userData.UserAccount = 'Unlocked';
            this.userUnlocked = true;
            this.updateMenuItems();
            this.onUnlockButtonClick.emit(true);
        })
    }

    forgotPassword() {
        const data = { 'email': this.userData.Email }
        this.locationService.forgetPwd(data).subscribe({
            next: data => {
                let errorData: any = {
                    messgeType: "error",
                    title: "Attention",
                    titleClass: "text-c-blue",
                    icon: data == 'Password reset notification sent successfully' ? "fas fa-thumbs-up" : "fas fa-exclamation-triangle",
                    iconClass: "text-c-blue f-70",
                    message: 'Reset password link sent successfully'  //if messges is multiple use array
                }
                const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
            },
            error: error => {
                if (error.status === 200) {
                    let errorData: any = {
                        messgeType: "error",
                        title: "Attention",
                        titleClass: "text-c-blue",
                        icon: error.error.text == 'Password reset notification sent successfully' ? "fas fa-thumbs-up" : "fas fa-exclamation-triangle",
                        iconClass: "text-c-blue f-70",
                        message: error.error.text
                    }
                    const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
                }
            }
        });
    }


    updateUser() {
        // this.editUserForm.controls['emails'].setErrors(null);
        this.isUserFormSubmit = true;
        if (this.editUserForm.valid) {

            const selectedOtherRoleOptions = this.editUserForm.value.otherRoles
                .map((checked: any, index: any) => checked ? this.otherAccessOptions[index].value : null)
                .filter((value: any) => value !== null);
            const selectedPortalRoleOptions = this.editUserForm.value.portalRoles
                .map((checked: any, index: any) => checked ? this.portalAccessOptions[index].value : null)
                .filter((value: any) => value !== null);

            this.saveButtonLoadder = true;
            const roles: any = [];
            const rolesData = this.editUserForm.controls['roles'].value;

            const a = this.editUserForm.controls['roles'].value;
            const b = [a];

            if (b && b.length > 0) {
                b.forEach(element => {
                    roles.push(element);
                });
            }

            if (selectedOtherRoleOptions.length) {
                roles.push(...selectedOtherRoleOptions);
            }
            if (selectedPortalRoleOptions.length) {
                roles.push(...selectedPortalRoleOptions);
            }

            const data: any = this.editUserForm.value;
            data.Active = (data.Active === 'true' || data.Active === true) ? true : false;
            data.BlockEmail = data.BlockEmail || data.BlockEmail === 'true' ? true : false;
            if (roles.length > 0) {
                data.RolesToAssign = [...new Set(roles)];
            }
            data.MiddleInitial = '';
            data.PrimaryMobile = data.PrimaryMobile ? data.PrimaryMobile : '';
            data.PrimaryLandline = data.PrimaryLandline ? data.PrimaryLandline : '';
            const flag = this.prevRoles === rolesData;
            if (!flag) {
                this.editUserForm.controls['roles'].patchValue(rolesData);
            }
            data.vendorUser = false;
            data.vendorAccountID = 0;
            data.UserID = this.userID;
            data.emailConfirmed = this.editUserForm.value.EmailVerification == 'Verified' ? true : false;
            delete data.roles;
            delete data.otherRoles;
            delete data.portalRoles;
            this.locationService.editUser(data).subscribe({
                next: data => {
                    this.saveButtonLoadder = false;
                    let errorData: any = {
                        messgeType: "error",
                        title: "Attention",
                        titleClass: "text-c-blue",
                        icon: "fas fa-exclamation-circle",
                        iconClass: "text-c-blue f-70",
                        message: 'Successfully saved' //if messges is multiple use array
                    }
                    const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
                    dialogRef.afterClosed().subscribe(result => {
                        this.onUserEditEvent.emit(true);
                    });
                },
                error: error => {

                    let errorMessage: any = '';
                    this.saveButtonLoadder = false;

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

    addUsers() {
        this.onAddButton.emit(true);
    }

    get f() : any {
        return this.editUserForm.controls;
    }

}
