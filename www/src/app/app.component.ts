import { Component, ViewChild } from '@angular/core';
import { Token, CreateTokenResponse } from './models/token';
import { ApiService } from './providers/apiservice.service';
import { ToastrService } from 'ngx-toastr';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild('template') modal: any;
  title = 'WHC Tokens';

  loading = false;
  token = new Token();
  response = new CreateTokenResponse();

  constructor(private api: ApiService, private toast: ToastrService, private modalService: BsModalService) {
    this.token.Network = 'mainnet';
  }

  async process() {
    try {
      this.loading = true;
      /* Form should have validated data */
      this.response = await this.api.CreateTokenRequest(this.token);
      this.loading = false;
      this.modalService.show(this.modal);

      this.token = new Token();
    } catch (err) {
      this.toast.error(err.error, 'Unable to create token');
      this.loading = false;
    }
  }
}
