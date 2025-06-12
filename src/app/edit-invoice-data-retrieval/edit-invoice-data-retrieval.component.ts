import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import moment from 'moment';
import { Subscription } from 'rxjs';
import { NoteRendererComponent } from './note.component';
import _ from 'lodash';
import { LocationService } from '../services/location.service';
import { checkIsValueExists, isValueExist, isValuesUndefined, rolePermission } from '../services/helper';
import { ActionPopupComponent } from '../common/action-popup/action-popup.component';
import { ErrorWarningPopupComponent } from '../common/error-warning-popup/error-warning-popup.component';
import { EditRetrievalFileDialogComponent } from '../vendors/add-retrieval-file/edit-retrieval-file-dialog/edit-retrieval-file-dialog.component';
import { SharedModule } from '../demo/shared/shared.module';
import { PrimgModule } from '../demo/shared/primeng.module';
import { AgGridTableComponent } from '../common/ag-grid-table/ag-grid-table.component';
import { AgGridModule } from 'ag-grid-angular';

@Component({
  selector: 'app-edit-invoice-data-retrieval',
  templateUrl: './edit-invoice-data-retrieval.component.html',
  styleUrls: ['./edit-invoice-data-retrieval.component.scss'],
  standalone: true,
  imports: [
    SharedModule, PrimgModule, AgGridTableComponent,AgGridModule
  ]
})
export class EditInvoiceDataRetrievalComponent implements OnInit {
  @Input() billingAccountData: any;

  @Input() setIsReadOnly: any;
  @Input() tabs: any;
  @Input() validationFire2Tab: any;

  InvoiceRetrievalMethods: any = [];
  getdataRetrievalMethods: any = [];
  getdataRetrievalSource: any = [];
  dataRetrievalTemplateType: any = [];
  getDataRetrievalProcessiongMethods: any = [];
  DataRetrievalProcessingMethods: any = [];
  DataRetrievalMethodsApiSub: Subscription;
  getDataRetrievalProcessiongMethodsSub: Subscription;
  dataRetrievalTemplateTypeSub: Subscription;
  InvoiceRetrievalMethodsApiSub: Subscription;
  getdataRetrievalSourceSub: Subscription;
  getdataRetrievalMethodsSub: Subscription;
  BillingAccountsDetailsSub: Subscription;
  updateRetrievalForm: FormGroup;
  submitted: boolean = false;
  rowSelection: any = 'single';
  defaultColDef: any = {
    editable: false,
    sortable: true,
    minWidth: 100,
    filter: false,
    resizable: true,
    floatingFilter: false,
    flex: 1,
  };
  @Input() tabInfo: any;
  sideBar: any = [];
  domLayout = 'autoHeight';
  InvoiceNotesRowData: any = [];
  DataNotesInvoiceNotesRowData: any = [];
  InvoiceRetrievalcolumnDefs: any = [
    'Retrieval Method', 'Note', 'Added By', 'Modified By', 'Modified Date'
  ];
  DataRetrievalcolumnDefs: any = [
    'Retrieval Method', 'Note', 'Added By', 'Modified By', 'Modified Date'
  ];
  isSuperTEMManager: boolean = false;
  isSuperTEMAdmin: boolean = false;
  setTouchedInput: boolean = false;
  isSuperTEMUser: boolean = false;
  isCompanyUser: boolean = false;
  isTEMUser: boolean = false;
  @Output() onSaveAndBackNext: EventEmitter<any> = new EventEmitter<any>();
  hide = true;
  saveButtonLoadder = false;
  oldDataRetrivalNote = '';
  InvoiceSourceList = [
    { value: 'Customer' },
    { value: 'Vendor' },
  ];
  days:any = [];
  passwordManagerAvailble = false;
  saveSuccessFully = false;
  gridData:any = [];
  templateTypeShow = false;
  showInvoiceUsername = false;
  showDataRetrivalUsername = false;
  showEmail = false;
  showDataEmail = false;
  vendorId: any;
  detailData: any;

  columnDefsDataRe 
  frameworkComponents

  viewNEditAccount: any = false;
  vendorDetail: any;

  invoiceRetrievalList: any = [
    { Id: 10, Type: 'MAIL', DisplayName: 'Mail' },
    { Id: 20, Type: 'WEBSITE', DisplayName: 'Website' },
    { Id: 30, Type: 'sFTP', DisplayName: 'SFTP' },
    { Id: 40, Type: 'EMAIL', DisplayName: 'Email' },
    { Id: 50, Type: 'CLOUD', DisplayName: 'Cloud (Dropbox, Google Drive, etc.)' }
  ];

  dataRetrievalList: any = [
    { Id: 10, Type: 'Website', DisplayName: 'Website' },
    { Id: 20, Type: 'sFTP', DisplayName: 'SFTP' },
    { Id: 30, Type: 'Email', DisplayName: 'Email' },
    { Id: 40, Type: 'Mail', DisplayName: 'Mail' },
    { Id: 50, Type: 'CLOUD', DisplayName: 'Cloud (Dropbox, Google Drive, etc.)' }
  ];

  constructor(private fb: FormBuilder,
    public dialog: MatDialog,
    private locationService: LocationService) {



    this.InvoiceRetrievalMethodsApiSub = this.locationService.getNewInvoiceRetrievalMethods().subscribe((data) => {
      if (data && data.Data.$values) {
        this.InvoiceRetrievalMethods = data.Data.$values;
      }
    });
    this.getdataRetrievalMethodsSub = this.locationService.getdataRetrievalMethods().subscribe((data) => {
      if (data && data.Data.$values) {
        this.getdataRetrievalMethods = data.Data.$values;
      }
    });
    this.getdataRetrievalSourceSub = this.locationService.getdataRetrievalSource().subscribe((data) => {
      if (data && data.Data.$values) {
        this.getdataRetrievalSource = data.Data.$values;
      }
    });
    this.getDataRetrievalProcessiongMethodsSub = this.locationService.getDataRetrievalProcessiongMethods().subscribe((data) => {
      if (data && data.Data.$values) {
        this.getDataRetrievalProcessiongMethods = data.Data.$values;
      }
    });
    this.dataRetrievalTemplateTypeSub = this.locationService.dataRetrievalTemplateType().subscribe((data) => {
      if (data && data.Data.$values) {
        this.dataRetrievalTemplateType = data.Data.$values;
      }
    });

    this.updateRetrievalForm = fb.group({
      billedAddressChanged: new FormControl(false),
      invoiceSource: new FormControl('', [Validators.required]),
      invoiceRetrievalMethodId: new FormControl('', [Validators.required]),
      recieveDays: new FormControl('', [Validators.required]),
      daysTillMissing: new FormControl('', [Validators.required]),
      webUrl: new FormControl(''),
      webLogin: new FormControl(''),
      webPasswordManager: new FormControl(''),
      email: new FormControl('', [Validators.email, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]),
      invoiceRetrievalNotes: new FormControl(''),
      copyToPaymentSettings: new FormControl(false),
      copyToDataRetrieval: new FormControl(false),
      dataRetrievalSourceId: new FormControl('', [Validators.required]),
      dataRetrievalProcessingMethodId: new FormControl('', [Validators.required]),
      dataRetrievalMethodId: new FormControl('', [Validators.required]),
      templateTypeId: new FormControl(null),
      dataRetrievalDays: new FormControl('', [Validators.required]),
      dataRetrievalMissingDays: new FormControl('', [Validators.required]),
      dataRetrievalNote: new FormControl(''),
      dataRetrievalWebUrl: new FormControl(''),
      dataRetrievalWebLogin: new FormControl(''),
      dataRetrievalWebPasswordManager: new FormControl(''),
      dataRetrievalEmail: new FormControl('', [Validators.email, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]),
    });


    this.columnDefsDataRe = [
      {
        field: 'VendorReportName',
        sortingFiled: 'VendorReportName',
        headerName: 'Vendor Report Name',
        columnGroupShow: 'open',
        editable: false,
        filter: 'agTextColumnFilter',
        minWidth: 220,
        flex: 0
      },
      {
        field: 'VendorFileName',
        sortingFiled: 'VendorFileName',
        headerName: 'Vendor File Name',
        columnGroupShow: 'open',
        editable: false,
        filter: 'agTextColumnFilter',
        minWidth: 200,
        flex: 0
      },
      {
        field: 'ShortName',
        sortingFiled: 'ShortName',
        headerName: 'Short Name',
        columnGroupShow: 'open',
        editable: false,
        filter: 'agTextColumnFilter',
        minWidth: 160,
        flex: 0
      },
      {
        field: 'RequiredValue',
        sortingFiled: 'RequiredValue',
        headerName: 'Required',
        columnGroupShow: 'open',
        editable: false,
        filter: 'agTextColumnFilter',
        minWidth: 140,
        flex: 0
      },
      {
        field: 'Description',
        sortingFiled: 'Description',
        headerName: 'Description',
        columnGroupShow: 'open',
        editable: false,
        filter: 'agTextColumnFilter',
        minWidth: 155,
        flex: 0
      },
      {
        field: 'FileType',
        sortingFiled: 'FileType',
        headerName: 'File Type',
        columnGroupShow: 'open',
        editable: false,
        filter: 'agTextColumnFilter',
        minWidth: 140,
        flex: 0
      },
      {
        field: 'InZip',
        sortingFiled: 'InZip',
        headerName: 'In Zip?',
        columnGroupShow: 'open',
        editable: false,
        filter: 'agTextColumnFilter',
        minWidth: 125,
        flex: 0
      },
      {
        field: 'Notes',
        sortingFiled: 'Notes',
        headerName: 'File Notes',
        columnGroupShow: 'open',
        editable: false,
        filter: 'agTextColumnFilter',
        minWidth: 145,
        flex: 0,
        cellRenderer: 'NoteRendererComponent',
        cellRendererParams: {
          onClick: this.openNote.bind(this)
        }
      },
      {
        field: 'Status',
        sortingFiled: 'Status',
        headerName: 'Status',
        columnGroupShow: 'open',
        editable: false,
        filter: 'agTextColumnFilter',
        minWidth: 120,
        flex: 0
      },
      {
        field: 'DataRetrievalMethod',
        sortingFiled: 'DataRetrievalMethod',
        headerName: 'Retrieval Method',
        columnGroupShow: 'open',
        editable: false,
        filter: 'agTextColumnFilter',
        minWidth: 200,
        flex: 0
      },
    ];

    this.frameworkComponents = {
      NoteRendererComponent: NoteRendererComponent
    }

    this.viewNEditAccount = rolePermission(['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser']);
    if (!this.viewNEditAccount) {
      this.setIsReadOnly = true;
    }
  }


  onProcessingMethod(fromAPI = false) {
    if (this.f['dataRetrievalProcessingMethodId'].value === 20 || this.f['dataRetrievalProcessingMethodId'].value === 90) {
      this.templateTypeShow = true;
      this.updateRetrievalForm.get('templateTypeId')?.setValidators([Validators.required]);
      if (this.f['dataRetrievalProcessingMethodId'].value === 20 && fromAPI == false) {
        this.setValueInFormControl('templateTypeId', 10)
      } else if (this.f['dataRetrievalProcessingMethodId'].value === 90 && fromAPI == false) {
        this.setValueInFormControl('templateTypeId', 20)
      }
    } else {
      this.templateTypeShow = false;
      this.updateRetrievalForm.get('templateTypeId')?.setValidators([]);
      this.setValueInFormControl('templateTypeId', null)
    }

    this.updateRetrievalForm.get('templateTypeId')?.updateValueAndValidity();
  }

  ngOnInit(): void {
    for (let i = 1; i <= 31; i++) {
      this.days.push({ Id: i, value: i, stringValue: i.toString() });
    }
    this.isSuperTEMManager = this.locationService.isUserHasSuperTEMManagerRole();
    this.isSuperTEMAdmin = this.locationService.isUserHasSuperTEMAdminRole();
    this.isSuperTEMUser = this.locationService.isUserHasSuperTEMUserRole();
    this.isCompanyUser = this.locationService.isUserCompanyUser();
    this.isTEMUser = this.locationService.isUserHasTEMUserRole();

    if (this.billingAccountData && this.billingAccountData.filedTouched) {
      this.setTouchedInput = true;
    }
    this.billingAccountData.Id = this.billingAccountData.BillingAccountID || this.billingAccountData.Id || this.billingAccountData.BillingAccountId;
    this.BillingAccountsDetailsSub = this.locationService.getBillingAccountsDetails(this.billingAccountData.Id).subscribe((data) => {

      if (data && data.Data) {

        data = data.Data;
        if (this.validationFire2Tab) {
          this.submitted = true;
        }
        this.detailData = data;
        this.vendorId = data.VendorAccountId;
        if (!checkIsValueExists(data.InvoiceSource) && !checkIsValueExists(data.DataRetrievalSourceId)) {
          this.vendorDetailSet();
        } else {
          this.setAPIData(data);
        }

        this.getDataretrievalBatemplates(data.VendorAccountId);
        this.onProcessingMethod(true);
        this.onRetrievalMethod();
        this.onDataRetrievalMethod();
        // this.setValidationLoginPasword('login');
        // this.setValidationLoginPasword('password');
      }
    });

    if (this.isCompanyUser || this.isTEMUser || !this.viewNEditAccount) {
      this.updateRetrievalForm.disable();
      this.setIsReadOnly = true;
    }

    this.updateRetrievalForm.valueChanges.subscribe(res => {
      // Here I want to show a message ("An input has been touched") when any field of the form has been touched
    })
  }

  vendorDetailSet() {
    this.locationService.vendorDetailGet(this.billingAccountData.Id, this.vendorId).subscribe((data) => {
      if (data.Success) {

        if (isValueExist(data.Data)) {
          this.setAPIData(data.Data);
        }
      }
    });
  }

  setAPIData(data: any) {
    this.passwordManagerAvailble = data.InvPasswordManager ? true : false;
    this.oldDataRetrivalNote = this.f['dataRetrievalNote'].value;
    this.setValueInFormControl('billedAddressChanged', (data.BilledAddressChanged) ? data.BilledAddressChanged : false);

    this.setValueInFormControl('invoiceSource', data.InvoiceSource);

    this.setValueInFormControl('invoiceRetrievalMethodId', data.InvoiceRetrievalMethodId);
    this.setValueInFormControl('recieveDays', data.InvoiceReceiveDays ? data.InvoiceReceiveDays.toString() : null);
    this.setValueInFormControl('daysTillMissing', data.InvoiceDaysTillMissing ? data.InvoiceDaysTillMissing.toString() : null);
    this.setValueInFormControl('webUrl', data.InvRetrievalWebUrl);
    this.setValueInFormControl('webLogin', data.InvRetrievalWebLogin);
    this.setValueInFormControl('webPasswordManager', data.InvPasswordManager);

    this.setValueInFormControl('email', data.InvEmail);
    this.setValueInFormControl('invoiceRetrievalNotes', data.InvRetrievalNoteText);
    this.setValueInFormControl('copyToPaymentSettings', false);
    this.setValueInFormControl('copyToDataRetrieval', data.CopiedDataRetrieval);
    this.setValueInFormControl('dataRetrievalSourceId', data.DataRetrievalSourceId);
    this.setValueInFormControl('dataRetrievalProcessingMethodId', data.DataRetrievalProcessingMethodId);
    this.setValueInFormControl('dataRetrievalMethodId', data.DataRetrievalMethodId);
    this.setValueInFormControl('templateTypeId', data.DataRetrievalTemplateTypeId);
    this.setValueInFormControl('dataRetrievalDays', data.DataRetrievalDays ? data.DataRetrievalDays.toString() : null);
    this.setValueInFormControl('dataRetrievalMissingDays', data.DataMissingDays ? data.DataMissingDays.toString() : null);
    this.setValueInFormControl('dataRetrievalNote', data.DataRetrievalNoteText);
    this.setValueInFormControl('dataRetrievalWebUrl', data.DataRetrievalWebUrl);
    this.setValueInFormControl('dataRetrievalWebLogin', data.DataRetrievalWebLogin);
    this.setValueInFormControl('dataRetrievalWebPasswordManager', data.DataPasswordManagerURL);
    this.setValueInFormControl('dataRetrievalEmail', data.DataEmail);
  }
  getDataretrievalBatemplates(vId: any) {
    this.locationService.getDataretrievalBatemplates(vId, this.billingAccountData.Id).subscribe((data) => {
      // data.BADataRetrievalImportTemplateId
      this.gridData = data.Data.$values;
    });
  }


  clickToOpenTable(data: any) {
  }
  openNote(e: any) {

    if (e.rowData.Notes) {
      let errorData: any = {
        messgeType: "error",
        title: "Attention",
        titleClass: "text-c-blue",
        icon: "fas fa-exclamation-circle",
        iconClass: "text-c-blue f-70",
        iconNot: true,
        textColor: 'black'
      }

      const dialogReff = this.dialog.open(ActionPopupComponent, {
        width: '700px', data:
        {
          text: e.rowData.Notes,
          errorData: errorData
        }
      });
    }
  }

  setValueInFormControl(key: any, value: any) {
    this.f[key].setValue(value);
  }

  copyToDataRetrievalFn($event: any ) {
    if ($event) {
      this.setValueInFormControl('dataRetrievalNote', this.f['invoiceRetrievalNotes'].value);
    } else {
      this.setValueInFormControl('dataRetrievalNote', this.oldDataRetrivalNote);
    }
  }

  ngAfterViewInit() {
    // this.setValidationLoginPasword();
  }
  counter(i: number) {
    return new Array(i);
  }
  get f() {
    return this.updateRetrievalForm.controls;
  }
  testUrl() {
    if (this.f['webUrl'].value) {
      window.open(this.f['webUrl'].value);
    }
  }
  ngOnDestroy(): void {

    // this.DataRetrievalMethodsApiSub.unsubscribe();
    // this.getDataRetrievalProcessiongMethodsSub.unsubscribe();
    // this.dataRetrievalTemplateTypeSub.unsubscribe();
    // this.InvoiceRetrievalMethodsApiSub.unsubscribe();
    // this.getdataRetrievalSourceSub.unsubscribe();
    // this.getdataRetrievalMethodsSub.unsubscribe();
    // this.BillingAccountsDetailsSub.unsubscribe();
  }
  saveDataInvoiceRetrieval() {
    this.submitted = true;
    if (
      (
        isValueExist(this.billingAccountData.InvoiceSource) && isValueExist(this.updateRetrievalForm.value.invoiceSource) &&
        this.billingAccountData.InvoiceSource != this.updateRetrievalForm.value.invoiceSource
      ) ||
      (
        isValueExist(this.billingAccountData.InvoiceRetrievalMethodId) && isValueExist(this.updateRetrievalForm.value.invoiceRetrievalMethodId) &&
        this.billingAccountData.InvoiceRetrievalMethodId != this.updateRetrievalForm.value.invoiceRetrievalMethodId
      ) ||
      (
        isValueExist(this.billingAccountData.InvoiceReceiveDays) && isValueExist(this.updateRetrievalForm.value.recieveDays) &&
        this.billingAccountData.InvoiceReceiveDays != this.updateRetrievalForm.value.recieveDays
      ) ||
      (
        isValueExist(this.billingAccountData.InvoiceDaysTillMissing) && isValueExist(this.updateRetrievalForm.value.daysTillMissing) &&
        this.billingAccountData.InvoiceDaysTillMissing != this.updateRetrievalForm.value.daysTillMissing
      ) ||
      (
        isValueExist(this.billingAccountData.InvEmail) && isValueExist(this.updateRetrievalForm.value.email) &&
        this.billingAccountData.InvEmail != this.updateRetrievalForm.value.email
      ) ||
      (
        isValueExist(this.billingAccountData.DataRetrievalSourceId) && isValueExist(this.updateRetrievalForm.value.dataRetrievalSourceId) &&
        this.billingAccountData.DataRetrievalSourceId != this.updateRetrievalForm.value.dataRetrievalSourceId
      ) ||
      (
        isValueExist(this.billingAccountData.DataRetrievalProcessingMethodId) && isValueExist(this.updateRetrievalForm.value.dataRetrievalProcessingMethodId) &&
        this.billingAccountData.DataRetrievalProcessingMethodId != this.updateRetrievalForm.value.dataRetrievalProcessingMethodId
      ) ||
      (
        isValueExist(this.billingAccountData.InvPasswordManager) && isValueExist(this.updateRetrievalForm.value.webPasswordManager) &&
        this.billingAccountData.InvPasswordManager != this.updateRetrievalForm.value.webPasswordManager
      ) 
      ||
      (
        isValueExist(this.billingAccountData.InvRetrievalWebLogin) && isValueExist(this.updateRetrievalForm.value.webLogin) &&
        this.billingAccountData.InvRetrievalWebLogin != this.updateRetrievalForm.value.webLogin
      ) || 
      (
        isValueExist(this.billingAccountData.InvRetrievalWebUrl) && isValueExist(this.updateRetrievalForm.value.webUrl) &&
        this.billingAccountData.InvRetrievalWebUrl != this.updateRetrievalForm.value.webUrl 
      ) ||
      (
        isValueExist(this.billingAccountData.DataRetrievalMethodId) && isValueExist(this.updateRetrievalForm.value.dataRetrievalMethodId) &&
        this.billingAccountData.DataRetrievalMethodId != this.updateRetrievalForm.value.dataRetrievalMethodId
      ) ||
      (
        isValueExist(this.billingAccountData.DataRetrievalDays) && isValueExist(this.updateRetrievalForm.value.dataRetrievalDays) &&
        this.billingAccountData.DataRetrievalDays != this.updateRetrievalForm.value.dataRetrievalDays
      ) ||
      (
        isValueExist(this.billingAccountData.DataMissingDays) && isValueExist(this.updateRetrievalForm.value.dataRetrievalMissingDays) &&
        this.billingAccountData.DataMissingDays != this.updateRetrievalForm.value.dataRetrievalMissingDays 
      ) ||
      (
        isValueExist(this.billingAccountData.DataRetrievalWebUrl) && isValueExist(this.updateRetrievalForm.value.dataRetrievalWebUrl) &&
        this.billingAccountData.DataRetrievalWebUrl != this.updateRetrievalForm.value.dataRetrievalWebUrl
      ) ||
      (
        isValueExist(this.billingAccountData.DataRetrievalWebLogin) && isValueExist(this.updateRetrievalForm.value.dataRetrievalWebLogin) &&
        this.billingAccountData.DataRetrievalWebLogin != this.updateRetrievalForm.value.dataRetrievalWebLogin
      ) ||
      (
        isValueExist(this.billingAccountData.DataRetrievalWebPassword) && isValueExist(this.updateRetrievalForm.value.dataRetrievalWebPasswordManager) &&
        this.billingAccountData.DataRetrievalWebPassword != this.updateRetrievalForm.value.dataRetrievalWebPasswordManager
      ) || 
      (
        isValueExist(this.billingAccountData.DataEmail) && isValueExist(this.updateRetrievalForm.value.dataRetrievalEmail) &&
        this.billingAccountData.DataEmail != this.updateRetrievalForm.value.dataRetrievalEmail
      )
    ) {
      let errorData: any = {
        messgeType: 'error',
        closeBtnName: `Yes, this is correct! Update away!`,
        okBtnName: 'Close & Review',
        title: 'Attention',
        titleClass: 'text-c-blue',
        icon: 'fas fa-question-circle',
        iconClass: 'text-c-blue f-70',
        message: `You have made a change that affects existing Invoice & Data Retrievals.  We need to update any open records with your change.  Do you want to proceed?`,
        removeLink: true
      };
      const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
        panelClass: 'error-warning',
        data: errorData,
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (!isValuesUndefined(result)) {
          if (!result) {
            this.updateBillAccount();
          }
        }
      });
    } else {
      this.updateBillAccount();
    }

  }

  updateBillAccount() {

    if (this.updateRetrievalForm.valid) {
      this.saveButtonLoadder = true;
      const RetrievalData = this.updateRetrievalForm.value;
      
      const retrievalMethod1 = this.updateRetrievalForm.get('invoiceRetrievalMethodId')?.value;
      this.invoiceRetrievalList.forEach((item: any) => {
        if (item.Id == retrievalMethod1) {
          const obj = this.InvoiceRetrievalMethods.find((e: any) => { 
            return e.Type == item.Type;
          });
          RetrievalData.invoiceRetrievalMethodId = obj.Id;
        }
      });

      const retrievalMethod2 = this.updateRetrievalForm.get('dataRetrievalMethodId')?.value;
      this.dataRetrievalList.forEach((item: any) => {
        if (item.Id == retrievalMethod2) {
          const obj = this.getdataRetrievalMethods.find((e: any) => { 
            return e.Type == item.Type;
          });
          RetrievalData.dataRetrievalMethodId = obj.Id;
        }
      });

      delete RetrievalData.copyToDataRetrieval;
      this.locationService.updateDataInvoiceRetrieval(RetrievalData, this.billingAccountData.Id).subscribe({
        next: data => {
          if (data.Success) {
            this.saveButtonLoadder = false;
            this.saveSuccessFully = true;

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
              this.onSaveAndBackNext.emit(data.Data);
            });
          } else {
            this.saveButtonLoadder = false;
            let errorMessage: any = '';
            if (data.Success === false) {
              errorMessage = data.Message ? data.Message : 'Bad request';
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
            }
          }
        },
        error: error => {
          this.saveButtonLoadder = false;
          let errorMessage: any = '';
          if (error.StatusCode === 400) {
            errorMessage = error.Message ? error.Message : 'Bad request';

            let errorData: any = {
              messgeType: "error",
              title: "Attention",
              titleClass: "text-c-blue",
              icon: "fas fa-exclamation-circle",
              iconClass: "text-c-blue f-70",
              message: errorMessage //if messges is multiple use array
            }
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
          }
        }

      });
    }
  }
  convertToDateTime(date: any) {
    if (date != null) {
      return moment(new Date(date)).format('MM/DD/YYYY');
    } else {
      return '';
    }
  }
  filterModifyByUser(data: any) {
    let fName = (data?.FirstName && data?.FirstName != null) ? data?.FirstName : '';
    let LName = (data?.LastName && data?.LastName != null) ? data?.LastName : '';
    return fName + ' ' + LName;
  }

  EditRetrievalFile(data: any) {
    const dialogRef = this.dialog.open(EditRetrievalFileDialogComponent, {
      width: '900px',
      data: {
        id: data.BADataRetrievalImportTemplateId
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.dialog.closeAll();
      this.getDataretrievalBatemplates(this.vendorId);
    })
  }

  onRetrievalMethod() {
    if (this.f['invoiceRetrievalMethodId'].value == 40) {
      this.showEmail = true;
    } else {
      this.showEmail = false;
    }
    if (this.f['invoiceRetrievalMethodId'].value == 20 || this.f['invoiceRetrievalMethodId'].value == 50 || this.f['invoiceRetrievalMethodId'].value == 30) {
      this.showInvoiceUsername = true;
      this.updateRetrievalForm.get('webUrl')?.setValidators([Validators.required]);
    } else {
      this.showInvoiceUsername = false;
      this.updateRetrievalForm.get('webUrl')?.clearValidators();
    }
    this.updateRetrievalForm.get('webUrl')?.updateValueAndValidity();
  }
  onDataRetrievalMethod() {
    if (this.f['dataRetrievalMethodId'].value == 30) {
      this.showDataEmail = true;
    } else {
      this.showDataEmail = false;
    }
    if (this.f['dataRetrievalMethodId'].value == 10 || this.f['dataRetrievalMethodId'].value == 20 || this.f['dataRetrievalMethodId'].value == 50) {
      this.showDataRetrivalUsername = true;
      this.updateRetrievalForm.get('dataRetrievalWebUrl')?.setValidators([Validators.required]);
    } else {
      this.showDataRetrivalUsername = false;
      this.updateRetrievalForm.get('dataRetrievalWebUrl')?.clearValidators();
    }
    this.updateRetrievalForm.get('dataRetrievalWebUrl')?.updateValueAndValidity();
  }

  setValidationLoginPasword(type?: any) {

    if (!type) {
      this.updateRetrievalForm.controls['webPasswordManager']?.clearValidators();
      this.updateRetrievalForm.controls['webLogin']?.clearValidators();
      this.updateRetrievalForm.controls['webPasswordManager']?.updateValueAndValidity();
      this.updateRetrievalForm.controls['webLogin']?.updateValueAndValidity();
    }
    if (type === 'login') {
      if (this.updateRetrievalForm.controls['webLogin'].value) {
        this.updateRetrievalForm.controls['webPasswordManager'].setValidators([Validators.required]);
      } else if (!this.updateRetrievalForm.controls['webLogin'].value) {
        this.updateRetrievalForm.controls['webPasswordManager']?.clearValidators();
      }
      this.updateRetrievalForm.controls['webPasswordManager']?.updateValueAndValidity();
    }


    if (type === 'password') {
      if (this.updateRetrievalForm.controls['webPasswordManager'].value) {
        this.updateRetrievalForm.controls['webLogin'].setValidators([Validators.required]);
      } else if (!this.updateRetrievalForm.controls['webPasswordManager'].value) {
        this.updateRetrievalForm.controls['webLogin']?.clearValidators();
      }
      this.updateRetrievalForm.controls['webLogin']?.updateValueAndValidity();
    }

  }

  copyForm(event: any) {
    if (event.target.checked) {
      this.setValueInFormControl('dataRetrievalDays', this.f['recieveDays'].value);
      this.setValueInFormControl('dataRetrievalMissingDays', this.f['daysTillMissing'].value);
      this.setValueInFormControl('dataRetrievalWebUrl', this.f['webUrl'].value);
      this.setValueInFormControl('webLogin', this.f['dataRetrievalWebLogin'].value);
      this.setValueInFormControl('dataRetrievalWebPasswordManager', this.f['webPasswordManager'].value);
      this.setValueInFormControl('dataRetrievalEmail', this.f['email'].value);
      this.setValueInFormControl('dataRetrievalNote', this.f['invoiceRetrievalNotes'].value);
    } else {
      this.setValueInFormControl('dataRetrievalDays', null);
      this.setValueInFormControl('dataRetrievalMissingDays', null);
      this.setValueInFormControl('dataRetrievalWebUrl', '');
      this.setValueInFormControl('webLogin', '');
      this.setValueInFormControl('dataRetrievalWebPasswordManager', '');
      this.setValueInFormControl('dataRetrievalEmail', '');

      // this.setValueInFormControl('dataRetrievalDays', this.f.recieveDays.value);
      // this.setValueInFormControl('dataRetrievalMissingDays', this.f.daysTillMissing.value);
      // this.setValueInFormControl('dataRetrievalWebUrl', this.f.webUrl.value);
      // this.setValueInFormControl('webLogin', this.f.dataRetrievalWebLogin.value);
      // this.setValueInFormControl('dataRetrievalWebPasswordManager', this.f.webPasswordManager.value);
      // this.setValueInFormControl('dataRetrievalEmail', this.f.email.value);
    }
  }
  removaExtraSpaces() {
    const invNote = this.updateRetrievalForm.controls['invoiceRetrievalNotes'].value;
    const dateNote = this.updateRetrievalForm.controls['dataRetrievalNote'].value;
    this.updateRetrievalForm.controls['invoiceRetrievalNotes'].setValue(invNote.trimStart().trimEnd());
    this.updateRetrievalForm.controls['dataRetrievalNote'].setValue(dateNote.trimStart().trimEnd());
  }

  onCellDoubleClicked($e: any) {

  }
}
