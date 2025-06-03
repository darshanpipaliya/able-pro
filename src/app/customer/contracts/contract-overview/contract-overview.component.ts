import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import moment from 'moment';
import { ContractService } from 'src/app/services/contract.service';

@Component({
  selector: 'app-contract-overview',
  templateUrl: './contract-overview.component.html',
  styleUrls: ['./contract-overview.component.scss']
})
export class ContractOverviewComponent implements OnInit {

  @Input() tabData: any;
  @Input() tab: any;
  overviewData: any;

  @Output() onOverviewLoaded: EventEmitter<any> = new EventEmitter<any>();

  constructor(private contractService: ContractService) { }

  ngOnInit(): void {
    this.getDetail();
  }


  getDetail() {
    const type = this.tabData.ContractDocumentType ? this.tabData.ContractDocumentType : this.tabData.DocumentType;
    this.contractService.getContractOrAddendumDetails(this.tabData.ContractId, type).subscribe(async (data: any) => {
      this.overviewData = data?.Data;
      this.overviewData.Terms.StartDate = data?.Data?.Terms?.StartDate !== null ? moment(data?.Data?.Terms?.StartDate).format('MM/DD/YYYY') : '';
      this.overviewData.Terms.EndDate = data?.Data?.Terms?.EndDate !== null ? moment(data?.Data?.Terms?.EndDate).format('MM/DD/YYYY') : '';
      this.onOverviewLoaded.emit(this.overviewData);
    });
  }
}
