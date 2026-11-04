package com.kyyros.repository;

import com.kyyros.model.VideoLike;
import com.kyyros.model.VideoLikeId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface VideoLikeRepository extends JpaRepository<VideoLike, VideoLikeId> {

    // ON CONFLICT keeps likes idempotent without a constraint violation aborting the transaction
    @Modifying
    @Query(value = """
        INSERT INTO video_likes (user_id, video_id, created_at)
        VALUES (:userId, :videoId, NOW())
        ON CONFLICT DO NOTHING
        """, nativeQuery = true)
    int insertIfAbsent(@Param("userId") UUID userId, @Param("videoId") UUID videoId);

    @Modifying
    @Query("DELETE FROM VideoLike l WHERE l.id.userId = :userId AND l.id.videoId = :videoId")
    int deleteByUserIdAndVideoId(@Param("userId") UUID userId, @Param("videoId") UUID videoId);

    @Query("SELECT COUNT(l) FROM VideoLike l WHERE l.id.videoId = :videoId")
    long countByVideoId(@Param("videoId") UUID videoId);
}
