package net.blwsmartware.booking.mapper;

import net.blwsmartware.booking.dto.request.ProfileRequest;
import net.blwsmartware.booking.dto.request.UserRequest;
import net.blwsmartware.booking.dto.request.UserUpdate;
import net.blwsmartware.booking.dto.response.UserResponse;
import net.blwsmartware.booking.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UserMapper {
    User toUser(UserRequest request);
    @Mapping(target = "roles", ignore = true)
    void updateUser(UserUpdate userUpdate,@MappingTarget User user);
    UserResponse toUserResponse(User user);
    ProfileRequest toProfile(User user);
}
