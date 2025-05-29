package net.blwsmartware.booking.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProfileRequest {

    @NotNull(message = "USER_ID_NOT_NULL")
    UUID userID; //set here

    @NotNull(message = "USERNAME_NOT_NULL")
    String username;

    @NotNull(message = "NAME_NOT_NULL")
    String name;

    LocalDate dob;
    String avatar,thumbnail, title, description,tel;

    @Email(message = "EMAIL_INVALID")
    String email;

}
