package com.researchjournal.dto;

import com.researchjournal.entity.ReviewRecommendation;
import com.researchjournal.entity.ReviewStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewDTO {
    private Long id;
    private Long paperId;
    private String paperTitle;
    private UserDTO reviewer;
    private ReviewStatus status;
    private String comments;
    private String confidentialComments;
    private Integer qualityScore;
    private Integer originalityScore;
    private Integer clarityScore;
    private Integer significanceScore;
    private Double averageScore;
    private ReviewRecommendation recommendation;
    private Integer paperVersion;
    private LocalDateTime dueDate;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
}
