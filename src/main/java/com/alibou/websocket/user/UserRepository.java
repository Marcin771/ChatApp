package com.alibou.websocket.user;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserRepository  extends MongoRepository<User, String> {
    List<User> findAllByStatus(Status status);

    @Query("{'nickName': ?0, 'password': ?1}")
    Optional<User> findUserByNickNameAndPassword(String nickName, String password);
}
