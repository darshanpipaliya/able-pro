import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FileUpload } from 'primeng/fileupload';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { LocationService } from 'src/app/services/location.service';
interface UploadEvent {
  originalEvent: Event;
  files: File[];
}

@Component({
  selector: 'app-upload-invoice-dialog',
  templateUrl: './upload-invoice-dialog.component.html',
  styleUrls: ['./upload-invoice-dialog.component.scss'],
  imports: [SharedModule, PrimgModule]
})
export class UploadInvoiceDialogComponent implements OnInit {
  close = false;
  selectedFiles: File[] = [];
  fileName: any = '';
  @ViewChild('uploader') uploader: FileUpload;
  
  showDocValue: any = '';
  expectedInvoiceID: any;
  saveButtonDisabled = false;
  constructor(private locationService: LocationService, @Inject(MAT_DIALOG_DATA) data: any, public dialog: MatDialog,public dialogRef: MatDialogRef<UploadInvoiceDialogComponent>,) {
    this.expectedInvoiceID = data.expectedInvoiceID;
    this.fileName = data.fileName;
    dialogRef.disableClose = true;
  }

  ngOnInit(): void {

  }

  onUpload(event: UploadEvent) {
    // this.selectedFiles = [];
    // for (let i = 0; i < event.files.length; i++) {
    //   const file = event.files[i];
    //   const fileNameWithoutExtension = file.name.split('.').slice(0, -1).join('.');
    //   if (fileNameWithoutExtension !== this.fileName) {
    //     this.onRemove();
    //     this.uploader.clear();
    //     let errorData: any = {
    //       messgeType: "error",
    //       title: "Attention",
    //       titleClass: "text-c-blue",
    //       icon: "fas fa-exclamation-circle",
    //       iconClass: "text-c-blue f-70",
    //       message: 'The file name is incorrect' //if messges is multiple use array
    //     }
    //     const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
    //       dialogRef.afterClosed().subscribe(result => { });
      
    //   } else {
      for (let i = 0; i < event.files.length; i++) {
        this.selectedFiles.push(event.files[i]);
      }
      // }

      // }
  }
  
  onRemove() {
    this.selectedFiles = [];
  }

  uploadInvoice() {

      this.saveButtonDisabled = true;
      const formData = new FormData();
      this.selectedFiles.forEach((f) => formData.append('file', f));
      this.locationService.uploadInvoiceAttachment(this.expectedInvoiceID, formData).subscribe((res: any) => {
        if (res.Success) {
          this.saveButtonDisabled = false;
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
            this.dialogRef.close(true);
          });
        } else {
          this.saveButtonDisabled = false;
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
            this.dialogRef.close(false);
          });
        }
      }, error => {
        this.saveButtonDisabled = false;
      });
    
  }

}
