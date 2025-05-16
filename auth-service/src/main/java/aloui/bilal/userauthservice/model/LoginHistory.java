package aloui.bilal.userauthservice.model;


import java.sql.Timestamp;

public class LoginHistory {

    private final long id;
    private final long userId;
    private final Timestamp loginAt;
    private final String userAgent;
    private final String ipAddress;

    private LoginHistory(Builder builder) {
        this.id = builder.id;
        this.userId = builder.userId;
        this.loginAt = builder.loginAt;
        this.userAgent = builder.userAgent;
        this.ipAddress = builder.ipAddress;
    }

    public long getId() {
        return id;
    }

    public long getUserId() {
        return userId;
    }

    public Timestamp getLoginAt() {
        return loginAt;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public static class Builder {
        private long id;
        private long userId;
        private Timestamp loginAt;
        private String userAgent;
        private String ipAddress;

        public Builder id(long id) {
            this.id = id;
            return this;
        }

        public Builder userId(long userId) {
            this.userId = userId;
            return this;
        }

        public Builder loginAt(Timestamp loginAt) {
            this.loginAt = loginAt;
            return this;
        }

        public Builder userAgent(String userAgent) {
            this.userAgent = userAgent;
            return this;
        }

        public Builder ipAddress(String ipAddress) {
            this.ipAddress = ipAddress;
            return this;
        }

        public LoginHistory build() {
            return new LoginHistory(this);
        }
    }
}
