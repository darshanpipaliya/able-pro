import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { RetrievalService } from 'src/app/services/retrieval.service';
import { LocationService } from 'src/app/services/location.service';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';

interface UploadEvent {
  originalEvent: Event;
  files: File[];
}

@Component({
  selector: 'app-last-month-data-yes',
  templateUrl: './last-month-data-yes.component.html',
  styleUrls: ['./last-month-data-yes.component.scss'],
  imports: [SharedModule, PrimgModule]
})
export class LastMonthDataYesComponent implements OnInit {

  data: any;
  showDocValue: any = '';
  retrievalForm: FormGroup;
  disableSubmit = false;
  disableDownload = false;
  downloadBlankTemplateExport = false;
  selectedFiles: File[] = [];

  constructor(
    public retrievalService: RetrievalService,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) data: any, 
    private locationService: LocationService,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<LastMonthDataYesComponent>) {
    this.data = data;
    dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    this.retrievalForm = this.fb.group({
      documentFile: new FormControl(null)
    });
  }

  get f() {
    return this.retrievalForm.controls;
  }

  browseFile(event: any){
    // const data = this.retrievalForm.value;
    // const formData = new FormData();
    // formData.append('file', data.documentFile);
    this.showDocValue = 'Data Retrieval Import Template.xlsx';//event.target.files[0].name;
    this.f['documentFile'].patchValue(event.target.files[0]);
  }

  uploadData() {
    this.disableSubmit = true;
    const formData = new FormData();
    this.selectedFiles.forEach((f) => formData.append('FileDetails', f));

    formData.append('ExpctedInvoiceId', this.data.data);
  
    this.retrievalService.invoiceAndDataRetrievalUpload(formData).subscribe((res) => {
      this.disableSubmit = false;
      let errorData: any = {
        messgeType: "error",
        title: "Attention",
        titleClass: "text-c-blue",
        icon: "fas fa-exclamation-circle",
        iconClass: "text-c-blue f-70",
        message: res.Message
      }
      if(res.Data?.NotAcceptedFiles?.$values.length > 0) {
        errorData['list'] = res.Data?.NotAcceptedFiles?.$values,
        errorData['fromTab'] = 'uploadfile'
      }
      const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {panelClass: 'error-warning', data: errorData });
      dialogRef.afterClosed().subscribe(result => {
        if(res.Success) {
          this.dialogRef.close();
          this.data.parentDialogRef.close();
        }
      });

    });

  }

  onUpload(event: UploadEvent) {
    for (let i = 0; i < event.files.length; i++) {
        this.selectedFiles.push(event.files[i]);
      }
  }

  onRemove(event: any) {
    this.selectedFiles = [];
  }


  downloadBlankTemplate() {
    let paramsData = {
      isForHeader : false
    }
   
    this.downloadBlankTemplateExport = true;
    this.locationService.downloadBlankTemplate(paramsData).subscribe({
      next: data => {
        if (data) {
          this.downloadBlankTemplateExport = false;
          let bolbUrl = URL.createObjectURL(data);
          var link = document.createElement("a");
          link.setAttribute("href", bolbUrl);
          link.setAttribute("download", `InvoiceImportTemplate.xlsx`);
          link.style.display = "none";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          this.downloadBlankTemplateExport = false;
        }
      }, error: error => {
        this.downloadBlankTemplateExport = false;
      }
    });
  }
  download() {
    this.disableDownload = true;
      this.locationService.DownloadFilesNewAPI(this.data.PreviousInvoiceId).subscribe({
      next: data => {
        
        if(data?.Message) {
          this.disableDownload = false;
          let errorData: any = {
            messgeType: "error",
            title: "Attention",
            titleClass: "text-c-blue",
            icon: "fas fa-exclamation-circle",
            iconClass: "text-c-blue f-70",
            message: data.Message
          }
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
          dialogRef.afterClosed().subscribe(result => {
          });
        } else {
          let bolbUrl = URL.createObjectURL(data);
          var link = document.createElement("a");
          link.setAttribute("href", bolbUrl);
          link.setAttribute("download", "InvoiceImportTemplate.xlsx");
          link.style.display = "none";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          this.disableDownload = false;
        }
      },
      error: error => {
        this.disableDownload = false;
        let errorData: any = {
          messgeType: "error",
          title: "Attention",
          titleClass: "text-c-blue",
          icon: "fas fa-exclamation-circle",
          iconClass: "text-c-blue f-70",
          message: error
        }
        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
        dialogRef.afterClosed().subscribe(result => {
        });
        
      }
    });
  }
}
