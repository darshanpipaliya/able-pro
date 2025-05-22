import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { SharedModule } from '../demo/shared/shared.module';
import { PrimgModule } from '../demo/shared/primeng.module';
import { Router } from '@angular/router';
import { rolePermission } from '../services/helper';
import { LocationService } from '../services/location.service';
import { PTreeLocationComponent } from './p-tree-location/p-tree-location.component';
import { AddEditLocationNewComponent } from './add-edit-location-new/add-edit-location-new.component';
import { Subject, takeUntil } from 'rxjs';
import _ from 'lodash';
import { AddNotesLocationComponent } from './add-notes-location/add-notes-location.component';
import { LocationContactDataTableComponent } from './location-contact-data-table/location-contact-data-table.component';
import { HeaderSectionComponent } from '../common/header-section/header-section.component';
import { LocationInventoryDataTableComponent } from '../common/location-inventory-data-table/location-inventory-data-table.component';
import { api_list } from '../services/api-list';
import { AddBillingLComponent } from './add-billing-l/add-billing-l.component';
import { ChangeLogComponent } from '../common/change-log/change-log.component';
import { CommonCcsLocationComponent } from './common-ccs-location/common-ccs-location.component';
@Component({
  selector: 'app-location',

  templateUrl: './location.component.html',
  styleUrl: './location.component.scss',
  imports: [
    SharedModule,
    PrimgModule,
    PTreeLocationComponent,
    AddEditLocationNewComponent,
    LocationContactDataTableComponent,
    HeaderSectionComponent,
    LocationInventoryDataTableComponent,
    AddNotesLocationComponent,
    AddBillingLComponent,
    ChangeLogComponent,
    CommonCcsLocationComponent
  ],
  encapsulation: ViewEncapsulation.None,
})
export class LocationComponent {

  temRoles = false;
  disableTemSearchDD: any;
  disableTemSearch: any;
  currentOpenEditPagevar = 'Table';
  currentIndex: any = 0;
  selectedSubTab: any = 0;
  isOpenWirelineTab: boolean = false;
  isOpenCCSTab: boolean = false;
  selectedTem: string = 'all';
  TemDDArray: any = [];
  clickOnSearchButton = false;
  isDisabledExport = false;
  exportData: any;
  addLocationArray: any = [];
  editContactArray: any = [];
  addContactArray: any = [];
  addInventoryArray: any = [];
  uploadPageArray: any = [];
  listOfLocations: any = [];
  viewNEdit: boolean = false;
  CompanyRoles: boolean = false;
  tableDataExist: any;
  hasSsuperTemUsers: boolean = false;
  buttonOptions: any = [
    { label: 'Locations', value: 'location', icon: 'fas fa-map-marker-alt' },
    { label: 'Map', value: 'map', icon: 'fas fa-map-marked-alt' },
  ];

  selectedButton: any = 'location';
  tems: any = [];
  @ViewChild(PTreeLocationComponent) PTreeLocationComponent!: PTreeLocationComponent;
  @ViewChild(AddNotesLocationComponent) addNotesLocationComponent!: AddNotesLocationComponent;
  private readonly getTEMAPIDestroy = new Subject<void>();
  private readonly _unsubscribeGetLocationTerm = new Subject<void>();
  customers: any = [];
  locationTerm: any = [];
  companies: any = [];
  columns: { field: string; header: string; }[];
  showHeaderButton: boolean = false;
  showHeaderButtonInventory: boolean = false;
  inventoryData: any;
  payload: any;
  contactDatas: any = [];
  updatedLocationData: any;
  disabled = true;
  stopSpinnerInv = true;
  disableEditInv = true;
  disableInvExport = false;
  GridAPI: any = api_list.Location.Location.Grid;
  loaderParent: any = false;
  constructor(private router: Router, private locationService: LocationService) { }
  tabNames = ['Location', 'People', 'Inventory', 'Notes', 'Billing', 'ChangeLog'];
  currentTabName = this.tabNames[this.currentIndex];


  ngOnInit(): void {
    this.TemDDArray[this.currentIndex] = { id: 'all', type: this.currentOpenEditPagevar };
    this.viewNEdit = rolePermission(['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser', 'SuperTEM', 'TEMAdmin', 'TEMUser', 'TEMManager']);
    this.temRoles = rolePermission(['TEMAdmin', 'TEMUser', 'TEMManager']);
    this.CompanyRoles = rolePermission(['CompanyAdmin', 'CustomerAdmin']);
    this.hasSsuperTemUsers = rolePermission(['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser']);

    this.getLocationTerms();
    this.getTemLists();
    this.getCompanies();
    this.setChangeLogColumns();

  }

  stopSpinnerEmit(e: any) {
    this.stopSpinnerInv = e;
  }
  disableEditEmit(e: any) {
    this.disableEditInv = e;
  }
  disableInvExcel(e: any) {
    this.disableInvExport = e;
  }

  diabledEmit(data: any) {
    this.disabled = data;
  }
  onAddLocationComponetDestroy(data: any, i: any) {
    data.type = 'new';
    if (this.addLocationArray.length > 0 && i) {
      this.addLocationArray[i].AddlocationData = data;
    }
  }

  onLocationAddEvent(event: any, i: any) {
    this.PTreeLocationComponent.refreshbuttonEmitFn(true);

    this.removeLocation(i);
    this.listOfLocations.push(event);
    this.setSelectedTab('editLocation');
  }

  removeWirelineTab() {
    this.selectedSubTab = 2;
    this.isOpenWirelineTab = false;

  }
  onLocationUpdateEvent(data: any, i: any) {
    this.listOfLocations[i]['LocationName'] = data.name ? data.name : this.listOfLocations[i].LocationName;
    this.listOfLocations[i] = _.cloneDeep(this.listOfLocations[i]);
    this.updatedLocationData = this.listOfLocations[i];
    this.PTreeLocationComponent.refreshbuttonEmitFn(true);
  }

  removeTab(index: number) {
    this.isOpenWirelineTab = false;
    const aa = this.TemDDArray;
    const find = aa.findIndex((a: any) => a.type === 'Add');
    const a = aa.splice(find);
    aa.splice(index, 1);
    this.TemDDArray = [...this.TemDDArray, ...a];

    this.listOfLocations.splice(index, 1);
    this.contactDatas.splice(index, 1);
    this.listOfLocations = _.cloneDeep(this.listOfLocations);

    this.TemDDArray.splice(index, 1);
    this.TemDDArray = _.cloneDeep(this.TemDDArray);

    if (this.listOfLocations.length == 0) {
      this.currentIndex = 0;
    }

  }

  contactDataEmit(data: any, i: any) {
    this.contactDatas[i] = data;
  }
  getIdsArray($event: any) {
    if ($event) {
      this.payload = $event;
    }
  }

  redirectTab(value: any) {
    this.inventoryData = value.rowData;
    this.selectedSubTab = value.redirectIndex;
    this.isOpenWirelineTab = this.selectedSubTab == 2 ? false : true;
  }

  ngOnDestroy(): any {
    this.getTEMAPIDestroy.next();
    this.getTEMAPIDestroy.complete();
    this._unsubscribeGetLocationTerm.next();
    this._unsubscribeGetLocationTerm.complete();
  }


  removeCCSTab() {
    this.selectedSubTab = 4;
    this.isOpenCCSTab = false
  }
  redirectTabCCS() {
    this.isOpenCCSTab = true;
    this.selectedSubTab = this.isOpenWirelineTab ? 7 : 6;
  }

  peopleEmit($event: any) {
    this.showHeaderButton = $event;
  }
  InventoryEmit($event: any) {
    this.showHeaderButtonInventory = $event;
  }

  setLocationNotes(type: any) {
    if (type == 'add') {
      this.addNotesLocationComponent.addNotes();
    } else if (type == 'inactive') {
      this.addNotesLocationComponent.setChangeLocationNotesStatus('inactive');
    } else if (type == 'active') {
      this.addNotesLocationComponent.setChangeLocationNotesStatus('active');
    }
  }

  setClickFalse(event: any) {
    this.clickOnSearchButton = event;
  }
  setChangeLogColumns() {
    this.columns = [
      { field: 'TabModuleDisplayName', header: 'Tab' },
      { field: 'TabSectionModuleDisplayName', header: 'Section' },
      { field: 'DisplayColumnName', header: 'Field Name' },
      { field: 'OldValue', header: 'Previous Value' },
      { field: 'NewValue', header: 'New Value' },
      { field: 'ModificationDate', header: 'Time & Date' },
      { field: 'ModifiedBy', header: 'Who' }
    ];
  }
  getCompanies() {
    this.locationService.getCompanies().subscribe((data: any) => {
      if (data) {
        this.companies = _.uniqBy(data, 'Id');
      }
    });
  }

  getLocationTerms() {
    this._unsubscribeGetLocationTerm.next();
    this.locationService.getLocationTerm().pipe(takeUntil(this._unsubscribeGetLocationTerm)).subscribe((data: any) => {
      if (data) {
        this.locationTerm = data.Data.$values;
      }
    });
  }

  getTemLists() {
    this.getTEMAPIDestroy.next();
    this.locationService.getTemLists().pipe(takeUntil(this.getTEMAPIDestroy)).subscribe((data) => {
      if (data && data.$values) {
        this.tems = data.$values;

        const newObj = { AccountName: 'All', Id: 'all' };
        if (this.hasSsuperTemUsers) {
          let id = sessionStorage.getItem("LoggedAccountId");
          const found = this.tems.find((element: any) => Number(element.Id) === Number(id));
          this.tems.unshift(found);
          this.tems = this.tems.filter(
            (object: any, index: any, self: any) => object && self.indexOf(object) === index
          );
          this.tems.unshift(newObj);
        }

      }
    }, error => {
      this.tems = [];
    });
  }
  trackByIndex(index: number, item: any): number {
    return index;
  }


  onButtonClick(value: string): void {
    this.selectedButton = value;
    this.currentIndex = 0;
    setTimeout(() => this.goToPage(value), 0);
  }

  goToPage(to: any) {
    if (to === 'map') {
      this.router.navigate(['/locations/map']);
    }
  }

  currentOpenEditPage($event: any) {
    this.currentOpenEditPagevar = ($event) ? 'Edit' : 'Add';
    if (this.currentOpenEditPagevar === 'Edit') {
      this.disableTemSearchDD = true;
      this.disableTemSearch = true;
    } else {
      this.disableTemSearch = false;
      this.disableTemSearchDD = false;
    }
  }

  changeTabSub(event: any) {
    this.currentTabName = this.tabNames[event];
  }
  changeTab(event: any) {
    this.currentIndex = event;
    this.selectedSubTab = 0;
    this.currentTabName = this.tabNames[event];
    this.isOpenWirelineTab = false;
    this.isOpenCCSTab = false;
    if (this.currentIndex === 0) {
      if (this.TemDDArray[this.currentIndex]?.id !== 'all') {
        this.selectedTem = 'all';
      }
      this.disableTemSearch = false;
      this.disableTemSearchDD = false;
    } else {
      this.selectedTem = this.TemDDArray[this.currentIndex]?.id;
    }
    this.currentOpenEditPagevar = (event === 0) ? 'Table' : this.currentOpenEditPagevar;
  }


  filterGridByTEMId(e: any) {
    this.TemDDArray[this.currentIndex] = { id: Number(e), type: this.currentOpenEditPagevar };
    if (this.currentOpenEditPagevar === 'Table') {
      if (e !== 'all') {
        this.PTreeLocationComponent['payload']['TemAccountId'] = e;
      } else {
        this.PTreeLocationComponent['payload'] = {};
      }
      this.PTreeLocationComponent.refreshbuttonEmitFn(true);
    }
  }

  onBtnExportDataAsExcel() {

    this.PTreeLocationComponent.setColumnDefs();
    this.isDisabledExport = true;
    this.locationService
      .callPTreeTabAPIExport(this.GridAPI,this.exportData,'POST')

      .subscribe({
        next: (data: any) => {
          this.isDisabledExport = false;
          let bolbUrl = URL.createObjectURL(data);
          var link = document.createElement("a");
          link.setAttribute("href", bolbUrl);
          link.setAttribute("download", "Locations.xlsx");
          link.style.display = "none";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        },
        error: (error:any) => {
          this.isDisabledExport = false;
        }
      });
  }

  removeLocation(index: number) {
    const aa = this.TemDDArray;
    const find = aa.findIndex((a: any) => a.type === 'Add');
    const a = aa.splice(find);
    a.splice(index, 1);
    this.TemDDArray = [...this.TemDDArray, ...a];

    this.addLocationArray.splice(index, 1);
    this.addLocationArray = _.cloneDeep(this.addLocationArray);

    this.TemDDArray.splice(index, 1);
    this.TemDDArray = _.cloneDeep(this.TemDDArray);
    if (this.addLocationArray.length == 0) {
      this.currentIndex = 0;
    }
  }

  add() {
    
    this.addLocationArray.push({ name: 'New', AddlocationData: '' });
    this.setSelectedTab('addLocation');
  }

  setSelectedTab(from: any) {

    setTimeout(() => {
      if (from === 'editLocation') {
        this.currentIndex = this.listOfLocations.length;
        this.currentOpenEditPagevar = 'Edit';
      } else if (from === 'addLocation') {
        this.currentOpenEditPagevar = 'Add';
        this.currentIndex = this.listOfLocations.length + this.addLocationArray.length;
      } else if (from === 'editContact') {
        this.currentIndex =
          this.listOfLocations.length +
          this.addLocationArray.length +
          this.editContactArray.length;
      } else if (from === 'addContact') {
        this.currentIndex =
          this.listOfLocations.length +
          this.addLocationArray.length +
          this.editContactArray.length +
          this.addContactArray.length;
      } else if (from === 'addInventory') {
        this.currentIndex =
          this.listOfLocations.length +
          this.addLocationArray.length +
          this.editContactArray.length +
          this.addContactArray.length +
          this.addInventoryArray.length;
      }
    }, 500);
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
    this.listOfLocations.push(e.data);
    this.setSelectedTab('editLocation');
  }

  setTemDDValueEvent(data: any) {

    if (!data && this.currentOpenEditPagevar === 'Add') {
      this.TemDDArray[this.currentIndex] = { id: 'all', type: this.currentOpenEditPagevar };
    } else if (this.currentIndex > 0 && data != '') {
      this.selectedTem = data;
      if (this.currentOpenEditPagevar !== 'Add') {
        this.TemDDArray[this.currentIndex] = { id: data, type: this.currentOpenEditPagevar };
      }
    } else if (data == '' && this.currentIndex <= 0) {
      this.TemDDArray[this.currentIndex] = { id: '', type: this.currentOpenEditPagevar };
    }
    this.selectedTem = this.TemDDArray[this.currentIndex]?.id;
  }

  onTemChange(event: any) {
    this.TemDDArray[this.currentIndex] = { id: Number(event), type: this.currentOpenEditPagevar };
  }
  
  loaderEmitParentFn(event: any) {
    this.loaderParent = event;
  }
}
