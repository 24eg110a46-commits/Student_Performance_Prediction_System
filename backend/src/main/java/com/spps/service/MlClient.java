package com.spps.service;

import com.spps.dto.MlMetrics;
import com.spps.dto.MlRequest;
import com.spps.dto.MlResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Optional;

/** Talks to the Python (Flask + Scikit-learn) prediction service. Never throws: returns empty when the service is down. */
@Component
public class MlClient {

    private static final Logger log = LoggerFactory.getLogger(MlClient.class);

    private final RestClient client;

    public MlClient(@Value("${ml.service.url}") String baseUrl,
                    @Value("${ml.service.timeout-ms:4000}") int timeoutMs) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(timeoutMs);
        factory.setReadTimeout(timeoutMs);
        this.client = RestClient.builder().baseUrl(baseUrl).requestFactory(factory).build();
    }

    public Optional<MlResponse> predict(MlRequest request) {
        try {
            return Optional.ofNullable(client.post()
                    .uri("/predict")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(MlResponse.class));
        } catch (Exception e) {
            log.warn("ML service not available, using rule-based fallback: {}", e.getMessage());
            return Optional.empty();
        }
    }

    public Optional<MlMetrics> metrics() {
        try {
            return Optional.ofNullable(client.get().uri("/metrics").retrieve().body(MlMetrics.class));
        } catch (Exception e) {
            return Optional.empty();
        }
    }
}
