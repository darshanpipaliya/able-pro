import { Component, ViewChild } from '@angular/core';
import { HeaderSectionComponent } from '../common/header-section/header-section.component';
import { SharedModule } from '../demo/shared/shared.module';
import { LocationService } from '../services/location.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CostCenterRepositoryComponent } from '../@theme/cost-center-repository/cost-center-repository.component';
import { CostCenterUploadMonitorComponent } from '../cost-center-upload-monitor/cost-center-upload-monitor.component';
import { UploadFileCcrComponent } from '../cost-center-upload-monitor/upload-file-ccr/upload-file-ccr.component';

@Component({
  selector: 'app-cost-center-repo',
  imports: [HeaderSectionComponent, SharedModule, CostCenterRepositoryComponent, CostCenterUploadMonitorComponent],
  templateUrl: './cost-center-repo.component.html',
  styleUrl: './cost-center-repo.component.scss'
})
export class CostCenterRepoComponent {

  buttonOptions: any = [
    { label: 'Cost Centers', value: 'Cost Centers', icon: 'fas fa-piggy-bank', redirectUrl: '/finances/cost-centers' },
    { label: 'Cost Center Repository', value: 'Cost Center Repository', icon: 'fas fa-calendar-plus', redirectUrl: '/finances/cost-center-repository' },
    { label: 'Cost Center Structure', value: 'Cost Center Structure', icon: 'fas fa-calendar-plus', redirectUrl: '/finances/cost-center-structure' },
  ];

  selectedButton: any = 'Cost Center Repository';
  loaderParent: boolean = false;
  isDisabledExport: boolean = false;
  selectedTem: string = 'all';
  tems: any = [];
  currentOpenEditPagevar: any = 'Table';
  tableDataExist: boolean = false;
  viewNEdit: boolean = false;
  selectedCCRTab = 0;

  @ViewChild(CostCenterRepositoryComponent) private ccr: CostCenterRepositoryComponent;
  @ViewChild(CostCenterUploadMonitorComponent) private CostCenterUploadMonitorComponent: CostCenterUploadMonitorComponent;

  isTEMUser: boolean = false;
  isCompanyUser: boolean = false;

  constructor(public locationService: LocationService, private router: Router, public dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.isTEMUser = this.locationService.isUserHasTEMUserRole();
    this.isCompanyUser = this.locationService.isUserCompanyUser()


    this.getTemLists();
  }
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
  trackByIndex(index: number, item: any): number {
    return index;
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
  isReloadCCRepo: boolean = false;

  selectedTemCCR: string = 'all';
  selectedTemDDCCr: string = 'all';

  filterCCR() {
    if (this.selectedTemCCR && (this.selectedTemDDCCr !== this.selectedTemCCR)) {
      this.ccr.loadNodes();
    }
  }

  showDD: boolean = true;
  changeCCRTab($event: any) {
    if ($event) {
      this.selectedCCRTab = $event;
      if(this.selectedCCRTab == 0) {
        this.showDD = true;
      } else {
        this.showDD = false;
      }

    }
  }

  UploadFile() {
    const dialogRef = this.dialog.open(UploadFileCcrComponent, {
      width: '650px',
      data: {
        colseButton: true,
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.CostCenterUploadMonitorComponent.loadNodes(true);
      }
    });
  }
  saveGridTableData: any;

  gridTable($event: any) {
    this.saveGridTableData = $event;
  }

  selectedCCrValue(value: any) {
    this.selectedTemDDCCr = value;
  }
  isCCRepoExist: boolean = false;
  CCRepoExist(data: any ) {
    this.isCCRepoExist = data;
  }
  gridApiAccount: any;
  gridColumnApiAccount: any;

  onAgGridReadyCostCenterRepoEmit($event: any) {
    this.gridApiAccount = $event.api;
    this.gridColumnApiAccount = $event.columnApi;
  }
  public exportCCRepodata: any;
  exportCCRepoDetail(data: any) {
    this.exportCCRepodata = data;
  }
  CCRepoIds: any = [];

  onCCRepoSelectedRow($event: any) {
    this.CCRepoIds = $event;
  }   
}
