import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

import { CrudService } from '../../shared/services/donor-crud.service';
import { AuthService } from '../../shared/services/auth.service';
import { Donor } from '../../shared/models/donor';
import { DistrictCrudService } from '../../shared/services/district-crud.service';
import { District } from '../../shared/models/district';
import { map, take } from 'rxjs';

@Component({
  selector: 'app-edit-donor',
  templateUrl: './edit-donor.component.html',
})
export class EditDonorComponent implements OnInit {
  donor: Partial<Donor> = {};
  districts: Partial<District>[] = [];
  locations: string[] = [];
  id: string | null = null;
  currentUser: any = {};
  maxDate = '';
  @ViewChild('editForm') editForm: NgForm | undefined;

  constructor(
    private crudApi: CrudService,
    private districtApi: DistrictCrudService,
    private location: Location,
    private actRoute: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const today = new Date();
    this.maxDate = today.toISOString().split('T')[0];
    this.currentUser = this.route.parent?.snapshot.data['data'];

    this.id = this.actRoute.snapshot.paramMap.get('id') ?? null;
    if (this.id) {
      this.crudApi.getDonor(this.id).subscribe((snapshot) => {
        if (snapshot.exists) {
          const data = snapshot.data() as Donor;
          data.district = data.district ?? '';

          if (data.district) {
            this.onSelectDistrict(data.district);
          }
          this.donor = data;
        }
      });
    }
    this.districtApi
      .getAll()
      .snapshotChanges()

      .pipe(
        map((changes) =>
          changes.map((c) => ({
            ...c.payload.doc.data(),
            id: c.payload.doc.id,
          }))
        )
      )
      .pipe(take(1))
      .subscribe((districts) => {
        if (districts) {
          this.districts = districts;
        }
      });
  }
  onSelectDistrict(dist?: string) {
    const district = this.districts.find((d) => d.name === dist);
    this.locations = district?.places ?? [];
  }

  goBack() {
    this.router.navigate(['home', this.currentUser?.uid, 'list']);
  }

  updateForm() {
    if (this.donor.lastDonated) {
      const currentDate = new Date();
      const selectedDate = new Date(this.donor.lastDonated);

      // Check if the future date is greater than the current date
      if (selectedDate.getTime() > currentDate.getTime()) {
        this.toastr.warning(
          'Unable to save.The last donated date is in the future.'
        );
        return;
      }
    }

    if (this.donor.location && !this.locations.includes(this.donor.location)) {
      const dist = this.districts.find((d) => d.name === this.donor.district);
      if (dist?.id) {
        if (!dist?.places) {
          dist.places = [];
        }
        dist?.places?.push(this.donor.location);
        this.districtApi.update(dist?.id, dist);
      }
    }
    const data = this.donor;
    const currentTime = new Date().toISOString();
    if (this.id) {
      data.updatedBy = this.authService.userData.uid;
      data.updatedTime = currentTime;
      this.crudApi.updateDonor(this.id, data);
      this.toastr.success(this.donor.name + ' updated successfully');
      this.router.navigate(['home', this.currentUser?.uid, 'list']);
    } else {
      data.createdBy = this.authService.userData.uid;
      data.createdTime = currentTime;
      this.crudApi.addDonor(data);
      this.toastr.success(this.donor.name + ' successfully added!');
      this.resetForm(this.editForm);
    }
  }
  resetForm(form?: NgForm) {
    form?.resetForm();
    this.donor = {};
  }
}
