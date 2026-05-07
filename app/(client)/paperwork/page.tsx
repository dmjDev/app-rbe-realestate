import { Bird, Birdhouse, Expand, Sunrise } from "lucide-react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import UpgradePlan from "./components/UpgradePlan";

const Paperwork = async () => {
  const session = await auth.api.getSession({ headers: await headers() }); console.log('session', session)
  let isSession = false;
  if (session) isSession = true;
  let isRol10 = false;
  if (session && session?.user.userRol >= 10) isRol10 = true;

  return (
    <div className="bgprimary txtprimary flex flex-col items-center border-0 overflow-y-auto">
      <main className="ancho-global">
        <section>
          <header className="form-header-left pt-5">
            <h1 className="form-title leading-6 mb-3">Flexible Plans for Every Stage of Your Growth</h1>
            <p className="form-subtitle leading-4">Choose the plan that fits your ambition. Get the exposure you deserve and the professional tools you need to dominate the market</p>
          </header>
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bgsecondaryborder txtprimary rounded-xl shadow-lg p-8 border hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-center mb-6">
                <Bird size={100} />
              </div>
              <h1 className="text-2xl font-semibold txtaccent text-center leading-5">Client Plan for free</h1>
              <p className="text-lg font-light txtsecondary mt-1 mb-5 text-center leading-4">Improve your experience</p>
              <p className="txtprimary leading-4 mb-1">Manage your data.</p>
              <p className="txtprimary leading-4 mb-1">Search saving active.</p>
              <p className="txtprimary leading-4 mb-1">Mark the properties you've already visited.</p>
              <p className="txtprimary leading-4 mb-1">Add favorites to your preferred ones.</p>
              <p className="txtprimary leading-4 mb-5">View your messages for each property.</p>
              {!isSession && (
                <Link
                  href="/auth"
                  className="basebutton appbutton text-center"
                >
                  Better Client Experience for FREE
                </Link>
              )}
              {isSession && (
                <button className="basebutton appbutton" disabled>Better Client Experience for FREE</button>
              )}
            </div>

            <div className="bgsecondaryborder txtprimary rounded-xl shadow-lg p-8 border hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-center mb-6">
                <Birdhouse size={100} />
              </div>
              <h1 className="text-2xl font-semibold txtaccent text-center leading-5">Owner Plan for free</h1>
              <p className="text-lg font-light txtsecondary mt-1 mb-5 leading-4 text-center">Get started today</p>
              <p className="txtprimary leading-4 mb-1">Manage your data.</p>
              <p className="txtprimary leading-4 mb-1">Search saving active.</p>
              <p className="txtprimary leading-4 mb-1">Mark the properties you've already visited.</p>
              <p className="txtprimary leading-4 mb-1">Add favorites to your preferred ones.</p>
              <p className="txtprimary leading-4 mb-1">View your messages for each property.</p>
              <p className="txtprimary leading-4 mb-1">List your property for free for a month.</p>
              <p className="txtprimary leading-4 mb-5">Receive buyers messages.</p>
              <p className="txtaccent text-5xl text-center font-bold">5€</p>
              <p className="txtaccent text-lg text-center -mt-1 mb-5 leading-4">annualy<br />(first month free)</p>
              {!isSession && (
                <UpgradePlan plan="dataManager" />
              )}
              {isSession && (
                <button className="basebutton appbutton">Get You FREE Plan for a month</button>
              )}
            </div>

            <div className="bgsecondaryborder txtprimary rounded-xl shadow-lg p-8 border hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-center mb-6">
                <Expand size={100} />
              </div>
              <h1 className="text-2xl font-semibold txtaccent text-center leading-5">Agency Pro Plan</h1>
              <p className="text-lg font--light txtsecondary mt-1 mb-5 leading-4 text-center">Improve your benefits</p>
              <p className="txtprimary leading-4 mb-1">Manage your data.</p>
              <p className="txtprimary leading-4 mb-1">Search saving active.</p>
              <p className="txtprimary leading-4 mb-1">Mark the properties you've already visited.</p>
              <p className="txtprimary leading-4 mb-1">Add favorites to your preferred ones.</p>
              <p className="txtprimary leading-4 mb-1">Simple panel for storing data, images, videos, and virtual tours.</p>
              <p className="txtprimary leading-4 mb-1">Publish your ad just once and it will appear on multiple platforms.</p>
              <p className="txtprimary leading-4 mb-1">Get your listings on popular platforms like Idealista, Mivilla, ...</p>
              <p className="txtprimary leading-4 mb-1">View your messages for each property.</p>
              <p className="txtprimary leading-4 mb-1">List up to 10 properties for unlimited time.</p>
              <p className="txtprimary leading-4 mb-5">Manage buyers messages.</p>
              <p className="txtaccent text-5xl text-center font-bold">15€</p>
              <p className="txtaccent text-lg text-center -mt-3 mb-5">monthly</p>
              <button className="basebutton appbutton">Get You PRO Plan</button>
            </div>

            <div className="bgsecondaryborder txtprimary rounded-xl shadow-lg p-8 border hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-center mb-6">
                <Sunrise size={100} />
              </div>
              <h1 className="text-2xl font-semibold txtaccent text-center leading-5">Agency Pro Plan +</h1>
              <p className="text-lg font-light txtsecondary mt-1 mb-5 leading-4 text-center">Ultimate performance & lead generation</p>
              <p className="txtprimary leading-4 mb-1">Manage your data.</p>
              <p className="txtprimary leading-4 mb-1">Search saving active.</p>
              <p className="txtprimary leading-4 mb-1">Mark the properties you've already visited.</p>
              <p className="txtprimary leading-4 mb-1">Add favorites to your preferred ones.</p>
              <p className="txtprimary leading-4 mb-1">Simple panel for storing data, images, videos, and virtual tours.</p>
              <p className="txtprimary leading-4 mb-1">Publish your ad just once and it will appear on multiple platforms.</p>
              <p className="txtprimary leading-4 mb-1">Get your listings on popular platforms like Idealista, Mivilla, ...</p>
              <p className="txtprimary leading-4 mb-1">View your messages for each property.</p>
              <p className="txtprimary leading-4 mb-1">List up to 50 properties for unlimited time.</p>
              <p className="txtprimary leading-4 mb-5">Manage buyers messages.</p>
              <p className="txtaccent text-5xl text-center font-bold">35€</p>
              <p className="txtaccent text-lg text-center -mt-3 mb-5">monthly</p>
              <button className="basebutton appbutton">Get You PRO Plan Plus</button>
            </div>
          </div>
        </section>
        <section>
          <div className="mt-5 grid grid-cols-1 gap-8">
            <div className="bgsecondaryborder txtprimary rounded-xl shadow-lg p-8 border hover:shadow-xl transition-shadow">
              <p className="text-center text-4xl font-bold txtaccent leading-7 mb-1">We value your property</p>
              <p className="text-center text-lg txtprimary leading-4">Our technical team can advise you free of charge on the valuation of your property; sell it for its true value.</p>
            </div>
            <div className="bgsecondaryborder txtprimary rounded-xl shadow-lg p-8 border hover:shadow-xl transition-shadow">
              <p className="text-center text-4xl font-bold txtaccent leading-7 mb-1">Do you want to run a mortgage simulation?</p>
              <p className="text-center text-lg txtprimary leading-4">Our financial team is at your disposal; contact us and we will advise you without obligation.</p>
            </div>
            <div className="bgsecondaryborder txtprimary rounded-xl shadow-lg p-8 border hover:shadow-xl transition-shadow">
              <p className="text-center text-4xl font-bold txtaccent leading-7 mb-1">Can we help you with your renovations?</p>
              <p className="text-center text-lg txtprimary leading-4">At RBE, we offer a wide range of professionals to help you make any home improvement project a reality. Don't hesitate to contact us.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Paperwork