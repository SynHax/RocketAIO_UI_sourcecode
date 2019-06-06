import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ApiManager } from './../services/api-manager';
import { CommonService } from './../services/common-service';
import { LookupManagerService } from '../services/lookup-manager.service';
import { NotificationManagerService } from './../services/notification-manager.service';
import { ProfileHandlerService } from './../services/profile-handler.service';
import { AlertModalComponent } from '../alert-modal/alert-modal.component';

@Component({
  selector: 'app-profile-home',
  templateUrl: './profile-home.component.html',
  styleUrls: ['./profile-home.component.css']
})

export class ProfileHomeComponent implements OnInit {

  public profileList = new Array();

  public helpTextMessages = {};

  constructor(
    private router: Router,
    private modalService: NgbModal,
    private apiManager: ApiManager,
    private commonService: CommonService,
    private lookupManager: LookupManagerService,
    private notificationManagerService: NotificationManagerService,
    private profileHandlerService: ProfileHandlerService
  ) { }

  ngOnInit() {
    this.profileList = this.profileHandlerService.getProfileList();
    const lookups = this.lookupManager.getLookupData();
    if (lookups['helpTextMessages']) {
      this.helpTextMessages = lookups['helpTextMessages'];
    }
  }

  public editProfile(profileId) {
    this.router.navigate(['allProfiles/edit', profileId]);
  }

  public removeProfile(profileId) {
    this.apiManager.fetchData(
      'nodeServer',
      'deleteProfileById',
      { 'Content-Type': 'application/json' },
      ApiManager.requestName.POST,
      { 'profileId': profileId },
      (res) => {
        console.log('API_CALL_SUCCESS: PROFILE_REMOVED');
        this.profileList = this.profileHandlerService.setProfileList(res);
      },
      (error) => {
        console.log('API_CALL_FAILURE: UNABLE_TO_REMOVE_PROFILE');
        this.notificationManagerService.notificationGenerator({ id: undefined, mode: 'local', message: 'Failed to delete selected profile.', dismissible: false, type: 'danger' }, this.notificationManagerService.getNotificationTimeOut());
        return error;
      }
    );
  }

  public export(profile) {
    let exportData = JSON.parse(JSON.stringify(profile));
    delete exportData['profileId'];
    this.commonService.saveFile(JSON.stringify(exportData), this.modalService);
  }
  public saveAll() {
    let _profileList = new Array();
    for (let _i = 0; _i < this.profileList.length; _i++) {
      if (this.profileList[_i]) {
        let _profile = JSON.parse(JSON.stringify(this.profileList[_i]));
        delete _profile['profileId'];
        _profileList.push(_profile);
      }
    }
    var myObject = {
      "profile": _profileList,
    }
    if (myObject) {
      this.commonService.saveFile(JSON.stringify(myObject), this.modalService, () => {

      });
    } else {
      this.notificationManagerService.notificationGenerator({ id: undefined, mode: 'local', message: 'No Task selected for Export.', dismissible: false, type: 'warning' }, this.notificationManagerService.getNotificationTimeOut());
    }
  }
  public loadAll() {
    let that = this;
    this.commonService.openFile(async function (data) {
      data = JSON.parse(data);
      var profiles = data.profile;

      if (profiles && profiles.length > 0) {
        that.saveProfile(0, profiles);

      } else {
        console.log('API_CALL_FAILURE: UNABLE_TO_ADD_PROFILE');
        that.notificationManagerService.notificationGenerator({ id: undefined, mode: 'local', message: 'Unable to save Profile.', dismissible: false, type: 'danger' }, that.notificationManagerService.getNotificationTimeOut())
        const modalRef = that.modalService.open(AlertModalComponent, {
          backdrop: 'static',
          backdropClass: 'modal-backdrop--custom light-gray-backdrop',
          centered: true,
          keyboard: false,
          windowClass: 'modal-window--custom'
        });
        modalRef.componentInstance.alert = {
          title: 'ROCKETAIO: IMPORT',
          message: 'Select a file with multiple Profiles.',
          class: 'alert-warning ',
          isDismissible: true,
          hasCloseButton: true
        };
        return;
      }


    }, that.modalService);
  }

  private saveProfile(index, profileList) {

    var that = this;

    this.apiManager.fetchData(
      'nodeServer',
      'addProfile',
      { 'Content-Type': 'application/json' },
      ApiManager.requestName.POST,
      profileList[index],
      (res) => {
        console.log(index + 'API_CALL_SUCCESS: PROFILE_ADDED');
        that.profileHandlerService.addProfile(res);
        if (index < profileList.length - 1) {
          that.saveProfile(++index, profileList);
        } else {
          that.profileList = that.profileHandlerService.getProfileList();
        }
      },
      (error) => {
        console.log('API_CALL_FAILURE: UNABLE_TO_ADD_PROFILE');
        this.notificationManagerService.notificationGenerator({ id: undefined, mode: 'local', message: 'Unable to save Profile.', dismissible: false, type: 'danger' }, this.notificationManagerService.getNotificationTimeOut());
        return error;
      }
    );

  }
}



// WEBPACK FOOTER //
// ./src/app/profile-home/profile-home.component.ts