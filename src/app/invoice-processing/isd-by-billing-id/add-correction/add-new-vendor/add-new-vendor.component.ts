import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { AngularDualListBoxModule, DualListComponent } from 'angular-dual-listbox';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { SpaceTrimStartEndInputirective } from 'src/app/custom-directives/custom-validation.directive';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { LocationService } from 'src/app/services/location.service';


@Component({
  selector: 'app-add-new-vendor',
  templateUrl: './add-new-vendor.component.html',
  styleUrls: ['./add-new-vendor.component.scss'],
  imports: [SharedModule, PrimgModule, SpaceTrimStartEndInputirective, NgbTooltipModule,AngularDualListBoxModule]
})
export class AddNewVendorComponent implements OnInit {
  addVendorForm: FormGroup;
  parentVendorsList:any = [];
  loadingParentVendorsList = false;
  private _unsubscribeParentVendor: Subject<any> = new Subject<any>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  Industries: any = [];
  source: any = [];
  confirmed: any = [];
  key: string;
  display: any;
  logoImage: any;
  days:any = [];
  isVendorFormSubmit: any = false;
  saveButtonLoadder = false;
  keepSorted = true;
  filter = false;
  disabled = false;
  format: any = DualListComponent.DEFAULT_FORMAT;

  constructor(private fb: FormBuilder, public dialog: MatDialog, private locationService: LocationService,
    private dialogRef: MatDialogRef<AddNewVendorComponent>) {  this.addVendorForm = fb.group({
    AccountName: new FormControl('', [Validators.required]),
    WebAddress: new FormControl('', []),
    Active: new FormControl(true, []),
    InvoiceReceiveDaysOption: new FormControl('', [Validators.required]),
    InvoiceMissingDaysOption: new FormControl('', [Validators.required]),
    PayByDaysOption: new FormControl('', [Validators.required]),
    AccountLogoImage: new FormControl(''),
    ParentId: new FormControl(''),
  })}

  ngOnInit(): void {
    this.getParentVendorList();
    for (let i = 1; i <= 31; i++) {
      this.days.push({ Id: i, value: i, stringValue: i.toString() });
    }
    this._unsubscribeAll.next(true);
    this.locationService.getIndustries()
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe((data) => {
      this.Industries = data.Data.$values;
      this.source = this.Industries;
      this.key = 'Id';
      this.display = 'Name';
    });
  }

  get f() : any{
    return this.addVendorForm.controls;
  }
  saveVendor() {
    this.isVendorFormSubmit = true;
    if (this.addVendorForm.valid) {
      this.saveButtonLoadder = true;
      const formData = new FormData();
      formData.append('AccountName', this.addVendorForm.get('AccountName')?.value);
      formData.append('Active', "true");
      formData.append('WebAddress', this.addVendorForm.get('WebAddress')?.value);
      formData.append('InvoiceReceiveDaysOption', this.addVendorForm.get('InvoiceReceiveDaysOption')?.value);
      formData.append('InvoiceMissingDaysOption', this.addVendorForm.get('InvoiceMissingDaysOption')?.value);
      formData.append('PayByDaysOption', this.addVendorForm.get('PayByDaysOption')?.value);
      formData.append('AccountLogoImage', this.addVendorForm.get('AccountLogoImage')?.value);
      formData.append('ParentId', this.addVendorForm.get('ParentId')?.value);
      this.confirmed.forEach((element: any) => {
        formData.append('IndustryIds', element.Id);
      });
      this.locationService.addVendor(formData).subscribe({
        next: data => {
          this.saveButtonLoadder = false;
          let errorData: any = {
            messgeType: "error",
            title: "Attention",
            titleClass: "text-c-blue",
            icon: "fas fa-exclamation-circle",
            iconClass: "text-c-blue f-70",
            message: "Successfully saved" //if messges is multiple use array
          }
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {panelClass: 'error-warning', data: errorData });
          dialogRef.afterClosed().subscribe(result => {
            this.dialogRef.close();
          });
        },
        error: error => {
          this.saveButtonLoadder = false;
          let errorMessage: any = '';
          if (error.status === 400) {
            if(error.error.errors){
              errorMessage = error.error.errors.AccountName;
            }else{
              errorMessage = error.error ? error.error : 'Bad request';
            }
            let errorData: any = {
              messgeType: "error",
              title: "Attention",
              titleClass: "text-c-blue",
              icon: "fas fa-exclamation-circle",
              iconClass: "text-c-blue f-70",
              message: errorMessage //if messges is multiple use array
            }
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning',data: errorData });
          }
        }
      });
    }
  }

  onFileUploaded(event: any) {
    if (event && event.target.files[0]) {
      var reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = (_event) => {
        this.logoImage = reader.result;
      }
      this.f.AccountLogoImage.patchValue(event.target.files[0]);
    } else {
      this.f.AccountLogoImage.setValue('');
      this.logoImage = null;
    }
  }


  getParentVendorList() {
    this.parentVendorsList = [];
    this.loadingParentVendorsList = true;
    this._unsubscribeParentVendor.next(null);
    this.locationService
      .getVendorDropdown(true)
      .pipe(takeUntil(this._unsubscribeParentVendor))
      .subscribe({
        next: (data) => {
          if (data && data.Data.$values) {
            this.parentVendorsList = data.Data.$values;
            this.loadingParentVendorsList = false;
          } else {
            this.parentVendorsList = [];
            this.loadingParentVendorsList = false;
          }
        },
        error: (error) => {
          this.parentVendorsList = [];
          this.loadingParentVendorsList = false;
        },
      });
  }

}
