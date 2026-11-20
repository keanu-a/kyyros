package com.kyyros.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;

import static org.assertj.core.api.Assertions.assertThat;

class MuxSignatureVerifierTest {

    private static final String SECRET = "test-secret";
    private static final String TIMESTAMP = "1700000000";
    private static final String BODY = "{\"type\":\"video.asset.ready\",\"data\":{\"id\":\"asset123\"}}";

    // HMAC-SHA256(SECRET, TIMESTAMP + "." + BODY), computed independently with openssl and .NET
    private static final String KNOWN_SIGNATURE =
            "e45ee6e8f5ccb394653e735c8513f0b275b99d67182c9a7632eb546cacc8656f";

    private MuxSignatureVerifier verifier;

    @BeforeEach
    void setUp() {
        verifier = new MuxSignatureVerifier(SECRET);
    }

    @Test
    void verify_validSignature_returnsTrue() {
        String header = header(TIMESTAMP, sign(SECRET, TIMESTAMP, BODY));

        assertThat(verifier.verify(BODY, header)).isTrue();
    }

    @Test
    void verify_knownAnswerVector_returnsTrue() {
        String header = header(TIMESTAMP, KNOWN_SIGNATURE);

        assertThat(verifier.verify(BODY, header)).isTrue();
    }

    @Test
    void verify_whitespaceAroundParts_returnsTrue() {
        String header = " t=" + TIMESTAMP + " , v1=" + sign(SECRET, TIMESTAMP, BODY) + " ";

        assertThat(verifier.verify(BODY, header)).isTrue();
    }

    @Test
    void verify_partsInReverseOrder_returnsTrue() {
        String header = "v1=" + sign(SECRET, TIMESTAMP, BODY) + ",t=" + TIMESTAMP;

        assertThat(verifier.verify(BODY, header)).isTrue();
    }

    @Test
    void verify_tamperedBody_returnsFalse() {
        String header = header(TIMESTAMP, sign(SECRET, TIMESTAMP, BODY));
        String tamperedBody = BODY.replace("asset123", "asset999");

        assertThat(verifier.verify(tamperedBody, header)).isFalse();
    }

    @Test
    void verify_mismatchedTimestamp_returnsFalse() {
        String header = header("1700000001", sign(SECRET, TIMESTAMP, BODY));

        assertThat(verifier.verify(BODY, header)).isFalse();
    }

    @Test
    void verify_signedWithDifferentSecret_returnsFalse() {
        String header = header(TIMESTAMP, sign("wrong-secret", TIMESTAMP, BODY));

        assertThat(verifier.verify(BODY, header)).isFalse();
    }

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {"   "})
    void verify_nullOrBlankHeader_returnsFalse(String header) {
        assertThat(verifier.verify(BODY, header)).isFalse();
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "v1=" + KNOWN_SIGNATURE,
            "t=" + TIMESTAMP,
            "nonsense",
            "t,v1",
    })
    void verify_malformedHeader_returnsFalse(String header) {
        assertThat(verifier.verify(BODY, header)).isFalse();
    }

    @Test
    void verify_emptyBodySignedCorrectly_returnsTrue() {
        String header = header(TIMESTAMP, sign(SECRET, TIMESTAMP, ""));

        assertThat(verifier.verify("", header)).isTrue();
    }

    @Test
    void verify_unicodeBodySignedCorrectly_returnsTrue() {
        String unicodeBody = "{\"title\":\"café ☕ 動画\"}";
        String header = header(TIMESTAMP, sign(SECRET, TIMESTAMP, unicodeBody));

        assertThat(verifier.verify(unicodeBody, header)).isTrue();
    }

    private static String header(String timestamp, String signature) {
        return "t=" + timestamp + ",v1=" + signature;
    }

    private static String sign(String secret, String timestamp, String body) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal((timestamp + "." + body).getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }
}
