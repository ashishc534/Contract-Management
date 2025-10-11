package com.docutrack.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Document(collection = "contracts")
public class Contract {
    @Id
    private String id;
    private String filename;
    private String originalFilename;
    private String filePath;
    private Long fileSize;
    private LocalDateTime uploadDate;
    private ContractVariables variables;
    private String extractionStatus;
    private String extractedText;
    private String userId;

    // Constructors
    public Contract() {
        this.uploadDate = LocalDateTime.now();
        this.userId = "default";
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getFilename() { return filename; }
    public void setFilename(String filename) { this.filename = filename; }

    public String getOriginalFilename() { return originalFilename; }
    public void setOriginalFilename(String originalFilename) { this.originalFilename = originalFilename; }

    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }

    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

    public LocalDateTime getUploadDate() { return uploadDate; }
    public void setUploadDate(LocalDateTime uploadDate) { this.uploadDate = uploadDate; }

    public ContractVariables getVariables() { return variables; }
    public void setVariables(ContractVariables variables) { this.variables = variables; }

    public String getExtractionStatus() { return extractionStatus; }
    public void setExtractionStatus(String extractionStatus) { this.extractionStatus = extractionStatus; }

    public String getExtractedText() { return extractedText; }
    public void setExtractedText(String extractedText) { this.extractedText = extractedText; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
}
