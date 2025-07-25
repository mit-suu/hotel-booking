package net.blwsmartware.booking.service.impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import net.blwsmartware.booking.dto.request.RoleRequest;
import net.blwsmartware.booking.dto.request.RoleUpdate;
import net.blwsmartware.booking.dto.response.DataResponse;
import net.blwsmartware.booking.dto.response.RoleResponse;
import net.blwsmartware.booking.entity.Role;
import net.blwsmartware.booking.enums.ErrorResponse;
import net.blwsmartware.booking.exception.AppRuntimeException;
import net.blwsmartware.booking.mapper.RoleMapper;
import net.blwsmartware.booking.repository.RoleRepository;
import net.blwsmartware.booking.service.RoleService;
import net.blwsmartware.booking.util.DataResponseUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RoleServiceImpl implements RoleService {
    RoleRepository roleRepository;
    RoleMapper roleMapper;

    @Override
    public RoleResponse createRole(RoleRequest request){
        Role role = roleMapper.toRole(request);
        return roleMapper.toRoleResponse(roleRepository.save(role));
    }

    @Override
    public DataResponse<RoleResponse> getAll(Integer pageNumber, Integer pageSize, String sortBy) {

        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).ascending());
        Page<Role> pageOfRole = roleRepository.findAll(pageable);
        List<Role> roleList = pageOfRole.getContent();
        List<RoleResponse> roleResponseList = roleList.stream().map(roleMapper::toRoleResponse).toList();

        return DataResponseUtils.convertPageInfo(pageOfRole,roleResponseList);
    }

    @Override
    public RoleResponse getRoleByID(int id) {
        return roleMapper.toRoleResponse(roleRepository.findById(id)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.ROLE_NOT_EXISTED))
        ) ;
    }
    @Override
    public RoleResponse getRoleByName(String name) {
        return roleMapper.toRoleResponse(roleRepository.findByName(name)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.ROLE_NOT_EXISTED))
        ) ;
    }
    @Override
    public RoleResponse updateRole(int id, RoleUpdate request) {
        Role old = roleRepository.findById(id)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.ROLE_NOT_EXISTED));
        roleMapper.updateRole(request, old);
        return roleMapper.toRoleResponse(roleRepository.save(old)) ;
    }
    @Override
    public void delete(int id){
        roleRepository.deleteById(id);
    }

}
