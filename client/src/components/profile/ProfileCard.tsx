import { PenIcon } from "lucide-react";
import type { User } from "../../types";
import CameraIcon from "../common/CameraIcon";
import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { useForm } from "react-hook-form";

interface ProfileCardProps {
  user?: User;
}

const ProfileCard = ({ user }: ProfileCardProps) => {
  const [openUpdate, setOpenUpdate] = useState(false);
  const { update } = useAuthStore();
  const { register, handleSubmit } = useForm();

  const [updatedContent, setUpdatedContent] = useState("");

  const handleUpdate = () => {
    update(user!.id, { content: updatedContent });
  };

  useEffect(() => {});

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
        <div className="flex items-center gap-2 mt-8">
          {openUpdate ? (
            <div className={openUpdate ? "block" : "hidden"}>
              <form
                className="flex flex-col text-center gap-2"
                onSubmit={handleSubmit(handleUpdate)}
              >
                <input
                  type="text"
                  className="border border-black px-2"
                  {...register("username", { required: true })}
                  value={updatedContent}
                  onChange={(e) => setUpdatedContent(e.target.value)}
                />
                <button
                  type="submit"
                  className="bg-zinc-900 text-white "
               
                >
                  Modificar
                </button>
              </form>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold ">
                {user &&
                  user?.username.slice(0, 1).toUpperCase() +
                    user?.username.slice(1, user?.username.length)}
              </h2>
              <button onClick={() => setOpenUpdate(!openUpdate)}>
                <PenIcon className="w-6 h-6 border-2 border-slate-200 text-slate-400 rounded-sm cursor-pointer" />
              </button>
            </>
          )}
        </div>

        {user?.bio && (
          <p className="mt-4 text-center text-gray-700">{user?.bio}</p>
        )}
        <label htmlFor="file">
          <div className="bg-zinc-200 border-white border-2 rounded-full absolute right-3/7 top-3/6 mr-4 w-12 h-12 flex items-center justify-center cursor-pointer">
            <CameraIcon />
          </div>
        </label>
        <input type="file" id="file" hidden />
      </div>
    </div>
  );
};

export default ProfileCard;
