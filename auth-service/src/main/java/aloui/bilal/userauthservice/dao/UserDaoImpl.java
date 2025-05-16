package aloui.bilal.userauthservice.dao;

import aloui.bilal.userauthservice.model.LoginHistory;
import aloui.bilal.userauthservice.model.User;
import aloui.bilal.userauthservice.security.PasswordUtil;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class UserDaoImpl implements IUserDao {

    private final Connection conn;

    public UserDaoImpl() throws SQLException {
        this.conn = DBConnection.getConnection();
    }

    @Override
    public Optional<User> findByEmail(String email) {
        String sql = "SELECT * FROM users WHERE email = ?";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, email);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return Optional.of(mapResultSetToUser(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return Optional.empty();
    }

    @Override
    public boolean updatePassword(Long userId, String hashedPassword) {
        String sql = "UPDATE users SET hashed_password = ? WHERE id = ?";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, hashedPassword);
            stmt.setLong(2, userId);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    @Override
    public boolean emailExists(String email) {
        String sql = "SELECT 1 FROM users WHERE email = ?";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, email);
            ResultSet rs = stmt.executeQuery();
            return rs.next();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    @Override
    public Optional<User> login(String email, String password, LoginHistory loginHistory) {
        String findUserSql = "SELECT * FROM users WHERE email = ?";
        String insertLoginHistorySql = "INSERT INTO login_history (user_id, user_agent, ip_address) VALUES (?, ?, ?)";

        try {
            conn.setAutoCommit(false); // Start transaction

            User user = null;

            // Step 1: Find user by email
            try (PreparedStatement stmt = conn.prepareStatement(findUserSql)) {
                stmt.setString(1, email);
                ResultSet rs = stmt.executeQuery();

                if (rs.next()) {
                    String hashedPassword = rs.getString("hashed_password");

                    // Verify password (using bcrypt or your own logic)
                    if (!PasswordUtil.verifyPassword(password, hashedPassword)) {
                        conn.rollback();
                        return Optional.empty();
                    }

                    // Construct user
                    user = new User.Builder().
                            id( rs.getLong("id"))
                            .fullName(rs.getString("full_name"))
                            .email(rs.getString("email"))
                            .role(rs.getInt("role_id"))
                            .organizationName(rs.getString("organization_name"))
                            .build();

                } else {
                    conn.rollback();
                    return Optional.empty(); // Email not found
                }
            }

            // Step 2: Insert login history
            try (PreparedStatement stmt = conn.prepareStatement(insertLoginHistorySql)) {
                stmt.setLong(1, user.getId());
                stmt.setString(2, loginHistory.getUserAgent());
                stmt.setString(3, loginHistory.getIpAddress());
                stmt.executeUpdate();
            }

            conn.commit(); // All good
            return Optional.of(user);

        } catch (SQLException e) {
            try {
                conn.rollback();
            } catch (SQLException ex) {
                ex.printStackTrace();
            }
            e.printStackTrace();
            return Optional.empty();
        } finally {
            try {
                conn.setAutoCommit(true);
            } catch (SQLException ex) {
                ex.printStackTrace();
            }
        }
    }

    @Override
    public boolean register(User user, String password) {

        String sql = "INSERT INTO users (full_name, email, hashed_password, role_id, organization_name) VALUES (?, ?, ?, ?, ?)";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, user.getFullName());
            stmt.setString(2, user.getEmail());
            stmt.setString(3, PasswordUtil.hashPassword(password));
            stmt.setInt(4, user.getRole());
            stmt.setString(5, user.getOrganizationName());
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }

        return false;
    }

    @Override
    public Optional<String> getHashedPassword(long userId) {
        String sql = "SELECT hashed_password FROM users WHERE id = ?";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, userId);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return Optional.of(rs.getString("hashed_password"));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return Optional.empty();
    }

    @Override
    public List<User> findAll() {
        List<User> users = new ArrayList<>();
        String sql = "SELECT * FROM users";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                users.add(mapResultSetToUser(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return users;
    }

    @Override
    public Optional<User> findById(Long id) {
        String sql = "SELECT * FROM users WHERE id = ?";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, id);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return Optional.of(mapResultSetToUser(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return Optional.empty();
    }

    @Override
    public boolean save(User user) {
       return false;
    }

    @Override
    public boolean update(Long id, User user) {
        String sql = "UPDATE users SET full_name = ?, email = ?, organization_name = ? WHERE id = ?";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, user.getFullName());
            stmt.setString(2, user.getEmail());
            stmt.setString(3, user.getOrganizationName());
            stmt.setLong(4, id);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    @Override
    public boolean delete(Long id) {
        String sql = "DELETE FROM users WHERE id = ?";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, id);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    private User mapResultSetToUser(ResultSet rs) throws SQLException {
        User user = new User.Builder()
                .id(rs.getLong("id"))
                .fullName(rs.getString("full_name"))
                .email(rs.getString("email"))
                .role(rs.getInt("role_id"))
                .organizationName(rs.getString("organization_name"))
                .build();
        return user;
    }
}

