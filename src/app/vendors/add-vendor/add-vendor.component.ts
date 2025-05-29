import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DualListComponent } from 'angular-dual-listbox';
import { LocationService } from 'src/app/services/location.service';
import { rolePermission } from 'src/app/services/helper';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { InvoiceDataRetrivalComponent } from '../invoice-data-retrival/invoice-data-retrival.component';
@Component({
  selector: 'app-add-vendor',
  templateUrl: './add-vendor.component.html',
  styleUrls: ['./add-vendor.component.scss'],
  imports: [
    SharedModule,
    InvoiceDataRetrivalComponent
  ]
})
export class AddVendorComponent implements OnInit, OnDestroy {
  addVendorForm: FormGroup;
  isVendorFormSubmit: any = false;
  selected: any = 0;
  @Input() vendorData: any;
  @Output() onVendorComponentDestroy: EventEmitter<any> = new EventEmitter<any>();
  @Output() onVendorAddEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() currentOpenEditPage: EventEmitter<any> = new EventEmitter<any>()
  logoImage: string | ArrayBuffer | any;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  private _unsubscribeParentVendor: Subject<any> = new Subject<any>();
  format: any = DualListComponent.DEFAULT_FORMAT;
  keepSorted = true;
  key: string;
  display: any;
  filter = false;
  source: any = [];
  confirmed: any = [];
  disabled = false;
  Industries: any = [];
  saveButtonLoadder = false;
  viewNEdit = false;
  days:any = [];
  parentVendorsList:any = [];
  loadingParentVendorsList = false;
  setDisabled: boolean = false;
  vendorDataPass: any;
  @Output() openEditTab: EventEmitter<any> = new EventEmitter<any>()
  constructor(private fb: FormBuilder,
    public dialog: MatDialog,
    private locationService: LocationService) {
    this.addVendorForm = fb.group({
      AccountName: new FormControl('', [Validators.required]),
      WebAddress: new FormControl('', []),
      Active: new FormControl(true, []),
      AccountLogoImage: new FormControl(''),
      ParentId: new FormControl(''),
      KeepForProduction: new FormControl(false),

    })
  }

  ngOnInit(): void {
    this.currentOpenEditPage.emit(false);
    this.getParentVendorList();
    for (let i = 1; i <= 31; i++) {
      this.days.push({ Id: i, value: i, stringValue: i.toString() });
    }
    this.viewNEdit =  rolePermission(['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser', 'SuperTEM', 'TEMAdmin','TEMUser','TEMManager']);
    if (this.vendorData) {
      this.addVendorForm.patchValue(this.vendorData);
      this.onFileUploaded({ target: { files: [this.vendorData.AccountLogoImage] } });
      this.confirmed = this.vendorData.confirmed;
    }
    this.locationService.getIndustries()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((data) => {
        this.Industries = data.Data.$values;
        this.source = this.Industries;
        this.key = 'Id';
        this.display = 'Name';
      });


      if(!this.vendorData) {
        this.setDisabled = true;
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

  get f() {
    return this.addVendorForm.controls;
  }

  onFileUploadedRemove() {
    this.f['AccountLogoImage'].setValue('');
    this.logoImage = null;

    const fileInput = document.querySelector('.file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = ''; // Clear the selected file
    }
  }
  getFileExtension(filename: string): string {
    const match = filename.match(/\.([0-9a-z]+)(?:[\?#]|$)/i);
    return match ? match[1] : '';
  }

  onFileUploaded(event: any) {
    const fileFormates = ['jpg', 'png', 'gif', 'jpeg', 'bmp', 'tiff'];
    let isValid;

    if (event && event.target.files[0]) {
      // const extension = event.target?.files[0].name.split('.')[1];
      const extension = this.getFileExtension(event.target?.files[0].name);

      isValid = fileFormates.includes(extension.toLowerCase());
      if (isValid) {
        var reader = new FileReader();
        reader.readAsDataURL(event.target.files[0]);
        reader.onload = (_event) => {
          this.logoImage = reader.result;
        }
        this.f['AccountLogoImage'].patchValue(event.target.files[0]);
      } else {
        let errorData: any = {
          messgeType: "error",
          title: "Attention",
          titleClass: "text-c-blue",
          icon: "fas fa-exclamation-circle",
          iconClass: "text-c-blue f-70",
          message: 'We support only following file types: JPG, PNG, GIF, JPEG, BMP and TIFF.'
        }
        this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
      }
    } else {
      this.f['AccountLogoImage'].setValue('');
      this.logoImage = null;
    }
  }

  counter(i: number) {
    return new Array(i);
  }

  saveVendor() {
    this.isVendorFormSubmit = true;
    if (this.addVendorForm.valid) {
      this.saveButtonLoadder = true;
      const formData = new FormData();
      formData.append('AccountName', this.addVendorForm.get('AccountName')?.value);
      formData.append('Active', "true");
      formData.append('WebAddress', this.addVendorForm.get('WebAddress')?.value);
      formData.append('KeepForProduction', this.addVendorForm.get('KeepForProduction')?.value);
      formData.append('AccountLogoImage', this.addVendorForm.get('AccountLogoImage')?.value);
      formData.append('ParentId', this.addVendorForm.get('ParentId')?.value);
      this.confirmed.forEach((element: any) => {
        formData.append('IndustryIds', element.Id);
      });
      this.locationService.addVendor(formData).subscribe((data) => {
        this.saveButtonLoadder = false;
        if (data.Success) {
          let errorData: any = {
            messgeType: "error",
            title: "Attention",
            titleClass: "text-c-blue",
            icon: "fas fa-exclamation-circle",
            iconClass: "text-c-blue f-70",
            message: data.Message //if messges is multiple use array
          }
          if (data.Data.VendorAccountId) {
            this.setDisabled = false;
            this.vendorDataPass = data.Data;
          }
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
          dialogRef.afterClosed().subscribe(result => {
            // this.onVendorAddEvent.emit(true);
            this.selected = 1;
            this.openEditTab.emit(data)
          });

        } else {
          let errorData: any = {
            messgeType: "error",
            title: "Attention",
            titleClass: "text-c-blue",
            icon: "fas fa-exclamation-circle",
            iconClass: "text-c-blue f-70",
            message: data.Message //if messges is multiple use array
          }
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
        }
      });
    }
  }
  ngOnDestroy() {
    this.onVendorComponentDestroy.emit({...this.addVendorForm.value, confirmed: this.confirmed});
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }
}
