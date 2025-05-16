import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SharedModule } from '../../demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';

@Component({
  selector: 'app-header-section',
  imports: [SharedModule, PrimgModule],
  templateUrl: './header-section.component.html',
  styleUrl: './header-section.component.scss',
  standalone: true,
})
export class HeaderSectionComponent {
  @Input() buttonOptions: any[] = [];
  @Input() selectedButton: string = '';
  @Input() temRoles: boolean = false;
  @Input() selectedTem: string = 'all';
  @Input() disableTemSearchDD: boolean = false;
  @Input() tems: any[] = [];
  @Input() isDisableTemDD: boolean = false;
  @Input() disableTemSearch: boolean = false;
  @Input() currentOpenEditPagevar: string = '';
  @Input() isDisabledExport: boolean = false;
  @Input() tableDataExist: boolean = false;
  @Input() viewNEdit: boolean = false;
  @Input() CompanyRoles: boolean = false;
  @Input() loaderParent: boolean = false;
  @Input() trackByIndex: (index: number, item: any) => any = (index: number, item: any) => index;

  @Output() buttonClick = new EventEmitter<string>();
  @Output() temChange = new EventEmitter<void>();
  @Output() filterGridByTEMId = new EventEmitter<string>();
  @Output() exportDataAsExcel = new EventEmitter<void>();
  @Output() add = new EventEmitter<void>();

  ngOnInit(): void {
    // Initialization logic if needed
  }
}
