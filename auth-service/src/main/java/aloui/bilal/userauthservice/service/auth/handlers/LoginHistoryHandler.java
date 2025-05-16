package aloui.bilal.userauthservice.service.auth.handlers;

import aloui.bilal.userauthservice.dao.ILoginHistoryDao;
import aloui.bilal.userauthservice.model.LoginHistory;
import aloui.bilal.userauthservice.security.JwtUtil;
import com.nimbusds.jwt.JWTClaimsSet;
import io.helidon.http.HeaderNames;
import io.helidon.webserver.http.Handler;
import io.helidon.webserver.http.ServerRequest;
import io.helidon.webserver.http.ServerResponse;
import jakarta.json.Json;
import jakarta.json.JsonArrayBuilder;
import jakarta.json.JsonObject;

import java.util.List;
import java.util.Optional;

public class LoginHistoryHandler implements Handler {
    private final ILoginHistoryDao loginHistoryDao;

    public LoginHistoryHandler(ILoginHistoryDao loginHistoryDao) {
        this.loginHistoryDao = loginHistoryDao;
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


        long userId = Long.parseLong(claims.getSubject());

        List<LoginHistory> histories = loginHistoryDao.findByUserId(userId);

        JsonArrayBuilder jsonArray = Json.createArrayBuilder();
        for (LoginHistory history : histories) {
            jsonArray.add(Json.createObjectBuilder()
                    .add("ipAddress", history.getIpAddress())
                    .add("userAgent", history.getUserAgent())
                    .add("loginAt", history.getLoginAt().toInstant().getEpochSecond())
            );
        }

        JsonObject responseJson = Json.createObjectBuilder()
                .add("status", "success")
                .add("history", jsonArray)
                .build();

        res.send(responseJson);
    }
}