import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog'; import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import * as _ from 'lodash';
import { LocationService } from 'src/app/services/location.service';
import { isValueExist, rolePermission } from 'src/app/services/helper';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PTreeCustomerComponent } from '../p-tree-customer/p-tree-customer.component';
import { EditCustomerComponent } from '../edit-customer/edit-customer.component';
import { AddCustomerComponent } from '../add-customer/add-customer.component';
import { HeaderSectionComponent } from "../../common/header-section/header-section.component";
import { api_list } from 'src/app/services/api-list';
@Component({
  selector: 'app-customer-datatable',
  templateUrl: './customer-datatable.component.html',
  styleUrls: ['./customer-datatable.component.scss'],
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    SharedModule,
    PTreeCustomerComponent,
    AddCustomerComponent,
    EditCustomerComponent,
    HeaderSectionComponent,
]
})
export class CustomerDatatableComponent implements OnInit {
  selectedButton: any = 'customer';
  buttonOptions: any = [
    { 'label': "Customer", value: 'customer', icon: 'fas fa-hotel' },
    { 'label': 'Company', value: 'company', icon: 'fas fa-building' },
  ];
  
  selected: any = 0;
  customerTabArray: any = [];
  isTemUser: any = false;
  isCompanyUser: boolean = false;
  isVendorUser: boolean = false;
  public exportData: any;
  public exportCustomerDetail: any;

  selectedTemDD: string = 'all';
  stopSpinner = true;
  selectedTem: string = 'all';
  tems: any = [];
  isSuperTEMUsers: boolean = false;
  private _unsubscribeGRid: Subject<any> = new Subject<any>();
  private _unsubscribeTemLists: Subject<any> = new Subject<any>();

  currentOpenEditPagevar = 'Table';
  viewNEdit = false;
  disableTemSearch: any;
  disableTemSearchDD: any;
  hasSsuperTemUsers: boolean = false;

  isDisabledExport = false;
  clickOnSearchButton = false;
  temRoles = false;
  selectedWiseTemDD:any = [];
  currentIndex: any = 0;

  @ViewChild(PTreeCustomerComponent) PTreeCustomerComponent!: PTreeCustomerComponent;
  tableDataExist: any;
  GridAPI: any = api_list.Organisation.Cusotmer.Grid;
  loaderParent: any = false;
  constructor(private router: Router,
    public dialog: MatDialog,
    public locationService: LocationService) {
    this.customerTabArray.push({ name: 'Table', accountData: '', tabType: 'Table' });
    this.selectedWiseTemDD[0] = { id: 'all' };
  }

  ngOnInit(): void {

    this.temRoles = rolePermission(['TEMAdmin', 'TEMUser', 'TEMManager']);
    this.viewNEdit = rolePermission(['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser', 'SuperTEM', 'TEMAdmin', 'TEMUser', 'TEMManager']);
    this.getTemLists();
    this.hasSsuperTemUsers = rolePermission(['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser']);

  }

  currentOpenEditPage($event: any) {
    this.currentOpenEditPagevar = ($event) ? 'Edit' : 'Add';
    if (this.currentOpenEditPagevar === 'Edit') {
      this.disableTemSearchDD = true;
      this.disableTemSearch = true;
    } else {
      this.disableTemSearchDD = false;
      this.disableTemSearch = false;
    }
  }

  customerTemValue($event: any) {
    this.selectedTem = $event;
    this.selectedWiseTemDD[this.currentIndex] = { id: $event && $event !== 'all' ? Number($event) : $event };
  }

  onTemChange() {
    this.selectedWiseTemDD[this.currentIndex] = { id: Number(this.selectedTem) };
  }
  changeTab(event: any) {
    this.selected = this.currentIndex = event;
    if (this.selected === 0) {
      this.currentOpenEditPagevar = 'Table';
      this.disableTemSearchDD = false;
      this.disableTemSearch = false;
    } else {
      this.currentOpenEditPagevar = this.currentOpenEditPagevar;
    }
    this.selectedTem = this.selectedWiseTemDD[this.currentIndex].id;
  }

  setTemDDValueEvent(data: any, i: any) {
    this.selected = this.currentIndex;
    if (this.currentIndex > 0 && data != '') {
      this.selectedTem = data;
      if (this.currentOpenEditPagevar !== 'Add') {
        this.selectedWiseTemDD[this.currentIndex] = { id: data && data !== 'All' ? Number(data) : data };
      }
    } else if (data == '' && this.currentIndex <= 0) {
      this.selectedTem = 'all';
      this.selectedWiseTemDD[this.currentIndex] = { id: '' };
    }

    if (this.currentOpenEditPagevar === 'Add') {
      if (this.currentIndex === this.selected) {
        this.selectedTem = this.selectedWiseTemDD[this.selected].id;
      }
    }
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
    this.customerTabArray.push({ name: 'Add', accountData: '', tabType: 'Add' });
    this.setSelectedTab('addCustomer');
  }

  onCellDoubleClicked($event: any) {
    this.customerTabArray.push({ name: 'Edit', accountData: $event.data, tabType: 'Edit' });
    this.setSelectedTab('editCustomer');
  }

  setSelectedTab(from: any) {
    this.selected = this.customerTabArray.length-1;
    if (from === 'editCustomer') {
      this.currentOpenEditPagevar = 'Edit';
    } else if (from === 'addCustomer') {
      this.currentOpenEditPagevar = 'Add';
    }
    this.currentIndex = this.selected;
    this.selectedWiseTemDD[this.selected] = { id: this.selectedTem };
    
  }

  onCustomerAddEvent(event: any, index: any) {
    if (event) {
      this.customerTabArray.splice(index, 1);
      this.customerTabArray = _.cloneDeep(this.customerTabArray);
      this.PTreeCustomerComponent.refreshbuttonEmitFn(true);
    }
  }

  onCustomerEditEvent(event: any, index: any) {
    if (event) {
      this.customerTabArray.splice(index, 1);
      this.customerTabArray = _.cloneDeep(this.customerTabArray);
      this.PTreeCustomerComponent.refreshbuttonEmitFn(true);
    }
  }

  removeTab(index: any) {
    this.selectedWiseTemDD.splice(index, 1);
    this.selectedWiseTemDD = _.cloneDeep(this.selectedWiseTemDD);
    this.customerTabArray.splice(index, 1);
    this.customerTabArray = _.cloneDeep(this.customerTabArray);
  }

  goToPage(to: any) {
    if (to === 'company') {
      this.router.navigate(['/organization/company']);
    }
  }

  onCustomerComponetDestroy(data: any, i: any) {
    if (this.customerTabArray[i]) {
      this.customerTabArray[i].accountData = data;
    }
  }

  filterGridByTEMId(selectedTem: any) {
    this.selectedWiseTemDD[this.selected] = { id: Number(selectedTem) };
    if (this.currentOpenEditPagevar === 'Table') {
        if (selectedTem !== 'all') {
          this.PTreeCustomerComponent['payload']['TemAccountId'] = selectedTem;
        } else {
          this.PTreeCustomerComponent['payload'] = {};
        }
        this.PTreeCustomerComponent.refreshbuttonEmitFn(true);
    }
  }

  setClickFalse(event: any) {
    this.clickOnSearchButton = event;
  }


  onBtnExportDataAsExcel() {
    this.PTreeCustomerComponent.setColumnDefs();
    this.isDisabledExport = true;
    this.locationService
      .callPTreeTabAPIExport(this.GridAPI,this.exportData,'POST')
      .subscribe({
        next: (data: any) => {
          this.isDisabledExport = false;
          let bolbUrl = URL.createObjectURL(data);
          var link = document.createElement("a");
          link.setAttribute("href", bolbUrl);
          link.setAttribute("download", "Customers.xlsx");
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
    this._unsubscribeTemLists.next(null);
    this._unsubscribeTemLists.complete();
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
    this.customerTabArray.push({ name: 'Edit', accountData: e.data, tabType: 'Edit' });
    this.setSelectedTab('editCustomer');
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }

  onButtonClick(value: string): void {
    this.selectedButton = value;
    this.selected = 0;
    setTimeout(() => this.goToPage(value), 0);  // Avoid layout thrash
  }

  loaderEmitParentFn(event: any) {
    this.loaderParent = event;
  }
}

