import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as _ from 'lodash';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { isValuesUndefined } from 'src/app/services/helper';
import { LocationService } from 'src/app/services/location.service';
import { ManageService } from 'src/app/services/manage.service';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { SpaceTrimStartEndInputirective } from 'src/app/custom-directives/custom-validation.directive';

@Component({
  selector: 'app-add-retrieval-popup',
  templateUrl: './add-retrieval-popup.component.html',
  styleUrls: ['./add-retrieval-popup.component.scss'],
  imports: [SharedModule, PrimgModule, SpaceTrimStartEndInputirective]
})
export class AddRetrievalPopupComponent implements OnInit {
  allCustomerSub: Subscription;
  vendorsSub: Subscription;
  customerList: any = [];
  vendorsList: any = [];
  tems: any = [];
  CutomerId: any;
  billDay: any;
  VendorId: any;
  billingAccount: any;
  fetchDateData: any;
  submitted: boolean = false;
  saveButtonLoadder = false;
  isDisable: any;
  isSelected: any;

  addInvoiceRetrivalForm: FormGroup;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  private _unsubscribeAllTEMList: Subject<any> = new Subject<any>();
  private _unsubscribeAllBillingAccount: Subject<any> = new Subject<any>();
  private _unsubscribeAllCustomer: Subject<any> = new Subject<any>();
  private _unsubscribeAllVendor: Subject<any> = new Subject<any>();

  constructor(private fb: FormBuilder, public dialog: MatDialog,
    public manageService: ManageService, @Inject(MAT_DIALOG_DATA) data: any,
    public dialogRef: MatDialogRef<AddRetrievalPopupComponent>,
    private locationService: LocationService) { 
      this.isDisable =  data?.SandboxStatus == "No Retrieval Record" ? true:false;
      this.isSelected = data;
    }

  ngOnInit(): void {
    this.addInvoiceRetrivalForm = this.fb.group({
      TEM: new FormControl('', [Validators.required]),
      customerAccountId: new FormControl('', [Validators.required]),
      vendorAccountId: new FormControl('', [Validators.required]),
      billingAccountId: new FormControl('', [Validators.required]),
      invoiceExpectedDate: new FormControl('', []),
      invoiceRetrievalDate: new FormControl('', []),
    });

    this.getTEMList();
    this.getCustomerList();
    this.getvendorsSubList();
  }
  onVendorChange(data: any) {
    // this.addInvoiceRetrivalForm.controls['InvoiceMonthYear'].setValue('');
    this.addInvoiceRetrivalForm.controls['invoiceExpectedDate'].setValue('');
    this.addInvoiceRetrivalForm.controls['invoiceRetrievalDate'].setValue('');
    this.VendorId = data;
    this.getCustomerVendorBillingAccounts();
  }
  saveInvoiceForcastData() {

    this.submitted = true;
    if (this.addInvoiceRetrivalForm.valid) {
      this.saveButtonLoadder = true;
      let data = this.addInvoiceRetrivalForm.value;
      data['sbInvoiceId'] = this.isSelected.SBInvoiceId;

      this.locationService.addInvoiceRetrieval(data).subscribe(data => {
        this.saveButtonLoadder = false;
        let errorData: any = {
          messgeType: "error",
          title: "Attention",
          titleClass: "text-c-blue",
          icon: "fas fa-exclamation-circle",
          iconClass: "text-c-blue f-70",
          message: 'Successfully saved' //if messges is multiple use array
        }
        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning',data: errorData });
        dialogRef.afterClosed().subscribe(result => {
          this.dialogRef.close();
        });
      }, error => {
        this.saveButtonLoadder = false;

        const bID = this.addInvoiceRetrivalForm.value.billingAccountId;
        let billDayF: any;
        if (bID) {
          billDayF = this.billingAccount.find((n: any) => {
            return n.BillingAccount.$values[0].Id.toString() === bID.toString();
          })
        }

        this.billDay = (billDayF) ? billDayF['BillingAccount'].$values[0].InvoiceBillDay : '';
        if (this.addInvoiceRetrivalForm.value.billingAccountId) {
          const data: any = {
            billingAccountId: this.addInvoiceRetrivalForm.value.billingAccountId
          };

          if (error.status === 404 && error.error.RedirectPage === 'UpdateAccountInvoiceAndDataRetrieval') {
            let errorData: any = {
              messgeType: "error",
              title: "Attention",
              titleClass: "text-c-blue",
              icon: "fas fa-exclamation-circle",
              okBtnName: "Go To Invoice & Data Retrieval",
              iconClass: "text-c-blue f-70",
              message: error.error.DisplayMessage
            }
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {panelClass: 'error-warning', data: errorData });
            dialogRef.afterClosed().subscribe(result => {
              if (!isValuesUndefined(result)) {
                data['PayableAccountNumber'] = billDayF.AccountNumber;
                data['BillingAccountID'] = data.billingAccountId;
                data['selectedTab'] = 1;
                data['filedTouched'] = true;
                // this.openEditBillingTab.emit(data);
              }
            });
          }
          if (error.status === 404 && error.error.RedirectPage === 'UpdateAccount') {
            let errorData: any = {
              messgeType: "error",
              title: "Attention",
              titleClass: "text-c-blue",
              icon: "fas fa-exclamation-circle",
              iconClass: "text-c-blue f-70",
              closeBtnName: "Cancel",
              message: error.error.DisplayMessage
            }
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {panelClass: 'error-warning', data: errorData });
            dialogRef.afterClosed().subscribe(result => {
              if (result !== 'undefined') {
                data['PayableAccountNumber'] = billDayF.AccountNumber;
                data['BillingAccountID'] = data.billingAccountId;
                data['selectedTab'] = 0;
                // this.openEditBillingTab.emit(data);
              }
            });
          }
          if (error.status === 400) {
            let errorData: any = {
              messgeType: "error",
              title: "Attention",
              titleClass: "text-c-blue",
              icon: "fas fa-exclamation-circle",
              iconClass: "text-c-blue f-70",
              message: error.error
            }
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning',data: errorData });
            dialogRef.afterClosed().subscribe(result => {

            });
          }
        }
      });
    }
  }
  onCutomerChange(data: any) {
    this.CutomerId = data;
    // this.addInvoiceRetrivalForm.controls['InvoiceMonthYear'].setValue('');
    this.addInvoiceRetrivalForm.controls['invoiceExpectedDate'].setValue('');
    this.addInvoiceRetrivalForm.controls['invoiceRetrievalDate'].setValue('');
    this.getCustomerVendorBillingAccounts();
  }
  getCustomerVendorBillingAccounts(openFromChngeTab: Boolean = false) {
    if (!openFromChngeTab) {
      this.addInvoiceRetrivalForm.controls['billingAccountId'].setValue('');
    }
    let KeyString: any = '';
    KeyString = '?payableAccount=true';
    if (this.CutomerId || this.VendorId) {
      KeyString += "&customerId=" + (this.CutomerId ?? '') + "&VendorId=" + (this.VendorId ?? '');
    }
    this.billDay = '';
    this._unsubscribeAllBillingAccount.next(null);
    this.locationService.getCustomerVendorBillingAccounts(KeyString).pipe(takeUntil(this._unsubscribeAllBillingAccount)).subscribe((data) => {
      if (data && data.$values) {
        this.billingAccount = data.$values;
        this.billingAccount =  this.billingAccount.map( (r: any) => {
          let a: any = {};
          a = r;
          a['value'] = r.BillingAccount.$values[0].Id;
          return a;
        })
      }
      if (openFromChngeTab) {
        this.fetchDates();
      }
    });
  }

  fetchDates() {

    const bID = this.addInvoiceRetrivalForm.value.billingAccountId;
    let billDayF: any;
    if (bID) {
      billDayF = this.billingAccount.find((n: any) => {
        return n.BillingAccount.$values[0].Id.toString() === bID.toString();
      })
    }

    this.billDay = (billDayF) ? billDayF['BillingAccount'].$values[0].InvoiceBillDay : '';
    if (this.addInvoiceRetrivalForm.value.billingAccountId) {
      var today = new Date();
      var dd = String(today.getDate()).padStart(2, '0');
      var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
      var yyyy = today.getFullYear();

      var td = yyyy + '-' + mm + '-' + dd;
      const data: any = {
        billingAccountId: this.addInvoiceRetrivalForm.value.billingAccountId,
        invoiceDate: td,
      };
      // this.addInvoiceRetrivalForm.controls['InvoiceMonthYear'].setValue('');
      this.addInvoiceRetrivalForm.controls['invoiceExpectedDate'].setValue('');
      this.addInvoiceRetrivalForm.controls['invoiceRetrievalDate'].setValue('');
      this.allCustomerSub = this.locationService.getInvoiceFetchDate(data).subscribe((datas) => {
        if (datas) {
          this.fetchDateData = datas;
          if (this.fetchDateData) {
            this.addInvoiceRetrivalForm.controls['invoiceExpectedDate'].setValue(this.fetchDateData.invoiceExpectedDate ? this.manageService.convertDate(this.fetchDateData.invoiceExpectedDate) : '')
            this.addInvoiceRetrivalForm.controls['invoiceRetrievalDate'].setValue(this.fetchDateData.invoiceRetrievalDate ? this.manageService.convertDate(this.fetchDateData.invoiceRetrievalDate) : '')
          }
        }
      }, error => {
        if (error.status === 404 && error.error.RedirectPage === 'UpdateAccountInvoiceAndDataRetrieval') {
          let errorData: any = {
            messgeType: "error",
            title: "Attention",
            titleClass: "text-c-blue",
            icon: "fas fa-exclamation-circle",
            iconClass: "text-c-blue f-70",
            okBtnName: "Go To Invoice & Data Retrieval",
            message: error.error.DisplayMessage
          }
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {panelClass: 'error-warning', data: errorData });
          dialogRef.afterClosed().subscribe(result => {
            if (!isValuesUndefined(result)) {
              data['PayableAccountNumber'] = billDayF.AccountNumber;
              data['BillingAccountID'] = data.billingAccountId;
              data['selectedTab'] = 1;
              data['filedTouched'] = true;
              // this.openEditBillingTab.emit(data);
            }
          });
        }
        if (error.status === 404 && error.error.RedirectPage === 'UpdateAccount') {
          let errorData: any = {
            messgeType: "error",
            title: "Attention",
            titleClass: "text-c-blue",
            icon: "fas fa-exclamation-circle",
            iconClass: "text-c-blue f-70",
            closeBtnName: "Cancel",
            message: error.error.DisplayMessage
          }
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning',data: errorData });
          dialogRef.afterClosed().subscribe(result => {
            if (result !== 'undefined') {
              data['PayableAccountNumber'] = billDayF.AccountNumber;
              data['BillingAccountID'] = data.billingAccountId;
              data['selectedTab'] = 0;
              // this.openEditBillingTab.emit(data);
            }
          });
        }

      });
    }
  }

  get f(): any {
    return this.addInvoiceRetrivalForm.controls;
  }
  
  setTemDDId() {
    if (this.f.customerAccountId.value) {
      this.addInvoiceRetrivalForm.controls['TEM'].setValue(
        _.cloneDeep(
          this.customerList.find(
            (data: any) => data.Id == this.f.customerAccountId.value
          ).TemAccountID
        )
      );
    }
  }

  getCustomerList() {
    this.customerList = [];

    this._unsubscribeAllCustomer.next(null);
    this.allCustomerSub = this.locationService.getCustomerDropDown().pipe(takeUntil(this._unsubscribeAllCustomer)).subscribe((data) => {
      if (data && data.$values) {
        this.customerList = data.$values;
      }
    });

  }

  filterCustomerGridByTEMId() {
    this.customerList = [];
    if (this.addInvoiceRetrivalForm.value.TEM) {
      this.addInvoiceRetrivalForm.controls['customerAccountId'].setValue('');
      this._unsubscribeAll.next(null);
      this.locationService.getCustomerDropdownByNewTEM(this.addInvoiceRetrivalForm.value.TEM)
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((data) => {
          if (data && data.Data.$values) {
            this.customerList = data.Data.$values;
          } else {
            let errorData: any = {
              messgeType: "error",
              title: "Attention",
              titleClass: "text-c-blue",
              icon: "fas fa-exclamation-circle",
              iconClass: "text-c-blue f-70",
              message: "Something Went Wrong"
            }
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {panelClass: 'error-warning', data: errorData });
            dialogRef.afterClosed().subscribe(result => {
            });
          }
        }, error => {
          let errorData: any = {
            messgeType: "error",
            title: "Attention",
            titleClass: "text-c-blue",
            icon: "fas fa-exclamation-circle",
            iconClass: "text-c-blue f-70",
            message: 'No customer found within the selected TEM'
          }
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {panelClass: 'error-warning', data: errorData });
          dialogRef.afterClosed().subscribe(result => {
          });
        });
    } else {
      this.getCustomerList();
    }
  }
  
  getvendorsSubList() {
    this._unsubscribeAllVendor.next(null);
    this.vendorsSub = this.locationService.getVendorDropdown().pipe(takeUntil(this._unsubscribeAllVendor)).subscribe((data) => {
      if (data && data.Data.$values) {
        this.vendorsList = data.Data.$values;
        this.addInvoiceRetrivalForm.controls['vendorAccountId'].setValue(this.isSelected.VendorAccountId);
      }
    });
  }

  getTEMList() {
    this._unsubscribeAllTEMList.next(null);
    this.locationService.getTEMLoggedInUserDropDown()
      .pipe(takeUntil(this._unsubscribeAllTEMList))
      .subscribe((data) => {
        if (data && data.$values) {
          this.tems = data.$values;

          let id = sessionStorage.getItem("LoggedAccountId");
          const found = this.tems.find((element: any) => Number(element.Id) === Number(id));
          this.tems.unshift(found);

          this.tems = this.tems.filter((object: any, index: number): boolean => {
            return object && this.tems.indexOf(object) === index;
          });
        }
      });
  }

  ngOnDestroy() {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
    this._unsubscribeAllTEMList.next(null);
    this._unsubscribeAllTEMList.complete();
    this._unsubscribeAllBillingAccount.next(null);
    this._unsubscribeAllBillingAccount.complete();
    this._unsubscribeAllCustomer.next(null);
    this._unsubscribeAllCustomer.complete();
    this._unsubscribeAllVendor.next(null);
    this._unsubscribeAllVendor.complete();
  }
}
