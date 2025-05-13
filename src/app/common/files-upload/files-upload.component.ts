import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { FileUploadModule, FileUploadValidators } from '@iplab/ngx-file-upload';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { LocationService } from 'src/app/services/location.service';
import { ErrorWarningPopupComponent } from '../error-warning-popup/error-warning-popup.component';

@Component({
  selector: 'app-files-upload',
  templateUrl: './files-upload.component.html',
  styleUrls: ['./files-upload.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    SharedModule,
    PrimgModule,
    FileUploadModule
  ]
})
export class FilesUploadComponent implements OnInit {
  @Input() hideUploadBtn: any;
  @Input() disabled: any;
  @Output() onFileUploaded: EventEmitter<any> = new EventEmitter<any>();
  private filesControl = new FormControl(null, FileUploadValidators.filesLimit(1));
  hideUploadButton: any = false;
  saveButtonLoadder = false;
  public demoForm = new FormGroup({
    files: this.filesControl
  });

  constructor(private locationService: LocationService,
    public dialog: MatDialog,
  ) {
    this.demoForm.get("files")?.valueChanges.subscribe(selectedValue => {
      if (this.hideUploadButton) {
        this.onFileUploaded.next(selectedValue);
      }
    })

  }

  ngOnInit() {
    if (this.hideUploadBtn) {
      this.hideUploadButton = true;
    }
    if (this.disabled && this.disabled === true) {
      this.demoForm.disable();;
    }
  }

  public toggleStatus() {
    this.filesControl.disabled ? this.filesControl.enable() : this.filesControl.disable();
  }

  uploadFiles() {
    if (this.demoForm.valid) {
      const files = this.demoForm.get('files')?.value;
      if (files && files[0]) {

        const file: File = files[0];
        const maxSize = 3000; // Maximum size in pixels
        this.resizeImage(file, maxSize)
          .then((resizedImage) => {
            const formData = new FormData();
            formData.append('file', resizedImage, file.name);
            this.uploadImage(formData);
          })
          .catch((error) => {
            const formData = new FormData();
            formData.append('file', files[0]);
            this.uploadImage(formData);
          });
      } else {
        this.saveButtonLoadder = false;
        let errorData: any = {
          messgeType: "error",
          title: "Attention",
          titleClass: "text-c-blue",
          icon: "fas fa-exclamation-triangle",
          iconClass: "text-c-blue f-70",
          message: 'Please select a file'
        }
        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
        dialogRef.afterClosed().subscribe(result => {
        });
      }
  
    }
  }

  uploadImage(formData: any) {
    this.saveButtonLoadder = true;
    this.locationService.uploadProfileImage(formData).subscribe({
      next: data => {
      this.saveButtonLoadder = false;
        this.onFileUploaded.next(data);
      },
      error: error => {
        this.saveButtonLoadder = false;
        let errorMessage: any = '';
        if (error.status === 400) {
          errorMessage = "Bad request please try again later";
        } else if (error.status === 401) {
          errorMessage = error.error.ErrorMessage;
        } else if (error.status === 500) {
          errorMessage = 'Something went wrong';
        }
        let errorData: any = {
          messgeType: "error",
          title: "Attention",
          titleClass: "text-c-blue",
          icon: "fas fa-exclamation-triangle",
          iconClass: "text-c-blue f-70",
          message: errorMessage //if messges is multiple use array
        }
        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
        dialogRef.afterClosed().subscribe(result => {
        });

      }
    });
  }

  resizeImage(file: File, maxSize: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
  
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
  
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height *= maxSize / width;
            width = maxSize;
          } else {
            width *= maxSize / height;
            height = maxSize;
          }
        }
  
        canvas.width = width;
        canvas.height = height;
  
        const ctx:any = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
  
        canvas.toBlob((blob:any) => {
          resolve(blob);
        }, 'image/jpeg', 8.0);
      };
  
      img.onerror = (error) => {
        reject(error);
      };
  
      img.src = URL.createObjectURL(file);
    });
  }
  
}
