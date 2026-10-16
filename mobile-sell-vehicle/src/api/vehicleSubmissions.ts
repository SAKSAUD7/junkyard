import { postJson } from "./client";

export type VehicleSubmission = {
  vin: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  mileage: string;
  drivable: boolean;
  starts: boolean;
  transportation_required: boolean;
  has_title: boolean;
  has_keys: boolean;
  has_all_tires: boolean;
  body_damage: string;
  engine_issue: boolean;
  transmission_issue: boolean;
  name: string;
  email: string;
  phone: string;
  zip_code: string;
  state: string;
  city: string;
  description: string;
};

export type CreatedVehicleSubmission = VehicleSubmission & {
  id: number;
  status: string;
  created_at: string;
};

export function createVehicleSubmission(payload: VehicleSubmission) {
  return postJson<CreatedVehicleSubmission>("/sell-your-car/", payload);
}
