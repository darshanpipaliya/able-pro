import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import moment from 'moment';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as _ from 'lodash';
import { LocationService } from 'src/app/services/location.service';
import { isValueExist, rolePermission } from 'src/app/services/helper';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { PTreeCompanyComponent } from '../p-tree-company/p-tree-company.component';
import { AddCompanyComponent } from '../add-company/add-company.component';
import { EditCompanyComponent } from '../edit-company/edit-company.component';
import { HeaderSectionComponent } from 'src/app/common/header-section/header-section.component';
import { api_list } from 'src/app/services/api-list';

@Component({
  selector: 'app-company-datatable',
  templateUrl: './company-datatable.component.html',
  styleUrls: ['./company-datatable.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SharedModule,
    PrimgModule,
    PTreeCompanyComponent,
    AddCompanyComponent,
    EditCompanyComponent,
    HeaderSectionComponent
  ]
})
export class CompanyDatatableComponent implements OnInit {
  selectedButton: any = 'company';
  buttonOptions: any = [
    { 'label': "Customer", value: 'customer', icon: 'fas fa-hotel' },
    { 'label': 'Company', value: 'company', icon: 'fas fa-building' }
  ];

  public rowData: any = [];
  selected: any = 0;
  editCompanyArray: any = [];
  addCompanyArray: any = [];
  isTemUser: any = false;
  isShowButton: boolean = true;
  selectedTemDD: string = 'all';
  clickOnSearchButton = false;

  selectedTem: string = 'all';
  viewNEdit: boolean = false;
  hasSsuperTemUsers: boolean = false;
  public exportData: any;
  isDisabledExport = false;
  temRoles = false;
  selectedTemTabWise: any = [];
  public exportCompanyDetail: any;
  tems: any = [];
  private _unsubscribeGRid: Subject<any> = new Subject<any>();
  private _unsubscribeTemLists: Subject<any> = new Subject<any>();
  columnApi: any;
  gridColumnApi: any;
  currentOpenEditPagevar = 'Table';
  disableTemSearch: any;
  currentIndex: any = 0;
  selectedWiseTemDD: any = [];

  tableDataExist: any;
  public exportCustomerData: any;
  loaderParent: any = false;


  GridAPI = api_list.Organisation.Company.Grid;
  @ViewChild(PTreeCompanyComponent) PTreeCompanyComponent!: PTreeCompanyComponent;
  constructor(private router: Router,
    public dialog: MatDialog,
    private locationService: LocationService,
    private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.temRoles = rolePermission(['TEMAdmin', 'TEMUser', 'TEMManager']);
    this.viewNEdit = rolePermission(['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser', 'SuperTEM', 'TEMAdmin', 'TEMUser', 'TEMManager']);
    this.hasSsuperTemUsers = rolePermission(['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser']);

    this.getTemLists();
  }

  currentOpenEditPage($event: any) {
    this.currentOpenEditPagevar = ($event) ? 'Edit' : 'Add';
    if (this.currentOpenEditPagevar === 'Edit') {
      this.disableTemSearch = true;
    } else {
      this.disableTemSearch = false;
    }
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  changeTab(event: any) {
    this.selected = event;
    this.currentIndex = event;
    if (this.selected === 0) {
      if (this.selectedTem !== 'all') {
        this.selectedTem = 'all';
        this.selectedWiseTemDD[this.currentIndex] = { id: this.selectedTem, type: this.currentOpenEditPagevar };
      }
      this.currentOpenEditPagevar = 'Table';
      this.disableTemSearch = false;
    } else {
      this.currentOpenEditPagevar = this.currentOpenEditPagevar;
    }
    this.selectedTem = this.selectedWiseTemDD[this.currentIndex].id;
  }

  getTemLists() {
    this._unsubscribeTemLists.next(null);
    this.locationService.getTemLists().pipe(takeUntil(this._unsubscribeTemLists)).subscribe((data) => {
      if (data && data.$values) {
        this.tems = data.$values;
        const newObj = { AccountName: 'All', Id: 'all' };
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
    }, error => {
      this.tems = [];
    });
  }

  add() {
    this.addCompanyArray.push({ name: 'New', companyData: '', tabType: 'New' });
    this.setSelectedTab('addCompany');
  }

  onCellEditingStoppedEventForCL($event: any) {
  }

  onCellClicked($event: any) {

  }

  onCompanyUpdateEvent(event: any, index: any) {
    if (event) {
      this.editCompanyArray.splice(index, 1);
      this.editCompanyArray = _.cloneDeep(this.editCompanyArray);
      this.PTreeCompanyComponent.refreshbuttonEmitFn(true);
    }
  }

  setTemDDValueEvent(data: any, i: any) {
    this.selected = this.currentIndex;

    if (this.currentIndex > 0 && data != '') {
      this.selectedTem = data;
      if (this.currentOpenEditPagevar !== 'Add') {
        this.selectedWiseTemDD[this.currentIndex] = { id: data, type: this.currentOpenEditPagevar };
      }
    } else if (data == '' && this.currentIndex <= 0) {
      this.selectedTem = 'all';
      this.selectedWiseTemDD[this.currentIndex] = { id: '', type: this.currentOpenEditPagevar };
    }

    if (this.currentOpenEditPagevar === 'Add') {
      if (this.currentIndex === this.selected && this.selectedWiseTemDD[this.selected].id) {
        this.selectedTem = this.selectedWiseTemDD[this.selected].id;
      }
    }

  }

  onCompanyAddEvent(event: any, index: any) {
    if (event) {
      this.addCompanyArray.splice(index, 1);
      this.addCompanyArray = _.cloneDeep(this.addCompanyArray);
      this.PTreeCompanyComponent.refreshbuttonEmitFn(true);
    }
  }

  onCellDoubleClicked($event: any) {
    this.editCompanyArray.push($event.data);
    this.setSelectedTab('editCompany');
  }

  removeTab(index: any) {

    const aa = this.selectedWiseTemDD;
    const find = aa.findIndex((a: any) => a.type === 'Add');
    const a = aa.splice(find);
    aa.splice(index, 1);
    this.selectedWiseTemDD = [...this.selectedWiseTemDD, ...a];

    this.editCompanyArray.splice(index, 1);
    this.editCompanyArray = _.cloneDeep(this.editCompanyArray);
  }

  removeCompany(index: any) {
    if (this.selectedWiseTemDD[0] === undefined) {
      this.selectedWiseTemDD[0] = { id: '', type: this.currentOpenEditPagevar };
    }
    const aa = this.selectedWiseTemDD;
    const find = aa.findIndex((a: any) => a.type === 'Add');
    const a = aa.splice(find);
    a.splice(index, 1);
    this.selectedWiseTemDD = [...this.selectedWiseTemDD, ...a];

    this.addCompanyArray.splice(index, 1);
    this.addCompanyArray = _.cloneDeep(this.addCompanyArray);
  }

  onAddCompanyComponetDestroy(data: any, i: any) {
    if (this.addCompanyArray.length) {
      this.addCompanyArray[i].companyData = data;
    }
  }

  setSelectedTab(from: any) {
    if (from === 'editCompany') {
      this.selected = this.editCompanyArray.length;
      this.currentOpenEditPagevar = 'Edit';
      this.selectedWiseTemDD.unshift({ id: '', type: this.currentOpenEditPagevar });
    } else if (from === 'addCompany') {
      this.selected = this.editCompanyArray.length + this.addCompanyArray.length;
      this.currentOpenEditPagevar = 'Add';
      this.selectedWiseTemDD[this.selected] = { id: this.selectedTem, type: this.currentOpenEditPagevar };
    }
    this.currentIndex = this.selected;
  }

  goToPage(to: any) {
    if (to === 'customer') {
      this.router.navigate(['/organization/customer']);
    }
  }

  filterGridByTEMId(selectedTem: any) {
    this.selectedWiseTemDD[this.selected] = { id: Number(selectedTem), type: this.currentOpenEditPagevar };
    if (this.currentOpenEditPagevar === 'Table') {
      if (selectedTem !== 'all') {
        this.PTreeCompanyComponent['payload']['TemAccountId'] = selectedTem;
      } else {
        this.PTreeCompanyComponent['payload'] = {};
      }
      this.PTreeCompanyComponent.refreshbuttonEmitFn(true);
    }

  }

  setClickFalse(event: any) {
    this.clickOnSearchButton = event;
  }


  onBtnExportDataAsExcel() {
    this.PTreeCompanyComponent.setColumnDefs();
    this.isDisabledExport = true;
    this.locationService
      .callPTreeTabAPIExport(this.GridAPI,this.exportData,'POST')
      .subscribe({
        next: (data: any) => {
          this.isDisabledExport = false;
          let bolbUrl = URL.createObjectURL(data);
          var link = document.createElement("a");
          link.setAttribute("href", bolbUrl);
          link.setAttribute("download", "Companies.xlsx");
          link.style.display = "none";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        },
        error: (error: any) => {
          this.isDisabledExport = false;
        }
      });
  }

  ngOnDestroy() {
    this._unsubscribeGRid.next(null);
    this._unsubscribeGRid.complete();
  }

  tableDataExistFn(e?: any) {
    this.tableDataExist = e;
  }
  exportAccountData(e?: any) {
    this.exportData = e;
  }
  selectedRowsEmit(e?: any) {

  }
  rowCellDoubleClicked(e?: any) {
    this.editCompanyArray.push(e.data);
    this.setSelectedTab('editCompany');
  }

  onButtonClick(value: string): void {
    this.selectedButton = value;
    this.selected = 0;
    setTimeout(() => this.goToPage(value), 0);  // Avoid layout thrash
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }

  onTemChange() {
    this.selectedWiseTemDD[this.currentIndex] = { id: Number(this.selectedTem) };
  }
  loaderEmitParentFn(event: any) {
    this.loaderParent = event;
  }
}

