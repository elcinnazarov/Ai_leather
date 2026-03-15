package com.aiatelye.leather.Securty.model;

import lombok.Data;

@Data
public class UsernameAndPasswordAuthentication {
    private String email;
    private String password;
}
