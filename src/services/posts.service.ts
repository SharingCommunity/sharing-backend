// This file does all the database things...
import Post from '../models/post.model';

/**
 * savePost service
 * - Returns IPost object ready to be saved
 * @param data Data to save the document
 */
export const newPost = (data: any) => {
  return new Post(data);
};

/**
 * fetchPosts
 *
 * - fetch Posts by query if query is {}
 * fetches all posts
 *
 * @param query
 */
export const fetchPosts = (query: {} = {}) => {
  return Post.find(query);
};

/**
 * findPostAndUpdate
 *
 * - find single post and update based on update query
 * @param id
 * @param update
 */
export const findPostAndUpdate = (id: string, update: any, options?: any) => {
  return Post.findByIdAndUpdate(id, update, options);
};
