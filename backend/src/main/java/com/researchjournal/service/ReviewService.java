package com.researchjournal.service;

import com.researchjournal.dto.ReviewDTO;
import com.researchjournal.dto.ReviewSubmitRequest;
import com.researchjournal.entity.Review;
import com.researchjournal.entity.ReviewStatus;
import com.researchjournal.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {
    
    private final ReviewRepository reviewRepository;
    private final UserService userService;
    
    public List<ReviewDTO> getAllReviews() {
        return reviewRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public ReviewDTO getReviewById(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        return convertToDTO(review);
    }
    
    public List<ReviewDTO> getReviewsByPaper(Long paperId) {
        return reviewRepository.findByPaperId(paperId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<ReviewDTO> getReviewsByReviewer(Long reviewerId) {
        return reviewRepository.findByReviewerId(reviewerId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<ReviewDTO> getPendingReviewsByReviewer(Long reviewerId) {
        return reviewRepository.findByReviewerIdAndStatus(reviewerId, ReviewStatus.PENDING).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public ReviewDTO startReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        
        review.setStatus(ReviewStatus.IN_PROGRESS);
        Review updatedReview = reviewRepository.save(review);
        return convertToDTO(updatedReview);
    }
    
    @Transactional
    public ReviewDTO submitReview(Long reviewId, ReviewSubmitRequest request) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        
        review.setComments(request.getComments());
        review.setConfidentialComments(request.getConfidentialComments());
        review.setQualityScore(request.getQualityScore());
        review.setOriginalityScore(request.getOriginalityScore());
        review.setClarityScore(request.getClarityScore());
        review.setSignificanceScore(request.getSignificanceScore());
        review.setRecommendation(request.getRecommendation());
        review.setStatus(ReviewStatus.COMPLETED);
        review.setCompletedAt(LocalDateTime.now());
        
        Review updatedReview = reviewRepository.save(review);
        return convertToDTO(updatedReview);
    }
    
    @Transactional
    public ReviewDTO updateReview(Long reviewId, ReviewSubmitRequest request) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        
        if (request.getComments() != null) {
            review.setComments(request.getComments());
        }
        if (request.getConfidentialComments() != null) {
            review.setConfidentialComments(request.getConfidentialComments());
        }
        if (request.getQualityScore() != null) {
            review.setQualityScore(request.getQualityScore());
        }
        if (request.getOriginalityScore() != null) {
            review.setOriginalityScore(request.getOriginalityScore());
        }
        if (request.getClarityScore() != null) {
            review.setClarityScore(request.getClarityScore());
        }
        if (request.getSignificanceScore() != null) {
            review.setSignificanceScore(request.getSignificanceScore());
        }
        if (request.getRecommendation() != null) {
            review.setRecommendation(request.getRecommendation());
        }
        
        Review updatedReview = reviewRepository.save(review);
        return convertToDTO(updatedReview);
    }
    
    @Transactional
    public void deleteReview(Long id) {
        if (!reviewRepository.existsById(id)) {
            throw new RuntimeException("Review not found");
        }
        reviewRepository.deleteById(id);
    }
    
    private ReviewDTO convertToDTO(Review review) {
        return ReviewDTO.builder()
                .id(review.getId())
                .paperId(review.getPaper().getId())
                .paperTitle(review.getPaper().getTitle())
                .reviewer(userService.convertToDTO(review.getReviewer()))
                .status(review.getStatus())
                .comments(review.getComments())
                .confidentialComments(review.getConfidentialComments())
                .qualityScore(review.getQualityScore())
                .originalityScore(review.getOriginalityScore())
                .clarityScore(review.getClarityScore())
                .significanceScore(review.getSignificanceScore())
                .averageScore(review.getAverageScore())
                .recommendation(review.getRecommendation())
                .paperVersion(review.getPaperVersion())
                .dueDate(review.getDueDate())
                .completedAt(review.getCompletedAt())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
