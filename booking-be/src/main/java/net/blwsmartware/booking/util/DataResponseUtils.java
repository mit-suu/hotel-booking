package net.blwsmartware.booking.util;

import net.blwsmartware.booking.dto.response.DataResponse;
import org.springframework.data.domain.Page;

import java.util.List;

public class DataResponseUtils {
    public static <T> DataResponse<T> convertPageInfo(Page<?> page, List<T> data) {
        return new DataResponse<>(
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast(),
                data
        );
    }

}
