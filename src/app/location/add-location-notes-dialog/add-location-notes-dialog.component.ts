import { Component, Inject, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { LocationService } from 'src/app/services/location.service';
import { ManageService } from 'src/app/services/manage.service';
import { checkIsValueExists, isValueExist } from 'src/app/services/helper';
import { FileUploadPopupComponent } from 'src/app/common/file-upload-popup/file-upload-popup.component';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { SpaceTrimStartEndInputirective } from 'src/app/custom-directives/custom-validation.directive';
import { DatePipe } from '@angular/common';
import { CustomPipe } from 'src/app/custom-pipe/date.pipe';

@Component({
  selector: 'app-add-location-notes-dialog',
  templateUrl: './add-location-notes-dialog.component.html',
  styleUrls: ['./add-location-notes-dialog.component.scss'],
  providers: [LocationService,  ManageService,DatePipe,CustomPipe],
  imports: [
    SharedModule,
    PrimgModule,
    SpaceTrimStartEndInputirective
  ]
})
export class AddLocationNotesDialogComponent implements OnInit {


  locationNotesForm: FormGroup;
  isSubmit: boolean = false;
  hasSsuperTemUsers: boolean = false;

  text: string = ''; // Bind to the textarea value
  characterCount: number = 0;

  dialogData: any;
  customers: any = [];
  companies: any = [];  
  locationStatus: any = [];
  locationTypes: any = [];
  locationTerm: any = [];
  countries: any = [];
  states: any = [];

  selectedFileName = '';
  
  private _unsubscribeInventory: Subject<any> = new Subject<any>();
  private getCustomer: Subject<any> = new Subject<any>();
  private _unsubscribeGetLocationType: Subject<any> = new Subject<any>();
  private _unsubscribeGetLocationStatus: Subject<any> = new Subject<any>();
  private _unsubscribeGetLocationTerm: Subject<any> = new Subject<any>();
  private _unsubscribeCountry: Subject<any> = new Subject<any>();
  private _unsubscribeState: Subject<any> = new Subject<any>();

  saveButtonDisabled = false;
  uploadedFile: any;

  constructor(public dialog: MatDialog, @Inject(MAT_DIALOG_DATA) data: any, private _formBuilder: FormBuilder,
    private _LocationService: LocationService,
    public manageService: ManageService,
    private dialogRef: MatDialogRef<AddLocationNotesDialogComponent>) {
    this.dialogData = data.locationaData;
    dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    this.hasSsuperTemUsers = this._LocationService.isUserHasSuperTEMUsersRole();

    this.setLocationNoteForm();
    this.getCustomerForUser();
    this.getLocationTypes();
    this.getLocationStatus();
    this.getCountry();

    if (this.dialogData) {
      this.setFormValue();
    }
  }

  countCharacters(): void {
    // Count the total number of characters including newlines (since \n is a character)
    this.characterCount = this.text.length;
  }

  setLocationNoteForm() {
    this.locationNotesForm = this._formBuilder.group({
      locationId: new FormControl('', [Validators.required]),
      noteText: new FormControl('', [Validators.required, Validators.maxLength(1000)]),
      privateNote: new FormControl(false, [Validators.required]),
      active: new FormControl(true, [Validators.required]),

      //disable data
      customer: new FormControl('', []),
      company: new FormControl('', []),
      locationtype: new FormControl('', []),
      status: new FormControl(10, []),
      locationName: new FormControl('', []),
      locationCode: new FormControl('', []),
      alias: new FormControl('', []),
      LocationTerm: new FormControl('', []),
      locationCustomField1: new FormControl('', []),
      locationCustomField2: new FormControl('', []),
      locationCustomField3: new FormControl('', []),
      locationCustomField4: new FormControl('', []),
      addressOne: new FormControl('', []),
      addressTwo: new FormControl('', []),
      city: new FormControl('', []),
      country: new FormControl('', []),
      state: new FormControl('', []),
      zip: new FormControl('', []),
      startDate: new FormControl('', []),
      endDate: new FormControl('', []),
    });
  }

  setFormValue() {
    this.setValueInFormControl('locationId', isValueExist(this.dialogData.LocationId));
    this.setValueInFormControl('locationtype', isValueExist(this.dialogData.LocationTypeId));
    this.setValueInFormControl('customer', isValueExist(this.dialogData.AccountId) ? this.dialogData.AccountId : this.dialogData?.Company?.AccountId);
    this.setValueInFormControl('company', isValueExist(this.dialogData.CompanyId));
    this.setValueInFormControl('status', isValueExist(this.dialogData.LocationStatusId));
    this.setValueInFormControl('LocationTerm', isValueExist(this.dialogData.LocationTermId) ? this.dialogData.LocationTermId : this.dialogData?.Location?.LocationTermId);
    this.setValueInFormControl('locationName', isValueExist(this.dialogData.LocationName) ? this.dialogData.LocationName : this.dialogData?.Location?.Name);
    this.setValueInFormControl('locationCode', isValueExist(this.dialogData.LocationCode) ? this.dialogData.LocationCode : this.dialogData?.Location?.LocationCode);
    this.setValueInFormControl('alias', isValueExist(this.dialogData.Alias) ? this.dialogData.Alias : this.dialogData?.Location?.Alias);
    this.setValueInFormControl('locationCustomField1', isValueExist(this.dialogData.LocationCustomField1) ? this.dialogData.LocationCustomField1 : this.dialogData?.Location?.LocationCustomField1);
    this.setValueInFormControl('locationCustomField2', isValueExist(this.dialogData.LocationCustomField2) ? this.dialogData.LocationCustomField2 : this.dialogData?.Location?.LocationCustomField2);
    this.setValueInFormControl('locationCustomField3', isValueExist(this.dialogData.LocationCustomField3) ? this.dialogData.LocationCustomField3 : this.dialogData?.Location?.LocationCustomField3);
    this.setValueInFormControl('locationCustomField4', isValueExist(this.dialogData.LocationCustomField4) ? this.dialogData.LocationCustomField4 : this.dialogData?.Location?.LocationCustomField4);
    this.setValueInFormControl('addressOne', isValueExist(this.dialogData.Address1) ? this.dialogData.Address1 : this.dialogData?.Location?.Address1);
    this.setValueInFormControl('addressTwo', isValueExist(this.dialogData.Address2) ? this.dialogData.Address2 : this.dialogData?.Location?.Address2);
    this.setValueInFormControl('city', isValueExist(this.dialogData.City) ? this.dialogData.City : this.dialogData?.Location?.City);
    this.setValueInFormControl('country', isValueExist(this.dialogData.CountryId) ? this.dialogData.CountryId : this.dialogData?.Location.State?.CountryId);
    this.setValueInFormControl('state', isValueExist(this.dialogData.StateId) ? this.dialogData.StateId : this.dialogData?.Location?.StateId);
    this.setValueInFormControl('zip', isValueExist(this.dialogData.PostalCode) ? this.dialogData.PostalCode : this.dialogData?.Location?.PostalCode);
    this.setValueInFormControl('startDate', this.dialogData.StartDate ? isValueExist(this.manageService.convertDate(this.dialogData.StartDate, '', '/')) : '');
    this.setValueInFormControl('endDate', this.dialogData.EndDate ? isValueExist(this.manageService.convertDate(this.dialogData.EndDate, '', '/')) : '');
    this.onCountrySelect();
    let id = this.dialogData.AccountId ? this.dialogData.AccountId : this.dialogData?.Company?.AccountId;
    this.getCompanyByCustomerId(id);
  }

  setValueInFormControl(key: any, value: any) {
    this.f[key].setValue(value);
  }

  get f() {
    return this.locationNotesForm.controls;
  }

  openFileUpload() {
    const dialogRef = this.dialog.open(FileUploadPopupComponent, {
      panelClass: 'width-665'
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (checkIsValueExists(result)) {
        this.selectedFileName = result[0].name;
        this.uploadedFile = result[0];
      } else {
        this.selectedFileName = 'File not selected';
        this.uploadedFile = [];
      }

    });
  }

  saveNotes() {
    this.isSubmit = true;
    if (this.locationNotesForm.valid) {
 
      // this.locationNotesForm.value.noteText = this.locationNotesForm.value.noteText.split(/\r?\n/).filter(line => line.trim() !== '').join('\n');
      this.locationNotesForm.value.noteText = this.locationNotesForm.value.noteText.replace(/\n/g, ' ');

      const formData = new FormData();
      if (this.selectedFileName) {
        formData.append('FileAttachment', this.uploadedFile);
      }
      formData.append('LocationId', this.locationNotesForm.value.locationId);
      formData.append('NoteText', this.locationNotesForm.value.noteText);
      formData.append('PrivateNote', this.locationNotesForm.value.privateNote);
      formData.append('Active', this.locationNotesForm.value.active);

      this.saveButtonDisabled = true;

      this._unsubscribeInventory.next(null);
      this._LocationService.saveLocationNotes(formData).pipe(takeUntil(this._unsubscribeInventory)).subscribe((response) => {
        this.saveButtonDisabled = false;
        if (response.Success) {
          this.errorPopup(response)
          this.dialogRef.close(true);
        } else {
          this.errorPopup(response)
        }
      }, error => {
        this.saveButtonDisabled = false;
        this.errorPopup(error);
      });
    }
  }

  errorPopup(data: any) {
    let errorData: any = {
      messgeType: 'error',
      title: 'Attention',
      titleClass: 'text-c-blue',
      icon: 'fas fa-exclamation-circle',
      iconClass: 'text-c-blue f-70',
      message: data.Message,
    };
    const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
      panelClass: 'error-warning',
      data: errorData,
    });
    dialogRef.afterClosed().subscribe((result) => {
    });
  }

  ngOnDestroy() {
    this._unsubscribeInventory.next(null);
    this._unsubscribeInventory.complete();
    this.getCustomer.next(null);
    this.getCustomer.complete();
    this._unsubscribeGetLocationType.next(null);
    this._unsubscribeGetLocationType.complete();
    this._unsubscribeGetLocationStatus.next(null);
    this._unsubscribeGetLocationStatus.complete();
    this._unsubscribeGetLocationTerm.next(null);
    this._unsubscribeGetLocationTerm.complete();
    this._unsubscribeCountry.next(null);
    this._unsubscribeCountry.complete();
    this._unsubscribeState.next(null);
    this._unsubscribeState.complete();
  }

  getCustomerForUser() {
    this.getCustomer.next(null);
    this.customers =  [];
    this._LocationService.getCustomerDropDown().pipe(takeUntil(this.getCustomer)).subscribe((data: any) => {
      if (data && data.$values) {
        this.customers = data.$values;
      }
    });
  }

  getCompanyByCustomerId(id: any) {
    this.companies = [];
    this._LocationService.getCompanyByCustomerId(id).subscribe((data: any) => {
      if (data && data.$values) {
        this.companies = data.$values;
      }
    }, error => {
      if (error.status === 404) {
        // this.locationService.showToster({ type: 'error', message: 'Something Wrong !' });
        let errorData: any = {
          messgeType: "error",
          title: "Attention",
          titleClass: "text-c-blue",
          icon: "fas fa-exclamation-circle",
          iconClass: "text-c-blue f-70",
          message: 'No company found within the selected customer' //if messges is multiple use array
        }
        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
      }
    });
  }


  getLocationTypes() {
    this._unsubscribeGetLocationType.next(null);
    this._LocationService.getLocationTypes().pipe(takeUntil(this._unsubscribeGetLocationType)).subscribe((data: any) => {
      if (data) {
        this.locationTypes = data.$values;
      }
    });
  }

  getLocationStatus() {
    this._unsubscribeGetLocationStatus.next(null);
    this._LocationService.getLocationStatus().pipe(takeUntil(this._unsubscribeGetLocationStatus)).subscribe((data: any) => {
      if (data) {
        this.locationStatus = data.$values;
      }
    });
  }

  getLocationTerms(){
    this._unsubscribeGetLocationTerm.next(null);
    this._LocationService.getLocationTerm().pipe(takeUntil(this._unsubscribeGetLocationTerm)).subscribe((data: any) => {
      if (data) {
        this.locationTerm = data.Data.$values;
      }
    });
  }

  getCountry() {
    this._unsubscribeCountry.next(null);
    this._LocationService.getCountries().pipe(takeUntil(this._unsubscribeCountry)).subscribe((data: any) => {
      if (data) {
        this.countries = data.$values;
      }
    });
  }

  
  onCountrySelect() {
    if (this.f['country'].value) {
      this._unsubscribeState.next(null);
      this._LocationService.getStates(this.f['country'].value).pipe(takeUntil(this._unsubscribeState)).subscribe((data: any) => {
        if (data) {
          this.states = data.$values;
        }
      }, error => {
        this.states = [];
      });
    }
  }
}
