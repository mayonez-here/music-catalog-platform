package com.musiccatalog.exception;

/** Thrown for auth failures we want to surface with a clean message, distinct from Spring's own. */
public class BadCredentialsAppException extends RuntimeException {
    public BadCredentialsAppException(String message) {
        super(message);
    }
}
