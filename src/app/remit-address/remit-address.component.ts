import { Component, ViewChild } from '@angular/core';
import { SharedModule } from '../demo/shared/shared.module';
import { PrimgModule } from '../demo/shared/primeng.module';
import { HeaderSectionComponent } from '../common/header-section/header-section.component';
import { MatDialog } from '@angular/material/dialog';
import { LocationService } from '../services/location.service';
import { AddNewAddressDialogComponent } from '../add-new-address-dialog/add-new-address-dialog.component';
import { isValuesUndefined, rolePermission } from '../services/helper';
import { RemitAddressesComponent } from '../remit-addresses/remit-addresses.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-remit-address',
  imports: [SharedModule, PrimgModule, HeaderSectionComponent, RemitAddressesComponent],
  templateUrl: './remit-address.component.html',
  styleUrl: './remit-address.component.scss'
})
export class RemitAddressComponent {
  
  @ViewChild(RemitAddressesComponent)
  private remitAddressesCom: RemitAddressesComponent;
  buttonOptions: any = [
    { label: 'Accounts', value: 'Billing Accounts', icon: 'fas fa-money-check-alt' },
    { label: 'Remit Addresses', value: 'Remit Addresses', icon: 'fas fa-location-arrow' },
  ];
  selectedButton: any = 'Remit Addresses';
  loaderParent: boolean = false;
  isDisabledExport: boolean = false;
  tableDataExist: boolean = false;
  viewNEdit: boolean = false;
  trackByIndex: any = 0;
  public exportRemitData: any;
  currentOpenEditPagevar: any = 'Table';
  addbuttonCondition: boolean = false;
  constructor(private locationService: LocationService, public dialog: MatDialog, private router: Router) {
  }

  ngOnInit(): void {
    this.addbuttonCondition = !rolePermission(['CompanyManager', 'CompanyAdmin', 'CustomerAdmin']);;
  }

  AddRemitAdressPopup() {
    const dialogRef = this.dialog.open(AddNewAddressDialogComponent, {
      panelClass: 'width-665',
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (!isValuesUndefined(result)) {
        if (result) {
          this.remitAddressesCom.getRemitaddresses();
        }
      }
    });
  }

  onBtnExportDataAsExcelRemitAddress() {
 
    this.isDisabledExport = true;
    this.locationService
      .getRemitaddressesExcelData(this.exportRemitData)
      .subscribe({
        next: data => {
          this.isDisabledExport = false;
          let bolbUrl = URL.createObjectURL(data);
          var link = document.createElement("a");
          link.setAttribute("href", bolbUrl);
          link.setAttribute("download", "Remit Addresses.xlsx");
          link.style.display = "none";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

        },
        error: error => {
          this.isDisabledExport = false;

        }
      });
  }

  exportExcelRemit(data: any) {
    this.exportRemitData = data;
  }

  currentOpenEditPage($event: any) {
    this.currentOpenEditPagevar = ($event) ? 'Edit' : 'Add';
  }

  remitAddressExist(data: any) {
    this.tableDataExist = data;
  }
  gridApiAccount: any;
  gridColumnApiAccount: any;
  onAgGridReadyRemitAddressEmit($event: any) {
    this.gridApiAccount = $event.api;
    this.gridColumnApiAccount = $event.columnApi;
  }

  
  onButtonClick(value: string): void {
    this.selectedButton = value;
    setTimeout(() => this.goToPage(value), 0);
  }

  goToPage(to: any) {
    if (to === 'Billing Accounts') {
      this.router.navigate(['/finances/accounting']);
    }
  }
}
