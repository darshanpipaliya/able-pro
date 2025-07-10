import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import _ from 'lodash';
import { ActionPopupComponent } from 'src/app/common/action-popup/action-popup.component';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { RetrievalService } from 'src/app/services/retrieval.service';
interface UploadEvent {
  originalEvent: Event;
  files: File[];
}


@Component({
  selector: 'app-uploaddatafiles',
  templateUrl: './uploaddatafiles.component.html',
  styleUrls: ['./uploaddatafiles.component.scss'],
  imports: [SharedModule, PrimgModule]
})
export class UploaddatafilesComponent implements OnInit {
  close = false;

  ExpctedInvoiceId;
  selectedFiles: File[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) data: any,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<UploaddatafilesComponent>,
    public retrievalService: RetrievalService) {
    this.ExpctedInvoiceId = data.expectedInvoiceID;
    dialogRef.disableClose = true;
  }

  ngOnInit(): void {
  }

  onUpload(event: UploadEvent) {
    for (let i = 0; i < event.files.length; i++) {
      this.selectedFiles.push(event.files[i]);
    }
  }

  onRemove(event: any) {
    let index = this.selectedFiles.findIndex((x) => {
      return x.name == event.file.name
    });
    this.selectedFiles.splice(index, 1);
  }

  uploadFile() {
    let dialogRef : any = this.dialog.open(ActionPopupComponent, { width: '400px', disableClose: true, data: { text: ' Sit tight while we validate your file' } });
    (this.dialog as any)['disableClose'] = true;

    const formData = new FormData();
    this.selectedFiles.forEach((f) => formData.append('FileDetails', f));
    formData.append('ExpctedInvoiceId', this.ExpctedInvoiceId);

    this.retrievalService.invoiceAndDataRetrievalUpload(formData).subscribe((res) => {
      dialogRef.close();
      (this.dialog as any)['disableClose'] = false;
      if (res.Success) {
        let errorData: any = {
          messgeType: "error",
          title: "Attention",
          titleClass: "text-c-blue",
          icon: "fas fa-exclamation-circle",
          iconClass: "text-c-blue f-70",
          message: res.Message //if messges is multiple use array
        }

        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
        dialogRef.afterClosed().subscribe(result => {
        });
        this.dialogRef.close();
      } else {

        if(res.Data?.NotAcceptedFiles && res.Data?.NotAcceptedFiles.$values.length > 0) {
            res.Message = 'The system will process the files that pass validation.? Files listed below did not pass validation.  Please ensure you have to correct file and file name.'
            let errorData: any = {
              // message: res.Message,
              message: 'The files listed below did not pass validation. Please ensure you have the correct file and it is named correctly.',
              // innerHtml: true,
              title: "Attention",
              titleClass: "text-c-blue",
              icon: "fas fa-exclamation-circle",
              iconClass: "text-c-blue f-70",
              okBtnName: "Go Back",
              textColor: 'black'
            }
            if (res.Data?.NotAcceptedFiles?.$values.length > 0) {
              errorData['list'] = res.Data?.NotAcceptedFiles?.$values,
              errorData['fromTab'] = 'uploadfile'
            }
            const dialogReff = this.dialog.open(ErrorWarningPopupComponent, {
              width: '700px', disableClose: true, data: errorData
            });

            dialogReff.afterClosed().subscribe(result => {
              (this.dialog as any)['disableClose'] = true;
            });
        } else {
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
            (this.dialog as any)['disableClose'] = true;
          });
         
        }
      }
    });
  }

  tooltip(data: any) {
    return `<span >${data} </span>`;
  }

}
