import { Directive, ElementRef, HostListener, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[OnlyNumber]'
})
export class OnlyNumber implements OnInit {
  @Input() allowNegative: boolean = false;
  private onlyNumberRegex = new RegExp(/^[0-9]*\.?[0-9]*$/);
  private onlyNumberWithNegativeRegex = new RegExp(/^[-]?[0-9]*\.?[0-9]*$/);
  private InputSpecialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Del', 'Delete'];
  private AllowControlPluseKey: Array<string> = ['a', 'c', 'v', 'x', 'A', 'C', 'V', 'X'];
  constructor(private _el: ElementRef) { }
  ngOnInit() {
  }

  @HostListener('keypress', ['$event']) onKeyPress(event) {
    var charCode = (event.which) ? event.which : event.keyCode;
    if (charCode == 46) {
      return true;
    }

    if (this.allowNegative && charCode === 45) {
      if (this._el.nativeElement.value.includes('-') || this._el.nativeElement.selectionStart !== 0) {
        event.preventDefault();
      }
      return true;
    }

    else if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  @HostListener('keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
    let current: string = this._el.nativeElement.value;
    const next: string = [current.slice(0, this._el.nativeElement.selectionStart), event.key, current.slice(this._el.nativeElement.selectionEnd)].join('');
    this.Numbervalidation(event, next);
  }


  Numbervalidation(event: KeyboardEvent, next: string) {
    const regex = this.allowNegative ? this.onlyNumberWithNegativeRegex : this.onlyNumberRegex;

    if (this.InputSpecialKeys.includes(event.key) || (this.AllowControlPluseKey.includes(event.key) && event.ctrlKey)) {
      return;
    }

    if (next && !regex.test(next)) {
      event.preventDefault();
    }
  }


  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent) {
    const clipboardData: any = event.clipboardData;
    const pastedText = this._el.nativeElement.value.concat(clipboardData.getData('text').toString());

    const regex = this.allowNegative ? this.onlyNumberWithNegativeRegex : this.onlyNumberRegex;

    if (pastedText && !regex.test(pastedText)) {
      event.preventDefault();
    }
  }

  @HostListener('focusout', ['$event'])
  onFocusOut(event: any) {
    let current: string = this._el.nativeElement.value;
    const regex = this.allowNegative ? this.onlyNumberWithNegativeRegex : this.onlyNumberRegex;

    if (current && !regex.test(current)) {
      this._el.nativeElement.value = '';
      this._el.nativeElement.dispatchEvent(new Event('input'));
    }
  }
}
