import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { LocationService } from 'src/app/services/location.service';

@Component({
  selector: 'app-invoice-forecasting-upload',
  templateUrl: './invoice-forecasting-upload.component.html',
  styleUrls: ['./invoice-forecasting-upload.component.scss'],
  imports: [SharedModule, NgbTooltipModule]
})
export class InvoiceForecastingUploadComponent implements OnInit {
  messageData: any;
  addCompanyForm: FormGroup;
  fileUploaded = false;
  apiCalling = false;
  constructor(
    @Inject(MAT_DIALOG_DATA) data: any,
    private locationService: LocationService,
    private fb: FormBuilder,
    public dialog: MatDialog,
  ) {

    this.addCompanyForm = fb.group({
      CompanyLogoImage: new FormControl('', []),
    })
    if (typeof data.message == 'string') {
      data.message = [data.message];
    }
    this.messageData = data;
  }

  ngOnInit(): void {
  }

  uploadDocument() {
    this.apiCalling = true;
    const data = this.addCompanyForm.value;
    const formData = new FormData();
    formData.append('file', data.CompanyLogoImage);
    this.locationService.uploadAttachment(this.messageData.ExpectedInvoiceID,formData).subscribe(res => {
    this.apiCalling = false;
      let errorData: any = {
        messgeType: "error",
        title: "Attention",
        titleClass: "text-c-blue",
        icon: "fas fa-exclamation-circle",
        iconClass: "text-c-blue f-70",
        message: "Successfully saved" //if messges is multiple use array
      }
      this.dialog.open(ErrorWarningPopupComponent, {panelClass: 'error-warning', data: errorData });
      this.dialog.closeAll();
    }, error => {
      this.apiCalling = false;
      let errorData: any = {
        messgeType: "error",
        title: "Attention",
        titleClass: "text-c-blue",
        icon: "fas fa-exclamation-circle",
        iconClass: "text-c-blue f-70",
        message: "Something went wrong"
      }
      this.dialog.open(ErrorWarningPopupComponent, {panelClass: 'error-warning', data: errorData });
    });
  }

  get f() {
    return this.addCompanyForm.controls;
  }
  
  onFileUploaded(event: any) {
    this.fileUploaded = false;

    if (event && event.target.files[0] && event.target.files[0].type === 'application/pdf') {
      var reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = (_event) => {
        // this.logoImage = reader.result;
      }
      this.fileUploaded = true;
      this.f['CompanyLogoImage'].patchValue(event.target.files[0]);
    } else {
      let errorData: any = {
        messgeType: "error",
        title: "Attention",
        titleClass: "text-c-blue",
        icon: "fas fa-exclamation-circle",
        iconClass: "text-c-blue f-70",
        message: "Please select a PDF format "
      }
      this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning',data: errorData });
      this.fileUploaded = false;
      this.f['CompanyLogoImage'].setValue('');
    }
  }

}
