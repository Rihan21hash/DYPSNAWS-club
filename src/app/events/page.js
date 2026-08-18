import EventsPageClient from "./EventsPageClient";

export const metadata = {
  title: "Events | AWS Cloud Club",
  description: "Explore our upcoming workshops, hackathons, summits, and certifications.",
};

export default function EventsPage() {
  return <EventsPageClient />;
}
