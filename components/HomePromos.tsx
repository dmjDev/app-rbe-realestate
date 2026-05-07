import { PropertyCard } from "@/app/(client)/properties/components/PropertyCard";
import { getHomePromosProperties } from "@/app/(client)/properties/controller/properties-controller";

export const dynamic = 'force-dynamic';

const HomePromos = async ({ userId }: { userId: string }) => {
  const limit = 8;
  const promos = await getHomePromosProperties(limit);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {promos.map((item: any) => (
        <PropertyCard key={item.itemId} item={item} userId={userId} edit={false} />
      ))}
    </div>
  );
}

export default HomePromos












// return (
//   <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//     <div className="bgsecondaryborder txtsecondary rounded-xl shadow-lg p-8 border hover:shadow-xl transition-shadow">
//       <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
//         <svg
//           className="w-6 h-6 text-blue-600"
//           fill="none"
//           stroke="currentColor"
//           viewBox="0 0 24 24"
//         >
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             strokeWidth={2}
//             d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
//           />
//         </svg>
//       </div>
//       <h3 className="text-xl font-semibold mb-3">
//         Social Authentication
//       </h3>
//       <p className="txtsecondaryfaded">
//         Seamlessly authenticate users with Google, GitHub, and other
//         popular social providers. No need to manage passwords or worry
//         about security.
//       </p>
//     </div>

//     <div className="bgsecondaryborder txtsecondary rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
//       <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
//         <svg
//           className="w-6 h-6 text-green-600"
//           fill="none"
//           stroke="currentColor"
//           viewBox="0 0 24 24"
//         >
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             strokeWidth={2}
//             d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
//           />
//         </svg>
//       </div>
//       <h3 className="text-xl font-semibold mb-3">
//         Email & Password
//       </h3>
//       <p className="txtsecondaryfaded">
//         Traditional email and password authentication with secure password
//         hashing, email verification, and password reset functionality.
//       </p>
//     </div>

//     <div className="bgsecondaryborder txtsecondary rounded-xl shadow-lg p-8 border hover:shadow-xl transition-shadow">
//       <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
//         <svg
//           className="w-6 h-6 text-purple-600"
//           fill="none"
//           stroke="currentColor"
//           viewBox="0 0 24 24"
//         >
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             strokeWidth={2}
//             d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
//           />
//         </svg>
//       </div>
//       <h3 className="text-xl font-semibold mb-3">
//         Secure & Protected
//       </h3>
//       <p className="txtsecondaryfaded">
//         Built-in security features including JWT tokens, session
//         management, and protected routes that only authenticated users can
//         access.
//       </p>
//     </div>
//   </section>
// )