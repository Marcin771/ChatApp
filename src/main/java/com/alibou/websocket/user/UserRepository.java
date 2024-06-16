package com.alibou.websocket.user;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository  extends MongoRepository<User, String> {
    List<User> findAllByStatus(Status status);

    @Query("{'nickName': ?0, 'password': ?1}")
    Optional<User> findUserByNickNameAndPassword(String nickName, String password);


//    @Query("UPDATE User u SET u.status = :status WHERE u.nickName = :nickName AND u.password = :password")
//    void updateUserStatus(@Param("nickName") String nickName, @Param("password") String password, @Param("status") Status status);


}
