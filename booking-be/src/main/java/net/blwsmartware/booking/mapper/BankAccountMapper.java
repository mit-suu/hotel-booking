package net.blwsmartware.booking.mapper;

import net.blwsmartware.booking.dto.request.BankAccountRequest;
import net.blwsmartware.booking.dto.response.BankAccountResponse;
import net.blwsmartware.booking.entity.BankAccount;
import net.blwsmartware.booking.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface BankAccountMapper {
    
    BankAccountResponse toResponse(BankAccount bankAccount);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    BankAccount toEntity(BankAccountRequest request);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(BankAccountRequest request, @MappingTarget BankAccount bankAccount);
} 