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

@Controller
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;


    @PostMapping("/app/registerUser")
    @ResponseBody // Dodajemy, aby zwrócić odpowiedź jako ciało odpowiedzi HTTP
    public ResponseEntity<String> registerUser(@RequestBody User user) {
        // Upewniamy się, że przekazane dane są prawidłowe
        if (user.getNickName() == null || user.getNickName().isEmpty() ||
                user.getPassword() == null || user.getPassword().isEmpty()) {
            String a = user.toString();
            return ResponseEntity.badRequest().body("Nickname and password are required.");
        }

        // Zapisujemy użytkownika
        userService.saveUser(user);

        // Zwracamy odpowiedź HTTP 200 OK z komunikatem
        return ResponseEntity.ok("User registered successfully");
    }

    @MessageMapping("/user.addUser")
    @SendTo("/user/public")
    public User addUser(
            @Payload User user
    ) {
        userService.saveUser(user);
        return user;
    }

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
