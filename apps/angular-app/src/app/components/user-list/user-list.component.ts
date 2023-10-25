import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { map } from 'rxjs';

import { Role, UserExtended } from '../../shared/models/user';
import { UserCrudService } from '../../shared/services/user-crud.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
})
export class UserListComponent implements OnInit {
  p = 1;
  searchText = '';
  users: UserExtended[] = [];
  currentUser: any = {};
  hideWhenNoUser = false;
  noData = false;
  preLoader = true;
  roles = Role;
  selectedItems: string[] = [Role.Guest, Role.Admin, Role.SuperAdmin];

  constructor(
    public crudApi: UserCrudService,
    private route: ActivatedRoute,
    public toastr: ToastrService
  ) {}

  ngOnInit() {
    this.currentUser = this.route.parent?.snapshot.data['data'];

    this.crudApi
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
      .subscribe((data) => {
        data.forEach((item, index, list) => {
          list[index].role = list[index].role ?? Role.Guest;
        });
        this.users = data.filter(
          (doc: any) => doc.uid !== this.currentUser.uid
        );
        this.handleDataChange(this.users);
      });
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

  private handleDataChange(usersList: UserExtended[]) {
    this.preLoader = false;
    this.hideWhenNoUser = !(usersList.length <= 0);
    this.noData = usersList.length <= 0;
  }
}
