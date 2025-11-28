package com.researchjournal.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaperSubmitRequest {
    
    @NotBlank(message = "Title is required")
    private String title;
    
    @NotBlank(message = "Abstract is required")
    private String abstractText;
    
    private String keywords;
}
