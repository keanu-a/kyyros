package com.kyyros.security.ratelimit;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RateLimit {
    /**
     * Unique identifier for this rate limit (used as part of the bucket key).
     * Different endpoints should use different names so they get separate buckets.
     */
    String name();

    /**
     * How many requests are allowed in the given period.
     */
    int capacity();

    /**
     * The time period for the capacity, in seconds.
     */
    long periodSeconds();
}
