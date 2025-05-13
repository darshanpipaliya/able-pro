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
    LocationInventoryDataTableComponent
  ],
  encapsulation: ViewEncapsulation.None,
})
export class LocationComponent {

  selected: any = 0;
  temRoles = false;
  disableTemSearchDD: any;
  disableTemSearch: any;
  currentOpenEditPagevar = 'Table';
  currentIndex: any = 0;
  selectedSubTab: any = 0;
  isOpenWirelineTab: boolean = false;
  isOpenCCSTab: boolean = false;
  selectedTem: string = 'all';
  selectedWiseTemDD: any = [];
  clickOnSearchButton = false;
  selectedTemDD: string = 'all';
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
  private readonly _unsubscribeCustomer = new Subject<void>();
  private readonly _unsubscribeGetLocationTerm = new Subject<void>();
  customers: any = [];
  locationTerm: any = [];
  companies: any = [];
  columns: { field: string; header: string; }[];
  isLocationNotes: boolean = false;
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
  constructor(private router: Router, private locationService: LocationService) { }

  ngOnInit(): void {
    this.viewNEdit = rolePermission(['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser', 'SuperTEM', 'TEMAdmin', 'TEMUser', 'TEMManager']);
    this.temRoles = rolePermission(['TEMAdmin', 'TEMUser', 'TEMManager']);
    this.CompanyRoles = rolePermission(['CompanyAdmin', 'CustomerAdmin']);
    this.hasSsuperTemUsers = rolePermission(['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser']);

    this.getCustomerForUser();
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
    this.PTreeLocationComponent.loadNodes(true);

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
    this.PTreeLocationComponent.loadNodes(true);
  }

  removeTab(index: number) {
    console.log('index ', index);
    this.isOpenWirelineTab = false;
    const aa = this.selectedWiseTemDD;
    const find = aa.findIndex((a: any) => a.type === 'Add');
    const a = aa.splice(find);
    aa.splice(index, 1);
    this.selectedWiseTemDD = [...this.selectedWiseTemDD, ...a];

    this.listOfLocations.splice(index, 1);
    this.contactDatas.splice(index, 1);
    this.listOfLocations = _.cloneDeep(this.listOfLocations);

    this.selectedWiseTemDD.splice(index, 1);
    this.selectedWiseTemDD = _.cloneDeep(this.selectedWiseTemDD);

    if (this.listOfLocations.length == 0) {
      this.selected = 0;
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
    // setTimeout(() => {
    this.selectedSubTab = this.isOpenWirelineTab ? 7 : 6;
    // }, 400);
  }

  peopleEmit($event: any) {
    this.showHeaderButton = $event;
  }
  InventoryEmit($event: any) {
    this.showHeaderButtonInventory = $event;
  }

  onAddNotesEmit($event: any) {
    if ($event == true) {
      this.isLocationNotes = true;
    } else {
      this.isLocationNotes = false;
    }
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
  getCustomerForUser() {
    this.customers = []
    if (this.selectedTem == 'all') {
      this._unsubscribeCustomer.next();
      this.locationService.getCustomerDropDown().pipe(takeUntil(this._unsubscribeCustomer)).subscribe((data) => {
        if (data && data.$values) {
          this.customers = data.$values;
        } else {
          this.customers = [];
        }
      });
    } else {
      this._unsubscribeCustomer.next();
      this.locationService.getCustomerDropdownByNewTEM(this.selectedTem).pipe(takeUntil(this._unsubscribeCustomer)).subscribe((data) => {
        if (data && data.Data.$values) {
          this.customers = data.Data.$values;
        } else {
          this.customers = [];
        }
      });
    }
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
    this.selected = 0;
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

  changeTab(event: any) {
    this.currentIndex = event;
    this.selected = event;
    this.selectedSubTab = 0;
    this.isOpenWirelineTab = false;
    this.isOpenCCSTab = false;
    if (this.currentIndex === 0) {
      if (this.selectedTem !== 'all') {
        this.selectedTem = 'all';
        this.selectedWiseTemDD[this.currentIndex] = { id: this.selectedTem, type: this.currentOpenEditPagevar };
        console.log('selectedWiseTemDD 4', this.selectedWiseTemDD);
      }
      this.disableTemSearch = false;
      this.disableTemSearchDD = false;
    }
    this.currentOpenEditPagevar = (event === 0) ? 'Table' : this.currentOpenEditPagevar;
    console.log('selectedWiseTemDD ', this.selectedWiseTemDD);
  }


  filterGridByTEMId(selectedTem: any) {
    this.selectedWiseTemDD[this.selected] = { id: Number(selectedTem), type: this.currentOpenEditPagevar };
    if (this.currentOpenEditPagevar === 'Table') {
      this.PTreeLocationComponent.selectedTem = selectedTem;
      this.PTreeLocationComponent.loadNodes(true);
    }
  }

  onBtnExportDataAsExcel() {

    this.isDisabledExport = true;
    this.locationService
      .getCompanylocationsExportData(this.exportData)
      .subscribe({
        next: data => {
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
        error: error => {
          this.isDisabledExport = false;
        }
      });
  }

  removeLocation(index: number) {
    const aa = this.selectedWiseTemDD;
    const find = aa.findIndex((a: any) => a.type === 'Add');
    const a = aa.splice(find);
    a.splice(index, 1);
    this.selectedWiseTemDD = [...this.selectedWiseTemDD, ...a];

    this.addLocationArray.splice(index, 1);
    this.addLocationArray = _.cloneDeep(this.addLocationArray);

    this.selectedWiseTemDD.splice(index, 1);
    this.selectedWiseTemDD = _.cloneDeep(this.selectedWiseTemDD);
    if (this.addLocationArray.length == 0) {
      this.selected = 0;
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
        this.selected = this.listOfLocations.length;
        this.currentOpenEditPagevar = 'Edit';
        console.log('selectedWiseTemDD 6', this.selectedWiseTemDD);
      } else if (from === 'addLocation') {
        this.currentOpenEditPagevar = 'Add';
        this.selected = this.listOfLocations.length + this.addLocationArray.length;
        this.selectedWiseTemDD.unshift({ id: '', type: this.currentOpenEditPagevar });
        this.selectedWiseTemDD[this.selected] = { id: this.selectedTem, type: this.currentOpenEditPagevar };
      } else if (from === 'editContact') {
        this.selected =
          this.listOfLocations.length +
          this.addLocationArray.length +
          this.editContactArray.length;
      } else if (from === 'addContact') {
        this.selected =
          this.listOfLocations.length +
          this.addLocationArray.length +
          this.editContactArray.length +
          this.addContactArray.length;
      } else if (from === 'addInventory') {
        this.selected =
          this.listOfLocations.length +
          this.addLocationArray.length +
          this.editContactArray.length +
          this.addContactArray.length +
          this.addInventoryArray.length;
      }
      this.currentIndex = this.selected;
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

  setTemDDValueEvent(data: any, i: any) {
    this.selected = this.currentIndex;
    if (this.currentIndex > 0 && data != '') {
      this.selectedTem = data;
      if (this.currentOpenEditPagevar !== 'Add') {
        this.selectedWiseTemDD[this.currentIndex] = { id: data, type: this.currentOpenEditPagevar };
        console.log('selectedWiseTemDD 2', this.selectedWiseTemDD);
      }
    } else if (data == '' && this.currentIndex <= 0) {
      this.selectedWiseTemDD[this.currentIndex] = { id: '', type: this.currentOpenEditPagevar };
      console.log('selectedWiseTemDD 3', this.selectedWiseTemDD);

    }

    if (this.currentOpenEditPagevar === 'Add' && this.selectedWiseTemDD.length > 0) {
      if (this.currentIndex === this.selected) {
        this.selectedTem = this.selectedWiseTemDD[this.selected]?.id;
      }
    }
  }

  onTemChange() {
    this.selectedWiseTemDD[this.currentIndex] = { id: Number(this.selectedTem) };
  }
  
}
