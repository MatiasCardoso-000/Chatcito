import type { User } from "../../types";
import CameraIcon from "../common/CameraIcon";

interface ProfileCardProps {
  user?: User;
}

const ProfileCard = ({ user }: ProfileCardProps) => {
  return (
    <div className="bg-zinc-100 text-zinc-900  w-full mx-auto">
      <div className="flex flex-col items-center relative ">
        <div className="w-48 h-48">
          {user?.profileImage ? (
            <img
              className=" rounded-full object-cover mb-4 border-white border-4 shadow-2xl bg-zinc-200 "
              src={user?.profileImage}
              alt={`${user?.username}'s profile`}
            />
          ) : (
            <img
              className=" rounded-full object-cover mb-4 border-white border-4 shadow-2xl"
              src={"../../../public/user-icon.webp"}
              alt={`${user?.username}'s profile`}
            />
          )}
        </div>

        <h2 className="text-2xl font-bold mt-4">
          {user &&
            user?.username.slice(0, 1).toUpperCase() +
              user?.username.slice(1, user?.username.length)}
        </h2>
        {user?.bio && (
          <p className="mt-4 text-center text-gray-700">{user?.bio}</p>
        )}
        <label htmlFor="file">
          <div className="bg-zinc-200 border-white border-2 rounded-full absolute right-3/7 top-3/5 mt-4 w-12 h-12 flex items-center justify-center cursor-pointer">
            <CameraIcon />
          </div>
        </label>
        <input type="file" id="file" hidden />
      </div>
    </div>
  );
};

export default ProfileCard;
