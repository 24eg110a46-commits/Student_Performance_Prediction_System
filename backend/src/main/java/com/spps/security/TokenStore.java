package com.spps.security;

import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/** Keeps the login tokens issued by the API in memory. Restarting the server logs everyone out. */
@Component
public class TokenStore {

    private final Map<String, String> tokens = new ConcurrentHashMap<>();

    public String issue(String username) {
        String token = UUID.randomUUID().toString();
        tokens.put(token, username);
        return token;
    }

    public boolean isValid(String token) {
        return token != null && tokens.containsKey(token);
    }

    public void revoke(String token) {
        if (token != null) tokens.remove(token);
    }
}
