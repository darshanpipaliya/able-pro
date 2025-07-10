import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ContractService } from 'src/app/services/contract.service';
import { ErrorWarningPopupComponent } from '../error-warning-popup/error-warning-popup.component';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SharedModule } from 'src/app/demo/shared/shared.module';

@Component({
  selector: 'app-inventory-selection-dialog-m',
  templateUrl: './inventory-selection-dialog-m.component.html',
  styleUrls: ['./inventory-selection-dialog-m.component.scss'],
  imports: [SharedModule, PrimgModule]
})
export class InventorySelectionDialogMComponent implements OnInit {

  inventoryData: any;
  contractList: any;
  contractForm: FormGroup;
  submitted: boolean = false;
  private _unsubscribeContract: Subject<any> = new Subject<any>();
  private _unsubscribeSaveCont: Subject<any> = new Subject<any>();
  close: false;

  constructor(private contractService: ContractService, @Inject(MAT_DIALOG_DATA) data: any, private fb: FormBuilder, public dialog: MatDialog,
  public matDialogRef: MatDialogRef<InventorySelectionDialogMComponent>) {
    this.inventoryData = data.rowData;
    matDialogRef.disableClose = true;
    this.setFormControl()
  }

  ngOnInit(): void {
    this._unsubscribeContract.next(null);
    this.contractService.loggedUserUrl(this.inventoryData.VendorAccountId).pipe(takeUntil(this._unsubscribeContract)).subscribe((data) => {
      if (data.Success) {
        this.contractList = data.Data.$values;
      }
    });
  }

  setFormControl() {
    this.contractForm = this.fb.group({
      ContractId: new FormControl(null, [Validators.required]),
      vendorProductInventoryId: new FormControl(this.inventoryData.VendorProductInventoryId)
    });
  }

  saveInventory() {
    this.submitted = true;
    if (this.contractForm.valid) {
      this._unsubscribeSaveCont.next(null);
      this.contractService.addProductToContract(this.contractForm.value).pipe(takeUntil(this._unsubscribeSaveCont)).subscribe((data: any) => {
        if (data.Success) {
          this.ErrorWarningPopupOpen(data.Message);
          this.matDialogRef.close(data);
        } else {
          this.ErrorWarningPopupOpen(data.Message);
        }
      })
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
    return
  }
  get f() {
    return this.contractForm.controls;
  }

  get form() {
    return this.contractForm;
  }

  ngOnDestroy() {
    this._unsubscribeContract.next(null);
    this._unsubscribeContract.complete();
    this._unsubscribeSaveCont.next(null);
    this._unsubscribeSaveCont.complete();
  }
}
