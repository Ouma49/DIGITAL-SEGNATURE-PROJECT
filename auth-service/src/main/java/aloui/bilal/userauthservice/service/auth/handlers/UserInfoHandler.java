package aloui.bilal.userauthservice.service.auth.handlers;

import aloui.bilal.userauthservice.dao.IUserDao;
import aloui.bilal.userauthservice.model.User;
import aloui.bilal.userauthservice.security.JwtUtil;
import com.nimbusds.jwt.JWTClaimsSet;
import io.helidon.webserver.http.Handler;
import io.helidon.webserver.http.ServerRequest;
import io.helidon.webserver.http.ServerResponse;
import jakarta.json.Json;
import jakarta.json.JsonObject;

import java.util.Optional;

public class UserInfoHandler implements Handler {

    private final IUserDao userDao;

    public UserInfoHandler(IUserDao userDao) {
        this.userDao = userDao;
    }

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

        JWTClaimsSet claims;

        try {
            claims = JwtUtil.parseBody(token);  // Parse the token
        } catch (Exception e) {
            res.status(401).send(Json.createObjectBuilder()
                    .add("status", "error")
                    .add("message", "Invalid or expired token")
                    .build());
            return;
        }

        Optional<User> userOpt = userDao.findById(Long.valueOf(claims.getSubject()));

        if (userOpt.isEmpty()) {
            // return erreur
            res.status(404).send(Json.createObjectBuilder()
                    .add("status", "error")
                    .add("message", "User not found")
                    .build());
            return;
        }

        User user = userOpt.get();

        JsonObject userInfo = Json.createObjectBuilder()
                .add("email", user.getEmail())
                .add("fullName", user.getFullName())
                .add("organization", (user.getOrganizationName() == null) ? "" : user.getOrganizationName())
                .add("role", user.getRole())
                .build();

        // 3. Build JSON-P response
        JsonObject responseJson = Json.createObjectBuilder()
                .add("status", "success")
                .add("userInfo", userInfo)
                .build();

        res.send(responseJson);
    }
}
