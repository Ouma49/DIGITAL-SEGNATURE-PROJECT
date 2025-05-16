package aloui.bilal.userauthservice.dao;

import java.util.List;
import java.util.Optional;

public interface IDao<K, V> {

    List<V> findAll();

    Optional<V> findById(K id);

    boolean save(V value);

    boolean update(K id, V value);

    boolean delete(K id);
}
