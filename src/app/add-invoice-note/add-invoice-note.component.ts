import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import moment from 'moment';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { LocationService } from '../services/location.service';
import { FinanceInvoicesService } from '../services/finance-invoices.service';
import { isValueExist } from '../services/helper';
import { ErrorWarningPopupComponent } from '../common/error-warning-popup/error-warning-popup.component';
import { SharedModule } from '../demo/shared/shared.module';
import { PrimgModule } from '../demo/shared/primeng.module';
import { SpaceTrimStartEndInputirective } from '../custom-directives/custom-validation.directive';

@Component({
  selector: 'app-add-invoice-note',
  templateUrl: './add-invoice-note.component.html',
  styleUrls: ['./add-invoice-note.component.scss'],
  imports: [SharedModule, PrimgModule, SpaceTrimStartEndInputirective]
})
export class AddInvoiceNoteComponent implements OnInit {

  invoiceNotesForm: FormGroup;
  isSubmit: boolean = false;
  hasSsuperTemUsers: boolean = false;
  saveButtonDisabled = false;
  saveButtonDisabledOther = false;
  dialogData: any;
  invoiceOvervewData: any;

  private _unsubscribeInventory: Subject<any> = new Subject<any>();

  tagList: any = [
    { 'label': 'Audit', 'value': 'Audit', 'checked': false },
    { 'label': 'Variance', 'value': 'Variance', 'checked': false },
    { 'label': 'Late Fees', 'value': 'Late Fees', 'checked': false },
    { 'label': 'Past Due', 'value': 'Past Due', 'checked': false },
    { 'label': 'Rerate Notices', 'value': 'Rerate Notices', 'checked': false },
    { 'label': 'Non-recurring Charges', 'value': 'Non-Charges', 'checked': false },
    { 'label': 'Contract Expiration', 'value': 'Contract Expiration', 'checked': false },
    { 'label': 'Other', 'value': 'Other', 'checked': false }
  ];

  constructor(public dialog: MatDialog, @Inject(MAT_DIALOG_DATA) data: any, private _formBuilder: FormBuilder,
    private _LocationService: LocationService,
    private financeInvoicesService: FinanceInvoicesService,
    private dialogRef: MatDialogRef<AddInvoiceNoteComponent>) {
    this.dialogData = data.data.gridrowData;
    this.invoiceOvervewData = data.data.invoiceOvervewData;
    dialogRef.disableClose = true;
    if (this.invoiceOvervewData) {
      this.invoiceOvervewData.InvoiceBillDate = this.invoiceOvervewData.InvoiceBillDate ? moment(this.invoiceOvervewData.InvoiceBillDate).format('MM/DD/YYYY') : '';
      this.invoiceOvervewData.InvoicePayByDate = this.invoiceOvervewData.InvoicePayByDate ? moment(this.invoiceOvervewData.InvoicePayByDate).format('MM/DD/YYYY') : '';
      this.invoiceOvervewData.InvoiceStartDate = this.invoiceOvervewData.InvoiceStartDate ? moment(this.invoiceOvervewData.InvoiceStartDate).format('MM/DD/YYYY') : '';
    }

  }

  ngOnInit(): void {
    this.hasSsuperTemUsers = this._LocationService.isUserHasSuperTEMUsersRole();
    this.setInvoiceNotesForm();

    const data: any = {};
    data['InvoiceId'] = isValueExist(this.dialogData.InvoiceId);
    this.invoiceNotesForm.patchValue(data);
  }

  setInvoiceNotesForm() {
    this.invoiceNotesForm = this._formBuilder.group({
      InvoiceId: new FormControl('', [Validators.required]),
      Note: new FormControl('', [Validators.required, Validators.maxLength(1000)]),
      PrivateNote: new FormControl(false),
      TicketNumber: new FormControl('', Validators.maxLength(100)),
      Tags: this._formBuilder.array([])
    });
  }

  get f() {
    return this.invoiceNotesForm.controls;
  }

  saveInvoiceNotes() {
    this.isSubmit = true;
  }

  onUpdateTagsArray(option: any, isChecked: any, key: any) {
    const chkArray = <FormArray>this.invoiceNotesForm.get(key);
    if (isChecked) {
      option.checked = true;
      chkArray.push(new FormControl(option.value));
    } else {
      option.checked = false;
      let index = chkArray.controls.findIndex(x => x.value == option.value);
      chkArray.removeAt(index);
    }
  }

  unCheckAll() {
    this.tagList.forEach((item: any) => item.checked = false);
  }

  saveNotes() {
    this.isSubmit = true;
    if (this.invoiceNotesForm.valid) {

      // this.invoiceNotesForm.value.Note = this.invoiceNotesForm.value.Note.split(/\r?\n/).filter(line => line.trim() !== '').join('\n');
      this.invoiceNotesForm.value.Note = this.invoiceNotesForm.value.Note ? this.invoiceNotesForm.value.Note.replace(/\n/g, ' ') : null;

      const roles: any = [];

      if (this.invoiceNotesForm.controls['Tags'].value && this.invoiceNotesForm.controls['Tags'].value.length > 0) {
        this.invoiceNotesForm.controls['Tags'].value.forEach((element: any) => {
          roles.push(element);
        });
      }
      const formData = new FormData();

      formData.append('InvoiceId', this.invoiceNotesForm.value.InvoiceId);
      formData.append('Note', this.invoiceNotesForm.value.Note);
      formData.append('PrivateNote', this.invoiceNotesForm.value.PrivateNote);
      formData.append('Active', 'true');
      formData.append('TicketNumber', this.invoiceNotesForm.value.TicketNumber ? this.invoiceNotesForm.value.TicketNumber : '');
      formData.append('Tags', this.invoiceNotesForm.value.Tags ? this.invoiceNotesForm.value.Tags.join(",") : '');

      this.saveButtonDisabled = true;

      this._unsubscribeInventory.next(true);
      this.financeInvoicesService.saveInvoiceNotes(formData).pipe(takeUntil(this._unsubscribeInventory)).subscribe((response: any) => {
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

  ngOnDestroy(): void {
    this._unsubscribeInventory.next(true);
    this._unsubscribeInventory.complete();
  }

  saveAndAddOther() {
    this.isSubmit = true;
    if (this.invoiceNotesForm.valid) {

      this.invoiceNotesForm.value.Note = this.invoiceNotesForm.value.Note.split(/\r?\n/).filter((line: any) => line.trim() !== '').join('\n');

      let roles: any = [];

      if (this.invoiceNotesForm.controls['Tags'].value && this.invoiceNotesForm.controls['Tags'].value.length > 0) {
        this.invoiceNotesForm.controls['Tags'].value.forEach((element: any) => {
          roles.push(element);
        });
      }
      const formData = new FormData();

      formData.append('InvoiceId', this.invoiceNotesForm.value.InvoiceId);
      formData.append('Note', this.invoiceNotesForm.value.Note);
      formData.append('PrivateNote', this.invoiceNotesForm.value.PrivateNote);
      formData.append('Active', 'true');
      formData.append('TicketNumber', this.invoiceNotesForm.value.TicketNumber ? this.invoiceNotesForm.value.TicketNumber : '');
      formData.append('Tags', this.invoiceNotesForm.value.Tags ? this.invoiceNotesForm.value.Tags.join(",") : '');

      this.saveButtonDisabledOther = true;

      this._unsubscribeInventory.next(true);
      this.financeInvoicesService.saveInvoiceNotes(formData).pipe(takeUntil(this._unsubscribeInventory)).subscribe((response: any) => {
        this.saveButtonDisabledOther = false;
        if (response.Success) {
          this.isSubmit = false;
          this.ngOnInit();
          this.errorPopup(response);
          setTimeout(() => {
            this.f['Note'].patchValue('');
            this.f['TicketNumber'].patchValue('');
            this.f['PrivateNote'].patchValue(false);
            (this.invoiceNotesForm.controls['Tags'] as FormArray).clear();
            this.unCheckAll();

          }, 1000);
        } else {
          this.errorPopup(response);
        }
      }, error => {
        this.saveButtonDisabledOther = false;
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

  close() {
    this.dialogRef.close(true);
  }

}