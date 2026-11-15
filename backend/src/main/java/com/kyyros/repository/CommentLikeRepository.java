package com.kyyros.repository;

import com.kyyros.model.CommentLike;
import com.kyyros.model.CommentLikeId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CommentLikeRepository extends JpaRepository<CommentLike, CommentLikeId> {

    // Only comments with at least one like appear; missing comments have 0 likes
    interface CommentLikeStats {
        UUID getCommentId();
        Long getLikeCount();
        Boolean getLikedByMe();
    }

    // ON CONFLICT keeps likes idempotent without a constraint violation aborting the transaction
    @Modifying
    @Query(value = """
        INSERT INTO comment_likes (user_id, comment_id, created_at)
        VALUES (:userId, :commentId, NOW())
        ON CONFLICT DO NOTHING
        """, nativeQuery = true)
    int insertIfAbsent(@Param("userId") UUID userId, @Param("commentId") UUID commentId);

    @Modifying
    @Query("DELETE FROM CommentLike l WHERE l.id.userId = :userId AND l.id.commentId = :commentId")
    int deleteByUserIdAndCommentId(@Param("userId") UUID userId, @Param("commentId") UUID commentId);

    @Query("SELECT COUNT(l) FROM CommentLike l WHERE l.id.commentId = :commentId")
    long countByCommentId(@Param("commentId") UUID commentId);

    // One grouped query for every comment and reply on the video (avoids N+1).
    // A null userId (anonymous viewer) never matches, so likedByMe is false.
    @Query("""
        SELECT l.id.commentId AS commentId,
               COUNT(l) AS likeCount,
               CASE WHEN SUM(CASE WHEN l.id.userId = :userId THEN 1 ELSE 0 END) > 0
                    THEN true ELSE false END AS likedByMe
        FROM CommentLike l
        WHERE l.comment.video.id = :videoId
        GROUP BY l.id.commentId
        """)
    List<CommentLikeStats> findLikeStatsByVideoId(@Param("videoId") UUID videoId, @Param("userId") UUID userId);
}
