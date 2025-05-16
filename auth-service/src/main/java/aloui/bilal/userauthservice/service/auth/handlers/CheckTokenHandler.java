package aloui.bilal.userauthservice.service.auth.handlers;

import aloui.bilal.userauthservice.security.JwtUtil;
import io.helidon.webserver.http.Handler;
import io.helidon.webserver.http.ServerRequest;
import io.helidon.webserver.http.ServerResponse;
import jakarta.json.Json;
import jakarta.json.JsonObject;

import java.util.Optional;

public class CheckTokenHandler implements Handler {

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

        try {
            boolean isValid = JwtUtil.verifyToken(token);

            JsonObject response = Json.createObjectBuilder()
                    .add("status", isValid ? "success" : "error")
                    .add("valid", isValid)
                    .build();

            res.status(isValid ? 200 : 401).send(response);

        } catch (Exception e) {
            JsonObject errorResponse = Json.createObjectBuilder()
                    .add("status", "error")
                    .add("valid", false)
                    .build();
            res.status(401).send(errorResponse);
        }
    }

}
