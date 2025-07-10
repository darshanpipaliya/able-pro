import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { LocationService } from 'src/app/services/location.service';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
@Component({
    selector: 'app-add-charge-type-dialog',
    templateUrl: './add-charge-type-dialog.component.html',
    styleUrls: ['./add-charge-type-dialog.component.scss'],
    standalone: true,
    imports: [SharedModule, PrimgModule]
})
export class AddChargeTypeDialogComponent implements OnInit {
    dialogData: any;
    addChargeCodeTypeForm: FormGroup;
    addChargeTypeForm: FormGroup;
    isChargeTypeFormSubmit: boolean = false;
    disableStatus: boolean = false;
    industries: any = [];
    services: any = [];
    serviceTypes: any = [];
    products: any = [];
    chargeCodeTypes: any = [];
    selectedTab: any = 0;
    from: any = '';
    isSuperTEMAdmin: any = false;
    disabled: any = false;
    isSuperTEMManager: any = false;
    saveButtonLoadder = false;
    statusList = [
        { Id : true, Name : 'Active'},
        { Id : false, Name : 'Inactive'},
      ];
    
    constructor(private dialogRef: MatDialogRef<AddChargeTypeDialogComponent>,
        public dialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) data: any,
        private locationService: LocationService,
        private fb: FormBuilder) {
        this.dialogData = data;
        dialogRef.disableClose = true;
        this.from = this.dialogData ? this.dialogData.from : '';

        if (this.dialogData.disabled && this.dialogData.disabled == 'true') {
            this.disableStatus = true;
        } else {
            this.disableStatus = false;
        }

        this.addChargeTypeForm = fb.group({
            name: new FormControl('', [Validators.required]),
            status: new FormControl(true, [Validators.required]),
            chargeCodeTypeId: new FormControl('', [Validators.required]),
            keepForProduction:new FormControl(false)
        });
        this.addChargeCodeTypeForm = fb.group({
            name: new FormControl('', [Validators.required]),
            active: new FormControl(true, [Validators.required]),
            keepForProduction:new FormControl(false)
        });

    }

   
    ngOnInit(): void {
        this.isSuperTEMAdmin = this.locationService.isUserHasSuperTEMAdminRole();
        this.isSuperTEMManager = this.locationService.isUserHasSuperTEMManagerRole();
        if (this.dialogData.from === 'Charge Type') {
            if (this.dialogData && this.dialogData.data) {
                const name = this.dialogData.data.ChargeTypeName ? this.dialogData.data.ChargeTypeName : '';
                this.f.name.patchValue(name);
                this.f.keepForProduction.patchValue(this.dialogData.data.KeepForProduction ? this.dialogData.data.KeepForProduction : false);
                if (this.dialogData.data && this.dialogData.data.Status !== null) {
                    this.f.status.patchValue(this.dialogData.data.Status);
                    this.f.chargeCodeTypeId.patchValue(this.dialogData.data.ChargeCodeTypeId);
                }
            }
        } else {
            if (this.dialogData && this.dialogData.data) {
                const name = this.dialogData.data.ChargeCodeTypeName ? this.dialogData.data.ChargeCodeTypeName : '';
                this.f.name.patchValue(name);
                this.f.keepForProduction.patchValue(this.dialogData.data.KeepForProduction ? this.dialogData.data.KeepForProduction : false);
                if (this.dialogData.data.Status !== null) {
                    const active = this.dialogData.data.Status;
                    this.f.active.patchValue(active);
                }
            }
        }
        if (this.dialogData && this.dialogData.from === 'Charge Type') {
            this.getChargeCodeTypes();
        }

        if (!this.isSuperTEMAdmin) {
            this.disabled = true;
            this.addChargeTypeForm.disable();
            this.addChargeCodeTypeForm.disable();
        }
    }

    getChargeCodeTypes() {
        let passData = {
            IsOnlyActiveNeed: true
        }
        this.locationService.getChargeCodeTypes(passData).subscribe((data) => {
            if (data.Success) {
                this.chargeCodeTypes = data.Data.$values;
            }
        });
    }

    onNoClick(type: any) {
        this.dialogRef.close(type);
    }

    get f(): any {
        return this.from === 'Charge Type' ? this.addChargeTypeForm.controls : this.addChargeCodeTypeForm.controls;
    }

    saveProduct() {
       
        this.isChargeTypeFormSubmit = true;
        if (this.from === 'Charge Type') {
            if (this.addChargeTypeForm.valid) {
                this.saveButtonLoadder = true;
                const data: any = this.addChargeTypeForm.value;
                data.status = (data.status === 'true' || data.status === true) ? true : false;
                if (this.from === 'Charge Type') {
                    if (this.dialogData.data && this.dialogData.data.ChargeTypeId) {
                        const id = this.dialogData.data.ChargeTypeId;
                        this.locationService.updateChargeType(id, data).subscribe({
                            next: data => {
                                if(data.Success) {
                                 
                                    this.saveButtonLoadder = false;
                                    let errorData: any = {
                                        messgeType: "error",
                                        title: "Attention",
                                        titleClass: "text-c-blue",
                                        icon: "fas fa-exclamation-triangle",
                                        iconClass: "text-c-blue f-70",
                                        message: 'Successfully saved' //if messges is multiple use array
                                    }
                                    const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { 
                                        panelClass: 'error-warning', data: errorData });
                                    dialogRef.afterClosed().subscribe(result => {
                                        this.onNoClick('Charge Type');
                                    });
                                } else {
                                    this.saveButtonLoadder = false;
                                    this.ErrorWarningPopupOpen(data.Message);
                                }
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
                                        icon: "fas fa-exclamation-triangle",
                                        iconClass: "text-c-blue f-70",
                                        message: errorMessage  //if messges is multiple use array
                                    }
                                    const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
                                        panelClass: 'error-warning', data: errorData });
                                    dialogRef.afterClosed().subscribe(result => {
                                    });
                                }
                            }
                        });
                    } else {
                        this.locationService.addChargeType(data).subscribe({
                            next: data => {
                                if(data.Success) {
                                    this.saveButtonLoadder = false;
                                    let errorData: any = {
                                        messgeType: "error",
                                        title: "Attention",
                                        titleClass: "text-c-blue",
                                        icon: "fas fa-exclamation-triangle",
                                        iconClass: "text-c-blue f-70",
                                        message: 'Successfully saved' //if messges is multiple use array
                                    }
                                    const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { 
                                        panelClass: 'error-warning', data: errorData });
                                    dialogRef.afterClosed().subscribe(result => {
                                        this.onNoClick('Charge Type');
                                    });
                                } else {
                                    this.saveButtonLoadder = false;
                                    this.ErrorWarningPopupOpen(data.Message);
                                }
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
                                        icon: "fas fa-exclamation-triangle",
                                        iconClass: "text-c-blue f-70",
                                        message: errorMessage  //if messges is multiple use array
                                    }
                                    const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
                                        panelClass: 'error-warning', data: errorData });
                                    dialogRef.afterClosed().subscribe(result => {
                                    });
                                }
                            }
                        });
                    }
                }
            }
        } else {
            if (this.addChargeCodeTypeForm.valid) {
                this.saveButtonLoadder = true;
                if (this.from === 'Charge Code Type') {
                    const data: any = this.addChargeCodeTypeForm.value;
                    data.status = (data.active === 'true' || data.active === true) ? true : false;
                    if (this.dialogData.data && this.dialogData.data.ChargeCodeTypeId) {
                        const id = this.dialogData.data.ChargeCodeTypeId;
                        this.locationService.updateChargeCodeType(id, data).subscribe({
                            next: data => {
                                if(data.Success) {
                                    this.saveButtonLoadder = false;
                                    let errorData: any = {
                                        messgeType: "error",
                                        title: "Attention",
                                        titleClass: "text-c-blue",
                                        icon: "fas fa-exclamation-triangle",
                                        iconClass: "text-c-blue f-70",
                                        message: 'Successfully saved' //if messges is multiple use array
                                    }
                                    const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { 
                                        panelClass: 'error-warning',data: errorData });
                                    dialogRef.afterClosed().subscribe(result => {
                                    });
                                    this.onNoClick('Charge Code Type');
                                } else {
                                    this.saveButtonLoadder = false;
                                    this.ErrorWarningPopupOpen(data.Message);
                                }
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
                                        icon: "fas fa-exclamation-triangle",
                                        iconClass: "text-c-blue f-70",
                                        message: errorMessage  //if messges is multiple use array
                                    }
                                    const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
                                        panelClass: 'error-warning', data: errorData });
                                    dialogRef.afterClosed().subscribe(result => {
                                    });
                                }
                            }
                        });
                    } else {
                        this.locationService.addChargeCodeType(data).subscribe({
                            next: data => {
                                if(data.Success) {
                                    this.saveButtonLoadder = false;
                                    let errorData: any = {
                                        messgeType: "error",
                                        title: "Attention",
                                        titleClass: "text-c-blue",
                                        icon: "fas fa-exclamation-triangle",
                                        iconClass: "text-c-blue f-70",
                                        message: 'Successfully saved' //if messges is multiple use array
                                    }
                                    const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
                                        panelClass: 'error-warning', data: errorData });
                                    dialogRef.afterClosed().subscribe(result => {
                                        this.onNoClick('Charge Code Type');

                                    });
                                } else {
                                    this.saveButtonLoadder = false;
                                    this.ErrorWarningPopupOpen(data.Message);
                                }
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
                                        icon: "fas fa-exclamation-triangle",
                                        iconClass: "text-c-blue f-70",
                                        message: errorMessage  //if messges is multiple use array
                                    }
                                    const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { 
                                        panelClass: 'error-warning', data: errorData });
                                    dialogRef.afterClosed().subscribe(result => {
                                    });
                                }
                            }
                        });
                    }
                }
            }

        }
    }

    ErrorWarningPopupOpen(message: any) {
        let errorData: any = {
          messgeType: "error",
          title: "Attention",
          titleClass: "text-c-blue",
          icon: "fas fa-exclamation-circle",
          iconClass: "text-c-blue f-70",
          message: message
        }
        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
        return true
      }
}
