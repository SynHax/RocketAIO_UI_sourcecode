import { Scheduler } from './scheduler';

export class Task {
  taskId: string;
  storeName: string;
  productName: string;
  monitorMode: string;
  username: string;
  password: string;
  checkoutMode: string;
  isAccountLogin: boolean;
  monitorInput: string;
  taskSpecificProxy: string;
  size: string;
  category: string;
  color: string;
  quantity: number;
  profile: string;
  status: string;
  tasksCount: number;
  secondaryProduct: string;
  isNewProduct: boolean;
  isCaptcha: boolean;
  isSitePassword: boolean;
  isRandomColor: boolean;
  sitePassword: string;
  taskActiveState: boolean;
  scheduleAt: Scheduler;
}



// WEBPACK FOOTER //
// ./src/app/model/task.ts