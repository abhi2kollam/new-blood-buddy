import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { combineLatest, map, take } from 'rxjs';

import { CrudService } from '../../shared/services/donor-crud.service';
import { Donor } from '../../shared/models/donor';
import { AuthService } from '../../shared/services/auth.service';
import { RequestCrudService } from '../../shared/services/request-crud.service';
import { RequestStatus } from '../../shared/models/request';
import { ActivatedRoute } from '@angular/router';
import { DialogService } from '../../shared/services/dialog-service';
import { DistrictCrudService } from '../../shared/services/district-crud.service';
import { District } from '../../shared/models/district';
import { isAdminRole } from '../../shared/models/user';

@Component({
  selector: 'app-donor-list',
  templateUrl: './donor-list.component.html',
})
export class DonorListComponent implements OnInit {
  p = 1;
  searchText = '';
  donors: Donor[] = [];
  hideWhenNoDonor = false;
  noData = false;
  preLoader = true;
  isAdmin = false;
  currentUser: any = {};
  districts: District[] = [];
  filter = { district: '', location: '', group: '', availableStatus: '' };
  complexFilter: any = null;
  advanced = false;
  constructor(
    public authService: AuthService,
    private districtApi: DistrictCrudService,
    public crudApi: CrudService,
    public requestApi: RequestCrudService,
    public toastr: ToastrService,
    public route: ActivatedRoute,
    private dialogService: DialogService
  ) {}

  ngOnInit() {
    const order: any = {
      available: 0,
      soon: 1,
      unavailable: 2,
    };
    const sortByDate = (a: any, b: any) => {
      const statusA = order[a.availableStatus];
      const statusB = order[b.availableStatus];
      const dateA = new Date(a.createdTime).getTime();
      const dateB = new Date(b.createdTime).getTime();
      return statusA < statusB ? -1 : statusA > statusB ? 1 : dateB - dateA;
    };
    this.currentUser = this.route.parent?.snapshot.data['data'];
    this.isAdmin = isAdminRole(this.currentUser.role);
    if (this.isAdmin) {
      this.crudApi
        .getDonorsList()
        .snapshotChanges()
        .pipe(
          map((changes) =>
            changes.map((c) => ({
              ...c.payload.doc.data(),
              availableStatus: this.defineColor(
                c.payload.doc.data().lastDonated
              ),
              id: c.payload.doc.id,
            }))
          )
        )
        .subscribe((donorList) => {
          donorList.sort(sortByDate);
          this.donors = donorList;
          this.handleDataChange(this.donors);
        });
    } else {
      combineLatest([
        this.crudApi.getDonorsList().get(),
        this.requestApi.getAll().get(),
      ]).subscribe(([donors, requests]) => {
        const donorList: any = [];
        donors?.forEach((donor) => {
          const requestData = requests?.docs.filter(
            (request) =>
              request.data().donorId === donor.id &&
              request.data().requesterId === this.authService.userData?.uid
          );
          const isSameCreator =
            donor.data().createdBy === this.authService.userData?.uid;
          donorList.push({
            ...donor.data(),
            availableStatus: this.defineColor(donor.data().lastDonated),
            id: donor.id,
            isSameCreator,
            status: requestData[0]?.data()?.status,
            remarks: requestData[0]?.data()?.remarks,
          });
        });
        donorList.sort(sortByDate);
        this.donors = donorList;
        this.handleDataChange(this.donors);
      });
    }
    this.districtApi
      .getAll()
      .valueChanges()
      .pipe(take(1))
      .subscribe((districts) => {
        if (districts) {
          this.districts = districts;
        }
      });
  }

  showAdvanced(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.advanced = !this.advanced;
  }

  defineColor(lastDonated: string) {
    if (!lastDonated) {
      return 'available';
    }
    const currentDate = new Date();
    const threeMonthsAgo = new Date();
    const twoMonthsAgo = new Date();
    threeMonthsAgo.setMonth(currentDate.getMonth() - 3);
    twoMonthsAgo.setMonth(currentDate.getMonth() - 2);

    return new Date(lastDonated) > threeMonthsAgo
      ? new Date(lastDonated) < twoMonthsAgo
        ? 'soon'
        : 'unavailable'
      : 'available';
  }

  applyFilter() {
    this.searchText = '';
    this.complexFilter = { ...this.filter };
  }

  clearFilter() {
    this.searchText = '';
    this.complexFilter = null;
    this.filter = {
      district: '',
      location: '',
      group: '',
      availableStatus: '',
    };
  }

  private handleDataChange(donorList: Donor[]) {
    this.preLoader = false;
    this.hideWhenNoDonor = !(donorList.length <= 0);
    this.noData = donorList.length <= 0;
  }

  copyContact(donor: any) {
    navigator.clipboard.writeText(donor.mobileNumber);
  }

  deleteDonor(donor: any) {
    this.dialogService
      .openConfirmation('Are sure you want to delete this donor ')
      .then((confirmed: boolean) => {
        if (confirmed) {
          this.crudApi.deleteDonor(donor.id);
          this.toastr.success(donor.name + ' successfully deleted!');
        }
      });
  }

  requestContact(event: any, donor: Donor) {
    event.stopPropagation();
    event.preventDefault();
    (donor as any).status = 'pending';
    this.requestApi.addRequest({
      createdTime: new Date().toISOString(),
      updatedTime: new Date().toISOString(),
      donorId: donor.id,
      remarks: '',
      requesterId: this.authService.userData?.uid,
      status: RequestStatus.pending,
    });
    this.toastr.success(donor.name + `'s contact request placed successfully`);
  }
}
