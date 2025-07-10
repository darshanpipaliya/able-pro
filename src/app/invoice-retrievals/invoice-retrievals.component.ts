import { Component, ViewChild } from '@angular/core';
import { SharedModule } from '../demo/shared/shared.module';
import { InvoiceRetrievalComponent } from '../invoice-retrieval/invoice-retrieval.component';
import { LocationService } from '../services/location.service';
import { rolePermission } from '../services/helper';
import _ from 'lodash';
import { EditBillingAccountComponent } from '../edit-billing-account/edit-billing-account.component';
import { AddForecastingRecordDialogComponent } from '../invoice-retrieval/add-forecasting-record-dialog/add-forecasting-record-dialog.component';
import { EditForcastingRecordDialogComponent } from '../invoice-retrieval/edit-forcasting-record-dialog/edit-forcasting-record-dialog.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-invoice-retrievals',
  imports: [SharedModule, InvoiceRetrievalComponent, EditBillingAccountComponent, AddForecastingRecordDialogComponent,
    EditForcastingRecordDialogComponent
  ],
  templateUrl: './invoice-retrievals.component.html',
  styleUrl: './invoice-retrievals.component.scss'
})
export class InvoiceRetrievalsComponent {


  public selectedMonth: any;
  selectedTemRetrival: string = 'all';
  disableTemSearchDD: any;
  disableTemSearch: any;
  tems: any = [];

  public exportRetrievalData: any;
  isDisabledretrieval = false;
  isRowDataExist: boolean;
  selectedMenuButton: any = {
    label: 'Invoice Retrievals',
    value: 'Invoice Retrievals',
    redirectUrl: '/invoices/invoice-retrievals',
  };
  temRoles = false;
  tabsArray: any = [];
  isTEMUser: boolean = false;
  isCompanyUser: boolean = false;
  @ViewChild(InvoiceRetrievalComponent)
  private invoiceRetrievalComponent: InvoiceRetrievalComponent;
  currentUrl: string;

  constructor(private locationService: LocationService, private router: Router) {
    console.log(' router router ', this.router.url);
    this.currentUrl = this.router.url;
    
  }

  ngOnInit(): void {
    this.temRoles = rolePermission(['TEMAdmin', 'TEMUser', 'TEMManager']);
    this.isTEMUser = this.locationService.isUserHasTEMUserRole();
    this.isCompanyUser = this.locationService.isUserCompanyUser()
    this.hasSsuperTemUsers = rolePermission(['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser']);

    this.getTemLists();

  }
  monthFilter(value: any) {
    this.selectedMonth = value;
    this.invoiceRetrievalComponent.getInvoiceRetrivalData(value, this.selectedTemRetrival);
  }

  onBtnExportDataAsExcelRetrival() {

    this.isDisabledretrieval = true;

    this.locationService
      .getInvoiceRetrievalExcel(this.exportRetrievalData.monthVal, this.exportRetrievalData.exportInvoiceRetrieval)
      .subscribe({
        next: (data: any) => {
          this.isDisabledretrieval = false;
          let bolbUrl = URL.createObjectURL(data);
          var link = document.createElement("a");
          link.setAttribute("href", bolbUrl);
          link.setAttribute("download", "Invoice Retrievals.xlsx");
          link.style.display = "none";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

        },
        error: (error: any) => {
          this.isDisabledretrieval = false;

        }
      }
      );
  }

  exportExcelData(data: any) {
    this.exportRetrievalData = data;
  }

  currentOpenEditForecasting = 'Table';
  currentOpenEditforcasting($event: any) {
    this.currentOpenEditForecasting = ($event) ? 'Edit' : 'Add';
    if (this.currentOpenEditForecasting === 'Edit') {
      this.disableTemSearchDD = true;
      this.disableTemSearch = true;
    } else {
      this.disableTemSearchDD = false;
      this.disableTemSearch = false;
    }
  }

  selected: any = 0;

  selectedTem: string = 'all';

  changeInvoiceTab(event: any) {
    this.selected = event;
    if (this.selected === 0) {
      this.selectedTem = 'all';
      this.disableTemSearchDD = false;
      this.disableTemSearch = false;
    }
    this.currentOpenEditForecasting = (event === 0) ? 'Table' : this.currentOpenEditForecasting;
  }

  addForecastingRecordPopup() {
    this.tabsArray.push({ tabTypes: 'newForcasting', RowData: {} });
    setTimeout(() => {
      this.selected = this.tabsArray.length;
    }, 2);
  }

  editForcastingDoubleClick($event: any) {

    if ($event && $event.data) {
      this.tabsArray.push({ tabTypes: 'editForcasting', RowData: $event.data });
      setTimeout(() => {
        this.selected = this.tabsArray.length;
      }, 2);
    }

  }

  setCloneDeepTabArray(index: any) {
    this.tabsArray.splice(index, 1);
    this.tabsArray = _.cloneDeep(this.tabsArray);
  }

  selectedTemInvoice: string = 'all';

  filterCustomerGridByTEMIdRetrival() {
    if (this.selectedTemRetrival && (this.selectedTemInvoice !== this.selectedTemRetrival))
      this.invoiceRetrievalComponent.getInvoiceRetrivalData(this.selectedMonth, this.selectedTemRetrival);
  }

  selectedInvoiceTem(value: any) {
    this.selectedTemInvoice = value;
  }

  rowDataExist(data: any) {
    this.isRowDataExist = data;
  }

  editBillingTab(eventData: any, type?: any) {
    this.tabsArray.push({
      tabTypes: 'editBillingAccount',
      BillingRowData: eventData.data,
      newAdded: false,
    });
    setTimeout(() => {
      this.selected = this.tabsArray.length;
    }, 2);
  }

  removedTabIndex = false;
  selectedWiseTemDDCC: any = [];
  invoiceArray: any = [];
  selectedIP: any = 0;

  removeTab(tabIndex: any, type?: string) {
    this.removedTabIndex = true;
    this.setCloneDeepTabArray(tabIndex);
    this.changecc(this.tabsArray.length);
    this.selectedWiseTemDDCC.splice(_.cloneDeep(tabIndex), 1);
    this.selectedWiseTemDDCC = _.cloneDeep(this.selectedWiseTemDDCC);
    if (type == 'invoice-retrieval') {
      if (this.invoiceArray.length == 1) {
        this.selectedIP = 0;
      }
      this.setCloneDeepInvoiceArray(tabIndex);
    }
  }

  setCloneDeepInvoiceArray(tabIndex: any) {
    this.invoiceArray.splice(_.cloneDeep(tabIndex), 1);
    this.invoiceArray = _.cloneDeep(this.invoiceArray);
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
  currentIndex = 0;

  changecc(event: any) {
    this.selected = event;
    this.currentIndex = event;
    if (this.selected === 0) {
      this.selectedTem = 'all';
      this.disableTemSearch = false;
      this.disableTemSearchDD = false;
      this.selectedWiseTemDDCC[this.currentIndex] = this.selectedTem;
    }
    this.selectedTem = this.selectedWiseTemDDCC[this.currentIndex];
  }

  hasSsuperTemUsers: boolean = false;

  getTemLists() {
    this.locationService.getTemLists().subscribe((data) => {
      if (data && data.$values) {

        const newObj = { AccountName: 'All', Id: 'all' };
        this.tems = data.$values;

        if (this.hasSsuperTemUsers) {
          let id = sessionStorage.getItem("LoggedAccountId");
          const found = this.tems.find((element: any) => Number(element.Id) === Number(id));
          this.tems.unshift(found);

          this.tems = this.tems.filter((object: any, index: number): boolean => {
            return object && this.tems.indexOf(object) === index;
          });
          this.tems.unshift(newObj);
        }
      }
    });
  }

  setTemDDValueEvent(data: any, i: any) {
    if (this.selected > 0 && data != '') {
      this.selectedTemRetrival = data;
    } else if (data == '' && this.selected <= 0) {
      this.selectedTemRetrival = 'all';
    } else {
      this.selectedTemRetrival = 'all';
    }
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

  currentOpenBillingAcc = 'Table';

  currentOpenBillingAccount($event: any) {
    this.currentOpenBillingAcc = ($event) ? 'Edit' : 'Add';
    if (this.currentOpenBillingAcc === 'Edit') {
      this.disableTemSearch = true;
      this.disableTemSearchDD = true;
    } else {
      this.disableTemSearch = false;
      this.disableTemSearchDD = false;
    }
  }
  newBillingId: any;

  onNotesAddBillingAccIdOne($event: any) {
    this.newBillingId = $event;
  }

  setTemDDValueEventFromChild(event: any) {
    if (!event) {
      this.selectedTem = 'all';
    }
    if (this.selected > 0 && event != '') {
      this.selectedTem = event;
    } else if (event == '' && this.selected <= 0) {
      this.selectedTem = 'all';
    } else {
      this.selectedTemRetrival = 'all';
    }
  }

  onUserAddEvent($event: any, i: any) {
    if ($event) {
      this.setCloneDeepTabArray(i);
      this.invoiceRetrievalComponent.ngAfterViewInit();
    }
  }

  openEditBillingTab($event: any) {
    const data = {
      data: $event,
    };
    this.editBillingTab(data);
    this.disableTemSearchDD = false;
  }

  addNewInvoice($event: any) {
    if ($event) {
      this.OpenAddBillingTab();
    }
  }

  OpenAddBillingTab() {
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

  onAddInvoiceRetrivalDestroy(data: any, i: any) {
    if (this.tabsArray && this.tabsArray[i]) {
      this.tabsArray[i]['RowData'] = data;
    }
  }

  goToPage(url: any) {
    this.router.navigate([url]);
  }
}
