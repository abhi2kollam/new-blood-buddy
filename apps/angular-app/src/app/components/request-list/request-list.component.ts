import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { combineLatest } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

import { CrudService } from '../../shared/services/donor-crud.service';
import { RequestCrudService } from '../../shared/services/request-crud.service';
import { UserCrudService } from '../../shared/services/user-crud.service';
import { Request } from '../../shared/models/request';
import { DialogService } from '../../shared/services/dialog-service';
import { Role, UserExtended } from '../../shared/models/user';
@Component({
  selector: 'app-user-list',
  templateUrl: './request-list.component.html',
})
export class RequestListComponent implements OnInit {
  p = 1;
  searchText = '';
  requests: Request[] = [];
  request: Partial<Request> = {};
  @ViewChild('myDialog') myDialog: ElementRef | undefined;
  selectedItems = ['pending', 'on-hold', 'approved', 'rejected'];
  currentUser: UserExtended | null = null;
  hideWhenNoRequests = false;
  noData = false;
  preLoader = true;
  isGuestUser = false;

  constructor(
    public requestApi: RequestCrudService,
    private dialogService: DialogService,
    public userApi: UserCrudService,
    public donorApi: CrudService,
    public toastr: ToastrService,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    this.currentUser = this.route.parent?.snapshot.data['data'];
    this.isGuestUser = this.currentUser?.role === Role.Guest;
    this.loadList();
  }

  onStatusFilter(status: string, event: Event) {
    if ((event?.target as any)?.checked) {
      this.selectedItems.push(status);
    } else {
      const index = this.selectedItems.findIndex((s) => s === status);
      this.selectedItems.splice(index, 1);
    }
    this.selectedItems = [...this.selectedItems];
  }

  loadList() {
    combineLatest([
      this.donorApi.getDonorsList().get(),
      this.userApi.getAll().get(),
      this.requestApi.getAll().get(),
    ]).subscribe(([donors, users, requests]) => {
      const requestList: any = [];
      requests?.forEach((request) => {
        const requestData = request.data();
        const userData = users?.docs
          .find((user) => user.id === requestData.requesterId)
          ?.data();
        const donorData = donors?.docs
          .find((donor) => donor.id === requestData.donorId)
          ?.data();
        if (
          this.currentUser?.role == Role.SuperAdmin ||
          (this.currentUser?.role == Role.Admin &&
            donorData?.district &&
            this.currentUser?.assignedDistricts &&
            this.currentUser?.assignedDistricts?.includes(
              donorData?.district
            )) ||
          (this.currentUser?.role === Role.Guest &&
            requestData.requesterId === this.currentUser.uid)
        ) {
          requestList.push({
            ...requestData,
            id: request.id,
            requesterName: this.isGuestUser ? 'You' : userData?.displayName,
            requesterEmail: userData?.email,
            requesterMobile: userData?.phoneNumber,
            requesterPhoto: userData?.photoURL,
            donorName: donorData?.name,
            donorMobile: donorData?.mobileNumber,
            donorDistrict: donorData?.district,
            group: donorData?.group,
          });
        }
      });
      const order: any = {
        pending: 0,
        'on-hold': 1,
        approved: 2,
        rejected: 3,
      };
      const sortByDate = (a: any, b: any) => {
        const statusA = order[a.status];
        const statusB = order[b.status];
        const dateA = new Date(a.updatedTime).getTime();
        const dateB = new Date(b.updatedTime).getTime();
        return statusA < statusB ? -1 : statusA > statusB ? 1 : dateB - dateA;
      };
      requestList.sort(sortByDate);
      this.requests = requestList;
      this.handleDataChange(this.requests);
    });
  }
  async saveStatus() {
    const data: any = {
      status: this.request.status,
      remarks: this.request.remarks,
      updatedTime: new Date().toISOString(),
    };
    await this.requestApi.update((this.request as any).id, data);
    this.closeDialog();
    this.toastr.success('Request updated successfully');
  }

  deleteRequest(request: any) {
    this.dialogService
      .openConfirmation('Are sure you want to delete this request ')
      .then((confirmed: boolean) => {
        if (confirmed) {
          this.requestApi.delete(request.id);
          this.toastr.success('request successfully deleted!');
          this.loadList();
        }
      });
  }
  openDialog(request: Partial<Request>) {
    this.request = request;
    if (!this.myDialog?.nativeElement.open) {
      this.myDialog?.nativeElement.showModal();
    }
  }
  private handleDataChange(reqList: Request[]) {
    this.preLoader = false;
    this.hideWhenNoRequests = !(reqList.length <= 0);
    this.noData = reqList.length <= 0;
  }

  closeDialog() {
    this.myDialog?.nativeElement.close();
  }
}
