// Authors: Tyler Siedner and Tyler Harris
import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { requireUser } from "../../../lib/auth";
import { getDatabase } from "../../../lib/database";
import { favoriteAnimals } from "../../../lib/application-repository";
import { favoriteAction } from "../../actions/applications";
import ActionForm from "../../../components/ActionForm";
export const metadata = {
  robots: { index: false, follow: false },
  title: "Favorites",
};
async function FavoritesContent() {
  const user = await requireUser("/favorites");
  const animals = favoriteAnimals(getDatabase(), user.id);
  return (
    <main>
      <h1>Your favorites</h1>
      {animals.length === 0 ? (
        <p>
          No saved residents yet.{" "}
          <Link className="text-link" href="/animals">
            Browse residents
          </Link>
          .
        </p>
      ) : (
        <div className="favorites-list">
          {animals.map((animal) => (
            <article className="favorite-item" key={animal.id}>
              {animal.imageUrl && (
                <Link href={`/animals/${animal.id}`}>
                  <Image
                    src={animal.imageUrl}
                    alt={animal.name}
                    width={160}
                    height={200}
                  />
                </Link>
              )}
              <div>
                <h2>
                  <Link href={`/animals/${animal.id}`}>{animal.name}</Link>
                </h2>
                <p>
                  {animal.type} · {animal.adoptionStatus}
                </p>
                <ActionForm
                  action={favoriteAction}
                  buttonLabel="Remove"
                  className="compact-form"
                >
                  <input type="hidden" name="animalId" value={animal.id} />
                  <input type="hidden" name="saved" value="false" />
                  <input type="hidden" name="next" value="/favorites" />
                </ActionForm>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

export default function FavoritesPage() {
  return (
    <Suspense
      fallback={
        <main>
          <p>Loading…</p>
        </main>
      }
    >
      <FavoritesContent />
    </Suspense>
  );
}
