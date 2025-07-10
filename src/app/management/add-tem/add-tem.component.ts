import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { SpaceTrimStartEndInputirective } from 'src/app/custom-directives/custom-validation.directive';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { LocationService } from 'src/app/services/location.service';

@Component({
    selector: 'app-add-tem',
    templateUrl: './add-tem.component.html',
    styleUrls: ['./add-tem.component.scss'],
    standalone: true,
    imports: [SharedModule, PrimgModule, SpaceTrimStartEndInputirective]
})
export class AddTemComponent implements OnInit {
    addTemForm: FormGroup;
    isTemFormSubmit: boolean = false;
    isBillPay: any = false;
    countries: any = [];
    states: any = [];
    countryStateArray: any = [];
    logoImg: any;
    isSameAsPhyAddress: boolean = false;
    Billingstates: any = [];
    saveButtonLoadder = false;
    isShowAsterisk: boolean = false;
    isMFAon: boolean = false;


    @Input() temData: any;
    @Output() onComponetDestroy: EventEmitter<any> = new EventEmitter<any>();
    @Output() onTemAddEvent: EventEmitter<any> = new EventEmitter<any>();
    @Output() currentOpenEditPage: EventEmitter<any> = new EventEmitter<any>()

    constructor(private locationService: LocationService,
        public dialog: MatDialog,
        public fb: FormBuilder) {
        this.addTemForm = fb.group({
            AccountName: new FormControl('', [Validators.required]),
            Active: new FormControl('true', [Validators.required]),
            PhysicalAddress: new FormControl('', [Validators.required]),
            PhysicalAddress2: new FormControl(''),
            Country: new FormControl('', [Validators.required]),
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
            TwoFactorEnabled: new FormControl(false),
            MFAContactName: new FormControl('', [Validators.maxLength(60)]),
            MFAContactEmail: new FormControl('', [Validators.maxLength(60),Validators.email, Validators.pattern('^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[a-z]{2,4}$')])
        })
    }

    ngOnInit(): void {
        this.currentOpenEditPage.emit(false);

        if (this.temData) {
            this.addTemForm.patchValue(this.temData);
        }
        this.getCountry();
    }

    changeMFAvalue($event: any){
        if($event.value == true || $event.value == 'true'){
          this.addTemForm.get('MFAContactEmail')?.setValidators([Validators.required,Validators.maxLength(60),Validators.email, Validators.pattern('^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[a-z]{2,4}$')]);
          this.isMFAon = true;
          this.addTemForm.get('MFAContactName')?.setValidators([Validators.required,Validators.maxLength(60)]);
        } else {
          this.isMFAon = false;
          this.addTemForm.get('MFAContactEmail')?.setValidators([Validators.maxLength(60),Validators.email, Validators.pattern('^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[a-z]{2,4}$')]);
          this.addTemForm.get('MFAContactName')?.setValidators([Validators.maxLength(60)]);
        }
        this.addTemForm.get('MFAContactEmail')?.updateValueAndValidity();
        this.addTemForm.get('MFAContactName')?.updateValueAndValidity();
      }
    
    checkAddressValidation() {
        if ((this.f.BillingAddress.value && !this.f.BillingAddress.value.startsWith(" ")) || (this.f.BillingCity.value && !this.f.BillingCity.value.startsWith(" ")) || (this.f.BillingCountryId.value && !this.f.BillingCountryId.value.startsWith(" ")) || (this.f.BillingStateId.value && !this.f.BillingStateId.value.startsWith(" ")) || (this.f.BillingPostalCode.value && !this.f.BillingPostalCode.value.startsWith(" "))) {
            this.isShowAsterisk = true;
            this.addTemForm.get('BillingAddress')?.setValidators([Validators.required]);
            this.addTemForm.get('BillingCity')?.setValidators([Validators.required]);
            this.addTemForm.get('BillingCountryId')?.setValidators([Validators.required]);
            this.addTemForm.get('BillingStateId')?.setValidators([Validators.required]);
            this.addTemForm.get('BillingPostalCode')?.setValidators([Validators.required]);
        } else {
            this.isShowAsterisk = false;
            this.addTemForm.get('BillingAddress')?.clearValidators();
            this.addTemForm.get('BillingCity')?.clearValidators();
            this.addTemForm.get('BillingCountryId')?.clearValidators();
            this.addTemForm.get('BillingStateId')?.clearValidators();
            this.addTemForm.get('BillingPostalCode')?.clearValidators();
        }

        this.addTemForm.get('BillingAddress')?.updateValueAndValidity();
        this.addTemForm.get('BillingCity')?.updateValueAndValidity();
        this.addTemForm.get('BillingCountryId')?.updateValueAndValidity();
        this.addTemForm.get('BillingStateId')?.updateValueAndValidity();
        this.addTemForm.get('BillingPostalCode')?.updateValueAndValidity();
    }

    checkAddressValidation2() {
        if ((this.f.BillingAddress2.value && !this.f.BillingAddress2.value.startsWith(" ")) || (this.f.BillingCity.value && !this.f.BillingCity.value.startsWith(" ")) || (this.f.BillingCountryId.value && !this.f.BillingCountryId.value.startsWith(" ")) || (this.f.BillingStateId.value && !this.f.BillingStateId.value.startsWith(" ")) || (this.f.BillingPostalCode.value && !this.f.BillingPostalCode.value.startsWith(" "))) {
            this.isShowAsterisk = true;
            this.addTemForm.get('BillingAddress')?.setValidators([Validators.required]);
            this.addTemForm.get('BillingCity')?.setValidators([Validators.required]);
            this.addTemForm.get('BillingCountryId')?.setValidators([Validators.required]);
            this.addTemForm.get('BillingStateId')?.setValidators([Validators.required]);
            this.addTemForm.get('BillingPostalCode')?.setValidators([Validators.required]);
        } else {
            this.isShowAsterisk = false;
            this.addTemForm.get('BillingAddress')?.clearValidators();
            this.addTemForm.get('BillingCity')?.clearValidators();
            this.addTemForm.get('BillingCountryId')?.clearValidators();
            this.addTemForm.get('BillingStateId')?.clearValidators();
            this.addTemForm.get('BillingPostalCode')?.clearValidators();
        }

        this.addTemForm.get('BillingAddress')?.updateValueAndValidity();
        this.addTemForm.get('BillingCity')?.updateValueAndValidity();
        this.addTemForm.get('BillingCountryId')?.updateValueAndValidity();
        this.addTemForm.get('BillingStateId')?.updateValueAndValidity();
        this.addTemForm.get('BillingPostalCode')?.updateValueAndValidity();
    }

    get f() : any {
        return this.addTemForm.controls;
    }


    getCountry(){
        this.locationService.getCountries().subscribe((data: any) => {
            if (data){
                let countrystateArray = data.$values;
                this.countries =countrystateArray;
            }
          });
    }

    onCountrySelect(event: any) {
        if (this.f.Country.valid && this.f.Country.value) {
            if (this.isSameAsPhyAddress) {
                this.addTemForm.controls['BillingCountryId'].setValue(this.f.Country.value);
                this.addTemForm.controls["BillingCountryId"].setValidators([]);
            }
            this.locationService.getStates(this.f.Country.value).subscribe((data: any) =>{
                if (data){
                    let countrystateArray = data.$values;
                    this.states =countrystateArray;
                    if (this.isSameAsPhyAddress){
                        this.Billingstates =  data.$values;
                    }
                }
            });

        }
    }

    onStateSelect() {
        if (this.isSameAsPhyAddress) {
            this.addTemForm.controls['BillingStateId'].setValue(this.f.StateId.value);
            this.addTemForm.controls["BillingStateId"].setValidators([]);
        }
    }

    getFileExtension(filename: string): string {
        const match = filename.match(/\.([0-9a-z]+)(?:[\?#]|$)/i);
        return match ? match[1] : '';
    }

    onFileUploaded(event: any) {
        const fileFormates = ['jpg', 'png', 'gif', 'jpeg', 'bmp', 'tiff'];
        let isValid;
        // if (event && event.length > 0) {
        //     var reader = new FileReader();
        //     reader.readAsDataURL(event[0]);
        //     reader.onload = (_event) => {
        //         this.logoImg = reader.result;
        //     }
        //     this.f.AccountLogoImage.patchValue(event[0]);
        // } else {
        //     this.f.AccountLogoImage.setValue('');
        // }

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

    saveTem() {
        this.isTemFormSubmit = true;
        if (this.addTemForm.valid) {
            this.saveButtonLoadder = true;
            const formData = new FormData();
            formData.append('AccountName', this.addTemForm.get('AccountName')?.value);
            formData.append('Active', "true");
            formData.append('PhysicalAddress', this.addTemForm.get('PhysicalAddress')?.value);
            formData.append('PhysicalAddress2', this.addTemForm.get('PhysicalAddress2')?.value);
            formData.append('City', this.addTemForm.get('City')?.value);
            formData.append('StateId', this.addTemForm.get('StateId')?.value);
            formData.append('PostalCode', this.addTemForm.get('PostalCode')?.value);
            formData.append('AccountLogoImage', this.addTemForm.get('AccountLogoImage')?.value);

            formData.append('BillingAddress', this.addTemForm.get('BillingAddress')?.value);
            formData.append('BillingAddress2', this.addTemForm.get('BillingAddress2')?.value);
            formData.append('BillingCity', this.addTemForm.get('BillingCity')?.value);
            formData.append('BillingCountryId', this.addTemForm.get('BillingCountryId')?.value);
            formData.append('BillingStateId', this.addTemForm.get('BillingStateId')?.value);
            formData.append('BillingPostalCode', this.addTemForm.get('BillingPostalCode')?.value);
            formData.append('TwoFactorEnabled', this.addTemForm.get('TwoFactorEnabled')?.value);
            if(this.addTemForm.get('TwoFactorEnabled')?.value) {
                formData.append('MFAContactEmail', this.addTemForm.get('MFAContactEmail')?.value);
                formData.append('MFAContactName', this.addTemForm.get('MFAContactName')?.value);
            }
        

            this.locationService.saveTEM(formData).subscribe({
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
                    const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
                    dialogRef.afterClosed().subscribe(result => {
                        if(data.Success)
                            this.onTemAddEvent.next(data);
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
                    const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
                }
            });
        }
    }


    sameAsPhyAddress(val: any) {
        this.isSameAsPhyAddress = val;
        if (val) {
            this.addTemForm.controls['BillingAddress']?.setValue(this.f.PhysicalAddress.value);
            this.addTemForm.controls["BillingAddress"]?.setValidators([Validators.required]);

            this.addTemForm.controls['BillingAddress2']?.setValue(this.f.PhysicalAddress2.value);

            this.addTemForm.controls['BillingCity']?.setValue(this.f.City.value);
            this.addTemForm.controls["BillingCity"]?.setValidators([Validators.required]);

            this.addTemForm.controls['BillingCountryId']?.setValue(this.f.Country.value);
            this.onBillingCountrySelect(this.f.Country.value);
            setTimeout(() => {
                this.addTemForm.controls['BillingStateId']?.setValue(Number(this.f.StateId.value));
                this.addTemForm.controls["BillingStateId"]?.setValidators([Validators.required]);
            }, 50);
            this.addTemForm.controls['BillingPostalCode']?.setValue(this.f.PostalCode.value);
            this.addTemForm.controls["BillingPostalCode"]?.setValidators([Validators.required]);            
        } else {
            this.addTemForm.controls['BillingAddress']?.setValue("");
            this.addTemForm.controls["BillingAddress"]?.setValidators([]);

            this.addTemForm.controls['BillingAddress2']?.setValue("");
            this.addTemForm.controls["BillingAddress2"]?.setValidators([]);

            this.addTemForm.controls['BillingCity']?.setValue("");
            this.addTemForm.controls["BillingCity"]?.setValidators([]);

            this.addTemForm.controls['BillingCountryId']?.setValue("");
            this.addTemForm.controls['BillingStateId']?.setValue("");
            this.addTemForm.controls["BillingStateId"]?.setValidators([]);

            this.addTemForm.controls['BillingPostalCode']?.setValue("");
            this.addTemForm.controls["BillingPostalCode"]?.setValidators([]);
        }

        this.addTemForm.get("BillingAddress")?.updateValueAndValidity();
        this.addTemForm.get("BillingAddress2")?.updateValueAndValidity();
        this.addTemForm.get("BillingCity")?.updateValueAndValidity();
        this.addTemForm.get("BillingStateId")?.updateValueAndValidity();
        this.addTemForm.get("BillingPostalCode")?.updateValueAndValidity();

    }

    onBillingCountrySelect(CountryId: any) {
        this.locationService.getStates(CountryId).subscribe((data: any) =>{
            if (data){
                let countrystateArray = data.$values;
                this.Billingstates =countrystateArray;
            }
        });
    }

    removeLogo(){
        this.logoImg = '';
        this.f.AccountLogoImage.setValue(null);
        const fileInput = document.querySelector('.file-input') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = ''; // Clear the selected file
        }
    }

    ngOnDestroy() {
        this.onComponetDestroy.emit(this.addTemForm.value);
    }
}
