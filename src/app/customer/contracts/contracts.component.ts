import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ReplaceContractDialogComponent } from './replace-contract-dialog/replace-contract-dialog.component';
import _ from 'lodash';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import moment from 'moment';
import { LinkInventoryCDialogComponent } from './link-inventory-c-dialog/link-inventory-c-dialog.component';
import { AddEditContractsComponent } from './add-edit-contracts/add-edit-contracts.component';
import { ContractService } from 'src/app/services/contract.service';
import { VariableManageService } from 'src/app/services/variable-manage.service';
import { LocationService } from 'src/app/services/location.service';
import { checkIsValueExists, isValueExist, rolePermission } from 'src/app/services/helper';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { HeaderSectionComponent } from 'src/app/common/header-section/header-section.component';
import { CommonPTreeTableComponent } from 'src/app/common/common-p-tree-table/common-p-tree-table.component';
import { api_list } from 'src/app/services/api-list';
import { createColumn } from 'src/app/utils/column-utils';
import { InventoryCComponent } from './inventory-c/inventory-c.component';

@Component({
  selector: 'app-contracts',
  templateUrl: './contracts.component.html',
  styleUrls: ['./contracts.component.scss'],
  standalone: true,
  imports: [
    SharedModule,
    PrimgModule,
    HeaderSectionComponent,
    CommonPTreeTableComponent,
    AddEditContractsComponent,
    InventoryCComponent
  ]
})
export class ContractComponent implements OnInit {


  @Input() action: String;
  @ViewChild('contractMainTooltip') contractMainTooltip!: TemplateRef<any>;

  @ViewChild(AddEditContractsComponent) private editContractComponent: AddEditContractsComponent;

  public exportInvoiceSummaryData: any;
  public exportDetail: any;
  customers: any = [];
  selectedMainTab: any = 0;

  selectedTab: any = 0;
  childRecord = '';
  selectedChild: any = 0;
  selectedTem: any = 'all';
  stopSpinner: boolean = false;
  selectedCustomer: any = 'all';
  selectedTemDD: any;
  tems: any = [];
  filterdTems: any = [];
  hasSuperTemUsers: boolean = false;
  tabsMainArray: any = [];
  tabAddemArray: any[] = [];
  selectedAddedm: any = 0;
  sendDataToLinkPopup: any;
  isOpenWirelineTab: boolean = false;
  isDisabledExport: boolean = false;
  isDisablLinkInventory: boolean = false;
  opentabsFromInventory_Contract: boolean = false;
  opentabsFromInventory_Inventory: boolean = false;
  isSendVendorProductInventoryId: boolean = false;
  linkedData: any;
  disablePlusOptions: boolean = false;
  temRoles = false;
  exportData: any;
  inventoryData: any;
  advanceFilter: any;
  editContractData: any;
  editContractDataFromLinkedInventory: any;

  private _unsubscribeContractGrid: Subject<any> = new Subject<any>();
  private _getCustomerUserDestroy: Subject<any> = new Subject<any>();
  private _getTemListsDestroy: Subject<any> = new Subject<any>();

  buttonOptions: any = [
    { label: 'Contracts', value: 'contracts', url: '/organization/contracts', icon: 'fas-fa-file-lock' },
  ];

  selectedTabOption = this.buttonOptions[0].value;
  selectedButton = this.buttonOptions[0].value;

  editDetailsData: any;
  TemDDArray: any = [];
  disableTemSearch: boolean = false;
  loaderParent: any = false;
  currentOpenEditPagevar = 'Table';
  tableDataExist: any;
  tabNames = ['Contracts', 'Inventory'];
  currentTabName = this.tabNames[this.selectedTab];
  @ViewChild(CommonPTreeTableComponent) CommonPTreeTableComponent!: CommonPTreeTableComponent;
  GridAPI: any = api_list.Contract.Contract.Grid;
  payload: any = {};
  cols: any = [];
  constructor(private contractService: ContractService,
    public variableManageService: VariableManageService,
    public dialog: MatDialog,
    public locationService: LocationService,
    private router: Router) {
    this.setCols();
  }

  setCols() {
    let currentParent = 0;
    const getParentId = (isChild: boolean) => isChild ? ++currentParent : currentParent;

    this.cols = [];

    // Vendor
    const vendorParent = getParentId(true);
    this.cols.push(createColumn(vendorParent, '125px', true, 'text', 'Vendor', 'VendorAccountName', 'Vendor', 'open'));

    // Organization
    const orgParent = getParentId(true);
    this.cols.push(createColumn(orgParent, '200px', true, 'text', 'Organization', 'CustomerAccountName', 'Customer'));
    this.cols.push(createColumn(orgParent, '200px', false, 'text', '', 'CompanyName', 'Company', 'close'));

    // Overview
    const overviewParent = getParentId(true);
    this.cols.push(createColumn(overviewParent, '178px', true, 'text', 'Overview', 'ContractDocumentType', 'Type of Document'));
    this.cols.push(createColumn(overviewParent, '200px', false, 'text', '', 'DocumentName', 'Document Name', 'close'));
    this.cols.push(createColumn(overviewParent, '94px', false, 'text', '', 'ContractStatusDisplay', 'Status', 'close'));
    this.cols.push(createColumn(overviewParent, '94px', false, 'text', '', 'CountInventoryId', 'Count of Inventory', 'close'));
    this.cols.push(createColumn(overviewParent, '240px', false, 'text', '', 'InternalDocumentNumber', 'Internal Contract Number', 'open'));
    this.cols.push(createColumn(overviewParent, '240px', false, 'text', '', 'VendorDocumentNumber', 'Vendor Contract Number', 'open'));

    // Terms
    const termsParent = getParentId(true);
    this.cols.push(createColumn(termsParent, '121px', true, 'dateFilter', 'Terms', 'ContractTermStartDate', 'Start Date'));
    this.cols.push(createColumn(termsParent, '114px', false, 'dateFilter', '', 'ContractTermEndDate', 'End Date', 'close'));
    this.cols.push(createColumn(termsParent, '149px', false, 'text', '', 'ContractTermDisplay', 'Contract Term', 'close'));
    this.cols.push(createColumn(termsParent, '181px', false, 'numberFilter', '', 'ContractMonthsRemainingDisplay', 'Months Remaining', 'open'));
    this.cols.push(createColumn(termsParent, '145px', false, 'text', '', 'NoticePeriodMonthsDisplay', 'Notice Period', 'open'));
    this.cols.push(createColumn(termsParent, '175px', false, 'text', '', 'ReminderDaysAlarmMonthsDisplay', 'Reminder Period', 'open'));
    this.cols.push(createColumn(termsParent, '148px', false, 'text', '', 'ContractTermAutoRenualDisplay', 'Auto-Renewal', 'open'));
    this.cols.push(createColumn(termsParent, '212px', false, 'text', '', 'ContractCustomPaymentTerms', 'Custom Payment Terms', 'open'));

    // Commitments
    const commitmentsParent = getParentId(true);
    this.cols.push(createColumn(commitmentsParent, '234px', true, 'numberFilter', 'Commitments', 'AnnualRevenueCommitmentAmountDisplay', 'Annual Revenue Amount $'));
    this.cols.push(createColumn(commitmentsParent, '283px', false, 'numberFilter', '', 'InventoryCommitmentAmountDisplay', 'Inventory Commitment Amount $', 'open'));
    this.cols.push(createColumn(commitmentsParent, '244px', false, 'numberFilter', '', 'MonthlyRevenueCommitmentAmountDisplay', 'Monthly Revenue Amount $', 'open'));
    this.cols.push(createColumn(commitmentsParent, '215px', false, 'numberFilter', '', 'OtherCreditAmountDisplay', 'Other Credits Amount $', 'open'));

    // Termination
    const terminationParent = getParentId(true);
    this.cols.push(createColumn(terminationParent, '244px', true, 'text', 'Termination', 'EarlyTerminationFeeDisplay', 'Early Termination Penalty'));
    this.cols.push(createColumn(terminationParent, '180px', false, 'numberFilter', '', 'TerminationFeesDisplay', 'Termination Fees $', 'open'));

    // Discounts
    const discountParent = getParentId(true);
    this.cols.push(createColumn(discountParent, '166px', true, 'numberFilter', 'Discounts', 'ServiceDiscount', 'Service Discount'));
    this.cols.push(createColumn(discountParent, '168px', false, 'numberFilter', '', 'FeatureDiscount', 'Feature Discount', 'open'));
    this.cols.push(createColumn(discountParent, '191px', false, 'numberFilter', '', 'EquipmentDiscount', 'Equipment Discount', 'open'));
    this.cols.push(createColumn(discountParent, '156px', false, 'numberFilter', '', 'OtherDiscount', 'Other Discount', 'open'));

    // Credits
    const creditParent = getParentId(true);
    this.cols.push(createColumn(creditParent, '245px', true, 'numberFilter', 'Credits', 'ActivationCreditAmountDisplay', 'Activation Credits Amount $'));
    this.cols.push(createColumn(creditParent, '219px', false, 'numberFilter', '', 'SpendCreditAmountDisplay', 'Spend Credits Amount $', 'open'));
    this.cols.push(createColumn(creditParent, '215px', false, 'numberFilter', '', 'OtherCreditAmountDisplay', 'Other Credits Amount $', 'open'));
    this.cols.push(createColumn(creditParent, '255px', false, 'numberFilter', '', 'GuaranteedCreditAmountDisplay', 'Guaranteed Credits Amount $', 'open'));
    this.cols.push(createColumn(creditParent, '257px', false, 'numberFilter', '', 'NumberOfActivationFees', 'Number of Activation Waivers', 'open'));
    this.cols.push(createColumn(creditParent, '269px', false, 'numberFilter', '', 'NumberOfTerminationWaivers', 'Number of Termination Waivers', 'open'));
    this.cols.push(createColumn(creditParent, '381px', false, 'numberFilter', '', 'NumberOfJointActtermFees', 'Number of Joint Activation/Termination Waivers', 'open'));

    // Fees
    const feesParent = getParentId(true);
    this.cols.push(createColumn(feesParent, '168px', true, 'numberFilter', 'Fees', 'InstallationFeesDisplay', 'Installation Fee $'));
    this.cols.push(createColumn(feesParent, '161px', false, 'numberFilter', '', 'ActivationFeesDisplay', 'Activation Fee $', 'open'));
    this.cols.push(createColumn(feesParent, '180px', false, 'numberFilter', '', 'ConstructionFeesDisplay', 'Construction Fee $', 'open'));
    this.cols.push(createColumn(feesParent, '133px', false, 'numberFilter', '', 'OtherFeesDisplay', 'Other Fee $', 'open'));
  }


  onCustomerChange(event: any) {
    this.selectedCustomer = event;
  }
  loaderEmitParentFn(event: any) {
    this.loaderParent = event;
  }
  tableDataExistFn(e?: any) {
    this.tableDataExist = e;
  }
  trackByIndex(index: number, item: any): number {
    return index;
  }

  onButtonClick(value: string): void {
    this.selectedButton = value;
    setTimeout(() => this.goToPage(value), 0);
  }
  onTemChange(event: any) {
    this.TemDDArray[this.selectedTab] = { id: Number(event), type: this.currentOpenEditPagevar };
  }

  ngOnInit(): void {
    this.getTemLists();
    this.getCustomerForUser();
    this.temRoles = rolePermission(['TEMAdmin', 'TEMUser', 'TEMManager']);
    this.hasSuperTemUsers = rolePermission(['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser']);

    if (this.selectedTem != 'all') {
      this.payload['TemAccountId'] = parseInt(this.selectedTem);
    }

    if (this.selectedCustomer != 'all') {
      this.payload['customerAccountId'] = parseInt(this.selectedCustomer);
    }
  }

  getAllContracts() {
    this.refreshbutton = true;
  }

  onChangeTem(event: any, notSetAll = true) {
    if (event.target.value !== 'all') {
      this.loaderParent = true;
      this.selectedTemDD = event.target.value;
      this._getCustomerUserDestroy.next(null);
      this.locationService.getCustomerDropdownByNewTEM(event.target.value).pipe(takeUntil(this._getCustomerUserDestroy)).subscribe((data) => {
        if (data && data.Data.$values) {
          this.loaderParent = false;
          this.customers = data.Data.$values;
          if (notSetAll) {
            this.selectedCustomer = 'all';
          }
        } else {
          this.loaderParent = false;
        }
      }, error => {
        this.loaderParent = false;
      });
    } else {
      this.getCustomerForUser();
      this.selectedCustomer = 'all';
    }
  }

  goToPage(to: any) {
    this.selectedButton = to.value;
    this.selectedTabOption = to.value;
    this.router.navigate([to.url]);
  }

  getTemLists() {
    this.loaderParent = true;
    this._getTemListsDestroy.next(null);
    this.locationService
      .getTemLists()
      .pipe(takeUntil(this._getTemListsDestroy))
      .subscribe(
        (response: any) => {
          if (response) {
            this.loaderParent = false;
            this.tems = this.filterdTems = response.$values;

            if (this.hasSuperTemUsers) {
              let id = sessionStorage.getItem("LoggedAccountId");
              const found = this.tems.find((element: any) => Number(element.Id) === Number(id));
              this.tems.unshift(found);

              this.tems = this.tems.filter((object: any, index: number): boolean => {
                return object && this.tems.indexOf(object) === index;
              });
            }
            const newObj = { AccountName: 'All', Id: 'all' };
            this.tems.unshift(newObj);
          }
        },
        (error) => { 
          this.loaderParent = false;
        }
      );
  }


  getCustomerForUser() {
    this._getCustomerUserDestroy.next(null);
    this.customers = [];
    this.locationService.getCustomerDropDown().pipe(takeUntil(this._getCustomerUserDestroy)).subscribe((data) => {
      if (data && data.$values) {
        this.customers = data.$values;
        const newObj = { AccountName: 'All', Id: 'all' };
        this.customers.unshift(newObj);
      }
    });
  }

  addNewContract(tabaction: any) {
    this.tabsMainArray.push({ tabType: tabaction, rowData: '', pageName: 'new' });
    this.selectedTab = this.tabsMainArray.length;
    this.variableManageService.mobilityWhichPageEnabled = 'New';
  }

  changeParentTab(event: any) {
    this.selectedTab = event;
    this.selectedChild = 0;
    if (event === 0) {
      this.opentabsFromInventory_Contract = false;
      this.opentabsFromInventory_Inventory = false;
      this.variableManageService.mobilityWhichPageEnabled = 'Table';
      
    }
    else {
      this.variableManageService.mobilityWhichPageEnabled = this.tabsMainArray[event - 1].tabType;
    }
  }

  closeAddAddmTab($event: any, tabIndex: any) {
    if ($event) {
      this.removeAddemTab(tabIndex)
    }
  }

  closeAddContractTab($event: any, i: any) {
    if ($event) {
      this.removeTab(i);
    }
  }

  onCellDoubleClickedEventInventory($event: any) {
    this.inventoryData = $event;
    this.isOpenWirelineTab = true;
    this.selectedChild = 2;
  }

  disableLinkDialog($event: any, i: any) {
    this.isDisablLinkInventory = $event;
  }

  fromInventoryLinkDialog($event: any) {
    this.isSendVendorProductInventoryId = $event;
  }

  redirectTab(value: any) {
    this.inventoryData = value.rowData;
    this.selectedChild = value.redirectIndex;
    this.isOpenWirelineTab = false;
  }

  removeWirelineTab(i: any) {
    this.selectedChild = 1;
    if (i === 'wireline') {
      this.isOpenWirelineTab = false;
    }
    if (i === 'contract') {
      this.opentabsFromInventory_Contract = false;
    }

    if (i === 'inventory') {
      this.opentabsFromInventory_Inventory = false;
    }
  }

  onCellDoubleClicked(tabType = '', rowData: any) {
    this.childRecord = (rowData && rowData.data && rowData.data.ChildInventoryId) ? rowData.data.ChildInventoryId : null;
    this.selectedChild = 0;
    this.tabsMainArray.push(
      {
        tabAddemArray: [],
        parent: this.selectedTab,
        tabType: tabType,
        rowData: rowData,
        child: 0,
        parentServiceID: rowData?.node?.parent?.data?.ServiceNumber ? rowData?.node.parent.data.ServiceNumber : ''
      });
    this.variableManageService.mobilityWhichPageEnabled = 'Edit';
    setTimeout(() => {
      this.selectedTab = this.tabsMainArray.length;
    }, 6);

  }
  contractName(name: any, i: any) {
    this.tabsMainArray[i].rowData.data.DocumentName = name;
  }

  setCustomerDDValueEvent(data: any) {
    if (this.selectedTab > 0 && data != '') {
      this.selectedCustomer = data;

    } else if (data == '' && this.selectedTab <= 0) {
      this.selectedCustomer = 'all';
    }
  }

  setTemDDValueEvent(data: any, i: any) {
    if (this.selectedTab > 0 && data != '') {
      this.selectedTem = data;
    } else if (data == '' && this.selectedTab <= 0) {
      this.selectedTem = 'all';
    }
    if (this.selectedTem) {
      const data = {
        target: {
          value: this.selectedTem
        }
      }
      // this.onChangeTem(data, false)
    }
  }

  onContractAddEvent(data: any, i: any) {
    let rowData = {
      data: {
        ContractId: data.Data.Id,
        DocumentName: data.Data.Overview.DocumentName,
        DocumentType: data?.Data?.Overview?.DocumentType,
        VendorAccountId: data?.Data?.Overview?.VendorId,
        CustomerAccountId: data?.Data?.Overview?.CustomerId,
        CompanyId: data?.Data?.Overview?.CompanyId,

      }
    };
    this.tabsMainArray[i] = {
      tabAddemArray: [],
      parent: this.selectedTab,
      tabType: 'Edit',
      rowData: rowData,
      child: 0,
    };
    this.variableManageService.mobilityWhichPageEnabled = 'Edit';
  }


  childrenChange(event: any) {
    this.selectedChild = event;
    this.currentTabName = this.tabNames[this.selectedChild];
  }

  onMobilityAddEvent(event: any, index: any) {
    if (event) {
      this.onCellDoubleClicked('Edit', event)
    }
  }


  AddAdemdum() {
    // Calculate index safely - if selectedTab <= 0, use 0, otherwise use selectedTab - 1
    const idx = Math.max(0, this.selectedTab <= 0 ? 0 : this.selectedTab - 1);

    // Initialize array element if needed
    this.tabsMainArray[idx] = this.tabsMainArray[idx] || { tabAddemArray: [] };
    this.tabsMainArray[idx].tabAddemArray = this.tabsMainArray[idx].tabAddemArray || [];

    // Add new addendum and update state
    this.tabsMainArray[idx].tabAddemArray.push({ tabType: 'NewAddm', rowData: '', pageName: 'new' });
    this.selectedChild = null;
    this.selectedAddedm = this.tabsMainArray[idx].tabAddemArray.length;
  }

  removeAddemTab(tabIndex: number) {
    // Calculate index safely - if selectedTab <= 0, use 0, otherwise use selectedTab - 1
    const idx = Math.max(0, this.selectedTab <= 0 ? 0 : this.selectedTab - 1);

    // Ensure array and its properties exist
    if (this.tabsMainArray[idx]?.tabAddemArray) {
      // Remove item and create new array reference
      this.tabsMainArray[idx].tabAddemArray.splice(tabIndex, 1);
      this.tabsMainArray[idx].tabAddemArray = _.cloneDeep(this.tabsMainArray[idx].tabAddemArray);

      // Update state
      this.selectedAddedm = this.tabsMainArray[idx].tabAddemArray.length;

      // Reset child selection if array is empty
      if (this.tabsMainArray[idx].tabAddemArray.length === 0) {
        this.selectedChild = 0;
      }
    }
  }

  clickToSelectedAdded(event: any) {
    this.selectedAddedm = event;
  }

  removeTab(tabIndex: any) {
    this.tabsMainArray.splice(tabIndex, 1);
    this.tabsMainArray = _.cloneDeep(this.tabsMainArray);

    if (this.tabsMainArray.length === 0) {
      this.variableManageService.mobilityWhichPageEnabled = 'Table';
      this.refreshbutton = true;
    }
    this.selectedTab = this.tabsMainArray.length;
    this.changeParentTab(tabIndex);

  }

  onLoadContractInventory($event: any) {
    this.sendDataToLinkPopup = $event;
  }

  onLoadEditContract($event: any) {
    this.editContractData = $event;
  }

  onLoadEditContractFromInventory($event: any, setUpdatedDetail = false, i: any) {
    this.editContractDataFromLinkedInventory = $event;
    if (setUpdatedDetail) {
      this.tabsMainArray[i].rowData.data.VendorAccountId = $event?.Overview?.VendorId;
      this.tabsMainArray[i].rowData.data.CustomerAccountId = $event?.Overview?.CustomerId;
      this.tabsMainArray[i].rowData.data.CompanyId = $event?.Overview?.CompanyId;
    }
  }

  onDisablePlusButton($event: any) {
    this.disablePlusOptions = $event;
  }

  ngOnDestroy(): any {
    this.variableManageService.mobilityWhichPageEnabled = 'Table';
    this._getTemListsDestroy.next(null);
    this._getTemListsDestroy.complete();
    this._unsubscribeContractGrid.next(null);
    this._unsubscribeContractGrid.complete();
    this._getCustomerUserDestroy.next(null);
    this._getCustomerUserDestroy.complete();
    this.variableManageService.setCallAPIInventoryData('false');
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

  onContractDetail(data: any) {
    this.editDetailsData = data;
  }
  ReplaceContract() {
    const dialogRef = this.dialog.open(ReplaceContractDialogComponent, {
      width: '1100px',
      data: {
        colseButton: true,
        data: this.editContractData,
        rowDetailData: this.editDetailsData
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (checkIsValueExists(result)) {
        this.editContractComponent.ngOnInit();
        this.locationService.setReplacedData(result);
      }
    });
  }

  LinkInventoryCDialog(from?: any) {
    const dialogRef = this.dialog.open(LinkInventoryCDialogComponent, {
      width: '1200px',
      data: {
        colseButton: true,
        data: this.sendDataToLinkPopup,
        whichPage: from,
        isSendVendorProductInventoryId: this.isSendVendorProductInventoryId
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.ContractId) {
        this.linkedData = result;
        this.selectedChild = 3;
        this.opentabsFromInventory_Contract = true;
        this.opentabsFromInventory_Inventory = true;
      }
      if (checkIsValueExists(result)) {
        this.variableManageService.setCallAPIInventoryData('true');
      }
    });
  }

  contractExport() {
    this.isDisabledExport = true;
    this.exportData['parentRecordIds'] = [];
    this.exportData['childRecordIDs'] = [];
    this.contractService.getAllContractsExport(this.exportData).subscribe({
      next: data => {
        this.isDisabledExport = false;
        let bolbUrl = URL.createObjectURL(data);
        var link = document.createElement("a");
        link.setAttribute("href", bolbUrl);
        link.setAttribute("download", `Contracts.xlsx`);
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
      error: error => {
        this.isDisabledExport = false;
      }
    })
  }

  refreshbutton: boolean = false;


  refreshbuttonEmitFn(event: any) {
    this.refreshbutton = event;
  }
  selectedNode: any;
  onNodeSelect(event: any) {
    this.selectedNode = event.node;
  }

  exportAccountDataFn(event: any) {
    this.exportData = event;
  }

  selectedRowsEmit: any;
  selectedRowsEmitFn(event: any) {
    this.selectedRowsEmit = event;
  }

  rowCellDoubleClickedFn(event: any) {
    this.onCellDoubleClicked('Edit', event)

  }
  totalRecords: any;
  totalRecordsEmitFn(event: any) {
    this.totalRecords = event;
  }

  setColumnDefs() {
    this.CommonPTreeTableComponent.setColumnDefs();
  }

  loader: any;
  loaderEmitFn(event: any) {
    this.loader = event;
  }


}
