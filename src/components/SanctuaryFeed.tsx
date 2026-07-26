"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import PostCreator from "./PostCreator";
import PostCard from "./PostCard";

type ReactionType = "understanding" | "hope" | "company" | "less_alone" | "comfort";

interface Post {
  id: string;
  content: string;
  contentType: "text" | "poem" | "story";
  displayName?: string;
  isAnonymous: boolean;
  createdAt: string;
  roomId?: string;
  reactions: { type: ReactionType; count: number; userReacted?: boolean }[];
}

// Demo posts for preview
const demoPosts: Post[] = [
  {
    id: "1",
    content: "Tonight I watched the stars and felt like the universe was listening. Sometimes the quiet moments say the most.",
    contentType: "text",
    isAnonymous: true,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    reactions: [
      { type: "understanding", count: 12 },
      { type: "less_alone", count: 8 },
      { type: "comfort", count: 5 },
    ],
  },
  {
    id: "2",
    content: "In the space between heartbeats\nI found a moment of peace\nWhere the world stopped spinning\nAnd I could simply breathe",
    contentType: "poem",
    displayName: "Stardust Weaver",
    isAnonymous: false,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    reactions: [
      { type: "hope", count: 15 },
      { type: "comfort", count: 9 },
    ],
  },
  {
    id: "3",
    content: "I've been carrying this weight for so long that I forgot what it felt like to stand tall. But today, just for a moment, I felt light again. And that's enough.",
    contentType: "story",
    isAnonymous: true,
    createdAt: new Date(Date.now() - 14400000).toISOString(),
    reactions: [
      { type: "company", count: 23 },
      { type: "understanding", count: 18 },
      { type: "hope", count: 11 },
    ],
  },
];

export default function SanctuaryFeed() {
  const [posts, setPosts] = useState<Post[]>(demoPosts);

  const handleNewPost = (newPost: {
    content: string;
    contentType: "text" | "poem" | "story";
    identityType: "anonymous" | "alias" | "real";
    displayName?: string;
    isAnonymous: boolean;
  }) => {
    const post: Post = {
      id: Date.now().toString(),
      content: newPost.content,
      contentType: newPost.contentType,
      displayName: newPost.displayName,
      isAnonymous: newPost.isAnonymous,
      createdAt: new Date().toISOString(),
      reactions: [],
    };

    setPosts([post, ...posts]);
  };

  const handleReact = (postId: string, reactionType: ReactionType) => {
    setPosts(
      posts.map((post) => {
        if (post.id !== postId) return post;

        const existingReaction = post.reactions.find((r) => r.type === reactionType);
        if (existingReaction) {
          if (existingReaction.userReacted) {
            // Remove reaction
            return {
              ...post,
              reactions: post.reactions
                .map((r) =>
                  r.type === reactionType
                    ? { ...r, count: r.count - 1, userReacted: false }
                    : r
                )
                .filter((r) => r.count > 0),
            };
          } else {
            // Add reaction
            return {
              ...post,
              reactions: post.reactions.map((r) =>
                r.type === reactionType
                  ? { ...r, count: r.count + 1, userReacted: true }
                  : r
              ),
            };
          }
        } else {
          // New reaction
          return {
            ...post,
            reactions: [...post.reactions, { type: reactionType, count: 1, userReacted: true }],
          };
        }
      })
    );
  };

  const handleReport = (postId: string) => {
    // TODO: Implement report modal
    console.log("Report post:", postId);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Post creator */}
      <PostCreator onSubmit={handleNewPost} />

      {/* Posts feed */}
      <motion.div
        className="flex flex-col gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <PostCard
              id={post.id}
              content={post.content}
              contentType={post.contentType}
              displayName={post.displayName}
              isAnonymous={post.isAnonymous}
              createdAt={post.createdAt}
              roomId={post.roomId}
              reactions={post.reactions}
              onReact={handleReact}
              onReport={handleReport}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Load more placeholder */}
      <motion.div
        className="text-center py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-soulscape-dim text-sm font-body">
          The universe holds more stories...
        </p>
      </motion.div>
    </div>
  );
}
