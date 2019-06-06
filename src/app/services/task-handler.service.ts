import { Injectable } from '@angular/core';

import { Task } from './../model/task';

@Injectable()
export class TaskHandlerService {

  private taskList: Array<Task> = new Array<Task>();

  constructor() { }

  public getTaskList() {
    return this.taskList;
  }

  public setTaskList(taskList) {
    this.taskList = JSON.parse(JSON.stringify(taskList));
  }

  public getTaskIdList() {
    let _taskIdList: any = [];
    for (let i = 0; i < this.taskList.length; i++) {
      _taskIdList.push(this.taskList[i].taskId);
    }
    return JSON.parse(JSON.stringify(_taskIdList));
  }

  public getTaskWithId(taskID) {
    for (let i = 0; i < this.taskList.length; i++) {
      if (this.taskList[i].taskId === taskID) {
        return this.taskList[i];
      }
    }
    return undefined;
  }

  public getIndexWithTaskID(taskID) {
    for (let i = 0; i < this.taskList.length; i++) {
      if (this.taskList[i].taskId === taskID) {
        return i;
      }
    }
    return undefined;
  }

  private addTask(task: Task) {
    this.taskList.push(task);
  }

  public addMultipleTasks(_taskList: Task[]) {
    for (let _i = 0; _i < _taskList.length; _i++) {
      this.addTask(_taskList[_i]);
    }
  }

  public removeTask(taskID) {
    for (let i = 0; i < this.taskList.length; i++) {
      if (this.taskList[i].taskId === taskID) {
        this.taskList.splice(i, 1);
        return taskID;
      }
    }
    return undefined;
  }

  public updateTask(taskID, taskValue) {
    for (let i = 0; i < this.taskList.length; i++) {
      if (this.taskList[i].taskId === taskID) {
        this.taskList[i] = taskValue;
        break;
      }
    }
    return taskID;
  }

  public updateTaskStateGeneric(taskID, taskValue) {
    for (let i = 0; i < this.taskList.length; i++) {
      if (this.taskList[i].taskId === taskID) {
        this.taskList[i]['taskActiveState'] = taskValue;
        break;
      }
    }
    return taskID;
  }

}



// WEBPACK FOOTER //
// ./src/app/services/task-handler.service.ts