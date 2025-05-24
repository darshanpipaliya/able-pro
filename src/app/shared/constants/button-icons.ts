export interface ButtonConfig {
  classes: string;
  icon: string;
  title?: string;
}

export const HEADER_BUTTONS: { [key: string]: ButtonConfig } = {
  resetPassword: {
    classes: 'avatar avatar-s bg-danger-50 text-danger-500 cp b-rad-20',
    icon: 'fas fa-user-lock',
    title: 'Forgot/Set New Password'
  },
  unlockUser: {
    classes: 'avatar avatar-s bg-primary-50 text-primary-500 cp b-rad-20',
    icon: 'fas fa-unlock-alt',
    title: 'Unlock User'
  },
  lockAccount: {
    classes: 'avatar avatar-s bg-primary-50 text-primary-500 cp b-rad-20',
    icon: 'fas fa-lock',
    title: 'Lock Account'
  },
  resendVerification: {
    classes: 'avatar avatar-s bg-success-50 text-success-500 cp b-rad-20',
    icon: 'fas fa-envelope',
    title: 'Resend Verification email'
  },

};

// Additional utility classes
export const UTILITY_CLASSES = {
  popoverContent: 'text-left',
  innerOption: 'inner-option',
  disabled: 'disabled'
}; 