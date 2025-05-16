package aloui.bilal.userauthservice.service.auth.handlers;

import aloui.bilal.userauthservice.security.JwtUtil;
import io.helidon.webserver.http.Handler;
import io.helidon.webserver.http.ServerRequest;
import io.helidon.webserver.http.ServerResponse;
import jakarta.json.Json;
import jakarta.json.JsonObject;

import java.util.Optional;

public class AuthMiddleware implements Handler {

    @Override
    public void handle(ServerRequest req, ServerResponse res) throws Exception {

        Optional<String> tokenOpt = JwtUtil.getTokenFromRequest(req);

        if (tokenOpt.isEmpty()) {
            JsonObject response = Json.createObjectBuilder()
                    .add("status", "error")
                    .add("message", "Missing or invalid Authorization header")
                    .build();
            res.status(401).send(response);
            return;
        }

        String token = tokenOpt.get();

        boolean isValid = JwtUtil.verifyToken(token);

        if (!isValid) {
            res.status(401).send(Json.createObjectBuilder()
                    .add("status", "error")
                    .add("message", "Unauthorized: Invalid or expired token")
                    .build());
            return;
        }

        res.next(); // Proceed to next handler
    }
}