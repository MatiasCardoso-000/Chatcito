import React, { useState } from "react";

const PostForm: React.FC = () => {
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return; // Don't submit empty posts

    // Here you would typically handle the post creation logic,
    // like sending the data to an API.
    console.log("New post content:", content);

    setContent(""); // Clear the textarea after submission
  };

  return (
    <div className="bg-gray-900 rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-white mb-4">Create a Post</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="shadow appearance-none border rounded w-full py-3 px-4 bg-gray-700 text-gray-200 leading-tight focus:outline-none focus:shadow-outline h-28 resize-none"
        />
        <div className="flex justify-end mt-4">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-500"
            disabled={!content.trim()}
          >
            Post
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostForm;