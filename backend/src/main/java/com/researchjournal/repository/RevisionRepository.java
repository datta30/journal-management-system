package com.researchjournal.repository;

import com.researchjournal.entity.Revision;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RevisionRepository extends JpaRepository<Revision, Long> {
    List<Revision> findByPaperId(Long paperId);
    List<Revision> findByPaperIdOrderByVersionNumberDesc(Long paperId);
    Optional<Revision> findByPaperIdAndVersionNumber(Long paperId, Integer versionNumber);
}
