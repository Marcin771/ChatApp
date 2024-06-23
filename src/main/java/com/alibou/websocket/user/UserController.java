package com.alibou.websocket.user;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;
import java.util.Optional;

@Controller
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;


    @PostMapping("/app/registerUser")
    @ResponseBody
    public ResponseEntity<String> registerUser(@RequestBody User user) {
        if (user.getNickName() == null || user.getNickName().isEmpty() ||
                user.getPassword() == null || user.getPassword().isEmpty()) {
            return ResponseEntity.badRequest().body("Nickname and password are required.");
        }
        Optional<User> userById = userService.findUserByNickNameAndPassword(user.getNickName(), user.getPassword());

        if(userById.isPresent()){
            return ResponseEntity.badRequest().body("User with the same nickname already exist in database");
        }
        userService.saveUser(user);
        return ResponseEntity.ok("User registered successfully");
    }


    @PostMapping("/app/loginUser")
    @ResponseBody
    public ResponseEntity<String> loginUser(@RequestBody User user) {
        if (user.getNickName() == null || user.getNickName().isEmpty() ||
                user.getPassword() == null || user.getPassword().isEmpty()) {
            return ResponseEntity.badRequest().body("Nickname and password are required.");
        }

        Optional<User> existingUserOptional = userService.findUserByNickNameAndPassword(user.getNickName(), user.getPassword());

        if (existingUserOptional.isPresent()) {
            User existingUser = existingUserOptional.get();
            existingUser.setStatus(Status.ONLINE);
            userService.saveUser(existingUser);
            return ResponseEntity.ok("User logged in successfully");
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid nickname or password.");
        }
    }

//  Po dodaniu funkcjonalności Rejestracji metoda niepotrzebna
//    @MessageMapping("/user.addUser")
//    @SendTo("/user/public")
//    public User addUser(
//            @Payload User user
//    ) {
//        userService.saveUser(user);
//        return user;
//    }

    @MessageMapping("/user.disconnectUser")
    @SendTo("/user/public")
    public User disconnectUser(
            @Payload User user
    ) {
        userService.disconnect(user);
        return user;
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> findConnectedUsers() {
        return ResponseEntity.ok(userService.findConnectedUsers());
    }
}
