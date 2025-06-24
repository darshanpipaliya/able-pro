import { Component, ViewChild } from '@angular/core';
import { SharedModule } from '../demo/shared/shared.module';
import { PrimgModule } from '../demo/shared/primeng.module';
import { HeaderSectionComponent } from '../common/header-section/header-section.component';
import { LocationService } from '../services/location.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { rolePermission } from '../services/helper';
import { CostStructureService } from '../services/cost-structure.service';
import { ErrorWarningPopupComponent } from '../common/error-warning-popup/error-warning-popup.component';
import { CostCenterStructureMainComponent } from '../cost-center-structure-main/cost-center-structure-main.component';
import _ from 'lodash';
import { CostCenterStructureComponent } from '../cost-center-structure/cost-center-structure.component';

@Component({
  selector: 'app-cost-center-structure-module',
  imports: [SharedModule, PrimgModule, HeaderSectionComponent, CostCenterStructureMainComponent, CostCenterStructureComponent],
  templateUrl: './cost-center-structure-module.component.html',
  styleUrl: './cost-center-structure-module.component.scss',
  providers: [CostStructureService]
})
export class CostCenterStructureModuleComponent {
  selectedTem: string = 'all';
  isTEMUser: boolean = false;

  constructor(public locationService: LocationService, private router: Router, public dialog: MatDialog, private costStructureService: CostStructureService) {
  }

  buttonOptions: any = [
    { label: 'Cost Centers', value: 'Cost Centers', icon: 'fas fa-piggy-bank', redirectUrl: '/finances/cost-centers' },
    { label: 'Cost Center Repository', value: 'Cost Center Repository', icon: 'fas fa-calendar-plus', redirectUrl: '/finances/cost-center-repository' },
    { label: 'Cost Center Structure', value: 'Cost Center Structure', icon: 'fas fa-calendar-plus', redirectUrl: '/finances/cost-center-structure' },
  ];

  selectedButton: any = 'Cost Center Structure';

  loaderParent: boolean = false;
  isDisabledExport: boolean = false;
  tableDataExist: boolean = false;
  viewNEdit: boolean = false;
  selectedCCS: any = 0;
  currentOpenEditPagevar: any = 'Table';
  isCompanyUser: boolean = false;

  private readonly getCustomerUser = new Subject<void>();
  @ViewChild(CostCenterStructureMainComponent) private costCenterStrucCom: CostCenterStructureMainComponent;

  trackByIndex(index: number, item: any): number {
    return index;
  }

  customers: any = [];
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

  ngOnInit(): void {
    this.isTEMUser = this.locationService.isUserHasTEMUserRole();
    this.isCompanyUser = this.locationService.isUserCompanyUser()

    this.hasSsuperTemUsers = rolePermission(['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser']);

    this.getTemLists();
    this.getCustomerForUser();

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

  public exportCCsData: any;

  exportCCSExcelData(data: any) {
    this.exportCCsData = data;
  }
  isCCSDisable: boolean = false;
  onBtnExportCostCenterStructure() {

    this.isCCSDisable = true;
    this.costStructureService.exportExcelStructureData(this.exportCCsData).subscribe({
      next: data => {
        this.isCCSDisable = false;
        let bolbUrl = URL.createObjectURL(data);
        var link = document.createElement("a");
        link.setAttribute("href", bolbUrl);
        link.setAttribute("download", "Cost Center Structure.xlsx");
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

      },
      error: error => {
        this.isCCSDisable = false;

      }
    });
  }

  selectedTemCCS: any = 'all'
  selectedCustomerCCS: any = 'all'
  OpenCostCenterstructureTab() {
    const customerId = this.selectedCustomerCCS;
    const temId = this.selectedTemCCS;

    // Extract temName and custName logic outside of if-else
    const temName = _.find(this.tems, (x: any) => x.Id == temId)?.AccountName;
    let custName = _.find(this.customers, (x: any) => x.Id == customerId)?.AccountName;

    // Fallback for undefined custName
    if (!custName) {
      custName = _.find(this.customers, (x: any) => x.Id === customerId)?.AccountName;
    }

    // If the selected customer is not 'all', check cost allocation status
    if (customerId !== 'all') {
      this.locationService.getTemAccountById(customerId).subscribe((data) => {
        if (data && data.Data?.CostAllocationStatus === false) {
          this.showErrorPopup('Cost Allocation is presently inactive. To utilize these services, please activate Cost Allocation.');
          return;
        }

        this.addTab(temId, temName, customerId, custName);
      });
    } else {
      this.addTab(temId, temName, customerId, custName);
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

  tabsArray: any = [];

  addTab(temId: any, temName: any, customerId: any, custName: any) {

    this.tabsArray.push({
      tabTypes: 'add',
      temValue: { temID: temId, temName: temName },
      customerValue: { customerId: customerId, custName: custName },
      CostCenterStructureRowData: {}
    });

    this.selectedCCS = this.tabsArray.length;
  }

  selectedTEMDDCCs = 1000;

  filterCCS() {
    if (this.selectedCCS === 0 || (this.selectedTemCCS && (this.selectedTEMDDCCs !== this.selectedTemCCS))) {
      this.costCenterStrucCom.getCostCenterStructureData(this.selectedCustomerCCS);
    }
  }

  selectedTemCCSEvent(value: any) {
    this.selectedTEMDDCCs = value;
  }

  isccsDataExist = false;
  CCSDataExist(data: any) {
    this.isccsDataExist = data;
  }

  onButtonClick(value: string): void {
    this.selectedButton = value;
    const findButton = this.buttonOptions.find((button: any) => button.value === value);
    if (findButton) {
      setTimeout(() => this.goToPage(findButton.redirectUrl), 0);
    }

  }

  removedTabIndex = false;
  removeTabS(tabIndex: any) {
    this.removedTabIndex = true;
    this.setCloneDeepTabArray(tabIndex);
  }

  goToPage(url: any) {
    this.router.navigate([url]);
  }

  currentIndex = 0;

  changeCCS(event: any) {
    this.currentIndex = event;
    if (this.selectedCCS == 0) {
      if (this.selectedTemCCS !== 'all' || this.selectedCustomerCCS !== 'all') {
        this.selectedTemCCS = 'all';
        this.selectedCustomerCCS = 'all';
        this.costCenterStrucCom.getCostCenterStructureData();
      }
    } else {
      if (this.tabsArray[this.currentIndex - 1]?.tabTypes === "add") {
        this.selectedTemCCS = this.tabsArray[this.currentIndex - 1]['temValue']['temID'];
        this.selectedCustomerCCS = this.tabsArray[this.currentIndex - 1]['customerValue']['customerId'];
      } else {
        this.selectedTemCCS = this.tabsArray[this.currentIndex - 1]['CostCenterStructureRowData']['TEMAccountId'];
        this.selectedCustomerCCS = this.tabsArray[this.currentIndex - 1]['CostCenterStructureRowData']['CustomerAccountId'].toString();

        const e = {
          target: {
            value: this.selectedTemCCS
          }
        }
        this.onChangeTem(e);
      }
    }

  }

  onChangeTem(event: any) {
    if (event.target.value !== 'all') {
      this.customers = [];
      this.getCustomerUser.next()
      this.locationService.getCustomerDropdownByNewTEM(event.target.value).pipe(takeUntil(this.getCustomerUser)).subscribe((data) => {
        if (data && data.Data.$values) {
          this.customers = data.Data.$values;
        } else {
          this.customers = [];
        }
      }, error => {
        this.customers = [];
      });
    }
  }

  editCostCenterStructure(data: any) {
    this.tabsArray.push({
      tabTypes: 'edit',
      CostCenterStructureRowData: data,
    });
    setTimeout(() => {
      this.selectedCCS = this.tabsArray.length;
    }, 2);
  }

  onSaveCostCenterStructure(event: any, index: any) {
    if (event) {
      this.setCloneDeepTabArray(index);
      this.selectedCCS = 0;
      this.refreshCostCenterStructure();
    }
  }

  setCloneDeepTabArray(index: any) {
    this.tabsArray.splice(index, 1);
    this.tabsArray = _.cloneDeep(this.tabsArray);
  }

  refreshCostCenterStructure() {
    this.costCenterStrucCom.getCostCenterStructureData();
  }

  setTemDDValueEventCCS(data: any) {
    this.selectedCCS = this.currentIndex;
    if (this.selectedCCS > 0 && data != '') {
      this.selectedTemCCS = data.temid;
      this.selectedCustomerCCS = data.customerid.toString();
    } else if (data == '' && this.selectedTemCCS <= 0) {
      // this.selectedTemCCS = sessionStorage.getItem("LoggedAccountId");

    } else {
      this.selectedCustomerCCS = 'all';
    }
  }
}
