import { Directive, Input, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[spaceTrimStartEndInput]'
})
export class SpaceTrimStartEndInputirective {

  @Input() allowStartWithSpace = true;

  private InputSpecialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Del', 'Delete'];
  private AllowControlPluseKey: Array<string> = ['a', 'c', 'v', 'x', 'A', 'C', 'V', 'X'];
  private StartWithSpaceRegex: RegExp = new RegExp(/^\S/g);

  constructor(private _el: ElementRef) { }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    let current: string = this._el.nativeElement.value;
    const position = this._el.nativeElement.selectionStart;
    const next: string = [current.slice(0, this._el.nativeElement.selectionStart), event.key, current.slice(this._el.nativeElement.selectionEnd)].join('');

    if (!this.allowStartWithSpace) {
      const current: string = this._el.nativeElement.value;
      const position = this._el.nativeElement.selectionStart;
      const next: any = [current.slice(0, position), event.key, current.slice(position)].join('');
      if (this.InputSpecialKeys.indexOf(event.key) !== -1 || (this.AllowControlPluseKey.indexOf(event.key) !== -1 && event.ctrlKey)) {
        return;
      }
      if (next && !String(next).match(this.StartWithSpaceRegex)) {
        event.preventDefault();
      }
    }
  }
  @HostListener('keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
      let current: string = this._el.nativeElement.value;
      if (!this.allowStartWithSpace) {
          const current: string = this._el.nativeElement.value;
          if (current && !String(current).match(this.StartWithSpaceRegex)) {
              this._el.nativeElement.value = current.trim();
          }
      }
  }
  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent) {
      let current: string = this._el.nativeElement.value;
      const position = this._el.nativeElement.selectionStart;
      const next: string = [current.slice(0, position), current.slice(position)].join('');
      const clipboardData = event.clipboardData;
      const pastedText = this._el.nativeElement.value.concat(clipboardData?.getData('text')?.toString() || '');

      if (!this.allowStartWithSpace) {
          const clipboardData = event.clipboardData;
          const pastedText = this._el.nativeElement.value.concat(clipboardData?.getData('text')?.toString() || '');
          if (pastedText && !String(pastedText).match(this.StartWithSpaceRegex)) {
              this._el.nativeElement.value = pastedText.trim();
              event.preventDefault();
          }
      }
  }

  @HostListener('focusout', ['$event'])
    onFocusout(target: any) {
      this._el.nativeElement.value = this._el.nativeElement.value.trim();
  }
}
