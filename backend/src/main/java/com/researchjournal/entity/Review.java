package com.researchjournal.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Review {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paper_id", nullable = false)
    private Paper paper;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id", nullable = false)
    private User reviewer;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReviewStatus status;
    
    @Column(columnDefinition = "TEXT")
    private String comments;
    
    @Column(columnDefinition = "TEXT")
    private String confidentialComments;
    
    private Integer qualityScore;
    
    private Integer originalityScore;
    
    private Integer clarityScore;
    
    private Integer significanceScore;
    
    @Enumerated(EnumType.STRING)
    private ReviewRecommendation recommendation;
    
    private Integer paperVersion;
    
    private LocalDateTime dueDate;
    
    private LocalDateTime completedAt;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = ReviewStatus.PENDING;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public Double getAverageScore() {
        int count = 0;
        int total = 0;
        if (qualityScore != null) { total += qualityScore; count++; }
        if (originalityScore != null) { total += originalityScore; count++; }
        if (clarityScore != null) { total += clarityScore; count++; }
        if (significanceScore != null) { total += significanceScore; count++; }
        return count > 0 ? (double) total / count : null;
    }
}
