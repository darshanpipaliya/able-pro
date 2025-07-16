import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core'
import { MatDialog } from '@angular/material/dialog';
import { ContractUploadFileComponent } from '../contract-upload-file/contract-upload-file.component';
import moment from 'moment';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import _ from 'lodash';
import { DownloadDocCellRendererComponent } from './download-doc-cell-renderer.component';
import { LocationService } from 'src/app/services/location.service';
import { ContractService } from 'src/app/services/contract.service';
import { ManageService } from 'src/app/services/manage.service';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { checkIsValueExists, isValueExist, isValuesUndefined } from 'src/app/services/helper';
import { FileUploadPopupComponent } from 'src/app/common/file-upload-popup/file-upload-popup.component';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { DatePipe } from '@angular/common';
import { CustomPipe } from 'src/app/custom-pipe/date.pipe';
import { CommonPTreeTableComponent } from 'src/app/common/common-p-tree-table/common-p-tree-table.component';
import { api_list } from 'src/app/services/api-list';
import { createColumn } from 'src/app/utils/column-utils';

@Component({
  selector: 'app-add-edit-contracts',
  templateUrl: './add-edit-contracts.component.html',
  styleUrls: ['./add-edit-contracts.component.scss'],
  standalone: true,
  imports: [
    SharedModule,
    PrimgModule,
    CommonPTreeTableComponent
  ],
  providers: [DatePipe, CustomPipe]
})
export class AddEditContractsComponent implements OnInit {

  contractForm: FormGroup;

  @Input() action: any;
  @Input() docType: any;
  @Input() contractId: any;
  @Input() addendumId: any;

  @Input() selectedTem: any;
  @Input() rowData: any;
  @Input() gridData: any;
  @Input() fromInventory: any;

  @Input() fromTab: any;
  setMindate: any;

  public sideBar: any;
  public columnDefs: any;
  public rowSelection: any;
  public documentNameLabled: any;
  public selectedVendor: any;
  public selectedCustomer: any;
  public selectedCompany: any;
  public uploadedFile = null;
  public currentSelected: any;
  public contratType: any;
  isReloadGrid = false;

  isDisableSave = false;
  customers: any = [];
  containerData: any = [];
  monthsData: any = [];
  vendorsList: any = [];
  customerList: any = [];
  companyList: any = [];
  contractDetail: any;
  stopSpinner: boolean = false;
  loadingCompanyList: boolean = false;
  isDisabled: boolean = false;
  isContractFormSubmit: boolean = false;
  saveButtonLoadder: boolean = false;
  disableWithoutDate: boolean = true;
  disableOnCustomerChange: boolean = false;

  currentContractId: any;
  defaultColDef = {
    sortable: true,
    minWidth: 100,
    filter: true,
    resizable: true,
    floatingFilter: true,
    flex: 1,
  };

  documentTypeOptions = [
    { Id: 'Contract', AccountName: 'Contract' },
    { Id: 'Addendum', AccountName: 'Addendum' },
  ];

  statusList = [
    { Id: true, Name: 'Active' },
    { Id: false, Name: 'Inactive' },
  ];

  autoRenewalList = [
    { Id: true, Name: 'Yes' },
    { Id: false, Name: 'No' },
  ];

  currencyList = [
    { Id: true, Name: 'Active' },
    { Id: false, Name: 'Inactive' },
  ];
  frameworkComponents;

  @ViewChild('contractMainTooltip') contractMainTooltip!: TemplateRef<any>;
  @ViewChild('termMainTooltip') termMainTooltip!: TemplateRef<any>;

  @Output() closeAddAddmTab: EventEmitter<any> = new EventEmitter<any>();
  @Output() closeAddContractTab: EventEmitter<any> = new EventEmitter<any>();
  @Output() onLoadEditContract: EventEmitter<any> = new EventEmitter<any>();
  @Output() onLoadEditContractFromInventory: EventEmitter<any> = new EventEmitter<any>();
  @Output() onContractDetail: EventEmitter<any> = new EventEmitter<any>();
  @Output() onDisablePlusButton: EventEmitter<any> = new EventEmitter<any>();
  @Output() onContractAddEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() contractName: EventEmitter<any> = new EventEmitter<any>();
  @Output() setCustomerDDValueEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() setTemDDValueEvent: EventEmitter<any> = new EventEmitter<any>();

  private _unsubscribeCompany: Subject<any> = new Subject<any>();
  private _unsubscribeContract: Subject<any> = new Subject<any>();
  private _unsubscribeCurrency: Subject<any> = new Subject<any>();
  private _unsubscribeAllCustomer: Subject<any> = new Subject<any>();
  private _unsubscribeContractEdit: Subject<any> = new Subject<any>();
  private _unsubscribeContainer: Subject<any> = new Subject<any>();

  @ViewChild(CommonPTreeTableComponent) CommonPTreeTableComponent!: CommonPTreeTableComponent;

  refreshbutton: boolean = false;
  payload: any;
  childPayload: any;
  GridAPI: any = api_list.Contract.Contract.ContractDetail;
  cols: any = [];
  ids: any = [];
  constructor(private locationService: LocationService,
    private fb: FormBuilder,
    public dialog: MatDialog,
    private contractService: ContractService,
    private manageService: ManageService) {
    this.columnDefs = [
      {
        headerName: 'Attachment',
        children: [
          {
            field: 'Document',
            headerName: 'Document',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 123,
            cellRenderer: DownloadDocCellRendererComponent,
          },
        ],
      },
      {
        headerName: 'Vendor',
        children: [
          {
            field: 'Vendor',
            headerName: 'Vendor',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 101
          },
        ],
      },
      {
        headerName: 'Organization',
        children: [
          {
            field: 'Customer',
            headerName: 'Customer',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 180
          },
          {
            field: 'Company',
            headerName: 'Company',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 180
          }
        ],
      },
      {
        headerName: 'Overview',
        children: [
          {
            field: 'Type',
            headerName: 'Type of Document',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 178
          },
          {
            field: 'Name',
            headerName: 'Document Name',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 200
          },
          {
            field: 'StatusDisplay',
            headerName: 'Status',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 115
          },
          {
            field: 'DocumentNumber',
            headerName: 'Internal Contract Number',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 240
          }
        ],
      },
      {
        headerName: 'Terms',
        children: [
          {
            field: 'StartDate',
            headerName: 'Start Date',
            columnGroupShow: 'close',
            filter: 'agDateColumnFilter',
            editable: false,
            minWidth: 135,
          },
          {
            field: 'EndDate',
            headerName: 'End Date',
            columnGroupShow: 'close',
            filter: 'agDateColumnFilter',
            editable: false,
            minWidth: 135,


          },
          {
            field: 'ContractTerm',
            headerName: 'Contract Term',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 149
          },
          {
            field: 'MonthsRemaining',
            headerName: 'Months Remaining',
            columnGroupShow: 'close',
            filter: 'agNumberColumnFilter',
            editable: false,
            minWidth: 181
          },
          {
            field: 'NoticePeriod',
            headerName: 'Notice Period',
            columnGroupShow: 'open',
            filter: 'agNumberColumnFilter',
            editable: false,
            minWidth: 145
          },
          {
            field: 'ReminderDays',
            headerName: 'Reminder Period',
            columnGroupShow: 'open',
            filter: 'agNumberColumnFilter',
            editable: false,
            minWidth: 175
          },
          {
            field: 'AutoRenewalDisplay',
            headerName: 'Auto-Renewal',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 139
          }
        ],
      }
    ];

    this.frameworkComponents = { DownloadDocCellRendererComponent: DownloadDocCellRendererComponent }
  }

  setCols() {
    let currentParent = 0;
    const getParentId = (isChild: boolean) => isChild ? ++currentParent : currentParent;

    this.cols = [];

    // Checkbox
    const checkboxParent = getParentId(true);
    this.cols.push(createColumn(checkboxParent, '60px', true, 'checkbox', '', 'checkbox', ''));

    // Attachment
    const attachmentParent = getParentId(true);
    this.cols.push(createColumn(attachmentParent, '123px', true, 'icon', 'Attachment', 'Document', 'Document'));

    // Vendor
    const vendorParent = getParentId(true);
    this.cols.push(createColumn(vendorParent, '101px', true, 'text', 'Vendor', 'Vendor', 'Vendor'));

    // Organization
    const orgParent = getParentId(true);
    this.cols.push(createColumn(orgParent, '180px', true, 'text', 'Organization', 'Customer', 'Customer'));
    this.cols.push(createColumn(orgParent, '180px', false, 'text', '', 'Company', 'Company'));

    // Overview
    const overviewParent = getParentId(true);
    this.cols.push(createColumn(overviewParent, '178px', true, 'text', 'Overview', 'Type', 'Type of Document', 'close'));
    this.cols.push(createColumn(overviewParent, '200px', false, 'text', '', 'Name', 'Document Name', 'close'));
    this.cols.push(createColumn(overviewParent, '115px', false, 'text', '', 'StatusDisplay', 'Status', 'close'));
    this.cols.push(createColumn(overviewParent, '240px', false, 'text', '', 'DocumentNumber', 'Internal Contract Number', 'open'));

    // Terms
    const termsParent = getParentId(true);
    this.cols.push(createColumn(termsParent, '135px', true, 'dateFilter', 'Terms', 'StartDate', 'Start Date', 'close'));
    this.cols.push(createColumn(termsParent, '135px', false, 'dateFilter', '', 'EndDate', 'End Date', 'close'));
    this.cols.push(createColumn(termsParent, '149px', false, 'text', '', 'ContractTerm', 'Contract Term', 'close'));
    this.cols.push(createColumn(termsParent, '181px', false, 'numberFilter', '', 'MonthsRemaining', 'Months Remaining', 'close'));
    this.cols.push(createColumn(termsParent, '145px', false, 'numberFilter', '', 'NoticePeriod', 'Notice Period', 'open'));
    this.cols.push(createColumn(termsParent, '175px', false, 'numberFilter', '', 'ReminderDays', 'Reminder Period', 'open'));
    this.cols.push(createColumn(termsParent, '139px', false, 'text', '', 'AutoRenewalDisplay', 'Auto-Renewal', 'open'));
  }

  refreshbuttonEmitFn(event: any) {
    this.refreshbutton = event;
  }
  selectedNode: any;
  onNodeSelect(event: any) {
    this.selectedNode = event.node;
  }
  tableDataExist: any;
  tableDataExistFn(event: any) {
    this.tableDataExist = event;
  }
  exportData: any;
  exportAccountDataFn(event: any) {
    this.exportData = event;
  }

  selectedRows: any;
  selectedRowsEmitFn(event: any) {
    this.selectedRows = event;
    this.onSelectionChanged(this.selectedRows);

  }

  rowCellDoubleClickedFn(event: any) {

  }
  totalRecords: any;
  totalRecordsEmitFn(event: any) {

    this.onDisablePlusButton.emit(false);
    this.totalRecords = event;
  }
  loader: boolean = false;
  loaderEmitFn(event: any) {
    this.loader = event;
  }


  setColumnDefs() {
    this.CommonPTreeTableComponent.setColumnDefs();
  }

  onNodeClickEmitFn(event: any) {
  }
  ngOnInit(): void {



    this.setCols();
    if (this.action !== 'New') {

      let id: any;
      if (this.action == 'Edit') {
        this.onLoadEditContract.emit(this.rowData);
        this.onDisablePlusButton.emit(true);
        id = this.rowData?.ContractId ? this.rowData?.ContractId : this.contractId;
        this.currentContractId = id;
      }

      if (this.action === 'NewAddm') {
        const obj = this.gridData?.rowData?.data;
        id = this.gridData?.rowData?.data?.ContractId;
        this.currentContractId = id;

        setTimeout(() => {
          this.formateLabelForDocumentNameEdit('Addendum', obj.VendorAccountId, obj.CompanyId, obj.CustomerAccountId);
        }, 2500);
      }

      let type = this.fromTab == 'inventory' ? 'ASC' : 'DESC';

      this.locationService.replacedValue$.subscribe((res: any) => {
        if (res) {
          id = res;
          this.ids = {
            ContractId: id,
            Type: type
          }

        } else {
          this.ids = {
            ContractId: id,
            Type: type
          }
        }
      });

      this.ids = {
        ContractId: id,
        Type: type
      }
    }
    this.getGetContractMonths();
    this.setContractsForm();
    this.getVendorDropdown();
    this.getCustomerList();
    this.getCurrencies();

  }

  filterNumber(event: any, key: any) {
    let value = event.target.value;

    value = value.replace(/[^0-9.-]/g, '');
    if (value.indexOf('-') !== 0) {
      value = value.replace(/-/g, '');
    }
    if ((value.match(/\./g) || []).length > 1) {
      value = value.replace(/\.+$/, '');
    }

    if (value.includes('-')) {
      let outputString = value.startsWith('-')
        ? '-' + value.slice(1).replace(/-/g, '')
        : value.replace(/-/g, '');
      this.f[key].patchValue(outputString);

    } else {
      this.f[key].patchValue(value);
    }
  }

  openTooltipDialog() {
    const dialogRef = this.dialog.open(this.termMainTooltip, {
      width: '900px',
      data: {
        colseButton: true,
      }
    });
  }

  changeStatus() {
    if (this.f['Active'].value == false) {
      let type = this.action == 'New' || this.action == 'Edit' ? 'Contract' : 'Addendum';
      let errorData: any = {
        messgeType: 'error',
        title: 'Attention',
        titleClass: 'text-c-blue',
        icon: 'fas fa-question-circle',
        iconClass: 'text-c-blue f-70',
        okBtnName: 'Close & Review',
        closeBtnName: 'Yup, please do this!',
        message: `The active ${this.f['DocumentType'].value ? this.f['DocumentType'].value : type} selected will be marked Inactive`,
      };
      const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
        panelClass: 'error-warning',
        data: errorData,
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (checkIsValueExists(result) || isValuesUndefined(result)) {
          this.setValueInFormControl('Active', true)
        } else {

          this.setValueInFormControl('Active', false)
        }
      });
    }
  }

  sendEditContractFromInventory(data: any, callDetailAPI = false) {
    if (this.fromInventory || callDetailAPI) {
      this.contractService.getContractOrAddendumDetails(data[0].Id, data[0].Type).subscribe(async (data: any) => {
        if (data.Success) {
          this.onLoadEditContractFromInventory.emit(data.Data)
        }
      });
    }
  }

  onSelectionChanged(event: any) {

    this.currentSelected = event[0];
    if (!this.currentSelected.IsEditable) {
      this.isDisableSave = true;
      this.contractForm.disable();
    } else {
      this.isDisableSave = false;
      this.contractForm.enable();
    }
    if (this.action == 'Edit') {
      this.uploadedFile = null;
      this.isContractFormSubmit = false;
      this.contractService.getContractOrAddendumDetails(event[0].Id, event[0].Type).subscribe(async (data: any) => {
        this.contractDetail = data.Data;
        this.onContractDetail.emit(this.contractDetail)

        if (data.Success) {
          this.setValueInFormControl('DocumentType', isValueExist(this.contractDetail.Overview.DocumentType));
          this.setValueInFormControl('VendorId', isValueExist(this.contractDetail.Overview.VendorId));
          this.setValueInFormControl('CustomerId', isValueExist(this.contractDetail.Overview.CustomerId));
          this.onCustomerSelect({ value: this.contractDetail.Overview.CustomerId })
          this.setValueInFormControl('CompanyId', isValueExist(this.contractDetail.Overview.CompanyId));
          this.setValueInFormControl('DocumentName', isValueExist(this.contractDetail.Overview.DocumentName));
          this.setValueInFormControl('VendorDocumentName', isValueExist(this.contractDetail.Overview.VendorDocumentName));
          this.setValueInFormControl('InternalDocumentNumber', isValueExist(this.contractDetail.Overview.InternalDocumentNumber));
          this.setValueInFormControl('VendorDocumentNumber', isValueExist(this.contractDetail.Overview.VendorDocumentNumber));
          this.setValueInFormControl('CurrencyId', isValueExist(this.contractDetail.CurrencyId));
          this.setValueInFormControl('Active', isValueExist(this.contractDetail.Overview.Status));
          this.setValueInFormControl('Description', isValueExist(this.contractDetail.Overview.Discription));

          this.setValueInFormControl('AnnualRevenueCommitment', isValueExist(this.contractDetail.Commitments.AnnualRevenueAmount));
          this.setValueInFormControl('InventoryCommitment', isValueExist(this.contractDetail.Commitments.InventoryCommitmentAmount));
          this.setValueInFormControl('MonthlyRevenueCommitment', isValueExist(this.contractDetail.Commitments.MonthlyRevenueAmount));
          this.setValueInFormControl('OtherCommitment', isValueExist(this.contractDetail.Commitments.OtherAmount));
          this.setValueInFormControl('CommitmentNotes', isValueExist(this.contractDetail.Commitments.Notes));

          this.setValueInFormControl('ServiceDiscount', isValueExist(this.contractDetail.Discounts.ServiceDiscount));
          this.setValueInFormControl('FeatureDiscount', isValueExist(this.contractDetail.Discounts.FeatureDiscount));
          this.setValueInFormControl('EquipmentDiscount', isValueExist(this.contractDetail.Discounts.EquipmentDiscount));
          this.setValueInFormControl('OtherDiscount', isValueExist(this.contractDetail.Discounts.OtherDiscount));

          this.setValueInFormControl('InstallationFees', isValueExist(this.contractDetail.Fees.InstallationFees));
          this.setValueInFormControl('ActivationFees', isValueExist(this.contractDetail.Fees.ActivationFees));
          this.setValueInFormControl('ConstructionFees', isValueExist(this.contractDetail.Fees.ConstructionFees));
          this.setValueInFormControl('OtherFees', isValueExist(this.contractDetail.Fees.OtherFees));
          this.setValueInFormControl('FeeNotes', isValueExist(this.contractDetail.Fees.Notes));

          this.setValueInFormControl('DiscountNotes', isValueExist(this.contractDetail.Discounts.Notes));

          this.setValueInFormControl('StartDate', this.contractDetail.Terms.StartDate ? isValueExist(this.manageService.convertDate(this.contractDetail.Terms.StartDate, '', '/')) : '');
          this.setValueInFormControl('EndDate', this.contractDetail.Terms.EndDate ? isValueExist(this.manageService.convertDate(this.contractDetail.Terms.EndDate, '', '/')) : '');

          this.setValueInFormControl('ContractTerm', isValueExist(this.contractDetail.Terms.ContractTerm) ? this.contractDetail.Terms.ContractTerm + ' Months' : '');
          this.setValueInFormControl('MonthsRemaining', isValueExist(this.contractDetail.Terms.MonthsRemaining) ? this.contractDetail.Terms.MonthsRemaining + ' Months' : '');
          this.setValueInFormControl('ReminderDaysAlarmId', isValueExist(this.contractDetail.Terms.ReminderPeriodId));
          this.setValueInFormControl('NoticePeriodId', isValueExist(this.contractDetail.Terms.NoticePeriodId));
          this.setValueInFormControl('AutoRenewal', isValueExist(this.contractDetail.Terms.AutoRenewal));
          this.setValueInFormControl('CustomPaymentTerms', isValueExist(this.contractDetail.Terms.CustomPaymentTerms));
          this.setValueInFormControl('TermNotes', isValueExist(this.contractDetail.Terms.Notes));

          this.setValueInFormControl('EarlyTerminationFee', isValueExist(this.contractDetail.Termination.EarlyTerminationPenalty));

          this.setValueInFormControl('TerminationFees', isValueExist(this.contractDetail.Termination.TerminationFees));
          this.setValueInFormControl('TerminationNotes', isValueExist(this.contractDetail.Termination.Notes));

          this.setValueInFormControl('ActivationCreditAmount', isValueExist(this.contractDetail.Credits.ActivationCreditAmount));
          this.setValueInFormControl('SpendCreditAmount', isValueExist(this.contractDetail.Credits.SpendCreditAmount));
          this.setValueInFormControl('OtherCreditAmount', isValueExist(this.contractDetail.Credits.OtherCreditAmount));
          this.setValueInFormControl('GuaranteedCreditAmount', isValueExist(this.contractDetail.Credits.GuaranteedCreditAmount));

          this.setValueInFormControl('NumberOfTerminationWaivers', isValueExist(this.contractDetail.Credits.NoOfTerminationFeesWaivers));
          this.setValueInFormControl('NumberOfJointActtermFees', isValueExist(this.contractDetail.Credits.GuaranteedCreditAmount));
          this.setValueInFormControl('NumberOfActivationFees', isValueExist(this.contractDetail.Credits.NoOfJointActivationTerminationFeeWaivers));

          this.setValueInFormControl('CreditNotes', isValueExist(this.contractDetail.Credits.Notes));
          this.setCustomerDDValueEvent.emit(this.contractDetail.Overview.CustomerId);
          this.setTemDDValueEvent.emit(this.contractDetail.Overview.TEMAccountId);

          setTimeout(() => {
            this.formateLabelForDocumentNameEdit(this.contractDetail.Overview.DocumentType, this.contractDetail.Overview.VendorId, this.contractDetail.Overview.CompanyId, this.contractDetail.Overview.CustomerId);

            let documentNameLabled = this.f['DocumentName'].value.trim();
            let selectedVendor = this.selectedVendor.trim();
            let selectedCompany = this.selectedCompany?.trim();
            let selectedCustomer = this.selectedCustomer?.trim();

            let docType = this.f['DocumentType'].value.trim();

            let stringToReplace = `${selectedVendor}-${selectedCustomer}-${selectedCompany}-${docType}-`;
            let docName = documentNameLabled.replace(stringToReplace, "");
            this.f['Label'].patchValue(docName);
          }, 1100);
        }
      })
    }
  }

  setContractsForm() {
    this.contractForm = this.fb.group({
      DocumentType: new FormControl('', [Validators.required]),
      VendorId: new FormControl('', [Validators.required]),
      CustomerId: new FormControl('', [Validators.required]),
      CompanyId: new FormControl(''),
      DocumentName: new FormControl(''),
      VendorDocumentName: new FormControl(''),
      InternalDocumentNumber: new FormControl(''),
      VendorDocumentNumber: new FormControl(''),
      CurrencyId: new FormControl('', [Validators.required]),
      Active: new FormControl(true),
      Description: new FormControl('', [Validators.maxLength(1000)]),
      AnnualRevenueCommitment: new FormControl(''),
      MonthlyRevenueCommitment: new FormControl(''),
      InventoryCommitment: new FormControl(''),
      OtherCommitment: new FormControl(''),
      CommitmentNotes: new FormControl('', [Validators.maxLength(1000)]),
      ServiceDiscount: new FormControl(''),
      EquipmentDiscount: new FormControl(''),
      FeatureDiscount: new FormControl(''),
      OtherDiscount: new FormControl(''),
      DiscountNotes: new FormControl('', [Validators.maxLength(1000)]),
      InstallationFees: new FormControl(''),
      ActivationFees: new FormControl(''),
      ConstructionFees: new FormControl(''),
      OtherFees: new FormControl(''),
      FeeNotes: new FormControl('', [Validators.maxLength(1000)]),
      StartDate: new FormControl(''),
      EndDate: new FormControl(''),
      AutoRenewal: new FormControl(true),
      NoticePeriodId: new FormControl(''),
      ReminderDaysAlarmId: new FormControl(''),
      MonthsRemaining: new FormControl(''),
      CustomPaymentTerms: new FormControl(''),
      TermNotes: new FormControl('', [Validators.maxLength(1000)]),
      EarlyTerminationFee: new FormControl(false),
      TerminationFees: new FormControl(''),
      TerminationNotes: new FormControl('', [Validators.maxLength(1000)]),
      ActivationCreditAmount: new FormControl(''),
      SpendCreditAmount: new FormControl(''),
      OtherCreditAmount: new FormControl(''),
      GuaranteedCreditAmount: new FormControl(''),
      NumberOfActivationFees: new FormControl(''),
      NumberOfTerminationWaivers: new FormControl(''),
      NumberOfJointActtermFees: new FormControl(''),
      CreditNotes: new FormControl('', [Validators.maxLength(1000)]),
      FileAttachment: new FormControl(''),
      ContractTerm: new FormControl(''),
      Label: new FormControl('')
    });

    if (this.action === 'New') {
      this.f['DocumentType'].patchValue('Contract');
    } else if (this.action !== 'New' && this.action !== 'Edit') {
      this.f['DocumentType'].patchValue('Addendum');
    }
  }

  getContractContainerbyId(contractId: any, reload = false, callDetailAPI = false) {
    if (reload) {
      this.isReloadGrid = false;
    }
    this.containerData = [];

    let type = this.fromTab == 'inventory' ? 'ASC' : 'DESC';
    this._unsubscribeContainer.next(null);
    this.contractService.getContractContainerbyId(contractId, type).pipe(takeUntil(this._unsubscribeContainer)).subscribe(async (data: any) => {
      if (data.Success) {
        this.containerData = data.Data.$values;


        if (this.addendumId) {
          this.isReloadGrid = true;
          const result = _.findIndex(this.containerData, { Type: this.docType, Id: this.addendumId });
          this.containerData[result]['isChecked'] = true;

        } else {
          this.isReloadGrid = true;
          if (this.containerData.length > 0 && this.action == 'Edit') {
            this.containerData[0]['isChecked'] = true;

          }
        }
        this.sendEditContractFromInventory(this.containerData, callDetailAPI);

      } else {
        this.containerData = [];
      }
    }, error => {
      this.containerData = [];
    });
  }

  getGetContractMonths() {
    this.contractService.getGetContractMonths().subscribe((data: any) => {
      if (data) {
        this.monthsData = data.Data.$values;
      }
    }, error => {
      this.monthsData = [];
    });
  }

  getVendorDropdown() {
    this.locationService.getVendorDropdown().subscribe((data) => {
      if (data && data.Data.$values) {
        this.vendorsList = data.Data.$values;

        if (this.action == 'NewAddm') {
          this.setValueInFormControl('VendorId', isValueExist(this.gridData?.rowData?.data.VendorAccountId));
          this.setValueInFormControl('CustomerId', isValueExist(this.gridData?.rowData?.data.CustomerAccountId));
          this.onCustomerSelect({ value: this.gridData?.rowData?.data.CustomerAccountId })
          this.setValueInFormControl('CompanyId', isValueExist(this.gridData?.rowData?.data.CompanyId));

        }
      }
    }, error => {
      this.vendorsList = [];
    });
  }

  getCompany(id: any) {
    this.loadingCompanyList = true;
    this._unsubscribeCompany.next(null);
    this.locationService.getCompanyByCustomerId(id).pipe(takeUntil(this._unsubscribeCompany)).subscribe((data) => {
      if (data && data.$values) {
        this.companyList = data.$values;

        let obj = {
          CompanyID: '',
          CompanyName: "All"
        }
        this.companyList.unshift(obj);

        this.loadingCompanyList = false;
      } else {
        this.loadingCompanyList = false;
        this.companyList = [];
      }
    }, error => {
      this.loadingCompanyList = false;
      this.companyList = [];
    });
  }

  onCustomerSelect($event: any) {
    if ($event) {

      if (this.customerList?.length) {
        this.customerList.find((res: any) => {
          if (res.Id === $event.value) {
            this.selectedCustomer = res.AccountName;
          }
        });
      }

      this.getCompany($event.value);
      this.f['DocumentName'].patchValue('');
      this.f['CompanyId'].patchValue('');
      this.disableOnCustomerChange = true;
    } else {
      this.companyList = [];
      this.disableOnCustomerChange = false;
    }
  }

  onChangeEndDate($event: any, type: any) {
    let date;
    let endDate;

    if (type == 'start') {
      if (this.f['EndDate'].value) {
        date = new Date($event);
        endDate = new Date(this.f['EndDate'].value);
        this.setMindate = date;
        if (date > endDate) {
          this.f['EndDate'].patchValue('');
        }
      } else {
        date = new Date($event);
        this.setMindate = date;
      }
    }

    if ($event && (this.f['StartDate'].value && this.f['EndDate'].value)) {
      // this.disableWithoutDate = false;
      this.setContractTerm(this.f['StartDate'].value, this.f['EndDate'].value);
      this.setMonthRemianed(this.f['EndDate'].value);
    } else {
      this.disableWithoutDate = true;
    }

    if (type == 'end' && !isValueExist(this.f['StartDate'].value) && isValueExist(this.f['EndDate'].value)) {
      this.contractForm.get('StartDate')?.setValidators([Validators.required])
    } else if (type == 'start' && !isValueExist(this.f['EndDate'].value) && isValueExist(this.f['StartDate'].value)) {
      this.contractForm.get('EndDate')?.setValidators([Validators.required])
    }

    if (type == 'end' && $event === null && isValueExist(this.f['StartDate'].value)) {
      this.contractForm.get('EndDate')?.setValidators([Validators.required])
    }
    if (type == 'start' && $event === null && isValueExist(this.f['EndDate'].value)) {
      this.contractForm.get('StartDate')?.setValidators([Validators.required])
    }

    if ((type == 'start' || type == 'end') && isValueExist(this.f['StartDate'].value) && isValueExist(this.f['EndDate'].value)) {
      this.contractForm.get('StartDate')?.setValidators([Validators.required])
      this.contractForm.get('EndDate')?.setValidators([Validators.required])
    }

    if ((type == 'start' || type == 'end') && !isValueExist(this.f['StartDate'].value) && !isValueExist(this.f['EndDate'].value)) {
      this.contractForm.get('StartDate')?.setValidators([])
      this.contractForm.get('EndDate')?.setValidators([])
    }

    this.contractForm.get('StartDate')?.updateValueAndValidity();
    this.contractForm.get('EndDate')?.updateValueAndValidity();
  }

  setContractTerm(date1: any, date2: any) {
    if (this.action == 'Edit') {
      date1 = new Date(date1)
      date2 = new Date(date2)
    }
    let months = this.calculateMonthsDifference(date1, date2);
    months = months <= 0 ? 0 : months;
    let label = months >= 0 ? months + ' Months' : '';
    this.f['ContractTerm'].patchValue(label);
  }

  calculateMonthsDifference(startDate: any, endDate: any) {
    const startDt = new Date(startDate);
    const endDt = new Date(endDate);

    const yearDifference = endDt.getFullYear() - startDt.getFullYear();
    const monthDifference = endDt.getMonth() - startDt.getMonth();

    let months = (yearDifference * 12) + monthDifference;

    if (endDt.getDate() >= startDt.getDate()) {
      months++;
    }

    return months;
  }

  setMonthRemianed(endDate: any) {
    if (this.action == 'Edit') {
      endDate = new Date(endDate)
    }
    let today = new Date();
    let months = this.calculateMonthsDifference(today, endDate);
    months <= 0 ? 0 : months;
    let label = months + ' Months';
    this.f['MonthsRemaining'].patchValue(label);
  }

  getCurrencies() {
    this.locationService
      .getCurrencies()
      .pipe(takeUntil(this._unsubscribeCurrency))
      .subscribe((data) => {
        if (data && data.$values) {
          this.currencyList = data.$values;
          const foundIdx = this.currencyList.findIndex(
            (el: any) => el['CurrencyCode'] == 'USD'
          );
          let currenyItem: any = this.currencyList[foundIdx];
          this.currencyList.splice(foundIdx, 1);
          this.currencyList = _.cloneDeep(this.currencyList);
          this.currencyList.unshift(currenyItem);
          this.currencyList.map((c: any) => {
            let a: any = {};
            a = c;
            a['label'] = c['CurrencyCode'] + '/' + c['Name'] + '/' + c['Symbol'];
            return a;
          });

        }
      });
  }

  formateLabelForDocumentNameEdit(type: any, vendor: any, company?: any, customer?: any) {
    let a = type;
    let selectedVendor;
    let selectedCompany;
    let selectedCustomer;

    if (vendor) {
      this.vendorsList.find((res: any) => {
        if (res.Id === vendor) {
          selectedVendor = res.AccountName;
          this.selectedVendor = selectedVendor;
        }
      });
    }

    if (customer) {
      this.disableOnCustomerChange = false;
      if (this.customerList?.length) {
        this.customerList.find((res: any) => {
          if (res.Id === customer) {
            selectedCustomer = res.AccountName;
            this.selectedCustomer = selectedCustomer;
          }
        });
      }
    }

    if (company) {
      this.disableOnCustomerChange = false;
      if (this.companyList?.length) {
        this.companyList.find((res: any) => {
          if (res.CompanyID === company) {
            selectedCompany = res.CompanyName;
            this.selectedCompany = selectedCompany;
          }
        });
      }
    }

    if (selectedCompany) {
      if (a && selectedVendor && selectedCustomer) {
        this.documentNameLabled = selectedVendor + '-' + selectedCustomer + '-' + selectedCompany + '-' + a + '-';
        if (this.action == 'NewAddm') {
          this.f['DocumentName'].patchValue(this.documentNameLabled);
        }
      }
    } else {
      this.documentNameLabled = selectedVendor + '-' + selectedCustomer + '-' + a + '-';
      if (this.action == 'NewAddm') {
        this.f['DocumentName'].patchValue(this.documentNameLabled);
      }
    }

  }

  formateLabelForDocumentName($event: any, type: any) {
    let a = this.f['DocumentType'].value;

    if ($event && type === 'Vendor') {
      this.vendorsList.find((res: any) => {
        if (res.Id === $event.value) {
          this.selectedVendor = res.AccountName;
        }
      });
    }
    if ($event && type === 'company') {
      this.disableOnCustomerChange = false;
      this.companyList.find((res: any) => {
        if (res.CompanyID === $event.value) {
          this.selectedCompany = res.CompanyName;
        }
      });
    }

    if (this.selectedCompany && this.selectedCompany !== 'All') {
      if (a && this.selectedVendor && this.selectedCustomer) {
        this.documentNameLabled = this.selectedVendor + '-' + this.selectedCustomer + '-' + this.selectedCompany + '-' + a + '-';
        this.f['DocumentName'].patchValue(this.documentNameLabled);
      }
    } else {
      if (a && this.selectedVendor && this.selectedCustomer) {
        this.documentNameLabled = this.selectedVendor + '-' + this.selectedCustomer + '-' + a + '-';
        this.f['DocumentName'].patchValue(this.documentNameLabled);
      }
    }
  }

  onInput(value: any) {
    if (!value.startsWith(this.documentNameLabled)) {
      this.f['DocumentName'].patchValue(this.documentNameLabled);
    }

    let documentNameLabled = this.f['DocumentName'].value.trim();
    let selectedVendor = this.selectedVendor.trim();
    let selectedCustomer = this.selectedCustomer.trim();
    let selectedCompany = this.selectedCompany.trim();
    let docType = this.f['DocumentType'].value.trim();

    let stringToReplace = `${selectedVendor}-${selectedCustomer}-${selectedCompany}-${docType}-`;
    let docName = documentNameLabled.replace(stringToReplace, "");
    this.f['Label'].patchValue(docName);
  }


  getCustomerList() {
    this.customerList = [];
    this._unsubscribeAllCustomer.next(null);
    this.locationService.getCustomerDropDown().pipe(takeUntil(this._unsubscribeAllCustomer)).subscribe((data) => {
      if (data && data.$values) {
        this.customerList = data.$values;
      } else {
        this.customerList = [];
      }
    }, error => {
      this.customerList = [];
    });
  }

  saveContract() {
    this.isContractFormSubmit = true;
    if (this.contractForm.invalid) {
      this.scrollToFirstInvalidField();
      return
    }

    if (this.contractForm.valid) {
      const data = this.contractForm.value;

      this.contractForm.value.Description = this.contractForm.value.Description.replace(/\n/g, ' ');
      this.contractForm.value.CommitmentNotes = this.contractForm.value.CommitmentNotes.replace(/\n/g, ' ');
      this.contractForm.value.DiscountNotes = this.contractForm.value.DiscountNotes.replace(/\n/g, ' ');
      this.contractForm.value.FeeNotes = this.contractForm.value.FeeNotes.replace(/\n/g, ' ');
      this.contractForm.value.TermNotes = this.contractForm.value.TermNotes.replace(/\n/g, ' ');
      this.contractForm.value.TerminationNotes = this.contractForm.value.TerminationNotes.replace(/\n/g, ' ');
      this.contractForm.value.CreditNotes = this.contractForm.value.CreditNotes.replace(/\n/g, ' ');

      const formData = new FormData();

      formData.append('DocumentType', isValueExist(data.DocumentType));
      formData.append('CustomerId', isValueExist(data.CustomerId));
      formData.append('VendorId', isValueExist(data.VendorId));
      if (isValueExist(data.VendorId)) {
        formData.append('CompanyId', data.CompanyId);
      }
      formData.append('DocumentName', isValueExist(data.DocumentName));
      formData.append('VendorDocumentName', isValueExist(data.VendorDocumentName));
      formData.append('InternalDocumentNumber', isValueExist(data.InternalDocumentNumber));
      formData.append('VendorDocumentNumber', isValueExist(data.VendorDocumentNumber));
      formData.append('CurrencyId', isValueExist(data.CurrencyId));
      formData.append('Active', isValueExist(data.Active));
      formData.append('Description', isValueExist(data.Description));
      formData.append('AnnualRevenueCommitment', isValueExist(data.AnnualRevenueCommitment));
      formData.append('MonthlyRevenueCommitment', isValueExist(data.MonthlyRevenueCommitment));
      formData.append('InventoryCommitment', isValueExist(data.InventoryCommitment));
      formData.append('OtherCommitment', isValueExist(data.OtherCommitment));
      formData.append('CommitmentNotes', isValueExist(data.CommitmentNotes));
      formData.append('ServiceDiscount', isValueExist(data.ServiceDiscount));
      formData.append('EquipmentDiscount', isValueExist(data.EquipmentDiscount));
      formData.append('FeatureDiscount', isValueExist(data.FeatureDiscount));
      formData.append('OtherDiscount', isValueExist(data.OtherDiscount));
      formData.append('DiscountNotes', isValueExist(data.DiscountNotes));
      formData.append('InstallationFees', isValueExist(data.InstallationFees));
      formData.append('ActivationFees', isValueExist(data.ActivationFees));
      formData.append('ConstructionFees', isValueExist(data.ConstructionFees));
      formData.append('OtherFees', isValueExist(data.OtherFees));
      formData.append('FeeNotes', isValueExist(data.FeeNotes));
      formData.append('StartDate', isValueExist(this.onselectSetDate(data.StartDate, '-')));
      formData.append('EndDate', isValueExist(this.onselectSetDate(data.EndDate, '-')));
      formData.append('AutoRenewal', isValueExist(data.AutoRenewal));
      formData.append('NoticePeriodId', isValueExist(data.NoticePeriodId));
      formData.append('ReminderDaysAlarmId', isValueExist(data.ReminderDaysAlarmId));
      formData.append('CustomPaymentTerms', isValueExist(data.CustomPaymentTerms));
      formData.append('TermNotes', isValueExist(data.TermNotes));
      formData.append('EarlyTerminationFee', isValueExist(data.EarlyTerminationFee));
      formData.append('TerminationFees', isValueExist(data.TerminationFees));
      formData.append('TerminationNotes', isValueExist(data.TerminationNotes));
      formData.append('ActivationCreditAmount', isValueExist(data.ActivationCreditAmount));
      formData.append('SpendCreditAmount', isValueExist(data.SpendCreditAmount));
      formData.append('OtherCreditAmount', isValueExist(data.OtherCreditAmount));
      formData.append('GuaranteedCreditAmount', isValueExist(data.GuaranteedCreditAmount));
      formData.append('NumberOfActivationFees', isValueExist(data.NumberOfActivationFees));
      formData.append('NumberOfTerminationWaivers', isValueExist(data.NumberOfTerminationWaivers));
      formData.append('NumberOfJointActtermFees', isValueExist(data.NumberOfJointActtermFees));
      formData.append('CreditNotes', isValueExist(data.CreditNotes));
      formData.append('Label', isValueExist(data.Label));


      if (this.uploadedFile) {
        formData.append('FileAttachment', this.uploadedFile);
        formData.append('UpdateFileAttachment', 'true');
      }
      else
        formData.append('UpdateFileAttachment', 'false');
      this.saveButtonLoadder = true;
      this._unsubscribeContract.next(null);
      if (this.action === 'New') {
        data.ReplaceContract = false;
        formData.append('ReplaceContract', data.ReplaceContract);
        this.contractService.saveContract(formData).pipe(takeUntil(this._unsubscribeContract)).
          subscribe((data) => {
            this.saveButtonLoadder = false;
            if (data.Success) {
              this.errorPopup(data, true);

            } else {
              this.errorPopup(data);
            }
          }, error => {
            this.saveButtonLoadder = false;
            this.errorPopup(error);
          });
      } else if (this.action === 'NewAddm') {
        data.ReplaceContract = false;
        formData.append('ReplaceContract', data.ReplaceContract);
        formData.append('ContractId', this.gridData.rowData.data.ContractId);
        this.contractService.saveNewAddum(formData).pipe(takeUntil(this._unsubscribeContract)).
          subscribe((data) => {
            this.saveButtonLoadder = false;
            if (data.Success) {
              this.errorPopup(data, true);
              this.payload = {
                ContractId: this.currentContractId,
                Type: this.fromTab == 'inventory' ? 'ASC' : 'DESC'
              }
              this.refreshbutton = true;

            } else {
              this.errorPopup(data);
            }
          }, error => {
            this.saveButtonLoadder = false;
            this.errorPopup(error);
          });
      } else {
        this._unsubscribeContractEdit.next(null);
        this.contractService.UpdateContractOrAddendum(this.currentSelected.Id, formData).pipe(takeUntil(this._unsubscribeContractEdit)).
          subscribe((data: any) => {
            this.saveButtonLoadder = false;
            if (data.Success) {
              this.errorPopup(data);
              this.payload = {
                ContractId: this.currentContractId,
                Type: this.fromTab == 'inventory' ? 'ASC' : 'DESC'
              }
              this.refreshbutton = true;

              this.contractName.emit(data.Data.Overview.DocumentName)

            } else {
              this.errorPopup(data);
            }
          }, error => {
            this.saveButtonLoadder = false;
            this.errorPopup(error);
          });
      }
    }
  }

  scrollToFirstInvalidField() {
    for (const controlName in this.contractForm.controls) {
      if (this.contractForm.controls[controlName].invalid) {
        const firstInvalidField = document.querySelector(`[formControlName="${controlName}"]`);
        if (firstInvalidField) {
          firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        break;
      }
    }
  }

  onselectSetDate($event: any, regex = '/') {
    if (!$event) {
      return;
    }
    if ($event && !$event.toString().includes('/')) {
      let d = $event;
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

      if (browserName === 'firefox' || browserName === 'safari') {
        return isValueExist(this.manageService.convertDate(`${mm}-${dd}-${yy}`, 'saveDatePicker', regex));
      } else {
        return isValueExist(this.manageService.convertDate(`${mm}-${dd}-${yy}T0000`, 'saveDatePicker', regex));
      }
    } else {
      return isValueExist(this.manageService.convertDate(`${$event}T0000`, 'saveDatePicker', regex));
    }
  }

  get f() {
    return this.contractForm?.controls;
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(this.contractMainTooltip, {
      width: '900px',
      data: {
        colseButton: true,
      }
    });
  }

  closeModal() {
    this.dialog.closeAll();
  }

  ContractUploadFile(type: any) {

    const dialogRef = this.dialog.open(ContractUploadFileComponent, {
      width: '900px',
      data: {
        colseButton: true,
        type: type
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result !== undefined && result !== false) {
        this.uploadedFile = result;
      }
      // this.attachedFile = result.
    });
  }

  removeAttachment() {
    this.uploadedFile = null;
  }
  fileUpload() {
    const dialogRef = this.dialog.open(FileUploadPopupComponent, {
      panelClass: 'width-665',
    });
  }

  ngOnDestroy() {
    this._unsubscribeCompany.next(null);
    this._unsubscribeCompany.complete();
    this._unsubscribeContainer.next(null);
    this._unsubscribeContainer.complete();
    this._unsubscribeContract.next(null);
    this._unsubscribeContract.complete();
    this._unsubscribeCurrency.next(null);
    this._unsubscribeCurrency.complete();
    this._unsubscribeAllCustomer.next(null);
    this._unsubscribeAllCustomer.complete();
    this.locationService.setReplacedData(null);
  }

  errorPopup(data: any, isNewAddm = false) {
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
      if (this.action === 'NewAddm' && isNewAddm) {
        this.closeAddAddmTab.emit(true);
      }
      if (this.action === 'New' && isNewAddm) {
        this.onContractAddEvent.emit(data)
      }
    });
  }

  setValueInFormControl(key: any, value: any) {
    this.f[key].setValue(value);
  }

  downloadDocument(rowData: { Id: any; Type: any; }) {
    this.contractService.DownloadAttachment(rowData.Id, rowData.Type).subscribe((res) => {
      if (res.type == 'application/json') {

      } else {
        let bolbUrl = URL.createObjectURL(res);
        var link = document.createElement("a");
        link.setAttribute("href", bolbUrl);
        link.setAttribute("download", 'Attachment');
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

      }
    });
  }

  dataValuesFn(event: any) {
  }
}