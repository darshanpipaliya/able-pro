import { Component, ViewChild } from '@angular/core';
import { SharedModule } from '../demo/shared/shared.module';
import { PrimgModule } from '../demo/shared/primeng.module';
import { HeaderSectionComponent } from '../common/header-section/header-section.component';
import { rolePermission } from '../services/helper';
import { Subject, takeUntil } from 'rxjs';
import { LocationService } from 'src/app/services/location.service';
import { api_list } from '../services/api-list';
import { CommonPTreeTableComponent } from '../common/common-p-tree-table/common-p-tree-table.component';
import _ from 'lodash';
import { ErrorWarningPopupComponent } from '../common/error-warning-popup/error-warning-popup.component';
import { MatDialog } from '@angular/material/dialog';
import { LocalStorageService } from '../services/local-storage.service';
import { SessionStorageService } from '../services/session-storage.service';
import { AddNotesPeopleComponent } from './add-notes-people/add-notes-people.component';
import { NewPasswordDialogComponent } from './new-password-dialog/new-password-dialog.component';
import { AddPeopleComponent } from './add-people/add-people.component';
import { createColumn } from '../utils/column-utils';

interface ColumnDefinition {
  parent: number;
  isicon: number;
  width: string;
  valuesset: null;
  isenable: boolean;
  isChildren: boolean;
  type: string;
  header: string;
  columnGroupShow: string;
  field: string;
  childHeader: string;
  colspan: number;
  parentWidth: number;
  isParentVisible: boolean;
  displayCheckboxColumns: boolean;
  isToggle: boolean;
}

@Component({
  selector: 'app-people',
  imports: [
    SharedModule,
    PrimgModule,
    HeaderSectionComponent,
    CommonPTreeTableComponent,
    AddPeopleComponent,
    // AddNotesPeopleComponent,
    // NewPasswordDialogComponent
  ],
  templateUrl: './people.component.html',
  styleUrl: './people.component.scss'
})
export class PeopleComponent {

  selectedButton: any = 'user';
  buttonOptions: any = [
    { 'label': "People", value: 'user', icon: 'fas fa-user' }
  ];
  TemDDArray: any = [];
  currentIndex: any = 0;
  currentOpenEditPagevar = 'Table';
  temRoles = false;
  selectedTem: string = 'all';
  disableTemSearch: any;
  tems: any = [];
  hasSsuperTemUsers: boolean = false;
  GridAPI: any = api_list.People.People.Grid;
  private _unsubscribePeople: Subject<any> = new Subject<any>();
  private _unsubscribeTEM: Subject<any> = new Subject<any>();
  selectedSubTab: any = 0;
  isPeopleEditPage: boolean = false;
  isCustomerAdmin: any = false;
  isCompanyAdmin: any = false;
  isCompanyManager: any = false;
  isTemUser: any = false;
  isCompanyUser: any = false;
  isSuperTEMUsers: any = false;
  isResetpwdAccess: any = false;
  viewNEdit: boolean = false;
  isResetpwdDisable: boolean = false;
  isHaveCompanyUser: boolean = false;
  loaderParent: any = false;

  isDisabledExport: boolean = false;
  exportData: any;
  tableDataExist: any;
  cols: any[];
  @ViewChild(CommonPTreeTableComponent) CommonPTreeTableComponent!: CommonPTreeTableComponent;
  @ViewChild(AddNotesPeopleComponent) addNotesPeopleComponent: AddNotesPeopleComponent;

  addUserArray: any = [];
  editUserArray: any = [];
  selected: any = 0;
  peopleDataTable: any;
  selectedWiseTemDD: any = [];
  lockUserInput: any;
  uploadUserArray: any = [];
  isOpenCCSTab: boolean = false;
  isPeopleNotes: boolean = false;
  payload: any;
  customersEmitData: any = [];
  refreshbutton: boolean = false;

  tabNames = ['People', 'Notes', 'Billing', 'ChangeLog'];
  currentTabName = this.tabNames[this.currentIndex];
  totalRecords: number = 0;

  constructor(private locationService: LocationService, public dialog: MatDialog, private sessionStorageService: SessionStorageService, private localStorageService: LocalStorageService) { }

  ngOnInit(): void {
    this.TemDDArray[this.currentIndex] = { id: 'all', type: this.currentOpenEditPagevar };
    this.selectedSubTab == 0 ? this.isPeopleEditPage = true : this.isPeopleEditPage = false;
    this.temRoles = rolePermission(['TEMAdmin', 'TEMUser', 'TEMManager']);
    this.isCustomerAdmin = this.locationService.isUserCustomerAdmin();
    this.isCompanyAdmin = this.locationService.isUserCompanyAdmin();
    this.isCompanyManager = this.locationService.isUserCompanyManager();
    this.isTemUser = this.locationService.isUserHasTEMUserRole();
    this.isCompanyUser = this.locationService.isUserCompanyUser();
    this.isSuperTEMUsers = this.locationService.isUserHasSuperTEMUsersRole();
    this.isResetpwdAccess = rolePermission(['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser', 'CompanyAdmin', 'CustomerAdmin', 'CompanyManager', 'TEMAdmin', 'TEMManager'])
    this.viewNEdit = rolePermission(['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser', 'SuperTEM', 'CompanyAdmin', 'CustomerAdmin', 'CompanyManager', 'TEMAdmin', 'TEMUser', 'TEMManager']);
    this.isResetpwdDisable = rolePermission(['CustomerAdmin', 'CompanyManager', 'CompanyAdmin', 'TEMManager',]);
    this.hasSsuperTemUsers = rolePermission(['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser']);
    this.isHaveCompanyUser = rolePermission(['CompanyManager', 'CompanyUser', 'CompanyAdmin']);

    this.getTemLists();
    this.setCols();
  }

  setCols() {
     
    let currentParent = 0;
    const getParentId = (isChild: boolean) => isChild ? ++currentParent : currentParent;
  
    this.cols = [
      // Personal
      createColumn(getParentId(true), '150px', true, 'text', 'Personal', 'PeopleName', 'Name'),
      createColumn(currentParent, '150px', false, 'text', '', 'PeopleFirstName', 'First Name', 'open'),
      createColumn(currentParent, '150px', false, 'text', '', 'PeopleLastName', 'Last Name', 'open'),
      createColumn(currentParent, '150px', false, 'text', '', 'PeopleUserTitle', 'Title', 'open'),
      createColumn(currentParent, '150px', false, 'text', '', 'EmployeeId', 'Employee ID', 'open'),
      createColumn(currentParent, '150px', false, 'text', '', 'ManagerName', 'Manager', 'open'),
      createColumn(currentParent, '150px', false, 'text', '', 'ManagerEmail', 'Manager Email', 'open'),
      createColumn(currentParent, '150px', false, 'text', '', 'Department', 'Department', 'open'),
      createColumn(currentParent, '150px', false, 'text', '', 'PeopleCustomField1', 'People Custom 1', 'open'),
      createColumn(currentParent, '150px', false, 'text', '', 'PeopleCustomField2', 'People Custom 2', 'open'),
      createColumn(currentParent, '150px', false, 'text', '', 'PeopleCustomField3', 'People Custom 3', 'open'),
      createColumn(currentParent, '150px', false, 'text', '', 'PeopleCustomField4', 'People Custom 4', 'open'),
  
      // Contact
      createColumn(getParentId(true), '150px', true, 'text', 'Contact', 'PeopleEmail', 'Email'),
      createColumn(currentParent, '150px', false, 'text', '', 'DeskPhone', 'Desk Phone', 'open'),
      createColumn(currentParent, '150px', false, 'text', '', 'CellPhone', 'Mobile Phone', 'open'),
      createColumn(currentParent, '150px', false, 'text', '', 'CustomerContactType', 'Contact Type', 'open'),
      createColumn(currentParent, '150px', false, 'text', '', 'UserBlockEmail', 'Block Email', 'open'),
  
      // Status
      createColumn(getParentId(true), '150px', true, 'text', 'Status', 'PeopleStatusDisplayValue', 'Status'),
      createColumn(currentParent, '150px', false, 'text', '', 'CustomerDisplayRole', 'Roles', 'close'),
      createColumn(currentParent, '150px', false, 'text', '', 'SystemUser', 'System User', 'open'),
      createColumn(currentParent, '150px', false, 'text', '', 'UserAccountState', 'User Account', 'open'),
      createColumn(currentParent, '150px', false, 'text', '', 'UserEmailVerified', 'Email Verification', 'open'),
  
      // Organization
      createColumn(getParentId(true), '150px', true, 'text', 'Organization', 'CustomerAccountName', 'Customer'),
      createColumn(currentParent, '150px', false, 'text', '', 'CompanyName', 'Company', 'close'),
  
      // Location
      createColumn(getParentId(true), '150px', true, 'text', 'Location', 'PrimaryLocationDisplayValue', 'Location')
    ];
  }

  
  currentOpenEditPage($event: any) {
    this.currentOpenEditPagevar = ($event) ? 'Edit' : 'Add';
    if (this.currentOpenEditPagevar === 'Edit') {
      this.disableTemSearch = true;
    } else {
      this.disableTemSearch = false;
    }
  }

  ngOnDestroy() {
    this._unsubscribePeople.next(null);
    this._unsubscribePeople.complete();
    this._unsubscribeTEM.next(null);
    this._unsubscribeTEM.complete();
  }

  getTemLists() {
    this._unsubscribeTEM.next(null);
    this.locationService.getTemLists().pipe(takeUntil(this._unsubscribeTEM)).subscribe((data) => {
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
    });
  }

  loaderEmitFn(event: any) {
    this.loaderParent = event;
  }

  onBtnExportDataAsExcel() {

    this.CommonPTreeTableComponent.setColumnDefs();
    this.isDisabledExport = true;
    this.locationService
      .callPTreeTabAPIExport(this.GridAPI, this.exportData, 'POST')

      .subscribe({
        next: (data: any) => {
          this.isDisabledExport = false;
          let bolbUrl = URL.createObjectURL(data);
          var link = document.createElement("a");
          link.setAttribute("href", bolbUrl);
          link.setAttribute("download", "Peoples.xlsx");
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

  tableDataExistFn(e?: any) {
    this.tableDataExist = e;
  }
  exportAccountDataFn(event: any) {
    this.exportData = event;
  }

  selectedRowsEmitFn(event: any) {
  }

  rowCellDoubleClickedFn(event: any) {
    this.onCellDoubleClicked(event);
  }
  trackByIndex(index: number, item: any): number {
    return index;
  }

  refreshbuttonEmitFn(event: any) {
    this.refreshbutton = event;
  }

  totalRecordsEmitFn(event: any) {
    this.totalRecords = event;
  }
  onButtonClick(value: string): void {
    this.selectedButton = value;
    this.currentIndex = 0;
  }

  onTemChange(event: any) {
    this.TemDDArray[this.currentIndex] = { id: Number(event), type: this.currentOpenEditPagevar };
  }

  filterGridByTEMId(e: any) {
    this.TemDDArray[this.currentIndex] = { id: Number(e), type: this.currentOpenEditPagevar };
    if (this.currentOpenEditPagevar === 'Table') {
      if (e !== 'all') {
        this.CommonPTreeTableComponent['payload']['TemAccountId'] = e;
      } else {
        this.CommonPTreeTableComponent['payload'] = {};
      }
      this.refreshbutton = true;
    }
  }

  addUser() {
    this.addUserArray.push({ name: 'New', tabType: 'New' });;
    this.setSelectedTab('addUser');
  }

  setSelectedTab(from: any, data?: any) {
    if (from === 'editUser') {
      this.selected = this.editUserArray.length;
      this.peopleDataTable = data;
      this.currentOpenEditPagevar = 'Edit';
      this.selectedWiseTemDD.unshift({ id: '', type: this.currentOpenEditPagevar });
      this.lockUserInput = this.peopleDataTable.UserAccountState;
    } else if (from === 'addUser') {
      this.selected = this.editUserArray.length + this.addUserArray.length;
      this.currentOpenEditPagevar = 'Add';
      this.selectedWiseTemDD.unshift({ id: '', type: this.currentOpenEditPagevar });
      this.selectedWiseTemDD[this.selected] = { id: this.selectedTem, type: this.currentOpenEditPagevar };
    } else if (from === 'uploadUser') {
      this.selected = this.uploadUserArray.length + this.addUserArray.length + this.uploadUserArray.length;
    }
    this.currentIndex = this.selected;
  }

  removeUploadPage(index: any) {
    this.uploadUserArray.splice(index, 1);
    this.uploadUserArray = _.cloneDeep(this.uploadUserArray);

    this.selectedWiseTemDD.splice(this.selected, 1);
    this.selectedWiseTemDD = _.cloneDeep(this.selected);
  }

  onUserAddEvent(event: any, index: any) {
    if (event) {
      this.addUserArray.splice(index, 1);
      this.addUserArray = _.cloneDeep(this.addUserArray);
      this.refreshbutton = true;

    } else {
      this.editUserArray.splice(index, 1);
      this.editUserArray = _.cloneDeep(this.editUserArray);
      this.refreshbutton = true;

    }
  }

  getLoggedinUserInfo(): Promise<any> {
    let promise = new Promise((resolve, reject) => {
      this.locationService.getLoggedinUserInfo().subscribe((result) => {
        if (result && result.Roles && result.Roles.$values && result.Roles.$values.length > 0) {
          const userRoles = result.Roles.$values;
          const userInfo = {
            id: result.Id,
            email: result.Email,
            name: result.FullName,
            mobile: result.PrimaryMobile,
            landline: result.PrimaryLandline,
            userImage: result.UserProfileImage ? result.UserProfileImage : '',
            headerLogo: (result.CompanyLogo && result.CompanyLogo.ImageData) ? result.CompanyLogo.ImageData : (result.AccountLogo && result.AccountLogo.ImageData) ? result.AccountLogo.ImageData : '',
            VendorAccountName: result.VendorAccountName,
            VendorUser: result.VendorUser
          }
          this.sessionStorageService.setObjectValue('userInfo', userInfo);
          this.localStorageService.setObjectValue('userInfo', userInfo);
          this.sessionStorageService.setObjectValue('userRoles', userRoles);
          this.localStorageService.setObjectValue('userRoles', userRoles);
          return resolve(true);
        } else {
          return resolve(false);
        }
      });
    });
    return promise;
  }

  
  sendEmailVerification() {
    this.locationService.emailVerficiationSend(this.peopleDataTable.UserEmail).subscribe(() => {
      this.ErrorWarningPopupOpen('Email verification sent successfully');
    });
  }

  
  unlockUser() {
    this.locationService.unlockUser(this.peopleDataTable.UserEmail).subscribe(
      (result) => {
        this.lockUserInput = 'Unlocked';
        this.peopleDataTable.UserAccountState = 'Unlocked';
        this
        this.ErrorWarningPopupOpen(result);
      },
      error => {
        if (error.error) {
          this.ErrorWarningPopupOpen(error.error.$values[0]);
        }
      });
  }

  forgotPassword() {
    const data = { 'email': this.peopleDataTable.UserEmail }
    this.locationService.forgetPwd(data).subscribe({
      next: data => {
        this.ErrorWarningPopupOpen('Reset password link sent successfully');
      },
      error: error => {
        if (error.status === 200) {
          this.ErrorWarningPopupOpen(error.error.text);
        }
        else {
          this.ErrorWarningPopupOpen(error.error);
        }

      }
    });
  }

  changeTab(event: any) {
    this.currentIndex = event;
    console.log(' currentTabName', this.currentTabName);

    this.selectedSubTab = 0;
    this.isOpenCCSTab = false;

    if (this.currentIndex == 0) {
      this.disableTemSearch = false;

      if (this.selectedTem !== 'all') {
        this.selectedTem = 'all';
        this.selectedWiseTemDD[this.currentIndex] = { id: this.selectedTem, type: this.currentOpenEditPagevar };
        this.refreshbutton = true;
      }
    }
    this.currentOpenEditPagevar = (event === 0) ? 'Table' : this.currentOpenEditPagevar;
    this.peopleDataTable = this.editUserArray[event - 1];
    if (this.currentIndex && this.selectedWiseTemDD[this.currentIndex] && this.selectedWiseTemDD[this.currentIndex].id) { this.selectedTem = this.selectedWiseTemDD[this.currentIndex].id; }
  }

  changeChildTab($event: any) {
    this.selectedSubTab = $event;
    this.selectedSubTab == 0 ? this.isPeopleEditPage = true : this.isPeopleEditPage = false;
    this.selectedSubTab == 1 ? this.isPeopleNotes = true : this.isPeopleNotes = false;
    this.currentTabName = this.tabNames[this.selectedSubTab];
    console.log(' currentTabName', this.selectedSubTab);
  }

  setInventoryNotes(type: any) {
    if (type == 'add') {
      this.addNotesPeopleComponent.addNotes();
    } else if (type == 'inactive') {
      this.addNotesPeopleComponent.setInventoryNotes('inactive');
    } else if (type == 'active') {
      this.addNotesPeopleComponent.setInventoryNotes('active');
    }
  }

  onUserVerified($event: any) {
    if ($event === true) {
      this.peopleDataTable.UserEmailVerified = 'Verified';
      this.refreshbutton = true;
    } else {
      this.peopleDataTable.UserEmailVerified = 'Not Verified';
      this.refreshbutton = true;
    }
  }
  
  setTemDDValueEvent(data: any) {
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
      if (this.currentIndex === this.selected) {
        this.selectedTem = this.selectedWiseTemDD[this.selected].id;
      }
    }
  }

  redirectTab(value: any) {
    this.isOpenCCSTab = true;
    setTimeout(() => {
      this.selectedSubTab = value.redirectIndex;
    }, 400);
  }

  removeCCSTab(i: any) {
    this.selectedSubTab = 2;
    this.isOpenCCSTab = false;
  }

  getIdsArray($event: any) {
    if ($event) {
      this.payload = $event;
    }
  }

  onUnlockButtonClick($event: any) {
    if ($event == true) {
      this.peopleDataTable.UserAccountState = 'Unlocked';
      this.refreshbutton = true;
    } else {
      this.peopleDataTable.UserAccountState = 'Locked';
      this.refreshbutton = true;
    }
  }

  setNewPassword() {
    const dialogRef = this.dialog.open(NewPasswordDialogComponent, {
      panelClass: 'width-600',
      data: { email: this.peopleDataTable.PeopleEmail }
    });

    dialogRef.afterClosed().subscribe(result => {

    });
  }

  onCellDoubleClicked($event: any) {
    this.editUserArray.push($event.data);
    this.setSelectedTab('editUser', $event.data);
  }

  removeTab(index: any) {
    this.isOpenCCSTab = false;
    const aa = this.selectedWiseTemDD
    const find = aa.findIndex((a: any) => a.type === 'Add');
    const a = aa.splice(find);
    aa.splice(index, 1);
    this.selectedWiseTemDD = [...this.selectedWiseTemDD, ...a];

    this.editUserArray.splice(index, 1);
    this.editUserArray = _.cloneDeep(this.editUserArray);
    this.customersEmitData.splice(index, 1);
    this.customersEmitData = _.cloneDeep(this.customersEmitData);


    this.selectedWiseTemDD.splice(index, 1);
    this.selectedWiseTemDD = _.cloneDeep(this.selectedWiseTemDD);
  }

  removeUser(index: any) {
    const aa = this.selectedWiseTemDD;
    const find = aa.findIndex((a: any) => a.type === 'Add');
    const a = aa.splice(find);
    a.splice(index, 1);
    this.selectedWiseTemDD = [...this.selectedWiseTemDD, ...a];

    this.addUserArray.splice(index, 1);
    this.addUserArray = _.cloneDeep(this.addUserArray);

    this.selectedWiseTemDD.splice(index, 1);
    this.selectedWiseTemDD = _.cloneDeep(this.selectedWiseTemDD);
  }

  lockUser() {
    this.locationService.lockUser(this.peopleDataTable.UserEmail).subscribe(
      (result) => {
        this.lockUserInput = 'Locked';
        this.peopleDataTable.UserAccountState = 'Locked';
        this.refreshbutton = true;

        let errorData: any = {
          messgeType: "error",
          title: "Attention",
          titleClass: "text-c-blue",
          icon: "fas fa-exclamation-circle",
          iconClass: "text-c-blue f-70",
          message: result //if messges is multiple use array
        }
        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
        dialogRef.afterClosed().subscribe(result => {
        });

      }, error => {
        if (error.error) {
          this.ErrorWarningPopupOpen(error.error.$values[0]);
        }
      });
  }
  
  ErrorWarningPopupOpen(message?:any) {
    let errorData: any = {
      messgeType: "error",
      title: "Attention",
      titleClass: "text-c-blue",
      icon: "fas fa-exclamation-circle",
      iconClass: "text-c-blue f-70",
      message: message //if messges is multiple use array
    }
    const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
  }

}
