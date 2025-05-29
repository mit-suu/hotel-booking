package net.blwsmartware.booking.controller;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import net.blwsmartware.booking.constant.PagePrepare;
import net.blwsmartware.booking.dto.request.RoleRequest;
import net.blwsmartware.booking.dto.request.RoleUpdate;
import net.blwsmartware.booking.dto.response.DataResponse;
import net.blwsmartware.booking.dto.response.MessageResponse;
import net.blwsmartware.booking.dto.response.RoleResponse;
import net.blwsmartware.booking.service.RoleService;
import net.blwsmartware.booking.validator.IsAdmin;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/roles")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE,makeFinal = true)
@Slf4j
public class RoleController {
    RoleService roleService;

    @PostMapping
    @IsAdmin
    public ResponseEntity<MessageResponse<RoleResponse>> createRole(@RequestBody @Valid RoleRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(MessageResponse.<RoleResponse>builder()
                        .result(roleService.createRole(request))
                        .build()
                );
    }
    @GetMapping
    @IsAdmin
    public ResponseEntity<MessageResponse<DataResponse<RoleResponse>>> getAllPageable(
            @RequestParam(value = "pageNumber",defaultValue = PagePrepare.PAGE_NUMBER,required = false) Integer pageNumber,
            @RequestParam(value = "pageSize", defaultValue = PagePrepare.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(value = "sortBy",defaultValue = PagePrepare.SORT_BY, required = false) String sortBy) {

        return ResponseEntity
                .status(HttpStatus.OK)
                    .body(MessageResponse.<DataResponse<RoleResponse>>builder()
                    .result(roleService.getAll(pageNumber,pageSize,sortBy))
                .build());
    }
    @IsAdmin
    @GetMapping("/name/{name}")
    public ResponseEntity<MessageResponse<RoleResponse>> getRoleByName(@PathVariable String name){

        return ResponseEntity
                .status(HttpStatus.OK)
                    .body(MessageResponse.<RoleResponse>builder()
                    .result(roleService.getRoleByName(name))
                .build());
    }
    @IsAdmin
    @GetMapping("/{id}")
    public ResponseEntity<MessageResponse<RoleResponse>> getRole(@PathVariable int id){

        return ResponseEntity
                .status(HttpStatus.OK)
                    .body(MessageResponse.<RoleResponse>builder()
                    .result(roleService.getRoleByID(id))
                .build());
    }
    @IsAdmin
    @PutMapping("/{id}")
    public ResponseEntity<MessageResponse<RoleResponse>> updateRole(@RequestBody @Valid RoleUpdate role, @PathVariable int id) {
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(MessageResponse.<RoleResponse>builder()
                    .result(roleService.updateRole(id,role))
                    .build()
                );
    }
    @IsAdmin
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRole(@PathVariable int id) {

        roleService.delete(id);

        return ResponseEntity.noContent().build();

    }





}
