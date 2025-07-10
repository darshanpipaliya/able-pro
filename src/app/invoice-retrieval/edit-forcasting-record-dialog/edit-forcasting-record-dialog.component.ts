import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import moment from 'moment';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UploadInvoiceDialogComponent } from './upload-invoice-dialog/upload-invoice-dialog.component';
import { UploaddatafilesComponent } from './uploaddatafiles/uploaddatafiles.component';
import { TerminateRetDialogComponent } from './terminate-ret-dialog/terminate-ret-dialog.component';
import { LastMonthDataDialogComponent } from './last-month-data-dialog/last-month-data-dialog.component';
import { ClipComponent } from './clip/clip.component';
import _ from 'lodash';
import { Router } from '@angular/router';
import { AddRetrievalNoteDialogComponent } from './add-retrieval-note-dialog/add-retrieval-note-dialog.component';
import { LastMonthDataYesComponent } from './last-month-data-yes/last-month-data-yes.component';
import { LocationService } from 'src/app/services/location.service';
import { CustomPipe } from 'src/app/custom-pipe/date.pipe';
import { ManageService } from 'src/app/services/manage.service';
import { isValueExist, isValuesUndefined, rolePermission } from 'src/app/services/helper';
import { NoteRendererComponent } from 'src/app/edit-invoice-data-retrieval/note.component';
import { ActionPopupComponent } from 'src/app/common/action-popup/action-popup.component';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { AgGridModule } from 'ag-grid-angular';
import { AgGridTableComponent } from 'src/app/common/ag-grid-table/ag-grid-table.component';
import { ClientSideRowModelModule, ModuleRegistry } from 'ag-grid-community';
import { ServerSideRowModelModule } from 'ag-grid-enterprise';
import { ChangeLogComponent } from 'src/app/common/change-log/change-log.component';

ModuleRegistry.registerModules([ServerSideRowModelModule, ClientSideRowModelModule]);
@Component({
  selector: 'app-edit-forcasting-record-dialog',
  templateUrl: './edit-forcasting-record-dialog.component.html',
  styleUrls: ['./edit-forcasting-record-dialog.component.scss'],
  imports: [SharedModule, PrimgModule, AgGridModule, AgGridTableComponent, ChangeLogComponent],
  providers: [DatePipe, CustomPipe]
})
export class EditForcastingRecordDialogComponent implements OnInit {
  notesData: any = [];
  cols: any = [];
  allCustomerSub: Subscription;
  vendorsSub: Subscription;
  customerList: any = [];
  vendorsList: any = [];
  dataRetrievalFilesData: any = [];
  invoiceRetrievalData: any = [];
  billingAccount: any;
  addInvoiceRetrivalForm: FormGroup;
  addInvoiceRetrivalFormNew: FormGroup;
  submitted: boolean = false;
  showInvoice: boolean = false;
  disableActions: boolean = false;
  downloadPreviousAllow: boolean = false;
  VendorId: any;
  CutomerId: any
  @Input() rowData: any;
  getData: any;
  retrievalId: any;
  fileName: any;

  @ViewChild('IIconTooltip') IIconTooltip!: TemplateRef<any>;
  @Output() onUserAddEvent: EventEmitter<any> = new EventEmitter();
  @Output() addNewInvoice: EventEmitter<any> = new EventEmitter();
  @Output() openEditBillingTab: EventEmitter<any> = new EventEmitter();
  @Output() currentOpenEditPage: EventEmitter<any> = new EventEmitter<any>();
  @Output() setTemDDValueEvent: EventEmitter<any> = new EventEmitter<any>();
  private _unsubscribeChangelog: Subject<any> = new Subject<any>();
  columns: any = [];
  logLoader = false;

  public sideBar;
  sbInvoiceId: any;

  public columnDefs;
  rowSelection = 'multiple';
  defaultColDef = {
    editable: true,
    sortable: true,
    minWidth: 100,
    resizable: true,
    floatingFilter: true,
    flex: 1,
  };

  setTemDDValue: any;
  fetchDateData: any;
  saveButtonLoadder = false;
  hide = true;
  isTemUsers: any = false;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  private _unsubscribeNotes: Subject<any> = new Subject<any>();
  isSuperTEMAdmin = false;
  tems: any = [];
  isSuperTEMManager: boolean = false;
  isSuperTEMUsers: boolean = false;
  isAllSuperTEMs: boolean = false;
  hasSsuperTemUsers: boolean = false;
  currentUrl: any;

  billDay = '';
  InvoiceRetrievalMethods:any = [];
  InvoiceRetrievalStatus:any = [];
  disabledAccountEditBtn = false;
  rowData1:any = [];
  frameworkComponents
  disabledViewInvoiceBtn = false;
  downloadinvoiceloader = false;
  isFromInvoice = false;
  
  changelogData: any;
  statusPopup = false;
  disableDownload = false;
  downloadBlankTemplateDisabled = false;
  statusNote = '';
  constructor(
    public dialog: MatDialog,
    private fb: FormBuilder,
    private locationService: LocationService,
    private datePipe: DatePipe,
    public customPipe: CustomPipe,
    public manageService: ManageService,
    public router: Router,
  ) {

    this.cols = [
      { field: 'ExpectedInvoiceNoteCreatedDate', header: 'Date', width: '165px', spinner: true},
      { field: 'Notes', header: 'Note', spinner: true },
      { field: 'ExpectedInvoiceNoteCreatedByWithEmail', header: 'Created By', width: '290px', spinner: true }
    ];

    this.sideBar = {
      toolPanels: ['columns', 'filters']
    };

    this.columnDefs = [
      {
        headerName: '',
        children: [
          {
            field: 'ImportXFileNameId',
            headerName: '',
            columnGroupShow: 'open',
            editable: false,
            minWidth: 50,
            flex: 0,
            cellRenderer: function (params: any) {
              return isValueExist(params.value) && params.data.ImportXFileNameStatusDisplay == 'Error' ? '<i class="fa fa-times-circle" style="color: #CF2A27"></i>' : 
              isValueExist(params.value) ? '<i class="fa fa-check-circle text-success"></i>' : ''
            } /* <i class="fa fa-times-circle" style="color: #CF2A27"></i> */
          },
          {
            field: 'ImportXFileNameId',
            headerName: 'View',
            columnGroupShow: 'open',
            editable: false,
            minWidth: 85,
            width: 85,
            flex: 0,
            // cellRenderer: function (params) {
            //   return params.value ? '<i class="fa fa fa-paperclip text-primary" style="transform: rotate(315deg);"></i>' : ''
            // },
            cellRendererFramework: ClipComponent,
            cellRendererParams: (params: any) => {
              return {
                fileName: this.fileName  // now correctly references `this`
              };
            }

          },

        ],
      },
      {
        headerName: 'File Name',
        children: [
          {
            field: 'VendorReportName',
            headerName: 'Vendor Report Name',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 220,
            flex: 0
          },
          {
            field: 'VendorFileName',
            headerName: 'Vendor File Name',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'close',
            editable: false,
            minWidth: 200,
            flex: 0
          },
          {
            field: 'ShortName',
            headerName: 'Short Name',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'open',
            editable: false,
            minWidth: 160,
            flex: 0
          }
        ],
      },
      {
        headerName: 'File Attributes',
        children: [
          {
            field: 'ImportXFileNameStatusDisplay',
            headerName: 'Import Status',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'close',
            editable: false,
            minWidth: 175,
            flex: 0
          },
          {
            field: 'ImportErrorCodeStr',
            headerName: 'Status Notes',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'close',
            editable: false,
            minWidth: 370,
            flex: 0,
            wrapText: true,
            autoHeight: true,
            cellStyle: { 'white-space': 'normal', 'line-height': 1.5, cursor: 'pointer' },
            cellClass: "ag-cell-note-scroll",
          },
          {
            field: 'RequiredValue',
            headerName: 'Required',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'close',
            editable: false,
            minWidth: 140,
            flex: 0,
          },
          {
            field: 'Description',
            headerName: 'Description',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'open',
            editable: false,
            minWidth: 200,
            flex: 0,
          },
          {
            field: 'DataRetrievalFileTypeDisplay',
            headerName: 'File Type',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'close',
            editable: false,
            minWidth: 135,
            width: 135,
            flex: 0,
          },
          {
            field: 'InZipFile',
            headerName: 'In Zip?',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'close',
            editable: false,
            minWidth: 120,
            width: 120,
            flex: 0,
          },
          {
            field: 'Notes',
            headerName: 'Notes',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'close',
            editable: false,
            minWidth: 200,
            width: 200,
            flex: 0,
            cellRenderer: NoteRendererComponent,
            cellRendererParams: {
              onClick: this.openNote.bind(this)
            }
          },
          {
            field: 'StatusDisplay',
            headerName: 'Status',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'open',
            editable: false,
            minWidth: 120,
            width: 120,
            flex: 0,
          },
          {
            field: 'DataRetrievalMethodDisplay',
            headerName: 'Retrieval Method',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'close',
            editable: false,
            minWidth: 200,
            flex: 0,
          }
        ],
      },

    ];

    this.frameworkComponents = {
      NoteRendererComponent: NoteRendererComponent
    }

    this.columns = [
      { field: 'tab', header: 'Tab' },
      { field: 'section', header: 'Section' },
      { field: 'fieldName', header: 'Field Name' },
      { field: 'previousValue', header: 'Previous Value' },
      { field: 'newValue', header: 'New Value' },
      { field: 'timeDate ', header: 'Time & Date' },
      { field: 'who', header: 'Who' }
    ];
    this.columns = [
      { field: 'TabModuleDisplayName', header: 'Tab' },
      { field: 'TabSectionModuleDisplayName', header: 'Section' },
      { field: 'DisplayColumnName', header: 'Field Name' },
      { field: 'OldValue', header: 'Previous Value' },
      { field: 'NewValue', header: 'New Value' },
      { field: 'ModificationDate', header: 'Time & Date' },
      { field: 'ModifiedBy', header: 'Who' }
    ];
    this.currentUrl = this.router.url;
    if(this.currentUrl == '/invoices/invoice-retrievals') {
      this.isFromInvoice = true;
    }
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

  ngOnInit(): void {
    this.currentOpenEditPage.emit(true);
    this.isTemUsers = this.locationService.isUserHasTEMUsersRole();
    this.isSuperTEMAdmin = this.locationService.isUserHasSuperTEMAdminRole();
    this.isSuperTEMManager = this.locationService.isUserHasSuperTEMManagerRole();
    this.isAllSuperTEMs = this.locationService.isUserHasSuperTEMUsersRole();
    this.isSuperTEMUsers = this.locationService.isUserHasSuperTEMUserRole();

    this.hasSsuperTemUsers = rolePermission(['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser']);

    this.disabledAccountEditBtn = true;
    this.getDataWithId(this.rowData.ExpectedInvoiceId);

    this.addInvoiceRetrivalForm = this.fb.group({
      BillingAccountID: new FormControl('', [Validators.required]),
      invoiceBillDate: new FormControl('',),
      CustomerAccountId: new FormControl('', [Validators.required]),
      VendorAccountId: new FormControl('', [Validators.required]),
      InvoiceMonthYear: new FormControl('', []),
      ExpectedDate: new FormControl('', []),
      RetrievalDate: new FormControl('', []),
      ReceivedDate: new FormControl('', []),
      ProcessedDate: new FormControl('', []),
      InvoiceRetrievalMethodId: new FormControl('', []),
      RetrievalStatusID: new FormControl('', []),
      WebUrl: new FormControl('', []),
      WebLogin: new FormControl('', []),
      WebPassword: new FormControl('', []),
      InvoiceRetrievalNotes: new FormControl('', []),
      TEM: new FormControl('', []),
    });

    this.addInvoiceRetrivalFormNew = this.fb.group({
      RecordStatus: new FormControl('', [Validators.required]),
      BillingPeriod: new FormControl('', [Validators.required]),
      InvoiceStatus: new FormControl('', [Validators.required]),
      DataStatus: new FormControl('', [Validators.required]),
      InvoiceRetrievalDate: new FormControl('', [Validators.required]),
      DataRetrievalDate: new FormControl('', [Validators.required]),
      InvoiceReceived: new FormControl('', [Validators.required]),
      InvoiceProcessed: new FormControl('', [Validators.required]),
      DataReceived: new FormControl('', [Validators.required]),
      DataProcessed: new FormControl('', [Validators.required]),
      RequiredFiles: new FormControl('', [Validators.required]),
      OptionalFiles: new FormControl('', [Validators.required]),
      MultipleRetrievalMethods: new FormControl('', [Validators.required]),
      InvoiceSource: new FormControl('', [Validators.required]),
      RetrievalMethod: new FormControl('', [Validators.required]),
      MissingDate: new FormControl('', [Validators.required]),
      Email: new FormControl('', [Validators.required]),
      URL: new FormControl('', [Validators.required]),
      Username: new FormControl('', [Validators.required]),
      Notes: new FormControl('', [Validators.required]),
      Customer: new FormControl('', [Validators.required]),
      Vendor: new FormControl('', [Validators.required]),
      ParentVendor: new FormControl('', [Validators.required]),
      Payablevendor: new FormControl('', [Validators.required]),
      PayableAccount: new FormControl('', [Validators.required]),
      MainAccount: new FormControl('', [Validators.required]),
      BillDate: new FormControl('', [Validators.required]),
      PaymentDate: new FormControl('', [Validators.required]),
      DataSource: new FormControl('', [Validators.required]),
      DataRetrievalMethod: new FormControl('', [Validators.required]),
      ProcessingMethod: new FormControl('', [Validators.required]),
      TemplateType: new FormControl('', [Validators.required]),
      DataMissingDate: new FormControl('', [Validators.required]),
      DataEmail: new FormControl('', [Validators.required]),
      DataURL: new FormControl('', [Validators.required]),
      DataUsername: new FormControl('', [Validators.required]),
      DataNotes: new FormControl('', [Validators.required]),
      DataRetrievalWebPasswordManager: new FormControl(''),
      WebPasswordManager: new FormControl('')
    });

    this.getTEMList();
    this.getCustomerList();
    this.getvendorsSubList();
    this.getInvoiceRetrivalMethod();
    this.getInvoiceRetrivalStatus();
    this.getInvoiceRetrievalData();
    this.getDataRetrievalFiles();
    this.getInvoiceRetrievalNotes();
    this.addInvoiceRetrivalFormNew.disable();
    this.InvoiceRetrievalDataRetrievalFiles();

    this.getInvoiceChangelogData();
  
  }

  getInvoiceChangelogData() {
    this.logLoader = true;
    this._unsubscribeChangelog.next(null);
    this.locationService.getInvoiceRetrievalChangelogs(this.rowData.ExpectedInvoiceId).pipe(takeUntil(this._unsubscribeChangelog)).subscribe((data: any) => {
      this.logLoader = false;
      if(data.Success) {
        this.changelogData = data.Data.$values;
      } else {
        this.changelogData = [];
      }
    });
  }

  onCellDoubleClicked($event: any) {
    // $event.data['expectedInvoiceId'] = this.rowData.ExpectedInvoiceId;
    // this.getInvoiceRetrievalIDetails();
  }

  onCellClicked(e: any) {
    if (e.colDef.headerName === 'Status Notes' && e.data.ImportErrorCodeStr) {
      this.statusPopup = true;
      this.statusNote = e.data.ImportErrorCodeStr;
      const dialogRef = this.dialog.open(this.IIconTooltip, {
        width: '900px',
        data: {
          colseButton: true,
        }
      });
    } else {
      this.statusPopup = false;
      this.statusNote = '';
    }
  }

  AddRetrievalNote() {
    const dialogRef = this.dialog.open(AddRetrievalNoteDialogComponent, {
      width: '900px',
      data: {
        colseButton: true,
        rowData: this.rowData,
        viewOnly: false
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.getInvoiceRetrievalNotes();
    });
  }

  getInvoiceRetrievalNotes() {
    this._unsubscribeNotes.next(null);
    this.locationService.getInvoiceRetrievalNotes(this.rowData.ExpectedInvoiceId).pipe(takeUntil(this._unsubscribeNotes)).subscribe((res: any) => {
      if (res && res.Success) {
        this.notesData = res.Data.$values;
        _.map(this.notesData, (res: any) => {
          if (res['ExpectedInvoiceNoteCreatedDate']) {
            const d = res;
            d['ExpectedInvoiceNoteCreatedDate'] = moment(res['ExpectedInvoiceNoteCreatedDate']).format('MM/DD/YYYY') + ' ' + this.getTime(res['ExpectedInvoiceNoteCreatedDate']);
            return d;
          }
        });
      } else {
        this.notesData = [];
      }
    }, (error) => {
      this.notesData = [];
    });
  }

  getTime(date: any){
    let d: any = new Date(date);
    // const timeZoneOffset = -0.5 * 60;
    // const adjustedTime = new Date(d.getTime() + timeZoneOffset * 60 * 1000)
    // return adjustedTime.getHours() + ':' + adjustedTime.getMinutes();
    d = this.datePipe.transform(d, 'hh:mm a') ?? '';
    return d;
  }

  onNotesRowSelect($event: any) {
    if ($event) {
      const dialogRef = this.dialog.open(AddRetrievalNoteDialogComponent, {
        width: '900px',
        data: {
          colseButton: true,
          rowData: this.rowData,
          notesData: $event.data,
          viewOnly: true
        },
        disableClose: true
      });
      dialogRef.afterClosed().subscribe((result) => {
        this.getInvoiceRetrievalNotes();
      });
    }
  }

  download() {
    this.disableDownload = true;
      this.locationService.DownloadFilesNewAPI(this.invoiceRetrievalData.PreviousInvoiceId).subscribe({
      next: (data: any) => {
        if(data?.Message) {
          this.disableDownload = false;
          let errorData: any = {
            messgeType: "error",
            title: "Attention",
            titleClass: "text-c-blue",
            icon: "fas fa-exclamation-circle",
            iconClass: "text-c-blue f-70",
            message: data.Message
          }
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
          dialogRef.afterClosed().subscribe(result => {
          });
        } else {
          let bolbUrl = URL.createObjectURL(data);
          var link = document.createElement("a");
          link.setAttribute("href", bolbUrl);
          link.setAttribute("download", "InvoiceImportTemplate.xlsx");
          link.style.display = "none";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          this.disableDownload = false;
        }
      },
      error: error => {
        this.disableDownload = false;
        let errorData: any = {
          messgeType: "error",
          title: "Attention",
          titleClass: "text-c-blue",
          icon: "fas fa-exclamation-circle",
          iconClass: "text-c-blue f-70",
          message: error
        }
        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
        dialogRef.afterClosed().subscribe(result => {
        });
        
      }
    });
  }

  downloadBlankTemplate() {
    let paramsData = {
      isForHeader : false
    }
    
    this.downloadBlankTemplateDisabled = true;
    this.locationService.downloadBlankTemplate(paramsData).subscribe({
      next: data => {
        this.downloadBlankTemplateDisabled = false;
        if (data) {
          let bolbUrl = URL.createObjectURL(data);
          var link = document.createElement("a");
          link.setAttribute("href", bolbUrl);
          link.setAttribute("download", `InvoiceImportTemplate.xlsx`);
          link.style.display = "none";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
         
        } else {
          let errorData: any = {
            messgeType: "error",
            title: "Attention",
            titleClass: "text-c-blue",
            icon: "fas fa-exclamation-circle",
            iconClass: "text-c-blue f-70",
            message: data.Message
          }
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
          dialogRef.afterClosed().subscribe(result => {
          });
        }
      }, error: error => {
        this.downloadBlankTemplateDisabled = false;
      }
    });
  }
  getInvoiceRetrivalStatus() {
    this.locationService.expectedinvoicestatuses().subscribe((data) => {
      if (data && data.$values) {
        this.InvoiceRetrievalStatus = data.$values;
      }
    });
  }

  getInvoiceRetrivalMethod() {
    this.locationService.getInvoiceRetrievalMethods().subscribe((data) => {
      if (data && data.$values) {
        this.InvoiceRetrievalMethods = data.$values;
      }
    });
  }

  getCustomerList() {
    this.allCustomerSub = this.locationService.getCustomerDropDown().subscribe((data) => {
      if (data && data.$values) {
        this.customerList = data.$values;
        const data1 = this.customerList.find((res: any) => res.Id === this.rowData.CustomerAccountId);
        this.setTemDDValue = data1.TemAccountID;
        this.setTemDDValueEvent.emit(this.setTemDDValue);
      }
    });
  }

  getvendorsSubList() {
    this.vendorsSub = this.locationService.getVendorDropdown().subscribe((data) => {
      if (data && data.Data.$values) {
        this.vendorsList = data.Data.$values;
      }
    });
  }

  getTEMList() {
    this.locationService.getTEMLoggedInUserDropDown()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((data) => {
        if (data && data.$values) {
          this.tems = data.$values;

          if (this.hasSsuperTemUsers) {
            let id = sessionStorage.getItem("LoggedAccountId");
            const found = this.tems.find((element: any) => Number(element.Id) === Number(id));
            this.tems.unshift(found);

            this.tems = this.tems.filter((object: any, index: number): boolean => {
              return object && this.tems.indexOf(object) === index;
            });
          }
        }
      });
  }

  getInvoiceRetrievalData(isRefresh = false) {
    this.disabledViewInvoiceBtn = true;
    this.locationService.getInvoiceRetrievalData(this.rowData.ExpectedInvoiceId).subscribe((data) => {
      this.invoiceRetrievalData = data.Data;
      this.disabledViewInvoiceBtn = false;
      this.showInvoice = this.invoiceRetrievalData.ExpectedInvoiceDocAttached;
      this.fileName = this.generateFileName('template');
      this.disableActions = this.invoiceRetrievalData && this.invoiceRetrievalData.RecordStatus === 'Terminated' ? true : false;
      this.downloadPreviousAllow = this.invoiceRetrievalData.IsExistPreviousMonthInvoiceRetrieval;
      if (this.invoiceRetrievalData) {
        this.items = [{
          label: 'Invoice',
          styleClass: this.invoiceRetrievalData && this.invoiceRetrievalData.ProgressTrackerInvoice == true ? 'success-step' : 'danger-step'
        },
        {
          label: 'Data',
          styleClass: this.invoiceRetrievalData && this.invoiceRetrievalData.ProgressTrackerData == true ? 'success-step' : 'danger-step'
        },
        {
          label: 'Processed',
          styleClass: this.invoiceRetrievalData && this.invoiceRetrievalData.ProgressTrackerProcessed == true ? 'success-step' : 'danger-step'
        }];
        const data: any = {};
        data['RecordStatus'] = this.invoiceRetrievalData.RecordStatus;
        data['BillingPeriod'] = this.invoiceRetrievalData.BillingPeriod;
        data['InvoiceStatus'] = this.invoiceRetrievalData.ExpectedInvoiceStatusDisplay;
        data['DataStatus'] = this.invoiceRetrievalData.ExpectedInvoiceDataStatusDisplay;
        data['InvoiceRetrievalDate'] = this.createDateFormatter(this.invoiceRetrievalData.InvoiceRetrievalDate);
        data['DataRetrievalDate'] = this.createDateFormatter(this.invoiceRetrievalData.DataRetrievalDate);
        data['InvoiceReceived'] = this.createDateFormatter(this.invoiceRetrievalData.InvoiceReceivedDate);
        data['InvoiceProcessed'] = this.createDateFormatter(this.invoiceRetrievalData.InvoiceProcessedDate);
        data['DataReceived'] = this.createDateFormatter(this.invoiceRetrievalData.DataReceivedDate);
        data['DataProcessed'] = this.createDateFormatter(this.invoiceRetrievalData.DataProcessedDate);
        data['RequiredFiles'] = this.invoiceRetrievalData.RequiredFiles;
        data['OptionalFiles'] = this.invoiceRetrievalData.OptionalFiles;
        data['MultipleRetrievalMethods'] = this.invoiceRetrievalData.MultipleRetrievalMethodsDisplay;
        data['InvoiceSource'] = this.invoiceRetrievalData.InvoiceSource;
        data['RetrievalMethod'] = this.invoiceRetrievalData.InvoiceRetrievalMethod;
        data['MissingDate'] = this.createDateFormatter(this.invoiceRetrievalData.InvoiceMissingDate);
        data['Email'] = this.invoiceRetrievalData.InvRetrievalEmail;
        data['URL'] = this.invoiceRetrievalData.InvRetrievalWebUrl;
        data['Username'] = this.invoiceRetrievalData.InvRetrievalWebLogin;
        data['Notes'] = this.invoiceRetrievalData.InvRetrievalNoteText;
        data['Customer'] = this.invoiceRetrievalData.CustomerAccountName;
        data['Vendor'] = this.invoiceRetrievalData.VendorAccountName;
        data['ParentVendor'] = this.invoiceRetrievalData.ParentVendorAccountName;
        data['Payablevendor'] = this.invoiceRetrievalData.PayableVendorAccountName;
        data['PayableAccount'] = this.invoiceRetrievalData.PayableAccountNumber;
        data['BillDate'] = this.createDateFormatter(this.invoiceRetrievalData.InvoiceBillDate);
        data['MainAccount'] = this.invoiceRetrievalData.MainAccountNumber;
        data['PaymentDate'] = this.createDateFormatter(this.invoiceRetrievalData.InvoicePaymentDate);
        data['DataSource'] = this.invoiceRetrievalData.DataRetrievalSource;
        data['DataRetrievalMethod'] = this.invoiceRetrievalData.DataRetrievalMethod;
        data['ProcessingMethod'] = this.invoiceRetrievalData.DataRetrievalProcessingMethodDisplay;
        data['TemplateType'] = this.invoiceRetrievalData.DataRetrievalTemplateType;
        data['DataMissingDate'] = this.createDateFormatter(this.invoiceRetrievalData.DataMissingDate);
        data['DataEmail'] = this.invoiceRetrievalData.DataRetrievalEmail;
        data['DataURL'] = this.invoiceRetrievalData.DataRetrievalWebUrl;
        data['DataUsername'] = this.invoiceRetrievalData.DataRetrievalWebLogin;
        data['DataNotes'] = this.invoiceRetrievalData.DataRetrievalNoteText;
        data['DataRetrievalWebPasswordManager'] = this.invoiceRetrievalData.DataRetrievalPasswordManagerUrlLink;
        data['WebPasswordManager'] = this.invoiceRetrievalData.InvRetrievalPasswordManagerUrlLink;
        
        this.addInvoiceRetrivalFormNew.patchValue(data);
      }
      if(isRefresh) {
        this.InvoiceRetrievalDataRetrievalFiles();
      }
    });
  }

  getDataRetrievalFiles() {
    this.locationService.getDataRetrievalFiles(this.rowData.ExpectedInvoiceId).subscribe((data) => {
      this.dataRetrievalFilesData = data.Data.$values;
    });
  }

  createDateFormatter(getdate: any) {
    if (getdate) {
      let date = new Date(getdate);
      return moment(date).format('MM/DD/YYYY');
    } else {
      return '';
    }
  }
  isValidURL(str: string): boolean {
    try {
      new URL(str);
      return true; 
    } catch (e) {
      return false;
    }
  }
  getValidURL(str: string): string {
    if (this.isValidURL(str)) {
      return str;
    } else {
      return `http://${str}`;
    }
  }
  addForecastingRecordPopup() {
    this.addNewInvoice.emit(true);
  }

  getDataWithId(id: any) {
    this.locationService.getInvoiceRetrievalWithID(id).subscribe((data) => {
      if (data) {
        const datas: any = {};
        datas['TEM'] = data.TEMAccountId;
        datas['CustomerAccountId'] = data.CustomerAccountId;
        datas['VendorAccountId'] = data.VendorAccountId;
        datas['BillingAccountID'] = data.BillingAccountID;
        datas['invoiceBillDate'] = data.invoiceBillDate ? this.manageService.convertDate(data.invoiceBillDate, 'datePicker') : '';
        datas['InvoiceMonthYear'] = data.InvoiceMonthYear ? this.manageService.convertDate(data.InvoiceMonthYear, 'datePicker') : '';
        datas['ExpectedDate'] = data.ExpectedDate ? this.manageService.convertDate(data.ExpectedDate, 'datePicker') : '';
        datas['RetrievalDate'] = data.RetrievalDate ? this.manageService.convertDate(data.RetrievalDate, 'datePicker') : '';
        datas['ReceivedDate'] = data.ReceivedDate ? this.manageService.convertDate(data.ReceivedDate, 'datePicker') : '';
        datas['ProcessedDate'] = data.ProcessedDate ? this.manageService.convertDate(data.ProcessedDate, 'datePicker') : '';
        datas['InvoiceRetrievalMethodId'] = data.InvoiceRetrievalMethodId;
        datas['RetrievalStatusID'] = data.RetrievalStatusID;
        datas['WebUrl'] = data.WebUrl;
        datas['WebLogin'] = data.WebLogin;
        datas['WebPassword'] = data.WebPassword;
        datas['InvoiceRetrievalNotes'] = data.InvoiceRetrievalNotes;
        this.billDay = data.InvoiceBillDay;

        this.VendorId = data.VendorAccountId;
        this.CutomerId = data.CustomerAccountId;
        this.getCustomerVendorBillingAccounts();
        this.addInvoiceRetrivalForm.patchValue(datas);
        this.disabledAccountEditBtn = false;
      }
    });
  }
  items = [{
    label: 'Invoice',
    styleClass: 'danger-step'
  },
  {
    label: 'Data',
    styleClass: 'danger-step'
  },
  {
    label: 'Processed',
    styleClass: 'danger-step'
  }];

  getCustomerVendorBillingAccounts() {
    let KeyString = '?payableAccount=true';

    if (this.CutomerId || this.VendorId) {
      KeyString += "&customerId=" + (this.CutomerId ?? '') + "&VendorId=" + (this.VendorId ?? '');
    }
    this.locationService.getCustomerVendorBillingAccounts(KeyString).subscribe((data) => {
      if (data && data.$values) {
        this.billingAccount = data.$values;
        this.billingAccount = this.billingAccount.map((r: any) => {
          let a: any = {};
          a = r;
          a['value'] = r.BillingAccount.$values[0].Id;
          return a;
        })
      }
    });
  }


  getInvoiceRetrievalIDetails() {
    this.locationService.InvoiceRetrievalIDetails(this.rowData.ExpectedInvoiceId).subscribe((data) => {
    });
  }

  InvoiceRetrievalDataRetrievalFiles(isRefresh = false) { // 
    this.locationService.InvoiceRetrievalDataRetrievalFiles(this.rowData.ExpectedInvoiceId).subscribe((data) => {
      if (data && data.Data.$values) {
        this.rowData1 = data.Data.$values;

        this.rowData1 = _.map(this.rowData1, data => {
          const a:any = data;
          a['expectedInvoiceId'] = this.rowData.ExpectedInvoiceId;
          return a;
        });
      } else {
        this.rowData1 = [];
      }

      if(isRefresh) {
        this.getInvoiceRetrievalData();
      }
    });
  }

  get f() {
    return this.addInvoiceRetrivalForm.controls;
  }
  onCutomerChange(data: any) {
    this.CutomerId = data;
    this.addInvoiceRetrivalForm.controls['BillingAccountID'].setValue('');
    this.getCustomerVendorBillingAccounts();
  }
  onVendorChange(data: any) {
    this.VendorId = data;
    this.addInvoiceRetrivalForm.controls['BillingAccountID'].setValue('');
    this.getCustomerVendorBillingAccounts();
  }
  saveInvoiceForcastData() {

    this.submitted = true;
    if (this.addInvoiceRetrivalForm.valid) {
      this.saveButtonLoadder = true;
      const a = Object.keys(this.addInvoiceRetrivalForm.value);
      a.forEach((g) => {
        if (!this.addInvoiceRetrivalForm.value[g]) {
          this.addInvoiceRetrivalForm.value[g] = null;
        }
      });

      this.addInvoiceRetrivalForm.value['InvoiceMonthYear'] = this.addInvoiceRetrivalForm.value['InvoiceMonthYear'] ? this.manageService.convertDate(this.addInvoiceRetrivalForm.value['InvoiceMonthYear'], 'inputText') : null;
      this.addInvoiceRetrivalForm.value['ExpectedDate'] = this.addInvoiceRetrivalForm.value['ExpectedDate'] ? this.manageService.convertDate(this.addInvoiceRetrivalForm.value['ExpectedDate'], 'inputText') : null;
      this.addInvoiceRetrivalForm.value['RetrievalDate'] = this.addInvoiceRetrivalForm.value['RetrievalDate'] ? this.manageService.convertDate(this.addInvoiceRetrivalForm.value['RetrievalDate'], 'inputText') : null;

      this.addInvoiceRetrivalForm.value['invoiceBillDate'] = this.addInvoiceRetrivalForm.value['invoiceBillDate'] ? this.manageService.convertDate(this.addInvoiceRetrivalForm.value['invoiceBillDate'], 'saveDatePicker') : null;
      this.addInvoiceRetrivalForm.value['ReceivedDate'] = this.addInvoiceRetrivalForm.value['ReceivedDate'] ? this.manageService.convertDate(this.addInvoiceRetrivalForm.value['ReceivedDate'], 'saveDatePicker') : null;
      this.addInvoiceRetrivalForm.value['ProcessedDate'] = this.addInvoiceRetrivalForm.value['ProcessedDate'] ? this.manageService.convertDate(this.addInvoiceRetrivalForm.value['ProcessedDate'], 'saveDatePicker') : null;

      this.addInvoiceRetrivalForm.value['copyToPaymentSettings'] = false;

      this.locationService.invoiceRetrievalUpdate(this.rowData.ExpectedInvoiceId, this.addInvoiceRetrivalForm.value).subscribe(data => {
        this.saveButtonLoadder = false;
        let errorData: any = {
          messgeType: "error",
          title: "Attention",
          titleClass: "text-c-blue",
          icon: "fas fa-exclamation-circle",
          iconClass: "text-c-blue f-70",
          message: 'Successfully saved'
        }
        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
        dialogRef.afterClosed().subscribe(result => {
          this.onUserAddEvent.emit(true);
        });
      }, error => {
        this.saveButtonLoadder = false;
        let errorData: any = {
          messgeType: "error",
          title: "Attention",
          titleClass: "text-c-blue",
          icon: "fas fa-exclamation-circle",
          iconClass: "text-c-blue f-70",
          message: error.error
        }
        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
        dialogRef.afterClosed().subscribe(result => {
        });
      });


    }
  }

  fetchDates() {
    if (this.addInvoiceRetrivalForm.value.BillingAccountID && this.addInvoiceRetrivalForm.value.invoiceBillDate) {

      const data = {
        BillingAccountID: this.addInvoiceRetrivalForm.value.BillingAccountID,
        invoiceDate: this.addInvoiceRetrivalForm.value.invoiceBillDate,
      };
      this.addInvoiceRetrivalForm.controls['InvoiceMonthYear'].setValue('');
      this.addInvoiceRetrivalForm.controls['ExpectedDate'].setValue('');
      this.addInvoiceRetrivalForm.controls['RetrievalDate'].setValue('');
      this.allCustomerSub = this.locationService.getInvoiceFetchDate(data).subscribe((datas) => {
        if (datas) {
          this.fetchDateData = datas;
          if (this.fetchDateData) {
            this.addInvoiceRetrivalForm.controls['InvoiceMonthYear'].setValue(this.fetchDateData.InvoiceMonthYear ? this.manageService.convertDate(this.fetchDateData.InvoiceMonthYear, 'datePicker') : '')
            this.addInvoiceRetrivalForm.controls['ExpectedDate'].setValue(this.fetchDateData.invoiceExpectedDate ? this.manageService.convertDate(this.fetchDateData.invoiceExpectedDate, 'datePicker') : '')
            this.addInvoiceRetrivalForm.controls['RetrievalDate'].setValue(this.fetchDateData.invoiceRetrievalDate ? this.manageService.convertDate(this.fetchDateData.invoiceRetrievalDate, 'datePicker') : '')
          }
        }
      });
    }
  }

  checkValidProcessDate() {
    if (!this.addInvoiceRetrivalForm.controls['ProcessedDate'].value) {
      this.addInvoiceRetrivalForm.controls['ProcessedDate'].setValue('');
    }
  }
  checkValidReceivedDate() {
    if (!this.addInvoiceRetrivalForm.controls['ReceivedDate'].value) {
      this.addInvoiceRetrivalForm.controls['ReceivedDate'].setValue('');
    }
  }
  checkValidBillDate() {
    if (!this.addInvoiceRetrivalForm.controls['invoiceBillDate'].value) {
      this.addInvoiceRetrivalForm.controls['invoiceBillDate'].setValue('');
    }
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  
    this._unsubscribeNotes.next(null);
    this._unsubscribeNotes.complete();
    this.setTemDDValueEvent.emit('');
    this._unsubscribeChangelog.next(null);
    this._unsubscribeChangelog.complete();
  }

  filterCustomerGridByTEMId() {
    this.customerList = [];
    if (this.addInvoiceRetrivalForm.value.TEM) {
      this.locationService.getCustomerDropdownByNewTEM(this.addInvoiceRetrivalForm.value.TEM)
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((data) => {
          if (data && data.Data.$values) {
            this.customerList = data.Data.$values;
          } else {
            let errorData: any = {
              messgeType: "error",
              title: "Attention",
              titleClass: "text-c-blue",
              icon: "fas fa-exclamation-circle",
              iconClass: "text-c-blue f-70",
              message: "Something Went Wrong"
            }
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
            dialogRef.afterClosed().subscribe(result => {
            });
          }
        }, error => {
          let errorData: any = {
            messgeType: "error",
            title: "Attention",

            titleClass: "text-c-blue",
            icon: "fas fa-exclamation-circle",
            iconClass: "text-c-blue f-70",
            message: 'No customer found within the selected TEM'
          }
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
          dialogRef.afterClosed().subscribe(result => {
          });
        });
    } else {
      this.getCustomerList();
    }
  }

  UploadInvoice() {
    const dialogRef = this.dialog.open(UploadInvoiceDialogComponent, {
      width: '900px',
      panelClass: 'addVendorProduct',
      data: {
        colseButton: true,
        expectedInvoiceID: this.rowData.ExpectedInvoiceId,
        fileName: this.invoiceRetrievalData?.InvoiceRetrievalPossibleFileNames?.$values[0]
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.showInvoice = result;
      this.getInvoiceRetrievalData();
      this.getInvoiceChangelogData();
    });
  }

  downloadInvoiceAttachment() {
    const fileName = this.generateFileName('Invoice');
    this.downloadinvoiceloader = true;
    this.locationService.downloadInvoiceAttachment(this.rowData.ExpectedInvoiceId).subscribe((res: any) => {
      const mimeType = res.type;
      const fileURL = URL.createObjectURL(res);
    
      // Map common MIME types to file extensions
      const mimeExtensionMap: { [key: string]: string } = {
        'application/pdf': '.pdf',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
        'application/zip': '.zip',
        'application/octet-stream': '', // fallback, may need filename from content-disposition
        'text/csv': '.csv'
      };
    
      // Get extension based on mimeType
      const extension = mimeExtensionMap[mimeType] || '';
    
      // Fallback filename
      const baseFileName = this.invoiceRetrievalData?.InvoiceRetrievalPossibleFileNames?.$values?.[0] || 'download';
    
      const a = document.createElement('a');
      a.href = fileURL;
      a.download = `${fileName}${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(fileURL);
    
      this.downloadinvoiceloader = false;
    })
  }

  generateFileName(fileType: 'Invoice' | 'template'): string {
    const removeNonAlphaNumerics = (input: string): string =>
      input.replace(/[^a-zA-Z0-9]/g, '');
  
    const formatDate = (date: Date): string => {
      const options = { month: 'short', day: '2-digit', year: 'numeric' } as const;
      return date.toLocaleDateString('en-US', options).replace(/,|\s/g, ''); 
    };
  
    const customer = removeNonAlphaNumerics(this.invoiceRetrievalData.CustomerAccountName);
    const vendor = removeNonAlphaNumerics(this.invoiceRetrievalData.VendorAccountName);
    const payable = removeNonAlphaNumerics(this.invoiceRetrievalData.PayableAccountNumber);
    const date = formatDate(new Date(this.invoiceRetrievalData.InvoiceBillDate));
  
    return `${customer}_${vendor}_${payable}_${date}_${fileType}`;
  }

  UploadDataFiles() {
    const dialogRef = this.dialog.open(UploaddatafilesComponent, {
      width: '900px',
      panelClass: 'addVendorProduct',
      data: {
        colseButton: true,
        expectedInvoiceID: this.rowData.ExpectedInvoiceId
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.getInvoiceRetrievalData();
      this.getInvoiceChangelogData();
    });
  }

  TerminateRetrievalDialog() {
    const dialogRef = this.dialog.open(TerminateRetDialogComponent, {
      width: '900px',
      panelClass: 'addVendorProduct',
      data: {
        colseButton: true,
        rowData: this.invoiceRetrievalData
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (result.type == 'terminateAndInactive') {
          this.locationService.terminateInvoiceRetrieval(this.rowData.ExpectedInvoiceId, true).subscribe((res: any) => {
            if (res.Success) {
              let errorData: any = {
                messgeType: "error",
                title: "Attention",
                titleClass: "text-c-blue",
                icon: "fas fa-exclamation-circle",
                iconClass: "text-c-blue f-70",
                message: res.Message
              }
              const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
              dialogRef.afterClosed().subscribe(result => {
                this.disableActions = true;
                this.getInvoiceRetrievalData();
                this.getInvoiceChangelogData();
              });
            } else {
              let errorData: any = {
                messgeType: "error",
                title: "Attention",
                titleClass: "text-c-blue",
                icon: "fas fa-exclamation-circle",
                iconClass: "text-c-blue f-70",
                message: res.Message
              }
              const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
              dialogRef.afterClosed().subscribe(result => {
              });
            }
          });
        }
        if (result.type == 'terminateOnly') {
          this.locationService.terminateInvoiceRetrieval(this.rowData.ExpectedInvoiceId).subscribe((res: any) => {
            if (res.Success) {
              let errorData: any = {
                messgeType: "error",
                title: "Attention",
                titleClass: "text-c-blue",
                icon: "fas fa-exclamation-circle",
                iconClass: "text-c-blue f-70",
                message: res.Message
              }
              const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
              dialogRef.afterClosed().subscribe(result => {
                this.disableActions = true;
                this.getInvoiceRetrievalData();
                this.getInvoiceChangelogData();
              });
            } else {
              let errorData: any = {
                messgeType: "error",
                title: "Attention",
                titleClass: "text-c-blue",
                icon: "fas fa-exclamation-circle",
                iconClass: "text-c-blue f-70",
                message: res.Message
              }
              const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
              dialogRef.afterClosed().subscribe(result => {
              });
            }
          });
        }
      }
    });
  }

  LastMonthData() {
   if(this.invoiceRetrievalData.IsExistPreviousMonthInvoiceRetrieval && (this.invoiceRetrievalData.DataRetrievalProcessingMethodDisplay == 'Automated Process' || this.invoiceRetrievalData.DataRetrievalProcessingMethodDisplay == 'Manual Upload (Mapped)')) {
      const dialogRef = this.dialog.open(LastMonthDataDialogComponent, {
        width: '700px',
        panelClass: 'addVendorProduct',
        data: {
          colseButton: true,
          expectedInvoiceID: this.rowData.ExpectedInvoiceId,
          PreviousInvoiceId: this.invoiceRetrievalData.PreviousInvoiceId,
          isExistInvoice: this.invoiceRetrievalData.IsExistPreviousMonthInvoiceRetrieval
        },
        disableClose: true
      });
      dialogRef.afterClosed().subscribe((result) => {
      });
    } else {
      const dialogRef = this.dialog.open(LastMonthDataYesComponent, {
        width: '900px',
        panelClass: 'addVendorProduct',
        data: {
          closeButton: true,
          data : this.rowData.ExpectedInvoiceId,
          PreviousInvoiceId: this.invoiceRetrievalData.PreviousInvoiceId,
          isExistInvoice: this.invoiceRetrievalData.IsExistPreviousMonthInvoiceRetrieval
        },
        disableClose: true
      });
      dialogRef.afterClosed().subscribe((result) => {
      });
    }
    
  }

  invoiceRetrievalDeactive() {

    let errorData: any = {
      okBtnName: "Delete",
      closeBtnName: "Cancel",
      messgeType: "error",
      title: "Attention",
      titleClass: "text-c-blue",
      icon: "fas fa-exclamation-circle",
      iconClass: "text-c-blue f-70",
      message: 'You are about to delete this retrieval record.  Continue?'
    };
    const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
    dialogRef.afterClosed().subscribe(result => {
      if (!isValuesUndefined(result)) {
        if (result) {
          this.locationService.invoiceRetrievalDeactive(this.rowData.ExpectedInvoiceId).subscribe({
            next: data => {
              if (data) {
                let errorData: any = {
                  messgeType: "error",
                  title: "Attention",
                  titleClass: "text-c-blue",
                  icon: "fas fa-exclamation-circle",
                  iconClass: "text-c-blue f-70",
                  message: 'Deleted Successfully!'
                };
                const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
                dialogRef.afterClosed().subscribe(result => {
                  this.onUserAddEvent.emit(true);
                });
              }
            },
            error: error => {
              if (error.status === 404) {
                let errorData: any = {
                  messgeType: "error",
                  title: "Attention",
                  titleClass: "text-c-blue",
                  icon: "fas fa-exclamation-circle",
                  iconClass: "text-c-blue f-70",
                  message: error.error
                };
                const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
                dialogRef.afterClosed().subscribe(result => {

                });
              }
            }
          });
        }
      }
    });
  }

  openEditBillingAccountTab() {
    const datas: any = {};
    const billingAccountNumber = this.billingAccount.find((f: any) => {
      return f.BillingAccount.$values[0].Id == this.addInvoiceRetrivalForm.value.BillingAccountID
    }).AccountNumber;
    datas['PayableAccountNumber'] = billingAccountNumber;
    datas['BillingAccountID'] = this.addInvoiceRetrivalForm.value.BillingAccountID;
    datas['selectedTab'] = 0;
    this.openEditBillingTab.emit(datas);

  }

  editAccountDetail(which: string) {
    const datas: any = {};
    datas['PayableAccountNumber'] = this.addInvoiceRetrivalFormNew.value.PayableAccount;
    datas['BillingAccountID'] = this.invoiceRetrievalData.BillingAccountId;
    if (which == 'Account') {
      datas['selectedTab'] = 0;
    }
    if (which == 'InvoiceDataRetrieval') {
      datas['selectedTab'] = 1;
    }
    this.openEditBillingTab.emit(datas);
  }

}
