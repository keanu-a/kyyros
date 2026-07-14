package com.kyyros.service;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimitService {

    private final ConcurrentHashMap<String, Bucket> buckets = new ConcurrentHashMap<>();

    public boolean tryConsume(String userId, String limitName, int capacity, long periodSeconds) {
        String key = userId + ":" + limitName;
        Bucket bucket = buckets.computeIfAbsent(key, k -> newBucket(capacity, periodSeconds));
        return bucket.tryConsume(1);
    }

    private Bucket newBucket(int capacity, long periodSeconds) {
        Bandwidth limit = Bandwidth.builder()
                .capacity(capacity)
                .refillGreedy(capacity, Duration.ofSeconds(periodSeconds))
                .build();
        return Bucket.builder().addLimit(limit).build();
    }
}
