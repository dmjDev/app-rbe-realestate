import Link from 'next/link'
import { PROVINCES } from "@/lib/locations";
import { auth } from "@/lib/auth/auth";
import ButtonLogOut from './ButtonLogOut';

type Session = typeof auth.$Infer.Session;

export default function Footer({ session }: { session: Session | null }) {

  return (
    <footer className="bgprimary txtprimary pb-12 mt-5">
      <div className="ancho-global">
        <div className="flex flex-col items-center justify-center">
          <h3 className="text-lg font-semibold">Real Better Estate</h3>
          <p className="text-center mb-3 w-[80%]">Wishing you positive energy as you prepare for your big moment, because you have everything inside you to succeed beautifully... Choose your place.</p>
          <div className="mx-auto grid grid-cols-1 w-[80%]">
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 lg:col-span-9 gap-4">
              {PROVINCES.map((p) => (
                <Link href={`/properties?prov=${p}`} key={p} className="textbutton truncate">
                  {p}
                </Link>
              ))}
            </div>

            <div className="flex flex-col items-center justify-center border-t border-dotted mt-5 pt-5">
              {session ? (
                <ButtonLogOut />
              ) : (
                <Link href="/auth" className="textbutton">Go in</Link>
              )}
              <Link href="#" className="textbutton">About us</Link> {/* /info/about */}
              <Link href="#" className="textbutton">Contact with RBE</Link> {/* /info/contact */}
              <Link href="#" className="textbutton">Privacy</Link> {/* /legal/privacy */}
              <Link href="#" className="textbutton">Cookies policy</Link> {/* /legal/cookies */}
            </div>
          </div>

        </div>
      </div>
    </footer>
  )
}
