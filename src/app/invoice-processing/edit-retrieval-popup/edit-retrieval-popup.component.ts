import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { LocationService } from 'src/app/services/location.service';
import { takeUntil } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ManageService } from 'src/app/services/manage.service';
import { isValuesUndefined } from 'src/app/services/helper';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SpaceTrimStartEndInputirective } from 'src/app/custom-directives/custom-validation.directive';

@Component({
  selector: 'app-edit-retrieval-popup',
  templateUrl: './edit-retrieval-popup.component.html',
  styleUrls: ['./edit-retrieval-popup.component.scss'],
  imports: [SharedModule, PrimgModule, SpaceTrimStartEndInputirective]
})
export class AddEditRetrievalPopupComponent implements OnInit {
  vendors: any = [];
  billingAlias: any = [];
  isChargeCodeFormSubmit: boolean = false;
  addInvoiceRetrivalForm: FormGroup;
  tems: any = [];
  InvoiceRetrievalMethods = [];
  InvoiceRetrievalStatus = [];
  allCustomerSub: Subscription;
  vendorsSub: Subscription;
  customerList: any = [];
  vendorsList: any = [];
  setTemDDValue: any;
  CutomerId: any;
  VendorId: any;
  submitted: boolean = false;
  fetchDateData: any;
  billDay = '';
  dialogData: any;
  billingAccount: any;
  saveButtonLoadder = false;
  hide = true;

  private _unsubscribeAll: Subject<any> = new Subject<any>();
  
  constructor(private fb: FormBuilder, 
    public manageService: ManageService,
    public dialogRef: MatDialogRef<AddEditRetrievalPopupComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    public dialog: MatDialog, private locationService: LocationService) { 
      this.dialogData = data;
   
    this.addInvoiceRetrivalForm = this.fb.group({
      BillingAccountID: new FormControl('', [Validators.required]),
      invoiceBillDate: new FormControl('',),
      CustomerAccountId: new FormControl('', [Validators.required]),
      VendorAccountId: new FormControl('', [Validators.required]),
      InvoiceMonthYear: new FormControl('', []),
      ExpectedDate: new FormControl('', []),
      RetrievalDate: new FormControl('', []),
      ReceivedDate: new FormControl('', []),
      ProcessedDate: new FormControl('', []),
      InvoiceRetrievalMethodId: new FormControl('', []),
      RetrievalStatusID: new FormControl('', []),
      WebUrl: new FormControl('', []),
      WebLogin: new FormControl('', []),
      WebPassword: new FormControl('', []),
      InvoiceRetrievalNotes: new FormControl('', []),
      TEM: new FormControl('', [Validators.required]),
    });
  }

  getTEMList() {
    this.locationService.getTEMLoggedInUserDropDown()
      .pipe(takeUntil(this._unsubscribeAll))
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
  
  ngOnInit(): void {
    this.getDataWithId(this.dialogData.ExpectedInvoiceId);
    this.getTEMList();
    this.getCustomerList();
    this.getvendorsSubList();
    this.getInvoiceRetrivalMethod();
    this.getInvoiceRetrivalStatus();
  }

  getDataWithId(id: any) {
    this.locationService.getInvoiceRetrievalWithID(id).subscribe((data) => {
      data = data.Data;
      if (data) {
        const datas: any = {};
        datas['TEM'] = data.TEMAccountId;
        datas['CustomerAccountId'] = data.CustomerAccountId;
        datas['VendorAccountId'] = data.VendorAccountId;
        datas['BillingAccountID'] = data.BillingAccountID;
        datas['invoiceBillDate'] = data.invoiceBillDate ? this.manageService.convertDate(data.invoiceBillDate, 'datePicker') : '';
        datas['InvoiceMonthYear'] = data.InvoiceMonthYear ? this.manageService.convertDate(data.InvoiceMonthYear, 'datePicker') : '';
        datas['ExpectedDate'] = data.ExpectedDate ? this.manageService.convertDate(data.ExpectedDate, 'datePicker') : '';
        datas['RetrievalDate'] = data.RetrievalDate ? this.manageService.convertDate(data.RetrievalDate, 'datePicker') : '';
        datas['ReceivedDate'] = data.ReceivedDate ? this.manageService.convertDate(data.ReceivedDate, 'datePicker') : '';
        datas['ProcessedDate'] = data.ProcessedDate ? this.manageService.convertDate(data.ProcessedDate, 'datePicker') : '';
        datas['InvoiceRetrievalMethodId'] = data.InvoiceRetrievalMethodId;
        datas['RetrievalStatusID'] = data.RetrievalStatusID;
        datas['WebUrl'] = data.WebUrl;
        datas['WebLogin'] = data.WebLogin;
        datas['WebPassword'] = data.WebPassword;
        datas['InvoiceRetrievalNotes'] = data.InvoiceRetrievalNotes;
        this.billDay = data.InvoiceBillDay;

        this.VendorId = data.VendorAccountId;
        this.CutomerId = data.CustomerAccountId;
        this.getCustomerVendorBillingAccounts();
        this.addInvoiceRetrivalForm.patchValue(datas);
        // this.disabledAccountEditBtn = false;
      }
    });
  }
  fetchDates() {
    if (this.addInvoiceRetrivalForm.value.BillingAccountID && this.addInvoiceRetrivalForm.value.invoiceBillDate) {

      const data = {
        BillingAccountID: this.addInvoiceRetrivalForm.value.BillingAccountID,
        invoiceDate: this.addInvoiceRetrivalForm.value.invoiceBillDate,
      };
      this.addInvoiceRetrivalForm.controls['InvoiceMonthYear'].setValue('');
      this.addInvoiceRetrivalForm.controls['ExpectedDate'].setValue('');
      this.addInvoiceRetrivalForm.controls['RetrievalDate'].setValue('');
      this.allCustomerSub = this.locationService.getInvoiceFetchDate(data).subscribe((datas) => {
        if (datas) {
          this.fetchDateData = datas;
          if (this.fetchDateData) {
            this.addInvoiceRetrivalForm.controls['InvoiceMonthYear'].setValue(this.fetchDateData.InvoiceMonthYear ? this.manageService.convertDate(this.fetchDateData.InvoiceMonthYear, 'datePicker') : '')
            this.addInvoiceRetrivalForm.controls['ExpectedDate'].setValue(this.fetchDateData.invoiceExpectedDate ? this.manageService.convertDate(this.fetchDateData.invoiceExpectedDate, 'datePicker') : '')
            this.addInvoiceRetrivalForm.controls['RetrievalDate'].setValue(this.fetchDateData.invoiceRetrievalDate ? this.manageService.convertDate(this.fetchDateData.invoiceRetrievalDate, 'datePicker') : '')
          }
        }
      });
    }
  }

  onCutomerChange(data: number) {
    this.CutomerId = data;
    this.addInvoiceRetrivalForm.controls['BillingAccountID'].setValue('');
    this.getCustomerVendorBillingAccounts();
  }

  getCustomerVendorBillingAccounts() {
    let KeyString = '?payableAccount=true';

    if (this.CutomerId || this.VendorId) {
      KeyString += "&customerId=" + (this.CutomerId ?? '') + "&VendorId=" + (this.VendorId ?? '');
    }
    this.locationService.getCustomerVendorBillingAccounts(KeyString).subscribe((data) => {
      if (data && data.$values) {
        this.billingAccount = data.$values;
        this.billingAccount = this.billingAccount.map((r: any) => {
          let a: any = {};
          a = r;
          a['value'] = r.BillingAccount.$values[0].Id;
          return a;
        })
      }
    });
  }

  filterCustomerGridByTEMId() {
    this.customerList = [];
    if (this.addInvoiceRetrivalForm.value.TEM) {
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
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
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
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
          dialogRef.afterClosed().subscribe(result => {
          });
        });
    } else {
      this.getCustomerList();
    }
  }
  
  getInvoiceRetrivalMethod() {
    this.locationService.getInvoiceRetrievalMethods().subscribe((data) => {
      if (data && data.$values) {
        this.InvoiceRetrievalMethods = data.$values;
      }
    });
  }
  getInvoiceRetrivalStatus() {
    this.locationService.expectedinvoicestatuses().subscribe((data) => {
      if (data && data.$values) {
        this.InvoiceRetrievalStatus = data.$values;
      }
    });
  }
  getvendorsSubList() {
    this.vendorsSub = this.locationService.getVendorDropdown().subscribe((data) => {
      if (data && data.Data.$values) {
        this.vendorsList = data.Data.$values;
      }
    });
  }
  getCustomerList() {
    this.allCustomerSub = this.locationService.getCustomerDropDown().subscribe((data) => {
      if (data && data.$values) {
        this.customerList = data.$values;
        // const data1 =  this.customerList.find(res => res.Id === this.rowData.CustomerID);
        // this.setTemDDValue = data1.TemAccountID;
        // this.setTemDDValueEvent.emit(this.setTemDDValue);
      }
    });
  }
  onVendorChange(data: any) {
    this.VendorId = data;
    this.addInvoiceRetrivalForm.controls['BillingAccountID'].setValue('');
    this.getCustomerVendorBillingAccounts();
  }
  checkValidProcessDate() {
    if (!this.addInvoiceRetrivalForm.controls['ProcessedDate'].value) {
      this.addInvoiceRetrivalForm.controls['ProcessedDate'].setValue('');
    }
  }
  checkValidReceivedDate() {
    if (!this.addInvoiceRetrivalForm.controls['ReceivedDate'].value) {
      this.addInvoiceRetrivalForm.controls['ReceivedDate'].setValue('');
    }
  }
  checkValidBillDate() {
    if (!this.addInvoiceRetrivalForm.controls['invoiceBillDate'].value) {
      this.addInvoiceRetrivalForm.controls['invoiceBillDate'].setValue('');
    }
  }

  invoiceRetrievalDeactive() {

    let errorData: any = {
      okBtnName: "Delete",
      closeBtnName: "Cancel",
      messgeType: "error",
      title: "Attention",
      titleClass: "text-c-blue",
      icon: "fas fa-exclamation-circle",
      iconClass: "text-c-blue f-70",
      message: 'You are about to delete this retrieval record.  Continue?'
    };
    const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
    dialogRef.afterClosed().subscribe(result => {
      if (!isValuesUndefined(result)) {
        if (result) {
          this.locationService.invoiceRetrievalDeactive(this.dialogData.ExpectedInvoiceId).subscribe({
            next: data => {
              if (data) {
                let errorData: any = {
                  messgeType: "error",
                  title: "Attention",
                  titleClass: "text-c-blue",
                  icon: "fas fa-exclamation-circle",
                  iconClass: "text-c-blue f-70",
                  message: 'Deleted Successfully!'
                };
                const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
                dialogRef.afterClosed().subscribe(result => {
                  // this.onUserAddEvent.emit(true);
                });
              }
            },
            error: error => {
              if (error.status === 404) {
                let errorData: any = {
                  messgeType: "error",
                  title: "Attention",
                  titleClass: "text-c-blue",
                  icon: "fas fa-exclamation-circle",
                  iconClass: "text-c-blue f-70",
                  message: error.error
                };
                const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
                dialogRef.afterClosed().subscribe(result => {

                });
              }
            }
          });
        }
      }
    });
  }

  get f() : any {
    return this.addInvoiceRetrivalForm.controls;
  }

  saveInvoiceForcastData() {

    this.submitted = true;
    if (this.addInvoiceRetrivalForm.valid) {
      this.saveButtonLoadder = true;
      const a = Object.keys(this.addInvoiceRetrivalForm.value);
      a.forEach((g) => {
        if (!this.addInvoiceRetrivalForm.value[g]) {
          this.addInvoiceRetrivalForm.value[g] = null;
        }
      });

      this.addInvoiceRetrivalForm.value['InvoiceMonthYear'] = this.addInvoiceRetrivalForm.value['InvoiceMonthYear'] ? this.manageService.convertDate(this.addInvoiceRetrivalForm.value['InvoiceMonthYear'], 'inputText') : null;
      this.addInvoiceRetrivalForm.value['ExpectedDate'] = this.addInvoiceRetrivalForm.value['ExpectedDate'] ? this.manageService.convertDate(this.addInvoiceRetrivalForm.value['ExpectedDate'], 'inputText') : null;
      this.addInvoiceRetrivalForm.value['RetrievalDate'] = this.addInvoiceRetrivalForm.value['RetrievalDate'] ? this.manageService.convertDate(this.addInvoiceRetrivalForm.value['RetrievalDate'], 'inputText') : null;

      this.addInvoiceRetrivalForm.value['invoiceBillDate'] = this.addInvoiceRetrivalForm.value['invoiceBillDate'] ? this.manageService.convertDate(this.addInvoiceRetrivalForm.value['invoiceBillDate'], 'saveDatePicker') : null;
      this.addInvoiceRetrivalForm.value['ReceivedDate'] = this.addInvoiceRetrivalForm.value['ReceivedDate'] ? this.manageService.convertDate(this.addInvoiceRetrivalForm.value['ReceivedDate'], 'saveDatePicker') : null;
      this.addInvoiceRetrivalForm.value['ProcessedDate'] = this.addInvoiceRetrivalForm.value['ProcessedDate'] ? this.manageService.convertDate(this.addInvoiceRetrivalForm.value['ProcessedDate'], 'saveDatePicker') : null;

      this.addInvoiceRetrivalForm.value['copyToPaymentSettings'] = false;

      this.locationService.invoiceRetrievalUpdate(this.dialogData.ExpectedInvoiceId, this.addInvoiceRetrivalForm.value).subscribe(data => {
        this.saveButtonLoadder = false;
        let errorData: any = {
          messgeType: "error",
          title: "Attention",
          titleClass: "text-c-blue",
          icon: "fas fa-exclamation-circle",
          iconClass: "text-c-blue f-70",
          message: 'Successfully saved'
        }
        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
        dialogRef.afterClosed().subscribe(result => {
          // this.onUserAddEvent.emit(true);
          this.dialogRef.close();
        });
      }, error => {
        this.saveButtonLoadder = false;
        let errorData: any = {
          messgeType: "error",
          title: "Attention",
          titleClass: "text-c-blue",
          icon: "fas fa-exclamation-circle",
          iconClass: "text-c-blue f-70",
          message: error.error
        }
        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
        dialogRef.afterClosed().subscribe(result => {
        });
      });
    }
  }

  getVendorsForUser() {
    this.locationService.getVendorDropdown().subscribe((data) => {
      if (data && data.Data.$values) {
        this.vendors = data.Data.$values;
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
}
