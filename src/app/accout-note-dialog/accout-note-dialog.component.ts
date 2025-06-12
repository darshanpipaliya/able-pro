import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import _ from 'lodash';
import { ManageService } from '../services/manage.service';
import { LocationService } from '../services/location.service';
import { LastMonthDataDialogComponent } from '../last-month-data-dialog/last-month-data-dialog.component';
import { FileUploadPopupComponent } from '../common/file-upload-popup/file-upload-popup.component';
import { checkIsValueExists, isValueExist } from '../services/helper';
import { ErrorWarningPopupComponent } from '../common/error-warning-popup/error-warning-popup.component';
import { SharedModule } from '../demo/shared/shared.module';
import { PrimgModule } from '../demo/shared/primeng.module';
import { SpaceTrimStartEndInputirective } from '../custom-directives/custom-validation.directive';

@Component({
  selector: 'app-accout-note-dialog',
  templateUrl: './accout-note-dialog.component.html',
  styleUrls: ['./accout-note-dialog.component.scss'],
  imports: [SharedModule, PrimgModule, SpaceTrimStartEndInputirective]
})
export class AccoutNoteDialogComponent implements OnInit {

  accountNotesForm: FormGroup;

  hasSsuperTemUsers: boolean = false;
  saveButtonDisabled: boolean = false;
  isSubmit: boolean = false;

  selectedFileName = '';
  uploadedFile: any;
  billingAccId: any;
  billingAccountData: any;

  days: any = [];
  customerList: any = [];
  vendorsList: any = [];
  currenciesList: any = [];
  invoicefrequenciesList: any = [];
  statusList: any = [];

  private _unsubscribeAll: Subject<any> = new Subject<any>();
  private getCustomer: Subject<any> = new Subject<any>();
  private _unsubscribeVendor: Subject<any> = new Subject<any>();
  private _unsubscribeNotes: Subject<any> = new Subject<any>();
  private _unsubscribeBillingStatus: Subject<any> = new Subject<any>();

  constructor(public dialog: MatDialog, @Inject(MAT_DIALOG_DATA) data: any,
    public dialogRef: MatDialogRef<LastMonthDataDialogComponent>,
    private _formBuilder: FormBuilder,
    public manageService: ManageService,
    private _LocationService: LocationService,
  ) {
    dialogRef.disableClose = true;
    this.billingAccId = data;
  }

  ngOnInit(): void {
    
    this.hasSsuperTemUsers = this._LocationService.isUserHasSuperTEMUsersRole();
    this.setAccountNotesForm();
    this.getCustomerForUser();
    this.filterVendorGridByTEMId();
    this.getCurrencies();
    this.getInvoicefrequencies();
    this.getPayBydays();
    this.billingAccountStatus();
    this.getBillingAccountRecord();
  }

  setAccountNotesForm() {
    this.accountNotesForm = this._formBuilder.group({
      BillingAccountId: new FormControl('', [Validators.required]),
      NoteText: new FormControl('', [Validators.required, Validators.maxLength(1000)]),
      PrivateNote: new FormControl(false, [Validators.required]),
      Active: new FormControl(true, [Validators.required]),
      TicketNumber: new FormControl('', Validators.maxLength(100)),
      // FileAttachment

      customerAccountId: new FormControl('', []),
      vendorAccountId: new FormControl('', []),
      currencyId: new FormControl(''),
      invoiceStartDate: new FormControl('', []),
      accountNumber: new FormControl('', []),
      invoiceBillDay: new FormControl('', []),
      invoiceFrequencyId: new FormControl('', []),
      payByDay: new FormControl('', []),
      isPayableAccount: new FormControl('', []),
      accountStatus: new FormControl('', []),
      processBilling: new FormControl('', []),
      disconnectDate: new FormControl('', [])
    });
  }

  setValueInFormControl(key: any, value: any) {
    this.f[key].setValue(value);
  }

  get f() {
    return this.accountNotesForm.controls;
  }

  openFileUpload() {
    const dialogRef = this.dialog.open(FileUploadPopupComponent, {
      panelClass: 'width-665'
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (checkIsValueExists(result)) {
        this.selectedFileName = result[0].name;
        this.uploadedFile = result[0];
      } else {
        this.selectedFileName = 'File not selected';
        this.uploadedFile = [];
      }

    });
  }

  getBillingAccountRecord() {

    this._LocationService
      .getBillingAccountsDetails(this.billingAccId)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((data) => {
        if (data) {
          this.billingAccountData = data.Data;
          this.setFormValue(this.billingAccountData);
        }
      });
  }

  setFormValue(e: any) {
    // setTimeout(() => {
      this.setValueInFormControl('BillingAccountId', isValueExist(e.Id ? e.Id : e.BillingAccountId));
      this.setValueInFormControl('customerAccountId', isValueExist(e.CustomerAccountId));
      this.setValueInFormControl('vendorAccountId', isValueExist(e.VendorAccountId));
      this.setValueInFormControl('currencyId', isValueExist(e.CurrencyId));
      this.setValueInFormControl('invoiceStartDate', e.InvoiceStartDate ? isValueExist(this.manageService.convertDate(e.InvoiceStartDate, '', '/')) : '');
      this.setValueInFormControl('accountNumber', isValueExist(e.AccountNumber));
      this.setValueInFormControl('invoiceFrequencyId', isValueExist(e.InvoiceFrequencyID ? e.InvoiceFrequencyID : e.InvoiceFrequencyId));
      if(e?.PayByDays){
        this.setValueInFormControl('payByDay', isValueExist(e.PayByDays.toString()));
      }
      if(e?.InvoicePayByDay){
        this.setValueInFormControl('payByDay', isValueExist(e.InvoicePayByDay.toString()));
      }
      this.setValueInFormControl('invoiceBillDay', isValueExist(e.InvoiceBillDay));
      this.setValueInFormControl('isPayableAccount', isValueExist(e.PayableAccount));
      this.setValueInFormControl('accountStatus', isValueExist(e.BillingAccountStatusId));
      this.setValueInFormControl('processBilling', isValueExist(e.ProcessingBilling));
      this.setValueInFormControl('disconnectDate', e.InvoiceDisconnectionDate ? isValueExist(this.manageService.convertDate(e.InvoiceDisconnectionDate, '', '/')) : '');
    // }, 1000);
  }

  saveNotes() {
    this.isSubmit = true;
    if (this.accountNotesForm.valid) {

      // this.accountNotesForm.value.NoteText = this.accountNotesForm.value.NoteText.split(/\r?\n/).filter(line => line.trim() !== '').join('\n');
      // Custome validation for blank space - Mihir
      this.accountNotesForm.value.NoteText = this.accountNotesForm.value.NoteText.replace(/\n/g, ' ');

      const formData = new FormData();
      if (this.selectedFileName) {
        formData.append('FileAttachment', this.uploadedFile);
      }
      formData.append('BillingAccountId', this.accountNotesForm.value.BillingAccountId);
      formData.append('NoteText', this.accountNotesForm.value.NoteText);
      formData.append('PrivateNote', this.accountNotesForm.value.PrivateNote);
      formData.append('Active', this.accountNotesForm.value.Active);
      formData.append('TicketNumber', this.accountNotesForm.value.TicketNumber ? this.accountNotesForm.value.TicketNumber : '');

      this.saveButtonDisabled = true;
      this._unsubscribeNotes.next(null);
      this._LocationService.saveAccountNotes(formData).pipe(takeUntil(this._unsubscribeNotes)).subscribe((response) => {
        this.saveButtonDisabled = false;
        if (response.Success) {
          this.errorPopup(response)
          this.dialogRef.close(true);
        } else {
          this.errorPopup(response)
          this.dialogRef.close(true);
        }
      }, error => {
        this.saveButtonDisabled = false;
        this.errorPopup(error);
      });
    }
  }

  errorPopup(data: any) {
    let errorData: any = {
      messgeType: 'error',
      title: 'Attention',
      titleClass: 'text-c-blue',
      icon: 'fas fa-exclamation-circle',
      iconClass: 'text-c-blue f-70',
      message: data.Message,
    };
    const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
      panelClass: 'error-warning',
      data: errorData,
    });
    dialogRef.afterClosed().subscribe((result) => {
    });
  }

  getPayBydays(){
    for (let i = 1; i <= 31; i++) {
      this.days.push({ Id: i, value: i, stringValue: i.toString() });
    }
  }

  billingAccountStatus() {
    this.statusList = [];
    this._unsubscribeBillingStatus.next(null);
    this._LocationService.getBillingAccountStatus().pipe(takeUntil(this._unsubscribeBillingStatus))
      .subscribe((data: any) => {
        if (data.Data.$values) {
          this.statusList = data.Data.$values;
        }
      });
  }

  getCustomerForUser() {
    this.getCustomer.next(null);
    this.customerList = [];
    this._LocationService.getCustomerDropDown().pipe(takeUntil(this.getCustomer)).subscribe((data) => {
      if (data && data.$values) {
        this.customerList = data.$values;
      }
    });
  }


  filterVendorGridByTEMId() {
    this.vendorsList = [];
    this._unsubscribeVendor.next(null);
    this._LocationService
      .getVendorDropdown()
      .pipe(takeUntil(this._unsubscribeVendor))
      .subscribe({
        next: (data) => {
          if (data && data.Data.$values) {
            this.vendorsList = data.Data.$values;
          }
        },
        error: (error) => { },
      });
  }

  getCurrencies() {
    this._LocationService
      .getCurrencies()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((data) => {
        if (data && data.$values) {
          this.currenciesList = data.$values;
          const foundIdx = this.currenciesList.findIndex(
            (el: any) => el.CurrencyCode == 'USD'
          );
          let currenyItem: any = this.currenciesList[foundIdx];
          this.currenciesList.splice(foundIdx, 1);
          this.currenciesList = _.cloneDeep(this.currenciesList);
          this.currenciesList.unshift(currenyItem);
          this.currenciesList.map((c: any) => {
            let a: any = {};
            a = c;
            a['label'] = c['CurrencyCode'] + '/' + c['Name'] + '/' + c['Symbol'];
            return a;
          });

        }
      });
  }

  getInvoicefrequencies() {
    this._LocationService.getInvoicefrequencies().pipe(takeUntil(this._unsubscribeAll)).subscribe((data) => {
      if (data && data.$values) {
        this.invoicefrequenciesList = data.$values;
      }
    });
  }

  ngOnDestroy() {
    this._unsubscribeNotes.next(null);
    this._unsubscribeNotes.complete();
    this.getCustomer.next(null);
    this.getCustomer.complete();
    this._unsubscribeVendor.next(null);
    this._unsubscribeVendor.complete();
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
   this._unsubscribeBillingStatus.next(null);
   this._unsubscribeBillingStatus.complete();
  }

}
