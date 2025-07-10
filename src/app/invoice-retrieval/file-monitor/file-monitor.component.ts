import { Component, EventEmitter, OnInit , Output, ViewChild } from '@angular/core';
import { LocationService } from '../../services/location.service';
import _ from 'lodash';
import { isValueExist} from '../../services/helper';
import moment from 'moment';
import { FileMonitorPtreeTableComponent } from './file-monitor-ptree-table/file-monitor-ptree-table.component';
import { SharedModule } from 'src/app/demo/shared/shared.module';


@Component({
  selector: 'app-file-monitor',
  templateUrl: './file-monitor.component.html',
  styleUrls: ['./file-monitor.component.scss'],
  imports: [FileMonitorPtreeTableComponent, SharedModule]
})
export class FileMonitorComponent implements OnInit {
  public sideBar;
  sbInvoiceId: any;
  exportFilesList: any;
  public getDataPath: any = (data: any) => data.dataPath;
  public columnDefs: any;
  rowData: any = [];
  stopSpinner: boolean = false;
  @ViewChild(FileMonitorPtreeTableComponent) private FileMonitorPtreeTableComponent: FileMonitorPtreeTableComponent;
  rowSelection = 'multiple';
  defaultColDef = {
    editable: false,
    sortable: true,
    minWidth: 100,
    resizable: true,
    floatingFilter: true,
    flex: 1,
  };

  public autoGroupColumnDef: any = {
    headerName: 'Import ID',
    field: 'ImportID',
    cellRendererParams: {
      suppressCount: true,
    },
    filterParams: {
      treeList: true,
    },
    filter: 'agTextColumnFilter',
    minWidth: 150,
    resizable: true
  };
  
  @Output() disableExcelbtnOut: EventEmitter<any> = new EventEmitter();

  constructor(private locationService: LocationService) {
    this.sideBar = {
      toolPanels: ['columns', 'filters']
    };   
  }

  ngOnInit(): void {

    //this.getFileMonitor();


    let headerData:any = [];
    let ChildHeaderData:any = [];
    let i = 0;
    let childIndex = 0;
    _.map(this.columnDefs, (x: any) => {
      if (isValueExist(x.headerName)) {
        if (i == 0) {
          headerData.push({
            "Position": 1,
            "Title": "Import ID"
          });
          i = i + 1;
        }
        i = i + 1;

        headerData.push({ position: i, title: x.headerName });
        if (x.children) {
          _.map(x.children, (y: any) => {
            if (childIndex == 0) {
              ChildHeaderData.push({
                "Position": 1,
                "Title": "Import ID",
                "FieldName": "ImportID",
                "HeaderPosition": 1
              })
              childIndex = childIndex + 1;
            }
            childIndex = childIndex + 1;
            ChildHeaderData.push({ Position: childIndex, Title: y.headerName, FieldName: y.field, HeaderPosition: i })
          })
        }
      }
    });

    this.exportFilesList = {
      ExportToExcelData: {
        HeaderData: headerData,
        ChildHeaderData: ChildHeaderData,
        fileName: "Files"
      },
      ExportToExcel: true
    };
  }

  getFileMonitor() {
    this.stopSpinner = false;
    
  }

  processData(data: any[]) {
    const flattenedData: any[] = [];
    const flattenRowRecursive = (row: any, parentPath: string[]) => {
      const dataPath = [...parentPath, row.$id];
      flattenedData.push({ ...row, dataPath });
      if (row.SubFileGridData && row.SubFileGridData.$values.length > 0) {
        row.SubFileGridData.$values.forEach((underling: any) => {
          if(underling.ImportID === 0){
            underling.ImportID = '';
          }
          flattenRowRecursive(underling, dataPath)
        }
        );
      }
    };
    data.forEach((row) => flattenRowRecursive(row, []));
    return flattenedData;
  }

  onBtnExportDataAsExcel(){
    this.disableExcelbtnOut.emit(true);
    this.FileMonitorPtreeTableComponent.setColumnDefs();

    this.locationService.getFileMonitoringExcel(this.FileMonitorPtreeTableComponent.exportAccounts)
    .subscribe({
      next: data => {
        this.disableExcelbtnOut.emit(false);
        let bolbUrl = URL.createObjectURL(data);
        var link = document.createElement("a");
        link.setAttribute("href", bolbUrl);
        link.setAttribute("download", "Files.xlsx");
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
      error: error => {
        this.disableExcelbtnOut.emit(false);
      }
    });
  }
  
  disableExcelbtn(data: any) {
    this.disableExcelbtnOut.emit(data);
  }
}
