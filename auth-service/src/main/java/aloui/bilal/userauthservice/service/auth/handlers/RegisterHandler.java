package aloui.bilal.userauthservice.service.auth.handlers;

import aloui.bilal.userauthservice.dao.IUserDao;
import aloui.bilal.userauthservice.model.User;
import aloui.bilal.userauthservice.security.PasswordUtil;
import io.helidon.webserver.http.Handler;
import io.helidon.webserver.http.ServerRequest;
import io.helidon.webserver.http.ServerResponse;
import jakarta.json.Json;
import jakarta.json.JsonObject;

public class RegisterHandler implements Handler {

    private final IUserDao userDao;

    public RegisterHandler(IUserDao userDao) {
        this.userDao = userDao;
    }

    @Override
    public void handle(ServerRequest req, ServerResponse res) throws Exception {

        JsonObject reqJson = req.content().as(JsonObject.class);

        String name = reqJson.getString("name", "").trim();
        String email = reqJson.getString("email", "").trim();
        String password = reqJson.getString("password", "").trim();

        // Basic input validation
        if (name.isEmpty() || email.isEmpty() || password.isEmpty()) {
            JsonObject error = Json.createObjectBuilder()
                    .add("status", "error")
                    .add("message", "All fields (name, email, password) are required.")
                    .build();
            res.status(400).send(error);
            return;
        }

        if (!email.matches("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$")) {
            JsonObject error = Json.createObjectBuilder()
                    .add("status", "error")
                    .add("message", "Invalid email format.")
                    .build();
            res.status(400).send(error);
            return;
        }

        // All good: return success for now
        JsonObject success = Json.createObjectBuilder()
                .add("status", "success")
                .add("message", "Registration success.")
                .build();

        User user = new User.Builder()
                .fullName(name)
                .email(email)
                .role(2)
                .build();

        if (userDao.register(user, password)) {
            res.status(200).send(success);
        } else {
            res.status(500).send(Json.createObjectBuilder()
                    .add("status", "error")
                    .add("message", "Internal server error.")
                    .build());
        }
    }
}
