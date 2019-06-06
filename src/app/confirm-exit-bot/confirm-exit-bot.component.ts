import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ElectronService } from 'ngx-electron';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from './../services/common-service';
import { ApiManager } from './../services/api-manager';
import { TaskHandlerService } from '../services/task-handler.service';
@Component({
  selector: 'app-confirm-exit-bot',
  templateUrl: './confirm-exit-bot.component.html',
  styleUrls: ['./confirm-exit-bot.component.css']
})
export class ConfirmExitBotComponent implements OnInit {
  private subscriber;
  @Output() saveEvent = new EventEmitter<any>();

  public message = 'Are you sure you want to exit from your Rocket Aio?';
  constructor(   private _electronService: ElectronService,
    public commonService: CommonService,
    private apiManager: ApiManager,
    private taskHandlerService: TaskHandlerService,
    private modalService: NgbModal,
    public activeModal: NgbActiveModal) { }

  ngOnInit() {
    this.subscriber = this.commonService.listen('header').subscribe((message: any) => {
      if (message['channel'] === 'task-home' && message['module'] === 'removeTask') {
      
        if (message['callback'] === 'powerOffCallback') {
          this.powerOffCallback();
        }
      
      }
    });
  }
  ngOnDestroy() {
    this.subscriber.unsubscribe();
  }
  public exit() {
    this.activeModal.dismiss('Save Click');
     if (this.commonService.activated) {
      this.stopAndRemoveAllTasks('powerOffCallback');
    } else {
      this.powerOffCallback();
    }
  }
  public notExit() {
    this.activeModal.dismiss('Cancel Click');
  }
 
  private powerOffCallback() {
    this._electronService.ipcRenderer.send('close-me');
  }
  private stopAndRemoveAllTasks(successCallback) {
    // const _taskIdList: any = this.taskHandlerService.getTaskIdList();

    // if (_taskIdList && _taskIdList.length) {
    //   this.commonService.filter('taskHome', {
    //     'channel': 'header',
    //     'module': 'removeTask',
    //     'taskIdList': _taskIdList,
    //     'successCallback': successCallback,
    //     'failureCallback': 'failureCallback'
    //   });
    // } else {
     
       if (successCallback === 'powerOffCallback') {
        this.powerOffCallback();
      // }
    }
  }
}



// WEBPACK FOOTER //
// ./src/app/confirm-exit-bot/confirm-exit-bot.component.ts