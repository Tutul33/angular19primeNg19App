import { Component, OnInit, ViewChild } from "@angular/core";
import { DialogService } from 'primeng/dynamicdialog';
import { ColumnType, GridOption } from 'src/app/shared/models/common.model';
import { FixedIDs, ValidatorDirective } from '../../../shared';
import { NgForm } from "@angular/forms";

import {
  ProviderService,
  BaseComponent,
  BusinessConfigDataService,
  BusinessConfigModelService
} from '../../index';
import { SharedModule } from "src/app/shared/shared.module";

@Component({
  selector: 'app-cheque-status-notify',
  templateUrl: './cheque-status-notify.component.html',
  providers: [BusinessConfigDataService, BusinessConfigModelService],
  standalone:true,
  imports:[
      SharedModule
    ]
})
export class ChequeStatusNotifyComponent extends BaseComponent implements OnInit{
  gridOption: GridOption;

  @ViewChild(ValidatorDirective) directive; 
  @ViewChild("chequeStatusNotifyForm", { static: true, read: NgForm }) chequeStatusNotifyForm: NgForm;
  public validationMsgObj: any;

  constructor(
    protected providerSvc: ProviderService,
    public modelSvc: BusinessConfigModelService,
    private dataSvc: BusinessConfigDataService,
    public dialogService: DialogService,
  ) {
    super(providerSvc);
  }

  ngOnInit(): void {
    this.getChequeStatusNotifyBizConfig();
    this.initGridOption();
  }

  getChequeStatusNotifyBizConfig() {
    try {
      this.dataSvc.getChequeStatusNotifyBizConfig().subscribe({
        next: (res: any) => {
          let data = res[res.length - 1] || [];
          this.modelSvc.chequeStatusNotifyList = data;
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
        complete: () => { },
      });
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

    
  initGridOption() {
    try {
      const gridObj = {
        dataSource: "modelSvc.chequeStatusNotifyList",
        columns: this.gridColumns(),
        refreshEvent: this.refresh,
        paginator: false,
        exportOption: {
          exportInPDF: true,
          exportInXL: true,
          title: this.fieldTitle["chequestatusnotify"]
        }
      } as GridOption;
      this.gridOption = new GridOption(this, gridObj);
    } catch (e) {
    }
  }

  gridColumns(): ColumnType[] {
    return [
      { field: "name", header: this.fieldTitle['notify'] },
      { field: "value", header: this.fieldTitle['days'] },
      { field: "isActive", header: this.fieldTitle['active'], isBoolean: true, styleClass: "d-center" },
    ]
  }

  refresh(){
    try {
      this.getChequeStatusNotifyBizConfig();
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  changeData(entity) {
    try {
      this.dataSvc.updateChequeStatusNotify(entity.id, entity.value, entity.isActive).subscribe({
        next: (res: any) => { 
          this.showMsg(this.messageCode.editCode);
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
      });
    } catch (error) {
      this.showErrorMsg(error);
    }
  }
}
