import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { ICellRendererParams } from 'ag-grid-community';
import { MatDialog } from '@angular/material/dialog';
import { LocationService } from 'src/app/services/location.service';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';

@Component({
  selector: 'app-clip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './clip.component.html',
  styleUrls: ['./clip.component.scss']
})
export class ClipComponent implements OnInit {
  params: any;
  show: any;
  @Input() fileName: string;
  
  constructor(private locationService: LocationService, public dialog: MatDialog) { }

  ngOnInit(): void {
  }

  download() {
    this.locationService.InvoiceRetrievalDownloadFile(this.params.data.expectedInvoiceId, this.params.data.ImportXFileNameId).subscribe({
     next: (data) => {
      if (data.type == 'application/json') {

        let errorData: any = {
          messgeType: "error",
          title: "Attention",
          titleClass: "text-c-blue",
          icon: "fas fa-exclamation-triangle",
          iconClass: "text-c-blue f-70",
          message: "Invoice attachment not exists" //if messges is multiple use array
        }
        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
        dialogRef.afterClosed().subscribe(result => {
        });
       
      } else {
       
        const mimeType = data.type;
        const fileURL = URL.createObjectURL(data);
      
        // Map common MIME types to file extensions
        const mimeExtensionMap: { [key: string]: string } = {
          'application/pdf': '.pdf',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
          'application/zip': '.zip',
          'application/octet-stream': '', // fallback, may need filename from content-disposition
          'text/csv': '.csv'
        };
      
        // Get extension based on mimeType
        const extension = mimeExtensionMap[mimeType] || '';
        const a = document.createElement('a');
        a.href = fileURL;
        a.download = `${this.params.fileName}${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(fileURL);
        
      }
    },
    error: (error: any) => {

    }
    });
  }
  agInit(params: ICellRendererParams): void {
    this.params = params;
    this.show = this.params.data.ImportXFileNameId == null ? false : true; 
  }

}
