import { Component, ViewChild } from '@angular/core';
import { SharedModule } from '../demo/shared/shared.module';
import { PrimgModule } from '../demo/shared/primeng.module';
import { HeaderSectionComponent } from '../common/header-section/header-section.component';
import { LocationService } from '../services/location.service';
import { rolePermission } from '../services/helper';
import _ from 'lodash';
import { createColumn } from '../utils/column-utils';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { TreeNode } from 'primeng/api';
import { BillingAccountsComponent } from '../billing-accounts/billing-accounts.component';
import { EditBillingAccountComponent } from '../edit-billing-account/edit-billing-account.component';
import { DatePipe } from '@angular/common';
import { ManageService } from '../services/manage.service';
import { AccoutNoteDialogComponent } from '../accout-note-dialog/accout-note-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-finance-accounting',
  imports: [SharedModule, PrimgModule, HeaderSectionComponent, BillingAccountsComponent, EditBillingAccountComponent],
  standalone: true,
  providers: [DatePipe, ManageService  , LocationService],
  templateUrl: './finance-accounting.component.html',
  styleUrl: './finance-accounting.component.scss'
})
export class FinanceAccountingComponent {
  @ViewChild(BillingAccountsComponent)
  private BillingAccountsComponent: BillingAccountsComponent;
  @ViewChild(EditBillingAccountComponent) parent: EditBillingAccountComponent;

  constructor(private locationService: LocationService, private router: Router, public dialog: MatDialog) {
    this.setCols();
    this.hasSsuperTemUsers = rolePermission(['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser']);
    this.getTemLists();
  }

  buttonOptions: any = [
    { label: 'Accounts', value: 'Billing Accounts', icon: 'fas fa-money-check-alt' },
    { label: 'Remit Addresses', value: 'Remit Addresses', icon: 'fas fa-location-arrow' },
  ];

  selectedButton: any = 'Billing Accounts';
  temRoles = false;
  selectedTem: string = 'all';
  tems: any = [];
  hasSsuperTemUsers: boolean = false;
  disableTemSearch: any;
  currentOpenEditPagevar = 'Table';


  getTemLists() {
    this.locationService.getTemLists().subscribe((data) => {
      if (data && data.$values) {
        this.tems = data.$values;

        if (this.hasSsuperTemUsers) {
          let id = sessionStorage.getItem("LoggedAccountId");
          const newObj = { AccountName: 'All', Id: 'all' };
          const found = this.tems.find((element: any) => Number(element.Id) === Number(id));
          this.tems.unshift(found);

          this.tems = this.tems.filter((object: any, index: any) => {
            if (object) {
              return this.tems.indexOf(object) === index;
            } else {
              return false;
            }
          });
          this.tems.unshift(newObj);
        }
      }
    });
  }

  currentOpenEditPage($event: any) {
    this.currentOpenEditPagevar = ($event) ? 'Edit' : 'Add';
    if (this.currentOpenEditPagevar === 'Edit') {
      this.disableTemSearch = true;
    } else {
      this.disableTemSearch = false;
    }
  }

  loaderParent: any = false;
  loaderEmitParentFn(event: any) {
    this.loaderParent = event;
  }

  isDisabledExport = false;
  gridApiAccount: any;
  public exportAccounts: any;
  onBtnExportDataAccountAsExcel() {
    this.BillingAccountsComponent.setColumnDefs();
    this.isDisabledExport = true;
    this.locationService
      .getBillingAccountExcel(this.exportAccounts)
      .subscribe({
        next: data => {
          this.isDisabledExport = false;
          let bolbUrl = URL.createObjectURL(data);
          var link = document.createElement("a");
          link.setAttribute("href", bolbUrl);
          link.setAttribute("download", "Accounts.xlsx");
          link.style.display = "none";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

        },
        error: error => {
          this.isDisabledExport = false;

        }
      });
  }

  gridColumnApiAccount: any;
  onAgGridReadyAccountEmit($event: any) {
    this.gridApiAccount = $event.api;
    this.gridColumnApiAccount = $event.columnApi;
  }

  finalFilterdArr: any;
  sorting: any;
  sortingType: any;
  setColumnDefs() {

    let headerData: any = [];
    let ChildHeaderData: any = [];
    let i = 0;
    let childIndex = 0;

    _.map(this.cols, (x: any) => {
      if (x.isChildren) {
        i = i + 1;

        headerData.push({
          "Position": i,
          "Title": x.header
        });

      }

      childIndex = childIndex + 1;

      ChildHeaderData.push({
        "HeaderPosition": i,
        "Position": childIndex,
        "FieldName": x.field,
        "Title": x.childHeader
      });

    });

    this.exportAccounts = {
      ExportToExcelData: {
        HeaderData: headerData,
        ChildHeaderData: ChildHeaderData,
        fileName: "Accounts",
      },
      ExportToExcel: true,
      ...this.finalFilterdArr,
      ...(this.selectedTem && this.selectedTem !== 'all' ? { TEMAccountId: this.selectedTem } : {}),
      ...(this.sorting ? { OrderBy: this.sorting, SortOrder: this.sortingType } : {}),
    };

    this.exportAccounts = this.exportAccounts;
  }

  cols: any[];
  filesColumns: any = []
  selectedFiles!: any[];
  colsshow: any[];
  displaycols: any[];
  setCols() {
    this.cols = [
      createColumn(1, '250px', true, 'text', 'Account', 'BillingAccountHierarchyNumber', 'Main Account Number'),
      createColumn(1, '165px', false, 'text', '', 'PayableAccountDisplayValue', 'Payable Account'),
      createColumn(1, '200px', false, 'text', '', 'CustomerAccountName', 'Customer'),
      createColumn(1, '150px', false, 'text', '', 'VendorAccountName', 'Vendor'),
      createColumn(1, '200px', false, 'text', '', 'ParentVendorAccountName', 'Parent Vendor', 'open'),
      createColumn(1, '210px', false, 'text', '', 'PayableVendorAccountName', 'Payable Vendor', 'open'),
      createColumn(1, '150px', false, 'text', '', 'CurrencyName', 'Currency', 'open'),
      createColumn(1, '200px', false, 'text', '', 'InvoiceFrequencyDisplayName', 'Invoice Occurrence', 'open'),
      createColumn(1, '150px', false, 'numberFilter', '', 'InvoiceBillDay', 'Bill Day', 'open'),
      createColumn(1, '150px', false, 'numberFilter', '', 'InvoicePayByDay', 'Pay by # Days', 'open'),
      createColumn(1, '150px', false, 'text', '', 'BillingAccountStatus', 'Status'),
      createColumn(1, '200px', false, 'dateFilter', '', 'InvoiceStartDate', 'Invoice Start Date', 'open'),

      createColumn(2, '230px', true, 'text', 'Remit Address', 'RemitAddressDisplay', 'Address'),
      // createColumn(2, '210px', false, 'text', '', 'PayableVendorAccountName', 'Payable Vendor', 'open'),

      createColumn(3, '190px', true, 'text', 'Invoice Retrieval', 'InvoiceSource', 'Invoice Source'),
      createColumn(3, '175px', false, 'text', '', 'InvoiceRetrievalMethodDisplayName', 'Retrieval Method', 'open'),
      createColumn(3, '165px', false, 'numberFilter', '', 'InvoiceRecieveDay', 'Retrieval # Days', 'open'),
      createColumn(3, '155px', false, 'numberFilter', '', 'InvoiceMissingDay', 'Missing # Days', 'open'),
      createColumn(3, '200px', false, 'text', '', 'InvoiceRetrievalWebURL', 'URL', 'open'),
      createColumn(3, '200px', false, 'text', '', 'InvoiceRetrievalWebLogin', 'Username', 'open'),
      createColumn(3, '200px', false, 'text', '', 'InvoiceRetrievalPasswordManagerURLLink', 'Password Manager', 'open'),
      createColumn(3, '200px', false, 'text', '', 'InvoiceRetrievalEmail', 'Email', 'open'),
      createColumn(3, '200px', false, 'text', '', 'InvoiceRetrievalNotes', 'Notes', 'open'),

      createColumn(4, '180px', true, 'text', 'Data Retrieval', 'DataRetrievalSource', 'Data Source'),
      createColumn(4, '170px', false, 'text', '', 'DataRetrievalMethodDisplayName', 'Retrieval Method', 'open'),
      createColumn(4, '165px', false, 'numberFilter', '', 'DataRecieveDay', 'Retrieval # Days', 'open'),
      createColumn(4, '155px', false, 'numberFilter', '', 'DataMissingDay', 'Missing # Days', 'open'),
      createColumn(4, '190px', false, 'text', '', 'DataRetrievalProcessingMethodDisplay', 'Processing Method', 'open'),
      createColumn(4, '200px', false, 'text', '', 'DataRetrievalTemplateType', 'Template Type', 'open'),
      createColumn(4, '190px', false, 'text', '', 'DataRetrievalWebURL', 'URL', 'open'),
      createColumn(4, '200px', false, 'text', '', 'DataRetrievalWebLogin', 'Username', 'open'),
      createColumn(4, '200px', false, 'text', '', 'DataRetrievalPasswordManagerURLLink', 'Password Manager', 'open'),
      createColumn(4, '200px', false, 'text', '', 'DataRetrievalEmail', 'Email', 'open'),
      createColumn(4, '200px', false, 'text', '', 'DataRetrievalNotes', 'Notes', 'open'),

      createColumn(5, '180px', true, 'text', 'Payment Settings', 'PaymentResponsible', 'Bill Pay'),
      createColumn(5, '200px', false, 'text', '', 'PaymentTypeDisplayName', 'Payment Method', 'open'),

      createColumn(6, '200px', true, 'text', 'Approval Settings', 'APResponsible', 'AP Responsible'),
      createColumn(6, '200px', false, 'text', '', 'AutoApprovalStatusValue', 'Auto Approval', 'open'),
      createColumn(6, '200px', false, 'text', '', 'AutoApprovalTimelineStatusValue', 'Approval Timeline', 'open'),
      createColumn(6, '200px', false, 'dateFilter', '', 'ApprovalEndDate', 'Approval End Date', 'open'),
      createColumn(6, '200px', false, 'text', '', 'ApprovalVarianceLimitStatusValue', 'Approval Variance Limit', 'open'),
      createColumn(6, '200px', false, 'numberFilter', '', 'ApprovalVarianceLimit', 'Variance %', 'open'),
    ];

    this.cols.forEach((col) => {


      if (col.isChildren) {

        let data: any = {
          "label": col.header,
          "isparent": true,
          "parentid": col.parent,
          "expanded": true,
          "children": []
        }
        const colParent = this.cols.filter(item => item.parent === col.parent);
        colParent.forEach(element => {
          data['children'].push(
            {
              "label": element.childHeader,
              "isparent": false,
              "parentid": element.parent
            }
          )
        });
        this.filesColumns.push(data)

        const closedColumns = this.cols.filter(item => item.parent === col.parent && item.columnGroupShow === 'close');
        col.colspan = closedColumns.length;
        col.Parentwidth = closedColumns.map((value) => parseInt(value.width.replace('px', ''))).reduce(
          (accumulator, currentValue) => accumulator + currentValue, 0) + 'px';
      }
    });
    this.selectedFiles = _.cloneDeep(this.filesColumns);
    this.colsshow = JSON.parse(JSON.stringify(this.cols));

    this.displaycols = this.cols.filter(col => col.columnGroupShow == 'close');
    this.commonColumnsFn();
  }


  commonColumnsFn() {

    this.cols.forEach((col) => {
      if (col.isChildren) {

        const closedColumns = this.cols.filter(item => item.parent === col.parent && item.columnGroupShow === 'close');
        col.colspan = closedColumns.length;
        if (this.cols.filter(item => item.parent === col.parent && item.displayCheckboxColumns).length === 1 ||
          this.colsshow.filter(item => item.parent === col.parent && item.columnGroupShow === 'open').length === 0) {
          col.isToggle = false;
        } else {
          col.isToggle = true;
        }

        if (this.cols.filter(item => item.parent === col.parent && item.displayCheckboxColumns).length === 0) {
          col.isParentVisible = false;
        } else {
          col.isParentVisible = true;
        }

        col.Parentwidth = closedColumns.map((value) => parseInt(value.width.replace('px', ''))).reduce(
          (accumulator, currentValue) => accumulator + currentValue, 0) + 'px';
      }
    });
    this.displaycols = this.cols.filter(col => col.columnGroupShow == 'close');
  }

  tableDataExist: any;
  tableDataExistFn(e?: any) {
    this.tableDataExist = e;
  }
  viewNEdit: boolean = false;

  ngOnInit(): void {
    this.viewNEdit = rolePermission(['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser']);
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }

  onButtonClick(value: string): void {
    this.selectedButton = value;
    this.selected = 0;
    setTimeout(() => this.goToPage(value), 0);
  }

  goToPage(to: any) {
    if (to === 'Remit Addresses') {
      this.router.navigate(['/finances/remit-addresses']);
    }
  }

  TemDDArray: any = [];
  onTemChange(event: any) {
    this.TemDDArray[this.selected] = { id: Number(event), type: this.currentOpenEditPagevar };
  }

  selectedTemDD: string = 'all';
  filterGridByTEMId(e: any) {
    if (this.selectedTem && (this.selectedTemDD !== this.selectedTem)) {
      this.selectedTemDD = this.selectedTem;
      this.BillingAccountsComponent.filterCustomerGridByTEMId(this.selectedTem);
    }
  }

  isApiAlerdayCall: boolean = false;
  pTableContain = { first: 1 };
  finalAllDetailArr: any;
  files: TreeNode[];
  private _unsubscribeGRid: Subject<any> = new Subject<any>();
  loading: boolean;


  totalRecords: number;

  handleError() {
    this.loading = false;
    this.files = [];
  }

  extractData(item: any) {
    const fields = Object.keys(item);

    return fields.reduce((acc: any, field: any) => {
      acc[field] = item[field];
      return acc;
    }, {});
  }

  tabsArray: any = [];
  selected: any = 0;

  OpenAddBillingTab() {
    console.log('OpenAddBillingTab');
    this.tabsArray.push({
      tabTypes: 'newBillingAccount',
      BillingRowData: null,
      newAdded: true,
      selectedTem: this.selectedTem,
    });
    this.tabsArray[this.tabsArray.length - 1].addAfterEdit = false;
    setTimeout(() => {
      this.selected = this.tabsArray.length;
    }, 0);
  }

  changeFinanceAcc(event: any) {
    this.selected = event;
    if (this.selected === 0) {
      this.selectedTem = 'all';
      this.disableTemSearch = false;
    }
    this.currentOpenEditPagevar = (event === 0) ? 'Table' : this.currentOpenEditPagevar;
  }

  editBillingTab(eventData: any, type?: any) {
    this.tabsArray.push({
      tabTypes: 'editBillingAccount',
      BillingRowData: eventData.data,
      newAdded: false,
    });
    setTimeout(() => {
      this.selected = this.tabsArray.length;
    }, 100);
  }

  exportAccountData(data: any) {
    this.exportAccounts = data;
  }

  isBillingAccountExist(e: any) {
    this.tableDataExist = e;
  }
  removedTabIndex = false;

  removeTab(tabIndex: any, type?: string) {
    this.removedTabIndex = true;
    this.setCloneDeepTabArray(tabIndex);
    this.changecc(this.tabsArray.length);
  }

  setCloneDeepTabArray(index: any) {
    this.tabsArray.splice(index, 1);
    this.tabsArray = _.cloneDeep(this.tabsArray);
  }

  changecc(event: any) {
    this.selected = event;
    if (this.selected === 0) {
      this.selectedTem = 'all';
      this.disableTemSearch = false;
    }
  }

  updatedBillingData($event: any, i: any) {
    this.tabsArray[i].BillingRowData = $event;
    this.tabsArray[i].addAfterEdit = true;
  }

  isLocationNotes: boolean = false;

  onAddNotesEnabledEmit($event: any) {
    this.isLocationNotes = $event;
  }

  sendAccHirercyToTable(data: any) {
    const updatedData = {
      ...data,
      Id: data.BillingAccountHierarchyId,
      BillingAccountHierarchyNumber: data.AccountNumber,
    };

    this.tabsArray.push({
      tabTypes: 'editBillingAccount',
      BillingRowData: updatedData,
      newAdded: false,
    });

    setTimeout(() => {
      this.selected = this.tabsArray.length;
    }, 2);
  }

  addBillingAccountDestroy(data: any, i: any) {
    if (!this.removedTabIndex) {
      if (this.tabsArray && this.tabsArray[i]) {
        this.tabsArray[i]['BillingRowData'] = data;
      }
    } else {
      this.removedTabIndex = false;
    }
  }

  currentOpenBillingAccount($event: any) {
    this.currentOpenEditPagevar = ($event) ? 'Edit' : 'Add';
    if (this.currentOpenEditPagevar === 'Edit') {
      this.disableTemSearch = true;
    } else {
      this.disableTemSearch = false;
    }
  }

  setTemDDValueEventFromChild(event: any) {
    if (!event) {
      this.selectedTem = 'all';
    }
    if (this.selected > 0 && event != '') {
      this.selectedTem = event;
    } else if (event == '' && this.selected <= 0) {
      this.selectedTem = 'all';
    }
  }

  billingAccountData: any;

  onBillingAccountData($event: any) {
    this.billingAccountData = $event;
  }

  disableAccNotesOptions: any;
  enableAddNotes: any;
  onAccountNotesData($event: any) {
    this.disableAccNotesOptions = $event?.spinner;
    if ($event.length) {
      this.enableAddNotes = false;
    } else {
      this.enableAddNotes = true;
    }
  }
  newBillingId: any;
  onNotesAddBillingAccIdOne($event: any) {
    this.newBillingId = $event;
  }

  loadNoteAccountComponent: any;

  ngOnDestroy(): void {
    this.loadNoteAccountComponent = false;
  }

  currentTabName: any;
  currentTabNameEmit(event: any) {
    this.currentTabName = event;
    console.log('currentTabName123 ',this.currentTabName);
  }

  setLocationNotes(event: any) {
    if (event === 'add') {
      this.AccountDialog();
    } else if (event === 'inactive') {
      this.setAccountNotes('inactive');
    } else if (event === 'active') {
      this.setAccountNotes('active');
    }
  }

  AccountDialog() {

    let BillingAccountId =
      this.billingAccountData?.BillingAccountID || this.billingAccountData?.Id || this.billingAccountData?.BillingAccountId ||
      this.billingAccountData?.BillingAccountHierarchyId || this.newBillingId;

    const dialogRef = this.dialog.open(AccoutNoteDialogComponent, {
      panelClass: 'width-900',
      disableClose: true,
      // data: this.billingAccountData
      data: BillingAccountId
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        // this.loadNoteAccountComponent = true;
        this.parent.children.forEach((child) => child.getbillingAccountNotes());
      }
    });
  }

  setAccountNotes(type: any) {
    this.locationService.setStatusValue(type);
  }
}
