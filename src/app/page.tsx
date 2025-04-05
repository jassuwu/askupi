import { Header, UploadForm, Footer } from "~/components";

export default function Home() {
  return (
    <main className="h-full flex flex-col items-center justify-between gap-10">
      <Header />
      <UploadForm />
      <Footer />
    </main>
  );
}
