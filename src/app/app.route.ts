import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { TaskHomeComponent } from './task-home/task-home.component';
import { ProfileHomeComponent } from './profile-home/profile-home.component';
import { SettingHomeComponent } from './setting-home/setting-home.component';
import { AddTaskComponent } from './add-task/add-task.component';
import { AddProfileComponent } from './add-profile/add-profile.component';
import { ProxyTesterComponent } from './proxy-tester/proxy-tester.component';
import { SplashScreenComponent } from './splash-screen/splash-screen.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/allTasks',
    pathMatch: 'full'
  },
  {
    path: 'splash',
    component: SplashScreenComponent
  },
  {
    path: 'allTasks',
    component: TaskHomeComponent
  },
  {
    path: 'allTasks/add',
    component: AddTaskComponent
  },
  {
    path: 'allProfiles',
    component: ProfileHomeComponent
  },
  {
    path: 'allProfiles/add',
    component: AddProfileComponent,
    data: { mode: 'add' }
  },
  {
    path: 'allProfiles/edit/:profileId',
    component: AddProfileComponent,
    data: { mode: 'edit' }
  },
  {
    path: 'settings',
    component: SettingHomeComponent
  },
  {
    path: 'proxyTester',
    component: ProxyTesterComponent
  },
  {
    path: '**',
    redirectTo: '/allTasks'
  }
];

export const routing = RouterModule.forRoot(routes, {
  useHash: true
});



// WEBPACK FOOTER //
// ./src/app/app.route.ts