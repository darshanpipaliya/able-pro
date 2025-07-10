import { Component, OnInit, Input, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LocationService } from 'src/app/services/location.service';
import { isValueExist } from 'src/app/services/helper';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { SpaceTrimStartEndInputirective } from 'src/app/custom-directives/custom-validation.directive';

@Component({
  selector: 'app-add-retrieval-note-dialog',
  templateUrl: './add-retrieval-note-dialog.component.html',
  styleUrls: ['./add-retrieval-note-dialog.component.scss'],
  imports: [SharedModule, PrimgModule, SpaceTrimStartEndInputirective],
  providers: []
})
export class AddRetrievalNoteDialogComponent implements OnInit {

  showInvoice: boolean = false;
  disableActions: boolean = false;
  disabledViewInvoiceBtn = false;
  invoiceRetrievalData: any = [];
  addInvoiceRetrivalFormNew: FormGroup;
  noteForm: FormGroup;
  rowData: any;
  saveButtonDisabled = false;
  isSubmit: boolean = false;
  viewOnly: any;
  notesData: any;

  private _unsubscribeNotes: Subject<any> = new Subject<any>();

  constructor(private fb: FormBuilder, public dialog: MatDialog,
    private locationService: LocationService,
    private dialogRef: MatDialogRef<AddRetrievalNoteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
  ) {
    
    this.rowData = data.rowData;
    this.viewOnly = data.viewOnly;
    this.notesData = data.notesData;
    dialogRef.disableClose = true;
  }

  ngOnInit(): void {

    this.noteForm = this.fb.group({
      ExpectedInvoiceId: new FormControl(''),
      Note: new FormControl('', [Validators.required])
    });

    this.addInvoiceRetrivalFormNew = this.fb.group({
      RecordStatus: new FormControl(''),
      BillingPeriod: new FormControl(''),
      InvoiceStatus: new FormControl(''),
      DataStatus: new FormControl(''),
      InvoiceRetrievalDate: new FormControl(''),
      DataRetrievalDate: new FormControl(''),
      InvoiceReceived: new FormControl(''),
      InvoiceProcessed: new FormControl(''),
      DataReceived: new FormControl(''),
      DataProcessed: new FormControl(''),
      RequiredFiles: new FormControl(''),
      OptionalFiles: new FormControl(''),
      MultipleRetrievalMethods: new FormControl(''),
      InvoiceSource: new FormControl(''),
      RetrievalMethod: new FormControl(''),
      MissingDate: new FormControl(''),
      Email: new FormControl(''),
      URL: new FormControl(''),
      Username: new FormControl(''),
      Notes: new FormControl(''),
      Customer: new FormControl(''),
      Vendor: new FormControl(''),
      ParentVendor: new FormControl(''),
      Payablevendor: new FormControl(''),
      PayableAccount: new FormControl(''),
      MainAccount: new FormControl(''),
      BillDate: new FormControl(''),
      PaymentDate: new FormControl(''),
      DataSource: new FormControl(''),
      DataRetrievalMethod: new FormControl(''),
      ProcessingMethod: new FormControl(''),
      TemplateType: new FormControl(''),
      DataMissingDate: new FormControl(''),
      DataEmail: new FormControl(''),
      DataURL: new FormControl(''),
      DataUsername: new FormControl(''),
      DataNotes: new FormControl(''),
    });

    this.addInvoiceRetrivalFormNew.disable();

    if(this.viewOnly){
      this.noteForm.disable();
      const data :any = {};
      data['Note'] = this.notesData.Notes;
      this.noteForm.patchValue(data);
    }

    const data2 :any = {};
    data2['ExpectedInvoiceId'] = isValueExist(this.rowData.ExpectedInvoiceId);
    this.noteForm.patchValue(data2);

    this.getInvoiceRetrievalData();
  }

  items = [{
    label: 'Invoice',
    styleClass: 'danger-step'
  },
  {
    label: 'Data',
    styleClass: 'danger-step'
  },
  {
    label: 'Processed',
    styleClass: 'danger-step'
  }];

  get f() {
    return this.noteForm.controls;
  }

  saveNotes() {
    this.isSubmit = true;
    if (this.noteForm.valid) {
      this.noteForm.value.Note = this.noteForm.value.Note.split(/\r?\n/).filter((line: any) => line.trim() !== '').join('\n');
      
      const formData = new FormData();
      formData.append('ExpectedInvoiceId', this.noteForm.value.ExpectedInvoiceId);
      formData.append('Note', this.noteForm.value.Note);

      this.saveButtonDisabled = true;
      this._unsubscribeNotes.next(null);
      this.locationService.saveInvoiceRetrievalNotes(formData).pipe(takeUntil(this._unsubscribeNotes)).subscribe((response) => {
        this.saveButtonDisabled = false;
        if (response.Success) {
          this.errorPopup(response)
          this.dialogRef.close(true);
        } else {
          this.errorPopup(response)
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
      this.dialogRef.close(true);
    });
  }

  getInvoiceRetrievalData() {
    this.disabledViewInvoiceBtn = true;
    this.locationService.getInvoiceRetrievalData(this.rowData.ExpectedInvoiceId).subscribe((data) => {
      this.invoiceRetrievalData = data.Data;
      this.disabledViewInvoiceBtn = false;
      this.showInvoice = this.invoiceRetrievalData.ExpectedInvoiceDocAttached;
      this.disableActions = this.invoiceRetrievalData && this.invoiceRetrievalData.RecordStatus === 'Terminated' ? true : false;
      if (this.invoiceRetrievalData) {
        this.items = [{
          label: 'Invoice',
          styleClass: this.invoiceRetrievalData && this.invoiceRetrievalData.ProgressTrackerInvoice == true ? 'success-step' : 'danger-step'
        },
        {
          label: 'Data',
          styleClass: this.invoiceRetrievalData && this.invoiceRetrievalData.ProgressTrackerData == true ? 'success-step' : 'danger-step'
        },
        {
          label: 'Processed',
          styleClass: this.invoiceRetrievalData && this.invoiceRetrievalData.ProgressTrackerProcessed == true ? 'success-step' : 'danger-step'
        }];
        const data :any = {};
        data['RecordStatus'] = this.invoiceRetrievalData.RecordStatus;
        data['BillingPeriod'] = this.invoiceRetrievalData.BillingPeriod;
        data['InvoiceStatus'] = this.invoiceRetrievalData.ExpectedInvoiceStatusDisplay;
        data['DataStatus'] = this.invoiceRetrievalData.ExpectedInvoiceDataStatusDisplay;
        data['InvoiceRetrievalDate'] = this.createDateFormatter(this.invoiceRetrievalData.InvoiceRetrievalDate);
        data['DataRetrievalDate'] = this.createDateFormatter(this.invoiceRetrievalData.DataRetrievalDate);
        data['InvoiceReceived'] = this.createDateFormatter(this.invoiceRetrievalData.InvoiceReceivedDate);
        data['InvoiceProcessed'] = this.createDateFormatter(this.invoiceRetrievalData.InvoiceProcessedDate);
        data['DataReceived'] = this.createDateFormatter(this.invoiceRetrievalData.DataReceivedDate);
        data['DataProcessed'] = this.createDateFormatter(this.invoiceRetrievalData.DataProcessedDate);
        data['RequiredFiles'] = this.invoiceRetrievalData.RequiredFiles;
        data['OptionalFiles'] = this.invoiceRetrievalData.OptionalFiles;
        data['MultipleRetrievalMethods'] = this.invoiceRetrievalData.MultipleRetrievalMethodsDisplay;
        data['InvoiceSource'] = this.invoiceRetrievalData.InvoiceSource;
        data['RetrievalMethod'] = this.invoiceRetrievalData.InvoiceRetrievalMethod;
        data['MissingDate'] = this.createDateFormatter(this.invoiceRetrievalData.InvoiceMissingDate);
        data['Email'] = this.invoiceRetrievalData.InvRetrievalEmail;
        data['URL'] = this.invoiceRetrievalData.InvRetrievalWebUrl;
        data['Username'] = this.invoiceRetrievalData.InvRetrievalWebLogin;
        data['Notes'] = this.invoiceRetrievalData.InvRetrievalNoteText;
        data['Customer'] = this.invoiceRetrievalData.CustomerAccountName;
        data['Vendor'] = this.invoiceRetrievalData.VendorAccountName;
        data['ParentVendor'] = this.invoiceRetrievalData.ParentVendorAccountName;
        data['VBA'] = this.invoiceRetrievalData.PayableVendorAccountName;
        data['PayableAccount'] = this.invoiceRetrievalData.PayableAccountNumber;
        data['BillDate'] = this.createDateFormatter(this.invoiceRetrievalData.InvoiceBillDate);
        data['MainAccount'] = this.invoiceRetrievalData.MainAccountNumber;
        data['PaymentDate'] = this.createDateFormatter(this.invoiceRetrievalData.InvoicePaymentDate);
        data['DataSource'] = this.invoiceRetrievalData.DataRetrievalSource;
        data['DataRetrievalMethod'] = this.invoiceRetrievalData.DataRetrievalMethod;
        data['ProcessingMethod'] = this.invoiceRetrievalData.DataRetrievalProcessingMethodDisplay;
        data['TemplateType'] = this.invoiceRetrievalData.DataRetrievalTemplateTypeId;
        data['DataMissingDate'] = this.createDateFormatter(this.invoiceRetrievalData.DataMissingDate);
        data['DataEmail'] = this.invoiceRetrievalData.DataRetrievalEmail;
        data['DataURL'] = this.invoiceRetrievalData.DataRetrievalWebUrl;
        data['DataUsername'] = this.invoiceRetrievalData.DataRetrievalWebLogin;
        data['DataNotes'] = this.invoiceRetrievalData.DataRetrievalNoteText;
        this.addInvoiceRetrivalFormNew.patchValue(data);
      }
    });
  }

  createDateFormatter(getdate: any) {
    if (getdate) {
      let date = new Date(getdate);
      return moment(date).format('MM/DD/YYYY');
    } else {
      return '';
    }
  }
}
