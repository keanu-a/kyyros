package org.alouastudios.videoplatform.repository;

import org.alouastudios.videoplatform.model.Video;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface VideoRepository extends JpaRepository<Video, UUID> {
    Optional<Video> findByMuxAssetId(String muxAssetId);
}
