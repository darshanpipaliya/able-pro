import { Component, OnInit } from '@angular/core';
import { ICellRendererParams } from 'ag-grid-community';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { ContractService } from 'src/app/services/contract.service';

@Component({
  selector: 'app-dropdown-cell-renderer',
  template: `
    <i  (click)="downloadDocument()" [ngClass]="{'disabled': params?.data?.IsAttachment == false}" class="fas fa-cloud-download-alt" style="color: #05a646; cursor: pointer;"></i>
  `,
  standalone: true,
  imports: [
    SharedModule,
    PrimgModule,
  ],
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }
    `,

  ],
})
export class DownloadDocCellRendererComponent implements OnInit {
  options: any[];
  selectedValue: any;
  params: any;

  constructor(public contractService: ContractService) {}

  ngOnInit() {
  }
  agInit(params: any): void {  
       this.params = params;
   }
   
  downloadDocument() {
      this.contractService.DownloadAttachment(this.params.data.Id, this.params.data.Type).subscribe((res) => {
        if (res.type == 'application/json') {

        } else {
          let bolbUrl = URL.createObjectURL(res);
          var link = document.createElement("a");
          link.setAttribute("href", bolbUrl);
          link.setAttribute("download", 'Attachment');
          link.style.display = "none";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

        }
      });
  }

  refresh(params: ICellRendererParams): boolean {
    return false;
  }

}
