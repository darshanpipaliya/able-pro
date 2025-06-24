import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AgGridModule } from 'ag-grid-angular';

import _ from 'lodash';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AgGridTableComponent } from 'src/app/common/ag-grid-table/ag-grid-table.component';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { SpaceTrimStartEndInputirective } from 'src/app/custom-directives/custom-validation.directive';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { rolePermission } from 'src/app/services/helper';
import { LocationService } from 'src/app/services/location.service';

@Component({
    selector: 'app-add-edit-cost-centers',
    templateUrl: './add-edit-cost-centers.component.html',
    styleUrls: ['./add-edit-cost-centers.component.scss'],
    imports: [SharedModule, PrimgModule,AgGridModule, SpaceTrimStartEndInputirective]
})
export class AddEditCostCentersComponent implements OnInit {
    @Input() setIsReadOnly: any;
    costCenterForm: FormGroup;
    customerList: any = [];
    companyList: any = [];
    isSuperTEMManager: boolean = false;
    isSuperTEMAdmin: boolean = false;
    isCompanyUser: boolean = false;
    isTEMUser: boolean = false;
    isCustomerAdmin: boolean = false;
    isCompanyAdmin: boolean = false;
    isCompanyManager: boolean = false;
    isViewOnly: boolean = false;
    disabled: boolean = false;
    submitted: boolean = false;
    @Input() costCenterData: any;
    @Output() onComponetDestroy: EventEmitter<any> = new EventEmitter<any>();
    @Input() action: any;
    @Input() selectedTem: any;
    @Input() selectCustomer: any;

    @Output() onSaveCostCenterEvent: EventEmitter<any> = new EventEmitter<any>();
    @Output() currentOpenEditforCC: EventEmitter<any> = new EventEmitter<any>();
    @Output() setTemDDValueEventCC: EventEmitter<any> = new EventEmitter<any>();
    @Output() setCompanyDDValueEventCC: EventEmitter<any> = new EventEmitter<any>();
    @Output() setClickFalseCC: EventEmitter<any> = new EventEmitter<any>();

    @Input() selectedWiseTemDDCC: any;
    @Input() selectedCC: any;
    @Input() clickOnSearchButtonCC: any;
    setTemDDValue: any;
    hasAccess: any;
    hideSave:any;
    tableData: any;
    columns:any = [];
    private _unsubscribeCostCenter: Subject<any> = new Subject<any>();
    logLoader = false;
    
    saveButtonLoadder = false;
    glCodeTypeList = [
        { Id: 'Job', value: 'Job' },
        { Id: 'GL', value: 'GL' },
    ];
    loadingCustomerAPI = false;
    loadingCompanyAPI = false;
    changelogData = [];

    constructor(
        public dialog: MatDialog,
        private locationService: LocationService,
        private fb: FormBuilder
    ) {
        this.costCenterForm = this.fb.group({
            AccountId: new FormControl('', [Validators.required]),
            CompanyId: new FormControl('', [Validators.required]),
            Description: new FormControl('', Validators.maxLength(250)),
            GLCode1: new FormControl('', [Validators.required]),
            GLCode2: new FormControl(''),
            GLCode3: new FormControl(''),
            GLCode4: new FormControl(''),
            GLCode5: new FormControl(''),
            GLCode6: new FormControl(''),
            Type: new FormControl(this.glCodeTypeList[1].Id, [Validators.required]),
            Id: new FormControl(''),
            Active: new FormControl(true),
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

    ngAfterContentInit() {
        const id = this.costCenterData.CustomerAccountId ? this.costCenterData.CustomerAccountId : this.costCenterData.AccountId;
        if (!id) {
            this.costCenterForm.controls['AccountId'].setValue('');
            this.costCenterForm.controls['CompanyId'].setValue('');
            this.costCenterForm.controls['Type'].setValue('');
        }
        if (this.action == 'new') {
            this.costCenterForm.patchValue({ Active: this.costCenterData?.Active ?? true });
            this.costCenterForm.controls['Type'].setValue(this.costCenterData.Type ? this.costCenterData.Type : this.glCodeTypeList[1].Id);
            if (this.selectCustomer) {
                this.costCenterForm.controls['AccountId'].setValue(this.selectCustomer);
            }
        }
    }
    ngOnInit(): void {
        this.setCompanyDDValueEventCC.emit(this.costCenterData.CustomerAccountId);
        this.hasAccess = rolePermission(['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser', 'SuperTEM', 'CustomerAdmin', 'CompanyAdmin', 'CompanyManager', 'TEMAdmin', 'TEMUser', 'TEMManager']);
        if (this.action == 'new') {
            this.currentOpenEditforCC.emit(false);
        } else {
            this.currentOpenEditforCC.emit(true);
        }
        
        // if (this.action == 'new') {
        //     this.costCenterForm.controls['Type'].setValue(this.glCodeTypeList[1].Id);
        // }

        this.isSuperTEMManager = this.locationService.isUserHasSuperTEMManagerRole();
        this.isSuperTEMAdmin = this.locationService.isUserHasSuperTEMAdminRole();
        this.isCompanyUser = this.locationService.isUserCompanyUser();
        this.isTEMUser = this.locationService.isUserHasTEMUserRole();

        this.isCustomerAdmin = this.locationService.isUserCustomerAdmin();
        this.isCompanyAdmin = this.locationService.isUserCompanyAdmin();
        this.isCompanyManager = this.locationService.isUserCompanyManager();

        if (this.costCenterData) {
            let id = this.costCenterData.CustomerAccountId ? this.costCenterData.CustomerAccountId : this.costCenterData.AccountId;

            if(this.costCenterData.CostCenterId)
                this.getCCChangelogData();

            if (id) {
                this.customerChange(id, false);
            }

            this.costCenterForm.controls['AccountId'].setValue(id);
            setTimeout(() => {
                if (this.action == 'edit') {
                    let data = this.customerList.find((x: any) => x.Id == this.costCenterForm.controls['AccountId'].value);
                    if (data.AllowCCManualEditOptions == true || (this.isCustomerAdmin && data.AllowCCManualEditOptions == true) || (this.isCompanyAdmin && data.AllowCCManualEditOptions == true)) {
                        this.hideSave = true;
                    } else if (this.isCompanyManager) {
                        this.hideSave = false;
                    }

                    

                    if (!this.hideSave || this.isCompanyManager) {
                        this.costCenterForm.controls['AccountId'].disable();
                        this.costCenterForm.controls['CompanyId'].disable();
                        this.costCenterForm.controls['Description'].disable();
                        this.costCenterForm.controls['GLCode1'].disable();
                        this.costCenterForm.controls['GLCode2'].disable();
                        this.costCenterForm.controls['GLCode3'].disable();
                        this.costCenterForm.controls['GLCode4'].disable();
                        this.costCenterForm.controls['GLCode5'].disable();
                        this.costCenterForm.controls['GLCode6'].disable();
                        this.costCenterForm.controls['Type'].disable();
                        this.costCenterForm.controls['Active'].disable();
                    }
                }
            }, 2000);

            this.costCenterForm.controls['CompanyId'].setValue(this.costCenterData.CompanyId);
            this.costCenterForm.controls['Description'].setValue(this.costCenterData.Description);
            this.costCenterForm.controls['GLCode1'].setValue(this.costCenterData.GLCode1);
            this.costCenterForm.controls['GLCode2'].setValue(this.costCenterData.GLCode2);
            this.costCenterForm.controls['GLCode3'].setValue(this.costCenterData.GLCode3);
            this.costCenterForm.controls['GLCode4'].setValue(this.costCenterData.GLCode4);
            this.costCenterForm.controls['GLCode5'].setValue(this.costCenterData.GLCode5);
            this.costCenterForm.controls['GLCode6'].setValue(this.costCenterData.GLCode6);
            this.costCenterForm.controls['Type'].setValue(this.costCenterData.Type);
            this.costCenterForm.controls['Active'].setValue(this.costCenterData.Active);

            if (this.isCompanyUser || this.isTEMUser) {
                this.costCenterForm.disable();
                this.disabled = true;
                this.setIsReadOnly = true;
            }
        } else {
        }
        this.getCustomer();
    }

    getCCChangelogData() {
        this._unsubscribeCostCenter.next(null);
        this.logLoader = true;
        this.locationService.getCostCenterChangelogs(this.costCenterData.CostCenterId).pipe(takeUntil(this._unsubscribeCostCenter)).subscribe((data: any) => {
            this.logLoader = false;
            if(data.Success) {
                this.changelogData = data.Data.$values;
            } else {
                this.changelogData = [];
            }
        });
    }

    ngOnChanges(changes: any) {
        if (this.clickOnSearchButtonCC && changes && changes['clickOnSearchButtonCC'] && changes['clickOnSearchButtonCC']['currentValue']) {
            this.costCenterForm.controls['AccountId'].setValue('');
            this.getCustomer();
            this.clickOnSearchButtonCC = false;
            this.setClickFalseCC.emit(false);
        }
    }

    getAccountById(id: any) {
        this.locationService.getTemAccountById(id).subscribe((data) => {
            if (data) {
                this.isViewOnly
            }
        });
    }

    getCustomer() {
        if (this.selectedTem !== 'all' && this.action === 'new') {
            this.customerList = [];
            this.loadingCustomerAPI = true;
            this.locationService.getCustomerDropdownByNewTEM(this.selectedWiseTemDDCC[this.selectedCC]).subscribe((data) => {
                if (data && data.Data.$values) {
                    this.customerList = data.Data.$values;
                    this.loadingCustomerAPI = false;

                    this.customerChange(this.selectedWiseTemDDCC[this.selectedCC], false);
                    if (this.hasAccess) {
                        let datas = this.customerList.forEach((x: any) => {
                            x['disabled'] = !x.AllowCCManualEditOptions
                        });
                    }
                } else {
                    this.customerList = [];
                    this.loadingCustomerAPI = false;
                }
            }, error => {
                this.customerList = [];
                this.loadingCustomerAPI = false;
            });
        } else {
            this.customerList = [];
            this.loadingCustomerAPI = true;
            this.locationService.getCustomerDropDown().subscribe(data => {
                if (data && data.$values) {
                    this.customerList = data.$values;
                    this.loadingCustomerAPI = false;
                    if (this.hasAccess) {
                        let datas = this.customerList.forEach((x: any) => {
                            x['disabled'] = !x.AllowCCManualEditOptions
                        });
                    }
                    if (this.action === 'edit' && this.costCenterData) {
                        const customerID = this.costCenterData.CustomerAccountId ? this.costCenterData.CustomerAccountId : this.costCenterData.AccountId;
                        const data1 = this.customerList.find((res: any) => res.Id === customerID);
                        this.setTemDDValue = data1.TemAccountID;
                        this.setTemDDValueEventCC.emit(this.setTemDDValue);
                    }
                } else {
                    this.customerList = [];
                    this.loadingCustomerAPI = false;
                }
            }, error => {
                this.customerList = [];
                this.loadingCustomerAPI = false;
            });
        }

    }
    ngOnDestroy() {
        if (this.costCenterData.CostCenterId) {
            this.costCenterForm.controls['Id'].setValue(this.costCenterData.CostCenterId);
        }
        this.onComponetDestroy.emit({...this.costCenterData, ...this.costCenterForm.value});
        
        this.setTemDDValueEventCC.emit('');
        this.setCompanyDDValueEventCC.emit('');
        this.hideSave = false;

        this._unsubscribeCostCenter.next(null);
        this._unsubscribeCostCenter.complete();
    }

    get f() {
        return this.costCenterForm.controls;
    }

    addEditCostCenter(type: any) {
        this.submitted = true;
        if (this.costCenterForm.valid) {
            if (
                (this.costCenterForm.controls['GLCode1'].value &&
                    this.costCenterForm.controls['GLCode2'].value &&
                    this.costCenterForm.controls['GLCode3'].value &&
                    this.costCenterForm.controls['GLCode4'].value &&
                    this.costCenterForm.controls['GLCode5'].value &&
                    this.costCenterForm.controls['GLCode6'].value) && 
                    this.costCenterForm.controls['Active'].value
                &&
                ((this.costCenterForm.controls['GLCode1'].value).indexOf('/') > -1 ||
                    (this.costCenterForm.controls['GLCode2'].value).indexOf('/') > -1 ||
                    (this.costCenterForm.controls['GLCode3'].value).indexOf('/') > -1 ||
                    (this.costCenterForm.controls['GLCode4'].value).indexOf('/') > -1 ||
                    (this.costCenterForm.controls['GLCode5'].value).indexOf('/') > -1 ||
                    (this.costCenterForm.controls['GLCode6'].value).indexOf('/') > -1)) {
                let errorData: any = {
                    messgeType: "error",
                    title: "Attention",
                    titleClass: "text-c-blue",
                    icon: "fas fa-exclamation-circle",
                    iconClass: "text-c-blue f-70",
                    message: 'GL Code not valid with "/"' //if messges is multiple use array
                }
                const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
                dialogRef.afterClosed().subscribe(result => {
                    this.onSaveCostCenterEvent.emit(true);
                });
            }


            if (this.costCenterData && this.costCenterData.CostCenterId) {
                this.saveButtonLoadder = true;
                this.costCenterForm.value.Description = this.costCenterForm.value.Description ? this.costCenterForm.value.Description.replace(/\n/g, ' ') : null;
                this.locationService.updateCostCenter(this.costCenterData.CostCenterId, this.costCenterForm.value).subscribe({
                    next: data => {
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
                            this.onSaveCostCenterEvent.emit(true);
                        });
                    },
                    error: error => {
                        this.saveButtonLoadder = false;
                        let errorMessage: any = '';
                        if (error.status === 400) {
                            errorMessage = error.error && error.statusText === 'OK' ? error.error : 'Bad request';
                            let errorData: any = {
                                messgeType: "error",
                                title: "Attention",
                                titleClass: "text-c-blue",
                                icon: "fas fa-exclamation-circle",
                                iconClass: "text-c-blue f-70",
                                message: errorMessage //if messges is multiple use array
                            }
                            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
                            // dialogRef.close();
                        }
                    }
                });
            } else {
                this.saveButtonLoadder = true;
                this.locationService.addCostCenter(this.costCenterForm.value).subscribe({
                    next: data => {
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
                            this.onSaveCostCenterEvent.emit(true);
                        });
                    },
                    error: error => {
                        this.saveButtonLoadder = false;
                        let errorMessage: any = '';
                        if (error.status === 400) {
                            errorMessage = error.error && error.statusText === 'OK' ? error.error : 'Bad request';
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
        } else {
            this.saveButtonLoadder = false;
        }
    }

    customerChange(id: any, clickFromDD?: any) {

        if (id) {
            this.companyList = [];
            this.loadingCompanyAPI = true;
            this.locationService.getCompanyByCustomerId(id).subscribe({
                next: data => {
                    // this.saveButtonLoadder = false;
                    if (data && data.$values) {
                        this.companyList = data.$values;
                        this.loadingCompanyAPI = false;
                        setTimeout(() => {
                            if (this.hideSave == false && this.action == 'edit') {
                                this.companyList.forEach((x: any) => {
                                    x['disabled'] = true
                                });
                            } else {
                            }
                        }, 1000);
                        if (clickFromDD) {
                            this.costCenterForm.controls['CompanyId'].setValue('');
                        }
                    } else {
                        this.companyList = [];
                        this.loadingCompanyAPI = false;
                    }
                },
                error: error => {
                    this.companyList = [];
                    this.loadingCompanyAPI = false;
                    // this.saveButtonLoadder = false;
                    this.costCenterForm.controls['CompanyId'].setValue('');
                    let errorMessage: any = '';
                    if (error.status === 404) {
                        errorMessage = error.error && error.statusText === 'OK' ? error.error : 'Bad request';
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
        } else {
            this.costCenterForm.controls['CompanyId'].setValue('');
            this.companyList = [];
            this.loadingCompanyAPI = false;
        }

    }

    companyValue() {
        if (this.action === 'edit')
            this.setCompanyDDValueEventCC.emit(this.costCenterForm.controls['CompanyId'].value)
    }

    onCustomerSelect($event: any) {
        const data1 = this.customerList.find((res: any) => res.Id === $event.value);
        this.setTemDDValue = data1.TemAccountID;
        if (data1.AllowCCManualEditOptions == true) {
            this.hideSave = true;
        }

        if (this.action === 'edit')
            this.setTemDDValueEventCC.emit(this.setTemDDValue);
    }
}
