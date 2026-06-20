package com.kyyros.repository;

import com.kyyros.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CommentRepository extends JpaRepository<Comment, UUID> {

    @Query("""
        SELECT DISTINCT c from Comment c
        JOIN FETCH c.user
        LEFT JOIN FETCH c.replies r
        LEFT JOIN FETCH r.user
        WHERE c.video.id = :videoId
        AND c.parentComment is NULL
        ORDER BY c.timestampSeconds ASC
        """)
    List<Comment> findCommentByVideoIdWithRepliesAndUsers(@Param("videoId") UUID videoId);
}
