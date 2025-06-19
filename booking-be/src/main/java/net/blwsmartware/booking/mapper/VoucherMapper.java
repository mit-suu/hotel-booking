package net.blwsmartware.booking.mapper;

import net.blwsmartware.booking.dto.request.VoucherCreateRequest;
import net.blwsmartware.booking.dto.request.VoucherUpdateRequest;
import net.blwsmartware.booking.dto.response.VoucherResponse;
import net.blwsmartware.booking.entity.Voucher;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", uses = {HotelMapper.class})
public interface VoucherMapper {
    
    // Convert Voucher entity to VoucherResponse
    @Named("toResponse")
    @Mapping(target = "applicableHotels", source = "applicableHotels", qualifiedByName = "toResponseWithoutRelations")
    VoucherResponse toResponse(Voucher voucher);
    
    // Convert Voucher entity to VoucherResponse without hotel details (for list view)
    @Named("toResponseWithoutHotels")
    @Mapping(target = "applicableHotels", ignore = true)
    VoucherResponse toResponseWithoutHotels(Voucher voucher);
    
    // Convert VoucherCreateRequest to Voucher entity
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "usageCount", constant = "0")
    @Mapping(target = "status", constant = "ACTIVE")
    @Mapping(target = "applicableHotels", ignore = true) // Will be set manually
    @Mapping(target = "voucherUsages", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    Voucher toEntity(VoucherCreateRequest request);
    
    // Update Voucher entity from VoucherUpdateRequest
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "code", ignore = true) // Code cannot be updated
    @Mapping(target = "usageCount", ignore = true) // Usage count cannot be updated manually
    @Mapping(target = "applicableHotels", ignore = true) // Will be handled manually
    @Mapping(target = "voucherUsages", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(@MappingTarget Voucher voucher, VoucherUpdateRequest request);
    
    // Convert list of Voucher entities to list of VoucherResponse
    @IterableMapping(qualifiedByName = "toResponse")
    List<VoucherResponse> toResponseList(List<Voucher> vouchers);
    
    // Convert list of Voucher entities to list of VoucherResponse without hotels
    @IterableMapping(qualifiedByName = "toResponseWithoutHotels")
    List<VoucherResponse> toResponseListWithoutHotels(List<Voucher> vouchers);
} 