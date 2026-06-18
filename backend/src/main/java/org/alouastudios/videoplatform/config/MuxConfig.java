package org.alouastudios.videoplatform.config;

import com.mux.ApiClient;
import com.mux.auth.HttpBasicAuth;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MuxConfig {

    @Value("${mux.token.id}")
    private String tokenId;

    @Value("${mux.token.secret}")
    private String tokenSecret;

    @Bean
    public ApiClient muxApiClient() {
        ApiClient client = com.mux.Configuration.getDefaultApiClient();

        client.setBasePath("https://api.mux.com");

        // Configure HTTP basic authorization: accessToken
        HttpBasicAuth accessToken = (HttpBasicAuth) client.getAuthentication("accessToken");
        accessToken.setUsername(tokenId);
        accessToken.setPassword(tokenSecret);

        return client;
    }
}