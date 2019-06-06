import { Component, OnInit } from '@angular/core';

import { CommonService } from './../services/common-service';
import { LookupManagerService } from './../services/lookup-manager.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UpdateConfirmModalComponent } from '../update-confirm-modal/update-confirm-modal.component';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
}) 

export class FooterComponent implements OnInit {

  public iconList = new Array();
  public externalHelpLinks = new Array();

  constructor(
    public commonService: CommonService,
    private lookupManager: LookupManagerService,
    private modalService: NgbModal

  ) {
    const _lookups = this.lookupManager.getLookupData();
    if (_lookups) {
      this.iconList = _lookups['footerItems'] || new Array();
      this.externalHelpLinks = _lookups['externalHelpLinks'] || new Array();
    } else {
      console.log('ERROR: CORRUPTED_FOOTER_ITEMS_DATA_FOUND');
    }
  }

  ngOnInit() {
  }

  public requestForUpdate() {
    const modalRef = this.modalService.open(UpdateConfirmModalComponent, {
      backdrop: 'static',
      backdropClass: 'modal-backdrop--custom light-gray-backdrop',
      centered: true,
      keyboard: false,
      windowClass: 'modal-window--custom'
    });
  }

}



// WEBPACK FOOTER //
// ./src/app/footer/footer.component.ts