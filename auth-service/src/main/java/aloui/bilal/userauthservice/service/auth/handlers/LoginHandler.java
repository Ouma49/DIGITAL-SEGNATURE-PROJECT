package aloui.bilal.userauthservice.service.auth.handlers;

import aloui.bilal.userauthservice.dao.IUserDao;
import aloui.bilal.userauthservice.model.LoginHistory;
import aloui.bilal.userauthservice.model.User;
import aloui.bilal.userauthservice.security.JwtUtil;
import io.helidon.http.HeaderNames;
import io.helidon.webserver.http.Handler;
import io.helidon.webserver.http.ServerRequest;
import io.helidon.webserver.http.ServerResponse;
import jakarta.json.Json;
import jakarta.json.JsonObject;

import java.util.Optional;

public class LoginHandler implements Handler {

    private final IUserDao userDao;

    public LoginHandler(IUserDao userDao) {
        this.userDao = userDao;
    }

    @Override
    public void handle(ServerRequest req, ServerResponse res) throws Exception {
        JsonObject reqJson = req.content().as(JsonObject.class);

        String email = reqJson.getString("email");
        String password = reqJson.getString("password");

        String ipAddress = req.headers()
                .first(HeaderNames.X_FORWARDED_FOR)
                .orElse("127.0.0.1");

        String userAgent = req.headers()
                .first(HeaderNames.USER_AGENT)
                .orElse("Unknown");

        LoginHistory history = new LoginHistory.Builder()
                .userAgent(userAgent)
                .ipAddress(ipAddress)
                .build();

        Optional<User> userOpt = userDao.login(email, password, history);

        if (userOpt.isEmpty()) {
            JsonObject errorJson = Json.createObjectBuilder()
                    .add("status", "error")
                    .add("message", "Invalid email or password")
                    .build();
            res.status(401).send(errorJson);
            return;
        }

        User user = userOpt.get();

        JsonObject userInfo = Json.createObjectBuilder()
                .add("email", email)
                .add("fullName", user.getFullName())
                .add("organization", (user.getOrganizationName() == null) ? "" : user.getOrganizationName())
                .add("role", user.getRole())
                .build();

        // 2. Generate JWT
        String token = JwtUtil.generateToken(user.getId(), user.getRole());

        // 3. Build JSON-P response
        JsonObject responseJson = Json.createObjectBuilder()
                .add("status", "success")
                .add("token", token)
                .add("userInfo", userInfo)
                .build();

        res.status(200).send(responseJson);
    }
}
