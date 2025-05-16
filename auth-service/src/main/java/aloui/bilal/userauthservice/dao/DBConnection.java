package aloui.bilal.userauthservice.dao;

import io.helidon.config.Config;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DBConnection {

    private static Connection connection = null;
    private static final String URL;
    private static final String USER;
    private static final String PASSWORD;

    static {

        Config dbConfig = Config.create().get("db");
        URL = dbConfig.get("url").asString().orElse(null);
        USER = dbConfig.get("user").asString().orElse(null);
        PASSWORD = dbConfig.get("password").asString().orElse(null);

    }

    // Private constructor to prevent instantiation
    private DBConnection() {
    }

    // Get the single instance of the database connection
    public static Connection getConnection() throws SQLException {
        if (connection == null) {
            synchronized (DBConnection.class) {
                if (connection == null) {
                    try {
                        // Establish the connection
                        connection = DriverManager.getConnection(URL, USER, PASSWORD);
                        System.out.println("Database connection established.");
                    } catch (SQLException e) {
                        throw new SQLException("Failed to create database connection.", e);
                    }
                }
            }
        }
        return connection;
    }

    // Method to close the connection (if necessary)
    public static void closeConnection() {
        if (connection != null) {
            try {
                connection.close();
                connection = null;
                System.out.println("Database connection closed.");
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }
}
