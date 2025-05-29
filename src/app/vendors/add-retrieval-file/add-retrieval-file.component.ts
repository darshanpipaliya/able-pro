import { Component, Inject, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActionPopupComponent } from 'src/app/common/action-popup/action-popup.component';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { LocationService } from 'src/app/services/location.service';

@Component({
  selector: 'app-add-retrieval-file',
  templateUrl: './add-retrieval-file.component.html',
  styleUrls: ['./add-retrieval-file.component.scss'],
  imports: [
    SharedModule
  ]
})
export class AddRetrievalFileComponent implements OnInit {
  retrievalForm: FormGroup;
  isFormSubmit: boolean = false;
  showColumnHeader: boolean = false;
  disabledColumnExpected: boolean = true;
  vendorAccountId: any;
  showDocValue: any = '';
  existingFilename:any;

  editRowData: any = '';
  statusList = [
    { Id: true, Name: 'Active' },
    { Id: false, Name: 'Inactive' }
  ];

  columnHeadersFlag = [
    { Id: true, Name: 'Yes' },
    { Id: false, Name: 'No' }
  ];

  inZipFlag = [
    { Id: true, Name: 'Yes' },
    { Id: false, Name: 'No' }
  ];

  retrievalMethod = [];
  requiredList = [];
  fileTypeList = [];
  showAstric = false;
  saveBtnDsiabled = false;
  saveBtnText = 'Save';
  fileData: any;
  @Output() onDataFilesSaveEvent: EventEmitter<any> = new EventEmitter<any>();
  popupType;
  columnHeaderAdd = 'Add';
  constructor(private fb: FormBuilder, private locationService: LocationService, @Inject(MAT_DIALOG_DATA) data: any, public dialog: MatDialog,
    public dialogRef: MatDialogRef<AddRetrievalFileComponent>) {

    this.popupType = data.type;
    this.columnHeaderAdd = data.type;

    dialogRef.disableClose = true;
    if (data.vendorData) {
      this.vendorAccountId = data.vendorData.VendorAccountId;
    } else {
      this.editRowData = data.rowData;
      this.vendorAccountId = this.editRowData.data.VendorId;
    }
  }

  ngOnInit(): void {
    this.retrievalForm = this.fb.group({
      vendorReportName: new FormControl('', [Validators.required, Validators.maxLength(50)]),
      vendorFileName: new FormControl('', [Validators.required, Validators.maxLength(50)]),
      shortName: new FormControl('', [Validators.required, Validators.maxLength(50)]),
      requiredValue: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required, Validators.maxLength(200)]),
      fileType: new FormControl('', [Validators.required]),
      inZip: new FormControl(false, [Validators.required]),
      notes: new FormControl('', [Validators.maxLength(500)]),
      status: new FormControl(true, [Validators.required]),
      columnHeadersExpected: new FormControl('', [Validators.required]),
      retrievalMethod: new FormControl('', [Validators.required]),
      documentFile: new FormControl('', [])
    });

    if (this.editRowData) {
      this.getRowData(this.editRowData);
    }
    this.getRequiredDR();
    this.getFileTypeDR();
    this.getdataRetrievalMethods();
    this.f['columnHeadersExpected'].setValue(false);


  }

  get f() {
    return this.retrievalForm.controls;
  }
  setFormValue(key: any, data: any) {
    if (this.f[key]) {
      this.f[key].setValue(data);
    }
  }
  getRowData(rowData: any) {
    this.locationService.dataretrievalVatemplates(rowData.data.DataRetrievalImportTemplateId).subscribe((res: any) => {
      this.existingFilename = res.Data.GeneratedFileName;
      this.fileData = res.Data;
      this.setFormValue('vendorReportName', this.fileData.VendorReportName);
      this.setFormValue('vendorFileName', this.fileData.VendorFileName)
      this.setFormValue('shortName', this.fileData.TemFileName)
      this.setFormValue('requiredValue', this.fileData.DataRetrievalFileTypeRequiredValueId)
      this.setFormValue('description', this.fileData.Description)
      this.setFormValue('inZip', this.fileData.ZipFile)
      this.setFormValue('status', this.fileData.Active)
      this.setFormValue('retrievalMethod', this.fileData.DataRetrievalMethodId)
      this.setFormValue('fileType', this.fileData.DataRetrievalFileTypeId)
      this.setFormValue('columnHeadersExpected', this.fileData.FileName ? true : false);
      this.setFormValue('notes', this.fileData.Notes)

      let findObjType = this.fileTypeList.find((f: any) => f.Id === this.fileData.DataRetrievalFileTypeId);
      this.setFormValue('fileType', findObjType);
      if (this.fileData.FileName) {
        this.onCahngeColumnHeader({ value: this.showColumnHeader }, true);
      }

    });
  }

  uploadData(isUploadFile = 'false') {
    this.isFormSubmit = true;
    if (this.retrievalForm.valid) {
      let dialogRef = this.dialog.open(ActionPopupComponent, { width: '400px', disableClose: true, data: { text: ' Sit tight while we validate your file.' } });

      this.dialogRef.disableClose = true;
      this.retrievalForm.value.notes = this.retrievalForm.value.notes ? this.retrievalForm.value.notes.replace(/\n/g, ' ') : null;

      const formData = new FormData();
      formData.append('vendorId', this.vendorAccountId)
      formData.append('dataRetrievalFileTypeId', this.retrievalForm?.get('fileType')?.value?.Id);
      formData.append('dataRetrievalFileTypeRequiredValueId', this.retrievalForm?.get('requiredValue')?.value);
      formData.append('dataRetrievalMethodId', this.retrievalForm?.get('retrievalMethod')?.value);
      // formData.append('dataRetrievalProcessingMethodId', null);
      formData.append('vendorReportName', this.retrievalForm?.get('vendorReportName')?.value);
      formData.append('vendorFileName', this.retrievalForm?.get('vendorFileName')?.value);
      formData.append('temFileName', this.retrievalForm?.get('shortName')?.value);
      formData.append('description', this.retrievalForm?.get('description')?.value);
      formData.append('notes', this.retrievalForm?.get('notes')?.value == null ? '' : this.retrievalForm?.get('notes')?.value.replace(/\n/g, ' '));
      formData.append('Active', this.retrievalForm?.get('status')?.value);
      formData.append('zipFile', this.retrievalForm?.get('inZip')?.value);
      formData.append('expectedHeaderData', this.retrievalForm?.get('columnHeadersExpected')?.value);
      formData.append('file', this.retrievalForm?.get('documentFile')?.value);

      if (this.popupType == 'Add') {
        this.locationService.saveDataRetrieval(formData).subscribe((res: any) => {
          dialogRef.close();
          this.dialogRef['disableClose'] = false;
          if (res.Success) {
            let errorData: any = {
              messgeType: "error",
              title: "Attention",
              titleClass: "text-c-blue",
              icon: "fas fa-exclamation-circle",
              iconClass: "text-c-blue f-70",
              message: "Successfully saved" //if messges is multiple use array
            }
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
            dialogRef.afterClosed().subscribe(result => {

            });
            this.dialogRef.close();

          } else {
            let errorData: any = {
              message: res.Message,
              title: "Attention",
              titleClass: "text-c-blue",
              icon: "fas fa-exclamation-circle",
              iconClass: "text-c-blue f-70",
              okBtnName: "Go Back",
              textColor: 'black'
            }

            const dialogReff = this.dialog.open(ErrorWarningPopupComponent, {
              width: '700px', disableClose: true, data:
              errorData
             
            });

            dialogReff.afterClosed().subscribe(result => {
              this.dialogRef['disableClose'] = true;
            });
          }
        }, error => {



        });
      } else {
        formData.append('updateFile', !formData.get('file') ? 'false' : isUploadFile);

        let id = this.editRowData.data.DataRetrievalImportTemplateId;
        this.locationService.dataretrievalVaImporttemplate(id, formData).subscribe((res: any) => {
          dialogRef.close();
          this.dialogRef['disableClose'] = false;
          if (res.Success) {
            let errorData: any = {
              messgeType: "error",
              title: "Attention",
              titleClass: "text-c-blue",
              icon: "fas fa-exclamation-circle",
              iconClass: "text-c-blue f-70",
              message: "Successfully saved" //if messges is multiple use array
            }
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
            dialogRef.afterClosed().subscribe(result => {

            });
            this.dialogRef.close();

          } else {
            let errorData: any = {
              message: res.Message,
              title: "Attention",
              titleClass: "text-c-blue",
              icon: "fas fa-exclamation-circle",
              iconClass: "text-c-blue f-70",
              closeBtnName: "Go Back",
              textColor: 'black'
            }

            const dialogReff = this.dialog.open(ErrorWarningPopupComponent, {
              width: '700px', disableClose: true, data:
                errorData
            });

            dialogReff.afterClosed().subscribe(result => {
              this.dialogRef['disableClose'] = true;
            });
          }
        }, error => {



        });
      }

    }
  }

  getRequiredDR() {
    this.locationService.getRequiredDR().subscribe((data: any) => {
      this.requiredList = data.Data.$values;
    });
  }

  getFileTypeDR() {
    this.locationService.getFileTypeDR().subscribe((data: any) => {
      this.fileTypeList = data.Data.$values;
    });
  }

  downloadBlankTemplate() {
    this.locationService.downloadBlankTemplate().subscribe({
      next: data => {
        if (data) {
          let bolbUrl = URL.createObjectURL(data);
          var link = document.createElement("a");
          link.setAttribute("href", bolbUrl);
          link.setAttribute("download", "Download_blank_template.xlsx");
          link.style.display = "none";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
         
        } else {
        }
      }, error: error => {
      }
    });
  }
  exportTemplate() {
    this.locationService.downloadExistingTemplate(this.editRowData.data.DataRetrievalImportTemplateId).subscribe({
      next: data => {
        if (data) {
          let bolbUrl = URL.createObjectURL(data);
          var link = document.createElement("a");
          link.setAttribute("href", bolbUrl);
          link.setAttribute("download", this.existingFilename);
          link.style.display = "none";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

        }
      }
    })
  }
  getdataRetrievalMethods() {
    this.locationService.getdataRetrievalMethods().subscribe((data: any) => {
      this.retrievalMethod = data.Data.$values;
    });
  }

  onCahngeFileType($event: any) {

    if ($event.FileType == 'csv' || $event.FileType == 'text' || $event.FileType == 'excel') {
      this.disabledColumnExpected = false;
      this.showAstric = true;
    } else {
      this.disabledColumnExpected = true;
      this.showAstric = false;
      this.f['columnHeadersExpected'].setValue(false);
    }

    this.setSaveBtnDisabled($event);
  }

  setSaveBtnDisabled($event: any) {
    if (($event.FileType == 'bdf' || $event.FileType == 'edi' || $event.FileType == 'pdf')) {
      this.saveBtnDsiabled = false;
    } else if (this.f['columnHeadersExpected'].value === false) {
      this.saveBtnDsiabled = false;
    } else {
      this.saveBtnDsiabled = true;
    }
  }

  onCahngeColumnHeader($event: any, firstTime = false) {
    if (this.f['columnHeadersExpected'].value === true) {

      if (!firstTime) {
        this.columnHeaderAdd = 'Add';
      }
      this.saveBtnText = 'Upload & Save';
      this.showColumnHeader = true;
    } else {
      this.columnHeaderAdd = 'Edit';
      this.saveBtnText = 'Save';
      this.showColumnHeader = false;
    }
    this.setSaveBtnDisabled($event);
  }

  browseFile(event: any) {
    this.showDocValue = 'Data Retrieval Import Template.xlsx';
    this.f['documentFile'].patchValue(event.target.files[0]);
  }

}
