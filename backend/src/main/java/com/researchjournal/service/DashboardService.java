package com.researchjournal.service;

import com.researchjournal.dto.DashboardStats;
import com.researchjournal.entity.PaperStatus;
import com.researchjournal.entity.ReviewStatus;
import com.researchjournal.entity.Role;
import com.researchjournal.repository.PaperRepository;
import com.researchjournal.repository.ReviewRepository;
import com.researchjournal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardService {
    
    private final PaperRepository paperRepository;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    
    public DashboardStats getStats() {
        return DashboardStats.builder()
                .totalPapers(paperRepository.count())
                .submittedPapers(paperRepository.countByStatus(PaperStatus.SUBMITTED))
                .underReviewPapers(paperRepository.countByStatus(PaperStatus.UNDER_REVIEW))
                .acceptedPapers(paperRepository.countByStatus(PaperStatus.ACCEPTED))
                .publishedPapers(paperRepository.countByStatus(PaperStatus.PUBLISHED))
                .rejectedPapers(paperRepository.countByStatus(PaperStatus.REJECTED))
                .pendingReviews(reviewRepository.findAll().stream()
                        .filter(r -> r.getStatus() == ReviewStatus.PENDING)
                        .count())
                .totalUsers(userRepository.count())
                .totalAuthors((long) userRepository.findByRole(Role.AUTHOR).size())
                .totalReviewers((long) userRepository.findByRole(Role.REVIEWER).size())
                .totalEditors((long) userRepository.findByRole(Role.EDITOR).size())
                .build();
    }
}
