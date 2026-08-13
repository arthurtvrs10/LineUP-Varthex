package com.backend.users;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;


public enum Role {
    SUPER_ADMIN,
    ADMIN,
    BARBER,
    CLIENT;

    public String getAuthority(){
        return "ROLE_" + this.name();
    }
}
