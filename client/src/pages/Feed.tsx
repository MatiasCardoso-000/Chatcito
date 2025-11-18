// En cualquier página
import PostList from '../components/posts/PostList';

export const FeedPage = () => {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-zinc-800">Mi Feed</h1>
      <PostList type="feed" />
    </div>
  );
}