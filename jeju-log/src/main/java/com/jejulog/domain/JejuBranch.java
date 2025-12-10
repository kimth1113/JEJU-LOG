package com.jejulog.domain;

import lombok.Getter;

@Getter
public enum JejuBranch {
    AEWOL("애월점"),
    HAMDEOK("함덕점"),
    SEOGWIPO("서귀포점"),
    JUNGMUN("중문점"),
    UDO("우도점");

    private final String description;

    JejuBranch(String description) {
        this.description = description;
    }
}