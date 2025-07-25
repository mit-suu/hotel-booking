package net.blwsmartware.booking.mapper;

import net.blwsmartware.booking.dto.request.ProfileRequest;
import net.blwsmartware.booking.dto.request.ProfileUpdateRequest;
import net.blwsmartware.booking.dto.request.UserRequest;
import net.blwsmartware.booking.dto.request.UserUpdate;
import net.blwsmartware.booking.dto.response.UserResponse;
import net.blwsmartware.booking.dto.response.RoleResponse;
import net.blwsmartware.booking.entity.User;
import net.blwsmartware.booking.entity.Role;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;

import java.util.Collections;
import java.util.List;

@Mapper(componentModel = "spring", uses = {RoleMapper.class})
public interface UserMapper {

    User toUser(UserRequest request);

    @Mapping(target = "role", ignore = true)
    void updateUser(UserUpdate userUpdate,@MappingTarget User user);

    @Mapping(target = "role", ignore = true)
    @Mapping(target = "active", ignore = true)
    @Mapping(target = "emailVerified", ignore = true)
    @Mapping(target = "password", ignore = true)
    void updateProfile(ProfileUpdateRequest profileUpdate, @MappingTarget User user);

    @Mapping(target = "roles", source = "role", qualifiedByName = "roleToRoles")
    UserResponse toUserResponse(User user);

    @Named("roleToRoles")
    default List<RoleResponse> roleToRoles(Role role) {
        if (role == null) {
            return Collections.emptyList();
        }
        RoleResponse roleResponse = RoleResponse.builder()
                .id(role.getId())
                .name(role.getName())
                .description(role.getDescription())
                .build();
        return Collections.singletonList(roleResponse);
    }
}
