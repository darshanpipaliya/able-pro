import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { FileUploadPopupComponent } from 'src/app/common/file-upload-popup/file-upload-popup.component';
import { SpaceTrimStartEndInputirective } from 'src/app/custom-directives/custom-validation.directive';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { isValueExist, isValuesUndefined } from 'src/app/services/helper';
import { LocationService } from 'src/app/services/location.service';

@Component({
  selector: 'app-add-company',
  templateUrl: './add-company.component.html',
  styleUrls: ['./add-company.component.scss'],
  imports: [PrimgModule, SharedModule, SpaceTrimStartEndInputirective],
  providers: [LocationService]
})
export class AddCompanyComponent implements OnInit {
  addCompanyForm: FormGroup;
  isCompanyFormSubmit: boolean = false;
  isBillPay: any = false;
  customers: any = [];
  apsystems: any = [];
  apsystemexports: any = [];
  saveButtonLoadder = false;
  @Output() onCompanyAddEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() currentOpenEditPage: EventEmitter<any> = new EventEmitter<any>();
  logoImage: string | ArrayBuffer | any;
  @Output() onCompanyComponetDestroy: EventEmitter<any> =
    new EventEmitter<any>();
  @Input() companyData: any;
  @Input() selectedTem: any;  


  statusList = [
    { Id : true, Name : 'Active'},
    { Id : false, Name : 'Inactive'},
  ]
  yesNoList = [
    { Id : true, Name : 'Yes'},
    { Id : false, Name : 'No'},
  ]

  @Input() clickOnSearchButton: any;
  @Output() setClickFalse: EventEmitter<any> = new EventEmitter<any>();
  @Input() action: String;
  @Input() selectedWiseTemDD: any;
  @Input() selected: any;
  @Output() setTemDDValueEvent: EventEmitter<any> = new EventEmitter<any>();
  customersLoader = false;
  constructor(
    private locationService: LocationService,
    public dialog: MatDialog,
    private fb: FormBuilder
  ) {
    this.addCompanyForm = fb.group({
      AccountId: new FormControl('', [Validators.required]),
      Active: new FormControl(true, [Validators.required]),
      CompanyName: new FormControl('', [Validators.required, Validators.maxLength(100)]),
      APSystemId: new FormControl('', []),
      Primary: new FormControl(false, [Validators.required]),
      RefNumber: new FormControl('', [Validators.maxLength(10)]),
      APSystemExportTypeId: new FormControl('', []),
      CompanyLogoImage: new FormControl('', []),
      Alias: new FormControl('',[Validators.maxLength(100)]),
    });
  }

  ngOnChanges(changes:any) {
    if (this.clickOnSearchButton && changes && changes['clickOnSearchButton'] && changes['clickOnSearchButton']['currentValue']) {
      this.getCustomerForUser();
      this.clickOnSearchButton = false;
      this.setClickFalse.emit(false);
    }
  }
  ngOnInit(): void {
    this.currentOpenEditPage.emit(false);
    if (this.companyData) {
      this.addCompanyForm.patchValue(this.companyData);
      this.onFileUploaded({ target: { files: [this.companyData.CompanyLogoImage] } });
      // this.logoImage = this.companyData.CompanyLogoImage;
    }
    this.getCustomerForUser();
    this.getAPSystems();
  }

  getAPSystems() {
    this.locationService.getAPSystems().subscribe((data) => {
      if (data && data.$values) {
        this.apsystems = data.$values;
        this.onAPSystemChange();
      }
    });
  }

  getCustomerForUser() {
    const idd = this.selectedTem ? Number(this.selectedTem) : this.action === 'Add' ? this.selectedWiseTemDD[this.selected].id : this.selectedTem;
    if (this.selectedTem && this.selectedTem === "all") {
      this.customersLoader = true;
      this.locationService.getCustomerDropDown().subscribe((data) => {
        if (data && data.$values) {
          this.customers = data.$values;
          this.customersLoader = false;
          this.setTemDDValueEvent.emit(idd);
        } else {
          this.customers= [];
          this.customersLoader = false;
          this.setTemDDValueEvent.emit(idd);
        }
      }, error => {
        this.customers= [];
        this.customersLoader = false;
        this.setTemDDValueEvent.emit(idd);
      });
    } else {
      this.customersLoader = true;
      this.locationService.getCustomerDropdownByNewTEM(this.selectedTem).subscribe((data) => {
        if (data && data.Data.$values) {
          this.customers = data.Data.$values;
          this.customersLoader = false;
          this.setTemDDValueEvent.emit(idd);

        } else {
          this.customers= [];
          this.customersLoader = false;
          this.setTemDDValueEvent.emit(idd);
        }
      }, error => {
        this.customers= [];
        this.customersLoader = false;
        this.setTemDDValueEvent.emit(idd);
      });
    }
  }

  get f() {
    return this.addCompanyForm.controls;
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
    this.locationService.getAPSystemExportsBySystemId(id).subscribe((data) => {
      if (data && data.$values) {
        this.apsystemexports = data.$values;
      }
    });
  }

  fileUpload() {
    const dialogRef = this.dialog.open(FileUploadPopupComponent, {
      panelClass: 'width-665',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.length > 0) {
        this.f['CompanyLogoImage'].patchValue(result[0]);
      } else {
        this.f['CompanyLogoImage'].setValue('');
      }
    });
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
        };
        this.f['CompanyLogoImage'].patchValue(event.target.files[0]);
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

  saveCompany() {
    this.isCompanyFormSubmit = true;
    if (this.addCompanyForm.valid) {
      const data = this.addCompanyForm.getRawValue();
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

      let checkCompanyIsPrimaryData: any = {
        accountId: data.AccountId,
        primary: data.Primary === 'true' || data.Primary === true,
        active: true,
      };

      if (checkCompanyIsPrimaryData.primary) {
        this.saveButtonLoadder = true;
        this.locationService
          .checkCompanyIsPrimary(checkCompanyIsPrimaryData)
          .subscribe(
            (res) => {
              if (res) {
                this.saveButtonLoadder = false;
                let errorData: any = {
                  messgeType: 'error',
                  title: 'Attention',
                  titleClass: 'text-c-blue',
                  icon: 'fas fa-exclamation-circle',
                  iconClass: 'text-c-blue f-70',
                  closeBtnName: 'No',
                  okBtnName: 'Yes',
                  message:
                    'This customer already has a primary company. Are you sure you want to change the primary company?', //if messges is multiple use array
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
            },
            (error) => {
              this.saveButtonLoadder = false;
              let errorData: any = {
                messgeType: 'error',
                title: 'Attention',
                titleClass: 'text-c-blue',
                icon: 'fas fa-exclamation-circle',
                iconClass: 'text-c-blue f-70',
                closeBtnName: 'No',
                okBtnName: 'Yes',
                message: 'Please try again', //if messges is multiple use array
              };
              const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
                panelClass: 'error-warning',
                data: errorData,
              });
              dialogRef.afterClosed().subscribe((result) => {});
            }
          );
      } else {
        this.companyFinalSave(formData);
      }
    }
  }

  companyFinalSave(formData:any) {
    this.saveButtonLoadder = true;
    this.locationService.saveCompany(formData).subscribe({
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
          if(data.Success)
            this.onCompanyAddEvent.next(data);
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
        dialogRef.afterClosed().subscribe((result) => {});
      },
    });
  }
  ngOnDestroy() {
    this.onCompanyComponetDestroy.emit(this.addCompanyForm.value);
    this.setTemDDValueEvent.emit('');
  }
}
