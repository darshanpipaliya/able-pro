import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
 
import { DomSanitizer } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SpaceTrimStartEndInputirective } from 'src/app/custom-directives/custom-validation.directive';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { LocationService } from 'src/app/services/location.service';
import { isValueExist, isValuesUndefined, rolePermission } from 'src/app/services/helper';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { ChangeLogComponent } from 'src/app/common/change-log/change-log.component';

@Component({
  selector: 'app-edit-company',
  templateUrl: './edit-company.component.html',
  styleUrls: ['./edit-company.component.scss'],
  imports: [PrimgModule, SharedModule, SpaceTrimStartEndInputirective, ChangeLogComponent],
  providers: [LocationService]
})
export class EditCompanyComponent implements OnInit {
  editCompanyForm: FormGroup;
  isCompanyFormSubmit: boolean = false;
  isBillPay: any = false;
  logoImage: any = null;
  customers: any = [];
  apsystems: any = [];
  apsystemexports: any = [];
  setTemDDValue: any;
  editCompanyData: any;
  isUpload: boolean = false;
  structureJobData: any;
  isAPidRequired: boolean = false;
  tableData: any;
  cols: any[];
  @Input() companyData: any;
  @Output() onCompanyUpdateEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() currentOpenEditPage: EventEmitter<any> = new EventEmitter<any>();
  @Output() setTemDDValueEvent: EventEmitter<any> = new EventEmitter<any>();
  private _unsubscribeChangelog: Subject<any> = new Subject<any>();
  changelogData: any;
  logLoader = false;

  isDisabled = false;
  saveButtonLoadder = false;
  viewNEdit = false;
  columns: any[];

  statusList = [
    { Id : true, Name : 'Active'},
    { Id : false, Name : 'Inactive'},
  ]
  yesNoList = [
    { Id : true , Name : 'Yes'},
    { Id : false , Name : 'No'},
  ]


  constructor(
    private locationService: LocationService,
    public dialog: MatDialog,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer
  ) {
    this.editCompanyForm = fb.group({
      AccountId: new FormControl('', [Validators.required]),
      Active: new FormControl('', [Validators.required]),
      CompanyName: new FormControl('', [Validators.required]),
      APSystemId: new FormControl(''),
      Primary: new FormControl(true, [Validators.required]),
      RefNumber: new FormControl('', [Validators.maxLength(10)]),
      APSystemExportTypeId: new FormControl(''),
      CompanyLogoImage: new FormControl('', []),
      Alias: new FormControl('',  [Validators.maxLength(100)]),
      GLRefNumber: new FormControl(''),
      JobRefNumber: new FormControl(''),
      CostAllocationProfile: new FormControl('')
    });

    this.columns = [
      { field: 'TabModuleDisplayName', header: 'Tab' },
      { field: 'TabSectionModuleDisplayName', header: 'Section' },
      { field: 'DisplayColumnName', header: 'Field Name' },
      { field: 'OldValue', header: 'Previous Value' },
      { field: 'NewValue', header: 'New Value' },
      { field: 'ModificationDate', header: 'Time & Date' },
      { field: 'ModifiedBy', header: 'Who' }
    ];
  }

  getCompanyChangelogData() {
    this._unsubscribeChangelog.next(null);
    this.logLoader = true;
    this.locationService.getCompanyChangelogs(this.editCompanyData.Id).pipe(takeUntil(this._unsubscribeChangelog)).subscribe((data: any) => {
      this.logLoader = false;
      if(data.Success) {
        this.changelogData = data.Data.$values;
      } else {
        this.changelogData = [];
      }
    });
  }

  ngOnInit(): void {
    this.currentOpenEditPage.emit(true);

    this.viewNEdit = rolePermission(['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser', 'SuperTEM', 'TEMAdmin','TEMUser','TEMManager']);
    this.getCustomerForUser();
    this.getAPSystems();
    this.getCompanyById(this.companyData.CompanyId);
    this.getGL_Jobref(this.companyData.CustomerAccountId,this.companyData.CompanyId);
    this.getAccountById(this.companyData.CustomerAccountId);
    
    if (!this.viewNEdit) {
      this.editCompanyForm.disable();
      this.isDisabled = true
    }
  }
  onStatusChange(event: any) {
    if (event.value == false) {
      let errorData: any = {
        messgeType: "error",
        title: "Attention",
        titleClass: "text-c-blue",
        icon: "fas fa-exclamation-circle",
        iconClass: "text-c-blue f-70",
        message: 'The associated location or people will become inactive.'
      }
      const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData, disableClose: true });
      dialogRef.afterClosed().subscribe(result => {
        if (result == 'undefined') {
          this.f['Active'].setValue(this.companyData.Active == true ? true : false)
        }
      });
    }
  }
  getCompanyById(id: any) {
    this.locationService.getCompanyById(id).subscribe((data) => {
      if (data) {
        this.editCompanyData = data.Data;
        this.getCompanyChangelogData();
        const setData = {
          AccountId: isValueExist(data.Data.AccountId),
          Active: isValueExist(data.Data.Active),
          CompanyName: isValueExist(
            data.Data.CompanyName
          ),
          APSystemId: isValueExist(data.Data.APSystemId),
          Primary: isValueExist(data.Data.Primary),
          RefNumber: isValueExist(data.Data.RefNumber),
          APSystemExportTypeId: isValueExist(
            data.Data.APSystemExportTypeId
          ),
          CompanyLogoImage: isValueExist(
            data.Data.CompanyLogo
          ),
          Alias: isValueExist(data.Data.Alias),
          GLRefNumber: isValueExist(data.Data.GLRefNumber),
          JobRefNumber: isValueExist(data.Data.JobRefNumber),
          CostAllocationProfile: isValueExist(data.Data.CostAllocationProfile)
        };
        this.editCompanyForm.patchValue(setData);
        if (data.Data.CompanyLogo && data.Data.CompanyLogo.ImageData) {
          const image = data.Data.CompanyLogo.ImageData;
          // let objectURL1 = 'data:image/png;base64,' + image;
          let objectURL = 'data:' + data.Data.CompanyLogo.ImageType.ContentType + ';base64,' + image;

          this.logoImage = this.sanitizer.bypassSecurityTrustUrl(objectURL);
        }
        this.getAPSystemExportsBySystemId(data.Data.APSystemId);
      }
    });
  }

  getAPSystems() {
    this.locationService.getAPSystems().subscribe((data) => {
      if (data && data.$values) {
        this.apsystems = data.$values;
      }
    });
  }

  getCustomerForUser() {
    this.locationService.getCustomerDropDown().subscribe((data) => {
      if (data && data.$values) {
        this.customers = data.$values;
        const data1 = this.customers.find((res: any) => res.Id === this.companyData.CustomerAccountId);
        this.setTemDDValue = data1.TemAccountID;
        this.setTemDDValueEvent.emit(this.setTemDDValue);
      }
    });
  }

  onCustomerSelect($event: any) {
    const data1 = this.customers.find((res: any) => res.Id === $event.value);
    this.setTemDDValue = data1.TemAccountID;
    this.setTemDDValueEvent.emit(this.setTemDDValue);
    this.getGL_Jobref($event.value,this.companyData.CompanyId);
    this.getAccountById($event.value);
  }

  get f() {
    return this.editCompanyForm.controls;
  }

  onAPSystemChange() {
    if (this.f['APSystemId'].value) {
      this.f['APSystemExportTypeId'].patchValue('');
      this.getAPSystemExportsBySystemId(this.f['APSystemId'].value);
    } else {
      this.f['APSystemExportTypeId'].patchValue('');
      this.apsystemexports = [];
    }
  }

  getAPSystemExportsBySystemId(id: any) {
    if (id) {
      this.locationService
        .getAPSystemExportsBySystemId(id)
        .subscribe((data) => {
          if (data && data.$values) {
            this.apsystemexports = data.$values;
          }
        });
    }
  }

  onFileUploadedRemove() {
    this.f['CompanyLogoImage'].setValue('');
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
    const fileFormates = ['jpg','png','gif','jpeg','bmp','tiff'];
    let isValid;
    // if(event && event.target.files[0]){
    //   const extension = event.target?.files[0].name.split('.')[1];
    //   isValid = fileFormates.includes(extension.toLowerCase());
    // }

    if (event && event.target.files[0]) {
      // const extension = event.target?.files[0].name.split('.')[1];
      const extension = this.getFileExtension(event.target?.files[0].name);
      isValid = fileFormates.includes(extension.toLowerCase());
      if(isValid){
        var reader = new FileReader();
        reader.readAsDataURL(event.target.files[0]);
        reader.onload = (_event) => {
          this.logoImage = reader.result;
        };
        this.f['CompanyLogoImage'].patchValue(event.target.files[0]);
        this.isUpload = true;
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
      this.f['CompanyLogoImage'].setValue('');
      this.logoImage = null;
    }
  }

  updateCompany() {
    this.isCompanyFormSubmit = true;
    if (this.editCompanyForm.valid) {
      const data = this.editCompanyForm.value;
      const formData = new FormData();
      formData.append(
        'AccountId',
        isValueExist(data.AccountId)
      );
      formData.append(
        'Active',
        isValueExist(data.Active)
      );
      formData.append(
        'CompanyName',
        isValueExist(data.CompanyName)
      );
      formData.append(
        'APSystemId',
        isValueExist(data.APSystemId)
      );
      formData.append(
        'Primary',
        isValueExist(data.Primary)
      );
      formData.append(
        'RefNumber',
        isValueExist(data.RefNumber)
      );
      formData.append(
        'APSystemExportTypeId',
        isValueExist(data.APSystemExportTypeId)
      );
      formData.append(
        'Alias',
        isValueExist(data.Alias)
      );
      formData.append('DefaultApproval', 'false');
      formData.append(
        'CompanyLogoImage',
        isValueExist(data.CompanyLogoImage)
      );

      formData.append('JobRefNumber',isValueExist(data.JobRefNumber));
      formData.append('GLRefNumber',isValueExist(data.GLRefNumber));
      
      data.CostAllocationProfile = data.CostAllocationProfile.replace(/\n/g, ' ');
      formData.append('CostAllocationProfile',isValueExist(data.CostAllocationProfile));

      if (!this.isUpload && this.editCompanyForm.get('CompanyLogoImage')?.value && this.editCompanyData.CompanyLogo && this.editCompanyData.CompanyLogo.ImageType.ContentType) {
        let setOldLogo: any = this.dataURItoBlob(this.logoImage.changingThisBreaksApplicationSecurity);
        formData.append('CompanyLogoImage', setOldLogo, 'chris.' + (this.editCompanyData.CompanyLogo.ImageType.ContentType).split('/')[1]);
      }

      let checkCompanyIsPrimaryData: any = {
        accountId: data.AccountId,
        primary: data.Primary === 'true',
        active: true,
        ID: this.companyData.CompanyId,
      };
      this.saveButtonLoadder = true;

      this.locationService
        .checkCompanyIsPrimary(checkCompanyIsPrimaryData)
        .subscribe((res) => {
          this.saveButtonLoadder = false;
          if (res) {
            let errorData: any = {
              messgeType: 'error',
              title: 'Attention',
              titleClass: 'text-c-blue',
              icon: 'fas fa-exclamation-circle',
              iconClass: 'text-c-blue f-70',
              closeBtnName: 'No',
              okBtnName: 'Yes',
              message:
                'This customer is already assigned as primary in another company, Are you sure you want to make primary in this company', //if messges is multiple use array
                removeLink: true
            };
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
              panelClass: 'error-warning',
              data: errorData,
            });
            dialogRef.afterClosed().subscribe((result) => {
              if (!isValuesUndefined(result)) {
                if (result) {
                  this.companyFinalSave(formData);
                } else {
                  formData.delete('Primary');
                  formData.append('Primary', 'false');
                  this.companyFinalSave(formData);
                }
              }
            });
          } else {
            this.companyFinalSave(formData);
          }
        });
    }
  }

  companyFinalSave(formData: any) {
    this.saveButtonLoadder = true;
    this.locationService
      .updateCompany(this.companyData.CompanyId, formData)
      .subscribe({
        next: (data) => {
          this.saveButtonLoadder = false;
          let errorData: any = {
            messgeType: 'error',
            title: 'Attention',
            titleClass: 'text-c-blue',
            icon: 'fas fa-exclamation-circle',
            iconClass: 'text-c-blue f-70',
            message: data.Message, //if messges is multiple use array
          };
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
            panelClass: 'error-warning',
            data: errorData,
          });
          dialogRef.afterClosed().subscribe((result) => {
            if(data.Success) {
              this.onCompanyUpdateEvent.next(data);
            }
          });
        },
        error: (error) => {
          this.saveButtonLoadder = false;
          let errorMessage: any = '';
          if (error.status === 400) {
            errorMessage = error.error
              ? 'Company with same details already  exists.'
              : 'Bad request please try again later ';
          } else if (error.status === 401) {
            errorMessage = error.error
              ? error.error
              : 'Bad request please try again later ';
          }
          let errorData: any = {
            messgeType: 'error',
            title: 'Attention',
            titleClass: 'text-c-blue',
            icon: 'fas fa-exclamation-circle',
            iconClass: 'text-c-blue f-70',
            message: errorMessage, //if messges is multiple use array
          };
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
            panelClass: 'error-warning',
            data: errorData,
          });
          dialogRef.afterClosed().subscribe((result) => { });
        },
      });
  }

  ngOnDestroy() {
    this.setTemDDValueEvent.emit('');
    this._unsubscribeChangelog.next(null);
    this._unsubscribeChangelog.complete();
  }

  dataURItoBlob(dataURI: any) {
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
      byteString = atob(dataURI.split(',')[1]);
    else
      byteString = unescape(dataURI.split(',')[1]);
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ia], { type: mimeString });
  }

  getGL_Jobref(custId: any, compId: any) {
    this.locationService.getGL_Jobref(custId,compId).subscribe((res: any) => {
      this.structureJobData = res.Data.$values;
    });
  }

  getAccountById(id: any) {
    this.locationService.getTemAccountById(id).subscribe((data) => {
      if (data && data.Data && data.Data.CostAllocationStatus) {
        this.isAPidRequired = true;
        this.editCompanyForm.get('RefNumber')?.setValidators([Validators.required]);
        this.editCompanyForm.get('GLRefNumber')?.setValidators([Validators.required]);
      } else {
        this.isAPidRequired = false;
        this.editCompanyForm.get('RefNumber')?.clearValidators();
        this.editCompanyForm.get('GLRefNumber')?.clearValidators();
      }
      this.editCompanyForm.get('RefNumber')?.updateValueAndValidity();
      this.editCompanyForm.get('GLRefNumber')?.updateValueAndValidity();
    });
  }
}
