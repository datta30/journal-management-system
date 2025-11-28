package com.researchjournal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RevisionDTO {
    private Long id;
    private Long paperId;
    private Integer versionNumber;
    private String fileName;
    private String changesSummary;
    private String authorResponse;
    private LocalDateTime createdAt;
}
