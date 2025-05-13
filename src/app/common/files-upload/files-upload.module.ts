import { NgModule } from '@angular/core';
import { FilesUploadRoutingModule } from './files-upload-routing.module';
import { FileUploadModule } from '@iplab/ngx-file-upload';

@NgModule({
  imports: [
    FilesUploadRoutingModule,
    FileUploadModule
  ],
  declarations: [],
  exports: []
})
export class FilesUploadModule { }
