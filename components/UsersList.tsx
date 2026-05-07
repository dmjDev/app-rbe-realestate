import { User } from "@/app/generated/prisma/client";

// Define una interfaz para las Props del componente
interface UserListProps { usersList: User[]; }

const UsersList = ({ usersList }: UserListProps) => {
  const tsxml =
    <div className="bgprimary txtprimary flex flex-col items-center justify-center pt-6">
      <h1 className="txtsecondaryfaded text-4xl font-bold mb-8 font-sans">Users</h1>
      <ul className="font-sans max-w-2xl space-y-4">
        {usersList.map((user) => (<li className="txtsecondary font-medium" key={user.id}>{user.name}</li>))}
      </ul>
    </div>

  return tsxml
}

export default UsersList
