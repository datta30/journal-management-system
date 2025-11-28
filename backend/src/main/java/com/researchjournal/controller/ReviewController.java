package com.researchjournal.controller;

import com.researchjournal.dto.ReviewDTO;
import com.researchjournal.dto.ReviewSubmitRequest;
import com.researchjournal.dto.UserDTO;
import com.researchjournal.service.ReviewService;
import com.researchjournal.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {
    
    private final ReviewService reviewService;
    private final UserService userService;
    
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EDITOR')")
    public ResponseEntity<List<ReviewDTO>> getAllReviews() {
        return ResponseEntity.ok(reviewService.getAllReviews());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ReviewDTO> getReviewById(@PathVariable Long id) {
        return ResponseEntity.ok(reviewService.getReviewById(id));
    }
    
    @GetMapping("/paper/{paperId}")
    public ResponseEntity<List<ReviewDTO>> getReviewsByPaper(@PathVariable Long paperId) {
        return ResponseEntity.ok(reviewService.getReviewsByPaper(paperId));
    }
    
    @GetMapping("/my-reviews")
    @PreAuthorize("hasAnyRole('REVIEWER', 'EDITOR', 'ADMIN')")
    public ResponseEntity<List<ReviewDTO>> getMyReviews(Authentication authentication) {
        UserDTO user = userService.getUserByEmail(authentication.getName());
        return ResponseEntity.ok(reviewService.getReviewsByReviewer(user.getId()));
    }
    
    @GetMapping("/my-pending")
    @PreAuthorize("hasAnyRole('REVIEWER', 'EDITOR', 'ADMIN')")
    public ResponseEntity<List<ReviewDTO>> getMyPendingReviews(Authentication authentication) {
        UserDTO user = userService.getUserByEmail(authentication.getName());
        return ResponseEntity.ok(reviewService.getPendingReviewsByReviewer(user.getId()));
    }
    
    @PutMapping("/{id}/start")
    @PreAuthorize("hasAnyRole('REVIEWER', 'EDITOR', 'ADMIN')")
    public ResponseEntity<ReviewDTO> startReview(@PathVariable Long id) {
        return ResponseEntity.ok(reviewService.startReview(id));
    }
    
    @PutMapping("/{id}/submit")
    @PreAuthorize("hasAnyRole('REVIEWER', 'EDITOR', 'ADMIN')")
    public ResponseEntity<ReviewDTO> submitReview(
            @PathVariable Long id,
            @RequestBody ReviewSubmitRequest request) {
        return ResponseEntity.ok(reviewService.submitReview(id, request));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('REVIEWER', 'EDITOR', 'ADMIN')")
    public ResponseEntity<ReviewDTO> updateReview(
            @PathVariable Long id,
            @RequestBody ReviewSubmitRequest request) {
        return ResponseEntity.ok(reviewService.updateReview(id, request));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('EDITOR', 'ADMIN')")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return ResponseEntity.ok().build();
    }
}
