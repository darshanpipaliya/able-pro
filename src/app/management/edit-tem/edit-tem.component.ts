import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';
import { LocationService } from 'src/app/services/location.service';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SpaceTrimStartEndInputirective } from 'src/app/custom-directives/custom-validation.directive';

@Component({
    selector: 'app-edit-tem',
    templateUrl: './edit-tem.component.html',
    styleUrls: ['./edit-tem.component.scss'],
    standalone: true,
    imports: [SharedModule, PrimgModule, SpaceTrimStartEndInputirective]
})
export class EditTemComponent implements OnInit {
    editTemForm: FormGroup;
    isTemFormSubmit: boolean = false;
    isBillPay: any = false;
    countries: any = [];
    states: any = [];
    @Input() temData: any;
    isUserSuperTemOrAdmin = false;
    isUserTemManagerOrUser = false;
    disabled = false;
    saveButtonLoadder = false;
    Billingstates: any = [];
    isSameAsPhyAddress: boolean = false;
    @Output() onTemEditEvent: EventEmitter<any> = new EventEmitter<any>();
    @Output() currentOpenEditPage: EventEmitter<any> = new EventEmitter<any>()
    isShowAsterisk: boolean = false;
    isMFAon: boolean = false;

    temAccountData: any;
    isTEMUsers: boolean = false;
    logoImg: any;
    isSuperTEMUsers: boolean = false;
    isSuperTEMAdmin: boolean = false;
    isCompanyUser: boolean = false;
    isUpload: boolean = false;

    private _unsubscribeState: Subject<any> = new Subject<any>();
    private _unsubscribeBillingState: Subject<any> = new Subject<any>();


    constructor(private locationService: LocationService,
        public dialog: MatDialog,
        private fb: FormBuilder,
        private sanitizer: DomSanitizer) {
        this.editTemForm = fb.group({
            AccountName: new FormControl('', [Validators.required]),
            Active: new FormControl('true', [Validators.required]),
            PhysicalAddress: new FormControl('', [Validators.required]),
            PhysicalAddress2: new FormControl(''),
            CountryId: new FormControl('', [Validators.required]),
            City: new FormControl('', [Validators.required]),
            StateId: new FormControl('', [Validators.required]),
            PostalCode: new FormControl('', [Validators.required]),
            AccountLogoImage: new FormControl(''),
            BillingAddress: new FormControl(''),
            BillingAddress2: new FormControl(''),
            BillingCity: new FormControl(''),
            BillingCountryId: new FormControl(''),
            BillingStateId: new FormControl(''),
            BillingPostalCode: new FormControl(''),
            isSameAsPhyAddress: new FormControl(''),
            TwoFactorEnabled: new FormControl(''),
            MFAContactName: new FormControl('', [Validators.maxLength(60)]),
            MFAContactEmail: new FormControl('', [Validators.maxLength(60),Validators.email, Validators.pattern('^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[a-z]{2,4}$')])
        })
    }
    ngOnInit(): void {        
        this.currentOpenEditPage.emit(true);
        this.isUserSuperTemOrAdmin = this.locationService.isUserHasSuperTEMOrAdminRole();
        this.isUserTemManagerOrUser = this.locationService.isUserHasTEMManagerOrUserRole();
        this.isTEMUsers = this.locationService.isUserHasTEMUserRole();
        this.isSuperTEMUsers = this.locationService.isUserHasSuperTEMUsersRole();
        this.isSuperTEMAdmin = this.locationService.isUserHasSuperTEMAdminRole();
        this.isCompanyUser = this.locationService.isUserCompanyUser();

        if (this.isTEMUsers || this.isCompanyUser) {
            this.disabled = true;
            this.editTemForm.disable();
        }
        this.getTemAccountById(this.temData.AccountId);
        setTimeout(() => {
        }, 0);
    }

    changeMFAvalue($event: any){
        if($event == true || $event == 'true'){
          this.isMFAon = true;
          this.editTemForm.get('MFAContactEmail')?.setValidators([Validators.required,Validators.maxLength(60),Validators.email, Validators.pattern('^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[a-z]{2,4}$')]);
          this.editTemForm.get('MFAContactName')?.setValidators([Validators.required,Validators.maxLength(60)]);
        } else {
          this.isMFAon = false;
          this.editTemForm.get('MFAContactEmail')?.setValidators([Validators.maxLength(60),Validators.email, Validators.pattern('^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[a-z]{2,4}$')]);
          this.editTemForm.get('MFAContactName')?.setValidators([Validators.maxLength(60)]);
        }
        this.editTemForm.get('MFAContactEmail')?.updateValueAndValidity();
        this.editTemForm.get('MFAContactName')?.updateValueAndValidity();
      }

    checkAddressValidation() {
        if ((this.f.BillingAddress.value !== '') || (this.f.BillingAddress2.value && !this.f.BillingAddress2.value.startsWith(" ")) || (this.f.BillingCity.value && !this.f.BillingCity.value.startsWith(" ")) || (this.f.BillingCountryId.value !== '') || (this.f.BillingStateId.value !== '') || (this.f.BillingPostalCode.value && !this.f.BillingPostalCode.value.startsWith(" "))) {
            this.isShowAsterisk = true;
            this.editTemForm.get('BillingAddress')?.setValidators([Validators.required]);
            this.editTemForm.get('BillingCity')?.setValidators([Validators.required]);
            this.editTemForm.get('BillingCountryId')?.setValidators([Validators.required]);
            this.editTemForm.get('BillingStateId')?.setValidators([Validators.required]);
            this.editTemForm.get('BillingPostalCode')?.setValidators([Validators.required]);
        } else {
            this.isShowAsterisk = false;
            this.editTemForm.get('BillingAddress')?.clearValidators();
            this.editTemForm.get('BillingCity')?.clearValidators();
            this.editTemForm.get('BillingCountryId')?.clearValidators();
            this.editTemForm.get('BillingStateId')?.clearValidators();
            this.editTemForm.get('BillingPostalCode')?.clearValidators();
        }

        this.editTemForm.get('BillingAddress')?.updateValueAndValidity();
        this.editTemForm.get('BillingCity')?.updateValueAndValidity();
        this.editTemForm.get('BillingCountryId')?.updateValueAndValidity();
        this.editTemForm.get('BillingStateId')?.updateValueAndValidity();
        this.editTemForm.get('BillingPostalCode')?.updateValueAndValidity();
    }

    checkAddressValidation2() {
        if (this.f.BillingAddress2.value !== '') {
          if (this.f.BillingAddress.value == '') {
            this.editTemForm.get('BillingAddress')?.setValidators([Validators.required])
            this.editTemForm.get('BillingAddress')?.updateValueAndValidity();
          }
    
          if (this.f.BillingCity.value == '') {
            this.editTemForm.get('BillingCity')?.setValidators([Validators.required])
            this.editTemForm.get('BillingCity')?.updateValueAndValidity();
          }
    
          if (this.f.BillingCountryId.value == '') {
            this.editTemForm.get('BillingCountryId')?.setValidators([Validators.required])
            this.editTemForm.get('BillingCountryId')?.updateValueAndValidity();
          }
    
          if (this.f.BillingStateId.value == '') {
            this.editTemForm.get('BillingStateId')?.setValidators([Validators.required])
            this.editTemForm.get('BillingStateId')?.updateValueAndValidity();
          }
    
          if (this.f.BillingPostalCode.value == '') {
            this.editTemForm.get('BillingPostalCode')?.setValidators([Validators.required])
            this.editTemForm.get('BillingPostalCode')?.updateValueAndValidity();
          }
        } else {
          this.editTemForm.get('BillingAddress')?.clearValidators();
          this.editTemForm.get('BillingCity')?.clearValidators();
          this.editTemForm.get('BillingCountryId')?.clearValidators();
          this.editTemForm.get('BillingStateId')?.clearValidators();
          this.editTemForm.get('BillingPostalCode')?.clearValidators();
          this.editTemForm.get('BillingAddress')?.updateValueAndValidity();
          this.editTemForm.get('BillingCity')?.updateValueAndValidity();
          this.editTemForm.get('BillingCountryId')?.updateValueAndValidity();
          this.editTemForm.get('BillingStateId')?.updateValueAndValidity();
          this.editTemForm.get('BillingPostalCode')?.updateValueAndValidity();
        }
      }

    getTemAccountById(id: any) {
        this.locationService.getTemAccountById(id).subscribe((data) => {
            if (data) {
                data = data.Data;
                this.editTemForm.patchValue(data);
                this.getCountry();
                this.onBillingCountrySelect(this.f.BillingCountryId.value, 2);
                this.getStates();
                this.onCountrySelect();
                this.changeMFAvalue(data?.TwoFactorEnabled);
                this.temAccountData = data;
                if (data.AccountLogo && data.AccountLogo?.ImageData) {
                    let objectURL = 'data:' + data.AccountLogo.ImageType.ContentType + ';base64,' + data.AccountLogo.ImageData;
                    this.logoImg = this.sanitizer.bypassSecurityTrustUrl(objectURL);
                }
                if (data.BillingAddress === data.PhysicalAddress) {
                    this.editTemForm.controls['isSameAsPhyAddress'].setValue(true);
                    this.isSameAsPhyAddress = true;
                    this.getStates();
                } else {
                    this.editTemForm.controls['isSameAsPhyAddress'].setValue(false);
                    this.isSameAsPhyAddress = false;
                    if (data.BillingCountryId == null || data.BillingStateId == null) {
                        this.editTemForm.controls['BillingCountryId'].setValue("");
                        this.editTemForm.controls['BillingStateId'].setValue("");
                    }
                }
            }
        });
    }

    get f() : any {
        return this.editTemForm.controls;
    }

    getCountry(){
        this.locationService.getCountries().subscribe((data: any) => {
            if (data){
                this.countries = data.$values;
            }
          });
    }

    ngOnDestroy() {
        this._unsubscribeState.next(null);
        this._unsubscribeState.complete();
        this._unsubscribeBillingState.next(null);
        this._unsubscribeBillingState.complete();
    }
    getStates() {
        this._unsubscribeState.next(null);
        this.locationService.getStates(this.f.CountryId.value).pipe(takeUntil(this._unsubscribeState)).subscribe((data: any) => {
            if (data) {
                this.states = data.$values;
                if (this.isSameAsPhyAddress) {

                    this.onBillingCountrySelect(this.f.BillingCountryId.value, 2);
                }
            }
        });
    }

    onCountrySelect() {
        if (this.f.CountryId.valid && this.f.CountryId.value) {

            if (this.isSameAsPhyAddress) {

                this.editTemForm.controls['BillingCountryId'].setValue(this.f.CountryId.value);
              //  this.editTemForm.controls['BillingStateId'].setValue('');
              //  this.editTemForm.controls["BillingStateId"].setValidators([]);
            }
            this._unsubscribeState.next(null);
            this.locationService.getStates(this.f.CountryId.value).pipe(takeUntil(this._unsubscribeState)).subscribe((data: any) => {
                if (data) {
                    this.states =  data.$values;
                    if (this.isSameAsPhyAddress){
                        this.Billingstates =  data.$values;
                    }
                }
            });
        }
    }

    onStateSelect() {
        if (this.isSameAsPhyAddress) {
            this.editTemForm.controls['BillingStateId'].setValue(this.f.StateId.value);
            this.editTemForm.controls["BillingStateId"].setValidators([]);
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
                    this.logoImg = reader.result;
                }
                this.isUpload = true;
                this.f.AccountLogoImage.patchValue(event.target.files[0]);
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
            this.f.AccountLogoImage.setValue('');
            this.logoImg = null;
        }
    }

    updateTem() {
        this.isTemFormSubmit = true;
        if (this.editTemForm.valid) {
            this.saveButtonLoadder = true;
            const formData = new FormData();
            formData.append('AccountName', this.editTemForm.get('AccountName')?.value);
            formData.append('Active', "true");
            formData.append('PhysicalAddress', this.editTemForm.get('PhysicalAddress')?.value);
            formData.append('PhysicalAddress2', this.editTemForm.get('PhysicalAddress2')?.value);
            formData.append('City', this.editTemForm.get('City')?.value);
            formData.append('StateId', this.editTemForm.get('StateId')?.value);
            formData.append('PostalCode', this.editTemForm.get('PostalCode')?.value);
            formData.append('AccountLogoImage', this.editTemForm.get('AccountLogoImage')?.value);
            formData.append('BillingAddress', this.editTemForm.get('BillingAddress')?.value);
            formData.append('BillingAddress2', this.editTemForm.get('BillingAddress2')?.value);
            formData.append('BillingCity', this.editTemForm.get('BillingCity')?.value);
            formData.append('BillingCountryId', this.editTemForm.get('BillingCountryId')?.value);
            formData.append('BillingStateId', this.editTemForm.get('BillingStateId')?.value);
            formData.append('BillingPostalCode', this.editTemForm.get('BillingPostalCode')?.value);
            formData.append('TwoFactorEnabled', this.editTemForm.get('TwoFactorEnabled')?.value);
            if(this.editTemForm.get('TwoFactorEnabled')?.value) {
                formData.append('MFAContactEmail', this.editTemForm.get('MFAContactEmail')?.value);
                formData.append('MFAContactName', this.editTemForm.get('MFAContactName')?.value);
            }
           
            if (this.editTemForm.get('AccountLogoImage')?.value == '' && this.temAccountData.AccountLogo && this.temAccountData.AccountLogo.ImageType.ContentType) {
                let setOldLogo: any = this.dataURItoBlob(this.logoImg.changingThisBreaksApplicationSecurity);
                formData.append('AccountLogoImage', setOldLogo, 'chris.' + (this.temAccountData.AccountLogo.ImageType.ContentType).split('/')[1]);
            }

            this.locationService.updateTEM(this.temData.AccountId, formData).subscribe({
                next: data => {
                    this.saveButtonLoadder = false;
                    let errorData: any = {
                        messgeType: "error",
                        title: "Attention",
                        titleClass: "text-c-blue",
                        icon: "fas fa-exclamation-triangle",
                        iconClass: "text-c-blue f-70",
                        message: data.Message //if messges is multiple use array
                    }
                    const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {panelClass: 'error-warning', data: errorData });
                    dialogRef.afterClosed().subscribe(result => {
                        if(data.Success)
                            this.onTemEditEvent.next(data);
                    });
                },
                error: error => {
                    this.saveButtonLoadder = false;
                    let errorMessage: any = '';
                    if (error.status === 400) {
                        errorMessage = "TEM with same details already exists";
                    } else if (error.status === 401) {
                        errorMessage = error.error.ErrorMessage;
                    }
                    let errorData: any = {
                        messgeType: "error",
                        title: "Attention",
                        titleClass: "text-c-blue",
                        icon: "fas fa-exclamation-triangle",
                        iconClass: "text-c-blue f-70",
                        message: errorMessage //if messges is multiple use array
                    }
                    const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning',data: errorData });
                }
            });
        }
    }

    sameAsPhyAddress(val: any) {
        this.isSameAsPhyAddress = val;
        if (val) {
            this.editTemForm.controls['BillingAddress'].setValue(this.f.PhysicalAddress.value);
            this.editTemForm.controls["BillingAddress"].setValidators([Validators.required]);

            this.editTemForm.controls['BillingAddress2'].setValue(this.f.PhysicalAddress2.value);

            this.editTemForm.controls['BillingCity'].setValue(this.f.City.value);
            this.editTemForm.controls["BillingCity"].setValidators([Validators.required]);

            this.editTemForm.controls['BillingCountryId'].setValue(this.f.CountryId.value);
            this.onBillingCountrySelect(this.f.CountryId.value, 3);

            setTimeout(() => {

            this.editTemForm.controls['BillingStateId'].setValue(this.f.StateId.value);
            this.editTemForm.controls["BillingStateId"].setValidators([Validators.required]);
            }, 50);
            this.editTemForm.controls['BillingPostalCode'].setValue(this.f.PostalCode.value);
            this.editTemForm.controls["BillingPostalCode"].setValidators([Validators.required]);


        } else {
            this.editTemForm.controls['BillingAddress'].setValue("");
            this.editTemForm.controls["BillingAddress"].setValidators([]);
            this.editTemForm.controls['BillingAddress2'].setValue("");
            this.editTemForm.controls["BillingAddress2"].setValidators([]);

            this.editTemForm.controls['BillingCity'].setValue("");
            this.editTemForm.controls["BillingCity"].setValidators([]);

            this.editTemForm.controls['BillingCountryId'].setValue("");
            this.editTemForm.controls['BillingStateId'].setValue("");
            this.editTemForm.controls["BillingStateId"].setValidators([]);

            this.editTemForm.controls['BillingPostalCode'].setValue("");
            this.editTemForm.controls["BillingPostalCode"].setValidators([]);
        }

        this.editTemForm.get("BillingAddress")?.updateValueAndValidity();
        this.editTemForm.get("BillingAddress2")?.updateValueAndValidity();
        this.editTemForm.get("BillingCity")?.updateValueAndValidity();
        this.editTemForm.get("BillingStateId")?.updateValueAndValidity();
        this.editTemForm.get("BillingPostalCode")?.updateValueAndValidity();

    }

    onBillingCountrySelect(CountryId: any, number: any) {
        if (CountryId) {
            this._unsubscribeBillingState.next(null);
            this.locationService.getStates(CountryId).pipe(takeUntil(this._unsubscribeBillingState)).subscribe((data: any) => {
                if (data) {
                    this.Billingstates = data.$values;
                }
            });
        }
    }

    removeLogo() {
        this.logoImg = null;
        this.f.AccountLogoImage.setValue(null);
        const fileInput = document.querySelector('.file-input') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = ''; // Clear the selected file
        }
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
}


