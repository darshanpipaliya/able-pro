import { Component, Inject, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { LocationService } from 'src/app/services/location.service';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SpaceTrimStartEndInputirective } from 'src/app/custom-directives/custom-validation.directive';

@Component({
  selector: 'app-add-charge-code',
  templateUrl: './add-charge-code.component.html',
  styleUrls: ['./add-charge-code.component.scss'],
  standalone: true,
  imports : [SharedModule, PrimgModule, SpaceTrimStartEndInputirective]
})
export class AddChargeCodeComponent implements OnInit {
  dialogData: any;
  addChargeCodeForm: FormGroup;
  isChargeCodeFormSubmit: boolean = false;
  billingAlias: any = [];
  chargeCodeTypes: any = [];
  taxTypes: any = [];
  origins: any = [];
  vendors: any = [];
  codeOccurence: any = [];
  selectedTab: any = 0;
  @Input() chargeCodeData: any;
  @Input() disableStatus: any;
  @Input() fromTab: any;

  @Output() onAddChargeCodeComponentDestroy: EventEmitter<any> = new EventEmitter<any>();
  @Output() afterChargeCodeAdd: EventEmitter<any> = new EventEmitter<any>();
  @Output() onUserAddEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() currentOpenEditPage: EventEmitter<any> = new EventEmitter<any>()

  saveButtonLoadder = false;
  statusList = [
    { Id : true, Name : 'Active'},
    { Id : false, Name : 'Inactive'},
  ]
  constructor(
    private locationService: LocationService,
    public dialog: MatDialog,
    private fb: FormBuilder) {
    this.addChargeCodeForm = fb.group({
      vendorAccountId: new FormControl('', [Validators.required]),
      chargeCodeOccurrenceId: new FormControl('', [Validators.required]),
      chargeCodeTypeId: new FormControl('', [Validators.required]),
      chargeTypeId: new FormControl('', [Validators.required]),
      vendorBillingAliasId: new FormControl('', [Validators.required]),
      chargeCodeOriginId: new FormControl('', [Validators.required]),
      chargeCode: new FormControl('', [Validators.required]),
      chargeCodeName: new FormControl('', [Validators.required]),
      // chargeCodeDisplayName: new FormControl('', [Validators.required]),
      description: new FormControl(''),
      status: new FormControl(true, [Validators.required])
    })
  }

  ngOnInit(): void {
    this.currentOpenEditPage.emit(false);
    if (this.chargeCodeData) {
      let id = this.chargeCodeData.VendorAccountId ? this.chargeCodeData.VendorAccountId : this.chargeCodeData.vendorAccountId ? this.chargeCodeData.vendorAccountId : null;
      this.f.vendorAccountId.setValue(id);
      this.addChargeCodeForm.patchValue(this.chargeCodeData);
      this.onVendorChange();
      this.onChargeCodeTypeChange();
    }
    this.getVendorsForUser();
    this.getChargeCodeTypes();
    this.getChargeCodeOrigins();
    this.getChargeCodeOccurrence();
  }

  getVendorsForUser() {
    this.locationService.getVendorDropdown().subscribe((data) => {
      if (data && data.Data.$values) {
        this.vendors = data.Data.$values;
      }
    });
  }

  onVendorChange() {
    if (this.f.vendorAccountId.valid && this.f.vendorAccountId.value) {
      const id = Number(this.f.vendorAccountId.value);
      this.getVendorBillingAlias(id);
    } else {
      this.billingAlias = [];
      this.f.vendorBillingAliasId.patchValue('');
    }
  }

  onChargeCodeTypeChange() {
    if (this.f.chargeCodeTypeId.valid && this.f.chargeCodeTypeId.value) {
      const id = Number(this.f.chargeCodeTypeId.value);
      this.f.chargeTypeId.patchValue('');
      this.getTaxRegulatoryTypes(id);
    } else {
      this.taxTypes = [];
      this.f.chargeTypeId.patchValue('');
    }

    if(this.f.chargeCodeTypeId.value == 1002) {
      const usageId = this.codeOccurence.find((item: any) => item.Occurrence === 'Usage')?.Id;
      this.f.chargeCodeOccurrenceId.setValue(usageId);
    } else {
      this.f.chargeCodeOccurrenceId.setValue(null);
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

  getChargeCodeOrigins() {
    this.locationService.getChargeCodeOrigins().subscribe((data) => {
      if (data && data.$values) {
        this.origins = data.$values;
        if(this.fromTab == 'add-charge' && this.origins.length > 0) {
          this.addChargeCodeForm.get('chargeCodeOriginId')?.setValue(this.origins[0].Id);  
        }
      }
    });
  }

  getVendorBillingAlias(id: any) {
    this.locationService.getVendorBillingAlias(id).subscribe((data) => {
      if (data && data.$values) {
        this.billingAlias = data.$values;
      }
    });
  }

  getTaxRegulatoryTypes(id: any) {
    let passData = {
      IsOnlyActiveNeed: true
    }
    this.locationService.getTaxRegulatoryTypes(id, passData).subscribe((data) => {
      if (data.Success) {
        this.taxTypes = data.Data.$values;
      } else {
        this.taxTypes = [];
      }
    });
  }

  getChargeCodeOccurrence() {
    this.locationService.getChargeCodeOccurrence().subscribe((data) => {
      if (data && data.$values) {
        this.codeOccurence = data.$values;
      }
    });
  }

  get f(): any {
    return this.addChargeCodeForm.controls;
  }

  saveChargeCode() {
    this.isChargeCodeFormSubmit = true;

    if (this.addChargeCodeForm.value.status || this.addChargeCodeForm.value.status === 'true') {
      this.addChargeCodeForm.value.status = true;
    } else {
      this.addChargeCodeForm.value.status = false;
    }
    if (this.addChargeCodeForm.valid) {
      this.saveButtonLoadder = true;
      const data: any = this.addChargeCodeForm.value;
      this.locationService.addChargeCode(data).subscribe({
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
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {panelClass: 'error-warning', data: errorData });
          dialogRef.afterClosed().subscribe(result => {
            this.afterChargeCodeAdd.emit(data);
            this.onUserAddEvent.emit(true);
          });
        } {
          this.saveButtonLoadder = false;
          this.ErrorWarningPopupOpen(data.Message)
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
              message: errorMessage //if messges is multiple use array
            }
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {panelClass: 'error-warning', data: errorData });
            this.onUserAddEvent.emit(true);
          }
        }
      });
    }
  }
  ngOnDestroy() {
    this.onAddChargeCodeComponentDestroy.emit(this.addChargeCodeForm.value);
  }

  ErrorWarningPopupOpen(message: any) {
    let errorData: any = {
      messgeType: "error",
      title: "Attention",
      titleClass: "text-c-blue",
      icon: "fas fa-exclamation-circle",
      iconClass: "text-c-blue f-70",
      message: message //if messges is multiple use array
    }
    const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
    return
  }
}
