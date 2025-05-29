package net.blwsmartware.booking.dto.request;

import lombok.Data;

@Data
public class NewPassRequest {
    private String email;
    private String code;
    private String password;
}
