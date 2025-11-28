package com.researchjournal.repository;

import com.researchjournal.entity.Review;
import com.researchjournal.entity.ReviewStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByPaperId(Long paperId);
    List<Review> findByReviewerId(Long reviewerId);
    List<Review> findByReviewerIdAndStatus(Long reviewerId, ReviewStatus status);
    List<Review> findByPaperIdAndPaperVersion(Long paperId, Integer paperVersion);
    Boolean existsByPaperIdAndReviewerId(Long paperId, Long reviewerId);
}
