import { useMemo } from 'react';

import type { Comment } from '@/lib/api/comments';

export type CommentCluster = {
  id: string;
  position: number; // 0-100, percentage on the strip
  comments: Comment[];
  topComment: Comment;
};

export const DEFAULT_CLUSTER_RADIUS_PX = 24;

export function useCommentClusters(
  comments: Comment[],
  stripWidthPx: number | null,
  duration: number | null,
  clusterRadiusPx: number = DEFAULT_CLUSTER_RADIUS_PX,
): CommentCluster[] {
  return useMemo(() => {
    if (duration === null || duration <= 0) return [];
    if (stripWidthPx === null || stripWidthPx <= 0) return [];
    if (comments.length === 0) return [];

    const sortedComments: Comment[] = [...comments].sort(
      (a, b) => (a.timestampSeconds as number) - (b.timestampSeconds as number),
    );

    const buckets: Comment[][] = [];
    let currentBucket: Comment[] = [];
    let currentAnchorPx = -Infinity;

    for (const comment of sortedComments) {
      const ts = comment.timestampSeconds as number;
      const positionPx = (ts / duration) * stripWidthPx;

      if (currentBucket.length === 0) {
        currentBucket = [comment];
        currentAnchorPx = positionPx;
      } else if (positionPx - currentAnchorPx <= clusterRadiusPx) {
        currentBucket.push(comment);
      } else {
        buckets.push(currentBucket);
        currentBucket = [comment];
        currentAnchorPx = positionPx;
      }
    }
    if (currentBucket.length > 0) buckets.push(currentBucket);

    // Transform buckets into clusters
    return buckets.map((bucket) => {
      const anchorTs = bucket[0].timestampSeconds as number;
      const clusterId = bucket[0].id; // stable regardless of createdAt changes
      const position = (anchorTs / duration) * 100;

      // Sort in place by createdAt desc — top = most recent
      bucket.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      return {
        id: clusterId,
        position,
        comments: bucket,
        topComment: bucket[0],
      };
    });
  }, [comments, duration, stripWidthPx, clusterRadiusPx]);
}
