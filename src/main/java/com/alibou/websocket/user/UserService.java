package com.alibou.websocket.user;


import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.mongodb.core.query.Query;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository repository;
    private final MongoTemplate mongoTemplate;

    public void saveUser(User user) {
//  Po dodaniu funkcjonalności Rejestracji zmiana statusu jest w innym miejscu
//        user.setStatus(Status.ONLINE);
        repository.save(user);
    }

    public void disconnect(User user) {
        Optional<User> storedUserOptional = Optional.ofNullable(repository.findById(user.getNickName()).orElse(null));
        if (storedUserOptional.isPresent()) {
            User storedUser = storedUserOptional.get();
            storedUser.setStatus(Status.OFFLINE);
            repository.save(storedUser);
        }
    }

    public List<User> findConnectedUsers() {
        return repository.findAllByStatus(Status.ONLINE);
    }

    public Optional<User> findUserByNickNameAndPassword(String nickName, String password) {
        return repository.findUserByNickNameAndPassword(nickName, password);
    }


    @Transactional
    public void updateUserStatus(User user, Status status) {

        Query query = new Query(Criteria.where("nickName").is(user.getNickName()).and("password").is(user.getPassword()));
        Update update = new Update().set("status", status);
        mongoTemplate.updateFirst(query,update,User.class);
    }
}
