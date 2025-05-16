package aloui.bilal.userauthservice.security;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSSigner;
import com.nimbusds.jose.JWSVerifier;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import io.helidon.config.Config;
import io.helidon.http.HeaderNames;
import io.helidon.webserver.http.ServerRequest;
import jakarta.json.Json;
import jakarta.json.JsonObject;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Optional;

public class JwtUtil {

    private static final String key;
    private static final long expirationMs;
    private static final String issuer;
    private static final JWSAlgorithm jwsAlgorithm;

    static {
        Config jwtConfig = Config.create().get("jwt");
        key = jwtConfig.get("secret").asString().orElse(null);
        expirationMs = jwtConfig.get("expiration").asInt().orElse(0) * 1000;
        issuer = jwtConfig.get("issuer").asString().orElse("auth-service");

        String algo = jwtConfig.get("algorithm").asString().orElse("HS256");
        jwsAlgorithm = JWSAlgorithm.parse(algo);
    }

    public static String generateToken(Long userId, int role) {
        try {
            JWSSigner signer = new MACSigner(key.getBytes(StandardCharsets.UTF_8));

            JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                    .subject(String.valueOf(userId))
                    .issuer(issuer)
                    .issueTime(new Date())
                    .expirationTime(new Date(System.currentTimeMillis() + expirationMs))
                    .claim("role", role)
                    .build();

            SignedJWT signedJWT = new SignedJWT(
                    new JWSHeader(jwsAlgorithm),
                    claimsSet
            );

            signedJWT.sign(signer);

            return signedJWT.serialize();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate token", e);
        }
    }

    public static boolean verifyToken(String token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);

            JWSVerifier verifier = new MACVerifier(key.getBytes(StandardCharsets.UTF_8));

            boolean signatureValid = signedJWT.verify(verifier);
            boolean notExpired = new Date().before(signedJWT.getJWTClaimsSet().getExpirationTime());

            return signatureValid && notExpired;

        } catch (Exception e) {
            return false;
        }
    }

    public static JWTClaimsSet parseBody(String token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            return signedJWT.getJWTClaimsSet();
        } catch (Exception e) {
            throw new RuntimeException("Invalid token", e);
        }
    }

    public static Optional<String> getTokenFromRequest(ServerRequest req) {

        String authHeader = req.headers()
                .first(HeaderNames.create("Authorization"))
                .orElse("");

        if (!authHeader.startsWith("Bearer ")) {
            return Optional.empty();
        }

        String token = authHeader.substring("Bearer ".length()).trim();

        if (token.isEmpty()) {
            return Optional.empty();
        }

        return Optional.of(token);
    }
}