package aloui.bilal.userauthservice.model;

import java.sql.Timestamp;

public class User {

    private Long id;
    private String fullName;
    private String email;
    private int role;
    private String organizationName;

    // Private constructor
    private User(Builder builder) {
        this.id = builder.id;
        this.fullName = builder.fullName;
        this.email = builder.email;
        this.role = builder.role;
        this.organizationName = builder.organizationName;
    }

    // Getters
    public Long getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public int getRole() {
        return role;
    }

    public String getOrganizationName() {
        return organizationName;
    }


    // Builder Class
    public static class Builder {
        private Long id;
        private String fullName;
        private String email;
        private int role;
        private String organizationName;

        public Builder() {}

        public Builder(User user) {
            this.id = user.id;
            this.fullName = user.fullName;
            this.email = user.email;
            this.role = user.role;
            this.organizationName = user.organizationName;
        }

        public Builder id(Long id) {
            this.id = id;
            return this;
        }

        public Builder fullName(String fullName) {
            this.fullName = fullName;
            return this;
        }

        public Builder email(String email) {
            this.email = email;
            return this;
        }

        public Builder role(int role) {
            this.role = role;
            return this;
        }

        public Builder organizationName(String organizationName) {
            this.organizationName = organizationName;
            return this;
        }


        public User build() {
            return new User(this);
        }
    }
}