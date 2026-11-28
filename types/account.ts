// Authors: Tyler Siedner and Tyler Harris
export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: "user" | "admin";
};
export type FormState = { error?: string; success?: string };
export type Opportunity = {
  id: string;
  title: string;
  description: string;
  schedule: string;
  requirements: string;
  active: number;
};
export type AdoptionApplication = {
  id: string;
  userId: string;
  animalId: string;
  animalName: string;
  animalArchived: number;
  applicantName: string;
  email: string;
  phone: string;
  address: string;
  livingSituation: string;
  petExperience: string;
  carePlan: string;
  staffNotes: string;
  status: string;
  createdAt: string;
};
export type VolunteerApplication = {
  id: string;
  userId: string;
  opportunityId: string;
  title: string;
  applicantName: string;
  email: string;
  phone: string;
  availability: string;
  experience: string;
  motivation: string;
  staffNotes: string;
  status: string;
  createdAt: string;
};
