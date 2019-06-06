import { Component, OnInit , Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonService } from './../services/common-service';
import { ApiManager } from './../services/api-manager';
import { TaskHandlerService } from '../services/task-handler.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-confirm-deactivate-bot',
  templateUrl: './confirm-deactivate-bot.component.html',
  styleUrls: ['./confirm-deactivate-bot.component.css']
})
export class ConfirmDeactivateBotComponent implements OnInit, OnDestroy {
  
  public message = 'Are you sure you want to deactivate your Rocket Aio? This will delete all of your data and it cannot be recovered.';
  
  @Output() saveEvent = new EventEmitter<any>();
  private subscriber;
  constructor(  public commonService: CommonService,
    private apiManager: ApiManager,
    private taskHandlerService: TaskHandlerService,
    public activeModal: NgbActiveModal) {}
  
  ngOnInit() {
    this.subscriber = this.commonService.listen('header').subscribe((message: any) => {
      if (message['channel'] === 'task-home' && message['module'] === 'removeTask') {
        if (message['callback'] === 'deactivateCallback') {
          this.deactivateCallback();
        } 
      }
    });
  }
  ngOnDestroy() {
    this.subscriber.unsubscribe();
  }
  public deactivate() {
    this.activeModal.dismiss('Save Click');
    this.stopAndRemoveAllTasks('deactivateCallback');
  }
  public notDeactivate() {
    this.activeModal.dismiss('Cancel Click');
  }
  public cancel() {
    this.activeModal.dismiss('Cancel Click');
  }
  private deactivateCallback() {
    this.commonService.hideCaptchaWindow();
    this.apiManager.fetchData(
      'nodeServer',
      'deleteLicense',
      {},
      ApiManager.requestName.POST,
      {},
      (res) => {
        console.log('API_CALL_SUCCESS: LICENSE_DEACTIVATION_SUCCESS');
        if (res.deactivateSuccess) {
          this.apiManager.fetchData(
            'nodeServer',
            'resetState',
            {},
            ApiManager.requestName.GET,
            undefined,
            (res) => {
              console.log('API_CALL_FAILURE: RESET_APP_DATA_SUCCESS');
              this.commonService.productKey = '';
              this.commonService.firstName = '';
              this.commonService.lastName = '';
              this.commonService.activated = false;
              this.commonService.isSplashDataLoaded = false;
            },
            (error) => {
              console.log('API_CALL_FAILURE: LICENSE_DEACTIVATED_BUT_FAILED_TO_RESET_APP_DATA');
              this.commonService.productKey = '';
              this.commonService.firstName = '';
              this.commonService.lastName = '';
              this.commonService.activated = false;
              this.commonService.isSplashDataLoaded = false;
              return error;
            }
          );
        } else {
          console.log('UNEXPECTED_ERROR_OCCURED');
        }
      }, (error) => {
        console.log('API_CALL_FAILURE: LICENSE_DEACTIVATION_FAILURE');
        return error;
      }
    );
  }
  private stopAndRemoveAllTasks(successCallback) {
    const _taskIdList: any = this.taskHandlerService.getTaskIdList();

    if (_taskIdList && _taskIdList.length) {
      this.commonService.filter('taskHome', {
        'channel': 'header',
        'module': 'removeTask',
        'taskIdList': _taskIdList,
        'successCallback': successCallback,
        'failureCallback': 'failureCallback'
      });
    } else {
      if (successCallback === 'deactivateCallback') {
        this.deactivateCallback();
      } 
    }
  }
}



// WEBPACK FOOTER //
// ./src/app/confirm-deactivate-bot/confirm-deactivate-bot.component.ts