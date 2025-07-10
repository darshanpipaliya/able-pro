import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { LocationService } from 'src/app/services/location.service';

@Component({
  selector: 'app-view-invoice',
  templateUrl: './view-invoice.component.html',
  styleUrls: ['./view-invoice.component.scss'],
  imports: [SharedModule, PrimgModule]
})
export class ViewInvoiceComponent implements OnInit {

  expectedInvoiceId: any;
  
  pdfSrc: any = 'https://www.pdf995.com/samples/pdf.pdf';
  constructor(private locationService: LocationService, @Inject(MAT_DIALOG_DATA) data: any, private sanitizer: DomSanitizer) {
    this.expectedInvoiceId = data.data.ExpectedInvoiceId;
  }

  ngOnInit(): void {

  }

}
