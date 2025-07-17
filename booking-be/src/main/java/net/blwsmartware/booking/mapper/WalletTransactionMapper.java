package net.blwsmartware.booking.mapper;

import net.blwsmartware.booking.dto.response.WalletTransactionResponse;
import net.blwsmartware.booking.entity.WalletTransaction;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface WalletTransactionMapper {
    
    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "user.name", target = "userName")
    @Mapping(source = "user.email", target = "userEmail")
    WalletTransactionResponse toResponse(WalletTransaction transaction);
} 