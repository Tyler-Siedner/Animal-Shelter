// Authors: Tyler Siedner and Tyler Harris
export const metadata = { title: "About" };
export default function AboutPage() {
  return (
    <main className="prose-page">
      <h1>About the shelter</h1>
      <p>
        Weyland-Yutani Animal Shelter cares for creatures from across the
        colonies and helps find suitable homes for them.
      </p>
      <h2>Our work</h2>
      <p>
        Each resident has a profile with care requirements, behavior notes, and
        medical information. We review adoption applications to make sure the
        applicant can provide the space and care the resident needs.
      </p>
      <h2>Helping out</h2>
      <p>
        Volunteers support the shelter through record keeping, visitor support,
        and daily preparation. Staff provide orientation before any placement
        begins.
      </p>
    </main>
  );
}
