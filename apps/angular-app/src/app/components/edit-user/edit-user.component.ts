import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

import { UserCrudService } from '../../shared/services/user-crud.service';
import { DistrictCrudService } from '../../shared/services/district-crud.service';
import { take } from 'rxjs';
import { District } from '../../shared/models/district';
import { Role } from '../../shared/models/user';

@Component({
  selector: 'app-user-donor',
  templateUrl: './edit-user.component.html',
})
export class EditUserComponent implements OnInit {
  editForm: FormGroup | undefined;
  id: string | null = null;
  currentUser: any = {};
  districts: District[] = [];
  roles = Role;

  constructor(
    private crudApi: UserCrudService,
    private districtApi: DistrictCrudService,
    private fb: FormBuilder,
    private location: Location,
    private actRoute: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.updateUserData();
    this.currentUser = this.actRoute.parent?.snapshot.data['data'];

    this.id = this.actRoute.snapshot.paramMap.get('id') ?? null;
    if (this.id) {
      this.crudApi.get(this.id).subscribe((snapshot: any) => {
        if (snapshot.exists) {
          const documentData = snapshot.data();
          const formData: any = {};
          formData.role = documentData.role ?? Role.Guest;
          formData.displayName = documentData.displayName ?? '';
          formData.assignedDistricts = documentData.assignedDistricts ?? [];
          // Process the retrieved document here
          this.editForm?.setValue(formData);
        } else {
          // Document does not exist
          console.log('Document does not exist');
        }
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

  get displayName() {
    return this.editForm?.get('displayName');
  }

  get role() {
    return this.editForm?.get('role');
  }
  get assignedDistricts() {
    return this.editForm?.get('assignedDistricts');
  }

  updateUserData() {
    this.editForm = this.fb.group({
      displayName: ['', [Validators.required, Validators.minLength(2)]],
      role: ['', [Validators.required]],
      assignedDistricts: [[]],
    });
  }

  goBack() {
    this.location.back();
  }

  updateForm() {
    if (this.id) {
      this.crudApi.update(this.id, this.editForm?.value);
      this.toastr.success(
        this.editForm?.controls['displayName'].value + ' updated successfully'
      );
      this.router.navigate(['home', this.currentUser.uid, 'users']);
    }
  }
}
