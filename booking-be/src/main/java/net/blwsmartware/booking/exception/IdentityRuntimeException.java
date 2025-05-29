package net.blwsmartware.booking.exception;

import lombok.Getter;
import lombok.Setter;
import net.blwsmartware.booking.enums.ErrorResponse;

@Getter
@Setter
public class IdentityRuntimeException extends RuntimeException{
    private ErrorResponse errorResponse;
    public IdentityRuntimeException(ErrorResponse errorResponse) {
        super(errorResponse.getMessage());
        this.errorResponse = errorResponse;
    }
}
