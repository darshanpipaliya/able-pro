import { Component, EventEmitter, Input, OnInit, Output, QueryList, SimpleChanges, ViewChildren } from '@angular/core';
import { LocationService } from '../services/location.service';
import { rolePermission } from '../services/helper';
import { SharedModule } from '../demo/shared/shared.module';
import { NoteAccountComponent } from '../note-account/note-account.component';
import { AddBillingAccountComponent } from '../add-billing-account/add-billing-account.component';
import { EditInvoiceDataRetrievalComponent } from '../edit-invoice-data-retrieval/edit-invoice-data-retrieval.component';
import { EditPaymentSettingsComponent } from '../edit-payment-settings/edit-payment-settings.component';
import { AutoApprovalComponent } from '../auto-approval/auto-approval.component';
import { ChangeLogComponent } from '../common/change-log/change-log.component';

@Component({
  selector: 'app-edit-billing-account',
  templateUrl: './edit-billing-account.component.html',
  styleUrls: ['./edit-billing-account.component.scss'],
  imports: [SharedModule, AddBillingAccountComponent, EditInvoiceDataRetrievalComponent, EditPaymentSettingsComponent, AutoApprovalComponent,NoteAccountComponent, ChangeLogComponent]
})
export class EditBillingAccountComponent implements OnInit {
  @Input() billingAccountData: any;
  @Input() tabInfo: any;
  @Input() action: any;
  @Input() selectedTem: any;
  @Input() loadNoteAccountComponent: any;
  @Output() updatedBillingData: EventEmitter<any> = new EventEmitter<any>();
  @Output() addBillingAccountDestroy: EventEmitter<any> = new EventEmitter<any>();
  @Output() currentOpenEditPage: EventEmitter<any> = new EventEmitter<any>();
  @Output() setTemDDValueEventFromChild: EventEmitter<any> = new EventEmitter<any>();
  @Output() sendAccHirercyToTable: EventEmitter<any> = new EventEmitter<any>();
  @Output() onAddNotesEnabledEmit: EventEmitter<any> = new EventEmitter<any>();
  @Output() onBillingAccountData: EventEmitter<any> = new EventEmitter<any>();
  @Output() onAccountNotesData: EventEmitter<any> = new EventEmitter<any>();
  @Output() onNotesAddBillingAccIdOne: EventEmitter<any> = new EventEmitter<any>();

  @ViewChildren(NoteAccountComponent) children: QueryList<NoteAccountComponent>;

  @Input() tabs: any;
  columns: any = [];

  
  buttonActionUpdated: any;
  setIsReadOnly: boolean = false;
  isCompanyUser: boolean = false;
  isTEMUser: boolean = false;
  viewNEditAccount: boolean = false;
  selectedTab: any = 0;
  isNoteTabEnabled = false;
  validationFire2Tab = false;
  tabNames = ['Account', 'Invoice & Data Retrieval', 'Payments', 'Approvals', 'Notes', 'Change Log'];
  currentTabName: any = 'Account'
  @Output() currentTabNameEmit: EventEmitter<any> = new EventEmitter<any>();
  constructor(private locationService: LocationService) {
    this.columns = [
      { field: 'TabModuleDisplayName', header: 'Tab' },
      { field: 'TabSectionModuleDisplayName', header: 'Section' },
      { field: 'DisplayColumnName', header: 'Field Name' },
      { field: 'OldValue', header: 'Previous Value' },
      { field: 'NewValue', header: 'New Value' },
      { field: 'Action', header: 'Action' },
      { field: 'ModificationDate', header: 'Time & Date' },
      { field: 'ModifiedBy', header: 'Who' }
    ];
  }

  ngOnInit(): void {
    if (this.action == 'edit') {
      this.currentOpenEditPage.emit(true);
      this.onBillingAccountData.emit(this.billingAccountData);
    } else {
      this.currentOpenEditPage.emit(false);
    }
    if (this.billingAccountData && this.billingAccountData.selectedTab) {
      this.selectedTab = this.billingAccountData.selectedTab;
    } 

    let isCustomerAdmin = this.locationService.isUserCustomerAdmin();
    let isCompanyAdmin = this.locationService.isUserCompanyAdmin();
    let isCompanyManager = this.locationService.isUserCompanyManager();
    let isCompanyUser = this.locationService.isUserCompanyUser();
    let isTEMUserRole = this.locationService.isUserHasTEMUsersRole();
    this.isCompanyUser = this.locationService.isUserCompanyUser();
    this.isTEMUser = this.locationService.isUserHasTEMUserRole();
    this.viewNEditAccount =  rolePermission(['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser']);

    if (this.tabInfo && this.tabInfo.value == 'finances-accounting' || (isCustomerAdmin || isCompanyAdmin || isCompanyManager || isCompanyUser || isTEMUserRole)) {
      if (this.isCompanyUser || this.isTEMUser) {
        this.setIsReadOnly = true;
      }
      if (this.billingAccountData && this.billingAccountData.selectedTab && this.billingAccountData.selectedTab === 1) {
        this.selectedTab = 1;
      }
    }
    this.currentTabName = this.tabNames[this.selectedTab];
    this.currentTabNameEmit.emit(this.currentTabName);
  }
  moveOnBackNextTab(data: any) {
    this.billingAccountData = data;
    this.action = 'edit';
    data['BillingAccountHierarchyNumber'] = data.AccountNumber
    this.updatedBillingData.emit(data);
  }

  onNotesAddBillingAccId($event: any) {
    this.onNotesAddBillingAccIdOne.emit($event);
  }

  onSaveAndNext($event: any){
    if ($event) {
      this.validationFire2Tab = true;
      this.selectedTab = 1;
      this.currentTabName = this.tabNames[this.selectedTab];
      this.currentTabNameEmit.emit(this.currentTabName);

    }
  }

  tabName(selectedTab: any){
    this.currentTabName = this.tabNames[selectedTab];
    this.currentTabNameEmit.emit(this.currentTabName);
  }
  onAddBillingAccountDestroy(data: any) {
    this.addBillingAccountDestroy.emit(data);
  }

  setTemDDValueEvent(data: any, i: any){
    this.setTemDDValueEventFromChild.emit(data)
  }

  sendAccHirercyToTableFn(data: any) {
    this.sendAccHirercyToTable.emit(data);
  }

  ngOnDestroy(): void {
    this.setTemDDValueEventFromChild.emit('');
  }

  onAddNotesEmit(e: any){
    this.onAddNotesEnabledEmit.emit(e);
  }

  onSpinnerEmit($event: any){
    this.onAccountNotesData.emit($event);
  }
  
}
