package com.researchjournal.service;

import com.researchjournal.dto.*;
import com.researchjournal.entity.*;
import com.researchjournal.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import java.util.HashSet;

@Service
@RequiredArgsConstructor
public class PaperService {
    
    private final PaperRepository paperRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;
    private final RevisionRepository revisionRepository;
    private final UserService userService;
    
    @Value("${file.upload-dir}")
    private String uploadDir;
    
    public List<PaperDTO> getAllPapers() {
        return paperRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public PaperDTO getPaperById(Long id) {
        Paper paper = paperRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Paper not found"));
        return convertToDTO(paper);
    }
    
    public List<PaperDTO> getPapersByAuthor(Long authorId) {
        return paperRepository.findByAuthorId(authorId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<PaperDTO> getPapersByStatus(PaperStatus status) {
        return paperRepository.findByStatus(status).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<PaperDTO> getPapersForReviewer(Long reviewerId) {
        return paperRepository.findByAssignedReviewerId(reviewerId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<PaperDTO> getPapersForEditor(Long editorId) {
        return paperRepository.findByAssignedEditorId(editorId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<PaperDTO> getPublishedPapers() {
        return paperRepository.findByStatusOrderByPublishedAtDesc(PaperStatus.PUBLISHED).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<PaperDTO> searchPapers(String keyword) {
        return paperRepository.searchByKeyword(keyword).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public PaperDTO submitPaper(PaperSubmitRequest request, MultipartFile file, Long authorId) throws IOException {
        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new RuntimeException("Author not found"));
        
        Paper paper = Paper.builder()
                .title(request.getTitle())
                .abstractText(request.getAbstractText())
                .keywords(request.getKeywords())
                .author(author)
                .status(PaperStatus.SUBMITTED)
                .version(1)
                .build();
        
        if (file != null && !file.isEmpty()) {
            String fileName = saveFile(file, paper.getId());
            paper.setFileName(file.getOriginalFilename());
            paper.setFilePath(fileName);
        }
        
        Paper savedPaper = paperRepository.save(paper);
        
        // Run plagiarism check (simulated)
        runPlagiarismCheck(savedPaper);
        
        return convertToDTO(savedPaper);
    }
    
    @Transactional
    public PaperDTO updatePaper(Long id, PaperSubmitRequest request, MultipartFile file) throws IOException {
        Paper paper = paperRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Paper not found"));
        
        paper.setTitle(request.getTitle());
        paper.setAbstractText(request.getAbstractText());
        paper.setKeywords(request.getKeywords());
        
        if (file != null && !file.isEmpty()) {
            String fileName = saveFile(file, paper.getId());
            paper.setFileName(file.getOriginalFilename());
            paper.setFilePath(fileName);
        }
        
        Paper updatedPaper = paperRepository.save(paper);
        return convertToDTO(updatedPaper);
    }
    
    @Transactional
    public PaperDTO submitRevision(Long paperId, String changesSummary, String authorResponse, 
                                    MultipartFile file) throws IOException {
        Paper paper = paperRepository.findById(paperId)
                .orElseThrow(() -> new RuntimeException("Paper not found"));
        
        // Save current version as revision
        Revision revision = Revision.builder()
                .paper(paper)
                .versionNumber(paper.getVersion())
                .filePath(paper.getFilePath())
                .fileName(paper.getFileName())
                .changesSummary(changesSummary)
                .authorResponse(authorResponse)
                .build();
        revisionRepository.save(revision);
        
        // Update paper with new version
        paper.setVersion(paper.getVersion() + 1);
        paper.setStatus(PaperStatus.REVISED);
        
        if (file != null && !file.isEmpty()) {
            String fileName = saveFile(file, paper.getId());
            paper.setFileName(file.getOriginalFilename());
            paper.setFilePath(fileName);
        }
        
        // Run plagiarism check on new version
        runPlagiarismCheck(paper);
        
        Paper updatedPaper = paperRepository.save(paper);
        return convertToDTO(updatedPaper);
    }
    
    @Transactional
    public PaperDTO assignEditor(Long paperId, Long editorId) {
        Paper paper = paperRepository.findById(paperId)
                .orElseThrow(() -> new RuntimeException("Paper not found"));
        User editor = userRepository.findById(editorId)
                .orElseThrow(() -> new RuntimeException("Editor not found"));
        
        if (editor.getRole() != Role.EDITOR && editor.getRole() != Role.ADMIN) {
            throw new RuntimeException("User is not an editor");
        }
        
        paper.setAssignedEditor(editor);
        Paper updatedPaper = paperRepository.save(paper);
        return convertToDTO(updatedPaper);
    }
    
    @Transactional
    public PaperDTO assignReviewer(Long paperId, Long reviewerId) {
        Paper paper = paperRepository.findById(paperId)
                .orElseThrow(() -> new RuntimeException("Paper not found"));
        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new RuntimeException("Reviewer not found"));
        
        if (reviewer.getRole() != Role.REVIEWER && reviewer.getRole() != Role.EDITOR && reviewer.getRole() != Role.ADMIN) {
            throw new RuntimeException("User is not a reviewer");
        }
        
        if (paper.getAssignedReviewers() == null) {
            paper.setAssignedReviewers(new HashSet<>());
        }
        paper.getAssignedReviewers().add(reviewer);
        paper.setStatus(PaperStatus.UNDER_REVIEW);
        
        // Create review entry
        Review review = Review.builder()
                .paper(paper)
                .reviewer(reviewer)
                .status(ReviewStatus.PENDING)
                .paperVersion(paper.getVersion())
                .dueDate(LocalDateTime.now().plusDays(14))
                .build();
        reviewRepository.save(review);
        
        Paper updatedPaper = paperRepository.save(paper);
        return convertToDTO(updatedPaper);
    }
    
    @Transactional
    public PaperDTO removeReviewer(Long paperId, Long reviewerId) {
        Paper paper = paperRepository.findById(paperId)
                .orElseThrow(() -> new RuntimeException("Paper not found"));
        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new RuntimeException("Reviewer not found"));
        
        paper.getAssignedReviewers().remove(reviewer);
        Paper updatedPaper = paperRepository.save(paper);
        return convertToDTO(updatedPaper);
    }
    
    @Transactional
    public PaperDTO updatePaperStatus(Long id, PaperStatus status, String editorComments) {
        Paper paper = paperRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Paper not found"));
        
        paper.setStatus(status);
        if (editorComments != null) {
            paper.setEditorComments(editorComments);
        }
        
        if (status == PaperStatus.PUBLISHED) {
            paper.setPublishedAt(LocalDateTime.now());
        }
        
        Paper updatedPaper = paperRepository.save(paper);
        return convertToDTO(updatedPaper);
    }
    
    @Transactional
    public void deletePaper(Long id) {
        if (!paperRepository.existsById(id)) {
            throw new RuntimeException("Paper not found");
        }
        paperRepository.deleteById(id);
    }
    
    public List<RevisionDTO> getRevisions(Long paperId) {
        return revisionRepository.findByPaperIdOrderByVersionNumberDesc(paperId).stream()
                .map(this::convertRevisionToDTO)
                .collect(Collectors.toList());
    }
    
    private String saveFile(MultipartFile file, Long paperId) throws IOException {
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        
        return fileName;
    }
    
    private void runPlagiarismCheck(Paper paper) {
        // Simulated plagiarism check - in real application, integrate with actual service
        Random random = new Random();
        double plagiarismScore = random.nextDouble() * 30; // 0-30% similarity
        
        paper.setPlagiarismScore(plagiarismScore);
        
        StringBuilder report = new StringBuilder();
        report.append("Plagiarism Check Report\n");
        report.append("=======================\n");
        report.append("Document: ").append(paper.getTitle()).append("\n");
        report.append("Similarity Score: ").append(String.format("%.2f", plagiarismScore)).append("%\n\n");
        
        if (plagiarismScore < 10) {
            report.append("Status: LOW SIMILARITY - Document appears to be original.\n");
        } else if (plagiarismScore < 20) {
            report.append("Status: MODERATE SIMILARITY - Some matching content found. Review recommended.\n");
        } else {
            report.append("Status: HIGH SIMILARITY - Significant matching content. Manual review required.\n");
        }
        
        paper.setPlagiarismReport(report.toString());
        paperRepository.save(paper);
    }
    
    public PaperDTO convertToDTO(Paper paper) {
        Set<User> assignedReviewers = paper.getAssignedReviewers();
        List<UserDTO> reviewers = (assignedReviewers != null ? assignedReviewers.stream() : java.util.stream.Stream.<User>empty())
                .map(userService::convertToDTO)
                .collect(Collectors.toList());
        
        List<Review> paperReviews = paper.getReviews();
        List<ReviewDTO> reviews = (paperReviews != null ? paperReviews.stream() : java.util.stream.Stream.<Review>empty())
                .map(this::convertReviewToDTO)
                .collect(Collectors.toList());
        
        return PaperDTO.builder()
                .id(paper.getId())
                .title(paper.getTitle())
                .abstractText(paper.getAbstractText())
                .keywords(paper.getKeywords())
                .author(userService.convertToDTO(paper.getAuthor()))
                .status(paper.getStatus())
                .fileName(paper.getFileName())
                .version(paper.getVersion())
                .editorComments(paper.getEditorComments())
                .plagiarismScore(paper.getPlagiarismScore())
                .plagiarismReport(paper.getPlagiarismReport())
                .assignedEditor(paper.getAssignedEditor() != null ? 
                        userService.convertToDTO(paper.getAssignedEditor()) : null)
                .assignedReviewers(reviewers)
                .reviews(reviews)
                .submittedAt(paper.getSubmittedAt())
                .publishedAt(paper.getPublishedAt())
                .createdAt(paper.getCreatedAt())
                .updatedAt(paper.getUpdatedAt())
                .build();
    }
    
    private ReviewDTO convertReviewToDTO(Review review) {
        return ReviewDTO.builder()
                .id(review.getId())
                .paperId(review.getPaper().getId())
                .paperTitle(review.getPaper().getTitle())
                .reviewer(userService.convertToDTO(review.getReviewer()))
                .status(review.getStatus())
                .comments(review.getComments())
                .confidentialComments(review.getConfidentialComments())
                .qualityScore(review.getQualityScore())
                .originalityScore(review.getOriginalityScore())
                .clarityScore(review.getClarityScore())
                .significanceScore(review.getSignificanceScore())
                .averageScore(review.getAverageScore())
                .recommendation(review.getRecommendation())
                .paperVersion(review.getPaperVersion())
                .dueDate(review.getDueDate())
                .completedAt(review.getCompletedAt())
                .createdAt(review.getCreatedAt())
                .build();
    }
    
    private RevisionDTO convertRevisionToDTO(Revision revision) {
        return RevisionDTO.builder()
                .id(revision.getId())
                .paperId(revision.getPaper().getId())
                .versionNumber(revision.getVersionNumber())
                .fileName(revision.getFileName())
                .changesSummary(revision.getChangesSummary())
                .authorResponse(revision.getAuthorResponse())
                .createdAt(revision.getCreatedAt())
                .build();
    }
}
