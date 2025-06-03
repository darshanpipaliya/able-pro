import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { SharedModule } from '../../demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { ActionButtonsComponent } from 'src/app/shared/components/action-buttons/action-buttons.component';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-header-section',
  imports: [SharedModule, PrimgModule, ActionButtonsComponent, NgbPopoverModule],
  templateUrl: './header-section.component.html',
  styleUrl: './header-section.component.scss',
  standalone: true,
})
export class HeaderSectionComponent {
  @Input() buttonOptions: any[] = [];
  @Input() selectedButton: string = '';
  @Input() temRoles: boolean = false;
  @Input() selectedTem: string = 'all';
  @Input() selectedCustomer: string = 'all';
  @Input() tems: any[] = [];
  @Input() isDisableTemDD: boolean = false;
  @Input() disableTemSearch: boolean = false;
  @Input() currentOpenEditPagevar: string = '';
  @Input() isDisabledExport: boolean = false;
  @Input() tableDataExist: boolean = false;
  @Input() viewNEdit: boolean = false;
  @Input() CompanyRoles: boolean = false;
  @Input() loaderParent: boolean = false;
  @Input() currentTabName: string = '';
  @Input() TemDDArray: any[] = [];
  @Input() currentIndex: number = 0;
  @Input() isResetpwdAccess: boolean = false;
  @Input() isResetpwdDisable: boolean = false;
  @Input() isHaveCompanyUser: boolean = false;
  @Input() isTemUser: boolean = false;
  @Input() isCompanyUser: boolean = false;
  @Input() peopleDataTable: any;
  @Input() customers: any;
  @Input() disablePlusOptions: boolean = false;
  @Input() addbuttonCondition: boolean = false;
  @Input() selectedChild: number = 0;
  @Input() showAddButton: boolean = false;
  @Input() customersDD: boolean = false;
  @Input() showLinkInventory: boolean = false;
  @Input() disabledLinkInventory: boolean = false;
  @Input() trackByIndex: (index: number, item: any) => any = (index: number, item: any) => index;

  @Output() buttonClick = new EventEmitter<string>();
  @Output() temChange = new EventEmitter<void>();
  @Output() customerChange = new EventEmitter<string>();
  @Output() filterGridByTEMId = new EventEmitter<string>();
  @Output() exportDataAsExcel = new EventEmitter<void>();
  @Output() add = new EventEmitter<void>();
  @Output() setLocationNotes = new EventEmitter<string>();
  @Output() handleResetPassword = new EventEmitter<void>();
  @Output() handleSetNewPassword = new EventEmitter<void>();
  @Output() handleUnlockUser = new EventEmitter<void>();
  @Output() handleLockUser = new EventEmitter<void>();
  @Output() handleEmailVerification = new EventEmitter<void>();
  @Output() handleAddLocationNote = new EventEmitter<void>();
  @Output() replaceContract = new EventEmitter<void>();
  @Output() addAddendum = new EventEmitter<void>();
  @Output() LinkInventoryCDialog = new EventEmitter<void>();

  ngOnInit(): void {
    if (this.TemDDArray[this.currentIndex]?.id === 'all') {
      this.selectedTem = 'all';
    }
    // Initialization logic if needed

  }

  ngOnChanges(changes: SimpleChanges): void {
  }

  handleResetPasswordFn() {
    this.handleResetPassword.emit();
  }

  handleSetNewPasswordFn() {
    this.handleSetNewPassword.emit();
  }

  handleUnlockUserFn() {
    this.handleUnlockUser.emit();
  }

  handleLockUserFn() {
    this.handleLockUser.emit();
  } 

  handleEmailVerificationFn() {
    this.handleEmailVerification.emit();
  }
}