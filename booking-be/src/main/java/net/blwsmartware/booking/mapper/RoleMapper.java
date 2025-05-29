package net.blwsmartware.booking.mapper;

import net.blwsmartware.booking.dto.request.RoleRequest;
import net.blwsmartware.booking.dto.request.RoleUpdate;
import net.blwsmartware.booking.dto.response.RoleResponse;
import net.blwsmartware.booking.entity.Role;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface RoleMapper {

    Role toRole(RoleRequest request);
    void updateRole(RoleUpdate userUpdate, @MappingTarget Role newRole);
    RoleResponse toRoleResponse(Role role);

}
