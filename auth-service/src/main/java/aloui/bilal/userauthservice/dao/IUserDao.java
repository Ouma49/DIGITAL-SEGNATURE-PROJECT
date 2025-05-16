package aloui.bilal.userauthservice.dao;

import aloui.bilal.userauthservice.model.LoginHistory;
import aloui.bilal.userauthservice.model.User;

import java.sql.Timestamp;
import java.util.Optional;

public interface IUserDao extends IDao<Long, User> {

    Optional<User> findByEmail(String email);

    boolean updatePassword(Long userId, String password);

    boolean emailExists(String email);

    Optional<User> login(String email, String password, LoginHistory loginHistory);
    boolean register(User user, String password);

    Optional<String> getHashedPassword(long userId);
}
