import { IoIosConstruct } from "react-icons/io";

const UserData = () => {
  const tsxml =
    <section className="flex flex-col items-center justify-center py-20 bgprimary">
      <div><IoIosConstruct /></div>
      <div>Under Construction</div>
      <div className="w-100 text-center mt-10">
        <ul className="text-left w-100 p-10 border border-var(--app-accent) rounded-2xl" style={{ listStyleType: 'disc' }}>
          <li className="text-lg bold mb-5 leading-4">Kyero data generator to appear on the most important Real Estate portals.</li>
          <li>
            Personal data edition
            <ul className="ml-5" style={{ listStyleType: 'circle' }}>
              <li>CMS User</li>
              <li>New personal data (phone, CIF, ...)</li>
            </ul>
          </li>

          <li>List of visited properties</li>
          <li>Consult sent messages</li>
          <li>Other data</li>
        </ul>
      </div>
    </section>

  return tsxml;
}

export default UserData