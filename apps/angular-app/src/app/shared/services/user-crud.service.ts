import { Injectable } from '@angular/core';

import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';
import { UserExtended } from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class UserCrudService {
  private dbPath = '/users';

  usersRef: AngularFirestoreCollection<UserExtended>;

  constructor(private db: AngularFirestore) {
    this.usersRef = db.collection(this.dbPath);
  }

  getAll(): AngularFirestoreCollection<UserExtended> {
    return this.usersRef;
  }

  get(id: string): any {
    return this.usersRef.doc(id).get();

  }

  update(id: string, data: any): Promise<void> {
    return this.usersRef.doc(id).update(data);
  }

  delete(id: string): Promise<void> {
    return this.usersRef.doc(id).delete();
  }
}
