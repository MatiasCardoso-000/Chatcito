
interface Post {
  author: string;
  avatar?: string;
  content:string;
  timestamp: string;
}

interface PostCardProps {
  post: Post;
}

const PostCard = ({ post }:PostCardProps) => {
  const { author, avatar, content, timestamp } = post;

  return (
    <div className="bg-gray-900 rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center mb-4">
        {avatar && (
          <img
            src={avatar}
            alt={`${author}'s avatar`}
            className="w-12 h-12 rounded-full mr-4 object-cover"
          />
        )}
        <div>
          <p className="font-bold text-white">{author}</p>
          <p className="text-sm text-gray-400">{timestamp}</p>
        </div>
      </div>
      <p className="text-gray-300 mb-4">{content}</p>
      <div className="flex justify-end space-x-4 text-gray-400">
        <button className="hover:text-white focus:outline-none">
          Like
        </button>
        <button className="hover:text-white focus:outline-none">
          Comment
        </button>
      </div>
    </div>
  );
};

export default PostCard;