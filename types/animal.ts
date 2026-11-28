// Authors: Tyler Siedner and Tyler Harris

export type Animal = {
  id: string;
  name: string;
  type: string;
  breed: string;
  ageYears: number;
  gender: "Male" | "Female" | "Unknown";
  size: "Small" | "Medium" | "Large";
  description: string;
  imageUrl: string;
  adoptionStatus: "Available" | "Pending" | "Adopted";
  vaccinationInfo: string;
  spayNeuterStatus: "Yes" | "No" | "Unknown";
  dietaryNeeds: string;
  behavioralInfo: string;
  specialCareRequirements: string;
};
