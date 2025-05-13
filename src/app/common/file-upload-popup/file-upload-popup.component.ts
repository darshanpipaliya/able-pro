import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ErrorWarningPopupComponent } from '../error-warning-popup/error-warning-popup.component';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { FilesUploadComponent } from '../files-upload/files-upload.component';

@Component({
  selector: 'app-file-upload-popup',
  templateUrl: './file-upload-popup.component.html',
  styleUrls: ['./file-upload-popup.component.scss'],
  standalone: true,
  imports: [
    SharedModule,
    PrimgModule,
    FilesUploadComponent
  ]
})
export class FileUploadPopupComponent implements OnInit {
  fileData: any;
  close = 'undefined';
  isValid: boolean = false;
  // fileFormates = ['JPEG','PNG','GIF','TIFF','PDF','doc','docx','xls','xlsx','CVS','TXT','ppt','pptx'];
  //PNG CVS removed
  fileFormates = ['jpeg','gif','png','tiff','pdf','doc','docx','xls','xlsx','txt','ppt','pptx','csv','tif','jpg'];
                  
  constructor(public matDialogRef: MatDialogRef<FileUploadPopupComponent>,public dialog: MatDialog) { }

  ngOnInit(): void {
  }
  onFileUploaded(event: any) {
    // const extension = event[0].name.split('.')[1];
    
    const extension = this.getFileExtension(event[0].name);

    this.isValid = this.fileFormates.includes(extension.toLowerCase());
    if(this.isValid){
      this.fileData = event;
    } else {
      this.fileData = [];
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

  chooseFile() {
    if(this.isValid){
      this.matDialogRef.close(this.fileData);
    } else {
      this.matDialogRef.close(null);
    }
  }

  getFileExtension(filename: string): string {
    const match = filename.match(/\.([0-9a-z]+)(?:[\?#]|$)/i);
    return match ? match[1] : '';
  }
}
