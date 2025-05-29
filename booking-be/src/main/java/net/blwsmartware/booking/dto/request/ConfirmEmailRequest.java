package net.blwsmartware.booking.dto.request;

import lombok.Data;

@Data
public class ConfirmEmailRequest {
    private String email;
    private String code;
}
