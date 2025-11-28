package com.researchjournal.dto;

import com.researchjournal.entity.ReviewRecommendation;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewSubmitRequest {
    
    private String comments;
    
    private String confidentialComments;
    
    @Min(1) @Max(10)
    private Integer qualityScore;
    
    @Min(1) @Max(10)
    private Integer originalityScore;
    
    @Min(1) @Max(10)
    private Integer clarityScore;
    
    @Min(1) @Max(10)
    private Integer significanceScore;
    
    private ReviewRecommendation recommendation;
}
