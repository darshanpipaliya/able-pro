import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import moment from 'moment';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { rolePermission } from 'src/app/services/helper';
import { LocationService } from 'src/app/services/location.service';
import { SpaceTrimStartEndInputirective } from 'src/app/custom-directives/custom-validation.directive';

@Component({
  selector: 'app-add-billing-alias',
  templateUrl: './add-billing-alias.component.html',
  styleUrls: ['./add-billing-alias.component.scss'],
  imports: [
    SharedModule,
    PrimgModule,
    SpaceTrimStartEndInputirective
  ]
})
export class AddBillingAliasComponent implements OnInit {


  @Input() billingAliasData: any;
  activityDataSource: any = [];

  vendorsList: any = [];
  addVendorBillingAliasForm: FormGroup;
  isFormSubmit: boolean = false;
  sideBar: any = [];
  rowData: any = [];
  isSuperTEMManager: boolean = false;
  isSuperTEMAdmin: boolean = false;
  isCompanyUser:boolean = false;
  isTEMUser: boolean = false;

  @Output() onAddBillingAliasComponentDestroy: EventEmitter<any> = new EventEmitter<any>();
  @Output() afterBillingAliasAdd: EventEmitter<any> = new EventEmitter<any>();
  statusList = [
    { Id : true, Name : 'Active'},
    { Id : false, Name : 'Inactive'},
  ]
  saveButtonLoadder = false;
  viewNEdit = false;
  constructor(private locationService: LocationService,
    public dialog: MatDialog,
    private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.isSuperTEMManager = this.locationService.isUserHasSuperTEMManagerRole();
    this.isSuperTEMAdmin = this.locationService.isUserHasSuperTEMAdminRole();
    this.isCompanyUser = this.locationService.isUserCompanyUser();
    this.isTEMUser = this.locationService.isUserHasTEMUserRole();

    this.viewNEdit =  rolePermission(['SuperTEMAdmin', 'SuperTEMManager']);

    this.addVendorBillingAliasForm = this.fb.group({
      vendorAccountId: new FormControl('', [Validators.required]),
      name: new FormControl('', [Validators.required]),
      description: new FormControl(''),
      status: new FormControl(true, [Validators.required]),
      invoiceAlias: new FormControl(false),
      chargeCodeAlias: new FormControl(false)
    })
    this.locationService.getVendorDropdown().subscribe((data) => {
      if (data && data.Data.$values) {
        this.vendorsList = data.Data.$values;
      }
    });

    if (this.billingAliasData) {
      this.addVendorBillingAliasForm.controls['vendorAccountId'].setValue(this.billingAliasData.vendorAccountId);
      this.addVendorBillingAliasForm.controls['name'].setValue(this.billingAliasData.name);
      this.addVendorBillingAliasForm.controls['description'].setValue(this.billingAliasData.description);
      this.addVendorBillingAliasForm.controls['status'].setValue(this.billingAliasData.status);
      this.addVendorBillingAliasForm.controls['chargeCodeAlias'].setValue(this.billingAliasData.chargeCodeAlias);
      this.addVendorBillingAliasForm.controls['invoiceAlias'].setValue((this.billingAliasData.invoiceAlias)? this.billingAliasData.invoiceAlias: false);
    }

    if (this.isCompanyUser || this.isTEMUser) {
      this.addVendorBillingAliasForm.disable();
    }
  }
  get f() {
    return this.addVendorBillingAliasForm.controls;
  }
  addBillingAlias() {
    this.isFormSubmit = true;
    if (this.addVendorBillingAliasForm.valid) {
      this.saveButtonLoadder = true;
      this.addVendorBillingAliasForm.value.status = (this.addVendorBillingAliasForm.value.status || this.addVendorBillingAliasForm.value.status == 'true') ? true : false;
      this.locationService.addVendorBillingAlias(this.addVendorBillingAliasForm.value).subscribe({
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
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {panelClass: 'error-warning', data: errorData });
          dialogRef.afterClosed().subscribe(result => {
            this.afterBillingAliasAdd.emit(data);
          });
          this.isFormSubmit = false;
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
          }
        }
      });
    }
  }
  convertToDateTime(date: any) {
    return moment(new Date(date)).format('MM/DD/YYYY');
  }
  getModifiedByUser(FirstName: any, LastName: any) {

    let fname = (FirstName) ? FirstName : '';
    let lname = (LastName) ? LastName : '';

    return fname + lname;
  }
  ngOnDestroy() {
    this.onAddBillingAliasComponentDestroy.emit(this.addVendorBillingAliasForm.value);
  }
}
