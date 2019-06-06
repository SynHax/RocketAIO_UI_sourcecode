import { Component, OnInit, NgZone } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { FormGroupName } from '@angular/forms/src/directives/reactive_directives/form_group_name';
import { Router, ActivatedRoute } from '@angular/router';

import { PhoneNumberUtil, PhoneNumberFormat, AsYouTypeFormatter, PhoneNumber } from 'google-libphonenumber';
import { TextMaskModule } from 'angular2-text-mask';
import createAutoCorrectedDatePipe from 'text-mask-addons/dist/createAutoCorrectedDatePipe';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ApiManager } from './../services/api-manager';
import { CommonService } from './../services/common-service';
import { ProfileHandlerService } from '../services/profile-handler.service';
import { NotificationManagerService } from '../services/notification-manager.service';
import { LookupManagerService } from '../services/lookup-manager.service';

@Component({
  selector: 'app-add-profile',
  templateUrl: './add-profile.component.html',
  styleUrls: ['./add-profile.component.css']
})

export class AddProfileComponent implements OnInit {

  addProfileForm: FormGroup;
  countryNameList = new Array();
  editProfileId: any = '';
  phoneNumberUtil = PhoneNumberUtil.getInstance();
  PNF = PhoneNumberFormat;
  private profileData: any = {};
  private isLoadDataFromFile = false;
  private readonly AsYouTypeFormatter = require('google-libphonenumber').AsYouTypeFormatter;
  private deliveryFormatter;
  private billingFormatter;
  private zipList: any = {};
  public billingZipMask: any = '99999';
  public deliveryZipMask: any = '99999';
  public helpTextMessages = {};

  public readonly expiryDateMask: any[] = [/[0-1]/, /\d/, '/', /\d/, /\d/];
  public readonly cardNumberMask: any[] = [/\d/, /\d/, /\d/, /\d/, ' ', /\d/, /\d/, /\d/, /\d/, ' ', /\d/, /\d/, /\d/, /\d/, ' ', /\d/, /\d/, /\d/, /\d/];
  public autoCorrectedDatePipe = createAutoCorrectedDatePipe('mm/yyyy');

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private apiManager: ApiManager,
    private commonService: CommonService,
    private profileHandlerService: ProfileHandlerService,
    private notificationManagerService: NotificationManagerService,
    private lookupManager: LookupManagerService,
    private _ngZone: NgZone,
    private modalService: NgbModal
  ) { }

  ngOnInit() {
    this.initLabels();
    this.initForm();
    if (this.zipList[this.addProfileForm.controls['deliveryDetails']['controls']['country'].value]) {
      this.countryUpdated('delivery', this.zipList[this.addProfileForm.controls['deliveryDetails']['controls']['country'].value]['format'], 'code');
    }
    if (this.zipList[this.addProfileForm.controls['billingDetails']['controls']['country'].value]) {
      this.countryUpdated('billing', this.zipList[this.addProfileForm.controls['billingDetails']['controls']['country'].value]['format'], 'code');
    }
  }

  private initLabels() {
    const lookups = this.lookupManager.getLookupData();
    this.countryNameList = lookups['countryNameList'];
    this.zipList = lookups['zipcodes'];
    this.helpTextMessages = lookups['helpTextMessages'];
  }

  private initForm() {
    let editProfile: any = {};
    if (this.isLoadDataFromFile === true) {
      editProfile = this.profileData;
      this.isLoadDataFromFile = false;
    } else if (this.activatedRoute.data['value']['mode'] === 'edit') {
      this.editProfileId = this.activatedRoute.snapshot.params['profileId'];
      let _profileList = this.profileHandlerService.getProfileList();
      for (let i = 0; i < _profileList.length; i++) {
        if (_profileList[i].profileId === this.editProfileId) {
          editProfile = JSON.parse(JSON.stringify(_profileList[i]));
          break;
        }
      }
    }
    if (editProfile === {} && this.editProfileId !== '') {
      console.log('ERROR: UNABLE_TO_FIND_PROFILE_WITH_ID_' + this.editProfileId);
      this.notificationManagerService.notificationGenerator({ id: undefined, mode: 'local', message: 'Unable to load selected Profile.', dismissible: false, type: 'warning' }, this.notificationManagerService.getNotificationTimeOut());
    }
    this.addProfileForm = this.fb.group({
      deliveryDetails: this.fb.group({
        'firstName': [(editProfile.deliveryDetails && editProfile.deliveryDetails.firstName) ? editProfile.deliveryDetails.firstName : ''],
        'lastName': [((editProfile.deliveryDetails && editProfile.deliveryDetails.lastName) ? editProfile.deliveryDetails.lastName : ''), Validators.compose([Validators.required])],
        'address': [((editProfile.deliveryDetails && editProfile.deliveryDetails.address) ? editProfile.deliveryDetails.address : ''), Validators.compose([Validators.required])],
        'aptSuite': [(editProfile.deliveryDetails && editProfile.deliveryDetails.aptSuite) ? editProfile.deliveryDetails.aptSuite : ''],
        'city': [(editProfile.deliveryDetails && editProfile.deliveryDetails.city) ? editProfile.deliveryDetails.city : '', Validators.compose([Validators.required])],
        'country': [((editProfile.deliveryDetails && editProfile.deliveryDetails.country) ? editProfile.deliveryDetails.country : 'US'), Validators.compose([Validators.required])],
        'state': [((editProfile.deliveryDetails && editProfile.deliveryDetails.state) ? editProfile.deliveryDetails.state : 'AL'), Validators.compose([Validators.required])],
        'zipcode': [((editProfile.deliveryDetails && editProfile.deliveryDetails.zipcode) ? editProfile.deliveryDetails.zipcode : ''), Validators.compose([Validators.required])],
        'phone': [(editProfile.deliveryDetails && editProfile.deliveryDetails.phone) ? editProfile.deliveryDetails.phone : '']
      }),
      billingDetails: this.fb.group({
        'firstName': [(editProfile.billingDetails && editProfile.billingDetails.firstName) ? editProfile.billingDetails.firstName : ''],
        'lastName': [((editProfile.billingDetails && editProfile.billingDetails.lastName) ? editProfile.billingDetails.lastName : '')],
        'address': [((editProfile.billingDetails && editProfile.billingDetails.address) ? editProfile.billingDetails.address : '')],
        'aptSuite': [(editProfile.billingDetails && editProfile.billingDetails.aptSuite) ? editProfile.billingDetails.aptSuite : ''],
        'city': [(editProfile.billingDetails && editProfile.billingDetails.city) ? editProfile.billingDetails.city : ''],
        'country': [((editProfile.billingDetails && editProfile.billingDetails.country) ? editProfile.billingDetails.country : 'US')],
        'state': [((editProfile.billingDetails && editProfile.billingDetails.state) ? editProfile.billingDetails.state : 'AL')],
        'zipcode': [((editProfile.billingDetails && editProfile.billingDetails.zipcode) ? editProfile.billingDetails.zipcode : '')],
        'phone': [(editProfile.billingDetails && editProfile.billingDetails.phone) ? editProfile.billingDetails.phone : ''],
      }),
      'billingSameAsDel': [editProfile.billingSameAsDel || false],
      paymentDetails: this.fb.group({
        'emailAddress': [((editProfile.paymentDetails && editProfile.paymentDetails.emailAddress) ? editProfile.paymentDetails.emailAddress : ''), Validators.compose([Validators.required])],
        'cardHolderName': [((editProfile.paymentDetails && editProfile.paymentDetails.cardHolderName) ? editProfile.paymentDetails.cardHolderName : ''), Validators.compose([Validators.required])],
        'cardNumber': [((editProfile.paymentDetails && editProfile.paymentDetails.cardNumber) ? editProfile.paymentDetails.cardNumber : ''), Validators.compose([Validators.required])],
        'expiryDate': [((editProfile.paymentDetails && editProfile.paymentDetails.expiryDate) ? editProfile.paymentDetails.expiryDate : ''), Validators.compose([Validators.required, Validators.pattern('^(0[1-9]|1[0-2])\/[0-9]{2}$')])],
        'cvv': [((editProfile.paymentDetails && editProfile.paymentDetails.cvv) ? editProfile.paymentDetails.cvv : ''), Validators.compose([Validators.required, Validators.pattern('^[0-9]{3,4}$')])],
        'oneUseOnly': [(editProfile.paymentDetails && editProfile.paymentDetails.oneUseOnly) ? editProfile.paymentDetails.oneUseOnly : false]
      }),
      'profileName': [(editProfile.profileName || ''), Validators.compose([Validators.required])]
    });
  }

  public isFormInvalid() {
    if (this.addProfileForm.invalid) {
      return true;
    } else if (
      this.addProfileForm['controls']['billingSameAsDel'].value === false &&
      (
        this.addProfileForm['controls']['billingDetails']['controls']['lastName'].value === '' ||
        this.addProfileForm['controls']['billingDetails']['controls']['address'].value === '' ||
        this.addProfileForm['controls']['billingDetails']['controls']['city'].value === '' ||
        this.addProfileForm['controls']['billingDetails']['controls']['country'].value === '' ||
        this.addProfileForm['controls']['billingDetails']['controls']['state'].value === '' ||
        this.addProfileForm['controls']['billingDetails']['controls']['zipcode'].value === '' ||
        this.addProfileForm['controls']['billingDetails']['controls']['phone'].value === ''
      )
    ) {
      return true;
    }
    let cardNumber = this.addProfileForm['controls']['paymentDetails']['controls']['cardNumber'].value.toString();
    cardNumber = cardNumber.replace(/ /g, '');
    cardNumber = Number.parseInt(cardNumber);
    if (!(/[0-9]{12}/.test(cardNumber))) {
      return true;
    }
    return this.addProfileForm.invalid;
  }

  public saveProfile() {
    if (this.isFormInvalid()) {
      console.log('ERROR: PROFILE_INPUT_IS_INVALID');
      this.notificationManagerService.notificationGenerator({ id: undefined, mode: 'local', message: this.helpTextMessages['invalid-form-error-message'], dismissible: false, type: 'warning' }, this.notificationManagerService.getNotificationTimeOut());
    } else {
      this.addProfileForm['controls']['paymentDetails']['controls']['cardNumber'].value = this.addProfileForm['controls']['paymentDetails']['controls']['cardNumber'].value.toString();
      this.addProfileForm['controls']['paymentDetails']['controls']['cardNumber'].value = this.addProfileForm['controls']['paymentDetails']['controls']['cardNumber'].value.replace(/ /g, '');
      this.addProfileForm['controls']['paymentDetails']['controls']['cardNumber'].value = Number.parseInt(this.addProfileForm['controls']['paymentDetails']['controls']['cardNumber'].value);
      if (this.addProfileForm.value.billingSameAsDel !== false) {
        this.addProfileForm.value.billingDetails.firstName = this.addProfileForm.value.deliveryDetails.firstName;
        this.addProfileForm.value.billingDetails.lastName = this.addProfileForm.value.deliveryDetails.lastName;
        this.addProfileForm.value.billingDetails.address = this.addProfileForm.value.deliveryDetails.address;
        this.addProfileForm.value.billingDetails.aptSuite = this.addProfileForm.value.deliveryDetails.aptSuite;
        this.addProfileForm.value.billingDetails.city = this.addProfileForm.value.deliveryDetails.city;
        this.addProfileForm.value.billingDetails.country = this.addProfileForm.value.deliveryDetails.country;
        this.addProfileForm.value.billingDetails.state = this.addProfileForm.value.deliveryDetails.state;
        this.addProfileForm.value.billingDetails.zipcode = this.addProfileForm.value.deliveryDetails.zipcode;
        this.addProfileForm.value.billingDetails.phone = this.addProfileForm.value.deliveryDetails.phone;
      }
      if (this.editProfileId === '') {
        this.apiManager.fetchData(
          'nodeServer',
          'addProfile',
          { 'Content-Type': 'application/json' },
          ApiManager.requestName.POST,
          this.addProfileForm.value,
          (res) => {
            console.log('API_CALL_SUCCESS: PROFILE_ADDED');
            this.profileHandlerService.addProfile(res);
            this.router.navigate(['/allProfiles']);
          },
          (error) => {
            console.log('API_CALL_FAILURE: UNABLE_TO_ADD_PROFILE');
            this.notificationManagerService.notificationGenerator({ id: undefined, mode: 'local', message: 'Unable to save Profile.', dismissible: false, type: 'danger' }, this.notificationManagerService.getNotificationTimeOut());
            return error;
          }
        );
      } else {
        this.editProfile();
      }
    }
  }

  private editProfile() {
    let queryParams: Map<string, string> = new Map();
    queryParams.set('profileId', this.editProfileId);
    this.apiManager.fetchData(
      'nodeServer',
      'editProfile',
      { 'Content-Type': 'application/json' },
      ApiManager.requestName.POST,
      this.addProfileForm.value,
      (res) => {
        console.log('API_CALL_SUCCESS: PROFILE_WITH_ID_' + this.editProfileId + '_UPDATE_SUCCESS');
        this.profileHandlerService.setProfileWithId(this.editProfileId, res);
        this.router.navigate(['/allProfiles']);
      },
      (error) => {
        console.log('API_CALL_SUCCESS: PROFILE_WITH_ID_' + this.editProfileId + '_UPDATE_FAILED');
        this.notificationManagerService.notificationGenerator({ id: undefined, mode: 'local', message: 'Failed to update Profile.', dismissible: false, type: 'danger' }, this.notificationManagerService.getNotificationTimeOut());
        return error;
      },
      queryParams
    );
  }

  public countryUpdated(addressType: string, event, caller: string) {
    if (caller === 'user') {
      if (this.zipList[event.target.value] && this.zipList[event.target.value]['format']) {
        event = this.zipList[event.target.value]['format'];
      } else {
        event = undefined;
      }
    }
    if (addressType === 'delivery') {
      if (event) {
        this.deliveryZipMask = event;
      }
      const deliveryPhone = this.addProfileForm.controls['deliveryDetails']['controls']['phone'].value;
      const deliveryCountryCode = this.addProfileForm.controls['deliveryDetails']['controls']['country'].value;
      if (deliveryCountryCode) {
        this.deliveryFormatter = new AsYouTypeFormatter(deliveryCountryCode);
        if (deliveryPhone) {
          let deliveryNumber = this.phoneNumberUtil.parseAndKeepRawInput(deliveryPhone, deliveryCountryCode);
          let _nationalNumber = deliveryNumber.getNationalNumber().toString();
          let deliveryPhoneFormatted = '';
          for (let _index = 0; _index < _nationalNumber.length; _index ++) {
            deliveryPhoneFormatted = this.deliveryFormatter.inputDigit(_nationalNumber[_index]);
          }
          this.addProfileForm.controls['deliveryDetails']['controls']['phone'].setValue(deliveryPhoneFormatted);
        }
      }
    } else if (addressType === 'billing') {
      if (event) {
        this.billingZipMask = event;
      }
      const billingPhone = this.addProfileForm.value.billingDetails.phone;
      const billingCountryCode = this.addProfileForm.controls['billingDetails']['controls']['country'].value;
      if (billingCountryCode) {
        this.billingFormatter = new AsYouTypeFormatter(billingCountryCode);
        if (billingPhone) {
          let billingNumber = this.phoneNumberUtil.parseAndKeepRawInput(billingPhone, billingCountryCode);
          let _nationalNumber = billingNumber.getNationalNumber().toString();
          let billingPhoneFormatted = '';
          for (let _index = 0; _index < _nationalNumber.length; _index++) {
            billingPhoneFormatted = this.billingFormatter.inputDigit(_nationalNumber[_index]);
          }
          this.addProfileForm.controls['billingDetails']['controls']['phone'].setValue(billingPhoneFormatted);
        }
      }
    }
  }

  public phoneMask(event, addressType: string) {
    const numericKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
    if (addressType === 'delivery') {
      const deliveryPhone = this.addProfileForm.controls['deliveryDetails']['controls']['phone'].value;
      if (deliveryPhone.length) {
        if (numericKeys.indexOf(event.key) >= 0) {
          this.addProfileForm.controls['deliveryDetails']['controls']['phone'].setValue(this.deliveryFormatter.inputDigit(deliveryPhone[deliveryPhone.length - 1]));
        } else {
          const deliveryCountryCode = this.addProfileForm.controls['deliveryDetails']['controls']['country'].value;
          this.deliveryFormatter = new AsYouTypeFormatter(deliveryCountryCode);
          let deliveryPhoneFormatted = '';
          for (let _index = 0; _index < deliveryPhone.length; _index ++) {
            deliveryPhoneFormatted = this.deliveryFormatter.inputDigit(deliveryPhone[_index]);
          }
          this.addProfileForm.controls['deliveryDetails']['controls']['phone'].setValue(deliveryPhoneFormatted);
        }
      } else {
        const deliveryCountryCode = this.addProfileForm.controls['deliveryDetails']['controls']['country'].value;
        this.deliveryFormatter = new AsYouTypeFormatter(deliveryCountryCode);
      }
    } else if (addressType === 'billing') {
      const billingPhone = this.addProfileForm.controls['billingDetails']['controls']['phone'].value;
      if (billingPhone.length) {
        if (numericKeys.indexOf(event.key) >= 0) {
          this.addProfileForm.controls['billingDetails']['controls']['phone'].setValue(this.billingFormatter.inputDigit(billingPhone[billingPhone.length - 1]));
        } else {
          const billingCountryCode = this.addProfileForm.controls['billingDetails']['controls']['country'].value;
          this.billingFormatter = new AsYouTypeFormatter(billingCountryCode);
          let billingPhoneFormatted = '';
          for (let _index = 0; _index < billingPhone.length; _index ++) {
            billingPhoneFormatted = this.billingFormatter.inputDigit(billingPhone[_index]);
          }
          this.addProfileForm.controls['deliveryDetails']['controls']['phone'].setValue(billingPhoneFormatted);
        }
      } else {
        const billingCountryCode = this.addProfileForm.controls['billingDetails']['controls']['country'].value;
        this.billingFormatter = new AsYouTypeFormatter(billingCountryCode);
      }
    }
  }

  public loadProfile() {
    let that = this;
    this.commonService.openFile(async function (data) {
      data = JSON.parse(data);
      that._ngZone.run(() => {
        that.profileData = data;
        that.isLoadDataFromFile = true;
        that.initForm();
      });
    }, that.modalService);
  }

  public getDeliveryStateList() {
    for (let i = 0; i < this.countryNameList.length; i++) {
      if (this.countryNameList[i].code === this.addProfileForm.controls['deliveryDetails']['controls']['country'].value) {
        return this.countryNameList[i].state;
      }
    }
    return [];
  }

  public getBillingStateList() {
    for (let i = 0; i < this.countryNameList.length; i++) {
      if (this.countryNameList[i].code === this.addProfileForm.controls['billingDetails']['controls']['country'].value) {
        return this.countryNameList[i].state;
      }
    }
    return [];
  }

  public isSameAsDelivery() {
    return this.addProfileForm.controls['billingSameAsDel'].value === true;
  }

}



// WEBPACK FOOTER //
// ./src/app/add-profile/add-profile.component.ts