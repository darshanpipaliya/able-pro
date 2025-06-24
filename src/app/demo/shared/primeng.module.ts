// angular import
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { ContextMenuModule } from 'primeng/contextmenu';
import { TreeTableModule } from 'primeng/treetable';
import { FileUploadModule } from 'primeng/fileupload';
import { CalendarModule } from 'primeng/calendar';
import { TreeModule } from 'primeng/tree';
import { CheckboxModule } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';
import { ListboxModule } from 'primeng/listbox';
import { MultiSelectModule } from 'primeng/multiselect';
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    DropdownModule,
    DialogModule,
    ContextMenuModule,
    TreeTableModule,
    FileUploadModule,
    CalendarModule,
    TreeModule,
    CheckboxModule,
    TableModule,
    ListboxModule,
    MultiSelectModule
  ],
  exports: [
    DropdownModule,
    DialogModule,
    ContextMenuModule,
    TreeTableModule,
    FileUploadModule,
    CalendarModule,
    TreeModule,
    CheckboxModule,
    TableModule,
    ListboxModule,
    MultiSelectModule
  ]
})
export class PrimgModule {}
