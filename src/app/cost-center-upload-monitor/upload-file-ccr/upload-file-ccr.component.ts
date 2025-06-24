import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { LocationService } from 'src/app/services/location.service';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
interface UploadEvent {
  originalEvent: Event;
  files: File[];
}
@Component({
  selector: 'app-upload-file-ccr',
  templateUrl: './upload-file-ccr.component.html',
  styleUrls: ['./upload-file-ccr.component.scss'],
  imports: [SharedModule, PrimgModule]
})
export class UploadFileCcrComponent implements OnInit {

  downloadLoader = false;
  upLoader = false;
  loadingCustomer = false;
  submitted = false;
  customerList: any = [];
  selectedFiles: File[] = [];

  private _unsubscribeUpload: Subject<any> = new Subject<any>();
  addCustomerForm: FormGroup;
  constructor(public locationService: LocationService, private fb: FormBuilder, public dialog: MatDialog, public dialogRef: MatDialogRef<UploadFileCcrComponent>) {
    this.addCustomerForm = new FormGroup({
      customerId: new FormControl('', [Validators.required]),
      file: new FormControl(null, Validators.required),
    })
    dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    this.getCustomerList();
  }

  getCustomerList() {

    this.customerList = [];
    this.loadingCustomer = true;
    this.locationService.getCustomerDropDown().pipe().subscribe((data) => {
      if (data && data.$values) {
        this.customerList = data.$values;
        this.loadingCustomer = false;
      } else {
        this.customerList = [];
        this.loadingCustomer = false;
      }
    }, error => {
      this.customerList = [];
      this.loadingCustomer = false;
    });


  }

  downloadBlankTemplete() {
    this.downloadLoader = true;
    this.locationService.getCCblanktemplate().subscribe({
      next: (response: any) => {
        this.downloadLoader = false;

        const blob = response.body as Blob;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'CCRepoImportTemplate.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

      }, error: error => {
        this.downloadLoader = false;
      }
    });
  }

  onUpload(event: UploadEvent) {

    for (let i = 0; i < event.files.length; i++) {
      const file = event.files[i]
      this.selectedFiles.push(event.files[i]);
      this.addCustomerForm.patchValue({ file });
      this.addCustomerForm.get('file')?.updateValueAndValidity();

    }
  }

  onRemove(event: any) {
    
    this.selectedFiles = [];
    this.addCustomerForm.patchValue({ file: null });
    this.addCustomerForm.get('file')?.setValidators([Validators.required]);
    this.addCustomerForm.get('file')?.updateValueAndValidity();

  }

  get f() {
    return this.addCustomerForm.controls;
  }

  uploadInvoice() {

    this.submitted = true;

    if (this.addCustomerForm.valid) {
      this.upLoader = true;
      const formData = new FormData();
      this.selectedFiles.forEach((f) => formData.append('file', f));
      this.locationService.uploadCCFile(this.f['customerId'].value, formData).subscribe((res: any) => {
        if (res.Success) {
          this.upLoader = false;
          let errorData: any = {
            messgeType: "error",
            title: "Attention",
            titleClass: "text-c-blue",
            icon: "fas fa-thumbs-up",
            iconClass: "text-c-blue f-70",
            message: res.Message
          }
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
          dialogRef.afterClosed().subscribe(result => {
            this.dialogRef.close(true);
          });
        } else {
          this.upLoader = false;
          let errorData: any = {
            messgeType: "error",
            title: "Attention",
            titleClass: "text-c-blue",
            icon: "fas fa-exclamation-circle",
            iconClass: "text-c-blue f-70",
            message: res.Message
          }
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
          dialogRef.afterClosed().subscribe(result => {
          });
        }
      });
    }
  }

}