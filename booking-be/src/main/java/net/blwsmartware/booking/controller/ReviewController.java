package net.blwsmartware.booking.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import net.blwsmartware.booking.constant.PagePrepare;
import net.blwsmartware.booking.dto.response.DataResponse;
import net.blwsmartware.booking.dto.response.MessageResponse;
import net.blwsmartware.booking.dto.response.ReviewResponse;
import net.blwsmartware.booking.service.ReviewService;
import net.blwsmartware.booking.validator.IsAdmin;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ReviewController {
    ReviewService reviewService;

    // Admin endpoints
    @GetMapping("/admin")
    @IsAdmin
    public ResponseEntity<MessageResponse<DataResponse<ReviewResponse>>> getAllReviews(
            @RequestParam(value = "pageNumber", defaultValue = PagePrepare.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam(value = "pageSize", defaultValue = PagePrepare.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(value = "sortBy", defaultValue = "createdAt", required = false) String sortBy) {

        return ResponseEntity
                .status(HttpStatus.OK)
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<DataResponse<ReviewResponse>>builder()
                        .result(reviewService.getAllReviews(pageNumber, pageSize, sortBy))
                        .build());
    }
}
