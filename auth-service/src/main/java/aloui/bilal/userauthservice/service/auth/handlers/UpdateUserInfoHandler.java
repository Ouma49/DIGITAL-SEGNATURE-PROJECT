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

public class UpdateUserInfoHandler implements Handler {
    private final IUserDao userDao;

    public UpdateUserInfoHandler(IUserDao userDao) {
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

        // Get user from database
        Optional<User> userOpt = userDao.findById(Long.valueOf(claims.getSubject()));

        if (userOpt.isEmpty()) {
            res.status(404).send(Json.createObjectBuilder()
                    .add("status", "error")
                    .add("message", "User not found")
                    .build());
            return;
        }


        // Extract new profile data from request
        JsonObject reqJson = req.content().as(JsonObject.class);
        String newFullName = reqJson.getString("name");
        String newOrganizationName = reqJson.getString("company");

        // Update the user's profile
        User user = new User.Builder(userOpt.get())
                .fullName(newFullName)
                .organizationName(newOrganizationName)
                .build();


        // Save the updated user to the database
        boolean updateSuccess = userDao.update(user.getId(), user);

        if (updateSuccess) {
            JsonObject updatedUserInfo = Json.createObjectBuilder()
                    .add("email", user.getEmail())
                    .add("fullName", user.getFullName())
                    .add("organization", (user.getOrganizationName() == null) ? "" : user.getOrganizationName())
                    .add("role", user.getRole())
                    .build();

            JsonObject responseJson = Json.createObjectBuilder()
                    .add("status", "success")
                    .add("userInfo", updatedUserInfo)
                    .build();

            res.send(responseJson);
        } else {
            res.status(500).send(Json.createObjectBuilder()
                    .add("status", "error")
                    .add("message", "Failed to update profile")
                    .build());
        }

    }
}
