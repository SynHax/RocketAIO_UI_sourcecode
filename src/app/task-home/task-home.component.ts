import { Component, OnInit, NgZone, ChangeDetectorRef, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { TaskHandlerService } from './../services/task-handler.service';
import { ApiManager } from './../services/api-manager';
import { ProfileHandlerService } from '../services/profile-handler.service';
import { CommonService } from '../services/common-service';
import { CommunicationService } from '../services/communication-service';
import { NotificationManagerService } from './../services/notification-manager.service';
import { LookupManagerService } from '../services/lookup-manager.service';

import { Task } from '../model/task';
import { Scheduler } from './../model/scheduler';
import { Notification } from './../model/notification';

import { TaskSchedulerComponent } from '../task-scheduler/task-scheduler.component';
import { MassUrlChangerComponent } from './../mass-url-changer/mass-url-changer.component';
import { MassKeywordChangerComponent } from './../mass-keyword-changer/mass-keyword-changer.component';
import { MassPasswordChangerComponent } from './../mass-password-changer/mass-password-changer.component';
@Component({
  selector: 'app-task-home',
  templateUrl: './task-home.component.html',
  styleUrls: ['./task-home.component.css']
})

export class TaskHomeComponent implements OnInit, OnDestroy {

  private messageSubscriber;
  private subscriber;

  public taskList = new Array();
  private regTypeSelectedOption: String = '1';
  private reg: String = '1';
  private editTaskForm: FormGroup;
  private scheduleAt: Scheduler = new Scheduler();
  private taskListHandler = new Array<boolean>();
  public selectedHandler = new Array<boolean>();
  private selectedItemsCount = 0;
  public allSelected = false;

  public storeList = new Array();
  public monitorModes = new Array();
  public sizeList = new Array();
  public categoryList = new Array();
  public profileList = new Array();
  public checkoutModeList = new Array();
  public statusList = new Array();
  public helpTextMessages = {};
  public input_value_product;
  public hasSubmitted = false;
  public notification: Notification = new Notification();
  private isBapeUs : String = '0';

  constructor(
    public router: Router,
    private _ngZone: NgZone,
    private cds: ChangeDetectorRef,
    private fb: FormBuilder,
    private taskHandlerService: TaskHandlerService,
    private profileHandlerService: ProfileHandlerService,
    private apiManager: ApiManager,
    private commonService: CommonService,
    private commService: CommunicationService,
    private notificationManagerService: NotificationManagerService,
    private lookupManager: LookupManagerService,
    private modalService: NgbModal
  ) { }

  ngOnInit() {
    this.fetchTaskList();
    this.fetchProfileList();
    this.initLabels();
    this.initStatusList();
    this.initScreenModifiers();
    this.messageSubscriber = this.commService.messages.subscribe(msg => {
      if (msg['room'] === 'task') {
        this.updateCurrentTaskStatus(msg['data']);
      }
    });
    this.subscriber = this.commonService.listen('taskHome').subscribe((message: any) => {
      if (message['channel'] === 'header' && message['module'] === 'removeTask' && message['taskIdList']) {
        this.removeTask(
          message['taskIdList'],
          () => {
            this.commonService.filter('header', {
              'channel': 'task-home',
              'module': 'removeTask',
              'callback': message['successCallback']
            });
          }, (data) => {
            this.commonService.filter('header', {
              'channel': 'task-home',
              'module': 'removeTask',
              'message': data['message'],
              'callback': message['failureCallback']
            });
          }
        );
      }
    });
  }

  ngOnDestroy() {
  }

  private fetchTaskList() {
    this.taskList = this.taskHandlerService.getTaskList();
  }

  private fetchProfileList() {
    this.profileList = JSON.parse(JSON.stringify(this.profileHandlerService.fetchProfileForLookups()));
  }

  private initLabels() {
    this.storeList = this.lookupManager.getStoreList();
    const lookups = this.lookupManager.getLookupData();
    this.monitorModes = lookups['monitorModes'];
    this.checkoutModeList = lookups['checkoutModeList'];
    this.sizeList = lookups['sizeList'];
    this.categoryList = lookups['Supreme']['categoryList'];
    this.helpTextMessages = lookups['helpTextMessages'];
  }

  private initStatusList() {
    const statusCodes = this.lookupManager.getStatusCodes();
    this.statusList = statusCodes['status'];
  }

  private initScreenModifiers() {
    this.allSelected = false;
    this.taskListHandler = new Array<boolean>(this.taskList.length);
    this.selectedHandler = new Array<boolean>(this.taskList.length);
    for (let i = 0; i < this.taskListHandler.length; i++) {
      this.taskListHandler[i] = false;
      this.selectedHandler[i] = false;
    }
  }

  private updateCurrentTaskStatus(_taskRoomMessage) {
    if (_taskRoomMessage.split(',').length === 3) {
      const taskId = _taskRoomMessage.split(',')[2];
      const taskIndex = this.taskHandlerService.getIndexWithTaskID(taskId);
      if (this.taskList[taskIndex] && _taskRoomMessage.split(',')[1]) {
        this.taskList[taskIndex].productName = _taskRoomMessage.split(',')[1];
      }
    }
    else if(_taskRoomMessage.split(',').length === 4)
    {
      const taskId = _taskRoomMessage.split(',')[3];
      const taskIndex = this.taskHandlerService.getIndexWithTaskID(taskId);
      if (this.taskList[taskIndex] && _taskRoomMessage.split(',')[2]) {
        this.taskList[taskIndex].size = _taskRoomMessage.split(',')[2];
      }
    }
    else {
      const taskId = _taskRoomMessage.split(',')[1];
      const taskIndex = this.taskHandlerService.getIndexWithTaskID(taskId);
      if (taskIndex != null || taskIndex != undefined) {
        const message = _taskRoomMessage.split(',')[0];
        if (this.taskList[taskIndex] && this.taskList[taskIndex].status && parseInt(message, 10) >= 0) {
          this.taskList[taskIndex].status = message;
        } else {
          this.taskList[taskIndex].taskActiveState = message.match(/false/) ? false : true;
        }
      }
    }
    this.cds.markForCheck();
  }

  public storeNameUpdated(caller) {
    if (caller.target.value === 'supreme-us' || caller.target.value === 'supreme-uk') {
      this.regTypeSelectedOption = '2';
      this.reg = '1';
      this.editTaskForm.controls['monitorMode'].setValue(this.monitorModes[1]['shortCode']);
    } else {
      this.regTypeSelectedOption = '1';
      this.reg = '1';
      if (caller.target.value === 'Custom-Shopify') {
        this.reg = '2';
        this.editTaskForm.controls['monitorMode'].setValue(this.monitorModes[1]['shortCode']);
      } else {
        this.isBapeUs = '0';
        if (caller.target.value === 'Bape US ' || caller.target.value === 'BapeShop') {
          this.isBapeUs = '1';
        }
      }
    }
  }
  public getStatusMessageWithCode(statusCode: any) {
    for (let _i = 0; _i < this.statusList.length; _i++) {
      if (this.statusList[_i]['statusCode'] === statusCode) {
        return this.statusList[_i]['statusMessage'];
      }
    }
    return '';
  }

  public getStatusMessageClassWithCode(statusCode: any) {
    for (let _i = 0; _i < this.statusList.length; _i++) {
      if (this.statusList[_i]['statusCode'] === statusCode) {
        return this.statusList[_i]['statusClass'];
      }
    }
    return '';
  }

  public getSizeLongCode(sizeShortCode: any) {
       for (let _i = 0; _i < this.sizeList.length; _i++) {
      if ( this.sizeList[_i].shortCode === sizeShortCode) {
        return this.sizeList[_i].longCode;
      }
    }
    return 'SIZE LOAD ERROR';
  }

  public getStoreNameLongCode(storeNameCode: any) {
    for (let _i = 0; _i < this.storeList.length; _i++) {
      if (this.storeList[_i].shortCode === storeNameCode) {
        return this.storeList[_i].longCode;
      }
    }
    return 'STORE NAME LOAD ERROR';
  }

  public fetchProfileWithId(profileId) {
    const _profile = this.profileHandlerService.getProfileWithId(profileId);
    const _profileName = _profile ? _profile['profileName'] : undefined;
    return _profileName || 'PROFILE NOT FOUND';
  }

  public removeMultiple() {
    let taskIdList = new Array();
    for (let _i = 0; _i < this.taskList.length; _i++) {
      if (this.selectedHandler[_i]) {
        taskIdList.push(this.taskList[_i].taskId);
      }
    }
    this.removeTask(taskIdList);
  }

  public removeTask(taskIdList, successCallback?, failureCallback?) {
    if (taskIdList.length) {
      let queryParams: Map<string, string> = new Map();
      queryParams.set('filterType', 'stopMultiple');
      this.updateTaskState(queryParams, taskIdList, (_taskIdList) => {
        this.apiManager.fetchData(
          'nodeServer',
          'removeTask',
          { 'Content-Type': 'application/json' },
          ApiManager.requestName.POST,
          { 'taskIdList': _taskIdList },
          (res) => {
            for (const _taskId of _taskIdList) {
              this.commService.sendMessage({ 'room': 'unlockTask', 'msg': _taskId });
            }
            if (res.length) {
              console.log('ERROR: FAILED_TO_STOP_TASK(S)');
              this.notificationManagerService.notificationGenerator({ id: undefined, mode: 'local', message: 'Error Occurred while trying to remove Task(s).', dismissible: false, type: 'danger' }, this.notificationManagerService.getNotificationTimeOut());
              for (let i = 0; i < res.length; i++) {
                for (let j = _taskIdList.length; j >= 0; j--) {
                  if (_taskIdList[i] === res[j]) {
                    _taskIdList.splice(j, 1);
                    break;
                  }
                }
              }
            }
            for (let _i = 0; _i < _taskIdList.length; _i++) {
              this.taskHandlerService.removeTask(_taskIdList[_i]);
              this.commService.sendMessage({ 'room': 'remove', 'msg': _taskIdList[_i] });
            }
            this.initScreenModifiers();
            this.getSelectedItemsCount();
            if (!res.length && successCallback) {
              successCallback();
            } else if (res.length && failureCallback) {
              failureCallback({
                'message': 'ERROR: FAILED_TO_STOP_TASK(S)'
              });
            }
          },
          (error) => {
            console.log('API_CALL_FAILURE: UNABLE_TO_REMOVE_TASK(S)');
            this.notificationManagerService.notificationGenerator({ id: undefined, mode: 'local', message: 'Unable to remove Task.', dismissible: false, type: 'danger' }, this.notificationManagerService.getNotificationTimeOut());
            for (const _taskId of _taskIdList) {
              this.commService.sendMessage({ 'room': 'unlockTask', 'msg': _taskId });
            }
            if (failureCallback) {
              failureCallback({
                'message': 'API_CALL_FAILURE: UNABLE_TO_REMOVE_TASK(S)'
              });
            }
            return error;
          }
        );
      }, (error) => {
        console.log('ERROR: FAILED_TO_STOP_TASK(S)');
        for (const taskId of taskIdList) {
          this.commService.sendMessage({ 'room': 'unlockTask', 'msg': taskId });
        }
        if (failureCallback) {
          failureCallback({
            'message': 'ERROR: FAILED_TO_STOP_TASK(S)'
          });
        }
        return error;
      });
    } else {
      console.log('ERROR: NO_TASK_SELECTED');
      this.notificationManagerService.notificationGenerator({ id: undefined, mode: 'local', message: 'Please select a task to remove.', dismissible: false, type: 'warning' }, this.notificationManagerService.getNotificationTimeOut());
      if (successCallback) {
        successCallback();
      }
    }
  }

  public editTask(taskId, collapsibleIdKey) {
    for (const item in this.taskListHandler) {
    if (this.taskListHandler[item]) {
    this.taskListHandler[item] = false;
    }
    }
    let queryParams: Map<string, string> = new Map();
    queryParams.set('filterType', 'stopMultiple');
    this.updateTaskState(queryParams, [taskId], (_taskIdList) => {
    this.apiManager.fetchData(
    'nodeServer',
    'getTaskSize',
    { 'Content-Type': 'application/json' },
    ApiManager.requestName.POST,
    {'taskId': taskId},
    (res) => {
    var localTask = this.taskHandlerService.getTaskWithId(taskId);
    localTask.size = res.size;
    this.initEditForm(localTask);
    this.taskListHandler[collapsibleIdKey] = !this.taskListHandler[collapsibleIdKey];
    },
    (error) => {
    console.log('API_CALL_FAILURE: UNABLE_TO_UPDATE_TASK');
    }
    );
    }, (error) => {
    console.log('ERROR: FAILED_TO_EDIT_TASK');
    this.commService.sendMessage({ 'room': 'unlockTask', 'msg': taskId });
    return error;
    });
    }

  private initEditForm(task) {
    if (task['storeName'] === 'supreme-us'||task['storeName'] === 'supreme-uk') {
      this.regTypeSelectedOption = '2';
    }
    if (task['storeName'] === 'Custom-Shopify') {
      this.reg = '2';
    }
    if (task['storeName'] === 'Bape US ' || task['storeName'] === 'BapeShop') {
      this.isBapeUs = '1';
    }
    this.editTaskForm = this.fb.group({
      'storeName': [task['storeName'] || '', Validators.compose([Validators.required])],
      'monitorMode': [task['monitorMode'] || '', Validators.compose([Validators.required])],
      'checkoutMode': [task['checkoutMode'] || '', Validators.compose([Validators.required])],
      'maxPrice': task['maxPrice'],
      'isAccountLogin': task['isAccountLogin'] || false,
      'username': task['username'] || '',
      'password': task['password'] || '',
      'sitePassword': task['sitePassword'] || '',
      'monitorInput': [task['monitorInput'] || '', Validators.compose([Validators.required])],
      'taskSpecificProxy': task['taskSpecificProxy'] || '',
      'size': [task['size'] || 'xxl', Validators.compose([Validators.required])],
      'quantity': [task['quantity'] || 1, Validators.compose([Validators.required])],
      'profile': [task['profile'] || '', Validators.compose([Validators.required])],
      'secondaryProduct': task['secondaryProduct'] || '',
      'isNewProduct': task['isNewProduct'] || false,
      'isCaptcha': task['isCaptcha'] || false,
      'isSitePassword': task['isSitePassword'] || false,
      'isRandomColor': task['isRandomColor'] || false,
      'category': task['category'] || '',
      'color': task['color'] || ''
    });
  }

  public getPlaceholderForMonitorInput() {
    if (this.editTaskForm.controls['monitorMode'].value === 'keywords') {
      return 'Keywords';
    } else if (this.editTaskForm.controls['monitorMode'].value === 'variant') {
      return 'Variant ID';
    } else if (this.editTaskForm.controls['monitorMode'].value === 'url') {
      return 'Product URL';
    } else {
      return '';
    }
  }

  public getPatternMonitorInput() {
    if (this.editTaskForm.controls['monitorMode'].value === 'keywords') {
   return '[+-]{1}[A-Za-z0-9/\\$@!~#%^&*():\'".?]*([,]{1}[+-]{1}[A-Za-z0-9/\\$@:!~#%^&*()\'".?]*)*'
    } else if (this.editTaskForm.controls['monitorMode'].value === 'variant') {
      return '[0-9]*';
    } else {
      return '.*';
    }
  }

  public updateCredentialValidators() {
    if (this.editTaskForm.controls['isAccountLogin'].value) {
      this.editTaskForm.controls['username'].setValidators(Validators.compose([Validators.required]));
      this.editTaskForm.controls['password'].setValidators(Validators.compose([Validators.required]));
    } else {
      this.editTaskForm.controls['username'].clearValidators();
      this.editTaskForm.controls['password'].clearValidators();
    }
    this.editTaskForm.controls['username'].updateValueAndValidity();
    this.editTaskForm.controls['password'].updateValueAndValidity();
  }
  public updatePasswordValidators() {
    if (this.editTaskForm.controls['isSitePassword'].value) {
      this.editTaskForm.controls['sitePassword'].setValidators(Validators.compose([Validators.required]));
    } else {
      this.editTaskForm.controls['sitePassword'].clearValidators();
    }
    this.editTaskForm.controls['sitePassword'].updateValueAndValidity();
  }

  public updateCheckoutValidators() {
    if (this.editTaskForm.value['storeName'] !== 'supreme-us'||this.editTaskForm.value['storeName'] !== 'supreme-uk') {
      if (this.editTaskForm.controls['checkoutMode'].value === 'Advance') {
        this.editTaskForm.controls['secondaryProduct'].setValidators(Validators.compose([Validators.required]));
      } else {
        this.editTaskForm.controls['secondaryProduct'].clearValidators();
      }
    }
    this.editTaskForm.controls['secondaryProduct'].updateValueAndValidity();
  }

  public updateCatValidators() {
    if (this.editTaskForm['storeName'] === 'supreme-us'||this.editTaskForm['storeName'] === 'supreme-uk') {
      this.editTaskForm.controls['category'].setValidators(Validators.compose([Validators.required]));
      this.editTaskForm.controls['secondaryProduct'].clearValidators();
    } else {
      this.editTaskForm.controls['category'].clearValidators();
    }
    this.editTaskForm.controls['category'].updateValueAndValidity();
    this.editTaskForm.controls['secondaryProduct'].updateValueAndValidity();
  }

  public updateColorValidators() {
    if (this.editTaskForm.value['storeName'] === 'supreme-us'|| this.editTaskForm.value['storeName'] === 'supreme-uk' 
        ||this.editTaskForm.value['storeName'] === 'Bape US ' || this.editTaskForm.value['storeName'] === 'BapeShop') {
      this.editTaskForm.controls['color'].setValidators(Validators.compose([Validators.required]));
      this.editTaskForm.controls['secondaryProduct'].clearValidators();
    } else {
      this.editTaskForm.controls['color'].clearValidators();
      this.editTaskForm.controls['isRandomColor'].clearValidators();
    }
    this.editTaskForm.controls['color'].updateValueAndValidity();
    this.editTaskForm.controls['isRandomColor'].updateValueAndValidity();
    this.editTaskForm.controls['secondaryProduct'].updateValueAndValidity();
  }

  public updateRandomColorValidators() {
    if (this.editTaskForm.value['storeName'] === 'supreme-us'|| this.editTaskForm.value['storeName'] === 'supreme-uk' 
        ||this.editTaskForm.value['storeName'] === 'Bape US ' || this.editTaskForm.value['storeName'] === 'BapeShop') {
      this.editTaskForm.controls['secondaryProduct'].clearValidators();
    if (this.editTaskForm.value['isRandomColor'] === true ) {
      this.editTaskForm.controls['isRandomColor'].setValidators(Validators.compose([Validators.required]));
      this.editTaskForm.controls['color'].clearValidators();
    } else if (this.editTaskForm.value['isRandomColor'] === false ) {
      this.editTaskForm.controls['isRandomColor'].setValidators(Validators.compose([Validators.required]));
      this.editTaskForm.controls['color'].setValidators(Validators.compose([Validators.required]));
    }
  }
    this.editTaskForm.controls['color'].updateValueAndValidity();
    this.editTaskForm.controls['isRandomColor'].updateValueAndValidity();
    this.editTaskForm.controls['secondaryProduct'].updateValueAndValidity();
  }

  public hasAccountLogin() {
    return (this.editTaskForm.controls['isAccountLogin'].value);
  }
  public isSitePassword() {
    return (this.editTaskForm.controls['isSitePassword'].value);
  }
  public isAdvancedMode() {
    return (this.editTaskForm.controls['checkoutMode'].value === 'Advance') ? true : false;
  }

  public isPickRandomColor() {
    return (this.editTaskForm.controls['isRandomColor'].value);
  }

  public actionUpdate(taskId) {
    let queryParams: Map<string, string> = new Map();
    queryParams.set('filterType', 'taskID');
    this.updateTaskState(queryParams, [taskId], () => {
      this.commService.sendMessage({ 'room': 'unlockTask', 'msg': taskId });
    }, (error) => {
      console.log('ERROR: FAILED_TO_STOP_TASK');
      this.notificationManagerService.notificationGenerator({ id: undefined, mode: 'local', message: 'Error Occurred while trying to toggle selected Task.', dismissible: false, type: 'danger' }, this.notificationManagerService.getNotificationTimeOut());
      this.commService.sendMessage({ 'room': 'unlockTask', 'msg': taskId });
      return error;
    });
  }

  public startMultiple() {
    let queryParams: Map<any, any> = new Map();
    queryParams.set('filterType', 'startMultiple');
    let taskIdList = new Array();
    for (let i = 0; i < this.taskList.length; i++) {
      if (this.selectedHandler[i]) {
        taskIdList.push(this.taskList[i].taskId);
      }
    }
    if (taskIdList.length) {
      this.updateTaskState(queryParams, taskIdList, (_taskIdList) => {
        for (const _taskId of _taskIdList) {
          this.commService.sendMessage({ 'room': 'unlockTask', 'msg': _taskId });
        }
      }, (error) => {
        console.log('ERROR: FAILED_TO_START_TASK');
        this.notificationManagerService.notificationGenerator({ id: undefined, mode: 'local', message: 'Error Occurred while trying to start selected Task(s).', dismissible: false, type: 'danger' }, this.notificationManagerService.getNotificationTimeOut());
        for (const _taskId of taskIdList) {
          this.commService.sendMessage({ 'room': 'unlockTask', 'msg': _taskId });
        }
        return error;
      });
    } else {
      console.log('ERROR: NO_TASK_SELECTED');
      this.notificationManagerService.notificationGenerator({ id: undefined, mode: 'local', message: 'Please select a task to start.', dismissible: false, type: 'warning' }, this.notificationManagerService.getNotificationTimeOut());
    }
  }

  public stopMultiple() {
    let queryParams: Map<any, any> = new Map();
    queryParams.set('filterType', 'stopMultiple');
    let taskIdList = new Array();
    for (let i = 0; i < this.taskList.length; i++) {
      if (this.selectedHandler[i]) {
        taskIdList.push(this.taskList[i].taskId);
      }
    }
    if (taskIdList.length) {
      this.updateTaskState(queryParams, taskIdList, (_taskIdList) => {
        for (const _taskId of _taskIdList) {
          this.commService.sendMessage({ 'room': 'unlockTask', 'msg': _taskId });
        }
      }, (error) => {
        console.log('ERROR: FAILED_TO_STOP_TASK');
        this.notificationManagerService.notificationGenerator({ id: undefined, mode: 'local', message: 'Error Occurred while trying to stop selected Task(s).', dismissible: false, type: 'danger' }, this.notificationManagerService.getNotificationTimeOut());
        for (const _taskId of taskIdList) {
          this.commService.sendMessage({ 'room': 'unlockTask', 'msg': _taskId });
        }
        return error;
      });
    } else {
      console.log('ERROR: NO_TASK_SELECTED');
      this.notificationManagerService.notificationGenerator({ id: undefined, mode: 'local', message: 'Please select a task to stop.', dismissible: false, type: 'warning' }, this.notificationManagerService.getNotificationTimeOut());
    }
  }

  private stopAll(callback) {
    let queryParams: Map<any, any> = new Map();
    queryParams.set('filterType', 'stopMultiple');
    const taskIdList = this.taskHandlerService.getTaskIdList();
    if (taskIdList.length) {
      this.updateTaskState(queryParams, taskIdList, (_taskIdList) => {
        for (const _taskId of _taskIdList) {
          this.commService.sendMessage({ 'room': 'unlockTask', 'msg': _taskId });
        }
        if (_taskIdList && _taskIdList.length === taskIdList.length) {
          // Everything worked fine
          callback(true);
        } else {
          // error - Task(s) failed to stop
          callback(false);
        }
      }, (error) => {
        console.log('ERROR: FAILED_TO_STOP_TASK(S)');
        for (const _taskId of taskIdList) {
          this.commService.sendMessage({ 'room': 'unlockTask', 'msg': _taskId });
        }
        callback(false);
      });
    } else {
      console.log('ERROR: NO_TASK_SELECTED');
      // No Task is there to stop
      callback(false);
    }
  }

  private updateTaskState(queryParams, taskIdList: Array<any>, successCallback?, failureCallback?) {
    let _taskIdList = JSON.parse(JSON.stringify(taskIdList));
    this.apiManager.fetchData(
      'nodeServer',
      'updateTaskState',
      { 'Content-Type': 'application/json' },
      ApiManager.requestName.POST,
      _taskIdList,
      (res) => {
        if (res && res.length) {
          console.log('ERROR: FAILED_TO_START_OR_STOP_TASK(S)');
          this.notificationManagerService.notificationGenerator({ id: undefined, mode: 'local', message: 'Error Occurred while trying to start/stop Task(s).', dismissible: false, type: 'danger' }, this.notificationManagerService.getNotificationTimeOut());
          for (let i = 0; i < res.length; i++) {
            this.commService.sendMessage({ 'room': 'unlockTask', 'msg': res[i] });
            for (let j = 0; j < _taskIdList.length; j++) {
              if (_taskIdList[j] === res[i]) {
                _taskIdList.splice(j, 1);
                break;
              }
            }
          }
        }
        if (_taskIdList && _taskIdList.length) {
          let taskStateValue = false;
          if (queryParams.get('filterType') === 'taskID') {
            taskStateValue = !this.taskHandlerService.getTaskWithId(_taskIdList[0])['taskActiveState'];
          } else if (queryParams.get('filterType') === 'startMultiple') {
            taskStateValue = true;
          }
          for (const _taskId of _taskIdList) {
            this.taskHandlerService.updateTaskStateGeneric(_taskId, taskStateValue);
          }
        }
        this.initScreenModifiers();
        this.getSelectedItemsCount();
        if (successCallback) {
          successCallback(_taskIdList);
        }
      },
      (error) => {
        console.log('ERROR: FAILED_TO_STOP_TASK');
        if (failureCallback) {
          failureCallback(error);
        }
        return error;
      },
      queryParams
    );
  }

  public toggleSelection(event: any) {
    for (const keyIndex in this.selectedHandler) {
      this.selectedHandler[keyIndex] = event.target.checked;
    }
    this.allSelected = !this.allSelected;
  }
  public AllStart() {
    let queryParams: Map<any, any> = new Map();
    queryParams.set('filterType', 'startMultiple');
    let taskIdList = new Array();
    for (let i = 0; i < this.taskList.length; i++) {
        taskIdList.push(this.taskList[i].taskId);
    }
    if (taskIdList.length) {
      this.updateTaskState(queryParams, taskIdList, (_taskIdList) => {
        for (const _taskId of _taskIdList) {
          this.commService.sendMessage({ 'room': 'unlockTask', 'msg': _taskId });
        }
      }, (error) => {
        console.log('ERROR: FAILED_TO_START_TASK');
        this.notificationManagerService.notificationGenerator({ id: undefined, mode: 'local', message: 'Error Occurred while trying to start selected Task(s).', dismissible: false, type: 'danger' }, this.notificationManagerService.getNotificationTimeOut());
        for (const _taskId of taskIdList) {
          this.commService.sendMessage({ 'room': 'unlockTask', 'msg': _taskId });
        }
        return error;
      });
    }
  }
  public AllStop(event: any) {
    let queryParams: Map<any, any> = new Map();
    queryParams.set('filterType', 'stopMultiple');
    let taskIdList = new Array();
    for (let i = 0; i < this.taskList.length; i++) {
        taskIdList.push(this.taskList[i].taskId);
    }
    if (taskIdList.length) {
      this.updateTaskState(queryParams, taskIdList, (_taskIdList) => {
        for (const _taskId of _taskIdList) {
          this.commService.sendMessage({ 'room': 'unlockTask', 'msg': _taskId });
        }
      }, (error) => {
        console.log('ERROR: FAILED_TO_STOP_TASK');
        this.notificationManagerService.notificationGenerator({ id: undefined, mode: 'local', message: 'Error Occurred while trying to stop selected Task(s).', dismissible: false, type: 'danger' }, this.notificationManagerService.getNotificationTimeOut());
        for (const _taskId of taskIdList) {
          this.commService.sendMessage({ 'room': 'unlockTask', 'msg': _taskId });
        }
        return error;
      });
    }
  }

  public toggleAllSelected() {
    let allChecked = true;
    for (const keyIndex in this.selectedHandler) {
      if (this.selectedHandler[keyIndex] === false) {
        allChecked = false;
        break;
      }
    }
    this.allSelected = allChecked;
  }

  public getSelectedItemsCount() {
    this.selectedItemsCount = 0;
    for (const keyIndex in this.selectedHandler) {
      if (this.selectedHandler[keyIndex]) {
        this.selectedItemsCount++;
      }
    }
    if (this.selectedItemsCount > 0) {
      this.notification.mode = 'local';
      this.notification.message = this.selectedItemsCount + ' of ' + this.selectedHandler.length + ' selected';
      this.notification.dismissible = false;
      this.notification.type = 'info';
      this.notification.id = this.notificationManagerService.notificationGenerator(this.notification);
    } else {
      if (this.notification.id !== undefined) {
        this.notificationManagerService.popNotification(this.notification);
        this.notification = new Notification();
      }
    }
    return this.selectedItemsCount;
  }

  public closeEditModeFor(collapsibleIdKey, _taskId) {
    this.commService.sendMessage({ 'room': 'unlockTask', 'msg': _taskId });
    this.taskListHandler[collapsibleIdKey] = false;
  }

  public updateTask(index, taskId) {
    if (this.editTaskForm.invalid || this.getStatusOfPrimaryUrlEqualsSecondaryUrl()) {
      console.log('ERROR: TASK_DATA_IS_INVALID');
      this.hasSubmitted = true;
      if(this.editTaskForm.controls['storeName'].invalid) {
        this.notificationManagerService.notificationGenerator({ id: undefined, mode: 'local', message: this.helpTextMessages['empty-store-name-message'] || '', dismissible: false, type: 'warning' }, this.notificationManagerService.getNotificationTimeOut());
      } 
      if(this.editTaskForm.controls['maxPrice'].value != '' && this.editTaskForm.controls['maxPrice'].invalid){
        this.notificationManagerService.notificationGenerator({ id: undefined, mode: 'local', message: this.helpTextMessages['maxPrice-error-message'] || '', dismissible: false, type: 'warning' }, this.notificationManagerService.getNotificationTimeOut());
      }
      if(this.editTaskForm.controls['monitorInput'].invalid) {
        if(this.editTaskForm.controls['monitorMode'].value === 'keywords') {
          this.notificationManagerService.notificationGenerator({ id: undefined, mode: 'local', message: this.helpTextMessages['monitor-input-error-keyword-message'] || '', dismissible: false, type: 'warning' }, this.notificationManagerService.getNotificationTimeOut());
        }
        else if(this.editTaskForm.controls['monitorMode'].value === 'variant') {
          this.notificationManagerService.notificationGenerator({ id: undefined, mode: 'local', message: this.helpTextMessages['monitor-input-error-variant-message'] || '', dismissible: false, type: 'warning' }, this.notificationManagerService.getNotificationTimeOut());
        }
        else if(this.editTaskForm.controls['monitorMode'].value === 'url') { 
          this.notificationManagerService.notificationGenerator({ id: undefined, mode: 'local', message: this.helpTextMessages['monitor-input-error-url-message'] || '', dismissible: false, type: 'warning' }, this.notificationManagerService.getNotificationTimeOut());
        }
        else {
          this.notificationManagerService.notificationGenerator({ id: undefined, mode: 'local', message: this.helpTextMessages['invalid-form-error-message'], dismissible: false, type: 'warning' }, this.notificationManagerService.getNotificationTimeOut());
        }
      }
      if(this.editTaskForm.controls['profile'].invalid) {
        this.notificationManagerService.notificationGenerator({ id: undefined, mode: 'local', message: this.helpTextMessages['profile-error-message'] || '', dismissible: false, type: 'warning' }, this.notificationManagerService.getNotificationTimeOut());
      }
      if(this.editTaskForm.controls['isAccountLogin'].valid) {
        if(this.editTaskForm.controls['username'].invalid) {
          this.notificationManagerService.notificationGenerator({ id: undefined, mode: 'local', message: this.helpTextMessages['username-error-message'] || '', dismissible: false, type: 'warning' }, this.notificationManagerService.getNotificationTimeOut());
        }
        else if(this.editTaskForm.controls['password'].invalid) {
          this.notificationManagerService.notificationGenerator({ id: undefined, mode: 'local', message: this.helpTextMessages['password-error-message'] || '', dismissible: false, type: 'warning' }, this.notificationManagerService.getNotificationTimeOut());
        }
      }
      if(this.editTaskForm.controls['checkoutMode'].value === 'Advance') {
        if(this.editTaskForm.controls['secondaryProduct'].invalid) {
          this.notificationManagerService.notificationGenerator({ id: undefined, mode: 'local', message: this.helpTextMessages['secondaryProductUrl-error-message'], dismissible: false, type: 'warning' }, this.notificationManagerService.getNotificationTimeOut());
        }
        else if(this.getStatusOfPrimaryUrlEqualsSecondaryUrl()) {
          this.notificationManagerService.notificationGenerator({ id: undefined, mode: 'local', message: this.helpTextMessages['secondary-primary-equal-error-message'], dismissible: false, type: 'warning' }, this.notificationManagerService.getNotificationTimeOut());
        }
      }
      if(this.editTaskForm.controls['isSitePassword'].valid) {
        if(this.editTaskForm.controls['sitePassword'].invalid) {
          this.notificationManagerService.notificationGenerator({ id: undefined, mode: 'local', message: this.helpTextMessages['sitePassword-error-message'], dismissible: false, type: 'warning' }, this.notificationManagerService.getNotificationTimeOut());
        }
      }
      if (this.editTaskForm.value['storeName'] === 'supreme-us'|| this.editTaskForm.value['storeName'] === 'supreme-uk' 
        ||this.editTaskForm.value['storeName'] === 'Bape US ' || this.editTaskForm.value['storeName'] === 'BapeShop') {
          if(!this.isPickRandomColor()) {
            this.notificationManagerService.notificationGenerator({ id: undefined, mode: 'local', message: this.helpTextMessages['color-error-message'], dismissible: false, type: 'warning' }, this.notificationManagerService.getNotificationTimeOut());
          }
      }
    } else {
      if (this.editTaskForm.value.taskSpecificProxy) {
        if (this.editTaskForm.value.taskSpecificProxy.indexOf('http') === -1) {
          this.editTaskForm.value.taskSpecificProxy = this.getFormattedProxy(this.editTaskForm.value.taskSpecificProxy);
        }
      }
      let task: Task = this.editTaskForm.value as any as Task;
      task.taskId = taskId;
      let res = this.editTaskForm.value.monitorInput.split('/');
      if(res.length === 1){
        task.productName = this.editTaskForm.value.monitorInput;
      }
      else{
        task.productName = res[res.length - 1];
      }
      task['scheduleAt'] = this.scheduleAt;
      task['tasksCount'] = 1;
      this._updateTask(index, task);
    }
  }

  public getStatusOfPrimaryUrlEqualsSecondaryUrl() {
    if(this.editTaskForm.controls['checkoutMode'].value === 'Advance') {
      return (this.editTaskForm.controls['monitorInput'].value === this.editTaskForm.controls['secondaryProduct'].value);
    }
  }

  private _updateTask(index, task) {
    this.apiManager.fetchData(
      'nodeServer',
      'editTask',
      { 'Content-Type': 'application/json' },
      ApiManager.requestName.POST,
      task,
      (res) => {
        console.log('API_CALL_SUCCESS: TASK_UPDATE_SUCCESS');
        this.closeEditModeFor(index, res.taskId);
        this.scheduleAt = new Scheduler();
        this.taskHandlerService.updateTask(res.taskId, res);
      },
      (error) => {
        console.log('API_CALL_FAILURE: UNABLE_TO_UPDATE_TASK');
        this.notificationManagerService.notificationGenerator({ id: undefined, mode: 'local', message: 'Error Occured while trying to update task.', dismissible: false, type: 'warning' }, this.notificationManagerService.getNotificationTimeOut());
        return error;
      }
    );
  }

  public exportTasks() {
    let _this = this;
    let _taskList = new Array();
    for (let _i = 0; _i < this.selectedHandler.length; _i++) {
      if (this.selectedHandler[_i]) {
        let _task = JSON.parse(JSON.stringify(this.taskList[_i]));
        delete _task['taskId'];
        delete _task['productName'];
        delete _task['status'];
        delete _task['taskActiveState'];
        _taskList.push(_task);
      }
    }
    if (_taskList.length) {
      this.commonService.saveFile(JSON.stringify(_taskList), this.modalService, () => {
        _this.initScreenModifiers();
        _this.getSelectedItemsCount();
      });
    } else {
      this.notificationManagerService.notificationGenerator({ id: undefined, mode: 'local', message: 'No Task selected for Export.', dismissible: false, type: 'warning' }, this.notificationManagerService.getNotificationTimeOut());
    }
  }

  public loadTasks() {
    let that = this;
    this.commonService.openFile(async function (data) {
      data = JSON.parse(data);
      for (let _i = 0; _i < data.length; _i++) {
        that._ngZone.run(() => {
          that.saveTask(data[_i]);
        });
      }
    }, that.modalService);
  }

  public duplicateTask(taskId) {
    let _task = JSON.parse(JSON.stringify(this.taskHandlerService.getTaskWithId(taskId)));
    delete _task['taskId'];
    // delete _task['productName'];
    delete _task['status'];
    delete _task['taskActiveState'];
    _task['tasksCount'] = 1;
    this.saveTask(_task);
  }

  private saveTask(task) {
    this.apiManager.fetchData(
      'nodeServer',
      'addTask',
      { 'Content-Type': 'application/json' },
      ApiManager.requestName.POST,
      task,
      (res) => {
        this.taskHandlerService.addMultipleTasks(res);
        for (const _task of res) {
          this.taskListHandler.push(false);
          this.selectedHandler.push(false);
          this.commService.sendMessage({ 'room': 'room', 'msg': _task.taskId });
        }
        this.initScreenModifiers();
      },
      (error) => {
        console.log('API_CALL_FAILURE: UNABLE_TO_ADD_TASK');
        this.notificationManagerService.notificationGenerator({ id: undefined, mode: 'local', message: 'Failed to Add Task.', dismissible: false, type: 'danger' }, this.notificationManagerService.getNotificationTimeOut());
        return error;
      }
    );
  }

  public openScheduler(index: any) {
    const modalRef = this.modalService.open(TaskSchedulerComponent, {
      backdrop: 'static',
      backdropClass: 'modal-backdrop--custom light-gray-backdrop',
      centered: true,
      keyboard: false,
      windowClass: 'modal-window--custom'
    });
    modalRef.componentInstance.scheduledAt = this.taskList[index].scheduleAt;
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

  public openMUC() {
    const modalRef = this.modalService.open(MassUrlChangerComponent, {
      backdrop: 'static',
      backdropClass: 'modal-backdrop--custom light-gray-backdrop',
      centered: true,
      keyboard: false,
      windowClass: 'modal-window--custom'
    });
    modalRef.componentInstance.saveEvent.subscribe(($e) => {
      console.log($e.mucInput);
      this.stopAll((hasAllStopped) => {
        if (hasAllStopped) {
          for (let _index = 0; _index < this.taskList.length; _index++) {
            this.taskList[_index].monitorMode = 'url';
            this.taskList[_index].monitorInput = $e.mucInput;
            this._updateTask(_index, this.taskList[_index]);
          }
        }
      });
    });
  }

  public openMKC() {
    const modalRef = this.modalService.open(MassKeywordChangerComponent, {
      backdrop: 'static',
      backdropClass: 'modal-backdrop--custom light-gray-backdrop',
      centered: true,
      keyboard: false,
      windowClass: 'modal-window--custom'
    });
    modalRef.componentInstance.saveEvent.subscribe(($e) => {
      this.stopAll((hasAllStopped) => {
        if (hasAllStopped) {
          for (let _index = 0; _index < this.taskList.length; _index++) {
            this.taskList[_index].monitorMode = 'keywords';
            this.taskList[_index].monitorInput = $e.mkcInput;
            this._updateTask(_index, this.taskList[_index]);
          }
        }
      });
    });
  }
  public openMPC() {
    const modalRef = this.modalService.open(MassPasswordChangerComponent, {
      backdrop: 'static',
      backdropClass: 'modal-backdrop--custom light-gray-backdrop',
      centered: true,
      keyboard: false,
      windowClass: 'modal-window--custom'
    });
    modalRef.componentInstance.saveEvent.subscribe(($e) => {
      console.log($e.mpcInput);
      this.stopAll((hasAllStopped) => {
        if (hasAllStopped) {
          for (let _index = 0; _index < this.taskList.length; _index++) {
            this.taskList[_index].isSitePassword = true;
            this.taskList[_index].sitePassword = $e.mpcInput;
            this._updateTask(_index, this.taskList[_index]);
          }
        }
      });
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
      switch (proxyArray.length) {
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
// ./src/app/task-home/task-home.component.ts