import { formatDate } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import moment from 'moment';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { rolePermission } from 'src/app/services/helper';
import { LocationService } from 'src/app/services/location.service';
@Component({
  selector: 'app-edit-billing-alias',
  templateUrl: './edit-billing-alias.component.html',
  styleUrls: ['./edit-billing-alias.component.scss'],
  imports: [
    SharedModule,
    PrimgModule
  ]
})
export class EditBillingAliasComponent implements OnInit {

  @Input() billingAliasData: any;
  activityDataSource: any = [];
  vendorsList: any = [];
  editVendorBillingAliasForm: FormGroup;
  isFormSubmit: boolean = false;
  @Output() afterBillingAliasEdit: EventEmitter<any> = new EventEmitter<any>();
  columnDefs: any = [
    'Vendor Billing Alias',
    'Vendor',
    // 'Type',
    'Created By',
    // 'Created Date',
    'Created Date',
    'Modified By',
    'Modified Date'
  ];

  rowSelection: any = 'singal';
  defaultColDef = { resizable: true };
  sideBar: any = [];

  rowData: any = [];
  billingAliasLogs: any = [];
  isSuperTEMManager: boolean = false;
  isSuperTEMAdmin: boolean = false;
  isCompanyUser: boolean = false;
  isTEMUser: boolean = false;
  isVendorUser: boolean = false;
  disabled = false;
  saveButtonLoadder = false;

  viewNEdit = false;
  statusList = [
    { Id: true, Name: 'Active' },
    { Id: false, Name: 'Inactive' },
  ]
  constructor(private locationService: LocationService,
    public dialog: MatDialog,
    private fb: FormBuilder) {

  }

  ngOnInit(): void {
    this.isSuperTEMManager = this.locationService.isUserHasSuperTEMManagerRole();
    this.isSuperTEMAdmin = this.locationService.isUserHasSuperTEMAdminRole();
    this.isCompanyUser = this.locationService.isUserCompanyUser();
    this.isTEMUser = this.locationService.isUserHasTEMUserRole();
    this.isVendorUser = this.locationService.isUserVendor();

    this.viewNEdit = rolePermission(['SuperTEMAdmin', 'SuperTEMManager']);

    this.editVendorBillingAliasForm = this.fb.group({
      vendorAccountId: new FormControl('', [Validators.required]),
      name: new FormControl('', [Validators.required]),
      description: new FormControl(''),
      status: new FormControl(true, [Validators.required]),
      invoiceAlias: new FormControl(''),
      chargeCodeAlias: new FormControl('')
    })

    this.locationService.getVendorDropdown().subscribe((data) => {
      if (data && data.Data.$values) {
        this.vendorsList = data.Data.$values;
      }
    });


    this.editVendorBillingAliasForm.controls['vendorAccountId'].setValue((this.billingAliasData.VendorAccountId) ? this.billingAliasData.VendorAccountId : '');
    this.editVendorBillingAliasForm.controls['name'].setValue((this.billingAliasData.VendorBillingAliasName) ? this.billingAliasData.VendorBillingAliasName : '');
    this.editVendorBillingAliasForm.controls['description'].setValue((this.billingAliasData.Description) ? this.billingAliasData.Description : '');
    this.editVendorBillingAliasForm.controls['status'].setValue((this.billingAliasData.Status || this.billingAliasData.Status === 'true') ? this.billingAliasData.Status : false);
    this.editVendorBillingAliasForm.controls['chargeCodeAlias'].setValue((this.billingAliasData.ChargeCodeAlias) ? this.billingAliasData.ChargeCodeAlias : false);
    this.editVendorBillingAliasForm.controls['invoiceAlias'].setValue((this.billingAliasData.InvoiceAlias) ? this.billingAliasData.InvoiceAlias : false);


    this.billingAliasFn();

    if (this.isCompanyUser || this.isTEMUser || this.isVendorUser || !this.viewNEdit) {
      this.editVendorBillingAliasForm.disable();
      this.disabled = true;
    }
  }

  billingAliasFn() {
    this.locationService.getVendorBillingAliasDetails(this.billingAliasData.VendorBillingAliasId).subscribe((data) => {
      if (data) {
        this.billingAliasLogs = data.VendorBillingAliasHistory.$values;
      }
    });
  }
  get f() {
    return this.editVendorBillingAliasForm.controls;
  }
  updateBillingAlias() {
    this.isFormSubmit = true;

    if (this.editVendorBillingAliasForm.valid) {
      this.saveButtonLoadder = true;
      this.editVendorBillingAliasForm.value.status = (this.editVendorBillingAliasForm.value.status || this.editVendorBillingAliasForm.value.status == 'true') ? true : false;
      this.locationService.updateVendorBillingAlias(this.billingAliasData.VendorBillingAliasId, this.editVendorBillingAliasForm.value).subscribe({
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
            this.afterBillingAliasEdit.emit(data);
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
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
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

    return fname + ' ' + lname;
  }
}
