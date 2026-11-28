// Authors: Tyler Siedner and Tyler Harris
import type { ManagedAnimal } from "../lib/admin-repository";
import ActionForm from "./ActionForm";
import FormField from "./FormField";
import { saveAnimalAction } from "../app/actions/admin";
import { residentImages } from "../lib/images";
export default function AnimalEditor({ animal }: { animal?: ManagedAnimal }) {
  const choices = residentImages();
  const select = (
    name: string,
    label: string,
    values: string[],
    value: string,
  ) => (
    <div className="form-field">
      <label htmlFor={name}>{label}</label>
      <select id={name} name={name} defaultValue={value} required>
        {values.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
  return (
    <ActionForm
      action={saveAnimalAction}
      buttonLabel={animal ? "Save resident" : "Add resident"}
    >
      <input type="hidden" name="creating" value={String(!animal)} />
      {animal ? (
        <>
          <input type="hidden" name="id" value={animal.id} />
          <p className="form-help">
            ID: {animal.id} (kept unchanged to preserve links and applications)
          </p>
        </>
      ) : (
        <FormField
          name="id"
          label="ID (lowercase, numbers, hyphens)"
          maxLength={100}
        />
      )}
      <FormField
        name="name"
        label="Name"
        defaultValue={animal?.name}
        maxLength={100}
      />
      <FormField
        name="type"
        label="Creature type"
        defaultValue={animal?.type}
        maxLength={100}
      />
      <FormField
        name="breed"
        label="Breed / classification"
        defaultValue={animal?.breed ?? "Unclassified"}
        maxLength={100}
      />
      <div className="form-field">
        <label htmlFor="ageYears">Age in years</label>
        <input
          id="ageYears"
          name="ageYears"
          type="number"
          min="0"
          max="1000"
          step="any"
          defaultValue={animal?.ageYears ?? 0}
          required
        />
      </div>
      {select(
        "gender",
        "Gender",
        ["Unknown", "Male", "Female"],
        animal?.gender ?? "Unknown",
      )}
      {select(
        "size",
        "Size",
        ["Small", "Medium", "Large"],
        animal?.size ?? "Small",
      )}
      {select(
        "adoptionStatus",
        "Adoption status",
        ["Available", "Pending", "Adopted"],
        animal?.adoptionStatus ?? "Available",
      )}
      <div className="form-field">
        <label htmlFor="imageUrl">Photo</label>
        <select
          id="imageUrl"
          name="imageUrl"
          defaultValue={animal?.imageUrl ?? ""}
        >
          <option value="">No photo</option>
          {choices.map((url) => (
            <option key={url} value={url}>
              {url.split("/").pop()}
            </option>
          ))}
        </select>
        <p className="form-help">
          Pick a photo from public/images/creatures.
        </p>
      </div>
      <FormField
        name="description"
        label="Description"
        defaultValue={animal?.description}
        multiline
        minLength={10}
      />
      <FormField
        name="vaccinationInfo"
        label="Vaccination information"
        defaultValue={animal?.vaccinationInfo ?? "Not assessed."}
        multiline
      />
      {select(
        "spayNeuterStatus",
        "Spayed / neutered",
        ["Unknown", "Yes", "No"],
        animal?.spayNeuterStatus ?? "Unknown",
      )}
      <FormField
        name="dietaryNeeds"
        label="Dietary needs"
        defaultValue={animal?.dietaryNeeds ?? "Contact the shelter."}
        multiline
      />
      <FormField
        name="behavioralInfo"
        label="Behavior"
        defaultValue={animal?.behavioralInfo ?? "Not assessed."}
        multiline
      />
      <FormField
        name="specialCareRequirements"
        label="Special care requirements"
        defaultValue={animal?.specialCareRequirements ?? "Contact the shelter."}
        multiline
      />
    </ActionForm>
  );
}
