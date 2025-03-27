import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm, UntypedFormGroup } from '@angular/forms';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SingleCreditVoucherCashValidation } from 'src/app/accounting/models/voucher/voucher.model';
import { CreditReceiptVoucherDataService, CreditReceiptVoucherModelService,FileUploadComponent } from '../../../index'
import { BaseComponent, Config, FileUploadOption, FixedIDs, GlobalConstants, GlobalMethods, ProviderService, ValidatingObjectFormat, ValidatorDirective } from 'src/app/app-shared';
import { CoreAccountingService } from 'src/app/app-shared/services/coreAccounting.service';
import { ModalConfig, QueryData } from 'src/app/shared/models/common.model';
import { forkJoin } from 'rxjs';
import { OrgService } from 'src/app/app-shared/services/org.service';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-credit-receipt-voucher-entry-single-cash',
  templateUrl: './credit-receipt-voucher-entry-single-cash.component.html',
  providers:[CreditReceiptVoucherDataService,CreditReceiptVoucherModelService],
  standalone:true,
        imports:[
          SharedModule
        ]
})
export class CreditReceiptVoucherEntrySingleCashComponent  extends BaseComponent
implements OnInit,AfterViewInit {
@Input() voucherModel: any;
isSubmitted: boolean = false;
projectOfficeBranch:string='';
companyName:string='';
spData: any = new QueryData();
@Output() dataEmitToParent = new EventEmitter<any>();
ref: DynamicDialogRef;
public multiCashValidationMsgObj: ValidatingObjectFormat;
public singleCashValidationMsgObj: ValidatingObjectFormat;
public singleBankValidationMsgObj: ValidatingObjectFormat;
public multiBankValidationMsgObj: ValidatingObjectFormat;
@ViewChild(ValidatorDirective) directive;
loginUserID: number = GlobalConstants.userInfo.userPKID;
//Single Cash
@ViewChild("singleVoucherCashForm", { static: true, read: NgForm })
singleVoucherCashForm: NgForm;

fileUploadOption: FileUploadOption;
cashNatureTransactionCode: any;
isInValidBranch:boolean=false;
constructor(
  protected providerSvc: ProviderService,
  private dataSvc: CreditReceiptVoucherDataService,
  public modelSvc: CreditReceiptVoucherModelService,
  public coreAccService:CoreAccountingService,
  public orgService: OrgService,
  public dialogService: DialogService
) {
  super(providerSvc);
  this.singleCashValidationMsgObj = SingleCreditVoucherCashValidation();
}

ngOnInit() {
  try {   
    this.setBranchProjectConfig();
    this.cashNatureTransactionCode=FixedIDs.transactionNatureCd.cashNature.code;  
    
    setTimeout(()=>{
      this.loadOtherData();           
    },10);
    
    this.modelSvc.initiate();
    this.getFileUploadOption(); 
    } catch (error) {
    this.showErrorMsg(error);
  }

}


setBranchProjectConfig(){
  try {
    this.modelSvc.isProjectModuleActive = GlobalConstants.bizConfigInfo.isProjectModuleActive;
    this.modelSvc.isBranchModuleActive = GlobalConstants.bizConfigInfo.isBranchModuleActive;
  } catch (error) {
    this.showErrorMsg(error);
  }
}

ngAfterViewInit() {
  try {
    this.modelSvc.singleVoucherCashForm = this.singleVoucherCashForm.form;
  } catch (e) {
    this.showErrorMsg(e);
  }
}


 loadOtherData(){
  try { 
    this.modelSvc.isCash=true;

    let elementCode='';
      elementCode= FixedIDs.orgType.Branch.toString();
      elementCode+= ','+FixedIDs.orgType.Office.toString();
      elementCode+= ','+FixedIDs.orgType.Unit.toString(); 
    const orgID=GlobalConstants.userInfo.companyID.toString();
     
    forkJoin(
      [
        this.orgService.getOrgStructure(elementCode,orgID),
        this.coreAccService.getProject(GlobalConstants.userInfo.companyID),
        this.coreAccService.getCOAStructure(),
        this.coreAccService.getSubLedgerDetail(),
        this.coreAccService.getFinancialYear(),
        this.coreAccService.getVoucherEntryEditPeriod(GlobalConstants.userInfo.companyID,null,null),
        this.coreAccService.getVoucherNotification()
      ]
     ).subscribe({
         next: (res: any) => {
          this.modelSvc.prepareOrgList(res[0]);     
          this.modelSvc.projectList = res[1] || [];   
          
          //Coa Struct Start  
          this.modelSvc.coaStructureList=res[2] || [];
          if(this.modelSvc.creditReceiptVoucherModel.orgID )
          {
            this.modelSvc.filterCOAStructure(this.modelSvc.creditReceiptVoucherModel,this.modelSvc.creditReceiptVoucherModel.orgID,null,this.cashNatureTransactionCode);
          }    
          else{
            this.modelSvc.filterCOAStructure(this.modelSvc.creditReceiptVoucherModel,null,null,this.cashNatureTransactionCode);  
          }
          
          //END


         this.modelSvc.subLedgerDetailList=res[3] || [];   

         if(this.voucherModel){
          this.modelSvc.isSingleCashEditMode=true;
          this.loadVoucherToEdit();
        } 
          //last
          //get Voucher Entry Edit Period and finalcial year start
          this.modelSvc.financialYearAll=res[4].length?res[4]:[];
          this.modelSvc.validityVoucherEntryEdit=res[5].length?res[5]:[];

           setTimeout(() => {                
             this.modelSvc.setMinDateMaxDate();
             this.modelSvc.setMinMaxDateBasedOnComapnyProjectOrg();
            }, 10);     
            //END

            if(res[6].length){              
              this.modelSvc.setVoucherNotificationConfig(res[6]);
            }
         },
         error: (res: any) => {
           this.showErrorMsg(res);
         },
       });
      
  } catch (error) {
    this.showErrorMsg(error);
  }
 }

loadVoucherToEdit(){
  try {    
        if(this.voucherModel.id){
          this.modelSvc.isEdit=true;
          if(!this.voucherModel.isMultiEntry && this.voucherModel.voucherTitleCd==FixedIDs.voucherTitleCd.creditVoucherCash.code){  
          this.modelSvc.tempVoucherModel= JSON.stringify(GlobalMethods.deepClone(this.voucherModel));
          this.setDataModel(this.voucherModel);
        }
      }
      
  } catch (error) {
    this.showErrorMsg(error);
  }
 }

 setDataModel(data){
  try {
    this.modelSvc.prepareDataForEdit(data);

    setTimeout(()=>{
      this.getLedgerBalance('from',this.modelSvc.creditReceiptVoucherModel,this.modelSvc.creditReceiptVoucherModel.fromCOAStructID,this.modelSvc.creditReceiptVoucherModel.companyID,null,this.modelSvc.creditReceiptVoucherModel.orgID,this.modelSvc.creditReceiptVoucherModel.projectID);
      this.getLedgerBalance('to',this.modelSvc.creditReceiptVoucherModel,this.modelSvc.creditReceiptVoucherModel.toCOAStructID,this.modelSvc.creditReceiptVoucherModel.companyID,null,this.modelSvc.creditReceiptVoucherModel.orgID,this.modelSvc.creditReceiptVoucherModel.projectID);
      this.getLedgerBalance('to',this.modelSvc.creditReceiptVoucherModel,this.modelSvc.creditReceiptVoucherModel.toCOAStructID,this.modelSvc.creditReceiptVoucherModel.companyID,this.modelSvc.creditReceiptVoucherModel.toSubLedgerDetailID,this.modelSvc.creditReceiptVoucherModel.orgID,this.modelSvc.creditReceiptVoucherModel.projectID);
    },0);

    this.modelSvc.filterCOAStructure(this.modelSvc.creditReceiptVoucherModel,this.modelSvc.creditReceiptVoucherModel.orgID,this.modelSvc.creditReceiptVoucherModel.projectID,this.cashNatureTransactionCode);    
    this.modelSvc.filterSubLedgerDetail(this.modelSvc.creditReceiptVoucherModel);
  } catch (error) {
    this.showErrorMsg(error);
  }
 }
 onSelectProject(item) {
  try {     
    this.modelSvc.filterCOAStructure(this.modelSvc.creditReceiptVoucherModel,this.modelSvc.creditReceiptVoucherModel.orgID,this.modelSvc.creditReceiptVoucherModel.projectID,this.cashNatureTransactionCode);
   
    let fromCoaList=this.modelSvc.getFromCoaStructureByOrgAndProject(item);
    let toCoaList=this.modelSvc.getToCoaStructureByOrgAndProject(item);

    if(!fromCoaList.length || !toCoaList.length){
       if(this.singleVoucherCashForm)
         this.markFormAsPristine(this.singleVoucherCashForm);
   
       
       
       if(!fromCoaList.length && !toCoaList.length)
        this.showMsg("2270");
 
      if(!fromCoaList.length && toCoaList.length)
        this.showMsg("2268");

      if(fromCoaList.length && !toCoaList.length)
        this.showMsg("2269");
    }
    setTimeout(() => {
      item.fromCoaStructBalance=0;
      item.fromSubLedgerDetailID=null;
      item.fromSubLedgerTypeID=null;
      item.fromSubLedgerBalance=0;
      item.fromCOAStructID=null;

      item.toAccountBalance=0;
      item.toSubLedgerTypeID=null;
      item.toSubledgerBalance=0;
      item.toSubLedgerDetailID=null;
      item.toCOAStructID=null;

      item.voucherAttachmentList=[];
    }, 0);
  } catch (error) {
    this.showErrorMsg(error);
  }
}
 getLedgerBalance(type:any,voucherModel:any,cOAStructureID: number, companyID: number, subLedgerDetailID?: number, orgID?: number, projectID?: number) {
  try {      
    this.coreAccService
      .getLedgerBalance(cOAStructureID,companyID,subLedgerDetailID,orgID,projectID)
      .subscribe({
        next: (res: any) => {
          const balance = res || [];    
          //get sub-ledger balance
          if(type=='from'){            
            if(cOAStructureID && subLedgerDetailID){
              voucherModel.fromSubLedgerBalance=balance.length?balance[0].balance:0;  
            }else{
              voucherModel.fromCoaStructBalance=balance.length?balance[0].balance:0;  
            }
          }else{
              if(cOAStructureID && subLedgerDetailID){
                voucherModel.toSubledgerBalance=balance.length?balance[0].balance:0;  
              }else{
                voucherModel.toAccountBalance=balance.length?balance[0].balance:0;  
              }
          }
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
      });
  } catch (e) {
    this.showErrorMsg(e);
  }
}

onSelectOrg(item) {
  try {   
    item.voucherItemList=[];
      if(item.orgID) {
        this.modelSvc.filterCOAStructure(this.modelSvc.creditReceiptVoucherModel,this.modelSvc.creditReceiptVoucherModel.orgID,this.modelSvc.creditReceiptVoucherModel.projectID,this.cashNatureTransactionCode);
    
        let fromCoaList=this.modelSvc.getFromCoaStructureByOrgAndProject(item);
        let toCoaList=this.modelSvc.getToCoaStructureByOrgAndProject(item);
       
        if(!fromCoaList.length || !toCoaList.length){
        
        this.modelSvc.creditReceiptVoucherModel.creditVal=null;
        this.modelSvc.creditReceiptVoucherModel.debitVal=null;
        this.modelSvc.creditReceiptVoucherModel.description=null;
        this.modelSvc.creditReceiptVoucherModel.invoiceBillRefNo=null;
        this.modelSvc.creditReceiptVoucherModel.budget=null;
        this.modelSvc.creditReceiptVoucherModel.transactionID=null;
        this.modelSvc.creditReceiptVoucherModel.chequeNo=null;
        this.modelSvc.creditReceiptVoucherModel.chequeDate=null;
        this.modelSvc.creditReceiptVoucherModel.clearedOnDate=null;
        this.modelSvc.creditReceiptVoucherModel.remarks=null;

        

        if(this.singleVoucherCashForm)
          this.markFormAsPristine(this.singleVoucherCashForm);

        if(!fromCoaList.length && !toCoaList.length)
          this.showMsg("2270");
   
        if(!fromCoaList.length && toCoaList.length)
          this.showMsg("2268");

        if(fromCoaList.length && !toCoaList.length)
          this.showMsg("2269");
      }else{
        this.modelSvc.creditReceiptVoucherModel.fromCOAStructID=null;
        this.modelSvc.creditReceiptVoucherModel.fromCoaStructBalance=null;
        this.modelSvc.creditReceiptVoucherModel.toCOAStructID=null;
        this.modelSvc.creditReceiptVoucherModel.toSubLedgerDetailID=null;
        this.modelSvc.creditReceiptVoucherModel.toSubLedgerTypeID=null;
        this.modelSvc.creditReceiptVoucherModel.toSubledgerBalance=null;
        this.modelSvc.creditReceiptVoucherModel.toAccountBalance=null;
      }
    }else{
      this.modelSvc.creditReceiptVoucherModel.fromCOAStructID=null;
        this.modelSvc.creditReceiptVoucherModel.fromCoaStructBalance=null;
        this.modelSvc.creditReceiptVoucherModel.toCOAStructID=null;
        this.modelSvc.creditReceiptVoucherModel.toSubLedgerDetailID=null;
        this.modelSvc.creditReceiptVoucherModel.toSubLedgerTypeID=null;
        this.modelSvc.creditReceiptVoucherModel.toSubledgerBalance=null;
        this.modelSvc.creditReceiptVoucherModel.toAccountBalance=null;
        
        this.modelSvc.filterCOAStructure(this.modelSvc.creditReceiptVoucherModel,this.modelSvc.creditReceiptVoucherModel.orgID,this.modelSvc.creditReceiptVoucherModel.projectID,this.cashNatureTransactionCode);
    }
    
    if(this.modelSvc.isBranchModuleActive)
      this.isInValidBranch= this.modelSvc.creditReceiptVoucherModel.orgID?false:true;
  } catch (error) {
    this.showErrorMsg(error);
  }
}

markFormAsPristine(form: NgForm): void {
  Object.keys(form.controls).forEach(controlName => {
    const control = form.controls[controlName];
    control.markAsPristine();
    control.markAsUntouched();
  });
}

markFormAsDirty(form: NgForm): void {
  Object.keys(form.controls).forEach(controlName => {
    const control = form.controls[controlName];
    control.markAsDirty();
  });
}


private getFileUploadOption() {
  this.fileUploadOption = new FileUploadOption();
  this.fileUploadOption.folderName = Config.imageFolders.voucher;
  this.fileUploadOption.uploadServiceUrl = "File/UploadFiles";
  this.fileUploadOption.fileTick = GlobalMethods.timeTick();
  this.fileUploadOption.acceptedFiles =
    ".png,.jpg,.jpeg,.gif,.pdf,.doc,.docx,.xlsx";
  this.fileUploadOption.isMultipleUpload = true;
  this.fileUploadOption.isMultipleSelection = true;
}

onFormResetFormSingle() {
  try {
    this.isSubmitted=false;     
     
      if(this.modelSvc.tempVoucherModel){
        let data=JSON.parse(this.modelSvc.tempVoucherModel);
      if (data.id) {
        this.setDataModel(data);
        setTimeout(()=>{
          this.modelSvc.singleVoucherCashForm.markAsPristine();
      },20);
      }    
      }else{
        this.modelSvc.resetFormSingleCash();
        this.modelSvc.filterCOAStructure(this.modelSvc.creditReceiptVoucherModel,this.modelSvc.creditReceiptVoucherModel.orgID,this.modelSvc.creditReceiptVoucherModel.projectID,this.cashNatureTransactionCode); 
        this.formResetByDefaultValue(this.modelSvc.singleVoucherCashForm, this.modelSvc.creditReceiptVoucherModel);
        setTimeout(()=>{
          this.modelSvc.creditReceiptVoucherModel.company = GlobalConstants.userInfo.company;
          this.modelSvc.creditReceiptVoucherModel.companyID = GlobalConstants.userInfo.companyID;
          this.modelSvc.creditReceiptVoucherModel.voucherDate = new Date();
          this.modelSvc.setSingleORG();
        },5);
      }
      setTimeout(()=>{
        this.modelSvc.setVoucherNotificationConfig(this.modelSvc.voucherNotificationData);
      },5);  
      
  } catch (error) {
    this.showErrorMsg(error);
  }
}


singleSaveCash(singleVoucherCashForm: NgForm) {
  try {
    if (!singleVoucherCashForm.valid) {
      this.directive.validateAllFormFields(
        singleVoucherCashForm.form as UntypedFormGroup
      );

      const objBrnchPjctInValid = this.modelSvc.hasValidBranchProject();
    if (objBrnchPjctInValid) {  
      this.isInValidBranch=true;
      this.showMsg('2281');  
    }
      return;
    }

    if (!this.modelSvc.checkValidityOfToAccountSubLedger()) {
      this.showMsg("2243");
      return;
    }

    if (!this.modelSvc.checkValidityOfNoSubLedgerButSameFromAndToAccount()) {
      this.showMsg("2244");
      return;
    }

    this.modelSvc.prepareDataForSingleEntry();
   
    this.checkEntryValidityToSave();
  } catch (error) {
    this.showErrorMsg(error);
  }
} 

checkEntryValidityToSave() {
  try {
    const objBrnchPjctInValid = this.modelSvc.hasValidBranchProject();
    if (objBrnchPjctInValid) {  
      this.isInValidBranch=true;
      this.showMsg('2281');
      return;
    }else{
      this.isInValidBranch=false;
    }

    const objValidity = this.modelSvc.checkEntryEditValidity();
    if (objValidity.isInvalid) {
      this.showMsg(objValidity.message);
      return;
    }
    this.finalSave();    
  } catch (error) {
    this.showErrorMsg(error);
  }
}

finalSave() {
  try {
    
    let messageCode = this.messageCode.saveCode;
    this.isSubmitted = true;
    this.modelSvc.setTempVoucher(this.modelSvc.creditReceiptVoucherModel);

    this.dataSvc.save(this.modelSvc.creditReceiptVoucherModel).subscribe({
      next: (res: any) => {
        this.showMsg(messageCode);
        this.modelSvc.prepareDataAfterSave(res.body);
       
        if(this.singleVoucherCashForm)
        this.markFormAsPristine(this.singleVoucherCashForm);

        // this.modelSvc.tempVoucherModel=null;
        // this.modelSvc.isEdit=false;
        if(this.modelSvc.sendSMS){
          this.modelSvc.prepareAndSendSMS();
        }
        this.modelSvc.isSingleCashEditMode=false;
        this.dataEmitToParent.emit(null);
      },
      error: (res: any) => {
        this.showErrorMsg(res);
        this.isSubmitted = false;
      },
      complete: () => {},
    });
  } catch (error) {
    this.showErrorMsg(error);
  }
}

addNew() {
  this.modelSvc.tempVoucherModel=null;
  this.modelSvc.initiate();
  this.modelSvc.setSingleORG();
  this.modelSvc.creditReceiptVoucherModel.isMultiEntry=this.modelSvc.isMultiEntry;
  this.isSubmitted = false;
  this.modelSvc.isEdit=false;
  this.modelSvc.filterCOAStructure(this.modelSvc.creditReceiptVoucherModel,this.modelSvc.creditReceiptVoucherModel.orgID,this.modelSvc.creditReceiptVoucherModel.projectID,this.cashNatureTransactionCode)
  this.modelSvc.sendSMS=false;
  this.dataEmitToParent.emit({changeTitle:true});
  setTimeout(()=>{   
      this.modelSvc.singleVoucherCashForm.markAsPristine();
  },0);

  //this.dataEmitToParent.emit(null);
  setTimeout(()=>{
    this.modelSvc.setVoucherNotificationConfig(this.modelSvc.voucherNotificationData);
  },1);  
}



fileUploadSingleEntryModal() {
  try {
    const modalConfig = new ModalConfig();
    modalConfig.header = this.fieldTitle["fileupload"];
    modalConfig.closable = false;

    modalConfig.data = {
      uploadOption: this.fileUploadOption,
      targetObjectList: this.modelSvc.creditReceiptVoucherModel
        .voucherAttachmentList,
    };

    this.ref = this.dialogSvc.open(FileUploadComponent, modalConfig);

    this.ref.onClose.subscribe((data: any) => {
      if (data) {
        this.modelSvc.singleVoucherCashForm.markAsDirty();
      }
    });
  } catch (e) {
    this.showErrorMsg(e);
  }
}


onCreditFieldChange(entity: any) {
  try {
    this.modelSvc.onCreditFieldChange(entity);
  } catch (error) {
    this.showErrorMsg(error);
  }
}

onSelectFromAccountSubLedger(entity: any) {
  try {
    setTimeout(() => {
      if (this.modelSvc.checkSubLedgerFromAccount(entity)) {
        this.showMsg("2242");
      }

      if (this.modelSvc.checkValidityForDuplicateMultiEntryCash()) {
        entity.fromSubLedgerDetailID = null;
        this.showMsg("2248");
        return;
      }

      if(entity.fromCOAStructID && entity.fromSubLedgerDetailID)
        {
        this.coreAccService.getLedgerBalance(entity.fromCOAStructID,entity.companyID,entity.fromSubLedgerDetailID,this.modelSvc.creditReceiptVoucherModel.orgID,this.modelSvc.creditReceiptVoucherModel.projectID).subscribe({
          next: (res: any) => {
            const ToAccountSubLedgerBalance = res || [];    
            this.modelSvc.setSubLedgerFromAccount(entity,ToAccountSubLedgerBalance.length?ToAccountSubLedgerBalance[0].balance:0);
          },
          error: (res: any) => {
            this.showErrorMsg(res);
          },
        });        
      }else{
        this.modelSvc.setSubLedgerFromAccount(entity,0);
      }
      
    }, 0);
  } catch (error) {
    this.showErrorMsg(error);
  }
}

onSelectToAccountSubLedger(entity) {
  try {
    setTimeout(() => {
      if (this.modelSvc.checkSubLedgerToAccount(entity)) {
        this.showMsg("2242");
      }

      if (this.modelSvc.checkValidityForDuplicateMultiEntryCash()) {
        entity.toSubLedgerDetailID = null;
        this.showMsg("2248");
        return;
      }
      if(entity.toCOAStructID && entity.toSubLedgerDetailID)
        {
        this.coreAccService.getLedgerBalance(entity.toCOAStructID,entity.companyID,entity.toSubLedgerDetailID,this.modelSvc.creditReceiptVoucherModel.orgID,this.modelSvc.creditReceiptVoucherModel.projectID).subscribe({
          next: (res: any) => {
            const ToAccountSubLedgerBalance = res || [];    
            this.modelSvc.setSubLedgerToAccount(entity,ToAccountSubLedgerBalance.length?ToAccountSubLedgerBalance[0].balance:0);
          },
          error: (res: any) => {
            this.showErrorMsg(res);
          },
        });        
      }else{
        this.modelSvc.setSubLedgerToAccount(entity,0);
      }
    }, 0);
  } catch (error) {
    this.showErrorMsg(error);
  }
}

onSelectFromAccount(item) {
  try {
    if(item.fromCOAStructID){
   this.coreAccService.getLedgerBalance(item.fromCOAStructID||0,this.modelSvc.creditReceiptVoucherModel.companyID,null,this.modelSvc.creditReceiptVoucherModel.orgID,this.modelSvc.creditReceiptVoucherModel.projectID).subscribe({
      next: (res: any) => {
        const fromAccountBalance = res || []; 
        this.modelSvc.onSelectFromAccount(item,fromAccountBalance.length?fromAccountBalance[0].balance:0);
        item.fromSubLedgerBalance=0;
      },
      error: (res: any) => {
        this.showErrorMsg(res);
      },
    });
  }else{
    this.modelSvc.onSelectFromAccount(item,0);
        item.fromSubLedgerBalance=0;
  }
  } catch (error) {
    this.showErrorMsg(error);
  }
}

onSelectToAccount(item) {
  try {   
    item.toSubLedgerTypeID=this.modelSvc.creditReceiptVoucherModel.toCoaStructureList.find(x=>x.id==item.toCOAStructID)?.subLedgerTypeID;
    this.modelSvc.filterSubLedgerDetail(item);
    if(item.toCOAStructID){
    this.coreAccService.getLedgerBalance(item.toCOAStructID||0,this.modelSvc.creditReceiptVoucherModel.companyID,null,this.modelSvc.creditReceiptVoucherModel.orgID,this.modelSvc.creditReceiptVoucherModel.projectID)
      .subscribe({
        next: (res: any) => {
          const toAccountBalance = res || []; 
          this.modelSvc.onSelectToAccount(item,toAccountBalance.length?toAccountBalance[0].balance:0);
          item.toSubledgerBalance=0;
          item.toSubLedgerDetailID=null;
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
      });
    }else{
      this.modelSvc.onSelectToAccount(item,0);
      item.toSubledgerBalance=0;
      item.toSubLedgerDetailID=null;
    }
  } catch (error) {
    this.showErrorMsg(error);
  }
}

onSelectToPrject(item){
 try {
  this.coreAccService
  .getCOAStructure(item.orgID, item.projectID)
  .subscribe({
    next: (res: any) => {
      this.modelSvc.coaStructureList = res || [];   
      this.modelSvc.resetSingleVoucherItem(item);      
    },
    error: (res: any) => {
      this.showErrorMsg(res);
    },
  });
 } catch (error) {
  this.showErrorMsg(error);
 }
}

onSelectTransactionMode(entity){
  try {
    this.modelSvc.setTransactionNoList(entity);
  } catch (error) {
    this.showErrorMsg(error);
  }
}
onSelectTransactionNo(entity){
  try {
    this.modelSvc.setTransactionInfo(entity);
  } catch (error) {
    this.showErrorMsg(error);
  }
}

//Print
printVoucher(voucherID:number) {
  try {
    this.coreAccService.printVoucher(FixedIDs.voucherType.CreditVoucher.code, voucherID);
  } catch (e) {
    throw e;
  }
}



}