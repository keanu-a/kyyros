package com.kyyros.repository;

import com.kyyros.model.Video;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface VideoRepository extends JpaRepository<Video, UUID> {
    Optional<Video> findByMuxAssetId(String muxAssetId);

    @Query("SELECT v FROM Video v JOIN FETCH v.uploader " +
            "WHERE v.status = com.kyyros.enums.VideoStatus.READY ORDER BY v.createdAt DESC")
    Page<Video> findReadyVideos(Pageable pageable);
}
