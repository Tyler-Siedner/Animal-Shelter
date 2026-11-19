// Author: Tyler Siedner

import type { Animal } from "../types/animal";

export const animals: Animal[] = [
  {
    id: "jonesy",
    name: "Jonesy",
    type: "Cat",
    breed: "Domestic Shorthair",
    ageYears: 4,
    gender: "Male",
    size: "Small",
    description:
      "An experienced space traveler seeking a quiet home with warm sleeping spots.",
    imageUrl: "/images/xeno_jonesy.png",
    adoptionStatus: "Available",
    vaccinationInfo: "Core vaccinations are up to date.",
    spayNeuterStatus: "Yes",
    dietaryNeeds: "Standard adult cat food.",
    behavioralInfo: "Independent, curious, and comfortable aboard spacecraft.",
    specialCareRequirements: "Provide secure hiding spaces during travel.",
  },
  {
    id: "ripley",
    name: "Ripley",
    type: "Dog",
    breed: "German Shepherd",
    ageYears: 3,
    gender: "Female",
    size: "Large",
    description:
      "A loyal, energetic companion looking for an active household.",
    imageUrl: "/images/ripley.png",
    adoptionStatus: "Pending",
    vaccinationInfo: "Core vaccinations are up to date.",
    spayNeuterStatus: "Yes",
    dietaryNeeds: "Large-breed adult dog food.",
    behavioralInfo: "Enjoys training, long walks, and human companionship.",
    specialCareRequirements: "Needs daily exercise and mental stimulation.",
  },
];
