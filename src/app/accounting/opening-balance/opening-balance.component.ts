import { Component, OnInit, ViewChild } from '@angular/core';
import { BaseComponent, ColumnType, FixedIDs, GlobalConstants, ProviderService, QueryData, ValidatingObjectFormat, ValidatorDirective } from 'src/app/app-shared';
import { FileUploadComponent } from 'src/app/shared';
import { NgForm, UntypedFormGroup } from '@angular/forms';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { OrgService } from 'src/app/app-shared/services/org.service';
import { CoreAccountingService } from 'src/app/app-shared/services/coreAccounting.service';
import { OpeningBalanceDataService } from '../services/opening-balance/opening-balance-data.service';
import { OpeningBalanceModelService } from '../services/opening-balance/opening-balance-model.service';
import { FileOption, GridOption, ModalConfig } from 'src/app/shared/models/common.model';
import { LedgerSummary, LedgerSummaryDetail, OpeningBalanceValidation } from '../models/opening-balance/opening-balance';
import { formatDate } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-opening-balance',
  templateUrl: './opening-balance.component.html',
  providers: [OpeningBalanceModelService, OpeningBalanceDataService],
   standalone:true,
              imports:[
                SharedModule
              ]
})
export class OpeningBalanceComponent extends BaseComponent implements OnInit {

  public validationMsgObj: ValidatingObjectFormat;
  @ViewChild(ValidatorDirective) directive;
  @ViewChild("openingBalanceForm", { static: true, read: NgForm }) openingBalanceForm: NgForm;
  spData: any = new QueryData();
  ref: DynamicDialogRef;
  gridOption: GridOption;
  isSubmitted: boolean = false;
  isBranchModuleActive:boolean = false;
  isProjectModuleActive:boolean = false;

  constructor(
    protected providerSvc: ProviderService,
    public modelSvc: OpeningBalanceModelService,
    public dataSvc: OpeningBalanceDataService,
    public dialogService: DialogService,
    private orgSvc: OrgService,
    public coreAccService: CoreAccountingService,
  ) {
    super(providerSvc);
    this.validationMsgObj = OpeningBalanceValidation();
  }

  ngOnInit(): void {
    this.isBranchModuleActive = GlobalConstants.bizConfigInfo.isBranchModuleActive;
    this.isProjectModuleActive = GlobalConstants.bizConfigInfo.isProjectModuleActive;
    this.modelSvc.addNewItem();
    this.getCompanyList();
    this.getFinancialYearDate();
    this.getLedgerList();
    this.getSubLegderList();
    this.initGridOption();

  }

  ngAfterViewInit() {
    try {
      this.modelSvc.openingBalanceForm = this.openingBalanceForm.form;
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  initGridOption() {
    try {
      const gridObj = {
        title: "",
        dataSource: "modelSvc.ledgerSummaryDTO.ledgerSummaryDetailList",
        columns: this.gridColumns(),
        paginator: false,
        isGlobalSearch: false,
        exportOption: {
          exportInPDF: false,
          exportInXL: false,
          title: "",
        } as FileOption,
      } as GridOption;
      this.gridOption = new GridOption(this, gridObj);
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  gridColumns(): ColumnType[] {
    try {
      return [
        { field: "cOAStructureID", header: this.fieldTitle["fromaccountname"], isRequired: true },
        { field: "subLedgerDetailID", header: this.fieldTitle["subledger"] },
        { field: "debitVal", header: this.fieldTitle["debit(bdt)"], isRequired: true },
        { field: "creditVal", header: this.fieldTitle["credit(bdt)"], isRequired: true },
        { field: "", header: this.fieldTitle["action"] },
      ];
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onSubmit(openingBalanceForm: NgForm) {
    try {

      if (!openingBalanceForm.valid) {
        this.directive.validateAllFormFields(
          openingBalanceForm.form as UntypedFormGroup
        );
        return;
      }
      //check empty list
      if (this.modelSvc.checkEmptyList()) {
        this.showMsg(this.messageCode.emptyList);
        return;
      }
     
      // check total debit and credit value
      // if (!this.modelSvc.checkTotalValue()) {
      //   this.showMsg('2262');
      //   return;
      // }

      if(this.modelSvc.ledgerSummaryDTO.ledgerSummaryDetailList.length > 0){
        this.modelSvc.ledgerSummaryDTO.ledgerSummaryDetailList = this.modelSvc.ledgerSummaryDTO.ledgerSummaryDetailList.filter(x=>x.cOAStructureID !=null);
      }

      //check duplicate
      if (this.modelSvc.checkDuplicateByProperty(this.modelSvc.ledgerSummaryDTO.ledgerSummaryDetailList, 'cOAStructureID', 'subLedgerDetailID')) {
        this.showMsg(this.messageCode.duplicateCheck);
        return;
      }

      this.save(this.modelSvc.ledgerSummaryDTO);

    } catch (error) {

    }
  }

  private save(ledgerSummaryDTO: any) {
    try {
      this.isSubmitted = true;
      let messageCode = ledgerSummaryDTO.id ? this.messageCode.editCode : this.messageCode.saveCode;
      this.dataSvc.save(ledgerSummaryDTO).subscribe({
        next: (res: any) => {
          if (res.body) {
            this.modelSvc.ledgerSummaryDTO = new LedgerSummary(res.body);
            this.showMsg(messageCode);
            this.modelSvc.openingBalanceForm.markAsPristine();
            this.isSubmitted = false;
          }
        },
        error: (res: any) => {
          this.isSubmitted = false;
          this.showErrorMsg(res);
          this.isSubmitted = false;
        },
        complete: () => {
          this.isSubmitted = false;
        }
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }


  fileUploadModal(item: LedgerSummary) {
    try {
      const modalConfig = new ModalConfig();
      modalConfig.header = this.fieldTitle["fileupload"];
      modalConfig.closable = false;
      modalConfig.data = {
        uploadOption: item.imageFileUploadOpton,
        targetObjectList: item.ledgerSummaryAttachmnetList,
      };

      this.ref = this.dialogSvc.open(FileUploadComponent, modalConfig);

      this.ref.onClose.subscribe((data: any) => {
        if (data) {
          this.modelSvc.ledgerSummaryDTO.ledgerSummaryAttachmnetList = item.ledgerSummaryAttachmnetList;
          if (data) {
            this.modelSvc.openingBalanceForm.markAsDirty();
          }
        }
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  onReset() {
    try {
      if (this.modelSvc.ledgerSummaryDTO.id > 0) {
        this.getOpeningBalanceByCorrespondingID();
        this.modelSvc.checkTotalValue();
      } else {
        this.isSubmitted = false;
        this.modelSvc.totalCredit = 0;
        this.modelSvc.totalDebit = 0;
        this.modelSvc.onReset();
        this.modelSvc.addNewItem();
        this.getCompanyList();
      }
      this.getFinancialYearDate();

    } catch (error) {
      this.showErrorMsg(error);
    }
  }


  getCompanyList() {
    try {
      this.orgSvc.getOrgStructure(FixedIDs.orgType.Company.toString(), '').subscribe({
        next: (res: any) => {
          this.modelSvc.companyList = res;
          this.modelSvc.ledgerSummaryDTO.companyID = GlobalConstants.userInfo.companyID;
          if(this.modelSvc.ledgerSummaryDTO.companyID == null &&  this.modelSvc.companyList.length == 1){
            this.modelSvc.ledgerSummaryDTO.companyID = res[0].id;
          }
          if(this.isBranchModuleActive){
            this.getOfficeBranchList(GlobalConstants.userInfo.companyID);

          }
          this.getProjectList(GlobalConstants.userInfo.companyID);
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

  getOpeningBalanceByCorrespondingID() {
    try {debugger
      let comId = this.modelSvc.ledgerSummaryDTO.companyID;
      let proId = this.modelSvc.ledgerSummaryDTO.projectID;
      let orgId = this.modelSvc.ledgerSummaryDTO.orgID;
      
      this.dataSvc.getOpeningBalanceByCorrespondingID(this.spData, this.modelSvc.ledgerSummaryDTO.companyID, this.modelSvc.ledgerSummaryDTO.orgID, this.modelSvc.ledgerSummaryDTO.projectID).subscribe({
        next: (res: any) => {
          this.getFinancialYearDate();
         
          if (res != null) {
            if (res.id > 0) {
              
              this.modelSvc.ledgerSummaryDTO = new LedgerSummary(res);
              this.modelSvc.ledgerSummaryDTO.locationID = GlobalConstants.userInfo.locationID;
            
              this.modelSvc.ledgerSummaryDTO.ledgerSummaryDetailList =[];
              res.ledgerSummaryDetailList.forEach(element => {
            
                let obj = new LedgerSummaryDetail(element);
                this.modelSvc.ledgerSummaryDTO.ledgerSummaryDetailList.entityPush(obj);
              });

              if(res.ledgerSummaryDetailList.length ==0){
                this.modelSvc.addNewItem();
              }

              this.modelSvc.ledgerSummaryDTO.ledgerSummaryAttachmnetList = res.ledgerSummaryAttachmnetList;
            }
          } else {

            this.modelSvc.ledgerSummaryDTO = new LedgerSummary();
            this.modelSvc.ledgerSummaryDTO.companyID = comId;
            this.modelSvc.ledgerSummaryDTO.orgID = orgId;
            this.modelSvc.ledgerSummaryDTO.projectID = proId;
            this.modelSvc.addNewItem();
           


          }
          if(this.branchList.length ==1){
            this.modelSvc.ledgerSummaryDTO.orgID = this.branchList[0].id;
          }
          this.modelSvc.checkTotalValue();
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
branchList:any;
  getOfficeBranchList(companyId: any) {
    try {
      this.orgSvc.getOrgStructure(FixedIDs.orgType.Office.toString() + ',' + FixedIDs.orgType.Branch.toString() + ',' + FixedIDs.orgType.Unit.toString(), companyId).subscribe({
        next: (res: any) => {debugger
          this.branchList = res || [];
          if(this.branchList.length ==1){
            this.modelSvc.ledgerSummaryDTO.orgID = this.branchList[0].id;
            this.formResetByDefaultValue(this.openingBalanceForm.form,this.modelSvc.ledgerSummaryDTO);
            this.getOpeningBalanceByCorrespondingID();
          }
          this.modelSvc.officeBranchList = this.modelSvc.prepareOfficeBranchUnit(res || []).categories;
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


  getProjectList(companyId: any) {
    try {
      this.coreAccService
        .getProject(companyId)
        .subscribe({
          next: (res: any) => {
            this.modelSvc.projectList = res || [];
          },
          error: (res: any) => {
            this.showErrorMsg(res);
          },
        });
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  getLedgerList() {
    try {
      this.coreAccService
        .getCOAStructure(null)
        .subscribe({
          next: (res: any) => {
            var result = res || [];
            this.modelSvc.ledgerList = result.filter(x => x.accountNatureCd == FixedIDs.accountingNature.Assets || x.accountNatureCd == FixedIDs.accountingNature.Liabilities || x.accountNatureCd == FixedIDs.accountingNature.Equity);
          },
          error: (res: any) => {
            this.showErrorMsg(res);
          },
        });
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  getSubLegderList() {
    try {
      this.coreAccService
        .getSubLedgerDetail(null)
        .subscribe({
          next: (res: any) => {
            this.modelSvc.subLedgerList = res || [];
          },
          error: (res: any) => {
            this.showErrorMsg(res);
          },
        });
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onSelectToCompany() {
    try {
      this.modelSvc.projectList = [];
      this.modelSvc.officeBranchList = [];
      this.modelSvc.totalCredit = 0;
      this.modelSvc.totalDebit = 0;
      if(this.isBranchModuleActive){
      this.getOfficeBranchList(this.modelSvc.ledgerSummaryDTO.companyID);
      }
      this.getProjectList(this.modelSvc.ledgerSummaryDTO.companyID);
      this.getOpeningBalanceByCorrespondingID();

    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onSelectProject(item) {
    try {
      //this.modelSvc.ledgerSummaryDTO.orgID = null;
      if (this.modelSvc.ledgerSummaryDTO.companyID != null) {
        this.getOpeningBalanceByCorrespondingID();
      }
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onSelectOrg(item) {
    try {
      //this.modelSvc.ledgerSummaryDTO.projectID = null;
      if (this.modelSvc.ledgerSummaryDTO.companyID != null) {
        this.getOpeningBalanceByCorrespondingID();
      }
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onSelectLedger(item) {
    try {
      item.subLedgerTypeID = this.modelSvc.ledgerList.find(x => x.id == item.cOAStructureID)?.subLedgerTypeID;
    } catch (error) {
      this.showErrorMsg(error);
    }
  }


  onDebitFieldChange(entity: any) {
    try {
      this.modelSvc.onDebitFieldChange(entity);
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onCreditFieldChange(entity: any) {
    try {
      this.modelSvc.onCreditFieldChange(entity);
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onRemoveLedgerSummaryDetail(item: any) {
    try {
      this.modelSvc.removeLedgerSummaryDetail(item);
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  addNewItem() {
    try {
      this.modelSvc.addNewItem();
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  isClose: boolean = false;
  getFinancialYearDate() {
    try {
      this.coreAccService.getFinancialYear().subscribe({
        next: (res: any) => {
          let results = res || [];
          if (results.length > 0) {
            let countCloseStatus = 0;
            results.forEach(element => {
              if (element.status == 12) {
                countCloseStatus++;
                if (countCloseStatus == 2) {
                  this.isClose = true;
                }
              }
            });
            this.modelSvc.ledgerSummaryDTO.name = results[0].name;
            this.modelSvc.ledgerSummaryDTO.financialDate = formatDate(results[0].toDate, FixedIDs.fixedIDs.format.dateFormat, "en");//formatedDate results[0].toDate;
            this.modelSvc.ledgerSummaryDTO.financialYearID = results[0].id;
            this.openingBalanceForm.form.markAsPristine();
            if (this.modelSvc.ledgerSummaryDTO.name == null) {
              this.isClose = true;
              this.showMsg('2263');
            }
          }
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

}


