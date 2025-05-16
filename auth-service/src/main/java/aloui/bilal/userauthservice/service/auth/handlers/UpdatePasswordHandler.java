package aloui.bilal.userauthservice.service.auth.handlers;

import aloui.bilal.userauthservice.dao.IUserDao;
import aloui.bilal.userauthservice.model.User;
import aloui.bilal.userauthservice.security.JwtUtil;
import aloui.bilal.userauthservice.security.PasswordUtil;
import com.nimbusds.jwt.JWTClaimsSet;
import io.helidon.http.HeaderNames;
import io.helidon.webserver.http.Handler;
import io.helidon.webserver.http.ServerRequest;
import io.helidon.webserver.http.ServerResponse;
import jakarta.json.Json;
import jakarta.json.JsonObject;

import java.util.Optional;

public class UpdatePasswordHandler implements Handler {

    private final IUserDao userDao;

    public UpdatePasswordHandler(IUserDao userDao) {
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
            claims = JwtUtil.parseBody(token);
        } catch (Exception e) {
            res.status(401).send(Json.createObjectBuilder()
                    .add("status", "error")
                    .add("message", "Invalid or expired token")
                    .build());
            return;
        }

        Optional<User> userOpt = userDao.findById(Long.valueOf(claims.getSubject()));
        if (userOpt.isEmpty()) {
            res.status(404).send(Json.createObjectBuilder()
                    .add("status", "error")
                    .add("message", "User not found")
                    .build());
            return;
        }

        JsonObject reqJson = req.content().as(JsonObject.class);
        String currentPassword = reqJson.getString("current-password", "").trim();
        String newPassword = reqJson.getString("new-password", "").trim();
        String confirmPassword = reqJson.getString("confirm-password", "").trim();

        if (currentPassword.isEmpty() || newPassword.isEmpty() || confirmPassword.isEmpty()) {
            res.status(400).send(Json.createObjectBuilder()
                    .add("status", "error")
                    .add("message", "All fields are required")
                    .build());
            return;
        }

        User user = userOpt.get();
        Optional<String> hashedPassword = userDao.getHashedPassword(user.getId());

        if (hashedPassword.isEmpty()) {
            res.status(500).send(Json.createObjectBuilder()
                    .add("status", "error")
                    .add("message", "Failed to update password")
                    .build());
            return;
        }

        if (!PasswordUtil.verifyPassword(currentPassword, hashedPassword.get())) {
            res.status(401).send(Json.createObjectBuilder()
                    .add("status", "error")
                    .add("message", "Current password is incorrect")
                    .build());
            return;
        }

        if (!newPassword.equals(confirmPassword)) {
            res.status(400).send(Json.createObjectBuilder()
                    .add("status", "error")
                    .add("message", "New passwords do not match")
                    .build());
            return;
        }


        boolean updated = userDao.updatePassword(user.getId(), PasswordUtil.hashPassword(newPassword));
        if (updated) {
            res.send(Json.createObjectBuilder()
                    .add("status", "success")
                    .add("message", "Password updated successfully")
                    .build());
        } else {
            res.status(500).send(Json.createObjectBuilder()
                    .add("status", "error")
                    .add("message", "Failed to update password")
                    .build());
        }
    }
}
