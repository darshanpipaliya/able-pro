import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommanHtmlRendererComponent } from './ag-grid-cell-renderer-element/comman-html-renderer.component';
import { SharedModule } from '../demo/shared/shared.module';

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [
  ]
})
export class AppCommonModule { } 