import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SharedModule } from 'src/app/demo/shared/shared.module';
interface UploadEvent {
  originalEvent: Event;
  files: File[];
}
@Component({
  selector: 'app-contract-upload-file',
  templateUrl: './contract-upload-file.component.html',
  styleUrls: ['./contract-upload-file.component.scss'],
  standalone: true,
  imports: [
    SharedModule,
    PrimgModule,
  ]
})
export class ContractUploadFileComponent implements OnInit {
  close = false;
  dialogData: any;
  selectedFile: any;
  isValid: boolean = false;
  fileData: any;

  fileFormates = ['jpeg','gif','png','tiff','pdf','doc','docx','xls','xlsx','txt','ppt','pptx','csv','tif','jpg'];

  constructor(@Inject(MAT_DIALOG_DATA) data: any, public dialog: MatDialog, public dialogRef: MatDialogRef<ContractUploadFileComponent>) {
    this.dialogData = data?.type;
    dialogRef.disableClose = true;
   }

  ngOnInit(): void {
  }
 
  onUpload(event: UploadEvent) {
   this.selectedFile = event.files[0];
   
  }
  onRemove(event: any) {
    this.selectedFile = null;
  }

  getFileExtension(filename: string): string {
    const match = filename.match(/\.([0-9a-z]+)(?:[\?#]|$)/i);
    return match ? match[1] : '';
  }

  uploadAttachment() {
    // const extension = this.selectedFile.name.split('.')[1];
    const extension = this.getFileExtension(this.selectedFile.name);
    this.isValid = this.fileFormates.includes(extension.toLowerCase());
    if(this.isValid){
      this.dialogRef.close(this.selectedFile);
    } else {
      let errorData: any = {
        messgeType: "error",
        title: "Attention",
        titleClass: "text-c-blue",
        icon: "fas fa-exclamation-circle",
        iconClass: "text-c-blue f-70",
        // message: 'This file type is not supported.'
        message: 'The following file types can be attached to a note: JPEG, JPG, PNG, TIF, TIFF, GIF, PDF, PPT, PPTX, DOC, DOCX, XLS, XLSX, CSV, and TXT.'
      }
      this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
    }

    
  }
}
