package net.blwsmartware.booking.validator;

import org.springframework.security.access.prepost.PreAuthorize;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@PreAuthorize("hasRole(@roleValidator.USER_ROLE) or hasRole(@roleValidator.HOST_ROLE) or hasRole(@roleValidator.ADMIN_ROLE)")
public @interface IsUser {
}