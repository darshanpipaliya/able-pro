import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { AngularDualListBoxModule, DualListComponent } from 'angular-dual-listbox';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { rolePermission } from 'src/app/services/helper';
import { LocationService } from 'src/app/services/location.service';
import { InvoiceDataRetrivalComponent } from '../invoice-data-retrival/invoice-data-retrival.component';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
@Component({
  selector: 'app-edit-vendor',
  templateUrl: './edit-vendor.component.html',
  styleUrls: ['./edit-vendor.component.scss'],
  imports: [
    SharedModule,
    PrimgModule,
    InvoiceDataRetrivalComponent,
    AngularDualListBoxModule
  ]
})
export class EditVendorComponent implements OnInit, OnDestroy {
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  private _unsubscribeParentVendor: Subject<any> = new Subject<any>();
  @Input() vendorData: any;
  vendorNewData: any;
  tableDataEmitData: any;
  invoiceretrievalMethodData: any;
  dataSourcesEmitData: any;
  templateTypeEmitData: any;
  retrievalMethodEmitData: any;
  processingMethodEmitData: any;
  @Input() selectedInEditTab: any;
  @Input() parentVendorsListEmitData: any = [];
  @Input() vendorApiDataEmitData: any;
  @Input() sourceEmitData: any = [];
  editVendorForm: FormGroup;
  isVendorFormSubmit: any = false;
  isTemUser: any = false;
  logoImage: any = null;
  format: any = DualListComponent.DEFAULT_FORMAT;
  keepSorted = true;
  key: string;
  display: any;
  filter = false;
  source: any = [];
  confirmed: any = [];
  disabled = false;
  Industries: any = [];
  selected = 0;
  @Output() onVendorEditEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() currentOpenEditPage: EventEmitter<any> = new EventEmitter<any>();
  @Output() recordUpdated: EventEmitter<any> = new EventEmitter<any>();
  @Output() parentVendorsListEmit: EventEmitter<any> = new EventEmitter<any>();
  @Output() vendorApiDataEmit: EventEmitter<any> = new EventEmitter<any>();
  @Output() sourceEmit: EventEmitter<any> = new EventEmitter<any>();

  vendorApiData: any;
  isSuperTEMUsers: boolean = false;
  saveButtonLoadder = false;
  isCompanyUser: boolean = false;
  isVendorUser: boolean = false;
  viewNEdit: boolean = false;
  days: any = [];
  parentVendorsList: any = [];
  loadingParentVendorsList = false;
  temRoles = false;
  constructor(private fb: FormBuilder,
    private locationService: LocationService,
    private sanitizer: DomSanitizer,
    private dialog: MatDialog) {
    this.editVendorForm = fb.group({
      AccountName: new FormControl('', [Validators.required]),
      WebAddress: new FormControl('', []),
      Active: new FormControl(true, []),
      AccountLogoImage: new FormControl(''),
      ParentId: new FormControl(''),
      KeepForProduction: new FormControl(false)
    })
  }
  ngOnInit(): void {
    this.temRoles = rolePermission(['TEMAdmin', 'TEMUser', 'TEMManager']);

    this.currentOpenEditPage.emit(true);
    this.getParentVendorList();
    if (this.selectedInEditTab === 1) {
      this.selected = this.selectedInEditTab;
    }
    for (let i = 1; i <= 31; i++) {
      this.days.push({ Id: i, value: i, stringValue: i.toString() });
    }
    this.viewNEdit = rolePermission(['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEM', 'TEMAdmin', 'TEMUser', 'TEMManager']);
    this.isTemUser = this.locationService.isUserHasTEMUserRole();
    this.isSuperTEMUsers = this.locationService.isUserHasSuperTEMUsersRole();
    this.isCompanyUser = this.locationService.isUserCompanyUser();
    this.isVendorUser = this.locationService.isUserVendor();
    this.getVendorById(this.vendorData.VendorAccountId);
    if (this.isTemUser || this.isCompanyUser || this.isVendorUser || !this.viewNEdit || this.temRoles) {
      this.editVendorForm.disable();
      this.disabled = true;
    }

    this.getIndustries();
    this.vendorPatch()
  }

  getIndustries() {
    if (this.sourceEmitData?.length > 0) {
      this.source = this.sourceEmitData;
      this.key = 'Id';
      this.display = 'Name';
    } else {
      this.locationService.getIndustries()
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((data) => {
          this.source = data.Data.$values;
          this.sourceEmit.emit(this.source)
          this.key = 'Id';
          this.display = 'Name';
        });
    }
  }

  vendorPatch() {
    this.editVendorForm.patchValue({ 'AccountName': this.vendorData.VendorAccountName });

    this.editVendorForm.patchValue({ 'WebAddress': this.vendorData.WebAddress });
  }

  getParentVendorList() {

    if (this.parentVendorsListEmitData?.length) {
      this.parentVendorsList = this.parentVendorsListEmitData
    } else {
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
              this.editVendorForm.patchValue({ 'ParentId': this.vendorData.ParentVendorAccountId });
              this.parentVendorsList.unshift({ $id: '1', Id: null, AccountName: 'None' })
              this.loadingParentVendorsList = false;
              this.parentVendorsListEmit.emit(this.parentVendorsList);
            } else {
              this.parentVendorsList = [];
              this.parentVendorsListEmit.emit([]);

              this.loadingParentVendorsList = false;
            }
          },
          error: (error) => {
            this.parentVendorsList = [];
            this.parentVendorsListEmit.emit([]);
            this.loadingParentVendorsList = false;
          },
        });
    }

  }

  get f() {
    return this.editVendorForm.controls;
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
  getVendorById(id: any) {

    
      this.locationService.geVendorById(id)
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((data) => {
          if (data) {
            this.vendorApiData = data.Data;
            this.vendorApiDataEmit.emit(this.vendorApiData);
            this.setVendorAPIData();
          }
        });
  }

  setVendorAPIData() {
    this.editVendorForm.patchValue(this.vendorApiData);
    this.f['ParentId'].patchValue(this.vendorApiData.ParentVendorAccountId ? this.vendorApiData.ParentVendorAccountId : '');
    if (this.vendorApiData.AccountLogo) {
      const image = this.vendorApiData.AccountLogo;
      let objectURL = 'data:' + this.vendorApiData.LogoContentType + ';base64,' + image;
      this.logoImage = this.sanitizer.bypassSecurityTrustUrl(objectURL);
    }
    let industries: any = []
    if (this.vendorApiData.VendorXIndustriesDto) {
      this.vendorApiData.VendorXIndustriesDto.$values.forEach((element: any) => {
        industries.push(element.Industry);
      });
    }
    this.confirmed = industries;
  }

  updateVendor() {
    this.isVendorFormSubmit = true;
    if (this.editVendorForm.valid) {
      this.saveButtonLoadder = true;
      const formData = new FormData();
      formData.append('AccountName', this.editVendorForm.get('AccountName')?.value);
      formData.append('Active', "true");
      formData.append('KeepForProduction', this.editVendorForm.get('KeepForProduction')?.value);
      if(this.editVendorForm.get('WebAddress')?.value !== null)
           formData.append('WebAddress', this.editVendorForm.get('WebAddress')?.value);
      formData.append('AccountLogoImage', this.editVendorForm.get('AccountLogoImage')?.value);

      if (this.editVendorForm.get('ParentId')?.value !== null)
        formData.append('ParentId', this.editVendorForm.get('ParentId')?.value);
      // }
      this.confirmed.forEach((element: any) => {
        formData.append('IndustryIds', element.Id);
      });
      if (this.editVendorForm.get('AccountLogoImage')?.value == '' && this.logoImage) {
        let setOldLogo: any = this.dataURItoBlob(this.logoImage.changingThisBreaksApplicationSecurity);
        formData.append('AccountLogoImage', setOldLogo, 'chris.' + (this.vendorApiData.LogoContentType).split('/')[1]);
      }
      this.locationService.updateVendor(this.vendorData.VendorAccountId, formData).subscribe((data) => {
        this.saveButtonLoadder = false;
        if (data.Success) {
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
            this.onVendorEditEvent.emit(true);
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
  dataURItoBlob(dataURI: any) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
      byteString = atob(dataURI.split(',')[1]);
    else
      byteString = unescape(dataURI.split(',')[1]);
    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ia], { type: mimeString });
  }


  recordEdited(data: any) {
    this.recordUpdated.emit(data);
  }
  /**
  * On destroy
  */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  vendorDataEmit(data: any) {
    this.vendorNewData = data;
  }
  tableDataEmit(data: any) {
    this.tableDataEmitData = data;
  }
  invoiceretrievalMethodEmit(data: any) {
    this.invoiceretrievalMethodData = data;
  }
  dataSourcesEmit(data: any) {
    this.dataSourcesEmitData = data;
  }
  templateTypeEmit(data: any) {
    this.templateTypeEmitData = data;
  }
  retrievalMethodEmit(data: any) {
    this.retrievalMethodEmitData = data;
  }
  processingMethodEmit(data: any) {
    this.processingMethodEmitData = data;
  }
}
