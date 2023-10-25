import { Injectable } from '@angular/core';
import { Donor } from '../models/donor';

import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root',
})
export class CrudService {
  donorRef: AngularFirestoreCollection<Donor>;
  private dbPath = '/donors';
  constructor(private db: AngularFirestore) {
    this.donorRef = db.collection(this.dbPath);
  }

  addDonor(donor: any) {
    this.donorRef.add({ ...donor });
  }

  getDonor(id: string) {
    return this.donorRef.doc(id).get();
  }

  getDonorsList() {
    return this.donorRef;
  }

  updateDonor(id: string, donor: Partial<Donor>) {
    this.donorRef.doc(id).update(donor);
  }

  deleteDonor(id: string) {
    this.donorRef.doc(id).delete();
  }
}
