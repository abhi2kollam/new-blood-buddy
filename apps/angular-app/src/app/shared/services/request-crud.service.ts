import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';

import { Request } from '../models/request';

@Injectable({
  providedIn: 'root',
})
export class RequestCrudService {
  private dbPath = '/requests';

  requestsRef: AngularFirestoreCollection<Request>;

  constructor(db: AngularFirestore) {
    this.requestsRef = db.collection(this.dbPath);
  }

  addRequest(request: Request) {
    this.requestsRef.add({ ...request });
  }

  getAll(): AngularFirestoreCollection<Request> {
    return this.requestsRef;
  }

  get(id: string): any {
    return this.requestsRef.doc(id).get();
  }

  update(id: string, data: any): Promise<void> {
    return this.requestsRef.doc(id).update(data);
  }

  delete(id: string): Promise<void> {
    return this.requestsRef.doc(id).delete();
  }
}
