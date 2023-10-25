import { Injectable } from '@angular/core';

import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';
import { District } from '../models/district';

@Injectable({
  providedIn: 'root',
})
export class DistrictCrudService {
  private dbPath = '/districts';

  districtsRef: AngularFirestoreCollection<District>;

  constructor(private db: AngularFirestore) {
    this.districtsRef = db.collection(this.dbPath, (ref) =>
      ref.orderBy('order')
    );
  }

  getAll(): AngularFirestoreCollection<District> {
    return this.districtsRef;
  }

  add(data: District): any {
    return this.districtsRef.add(data);
  }

  get(id: string): any {
    return this.districtsRef.doc(id).get();
  }

  update(id: string, data: any): Promise<void> {
    return this.districtsRef.doc(id).update(data);
  }

  delete(id: string): Promise<void> {
    return this.districtsRef.doc(id).delete();
  }
}
