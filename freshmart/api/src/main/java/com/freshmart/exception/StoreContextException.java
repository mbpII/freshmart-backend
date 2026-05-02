package com.freshmart.exception;

public class StoreContextException extends RuntimeException {

    private StoreContextException(String message) {
        super(message);
    }

    public static StoreContextException missing() {
        return new StoreContextException("Missing store id. Please provide store identifier");
    }

    public static StoreContextException invalid() {
        return new StoreContextException("A valid storeId is required to perform this operation.");
    }
}
