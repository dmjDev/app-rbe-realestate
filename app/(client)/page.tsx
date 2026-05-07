import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import Link from "next/link";

import SearchForm from "./properties/components/SearchForm";
import RandSearch from "./properties/components/RandSearch";
import HomePromos from "@/components/HomePromos";
import HomeDesign from "@/components/HomeDesign";

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() });
  let userId = "";
  let urlSearch = "";
  if (session) {
    // console.log('session', session)
    userId = session.user.id;
    urlSearch = session.user.urlSearch;
  }

  const tsxl_home =
    <div className="bgprimary txtprimary flex flex-col items-center border-0 overflow-y-auto">
      {/* Hero Section */}
      <main className="ancho-global">
        <HomeDesign />

        <section className="text-center my-10">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {userId === '' && (
              <Link
                href="/auth"
                className="basebutton appbutton"
              >
                Claim your space
              </Link>
            )}
            <RandSearch userId={userId} />
          </div>
        </section>

        <HomePromos userId={userId} />

        {/* Search Section */}
        <section id="search" className="txtsecondary mt-10 rounded-2xl shadow-xl bgsecondaryborder">
          <div className="text-center my-4">
            <h2 className="txtprimary md:text-3xl text-2xl font-bold px-2">
              Choose your heart's desire
            </h2>
            <p className="text-lg txtsecondaryfaded px-2">
              We are here to assist you in the pursuit of your dreams
            </p>
          </div>
          <div className="form-main">
            <SearchForm
              userId={userId}
              initialUrl={urlSearch}
            />
          </div>
        </section>
      </main>
    </div>

  return tsxl_home;
}
