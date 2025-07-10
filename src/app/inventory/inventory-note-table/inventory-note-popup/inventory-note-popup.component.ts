import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { WirelineService } from 'src/app/services/wireline.service';
import { isValueExist, isValuesUndefined } from 'src/app/services/helper';
import { FileUploadPopupComponent } from 'src/app/common/file-upload-popup/file-upload-popup.component';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SpaceTrimStartEndInputirective } from 'src/app/custom-directives/custom-validation.directive';

@Component({
  selector: 'app-inventory-note-popup',
  templateUrl: './inventory-note-popup.component.html',
  styleUrls: ['./inventory-note-popup.component.scss'],
  imports: [SharedModule, PrimgModule, SpaceTrimStartEndInputirective],
  providers: [WirelineService]
})
export class InventoryNotePopupComponent implements OnInit {
  selectedFileName = '';
  dialogData: any;
  isSubmit: boolean = false;
  addInventoryNote: any;
  addInventoryForm: any;
  private _unsubscribeInventory: Subject<any> = new Subject<any>();
  saveButtonDisabled = false;
  uploadedFile: any;
  parentServiceID: any;

  constructor(public dialog: MatDialog, @Inject(MAT_DIALOG_DATA) data: any, private _formBuilder: FormBuilder,
    private wirelineService: WirelineService,
    private dialogRef: MatDialogRef<InventoryNotePopupComponent>) {
    this.dialogData = data.rowData;
    this.parentServiceID = data.parentServiceID;
    dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    this.setInventoryNoteForm();
    if (this.dialogData) {
      this.setFormValue();
    }
  }

  setInventoryNoteForm() {
    this.addInventoryForm = this._formBuilder.group({
      inventoryId: new FormControl('', [Validators.required]),
      noteText: new FormControl('', [Validators.required, Validators.maxLength(1000)]),
      customerId: new FormControl('', [Validators.required]),
      privateNote: new FormControl(false, [Validators.required]),
      active: new FormControl(true, [Validators.required]),
      serviceNumber: new FormControl(''),
      vendorProductName: new FormControl(''),
      vendorProductDescription: new FormControl(''),
      serviceName: new FormControl(''),
      serviceType: new FormControl(''),
      productName: new FormControl(''),
      productType: new FormControl(''),
      chargeCodeDisplayName: new FormControl(''),
      chargeTypeName: new FormControl(''),
      chargeCodeOccurance: new FormControl(''),
      status: new FormControl(''),
      chargeCodeTypeName: new FormControl(''),
      parentServiceNumber: new FormControl(''),
    });
  }

  setFormValue() {
    this.setValueInFormControl('serviceNumber', isValueExist(this.dialogData.ServiceNumber));
    this.setValueInFormControl('status', isValueExist(this.dialogData.InventoryStatusDisplayText));
    this.setValueInFormControl('parentServiceNumber', isValueExist(this.parentServiceID));
    this.setValueInFormControl('vendorProductName', isValueExist(this.dialogData.VendorProductTypeName));
    this.setValueInFormControl('serviceName', isValueExist(this.dialogData.Service));
    this.setValueInFormControl('serviceType', isValueExist(this.dialogData.ServiceType))
    this.setValueInFormControl('productName', isValueExist(this.dialogData.Product))
    this.setValueInFormControl('productType', isValueExist(this.dialogData.ProductType))
    this.setValueInFormControl('chargeCodeDisplayName', isValueExist(this.dialogData.ChargeCodeDisplayName))
    this.setValueInFormControl('customerId', isValueExist(this.dialogData.CustomerAccountId))
    this.setValueInFormControl('inventoryId', isValueExist(this.dialogData.InventoryId))
    this.setValueInFormControl('vendorProductDescription', isValueExist(this.dialogData.Description))

  }

  setValueInFormControl(key: any, value: any) {
    this.f[key].setValue(value);
  }

  get f() {
    return this.addInventoryForm.controls;
  }

  openFileUpload() {
    const dialogRef = this.dialog.open(FileUploadPopupComponent, {
      panelClass: 'width-665'
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (!isValuesUndefined(result)) {
        this.selectedFileName = result[0].name;
        this.uploadedFile = result[0];
      } else {
        this.selectedFileName = 'File not selected';
      }

    });
  }

  saveInventory() {
    this.isSubmit = true;
    if (this.addInventoryForm.valid) {
 
      // this.addInventoryForm.value.noteText = this.addInventoryForm.value.noteText.split(/\r?\n/).filter(line => line.trim() !== '').join('\n');
      // Custome validation for blank space - Mihir
      this.addInventoryForm.value.noteText = this.addInventoryForm.value.noteText.replace(/\n/g, ' ');
      const formData = new FormData();
      if (this.selectedFileName) {
        formData.append('FileAttachment', this.uploadedFile);
      }
      formData.append('InventoryId', this.addInventoryForm.value.inventoryId);
      formData.append('NoteText', this.addInventoryForm.value.noteText);
      formData.append('CustomerId', this.addInventoryForm.value.customerId);
      formData.append('PrivateNote', this.addInventoryForm.value.privateNote);
      formData.append('Active', this.addInventoryForm.value.active);
      formData.append('VendorProductInventoryId', this.dialogData.VendorProductInventoryId);

      this.saveButtonDisabled = true;

      this._unsubscribeInventory.next(null);
      this.wirelineService.addInventoryNote(formData).pipe(takeUntil(this._unsubscribeInventory)).subscribe((response) => {
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
    });
  }

  ngOnDestroy() {
    this._unsubscribeInventory.next(null);
    this._unsubscribeInventory.complete();

  }
 }
