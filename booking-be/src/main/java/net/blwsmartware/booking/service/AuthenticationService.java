package net.blwsmartware.booking.service;

import net.blwsmartware.booking.dto.request.AuthenRequest;
import net.blwsmartware.booking.dto.request.LogoutRequest;
import net.blwsmartware.booking.dto.request.RefreshRequest;
import net.blwsmartware.booking.dto.request.VerifyRequest;
import net.blwsmartware.booking.dto.response.AuthenResponse;
import net.blwsmartware.booking.dto.response.VerifyResponse;

public interface AuthenticationService {
    VerifyResponse verify(VerifyRequest request);
    AuthenResponse authentication(AuthenRequest request);
    void logout(LogoutRequest request);
    AuthenResponse refreshToken(RefreshRequest request);
}
