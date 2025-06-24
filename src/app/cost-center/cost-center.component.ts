import { Component, ViewChild } from '@angular/core';
import { HeaderSectionComponent } from '../common/header-section/header-section.component';
import { SharedModule } from '../demo/shared/shared.module';
import { LocationService } from '../services/location.service';
import { Router } from '@angular/router';
import { ErrorWarningPopupComponent } from '../common/error-warning-popup/error-warning-popup.component';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { rolePermission } from '../services/helper';
import _ from 'lodash';
import { CostCentersComponent } from '../cost-centers/cost-centers.component';
import { AddEditCostCentersComponent } from '../cost-centers/add-edit-cost-centers/add-edit-cost-centers.component';

@Component({
  selector: 'app-cost-center',
  imports: [HeaderSectionComponent, SharedModule, CostCentersComponent, AddEditCostCentersComponent],
  templateUrl: './cost-center.component.html',
  styleUrl: './cost-center.component.scss'
})
export class CostCenterComponent {

  buttonOptions: any = [
    { label: 'Cost Centers', value: 'Cost Centers', icon: 'fas fa-piggy-bank', redirectUrl: '/finances/cost-centers' },
    { label: 'Cost Center Repository', value: 'Cost Center Repository', icon: 'fas fa-calendar-plus', redirectUrl: '/finances/cost-center-repository' },
    { label: 'Cost Center Structure', value: 'Cost Center Structure', icon: 'fas fa-calendar-plus', redirectUrl: '/finances/cost-center-structure' },
  ];

  selectedButton: any = 'Cost Centers';
  loaderParent: boolean = false;
  isDisabledExport: boolean = false;
  tableDataExist: boolean = false;
  viewNEdit: boolean = false;

  public exportRemitData: any;
  currentOpenEditPagevar: any = 'Table';
  addbuttonCondition: boolean = false;
  isCCDisable: boolean = false;
  @ViewChild(CostCentersComponent) private costCenterCom!: CostCentersComponent;

  isTEMUser: boolean = false;
  isCompanyManager: boolean = false;
  constructor(public locationService: LocationService, private router: Router, public dialog: MatDialog) {
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }

  public exportCCData: any;

  exportCCExcelData(data: any) {
    this.exportCCData = data;
  }

  onButtonClick(value: string): void {
    this.selectedButton = value;
    const findButton = this.buttonOptions.find((button: any) => button.value === value);
    if (findButton) {
      setTimeout(() => this.goToPage(findButton.redirectUrl), 0);
    }
    
  }

  goToPage(url: any) {
    this.router.navigate([url]);
  }

  companyList: any = []

  selectedCompany: any = 'all';
  OpenCostCenterTab() {
    // Extracted logic for customer and company data lookup
    const companyData = this.companyList.find((el: any) => el.CompanyID === this.selectedCompany);
    const selectedCustomerId = companyData?.Account?.Id;

    if (this.selectedCompany !== 'all') {
      this.locationService.getTemAccountById(this.selectedCompany).subscribe((data) => {
        if (data) {
          this.handleCostAllocationStatus(data.Data.CostAllocationStatus, selectedCustomerId);
        }
      });
    } else {
      this.addNewCostCenterTab(selectedCustomerId);
    }
  }

  selectedTem: string = 'all';
  loadCompany: boolean = false;
  selectedCompanyVal: any = '';

  getCompany() {
    let data = {
      temAccountId: this.selectedTem
    }
    this.loadCompany = true;
    this.locationService.getTemCompany(data).subscribe({
      next: data => {
        this.loadCompany = false;
        if (data && data.$values) {
          this.companyList = data.$values;
          if (this.selectedCompanyVal !== '' && this.selectedCompanyVal !== undefined) {
            this.selectedCompany = this.selectedCompanyVal;
          }
        }
      },
      error: error => {
        this.loadCompany = false;
        let errorMessage: any = '';

      }
    });
  }

  selected: any = 0;
  setCompanyDDValueEventCC(data: any) {
    this.selectedCompanyVal = data;
    if (this.selected > 0 && data != '') {
      if (this.companyList.length > 2) {
      } else {
        setTimeout(() => {
          this.getCompany();
        }, 2000);
      }
      this.selectedCompany = data;
    }

    if (this.selected > 0 && data != '') {
      let dataa = {
        target: {
          value: data
        }
      };
      // this.onChangeTem(dataa);
      this.selectedCompany = data;
    } else if (data == '' && this.selected <= 0) {
      this.selectedCompany = 'all';
    }
  }
  isCompanyUser: boolean = false;

  ngOnInit(): void {
    this.isTEMUser = this.locationService.isUserHasTEMUserRole();
    this.isCompanyUser = this.locationService.isUserCompanyUser();
    this.isCompanyManager = this.locationService.isUserCompanyManager();
    this.viewNEdit =  !this.isTEMUser || !this.isCompanyUser;
    this.hasSsuperTemUsers = rolePermission(['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser']);

    this.getTemLists();
    this.getCustomerForUser();
  }

  handleCostAllocationStatus(costAllocationStatus: boolean | null, selectedCustomerId: string) {
    if (costAllocationStatus === null || costAllocationStatus === false) {
      this.showErrorPopup('Cost Allocation is presently inactive. To utilize these services, please activate Cost Allocation.');
    } else {
      this.addNewCostCenterTab(selectedCustomerId);
    }
  }

  showErrorPopup(message: string) {
    const errorData = {
      messageType: 'error',
      title: 'Attention',
      titleClass: 'text-c-blue',
      icon: 'fas fa-exclamation-circle',
      iconClass: 'text-c-blue f-70',
      message: message
    };

    this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
  }

  companyDDShow = true;
  selectCustomer: any = '';
  tabsArray: any = [];
  selectedWiseTemDDCC: any = {};

  addNewCostCenterTab(selectedCustomerId: string) {
    this.companyDDShow = false;
    this.currentOpenEditPagevar = 'Add';
    this.selectCustomer = selectedCustomerId;

    // Add the new tab
    this.tabsArray.push({ tabTypes: 'newCostCenter', CostCenterRowData: {} });

    // Update the selected tab and store the template ID
    this.selected = this.tabsArray.length;
    this.selectedWiseTemDDCC[this.selected] = this.selectedTem;
  }

  onBtnExportDataAsExcelCostCenter() {

    this.isCCDisable = true;
    this.locationService
      .getCostCentersExcel(this.exportCCData)
      .subscribe({
        next: data => {
          this.isCCDisable = false;
          let bolbUrl = URL.createObjectURL(data);
          var link = document.createElement("a");
          link.setAttribute("href", bolbUrl);
          link.setAttribute("download", "Cost Centers.xlsx");
          link.style.display = "none";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

        },
        error: error => {
          this.isCCDisable = false;

        }
      });
  }

  customers: any = [];
  getCustomerUser: Subject<void> = new Subject<void>();
  getCustomerForUser() {
    this.getCustomerUser.next();
    this.customers = [];
    this.locationService.getCustomerDropDown().pipe(takeUntil(this.getCustomerUser)).subscribe((data) => {
      if (data && data.$values) {
        this.customers = data.$values;
        const newObj = { AccountName: 'All', Id: 'all' };
        this.customers.unshift(newObj);
      } else {
        this.customers = [];

      }
    }, error => {
      this.customers = [];

    });
  }

  tems: any = [];
  hasSsuperTemUsers: boolean = false;
  getTemLists() {
    this.locationService.getTemLists().subscribe((data) => {
      if (data && data.$values) {
        this.tems = data.$values;

        if (this.hasSsuperTemUsers) {
          let id = sessionStorage.getItem("LoggedAccountId");
          const found = this.tems.find((element: any) => Number(element.Id) === Number(id));
          this.tems.unshift(found);

          this.tems = this.tems.filter((object: any, index: any) => {
            if (object) {
              return this.tems.indexOf(object) === index;
            } else {
              return false;
            }
          });
        }
        const newObj = { AccountName: 'All', Id: 'all' };
        this.tems.unshift(newObj);
      }
    });
  }
  currentIndex = 0;

  changecc(event: any) {
    this.selected = event;
    this.currentIndex = event;
    if (this.selected === 0) {
      this.selectedTem = 'all';
      this.selectedCompany = 'all';
      this.companyDDShow = true;

      this.selectedWiseTemDDCC[this.currentIndex] = this.selectedTem;

    }
    this.currentOpenEditPagevar = (event === 0) ? 'Table' : this.currentOpenEditPagevar;

    this.selectedTem = this.selectedWiseTemDDCC[this.currentIndex];
  }

  removedTabIndex = false;
  selectedIP: any = 0;
  invoiceArray: any = [];

  removeTab(tabIndex: any, type?: string) {
    this.removedTabIndex = true;
    this.setCloneDeepTabArray(tabIndex);
    this.changecc(this.tabsArray.length);
    this.selectedWiseTemDDCC.splice(_.cloneDeep(tabIndex), 1);
    this.selectedWiseTemDDCC = _.cloneDeep(this.selectedWiseTemDDCC);

  }

  setCloneDeepTabArray(index: any) {
    this.tabsArray.splice(index, 1);
    this.tabsArray = _.cloneDeep(this.tabsArray);
  }

  currentOpenEditforCC($event: any) {
    this.currentOpenEditPagevar = ($event) ? 'Edit' : 'Add';
    if (this.currentOpenEditPagevar === 'Add') {
      this.companyDDShow = false;
    } else {
      this.companyDDShow = true;
    }
  }

  editCostCenterTab(editEventData: any) {
    this.currentOpenEditPagevar = 'Edit';
    this.companyDDShow = true;
    this.tabsArray.push({
      tabTypes: 'editCostCenter',
      CostCenterRowData: editEventData,
    });
    setTimeout(() => {
      this.selected = this.tabsArray.length;
      this.currentIndex = this.selected;
      this.selectedWiseTemDDCC[this.selected] = this.selectedTem;
    }, 2);
  }

  selectedTemDD: string = 'all';

  filterCC() {
    this.selectedWiseTemDDCC[this.selected] = Number(this.selectedTem);
    if (this.currentOpenEditPagevar === 'Table') {

      if (this.selected === 0 || (this.selectedTem && (this.selectedTemDD !== this.selectedTem))) {
        this.costCenterCom.getCostCentersData(this.selectedCompany);
      }
    }
  }

  selectedTemCC(value: any) {
    this.selectedTemDD = value;
  }
  costCentersIds: any = [];
  callingAPI = {
    active: false,
    deactive: false,
  };
  callingAPICCS = false;

  changeCostCenterStatus(val: any) {
    let data: any = {
      costCenterIds: this.costCentersIds,
      active: val,
    };

    this.callingAPI.active = val;
    this.callingAPI.deactive = !val;
    this.callingAPICCS = true;
    this.locationService
      .updateCostCenterActiveInActive(data)
      .subscribe((data) => {
        this.callingAPICCS = false;
        this.callingAPI.active = false;
        this.callingAPI.deactive = false;
        if (data?.Message) {
          if (data.Success) {
            let errorData: any = {
              messgeType: 'error',
              title: 'Attention',
              titleClass: 'text-c-blue',
              icon: 'fas fa-thumbs-up',
              iconClass: 'text-c-blue f-70',
              message: data.Message, //if messges is multiple use array
            };
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
              panelClass: 'error-warning',
              data: errorData,
            });
            this.costCentersIds = [];
            this.costCenterCom.getCostCentersData();
          } else {
            let errorData: any = {
              messgeType: 'error',
              title: 'Attention',
              titleClass: 'text-c-blue',
              icon: 'fas fa-exclamation-circle',
              iconClass: 'text-c-blue f-70',
              message: data.Message, //if messges is multiple use array
            };
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
              panelClass: 'error-warning',
              data: errorData,
            });
            this.costCentersIds = [];
            this.costCenterCom.getCostCentersData();
          }
        } else {
          if (data !== 'Please select Inactive Cost Center to change the status to Active' && data !== 'Please select Active Cost Center to change the status to Inactive') {
            this.costCentersIds = [];
            this.costCenterCom.getCostCentersData();
          }
          if (data == 'Cost centers deactivated successfully' || data == 'Cost centers activated successfully') {
            let errorData: any = {
              messgeType: 'error',
              title: 'Attention',
              titleClass: 'text-c-blue',
              icon: 'fas fa-thumbs-up',
              iconClass: 'text-c-blue f-70',
              message: data.Message, //if messges is multiple use array
            };
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
              panelClass: 'error-warning',
              data: errorData,
            });
          } else {
            this.ErrorWarningPopupOpen(data);
          }

        }
      }, error => {
        this.callingAPICCS = false;
      });
  }

  ErrorWarningPopupOpen(message: any) {
    let errorData: any = {
      messgeType: 'error',
      title: 'Attention',
      titleClass: 'text-c-blue',
      icon: 'fas fa-exclamation-circle',
      iconClass: 'text-c-blue f-70',
      message: message, //if messges is multiple use array
    };
    const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
      panelClass: 'error-warning',
      data: errorData,
    });
  }
  isccDataExist = false;
  ccDataExist(data: any) {
    this.isccDataExist = data;
  }
  gridApiAccount: any;
  gridColumnApiAccount: any;
  onAgGridReadyCostCenterEmit($event: any) {
    this.gridApiAccount = $event.api;
    this.gridColumnApiAccount = $event.columnApi;
  }

  onCostCenterSelectedRow($event: any) {
    this.costCentersIds = $event;
  }

  onSaveCostCenterEvent(event: any, index: any) {
    if (event) {
      this.setCloneDeepTabArray(index);
      if (this.tabsArray.length > 1) {
        this.changecc(this.tabsArray.length)
      } else if (this.tabsArray.length === 1 || !this.tabsArray.length) {
        this.changecc(this.tabsArray.length === 1 ? 1 : 0)
      }
      this.refreshCostCenterData();
    }
  }
  refreshCostCenterData() {
    if (this.costCenterCom) {
      this.costCenterCom.getCostCentersData();
    }
  }

  
  setTemDDValueEventCC(data: any) {
    this.selected = this.currentIndex;
    if (this.selected > 0 && data != '') {
      this.selectedTem = data;
      this.selectedWiseTemDDCC[this.currentIndex] = data;

    } else if (data == '' && this.selected <= 0) {
      this.selectedTem = 'all';
      this.selectedWiseTemDDCC[this.currentIndex] = '';

    }

    if (this.currentOpenEditPagevar === 'Add') {
      if (this.currentIndex === this.selected) {
        this.selectedTem = this.selectedWiseTemDDCC[this.selected];
      }
    }
  }

  onComponetDestroy(data: any, i: any, destroy?: any) {
    if (this.tabsArray && this.tabsArray[i]) {
      this.tabsArray[i]['CostCenterRowData'] = data;
    }
  }
}
