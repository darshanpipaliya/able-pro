import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LocationService } from '../../../location.service';
import { MatDialog } from '@angular/material/dialog';
import { ErrorWarningPopupComponent } from '../../../common-component/error-warning-popup/error-warning-popup.component';
import { rolePermission } from '../../../../../../services/helper';

@Component({
  selector: 'app-edit-retrieval-file-dialog',
  templateUrl: './edit-retrieval-file-dialog.component.html',
  styleUrls: ['./edit-retrieval-file-dialog.component.scss']
})
export class EditRetrievalFileDialogComponent implements OnInit {
  datas;
  getApiData: any;
  getRequiredData : any;
  updateRetrievalForm: FormGroup;
  saveBtnLoader = false;
  superTemUser = false;

  constructor(private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditRetrievalFileDialogComponent>,
    private locationService: LocationService, @Inject(MAT_DIALOG_DATA) data, public dialog: MatDialog) { 
    this.datas = data;
    dialogRef.disableClose = true;
    this.updateRetrievalForm = fb.group({
      VendorReportName: new FormControl(),
      vendorFileName: new FormControl(),
      shortName: new FormControl(),
      description: new FormControl(),
      required: new FormControl(),
    });
  }

  ngOnInit(): void {
    this.getData();
    this.getReqiredData();
    this.superTemUser = rolePermission(['SuperTEMUser']);
    if(this.superTemUser) {
      this.updateRetrievalForm.disable();
    }
  }

  getReqiredData() {
    this.locationService.getDataretrievalFiletyperequiredvalue().subscribe((data) => {
      this.getRequiredData = data.Data.$values;
    });
  }

  getData(){
    this.locationService.getDataretrievalBatemplatesId(this.datas.id).subscribe((data) => {
      this.getApiData = data.Data.DataRetrievalImportTemplate;
      this.setValueInFormControl('VendorReportName', this.getApiData.VendorReportName);
      this.setValueInFormControl('vendorFileName', this.getApiData.VendorFileName);
      this.setValueInFormControl('shortName', this.getApiData.TemFileName);
      this.setValueInFormControl('description', this.getApiData.Description);
      this.setValueInFormControl('required', data.Data.DataRetrievalFileTypeRequiredValueId);
    });
  }

  setValueInFormControl(key, value) {
    this.f[key].setValue(value);
  }

  get f() {
    return this.updateRetrievalForm.controls;
  }

  update(){

    const data = {
      dataRetrievalFileTypeRequiredValueId : this.f.required.value
    }
    this.saveBtnLoader = true;
    this.locationService.dataretrievalBaimporttemplate(this.datas.id, data).subscribe((data) => {
      this.saveBtnLoader = false;

      if (data.Success) {
        let errorData: any = {
          messgeType: "error",
          title: "Attention",
          titleClass: "text-c-blue",
          icon: "fas fa-exclamation-circle",
          iconClass: "text-c-blue f-70",
          message: data.Message //if messges is multiple use array
        }
        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
        dialogRef.afterClosed().subscribe(result => {
          this.dialogRef.close();
        });
      }
      
    });
  }
}
