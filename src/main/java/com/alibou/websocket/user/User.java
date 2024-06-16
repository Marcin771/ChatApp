package com.alibou.websocket.user;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@Document(collection = "user")
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    private String nickName;
    private String password;
    private Status status;
}
