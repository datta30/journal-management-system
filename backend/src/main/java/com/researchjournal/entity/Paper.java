package com.researchjournal.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "papers")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Paper {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String abstractText;
    
    @Column(columnDefinition = "TEXT")
    private String keywords;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaperStatus status;
    
    private String filePath;
    
    private String fileName;
    
    @Column(nullable = false)
    private Integer version = 1;
    
    @Column(columnDefinition = "TEXT")
    private String editorComments;
    
    private Double plagiarismScore;
    
    @Column(columnDefinition = "TEXT")
    private String plagiarismReport;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_editor_id")
    private User assignedEditor;
    
    @ManyToMany
    @JoinTable(
        name = "paper_reviewers",
        joinColumns = @JoinColumn(name = "paper_id"),
        inverseJoinColumns = @JoinColumn(name = "reviewer_id")
    )
    @Builder.Default
    private Set<User> assignedReviewers = new HashSet<>();
    
    @OneToMany(mappedBy = "paper", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Review> reviews = new ArrayList<>();
    
    @OneToMany(mappedBy = "paper", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Revision> revisions = new ArrayList<>();
    
    private LocalDateTime submittedAt;
    
    private LocalDateTime publishedAt;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        submittedAt = LocalDateTime.now();
        if (status == null) {
            status = PaperStatus.SUBMITTED;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
