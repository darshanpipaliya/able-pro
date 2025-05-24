import { Component, Inject, Input, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { LocationService } from 'src/app/services/location.service';
import { checkIsValueExists, isValueExist } from 'src/app/services/helper';
import { FileUploadPopupComponent } from 'src/app/common/file-upload-popup/file-upload-popup.component';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { SpaceTrimStartEndInputirective } from 'src/app/custom-directives/custom-validation.directive';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';

@Component({
  selector: 'app-add-people-notes-dialog',
  templateUrl: './add-people-notes-dialog.component.html',
  styleUrls: ['./add-people-notes-dialog.component.scss'],
  imports: [
    PrimgModule,
    SharedModule,
    SpaceTrimStartEndInputirective
  ]
})
export class AddPeopleNotesDialogComponent implements OnInit {

  peopleNotesForm: FormGroup;
  isSubmit: boolean = false;
  hasSsuperTemUsers: boolean = false;

  dialogData: any;
  contacttypes: any = [];
  customers: any = [];
  companies: any = [];
  managerList: any = [];

  blockEmailList = [
    { Id: true, Name: 'Yes' },
    { Id: false, Name: 'No' },
  ];

  statusList = [
    { Id: true, Name: 'Active' },
    { Id: false, Name: 'Inactive' },
  ];

  selectedFileName = '';
  addInventoryNote: any;
  private _unsubscribeInventory: Subject<any> = new Subject<any>();
  private _unsubscribeContact: Subject<any> = new Subject<any>();
  private getCustomer: Subject<any> = new Subject<any>();
  private _unsubscribeManagerPeople: Subject<any> = new Subject<any>();

  saveButtonDisabled = false;
  uploadedFile: any;
  parentServiceID: any;

  constructor(public dialog: MatDialog, @Inject(MAT_DIALOG_DATA) data :any, private _formBuilder: FormBuilder,
    private _LocationService: LocationService,
    private dialogRef: MatDialogRef<AddPeopleNotesDialogComponent>) {
    this.dialogData = data.peopleData;
    this.parentServiceID = data.parentServiceID;
    dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    this.hasSsuperTemUsers = this._LocationService.isUserHasSuperTEMUsersRole();

    // this.peopleNotesForm.disable();
    this.setInventoryNoteForm();
    this.getcontacttypes();
    this.getCustomerForUser();
    if (this.dialogData) {
      this.setFormValue();
    }
  }

  setInventoryNoteForm() {
    this.peopleNotesForm = this._formBuilder.group({
      peopleId: new FormControl('', [Validators.required]),
      noteText: new FormControl('', [Validators.required, Validators.maxLength(1000)]),
      // customerId: new FormControl('', [Validators.required]),
      privateNote: new FormControl(false, [Validators.required]),
      active: new FormControl(true, [Validators.required]),

      //disable data
      accountId: new FormControl(''),
      companyId: new FormControl(''),
      userFirstName: new FormControl(''),
      userLastName: new FormControl(''),
      emailAddress: new FormControl(''),
      blockEmail: new FormControl(''),
      cellPhone: new FormControl(''),
      userDeskPhone: new FormControl(''),
      employeeId: new FormControl(''),
      managerId: new FormControl(''),
      userTitle: new FormControl(''),
      department: new FormControl(''),
      active2: new FormControl(''),
      customerContactTypeId: new FormControl(''),
      contactCustomField1: new FormControl(''),
      contactCustomField2: new FormControl(''),
      contactCustomField3: new FormControl(''),
      contactCustomField4: new FormControl('')
    });
  }

  setFormValue() {
    this.getUserompaniesByAccountId(this.dialogData.CustomerAccountId);
    this.getManagerofPeople(this.dialogData.CustomerAccountId);

    this.setValueInFormControl('peopleId', isValueExist(this.dialogData.PeopleId));
    this.setValueInFormControl('accountId', isValueExist(this.dialogData.CustomerAccountId));
    this.setValueInFormControl('companyId', isValueExist(this.dialogData.CompanyId));
    this.setValueInFormControl('userFirstName', isValueExist(this.dialogData.PeopleFirstName));
    this.setValueInFormControl('userLastName', isValueExist(this.dialogData.PeopleLastName));
    this.setValueInFormControl('emailAddress', isValueExist(this.dialogData.PeopleEmail));
    this.setValueInFormControl('cellPhone', isValueExist(this.dialogData.CellPhone));
    this.setValueInFormControl('userDeskPhone', isValueExist(this.dialogData.DeskPhone));
    this.setValueInFormControl('employeeId', isValueExist(this.dialogData.EmployeeId));
    this.setValueInFormControl('managerId', isValueExist(this.dialogData.ManagerId));
    this.setValueInFormControl('userTitle', isValueExist(this.dialogData.PeopleUserTitle));
    this.setValueInFormControl('department', isValueExist(this.dialogData.Department));
    this.setValueInFormControl('customerContactTypeId', isValueExist(this.dialogData.CustomerContactTypeId));
    this.setValueInFormControl('contactCustomField1', isValueExist(this.dialogData.PeopleCustomField1));
    this.setValueInFormControl('contactCustomField2', isValueExist(this.dialogData.PeopleCustomField2));
    this.setValueInFormControl('contactCustomField3', isValueExist(this.dialogData.PeopleCustomField3));
    this.setValueInFormControl('contactCustomField4', isValueExist(this.dialogData.PeopleCustomField4));
    this.setValueInFormControl('active2', this.dialogData.PeopleStatusDisplayValue == 'Active' ? true : false);
    this.setValueInFormControl('blockEmail', this.dialogData.UserBlockEmail == 'Yes' ? true : false);
  }

  setValueInFormControl(key :any, value : any) {
    this.f[key].setValue(value);
  }

  get f() {
    return this.peopleNotesForm.controls;
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
    if (this.peopleNotesForm.valid) {

      // this.peopleNotesForm.value.noteText = this.peopleNotesForm.value.noteText.split(/\r?\n/).filter(line => line.trim() !== '').join('\n');
      this.peopleNotesForm.value.noteText = this.peopleNotesForm.value.noteText.replace(/\n/g, ' ');

      const formData = new FormData();
      if (this.selectedFileName) {
        formData.append('FileAttachment', this.uploadedFile);
      }
      formData.append('PeopleId', this.peopleNotesForm.value.peopleId);
      formData.append('NoteText', this.peopleNotesForm.value.noteText);
      formData.append('PrivateNote', this.peopleNotesForm.value.privateNote);
      formData.append('Active', this.peopleNotesForm.value.active);

      this.saveButtonDisabled = true;

      this._unsubscribeInventory.next(null);
      this._LocationService.savePeopleNotes(formData).pipe(takeUntil(this._unsubscribeInventory)).subscribe((response) => {
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
    this._unsubscribeContact.next(null);
    this._unsubscribeContact.complete();
    this.getCustomer.next(null);
    this.getCustomer.complete();
    this._unsubscribeManagerPeople.next(null);
    this._unsubscribeManagerPeople.complete();
  }

  getcontacttypes() {
    this._unsubscribeContact.next(null);
    this._LocationService.getcontacttypes().pipe(takeUntil(this._unsubscribeContact)).subscribe((data) => {
      if (data && data.$values) {
        this.contacttypes = data.$values;
      }
    });
  }

  getCustomerForUser() {
    this.getCustomer.next(null);
    this.customers = [];
    this._LocationService.getCustomerDropDown().pipe(takeUntil(this.getCustomer)).subscribe((data) => {
      if (data && data.$values) {
        this.customers = data.$values;
      }
    });
  }

  getUserompaniesByAccountId(id: any) {
    this.companies = [];
    this._LocationService.getUserCompaniesByAccountId(id).subscribe((data) => {
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

  getManagerofPeople(id: any) {

    let KeyString: string = '';
    if (this.dialogData?.PeopleId) {
      KeyString += `?PeopleId=${this.dialogData.PeopleId}`;
    }

    const data = {
      customerAccountId: id
    }
    this._unsubscribeManagerPeople.next(null);
    this._LocationService.getManagerByPeople(KeyString, data).pipe(takeUntil(this._unsubscribeManagerPeople)).subscribe((response) => {
      if (response.Success)
        this.managerList = response.Data.$values;
    });
  }
}
