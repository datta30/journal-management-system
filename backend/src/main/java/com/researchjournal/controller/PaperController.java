package com.researchjournal.controller;

import com.researchjournal.dto.PaperDTO;
import com.researchjournal.dto.PaperSubmitRequest;
import com.researchjournal.dto.RevisionDTO;
import com.researchjournal.dto.UserDTO;
import com.researchjournal.entity.PaperStatus;
import com.researchjournal.service.PaperService;
import com.researchjournal.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/papers")
@RequiredArgsConstructor
public class PaperController {
    
    private final PaperService paperService;
    private final UserService userService;
    
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EDITOR')")
    public ResponseEntity<List<PaperDTO>> getAllPapers() {
        return ResponseEntity.ok(paperService.getAllPapers());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<PaperDTO> getPaperById(@PathVariable Long id) {
        return ResponseEntity.ok(paperService.getPaperById(id));
    }
    
    @GetMapping("/my-papers")
    public ResponseEntity<List<PaperDTO>> getMyPapers(Authentication authentication) {
        UserDTO user = userService.getUserByEmail(authentication.getName());
        return ResponseEntity.ok(paperService.getPapersByAuthor(user.getId()));
    }
    
    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EDITOR')")
    public ResponseEntity<List<PaperDTO>> getPapersByStatus(@PathVariable PaperStatus status) {
        return ResponseEntity.ok(paperService.getPapersByStatus(status));
    }
    
    @GetMapping("/for-review")
    @PreAuthorize("hasAnyRole('REVIEWER', 'EDITOR', 'ADMIN')")
    public ResponseEntity<List<PaperDTO>> getPapersForReview(Authentication authentication) {
        UserDTO user = userService.getUserByEmail(authentication.getName());
        return ResponseEntity.ok(paperService.getPapersForReviewer(user.getId()));
    }
    
    @GetMapping("/for-editor")
    @PreAuthorize("hasAnyRole('EDITOR', 'ADMIN')")
    public ResponseEntity<List<PaperDTO>> getPapersForEditor(Authentication authentication) {
        UserDTO user = userService.getUserByEmail(authentication.getName());
        return ResponseEntity.ok(paperService.getPapersForEditor(user.getId()));
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<PaperDTO>> searchPapers(@RequestParam String keyword) {
        return ResponseEntity.ok(paperService.searchPapers(keyword));
    }
    
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PaperDTO> submitPaperMultipart(
            @RequestParam("title") String title,
            @RequestParam("abstractText") String abstractText,
            @RequestParam(value = "keywords", required = false) String keywords,
            @RequestParam(value = "file", required = false) MultipartFile file,
            Authentication authentication) throws IOException {
        
        UserDTO user = userService.getUserByEmail(authentication.getName());
        PaperSubmitRequest request = PaperSubmitRequest.builder()
                .title(title)
                .abstractText(abstractText)
                .keywords(keywords)
                .build();
        
        return ResponseEntity.ok(paperService.submitPaper(request, file, user.getId()));
    }
    
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<PaperDTO> submitPaperJson(
            @RequestBody PaperSubmitRequest request,
            Authentication authentication) throws IOException {
        
        UserDTO user = userService.getUserByEmail(authentication.getName());
        return ResponseEntity.ok(paperService.submitPaper(request, null, user.getId()));
    }
    
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PaperDTO> updatePaper(
            @PathVariable Long id,
            @RequestParam("title") String title,
            @RequestParam("abstractText") String abstractText,
            @RequestParam(value = "keywords", required = false) String keywords,
            @RequestParam(value = "file", required = false) MultipartFile file) throws IOException {
        
        PaperSubmitRequest request = PaperSubmitRequest.builder()
                .title(title)
                .abstractText(abstractText)
                .keywords(keywords)
                .build();
        
        return ResponseEntity.ok(paperService.updatePaper(id, request, file));
    }
    
    @PostMapping(value = "/{id}/revision", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PaperDTO> submitRevision(
            @PathVariable Long id,
            @RequestParam("changesSummary") String changesSummary,
            @RequestParam(value = "authorResponse", required = false) String authorResponse,
            @RequestParam(value = "file", required = false) MultipartFile file) throws IOException {
        
        return ResponseEntity.ok(paperService.submitRevision(id, changesSummary, authorResponse, file));
    }
    
    @GetMapping("/{id}/revisions")
    public ResponseEntity<List<RevisionDTO>> getRevisions(@PathVariable Long id) {
        return ResponseEntity.ok(paperService.getRevisions(id));
    }
    
    @PutMapping("/{id}/assign-editor/{editorId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PaperDTO> assignEditor(@PathVariable Long id, @PathVariable Long editorId) {
        return ResponseEntity.ok(paperService.assignEditor(id, editorId));
    }
    
    @PutMapping("/{id}/assign-reviewer/{reviewerId}")
    @PreAuthorize("hasAnyRole('EDITOR', 'ADMIN')")
    public ResponseEntity<PaperDTO> assignReviewer(@PathVariable Long id, @PathVariable Long reviewerId) {
        return ResponseEntity.ok(paperService.assignReviewer(id, reviewerId));
    }
    
    @DeleteMapping("/{id}/remove-reviewer/{reviewerId}")
    @PreAuthorize("hasAnyRole('EDITOR', 'ADMIN')")
    public ResponseEntity<PaperDTO> removeReviewer(@PathVariable Long id, @PathVariable Long reviewerId) {
        return ResponseEntity.ok(paperService.removeReviewer(id, reviewerId));
    }
    
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('EDITOR', 'ADMIN')")
    public ResponseEntity<PaperDTO> updatePaperStatus(
            @PathVariable Long id,
            @RequestParam PaperStatus status,
            @RequestParam(required = false) String editorComments) {
        return ResponseEntity.ok(paperService.updatePaperStatus(id, status, editorComments));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AUTHOR')")
    public ResponseEntity<Void> deletePaper(@PathVariable Long id) {
        paperService.deletePaper(id);
        return ResponseEntity.ok().build();
    }
}
