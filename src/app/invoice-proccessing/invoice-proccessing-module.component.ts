import { Component } from '@angular/core';
import { SharedModule } from '../demo/shared/shared.module';
import { PrimgModule } from '../demo/shared/primeng.module';
import { Router } from '@angular/router';
import { LocationService } from '../services/location.service';
import _ from 'lodash';
import { InvoiceProcessingComponent } from '../invoice-processing/invoice-processing.component';
import { SandBoxService } from '../services/sandbox.service';
import { ChargeValidationTabComponent } from '../invoice-processing/charge-validation-tab/charge-validation-tab.component';
import { CostDistributionStep4MainComponent } from '../invoice-processing/cost-distribution-step4-main/cost-distribution-step4-main.component';

@Component({
  selector: 'app-invoice-proccessing-module',
  templateUrl: './invoice-proccessing-module.component.html',
  styleUrl: './invoice-proccessing-module.component.scss',
  imports: [SharedModule, PrimgModule, InvoiceProcessingComponent, ChargeValidationTabComponent, CostDistributionStep4MainComponent],
  providers: [SandBoxService]
})
export class InvoiceProccessingModuleComponent {
  currentUrl: string;
  selectedIP: any = 0;
  selected: any = 0;
  currentIndex: any = 0;
  invoiceArray: any = [];
  activatedTab: number = 0;
  removedTabIndex = false;
  tabsArray: any = [];

  constructor(private locationService: LocationService, private router: Router) {
    this.currentUrl = this.router.url;
  }
  
  goToPage(url: any) {
    this.router.navigate([url]);
  }

  redirectInvoice(data: any) {

    this.invoiceArray.push({
      tabTypes: 'Search',
      rowData: data,
      pageName: 'invoice-processing'
    });

    let redirectTab = 9 + this.invoiceArray.length;
    this.selectedIP = redirectTab - 1;
  }

  openInvoiceRetrieval(data: any) {
    if (data.type == 'add') {
      this.invoiceArray.push({
        tabTypes: 'add',
        rowData: data
      });

      let redirectTab = 9 + this.invoiceArray.length;
      this.selectedIP = redirectTab - 1;
    } else if (data.type == 'edit') {

      this.locationService.getInvoiceRetrievalData(data.data.ExpectedInvoiceId).subscribe((res) => {
        data.data = res.Data;
        this.invoiceArray.push({
          tabTypes: 'Retrieval',
          rowData: data
        });

        let redirectTab = 9 + this.invoiceArray.length;
        this.selectedIP = redirectTab - 1;
      });
      let redirectTab = 9 + this.invoiceArray.length;
      this.selectedIP = redirectTab - 1;
    } else if (data.type == 'search') {
      this.invoiceArray.push({
        tabTypes: 'Search',
        rowData: data
      });
      let redirectTab = 9 + this.invoiceArray.length;
      this.selectedIP = redirectTab - 1;
    }
  }

  redirectFromAddRetrieval(event: any, tabIndex: any) {
    if (event) {
      this.selectedIP = 0;
      this.setCloneDeepInvoiceArray(tabIndex);
    }
  }
  setCloneDeepInvoiceArray(tabIndex: any) {
    this.invoiceArray.splice(_.cloneDeep(tabIndex), 1);
    this.invoiceArray = _.cloneDeep(this.invoiceArray);
  }

  setCloneDeepTabArray(index: any) {
    this.tabsArray.splice(index, 1);
    this.tabsArray = _.cloneDeep(this.tabsArray);
  }
  mainTabRedirect(event: any) {
    event == true ? this.selectedIP = 5 : '';
  }

  moveToGridPageFn($e: any) {
    this.activatedTab = 0;
    this.selectedIP = 0;
  }

  selectedWiseTemDDCC: any = [];

  removeTab(tabIndex: any, type?: string) {
    this.removedTabIndex = true;
    this.setCloneDeepTabArray(tabIndex);
    this.changecc(this.tabsArray.length);
  }
  
  changecc(event: any) {
    this.selected = event;
    this.currentIndex = event;
  }

  disabledTab = 0;
  redirectNext(event: any) {
    if (this.disabledTab < event) {
    } else {
      this.selectedIP = event
    }
  }

  onDoubleClickSandbox($event: any) {
    this.selectedIP = $event;
  }

  switchNext(data: any) {
    this.selectedIP = data;
  }

  items = [{
    // label: 'Validate Summary Totals',
    label: 'Invoice Total',
    styleClass: 'danger-step'
  },
  {
    // label: 'VBA Assignment',
    label: 'VBA Validation',
    styleClass: 'danger-step'
  },
  {
    label: 'Charge Code Assignment',
    styleClass: 'danger-step'
  },
  {
    label: 'Charge Validation',
    styleClass: 'danger-step'
  },
  {
    label: 'Cost Distribution',
    styleClass: 'danger-step'
  },
  {
    // label: 'Vendor Product Assignment',
    label: 'Cost Distribution',
    styleClass: 'danger-step'
  },
  {
    label: 'Vendor Product Assignment',
    styleClass: 'danger-step'
  },
  {
    // label: 'Distribution',
    label: 'Final Distribution',
    styleClass: 'danger-step'
  },
  {
    label: 'Final Review',
    styleClass: 'danger-step'
  }
  ];

  step1Done: any;
  step2Done: any;
  clickOnSave = false;

  invoiceOverviewDataOP($event: any) {

    if (!$event) return;

    setTimeout(() => {
      const stepKeys = [
        { key: 'ValidateSummaryTotals', label: 'Invoice Total' },
        { key: 'VBAAssignment', label: 'VBA Assignment' },
        { key: 'ChargeCodeAssignment', label: 'Charge Code Assignment' },
        { key: 'ChargeValidation', label: 'Charge Validation' },
        { key: 'CostDistributionRules', label: 'Cost Distribution' },
        { key: 'VendorProductAssignment', label: 'Vendor Product Assignment' },
        { key: 'ChargeDistribution', label: 'Final Distribution' },
        { key: 'FinalReview', label: 'Final Review' },
      ];

      this.disabledTab = stepKeys.findIndex(
        step => !$event.InvoiceProcessingStepsData[step.key]
      ) + 1;

      // If all steps are valid, set `disabledTab` to 9
      if (this.disabledTab === 0) {
        this.disabledTab = 9;
      }

      // Generate the items dynamically
      this.items = stepKeys.map((step, index) => ({
        label: step.label,
        styleClass: $event.InvoiceProcessingStepsData[step.key]
          ? 'success-step'
          : (index === 1 && this.step1Done) || (index === 2 && this.step2Done)
            ? 'success-step'
            : 'danger-step',
      }));

      // Update selected tab if save action is triggered
      if (this.clickOnSave) {
        this.selectedIP = this.disabledTab;
      }
    }, 500);
  }

  sendTo4D: boolean = false;
  onClickHyperlinkSend($event: any) {
    const mapping :any = {
      AmaountToPay: 1,
      VendorBillingAliasCount: 2,
      ChargeCodeCount: 3,
      ChargeCorrectionsTotal: 4,
      VendorProductCount: 6,
      DistributedCharges: 7,
    };

    this.selectedIP = mapping[$event] || null;

    // Special case for ChargeCorrectionsTotal
    this.sendTo4D = $event === 'ChargeCorrectionsTotal';
  }

  activeTab(event: any) {
    this.activatedTab = event;
  }

  clickOnTab = false;
  clickOnTabFn($e: any) {
    this.clickOnTab = $e;
    this.clickOnSave = false;
  }

  sandBoxGridRowData: any;
  onDoubleClickSandboxData($event: any) {
    this.sandBoxGridRowData = $event;

    const steps = [
      { label: 'Invoice Total', key: 'Step1ValidationSummaryTotal' },
      { label: 'VBA Assignment', key: 'Step2VBAAssignment' },
      { label: 'Charge Code Assignment', key: 'Step3ChargeCodeAssignment' },
      { label: 'Charge Validation', key: 'Step4ChargeValidation' },
      { label: 'Cost Distribution', key: 'Step4_3_4CostDistributionRules' },
      { label: 'Vendor Product Assignment', key: 'Step5VendorProductAssignment' },
      { label: 'Final Distribution', key: 'Step6Distribution' },
      { label: 'Final Review', key: 'Step7FinalInvoiceReview' },
    ];

    this.items = steps.map(step => ({
      label: step.label,
      styleClass: this.sandBoxGridRowData[step.key] ? 'success-step' : 'danger-step',
    }));
  }

  recordPublishedOrCompleted = false;
  onRecordPublishedOrCompleted($event: any) {
    this.recordPublishedOrCompleted = $event;
    this.disabledTab = $event ? 9 : this.disabledTab;
  }

  clickOnSaved($e:any) {
    this.clickOnSave = $e;
  }

  step1DoneFn($event :any) {
    this.step1Done = $event;
  }

  step2DoneFn($event:any) {
    this.step2Done = $event;
  }

  chargeValidationDestroy($event: any) {
    this.sendTo4D = false;
  }

  moveToStep6Tab(data: any) {
    this.activatedTab = 7;
    this.switchNext(7);
  }

  moveToStep4Tab(data: any) {
    this.activatedTab = 5;
    this.switchNext(5);
  }
}
