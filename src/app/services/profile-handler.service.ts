import { Injectable } from '@angular/core';

import { Profile } from '../model/profile';

@Injectable()
export class ProfileHandlerService {

  private profiles = new Array<Profile>();

  constructor() { }

  public fetchProfileForLookups() {
    let profilesAsLookups = new Array();
    for (let _i = 0; _i < this.profiles.length; _i++) {
      profilesAsLookups.push({
        'profileId': this.profiles[_i].profileId,
        'profileName': this.profiles[_i].profileName
      });
    }
    return profilesAsLookups;
  }

  public getProfileList() {
    return this.profiles;
  }

  public setProfileList(profiles: Array<Profile>) {
    this.profiles = profiles;
    return this.profiles;
  }

  public addProfile(profile) {
    this.profiles.push(profile);
    return profile;
  }

  public getProfileWithId(_profileId) {
    for (let _i = 0; _i < this.profiles.length; _i++) {
      if (this.profiles[_i]['profileId'] === _profileId) {
        return this.profiles[_i];
      }
    }
    return undefined;
  }

  public setProfileWithId(profileId, profile) {
    for (let i = 0; i < this.profiles.length; i++) {
      if (this.profiles[i].profileId === profileId) {
        this.profiles[i] = profile;
        break;
      }
    }
  }

}



// WEBPACK FOOTER //
// ./src/app/services/profile-handler.service.ts