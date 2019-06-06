import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ApiManager } from './../services/api-manager';
import { TaskHandlerService } from './../services/task-handler.service';
import { ProfileHandlerService } from './../services/profile-handler.service';
import { NotificationManagerService } from './../services/notification-manager.service';
import { LookupManagerService } from '../services/lookup-manager.service';
import { CommunicationService } from '../services/communication-service';

import { Task } from './../model/task';
import { Scheduler } from './../model/scheduler';

import { TaskSchedulerComponent } from './../task-scheduler/task-scheduler.component';

@Component({
  selector: 'app-add-task',
  templateUrl: './add-task.component.html',
  styleUrls: ['./add-task.component.css']
})

export class AddTaskComponent implements OnInit {

  public addTaskForm: FormGroup;
  private scheduleAt: Scheduler = new Scheduler();
  private regTypeSelectedOption: String = '1';
  private reg: String = '1';
  public profileList = new Array();
  public storeList = new Array();
  public monitorModes = new Array();
  public sizeList = new Array();
  public checkoutModeList = new Array();
  public categoryList = new Array();
  public helpTextMessages = {};
  public isLoginDisabled = true;
  public input_value_product;
  public hasSubmitted = false;
  private isBapeUs : String = '0';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private modalService: NgbModal,
    private taskHandlerService: TaskHandlerService,
    private profileHandlerService: ProfileHandlerService,
    private apiManager: ApiManager,
    private notificationManagerService: NotificationManagerService,
    private lookupManager: LookupManagerService,
    private commService: CommunicationService
  ) { }

  ngOnInit() {
    this.initLabels();
    this.initForm();

    let task = new Task();
    if (
      this.monitorModes && this.monitorModes[0] &&
      this.monitorModes[0]['shortCode']
    ) {
      task.monitorMode = this.monitorModes[0]['shortCode'];
    }
    if (
      this.checkoutModeList && this.checkoutModeList[0] &&
      this.checkoutModeList[0]['shortCode']
    ) {
      task.checkoutMode = this.checkoutModeList[0]['shortCode'];
    }
    if (
      this.sizeList && this.sizeList[0] &&
      this.sizeList[0]['shortCode']
    ) {
      task.size = this.sizeList[0]['shortCode'];
    }
    if (
      this.categoryList && this.categoryList[0] &&
      this.categoryList[0]['shortCode']
    ) {
      task.category = this.categoryList[0]['shortCode'];
    }

    this.updateForm(task);
  }

  private initLabels() {
    this.profileList = JSON.parse(JSON.stringify(this.profileHandlerService.fetchProfileForLookups()));
    this.storeList = this.lookupManager.getStoreList();
    const _lookups = this.lookupManager.getLookupData();
    this.monitorModes = _lookups['monitorModes'];
    this.checkoutModeList = _lookups['checkoutModeList'];
    this.sizeList = _lookups['sizeList'];
    this.categoryList = _lookups['Supreme']['categoryList'];
    this.helpTextMessages = _lookups['helpTextMessages'];
  }

  private initForm() {
    this.addTaskForm = this.fb.group({
      'storeName': ['', Validators.compose([Validators.required])],
      'monitorMode': ['', Validators.compose([Validators.required])],
      'checkoutMode': ['', Validators.compose([Validators.required])],
      'category': '',
      'maxPrice': '',
      'color': '',
      'isAccountLogin': false,
      'username': '',
      'password': '',
      'sitePassword': '',
      'monitorInput': ['', Validators.compose([Validators.required])],
      'taskSpecificProxy': '',
      'size': ['', Validators.compose([Validators.required])],
      'quantity': [1, Validators.compose([Validators.min(1)])],
      'profile': ['', Validators.compose([Validators.required])],
      'tasksCount': [1, Validators.compose([Validators.min(1)])],
      'secondaryProduct': '',
      'isNewProduct': false,
      'isSitePassword': false,
      'isRandomColor': false,
      'isCaptcha' : false
    });
  }

  private updateForm(task: Task) {
   this.addTaskForm.controls['monitorMode'].setValue(task.monitorMode);
   this.addTaskForm.controls['checkoutMode'].setValue(task.checkoutMode);
   this.addTaskForm.controls['size'].setValue(task.size);
   this.addTaskForm.controls['category'].setValue(task.category);
   this.addTaskForm.controls['color'].setValue(task.color);
  }

  public saveTask() {
    if (this.addTaskForm.invalid || this.getStatusOfPrimaryUrlEqualsSecondaryUrl()) {
      console.log('ERROR: TASK_DATA_IS_INVALID');
      this.hasSubmitted = true;
      if (this.addTaskForm.controls['storeName'].invalid) {
        this.notificationManagerService.notificationGenerator({ id: undefined, mode: 'local', message: this.helpTextMessages['empty-store-name-message'] || '', dismissible: false, type: 'warning' }, this.notificationManagerService.getNotificationTimeOut());
      }
      if (this.addTaskForm.controls['monitorInput'].invalid) {
        if (this.addTaskForm.controls['monitorMode'].value === 'keywords') {
          this.notificationManagerService.notificationGenerator({ id: undefined, mode: 'local', message: this.helpTextMessages['monitor-input-error-keyword-message'] || '', dismissible: false, type: 'warning' }, this.notificationManagerService.getNotificationTimeOut());
        }
        else if (this.addTaskForm.controls['monitorMode'].value === 'variant') {
          this.notificationManagerService.notificationGenerator({ id: undefined, mode: 'local', message: this.helpTextMessages['monitor-input-error-variant-message'] || '', dismissible: false, type: 'warning' }, this.notificationManagerService.getNotificationTimeOut());
        }
        else if (this.addTaskForm.controls['monitorMode'].value === 'url') {
          this.notificationManagerService.notificationGenerator({ id: undefined, mode: 'local', message: this.helpTextMessages['monitor-input-error-url-message'] || '', dismissible: false, type: 'warning' }, this.notificationManagerService.getNotificationTimeOut());
        }
        else {
          this.notificationManagerService.notificationGenerator({ id: undefined, mode: 'local', message: this.helpTextMessages['invalid-form-error-message'], dismissible: false, type: 'warning' }, this.notificationManagerService.getNotificationTimeOut());
        }
      }
      if(this.addTaskForm.controls['profile'].invalid) {
        this.notificationManagerService.notificationGenerator({ id: undefined, mode: 'local', message: this.helpTextMessages['profile-error-message'] || '', dismissible: false, type: 'warning' }, this.notificationManagerService.getNotificationTimeOut());
      }
      if(this.addTaskForm.controls['isAccountLogin'].valid) {
        if(this.addTaskForm.controls['username'].invalid) {
          this.notificationManagerService.notificationGenerator({ id: undefined, mode: 'local', message: this.helpTextMessages['username-error-message'] || '', dismissible: false, type: 'warning' }, this.notificationManagerService.getNotificationTimeOut());
        }
        else if(this.addTaskForm.controls['password'].invalid) {
          this.notificationManagerService.notificationGenerator({ id: undefined, mode: 'local', message: this.helpTextMessages['password-error-message'] || '', dismissible: false, type: 'warning' }, this.notificationManagerService.getNotificationTimeOut());
        }
      }
      if(this.addTaskForm.controls['checkoutMode'].value === 'Advance') {
        if(this.addTaskForm.controls['secondaryProduct'].invalid) {
          this.notificationManagerService.notificationGenerator({ id: undefined, mode: 'local', message: this.helpTextMessages['secondaryProductUrl-error-message'], dismissible: false, type: 'warning' }, this.notificationManagerService.getNotificationTimeOut());
        }
        else if(this.getStatusOfPrimaryUrlEqualsSecondaryUrl()) {
          this.notificationManagerService.notificationGenerator({ id: undefined, mode: 'local', message: this.helpTextMessages['secondary-primary-equal-error-message'], dismissible: false, type: 'warning' }, this.notificationManagerService.getNotificationTimeOut());
        }
      }
      if(this.addTaskForm.controls['isSitePassword'].valid) {
        if(this.addTaskForm.controls['sitePassword'].invalid) {
          this.notificationManagerService.notificationGenerator({ id: undefined, mode: 'local', message: this.helpTextMessages['sitePassword-error-message'], dismissible: false, type: 'warning' }, this.notificationManagerService.getNotificationTimeOut());
       }
      }
      if (this.addTaskForm.value['storeName'] === 'supreme-us'|| this.addTaskForm.value['storeName'] === 'supreme-uk' 
        ||this.addTaskForm.value['storeName'] === 'Bape US ' || this.addTaskForm.value['storeName'] === 'BapeShop') {
          if(!this.isPickRandomColor() && this.addTaskForm.controls['color'].invalid) {
            this.notificationManagerService.notificationGenerator({ id: undefined, mode: 'local', message: this.helpTextMessages['color-error-message'], dismissible: false, type: 'warning' }, this.notificationManagerService.getNotificationTimeOut());
          }
      }
    } else {
      if (this.addTaskForm.value.taskSpecificProxy) {
        this.addTaskForm.value.taskSpecificProxy = this.getFormattedProxy(this.addTaskForm.value.taskSpecificProxy);
      }
      let task: Task = this.addTaskForm.value;
      task.scheduleAt = this.scheduleAt;
      let res = this.addTaskForm.value.monitorInput.split('/');
      if (res.length === 1) {
        task.productName = this.addTaskForm.value.monitorInput;
      }
      else {
        task.productName = res[res.length - 1];
      }
      this.apiManager.fetchData(
        'nodeServer',
        'addTask',
        { 'Content-Type': 'application/json' },
        ApiManager.requestName.POST,
        task,
        (res) => {
          console.log('API_CALL_SUCCESS: TASK_ADDED');
          this.taskHandlerService.addMultipleTasks(res);
          for (const _task of res) {
            this.commService.sendMessage({ 'room': 'room', 'msg': _task.taskId });
          }
          this.router.navigate(['/allTasks']);
        },
        (error) => {
          console.log('API_CALL_FAILURE: UNABLE_TO_ADD_TASK');
          this.notificationManagerService.notificationGenerator({ id: undefined, mode: 'local', message: 'Failed to Add Task.', dismissible: false, type: 'danger' }, this.notificationManagerService.getNotificationTimeOut());
          return error;
        }
      );
    }
  }

  public storeNameUpdated(caller) {
    if (caller.target.value === 'supreme-us' || caller.target.value === 'supreme-uk') {
      this.regTypeSelectedOption = '2';
      this.addTaskForm.controls['monitorMode'].setValue(this.monitorModes[0]['shortCode']);
      this.reg = '1';
    } else {
      this.regTypeSelectedOption = '1';
      this.reg = '1';
      if (caller.target.value === 'Custom-Shopify') {
        this.reg = '2';
        this.addTaskForm.controls['monitorMode'].setValue(this.monitorModes[1]['shortCode']);
      }else{
      this.isBapeUs = '0';
      if (caller.target.value === 'Bape US ' || caller.target.value === 'BapeShop') {
        this.isBapeUs = '1';
      }
    }
    }
  }

  public getPlaceholderForMonitorInput() {
    if (this.addTaskForm.controls['monitorMode'].value === 'keywords') {
      return 'Keywords';
    } else if (this.addTaskForm.controls['monitorMode'].value === 'variant') {
      return 'Variant ID';
    } else if (this.addTaskForm.controls['monitorMode'].value === 'url') {
      return 'Product URL';
    } else {
      return '';
    }
  }

  public getPatternMonitorInput() {
    if (this.addTaskForm.controls['monitorMode'].value === 'keywords') {
     return '[+-]{1}[A-Za-z0-9/\\$@!~#%^&*():\'".?]*([,]{1}[+-]{1}[A-Za-z0-9/\\$@:!~#%^&*()\'".?]*)*'
    } else if (this.addTaskForm.controls['monitorMode'].value === 'variant') {
      return '[0-9]*';
    } else {
      return '.*';
    }
  }

  public getStatusOfPrimaryUrlEqualsSecondaryUrl() {
    if(this.addTaskForm.controls['checkoutMode'].value === 'Advance') {
      return (this.addTaskForm.controls['monitorInput'].value === this.addTaskForm.controls['secondaryProduct'].value);
    }
  }

  public updateCredentialValidators() {
    if (this.addTaskForm.controls['isAccountLogin'].value) {
      this.addTaskForm.controls['username'].setValidators(Validators.compose([Validators.required]));
      this.addTaskForm.controls['password'].setValidators(Validators.compose([Validators.required]));
    } else {
      this.addTaskForm.controls['username'].clearValidators();
      this.addTaskForm.controls['password'].clearValidators();
    }
    this.addTaskForm.controls['username'].updateValueAndValidity();
    this.addTaskForm.controls['password'].updateValueAndValidity();
  }
  public updatePasswordValidators() {
    if (this.addTaskForm.controls['isSitePassword'].value) {
      this.addTaskForm.controls['sitePassword'].setValidators(Validators.compose([Validators.required]));
    } else {
      this.addTaskForm.controls['sitePassword'].clearValidators();
    }
    this.addTaskForm.controls['sitePassword'].updateValueAndValidity();
  }

  public updateCheckoutValidators() {
    if (this.addTaskForm.value['storeName'] !== 'supreme-us' ||this.addTaskForm.value['storeName'] !== 'supreme-uk') {
      if (this.addTaskForm.controls['checkoutMode'].value === 'Advance') {
        this.addTaskForm.controls['secondaryProduct'].setValidators(Validators.compose([Validators.required]));
      } else {
        this.addTaskForm.controls['secondaryProduct'].clearValidators();
      }
    }
    this.addTaskForm.controls['secondaryProduct'].updateValueAndValidity();
  }

  public updateCatValidators() {
    if (this.addTaskForm.value['storeName'] === 'supreme-us'||this.addTaskForm.value['storeName'] === 'supreme-uk') {
      this.addTaskForm.controls['category'].setValidators(Validators.compose([Validators.required]));
      this.addTaskForm.controls['secondaryProduct'].clearValidators();
    } else {
      this.addTaskForm.controls['category'].clearValidators();
    }
    this.addTaskForm.controls['category'].updateValueAndValidity();
    this.addTaskForm.controls['secondaryProduct'].updateValueAndValidity();
  }
  public updateColorValidators() {
    if (this.addTaskForm.value['storeName'] === 'supreme-us'|| this.addTaskForm.value['storeName'] === 'supreme-uk' 
    ||this.addTaskForm.value['storeName'] === 'Bape US ' || this.addTaskForm.value['storeName'] === 'BapeShop') {
      this.addTaskForm.controls['color'].setValidators(Validators.compose([Validators.required]));
      this.addTaskForm.controls['secondaryProduct'].clearValidators();
    } else {
      this.addTaskForm.controls['color'].clearValidators();
      this.addTaskForm.controls['isRandomColor'].clearValidators();
    }
    this.addTaskForm.controls['secondaryProduct'].updateValueAndValidity();
    this.addTaskForm.controls['color'].updateValueAndValidity();
  }
  public updateRandomColorValidators() {
    if (this.addTaskForm.value['storeName'] === 'supreme-us'||this.addTaskForm.value['storeName'] === 'supreme-uk'
    ||this.addTaskForm.value['storeName'] === 'Bape US ' || this.addTaskForm.value['storeName'] === 'BapeShop') {
      if (this.addTaskForm.value['isRandomColor'] === true ) {
        this.addTaskForm.controls['isRandomColor'].setValidators(Validators.compose([Validators.required]));
        this.addTaskForm.controls['color'].clearValidators();
        this.addTaskForm.controls['secondaryProduct'].clearValidators();
      } else if (this.addTaskForm.value['isRandomColor'] === false ) {
        this.addTaskForm.controls['isRandomColor'].setValidators(Validators.compose([Validators.required]));
        this.addTaskForm.controls['color'].setValidators(Validators.compose([Validators.required]));
      }
    }
    this.addTaskForm.controls['secondaryProduct'].updateValueAndValidity();
    this.addTaskForm.controls['color'].updateValueAndValidity();
  }

  public hasAccountLogin() {
    return (this.addTaskForm.controls['isAccountLogin'].value);
  }
  public isAdvancedMode() {
    return (this.addTaskForm.controls['checkoutMode'].value === 'Advance') ? true : false;
  }
  public isSitePassword() {
    return (this.addTaskForm.controls['isSitePassword'].value );
  }

  public isPickRandomColor() {
    return (this.addTaskForm.controls['isRandomColor'].value);
  }

  public openScheduler() {
    const modalRef = this.modalService.open(TaskSchedulerComponent, {
      backdrop: 'static',
      backdropClass: 'modal-backdrop--custom light-gray-backdrop',
      centered: true,
      keyboard: false,
      windowClass: 'modal-window--custom'
    });
    modalRef.componentInstance.scheduledAt = this.scheduleAt;
    modalRef.componentInstance.saveEvent.subscribe(($e) => {
      this.scheduleAt.isSchedulerSet = true;
      this.scheduleAt.date = $e.date;
      this.scheduleAt.time = $e.time;
    });
    modalRef.componentInstance.resetEvent.subscribe(($e) => {
      this.scheduleAt.isSchedulerSet = false;
      this.scheduleAt.date = $e.date;
      this.scheduleAt.time = $e.time;
    });
  }

  public getFormattedProxy(proxy) {
    if (proxy) {
      var proxyArray = proxy.split(':');
      var object = {};
      object['ip'] = proxyArray[0];
      object['port'] = proxyArray[1];
      object['user'] = proxyArray[2];
      object['pass'] = proxyArray[3];
      switch(proxyArray.length){
        case 2:
        return 'http://' + object['ip'] + ':' + object['port'];
        case 4:
        return 'http://' + object['user'] + ':' + object['pass'] + '@' + object['ip'] + ':' + object['port'];
        default:
        return undefined;
      }
    }
    return undefined;
  }
}




// WEBPACK FOOTER //
// ./src/app/add-task/add-task.component.ts