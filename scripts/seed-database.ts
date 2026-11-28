// Authors: Tyler Siedner and Tyler Harris
import { getDatabasePath, openShelterDatabase } from "../lib/database";
import { readAnimals } from "../lib/animal-repository";

const filePath = getDatabasePath();
const db = openShelterDatabase(filePath);
try {
  console.log(`Database ready: ${filePath}`);
  console.log(
    `${readAnimals(db).length} residents saved. Existing records were preserved.`,
  );
} finally {
  db.close();
}
