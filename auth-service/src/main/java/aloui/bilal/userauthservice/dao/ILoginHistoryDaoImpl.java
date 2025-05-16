package aloui.bilal.userauthservice.dao;

import aloui.bilal.userauthservice.model.LoginHistory;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class ILoginHistoryDaoImpl implements ILoginHistoryDao {

    private final Connection conn;

    public ILoginHistoryDaoImpl() throws SQLException {
        this.conn = DBConnection.getConnection();
    }

    @Override
    public List<LoginHistory> findByUserId(long userId) {
        List<LoginHistory> loginHistoryList = new ArrayList<>();
        String query = "SELECT * FROM login_history WHERE user_id = ? ORDER BY login_at DESC";

        try (PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setLong(1, userId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {

                    LoginHistory loginHistory = new LoginHistory.Builder()
                            .id(rs.getLong("id"))
                            .userId(rs.getLong("user_id"))
                            .loginAt(rs.getTimestamp("login_at"))
                            .userAgent(rs.getString("user_agent"))
                            .ipAddress(rs.getString("ip_address"))
                            .build();

                    loginHistoryList.add(loginHistory);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace(); // Log the error appropriately
        }
        return loginHistoryList;
    }

    @Override
    public List<LoginHistory> findAll() {
        List<LoginHistory> loginHistoryList = new ArrayList<>();
        String query = "SELECT * FROM login_history ORDER BY login_at DESC";

        try (Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(query)) {

            while (rs.next()) {

                LoginHistory loginHistory = new LoginHistory.Builder()
                        .id(rs.getLong("id"))
                        .userId(rs.getLong("user_id"))
                        .loginAt(rs.getTimestamp("login_at"))
                        .userAgent(rs.getString("user_agent"))
                        .ipAddress(rs.getString("ip_address"))
                        .build();

                loginHistoryList.add(loginHistory);
            }
        } catch (SQLException e) {
            e.printStackTrace(); // Log the error appropriately
        }
        return loginHistoryList;
    }

    @Override
    public Optional<LoginHistory> findById(Long id) {
        String query = "SELECT * FROM login_history WHERE id = ?";
        try (PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setLong(1, id);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {

                    LoginHistory loginHistory = new LoginHistory.Builder()
                            .id(rs.getLong("id"))
                            .userId(rs.getLong("user_id"))
                            .loginAt(rs.getTimestamp("login_at"))
                            .userAgent(rs.getString("user_agent"))
                            .ipAddress(rs.getString("ip_address"))
                            .build();

                    return Optional.of(loginHistory);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace(); // Log the error appropriately
        }
        return Optional.empty();
    }

    @Override
    public boolean save(LoginHistory value) {
        String query = "INSERT INTO login_history (user_id, user_agent, ip_address) VALUES (?, ?, ?)";
        try (PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setLong(1, value.getUserId());
            stmt.setString(2, value.getUserAgent());
            stmt.setString(3, value.getIpAddress());
            int rowsAffected = stmt.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException e) {
            e.printStackTrace(); // Log the error appropriately
        }
        return false;
    }

    @Override
    public boolean update(Long id, LoginHistory value) {
        String query = "UPDATE login_history SET user_agent = ?, ip_address = ? WHERE id = ?";
        try (PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, value.getUserAgent());
            stmt.setString(2, value.getIpAddress());
            stmt.setLong(3, id);
            int rowsAffected = stmt.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException e) {
            e.printStackTrace(); // Log the error appropriately
        }
        return false;
    }

    @Override
    public boolean delete(Long id) {
        String query = "DELETE FROM login_history WHERE id = ?";
        try (PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setLong(1, id);
            int rowsAffected = stmt.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException e) {
            e.printStackTrace(); // Log the error appropriately
        }
        return false;
    }
}