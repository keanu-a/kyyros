package com.kyyros.security.ratelimit;

import com.kyyros.exception.RateLimitExceedException;
import com.kyyros.service.RateLimitService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class RateLimitAspect {

    private final RateLimitService rateLimitService;

    @Around("@annotation(rateLimit)")
    public Object enforceRateLimit(ProceedingJoinPoint joinPoint, RateLimit rateLimit) throws Throwable {
        String userId = getCurrentUserId();

        if (userId == null) {
            return joinPoint.proceed();
        }

        boolean isAllowed = rateLimitService.tryConsume(
                userId,
                rateLimit.name(),
                rateLimit.capacity(),
                rateLimit.periodSeconds()
        );

        if (!isAllowed) {
            log.warn("Rate limit '{}' exceeded for user '{}'", rateLimit.name(), userId);
            throw new RateLimitExceedException(rateLimit.name(), rateLimit.periodSeconds());
        }

        return joinPoint.proceed();
    }

    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }

        Object principal = authentication.getPrincipal();
        return principal instanceof String s ? s : null;
    }
}
