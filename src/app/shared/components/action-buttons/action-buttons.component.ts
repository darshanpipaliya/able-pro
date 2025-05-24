import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { HEADER_BUTTONS, ButtonConfig } from '../../constants/button-icons';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-action-buttons',
  templateUrl: './action-buttons.component.html',
  styleUrls: ['./action-buttons.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [CommonModule, NgbPopoverModule, SharedModule],
})
export class ActionButtonsComponent {
  @Input() isResetpwdAccess: boolean = false;
  @Input() viewNEdit: boolean = false;
  @Input() isHaveCompanyUser = false;
  @Input() peopleDataTable: any;
  @Input() isTemUser: boolean = false;
  @Input() isCompanyUser: boolean = false;

  @Output() onResetPassword = new EventEmitter<void>();
  @Output() onSetNewPassword = new EventEmitter<void>();
  @Output() onUnlockUser = new EventEmitter<void>();
  @Output() onLockUser = new EventEmitter<void>();
  @Output() onSendEmailVerification = new EventEmitter<void>();
  @Output() onAddLocationNote = new EventEmitter<void>();

  buttons = HEADER_BUTTONS;

  isResetPasswordDisabled(): boolean {
    return !this.peopleDataTable?.CustomerDisplayRole || this.isHaveCompanyUser;
  }

  isUnlockUserDisabled(): boolean {
    return !this.viewNEdit || 
           this.peopleDataTable?.UserAccountState === 'Unlocked' || 
           this.isResetPasswordDisabled();
  }

  isLockUserDisabled(): boolean {
    return !this.viewNEdit || 
           this.peopleDataTable?.UserAccountState === 'Locked' || 
           this.isResetPasswordDisabled();
  }

  isVerificationDisabled(): boolean {
    return !this.viewNEdit || 
           this.isHaveCompanyUser || 
           this.peopleDataTable?.UserEmailVerified === 'Yes' || 
           !this.peopleDataTable?.CustomerDisplayRole;
  }

  onResetPasswordFn() {
    this.onResetPassword.emit();
  }

  onSetNewPasswordFn() {
    this.onSetNewPassword.emit();
  }

  onUnlockUserFn() {
    this.onUnlockUser.emit();
  }

  onLockUserFn() {
    this.onLockUser.emit();
  }

  onSendEmailVerificationFn() {
    this.onSendEmailVerification.emit();
  }
  
  
} 