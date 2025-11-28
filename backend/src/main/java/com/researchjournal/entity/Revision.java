package com.researchjournal.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "revisions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Revision {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paper_id", nullable = false)
    private Paper paper;
    
    @Column(nullable = false)
    private Integer versionNumber;
    
    private String filePath;
    
    private String fileName;
    
    @Column(columnDefinition = "TEXT")
    private String changesSummary;
    
    @Column(columnDefinition = "TEXT")
    private String authorResponse;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
