export interface Request {
  requesterName?: string;
  requesterId: string;
  donorName?: string;
  createdTime: string;
  updatedTime: string;
  donorId: string;
  status: RequestStatus;
  remarks: string;
}

export enum RequestStatus {
  pending = 'pending',
  approved = 'approved',
  rejected = 'rejected',
  onHold = 'on-hold',
}
