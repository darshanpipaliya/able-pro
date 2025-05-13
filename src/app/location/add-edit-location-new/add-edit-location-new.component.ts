import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import * as _ from 'lodash';
import moment from 'moment';
import { checkIsValueExists, isValueExist, rolePermission } from 'src/app/services/helper';
import { LocationService } from 'src/app/services/location.service';
import { ManageService } from 'src/app/services/manage.service';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { CustomPipe } from 'src/app/custom-pipe/date.pipe';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-add-edit-location-new',
  templateUrl: './add-edit-location-new.component.html',
  styleUrls: ['./add-edit-location-new.component.scss'],
  providers: [MatDialog, ManageService, CustomPipe, DatePipe],
  imports: [
    SharedModule,
    PrimgModule
  ]
})
export class AddEditLocationNewComponent implements OnInit {

  private _unsubscribeState: Subject<any> = new Subject<any>();
  private _unsubscribeCountry: Subject<any> = new Subject<any>();
  private _unsubscribeGetCustomer: Subject<any> = new Subject<any>();
  private _unsubscribeGetCompanies: Subject<any> = new Subject<any>();
  private _unsubscribeGetLocationType: Subject<any> = new Subject<any>();
  private _unsubscribeGetLocationDetail: Subject<any> = new Subject<any>();
  private _unsubscribeGetLocationStatus: Subject<any> = new Subject<any>();
  private _unsubscribeGetLocationTerm: Subject<any> = new Subject<any>();
  private _unsubscribeNotes: Subject<any> = new Subject<any>();

  @Input() rowData: any;
  @Input() addData: any;
  @Input() update: any;
  @Input() selectedTem: any;
  @Input() action: any;
  @Input() clickOnSearchButton: any;
  @Input() selectedWiseTemDD: any;
  @Input() selected: any;

  states: any = [];
  countries: any = [];

  customers: any = [];
  companies: any = [];
  locationTypes: any = [];
  locationStatus: any = [];
  locationTerm: any = [];
  notesRowData: any[];
  cols: any[];
  locationForm: FormGroup;
  mailingAddressForm: FormGroup;
  endMinDate: any = null;
  allowEndDate: boolean;
  customersLoader = false;

  saveButtonLoadder = false;
  public isSubmit = false;
  companyDetailData: any;
  dataAvailble = false;
  loadingAPI = true;
  isCompanyUser: boolean = false;
  isTEMUser: boolean = false;
  isCheckboxChecked = false;
  viewNEdit = false;
  disabledSaveBtn = false;
  setTemDDValue: any;

  maillingStates: any = [];
  maillingCountries: any = [];

  locationResponse = {
    MailingPostalCode: 'MailingPostalCode',
    Address1: 'Address1',
    Address2: 'Address2',
    MailingAddress2: 'MailingAddress2',
    MailingAddress1: 'MailingAddress1',
    LocationCustomField4: 'LocationCustomField4',
    LocationCustomField3: 'LocationCustomField3',
    LocationCustomField2: 'LocationCustomField2',
    LocationCustomField1: 'LocationCustomField1',
    Alias: 'Alias',
    LocationCode: 'LocationCode',
    PostalCode: 'PostalCode',
    StateId: 'StateId',
    City: 'City',
    MailingCity: 'MailingCity',
    Name: 'Name'
  }
  @Output() onLocationUpdateEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() onLocationComponetDestroy: EventEmitter<any> = new EventEmitter<any>();
  @Output() onLocationAddEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() contactDataEmit: EventEmitter<any> = new EventEmitter<any>();
  @Output() diabledEmit: EventEmitter<any> = new EventEmitter<any>();
  @Output() currentOpenEditPage: EventEmitter<any> = new EventEmitter<any>();
  @Output() setTemDDValueEvent: EventEmitter<any> = new EventEmitter<any>();
  CompanyRoles = rolePermission(['CompanyAdmin', 'CustomerAdmin']);
  @Output() setClickFalse: EventEmitter<any> = new EventEmitter<any>();

  constructor(private locationService: LocationService, public manageService: ManageService,
    public dialog: MatDialog) {

    this.cols = [
      { field: 'LocationNoteCreatedDate', header: 'Date' },
      { field: 'Notes', header: 'Note' },
      { field: 'attachment', header: 'Attachment' }
    ];

    this.setFormGroup();
  }

  setFormGroup() {
    this.locationForm = new FormGroup({
      customer: new FormControl('', [Validators.required]),
      company: new FormControl('', [Validators.required]),
      locationtype: new FormControl('', [Validators.required]),
      status: new FormControl(10, [Validators.required]),
      locationName: new FormControl('', [Validators.maxLength(100), Validators.required]),
      locationCode: new FormControl('', [Validators.maxLength(50), ]),
      alias: new FormControl('', [Validators.maxLength(100)]),
      LocationTerm: new FormControl('', []),
      locationCustomField1: new FormControl('', [Validators.maxLength(120), ]),
      locationCustomField2: new FormControl('', [Validators.maxLength(120), ]),
      locationCustomField3: new FormControl('', [Validators.maxLength(120), ]),
      locationCustomField4: new FormControl('', [Validators.maxLength(120), ]),
      addressOne: new FormControl('', [Validators.maxLength(120), Validators.required]),
      addressTwo: new FormControl('', [Validators.maxLength(120), ]),
      city: new FormControl('', [Validators.maxLength(100), Validators.required]),
      country: new FormControl('', [Validators.required]),
      state: new FormControl('', [Validators.required]),
      zip: new FormControl('', [Validators.maxLength(10), Validators.required]),
      startDate: new FormControl('', [Validators.required]),
      endDate: new FormControl('', []),
      locationId: new FormControl({ value: '', disabled: true }),
    });

    this.mailingAddressForm = new FormGroup({
      mailingAddress1: new FormControl('', [Validators.maxLength(120), Validators.required]),
      mailingAddress2: new FormControl('' , [Validators.maxLength(120), ]),
      mailingCity: new FormControl('', [Validators.maxLength(50), Validators.required]),
      mailingCountry: new FormControl('', [Validators.required]),
      mailingStateId: new FormControl('', [Validators.required]),
      mailingPostalCode: new FormControl('', [Validators.maxLength(10), Validators.required])
    });
  }

  setAddData() {
    if (this.addData) {
      this.setValueInFormControl('customer', isValueExist(this.addData.customer.value));
      this.setValueInFormControl('company', isValueExist(this.addData.company.value));
      this.setValueInFormControl('locationtype', isValueExist(this.addData.locationtype.value));
      this.setValueInFormControl('status', isValueExist(this.addData.status.value));
      this.setValueInFormControl('locationName', isValueExist(this.addData.locationName.value));
      this.setValueInFormControl('locationCode', isValueExist(this.addData.locationCode.value));
      this.setValueInFormControl('alias', isValueExist(this.addData.alias.value));
      this.setValueInFormControl('LocationTerm', isValueExist(this.addData.LocationTerm.value));
      this.setValueInFormControl('locationCustomField1', isValueExist(this.addData.locationCustomField1.value));
      this.setValueInFormControl('locationCustomField2', isValueExist(this.addData.locationCustomField2.value));
      this.setValueInFormControl('locationCustomField3', isValueExist(this.addData.locationCustomField3.value));
      this.setValueInFormControl('locationCustomField4', isValueExist(this.addData.locationCustomField4.value));
      this.setValueInFormControl('addressOne', isValueExist(this.addData.addressOne.value));
      this.setValueInFormControl('addressTwo', isValueExist(this.addData.addressTwo.value));
      this.setValueInFormControl('city', isValueExist(this.addData.city.value));
      this.setValueInFormControl('country', isValueExist(this.addData.country.value));
      this.setValueInFormControl('state', isValueExist(this.addData.state.value));
      this.setValueInFormControl('zip', isValueExist(this.addData.zip.value));
      this.setValueInFormControl('startDate', isValueExist(this.addData.startDate.value));
      this.setValueInFormControl('endDate', isValueExist(this.addData.endDate.value));

      this.getCompanyByCustomerId(this.addData.customer.value);
    }
  }
  setEndDate() {
    this.allowEndDate = true;
    let date: any = this.update ? new Date(this.locationForm.value.startDate) : this.locationForm.value.startDate;
    this.endMinDate = new Date(date.getTime());
    this.endMinDate.setDate(this.endMinDate.getDate());
  }
  setFromGroupData(data: { SameMailAddress: any; Address1: any; Address2: any; City: any; CountryId: any; StateId: any; PostalCode: any; MailingAddress1: any; MailingAddress2: any; MailingAddressCity: any; MailingAddressCountryId: any; MailingAddressStateId: any; MailingAddressPostalCode: any; LocationTypeId: any; AccountId: any; CompanyId: any; LocationStatusId: any; LocationTermId: any; LocationName: any; LocationCode: any; Alias: any; LocationCustomField1: any; LocationCustomField2: any; LocationCustomField3: any; LocationCustomField4: any; StartDate: any; EndDate: any; Id: any; }) {
    if (isValueExist(data.SameMailAddress) == true) {
      this.isCheckboxChecked = true;
      this.setMailingFormCOntrol('mailingAddress1', isValueExist(data.Address1));
      this.setMailingFormCOntrol('mailingAddress2', isValueExist(data.Address2));
      this.setMailingFormCOntrol('mailingCity', isValueExist(data.City));
      this.setMailingFormCOntrol('mailingCountry', isValueExist(data.CountryId));
      this.setMailingFormCOntrol('mailingStateId', isValueExist(data.StateId));
      this.setMailingFormCOntrol('mailingPostalCode', isValueExist(data.PostalCode));
      this.mailingAddressForm.disable();
    } else {
      this.setMailingFormCOntrol('mailingAddress1', isValueExist(data.MailingAddress1));
      this.setMailingFormCOntrol('mailingAddress2', isValueExist(data.MailingAddress2));
      this.setMailingFormCOntrol('mailingCity', isValueExist(data.MailingAddressCity));
      this.setMailingFormCOntrol('mailingCountry', isValueExist(data.MailingAddressCountryId));
      this.setMailingFormCOntrol('mailingStateId', isValueExist(data.MailingAddressStateId));
      this.setMailingFormCOntrol('mailingPostalCode', isValueExist(data.MailingAddressPostalCode));
    }

    this.setValueInFormControl('locationtype', isValueExist(data.LocationTypeId));
    this.setValueInFormControl('customer', isValueExist(data.AccountId));
    this.setValueInFormControl('company', isValueExist(data.CompanyId));
    this.setValueInFormControl('status', isValueExist(data.LocationStatusId));

    this.setValueInFormControl('LocationTerm', isValueExist(data.LocationTermId));

    this.setValueInFormControl('locationName', isValueExist(data.LocationName));
    this.setValueInFormControl('locationCode', isValueExist(data.LocationCode));
    this.setValueInFormControl('alias', isValueExist(data.Alias));
    this.setValueInFormControl('locationCustomField1', isValueExist(data.LocationCustomField1));
    this.setValueInFormControl('locationCustomField2', isValueExist(data.LocationCustomField2));
    this.setValueInFormControl('locationCustomField3', isValueExist(data.LocationCustomField3));
    this.setValueInFormControl('locationCustomField4', isValueExist(data.LocationCustomField4));
    this.setValueInFormControl('addressOne', isValueExist(data.Address1));
    this.setValueInFormControl('addressTwo', isValueExist(data.Address2));
    this.setValueInFormControl('city', isValueExist(data.City));
    this.setValueInFormControl('country', isValueExist(data.CountryId));
    this.setValueInFormControl('state', isValueExist(data.StateId));
    this.setValueInFormControl('zip', isValueExist(data.PostalCode));

    this.setValueInFormControl('startDate', data.StartDate ? isValueExist(this.manageService.convertDate(data.StartDate, '', '/')) : '');
    this.setValueInFormControl('endDate', data.EndDate ? isValueExist(this.manageService.convertDate(data.EndDate, '', '/')) : '');
    this.setValueInFormControl('locationId', isValueExist(data.Id));
    this.setEndDate();
    this.onCountrySelect();
    this.getCompanyByCustomerId(data.AccountId);

  }

  streetAddress(event: { target: { value: any; }; }) {
    this.isCheckboxChecked == true ? this.mailingAddressForm.patchValue({ 'mailingAddress1': event.target.value }) : '';
  }

  streetAddressTwo(event: { target: { value: any; }; }) {
    this.isCheckboxChecked == true ? this.mailingAddressForm.patchValue({ 'mailingAddress2': event.target.value }) : '';
  }

  cityChange(event: { target: { value: any; }; }) {
    this.isCheckboxChecked == true ? this.mailingAddressForm.patchValue({ 'mailingCity': event.target.value }) : '';
  }

  get f() {
    return this.locationForm.controls;
  }
  get fm() {
    return this.mailingAddressForm.controls;
  }
  setValueInFormControl(key: string, value: any) {
    this.f[key].setValue(value);
  }

  setMailingFormCOntrol(key: string, value: any) {
    this.fm[key].setValue(value);
  }

  ngOnInit(): void {
    this.currentOpenEditPage.emit(this.update);
    this.viewNEdit = rolePermission(['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser', 'SuperTEM', 'CustomerAdmin', 'CompanyAdmin', 'TEMAdmin', 'TEMUser', 'TEMManager']);
    if (!this.viewNEdit && !this.CompanyRoles) {
      this.locationForm.disable();
      this.mailingAddressForm.disable();
    }
    this.isCompanyUser = this.locationService.isUserCompanyUser();
    this.isTEMUser = this.locationService.isUserHasTEMUserRole();
    this.getCustomers();
    this.getCountry();
    this.getLocationTypes();
    this.getLocationStatus();
    this.getLocationTerms();

    if (!this.update) {
      this.loadingAPI = false;
      this.setAddData();
    } else {
      this.getLocationData();
      this.getLocationNotes();
    }

    if (this.isCompanyUser) {
      this.locationForm.disable();
      this.mailingAddressForm.disable();
      this.disabledSaveBtn = true;
    }
  }
  ngOnChanges(changes: { [x: string]: { [x: string]: any; }; }) {
    if (this.clickOnSearchButton && changes && changes['clickOnSearchButton'] && changes['clickOnSearchButton']['currentValue']) {
      this.getCustomers();
      this.clickOnSearchButton = false;
      this.setClickFalse.emit(false);
    }
  }
  getCountry() {
    this._unsubscribeCountry.next(null);
    this.locationService.getCountries().pipe(takeUntil(this._unsubscribeCountry)).subscribe((data: any) => {
      if (data) {
        this.countries = data.$values;
        this.maillingCountries = data.$values;
        if (this.update) {
          this.onCountrySelect();
        }
      }
    });
  }

  getLocationTerms() {
    this._unsubscribeGetLocationTerm.next(null);
    this.locationService.getLocationTerm().pipe(takeUntil(this._unsubscribeGetLocationTerm)).subscribe((data: any) => {
      if (data) {
        this.locationTerm = data.Data.$values;
      }
    });
  }

  onCountrySelect(clickFromMailiingAddress = false) {
    if (this.f['country'].value) {
      this.isCheckboxChecked == true ? this.mailingAddressForm.patchValue({ 'mailingCountry': this.f['country'].value }) : '';

      this._unsubscribeState.next(null);
      this.locationService.getStates(clickFromMailiingAddress ? this.fm['mailingCountry'].value : this.f['country'].value).pipe(takeUntil(this._unsubscribeState)).subscribe((data: any) => {
        if (data) {
          if (!clickFromMailiingAddress) {
            this.states = data.$values;
            if (this.isCheckboxChecked) {
              this.maillingStates = data.$values;
            }
          } else {
            this.maillingStates = data.$values;
          }
        }
      }, (error: any) => {
        this.states = [];
        this.maillingStates = [];
      });
    }
  }

  onStateChange(event: { value: any; }) {
    this.isCheckboxChecked == true ? this.mailingAddressForm.patchValue({ 'mailingStateId': event.value }) : '';
  }

  postalChange(event: { target: { value: any; }; }) {
    this.isCheckboxChecked == true ? this.mailingAddressForm.patchValue({ 'mailingPostalCode': event.target.value }) : '';
  }

  getCustomers(id = '') {
    const idd = id ? Number(id) : this.action === 'Add' ? this.selectedWiseTemDD[this.selected]?.id : id;

    this.customers = [];
    if (idd && idd !== 'all') {
      this.customers = [];
      this.customersLoader = true;
      this.locationService.getCustomerDropdownByNewTEM(idd).subscribe((data: { Data: { $values: any; }; }) => {
        if (data && data.Data.$values) {
          this.customersLoader = false;
          this.customers = data.Data.$values;
          this.setTemDDValueEvent.emit(idd);
        } else {
          this.customers = [];
          this.customersLoader = false;
          this.setTemDDValueEvent.emit(idd);
        }
      }, (error: any) => {
        this.customers = [];
        this.customersLoader = false;
        this.setTemDDValueEvent.emit(idd);
      });
    } else {
      this.customersLoader = true;
      this._unsubscribeGetCustomer.next(null);
      this.locationService.getCustomerDropDown().pipe(takeUntil(this._unsubscribeGetCustomer)).subscribe((data: any) => {
        if (data) {
          this.customersLoader = false;
          this.customers = data.$values;
          this.setTemDDValueEvent.emit((this.action === 'Add' && this.selectedWiseTemDD[this.selected]?.id === 'all') ? 'all' : idd);

          if (this.rowData) {
            const id = this.rowData.AccountId ? this.rowData.AccountId : this.rowData.Company.AccountId;
            if (this.update) {
              const data1 = this.customers.find((res: { Id: any; }) => res.Id === id);
              this.setTemDDValue = data1.TemAccountID;
              this.setTemDDValueEvent.emit(this.setTemDDValue);
              this.getCompanyByCustomerId(this.f['customer'].value, true);
            }
          }
        } else {
          this.customers = [];
          this.customersLoader = false;
        }
      }, (error: any) => {
        this.customers = [];
        this.customersLoader = false;
      });
    }

  }

  getLocationTypes() {
    this._unsubscribeGetLocationType.next(null);
    this.locationService.getLocationTypes().pipe(takeUntil(this._unsubscribeGetLocationType)).subscribe((data: any) => {
      if (data) {
        this.locationTypes = data.$values;
      }
    });
  }

  getLocationStatus() {
    this._unsubscribeGetLocationStatus.next(null);
    this.locationService.getLocationStatus().pipe(takeUntil(this._unsubscribeGetLocationStatus)).subscribe((data: any) => {
      if (data) {
        this.locationStatus = data.$values;
      }
    });
  }

  getLocationNotes() {
    const data = {
      "locationId": this.rowData.LocationId,
      "privateNote": false,
      "status": true,
      "isNeed3RecordOnly": true
    }
    this._unsubscribeNotes.next(null);
    this.locationService.getLocationnotes(data).pipe(takeUntil(this._unsubscribeNotes)).subscribe((res: any) => {
      if (res && res.Success) {
        this.notesRowData = res.Data.$values;

        _.map(this.notesRowData, (res: any) => {
          if (res['LocationNoteCreatedDate']) {
            const d = res;
            let str = res['LocationNoteCreatedDate'];
            let array = str.split('T');
            d['LocationNoteCreatedDate'] = moment(res['LocationNoteCreatedDate']).format('MM/DD/YYYY');
            return d;
          }
        });
      } else {
        this.notesRowData = [];
      }
    }, (error: any) => {
      this.notesRowData = [];
    });
  }

  downloadLocationAttachment(rowData: { LocationNoteId: any; UploadFileName: string; }) {
    this.locationService.downloadLocationNotes(rowData.LocationNoteId).subscribe({
      next: (dataa: Blob | MediaSource) => {
        let bolbUrl = URL.createObjectURL(dataa);
        var link = document.createElement("a");
        link.setAttribute("href", bolbUrl);

        link.setAttribute("download", rowData.UploadFileName);
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
      error: (error: any) => {

      }
    });
  }

  onCustomerSelect() {
    this.f['company'].setValue('');
    if (this.update) {
      this.getCompanyByCustomerId(this.rowData.Company.Account.Id, true);
    } else {
      this.getCompanyByCustomerId(this.f['customer'].value, true);
    }
  }
  getCompanyByCustomerId(id: any, clickFromHtml = false) {
    if (checkIsValueExists(id)) {
      this.locationService.getCompanyByCustomerId(id).pipe(takeUntil(this._unsubscribeGetCompanies)).subscribe((data: { $values: string | any[]; }) => {
        if (data && data.$values && data.$values.length > 0) {
          this.companies = data.$values;
        } else {
          this.companies = [];
        }
      }, (error: any) => {
        this.companies = [];
      });
    }
  }


  async getLocationData() {
    const id = this.rowData.Id ? this.rowData.Id : this.rowData.CompanyLocationId
    if (id) {
      this.diabledEmit.emit(true);
      this.loadingAPI = true;
      this._unsubscribeGetLocationDetail.next(null);
      this.locationService.getCompanyLocationDetail(id).pipe(takeUntil(this._unsubscribeGetLocationDetail)).subscribe({
        next: (data: { Data: any; }) => {
          this.companyDetailData = data.Data;
          this.contactDataEmit.emit(data.Data);
          this.diabledEmit.emit(false);
          this.loadingAPI = false;

          this.dataAvailble = data ? true : false
          this.setFromGroupData(data.Data);
        },
        error: (error: any) => {
          this.loadingAPI = false;
        }
      });
    } else {
      this.loadingAPI = false;
    }
  }

  getCompanyLocationDetail(id: any) {
    const isPrime = new Promise<string>((res, rej) => {
      this._unsubscribeGetLocationDetail.next(null);
      this.locationService.getCompanyLocationDetail(id).pipe(takeUntil(this._unsubscribeGetLocationDetail))
        .toPromise()
        .then((data: any) => {
          if (data) {
            res(data.Data);
          } else {
            rej(data.Data);
          }
        });
    });
    return isPrime;
  }

  onselectSetDate($event: { toString: () => string | string[]; }) {
    if ($event && !$event.toString().includes('/')) {
      let d: any = $event;
      let dd = d.getDate();
      let mm = d.getMonth() + 1;
      let yy = d.getFullYear();

      let userAgent = navigator.userAgent;
      let browserName;

      if (userAgent.match(/chrome|chromium|crios/i)) {
        browserName = "chrome";
      } else if (userAgent.match(/firefox|fxios/i)) {
        browserName = "firefox";
      } else if (userAgent.match(/safari/i)) {
        browserName = "safari";
      } else if (userAgent.match(/opr\//i)) {
        browserName = "opera";
      } else if (userAgent.match(/edg/i)) {
        browserName = "edge";
      } else {
        browserName = "No browser detection";
      }

      if (browserName === 'firefox') {
        return isValueExist(this.manageService.convertDate(`${mm}-${dd}-${yy}`, 'saveDatePicker', '/'));
      } else {
        return isValueExist(this.manageService.convertDate(`${mm}-${dd}-${yy}T0000`, 'saveDatePicker', '/'));
      }
    } else {
      return isValueExist(this.manageService.convertDate(`${$event}T0000`, 'saveDatePicker', '/'));
    }
  }
  save() {
    this.isSubmit = true;
    let checkMailForm = this.mailingAddressForm.disabled ? true : this.mailingAddressForm.valid;
    if (this.locationForm.valid && checkMailForm) {
      if (this.locationForm.value.endDate !== '') {
        let startDateVal = new Date(this.locationForm.value.startDate);
        let endDateVal = new Date(this.locationForm.value.endDate);
        if (startDateVal > endDateVal) {
          let errorData: any = {
            messgeType: "error",
            title: "Attention",
            titleClass: "text-c-blue",
            icon: "fas fa-exclamation-circle",
            iconClass: "text-c-blue f-70",
            message: "End date should be greater than Start date"
          }
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
          return
        }
      }
      if (this.update) {
        this.saveButtonLoadder = true;
        const updatedLocation = {
          "name": this.f['locationName'].value,
          "address1": this.f['addressOne'].value,
          "address2": this.f['addressTwo'].value,
          "city": this.f['city'].value,
          "stateId": this.f['state'].value,
          "postalCode": this.f['zip'].value,
          "locationCode": this.f['locationCode'].value,
          "alias": this.f['alias'].value,
          "LocationTermId": this.f['LocationTerm'].value ? this.f['LocationTerm'].value : null,
          "locationCustomField1": this.f['locationCustomField1'].value,
          "locationCustomField2": this.f['locationCustomField2'].value,
          "locationCustomField3": this.f['locationCustomField3'].value,
          "locationCustomField4": this.f['locationCustomField4'].value,
          "active": (this.f['status'].value == 10 || this.f['status'].value == '10') ? true : false,
          "sameMailAddress": this.isCheckboxChecked == true ? true : false,
          "mailingAddress1": this.fm['mailingAddress1'].value,
          "mailingAddress2": this.fm['mailingAddress2'].value,
          "mailingCity": this.fm['mailingCity'].value,
          "mailingStateId": this.fm['mailingStateId'].value,
          "mailingPostalCode": this.fm['mailingPostalCode'].value,
          "CompanyLocationId": this.companyDetailData.Id
        }

        const updateCompanyLocation = {
          "CompanyId": this.f['company'].value,
          "locationId": (this.rowData.LocationId) ? this.rowData.LocationId : this.companyDetailData.LocationId,
          "LocationTypeId": this.f['locationtype'].value,
          "primary": true,
          "LocationStatusId": this.f['status'].value,
          "StartDate": _.cloneDeep(this.onselectSetDate(this.f['startDate'].value)),
          "EndDate": this.f['endDate'].value ? this.onselectSetDate(this.f['endDate'].value) : null
        }
        this.locationService.updateLocation(this.companyDetailData.LocationId, updatedLocation).subscribe({

          next: (datas: any) => {
            this.locationService.updateCompanyLocation(this.companyDetailData.Id, updateCompanyLocation).subscribe({
              next: (data: any) => {
                this.saveButtonLoadder = false;
                let errorData: any = {
                  messgeType: "error",
                  title: "Attention",
                  titleClass: "text-c-blue",
                  icon: "fas fa-exclamation-circle",
                  iconClass: "text-c-blue f-70",
                  message: "Successfully saved"
                }
                const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
                dialogRef.afterClosed().subscribe(result => {
                  window.scrollTo(0, 0);
                  this.onLocationUpdateEvent.emit(updatedLocation);
                });
              },
              error: (error: { status: number; error: any; }) => {
                this.saveButtonLoadder = false;
                let errorMessage: any = '';
                if (error.status === 400) {
                  errorMessage = error.error ? error.error : 'Bad request';
                  let errorData: any = {
                    messgeType: "error",
                    title: "Attention",
                    titleClass: "text-c-blue",
                    icon: "fas fa-exclamation-circle",
                    iconClass: "text-c-blue f-70",
                    message: errorMessage
                  }
                  const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
                  dialogRef.afterClosed().subscribe(result => {
                    window.scrollTo(0, 0);
                  });
                }
              }
            });
          },
          error: (error: { status: number; error: { errors: any; }; }) => {
            this.saveButtonLoadder = false;
            let errorMessage: any = '';
            if (error.status === 400) {

              if (error.error.errors) {
                this.errorObjectEntries(error.error.errors)
                  .map(([key, value]) => {
                    if (this.locationResponse.hasOwnProperty(key)) {
                      errorMessage += `${value}`
                    }
                  });
                errorMessage = error.error.errors ? errorMessage : error.error;

                let errorData: any = {
                  messgeType: "error",
                  title: "Attention",
                  titleClass: "text-c-blue",
                  icon: "fas fa-exclamation-circle",
                  iconClass: "text-c-blue f-70",
                  message: this.tooltip(errorMessage.replace(/\./g, '<br>')),
                  innerHtml: true
                }
                const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
                dialogRef.afterClosed().subscribe(result => {
                  window.scrollTo(0, 0);
                });
              } else {
                let errorData: any = {
                  messgeType: "error",
                  title: "Attention",
                  titleClass: "text-c-blue",
                  icon: "fas fa-exclamation-circle",
                  iconClass: "text-c-blue f-70",
                  message: error.error,
                }
                const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });

              }
            }
          }
        })
      } else {
        this.saveButtonLoadder = true;
        let data: any = {};
        data['EndDate'] = this.f['endDate'].value ? this.onselectSetDate(this.f['endDate'].value) : null;
        data['StartDate'] = this.onselectSetDate(this.f['startDate'].value);
        data['companyId'] = this.f['company'].value;
        data['LocationTypeId'] = this.f['locationtype'].value;
        data['LocationStatusId'] = this.f['status'].value;
        data['location'] = {};
        data['location']['LocationCustomField1'] = this.f['locationCustomField1'].value;
        data['location']['LocationCustomField2'] = this.f['locationCustomField2'].value;
        data['location']['LocationCustomField3'] = this.f['locationCustomField3'].value;
        data['location']['LocationCustomField4'] = this.f['locationCustomField4'].value;
        data['location']['Alias'] = this.f['alias'].value;
        data['location']['LocationTermId'] = this.f['LocationTerm'].value ? this.f['LocationTerm'].value : null;
        data['location']['LocationCode'] = this.f['locationCode'].value;
        data['location']['StateId'] = this.f['state'].value;
        data['location']['PostalCode'] = this.f['zip'].value;
        data['location']['Address1'] = this.f['addressOne'].value;
        data['location']['City'] = this.f['city'].value;
        data['location']['Address2'] = this.f['addressTwo'].value;
        data['location']['Name'] = this.f['locationName'].value;
        data['location']['sameMailAddress'] = this.isCheckboxChecked == true ? true : false;
        data['location']['mailingAddress1'] = this.fm['mailingAddress1'].value,
          data['location']['mailingAddress2'] = this.fm['mailingAddress2'].value,
          data['location']['mailingCity'] = this.fm['mailingCity'].value,
          data['location']['mailingStateId'] = this.fm['mailingStateId'].value,
          data['location']['mailingPostalCode'] = this.fm['mailingPostalCode'].value

        this.locationService.saveLocation(data['location']).subscribe({
          next: (result: { Id: any; }) => {
            data['LocationId'] = result.Id;
            this.locationService.saveCompanyLocation(data).subscribe({
              next: (data: any) => {
                this.saveButtonLoadder = false;
                let errorData: any = {
                  messgeType: "error",
                  title: "Attention",
                  titleClass: "text-c-blue",
                  icon: "fas fa-exclamation-circle",
                  iconClass: "text-c-blue f-70",
                  message: "Successfully saved" //if messges is multiple use array
                }
                const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
                dialogRef.afterClosed().subscribe(dialogRes => {
                  window.scrollTo(0, 0);

                  this.onLocationAddEvent.emit(data);
                });
              },
              error: (error: { status: number; error: any; }) => {
                this.saveButtonLoadder = false;

                let errorMessage: any = '';
                if (error.status === 400) {
                  errorMessage = error.error ? error.error : 'Bad request';
                  let errorData: any = {
                    messgeType: "error",
                    title: "Attention",
                    titleClass: "text-c-blue",
                    icon: "fas fa-exclamation-circle",
                    iconClass: "text-c-blue f-70",
                    message: errorMessage
                  }
                  const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
                  dialogRef.afterClosed().subscribe(result => {
                    window.scrollTo(0, 0);

                  });
                }
              }
            });
          },
          error: (error: { status: number; error: { errors: any; }; }) => {
            this.saveButtonLoadder = false;
            let errorMessage: any = '';
            if (error.status === 400) {
              this.errorObjectEntries(error.error.errors)
                .map(([key, value]) => {
                  if (this.locationResponse.hasOwnProperty(key)) {
                    errorMessage += `${value}`
                  }
                });
              errorMessage = error.error.errors ? errorMessage : error.error;

              let errorData: any = {
                messgeType: "error",
                title: "Attention",
                titleClass: "text-c-blue",
                icon: "fas fa-exclamation-circle",
                iconClass: "text-c-blue f-70",
                message: this.tooltip(errorMessage.replace(/\./g, '<br>')),
                innerHtml: true
              }
              const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
              dialogRef.afterClosed().subscribe(result => {
                window.scrollTo(0, 0);
              });
            }
          }
        });
      }
    }
  }
  ngOnDestroy(): any {
    this._unsubscribeGetLocationDetail.next(null);
    this._unsubscribeGetLocationDetail.complete();
    this._unsubscribeGetCustomer.next(null);
    this._unsubscribeGetCustomer.complete();
    this._unsubscribeGetCompanies.next(null);
    this._unsubscribeGetCompanies.complete();
    this._unsubscribeCountry.next(null);
    this._unsubscribeCountry.complete();
    this._unsubscribeState.next(null);
    this._unsubscribeState.complete();
    this._unsubscribeGetLocationType.next(null);
    this._unsubscribeGetLocationType.complete();
    this._unsubscribeGetLocationStatus.next(null);
    this._unsubscribeGetLocationStatus.complete();
    this._unsubscribeGetLocationTerm.next(null);
    this._unsubscribeGetLocationTerm.complete();
    this._unsubscribeNotes.next(null);
    this._unsubscribeNotes.complete();
    this.onLocationComponetDestroy.emit(this.f);
    // this.setTemDDValue = 'all';
    this.setTemDDValueEvent.emit('');

  }

  errorObjectEntries<K>(object: any) {
    return (Object.keys(object) as (keyof K)[])
      .filter((key) => object[key] !== undefined && object[key] !== null)
      .map(
        key => ([
          key,
          object[key],
        ] as [keyof K, Required<K>[keyof K]]),
      );
  }

  tooltip(data: any) {
    return `<span >${data} </span>`;
  }

  setLocationAddress(event: { target: { checked: any; }; }) {

    if (event.target.checked) {
      this.isCheckboxChecked = true;
      this.mailingAddressForm.patchValue({ 'mailingAddress1': this.locationForm.value.addressOne });
      this.mailingAddressForm.patchValue({ 'mailingAddress2': this.locationForm.value.addressTwo });
      this.mailingAddressForm.patchValue({ 'mailingCity': this.locationForm.value.city });
      this.mailingAddressForm.patchValue({ 'mailingCountry': this.locationForm.value.country });
      this.mailingAddressForm.patchValue({ 'mailingStateId': this.locationForm.value.state });
      this.mailingAddressForm.patchValue({ 'mailingPostalCode': this.locationForm.value.zip });
      this.mailingAddressForm.disable();
      this.onCountrySelect(true);
    } else {
      this.isCheckboxChecked = false;
      this.mailingAddressForm.reset();
      this.mailingAddressForm.enable();
      this.maillingStates = [];
    }
  }


}
