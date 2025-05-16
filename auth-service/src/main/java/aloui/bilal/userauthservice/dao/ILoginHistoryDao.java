package aloui.bilal.userauthservice.dao;

import aloui.bilal.userauthservice.model.LoginHistory;

import java.util.List;

public interface ILoginHistoryDao extends IDao<Long, LoginHistory> {

    List<LoginHistory> findByUserId(long userId);
}
