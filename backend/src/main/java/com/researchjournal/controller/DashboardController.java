package com.researchjournal.controller;

import com.researchjournal.dto.DashboardStats;
import com.researchjournal.dto.PaperDTO;
import com.researchjournal.entity.PaperStatus;
import com.researchjournal.service.DashboardService;
import com.researchjournal.service.PaperService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class DashboardController {
    
    private final DashboardService dashboardService;
    private final PaperService paperService;
    
    @GetMapping("/dashboard/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'EDITOR')")
    public ResponseEntity<DashboardStats> getStats() {
        return ResponseEntity.ok(dashboardService.getStats());
    }
    
    @GetMapping("/public/papers")
    public ResponseEntity<List<PaperDTO>> getPublishedPapers() {
        return ResponseEntity.ok(paperService.getPublishedPapers());
    }
    
    @GetMapping("/public/published")
    public ResponseEntity<List<PaperDTO>> getPublishedPapersAlt() {
        return ResponseEntity.ok(paperService.getPublishedPapers());
    }
    
    @GetMapping("/public/papers/{id}")
    public ResponseEntity<PaperDTO> getPublishedPaper(@PathVariable Long id) {
        PaperDTO paper = paperService.getPaperById(id);
        if (paper.getStatus() == PaperStatus.PUBLISHED || paper.getStatus() == PaperStatus.ARCHIVED) {
            return ResponseEntity.ok(paper);
        }
        return ResponseEntity.notFound().build();
    }
    
    @GetMapping("/public/search")
    public ResponseEntity<List<PaperDTO>> searchPublishedPapers(@RequestParam String keyword) {
        return ResponseEntity.ok(paperService.searchPapers(keyword).stream()
                .filter(p -> p.getStatus() == PaperStatus.PUBLISHED || p.getStatus() == PaperStatus.ARCHIVED)
                .toList());
    }
}
