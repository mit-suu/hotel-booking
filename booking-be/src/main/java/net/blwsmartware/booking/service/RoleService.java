package net.blwsmartware.booking.service;

import net.blwsmartware.booking.dto.request.RoleRequest;
import net.blwsmartware.booking.dto.request.RoleUpdate;
import net.blwsmartware.booking.dto.response.DataResponse;
import net.blwsmartware.booking.dto.response.RoleResponse;

public interface RoleService {
    RoleResponse createRole(RoleRequest request);
    RoleResponse getRoleByID(int id);
    RoleResponse getRoleByName(String name);
    RoleResponse updateRole(int id, RoleUpdate roleUpdate);
    void delete(int id);
    DataResponse<RoleResponse> getAll(Integer pageNumber, Integer pageSize, String sortBy);
}
