package com.researchjournal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStats {
    private Long totalPapers;
    private Long submittedPapers;
    private Long underReviewPapers;
    private Long acceptedPapers;
    private Long publishedPapers;
    private Long rejectedPapers;
    private Long pendingReviews;
    private Long totalUsers;
    private Long totalAuthors;
    private Long totalReviewers;
    private Long totalEditors;
}
