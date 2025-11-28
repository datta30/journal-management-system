package com.researchjournal.repository;

import com.researchjournal.entity.Paper;
import com.researchjournal.entity.PaperStatus;
import com.researchjournal.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaperRepository extends JpaRepository<Paper, Long> {
    List<Paper> findByAuthor(User author);
    List<Paper> findByAuthorId(Long authorId);
    List<Paper> findByStatus(PaperStatus status);
    List<Paper> findByAssignedEditor(User editor);
    List<Paper> findByAssignedEditorId(Long editorId);
    
    @Query("SELECT p FROM Paper p JOIN p.assignedReviewers r WHERE r.id = :reviewerId")
    List<Paper> findByAssignedReviewerId(@Param("reviewerId") Long reviewerId);
    
    @Query("SELECT p FROM Paper p WHERE p.status IN :statuses")
    List<Paper> findByStatusIn(@Param("statuses") List<PaperStatus> statuses);
    
    @Query("SELECT p FROM Paper p WHERE p.title LIKE %:keyword% OR p.abstractText LIKE %:keyword% OR p.keywords LIKE %:keyword%")
    List<Paper> searchByKeyword(@Param("keyword") String keyword);
    
    List<Paper> findByStatusOrderByPublishedAtDesc(PaperStatus status);
    
    @Query("SELECT COUNT(p) FROM Paper p WHERE p.status = :status")
    Long countByStatus(@Param("status") PaperStatus status);
}
