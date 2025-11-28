package com.researchjournal.dto;

import com.researchjournal.entity.PaperStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaperDTO {
    private Long id;
    private String title;
    private String abstractText;
    private String keywords;
    private UserDTO author;
    private PaperStatus status;
    private String fileName;
    private Integer version;
    private String editorComments;
    private Double plagiarismScore;
    private String plagiarismReport;
    private UserDTO assignedEditor;
    private List<UserDTO> assignedReviewers;
    private List<ReviewDTO> reviews;
    private LocalDateTime submittedAt;
    private LocalDateTime publishedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
