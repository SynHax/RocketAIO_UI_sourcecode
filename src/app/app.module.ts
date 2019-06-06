import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HttpModule } from '@angular/http';

import { NgxElectronModule } from 'ngx-electron';
import { TextMaskModule } from 'angular2-text-mask';
import { NgxMaskModule } from 'ngx-mask';
import { NgbModule, NgbTooltipConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';

/* Root Frame */
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
/* Main Panel Pages */
import { TaskHomeComponent } from './task-home/task-home.component';
import { AddTaskComponent } from './add-task/add-task.component';
import { AddProfileComponent } from './add-profile/add-profile.component';
import { ProfileHomeComponent } from './profile-home/profile-home.component';
import { SettingHomeComponent } from './setting-home/setting-home.component';
import { ProxyTesterComponent } from './proxy-tester/proxy-tester.component';
import { SplashScreenComponent } from './splash-screen/splash-screen.component';
import { ActivationScreenComponent } from './activation-screen/activation-screen.component';
/* Root Panels */
import { HeaderComponent } from './header/header.component';
import { SideBarComponent } from './sidebar/sidebar.component';
import { FooterComponent } from './footer/footer.component';
/* Utility Panels */
import { NotificationComponent } from './notification/notification.component';
import { AlertModalComponent } from './alert-modal/alert-modal.component';
import { TaskSchedulerComponent } from './task-scheduler/task-scheduler.component';
import { MassUrlChangerComponent } from './mass-url-changer/mass-url-changer.component';
import { MassKeywordChangerComponent } from './mass-keyword-changer/mass-keyword-changer.component';

import { routing } from './app.route';

/* Services */
import { ApiManager } from './services/api-manager';
import { TaskHandlerService } from './services/task-handler.service';
import { ProfileHandlerService } from './services/profile-handler.service';
import { SettingsHandlerService } from './services/settings-handler.service';
import { CommonService } from './services/common-service';
import { CommunicationService } from './services/communication-service';
import { NotificationManagerService } from './services/notification-manager.service';
import { LookupManagerService } from './services/lookup-manager.service';
import { UpdateConfirmModalComponent } from './update-confirm-modal/update-confirm-modal.component';
import { NoUpdateModalComponent } from './no-update-modal/no-update-modal.component';
import { UpdateAvailableModalComponent } from './update-available-modal/update-available-modal.component';
import { DownloadUpdateModalComponent } from './download-update-modal/download-update-modal.component';
import { MassPasswordChangerComponent } from './mass-password-changer/mass-password-changer.component';
import { ConfirmDeactivateBotComponent } from './confirm-deactivate-bot/confirm-deactivate-bot.component';
import { ConfirmExitBotComponent } from './confirm-exit-bot/confirm-exit-bot.component';

@NgModule({
  declarations: [
    AppComponent,
    TaskHomeComponent,
    AddTaskComponent,
    AddProfileComponent,
    ProfileHomeComponent,
    SettingHomeComponent,
    FooterComponent,
    HeaderComponent,
    SideBarComponent,
    ProxyTesterComponent,
    NotificationComponent,
    TaskSchedulerComponent,
    MassUrlChangerComponent,
    MassKeywordChangerComponent,
    AlertModalComponent,
    SplashScreenComponent,
    ActivationScreenComponent,
    HomeComponent,
    UpdateConfirmModalComponent,
    NoUpdateModalComponent,
    UpdateAvailableModalComponent,
    DownloadUpdateModalComponent,
    MassPasswordChangerComponent,
    ConfirmDeactivateBotComponent,
    ConfirmExitBotComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    HttpModule,
    NgxElectronModule,
    routing,
    TextMaskModule,
    NgxMaskModule.forRoot(),
    NgbModule.forRoot()
  ],
  providers: [
    ApiManager,
    TaskHandlerService,
    ProfileHandlerService,
    SettingsHandlerService,
    CommonService,
    CommunicationService,
    NotificationManagerService,
    LookupManagerService,
    NgbTooltipConfig
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    AlertModalComponent,
    TaskSchedulerComponent,
    MassUrlChangerComponent,
    MassKeywordChangerComponent,
    UpdateConfirmModalComponent,
    NoUpdateModalComponent,
    UpdateAvailableModalComponent,
    DownloadUpdateModalComponent,
    MassPasswordChangerComponent,
    ConfirmDeactivateBotComponent,
    ConfirmExitBotComponent,
  ]
})

export class AppModule { }



// WEBPACK FOOTER //
// ./src/app/app.module.ts