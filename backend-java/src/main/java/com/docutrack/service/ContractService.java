package com.docutrack.service;

import com.docutrack.model.Contract;
import com.docutrack.model.ContractVariables;
import com.docutrack.repository.ContractRepository;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ContractService {
    
    @Autowired
    private ContractRepository contractRepository;
    
    private final String UPLOAD_DIR = "uploads/";
    
    public List<Contract> getAllContracts(String userId, String search, String contractType, String extractionStatus) {
        // Create upload directory if it doesn't exist
        try {
            Files.createDirectories(Paths.get(UPLOAD_DIR));
        } catch (IOException e) {
            // Directory already exists or creation failed
        }
        
        if (search != null && !search.isEmpty()) {
            return contractRepository.findByUserIdAndSearch(userId, search);
        } else if (extractionStatus != null && !extractionStatus.isEmpty()) {
            return contractRepository.findByUserIdAndExtractionStatus(userId, extractionStatus);
        } else {
            return contractRepository.findByUserIdOrLegacy(userId);
        }
    }
    
    public Contract uploadContract(MultipartFile file, String userId) throws IOException {
        // Validate file type
        if (!file.getOriginalFilename().toLowerCase().endsWith(".docx")) {
            throw new IllegalArgumentException("Only DOCX files are supported");
        }
        
        // Generate unique filename
        String contractId = UUID.randomUUID().toString();
        String safeFilename = contractId + "_" + file.getOriginalFilename();
        Path filePath = Paths.get(UPLOAD_DIR + safeFilename);
        
        // Save file
        Files.write(filePath, file.getBytes());
        
        // Extract text from DOCX
        String extractedText = extractTextFromDocx(file);
        
        // Extract variables using AI
        ContractVariables variables = extractVariablesWithAI(extractedText);
        
        // Create contract object
        Contract contract = new Contract();
        contract.setId(contractId);
        contract.setFilename(safeFilename);
        contract.setOriginalFilename(file.getOriginalFilename());
        contract.setFilePath(filePath.toString());
        contract.setFileSize(file.getSize());
        contract.setVariables(variables);
        contract.setExtractionStatus("auto_extracted");
        contract.setExtractedText(extractedText.length() > 5000 ? extractedText.substring(0, 5000) : extractedText);
        contract.setUserId(userId);
        
        return contractRepository.save(contract);
    }
    
    public void deleteContract(String contractId) throws IOException {
        Optional<Contract> contractOpt = contractRepository.findById(contractId);
        if (contractOpt.isPresent()) {
            Contract contract = contractOpt.get();
            // Delete file from filesystem
            try {
                Files.deleteIfExists(Paths.get(contract.getFilePath()));
            } catch (IOException e) {
                // File deletion failed, but continue with database deletion
            }
            contractRepository.deleteById(contractId);
        }
    }
    
    public Optional<Contract> getContract(String contractId) {
        return contractRepository.findById(contractId);
    }
    
    public Contract reprocessContract(String contractId) throws IOException {
        Optional<Contract> contractOpt = contractRepository.findById(contractId);
        if (contractOpt.isEmpty()) {
            throw new RuntimeException("Contract not found");
        }
        
        Contract contract = contractOpt.get();
        
        // Re-extract text from the original file
        Path filePath = Paths.get(contract.getFilePath());
        if (!Files.exists(filePath)) {
            throw new RuntimeException("Original file not found");
        }
        
        // Read file and extract text again
        byte[] fileBytes = Files.readAllBytes(filePath);
        String extractedText = extractTextFromDocxBytes(fileBytes);
        
        // Re-extract variables
        ContractVariables variables = extractVariablesWithAI(extractedText);
        
        // Update contract
        contract.setVariables(variables);
        contract.setExtractionStatus("auto_extracted");
        contract.setExtractedText(extractedText.length() > 5000 ? extractedText.substring(0, 5000) : extractedText);
        
        return contractRepository.save(contract);
    }
    
    public Contract updateContract(String contractId, Contract updatedContract) {
        Optional<Contract> contractOpt = contractRepository.findById(contractId);
        if (contractOpt.isEmpty()) {
            throw new RuntimeException("Contract not found");
        }
        
        Contract contract = contractOpt.get();
        
        // Update only the variables and extraction status
        if (updatedContract.getVariables() != null) {
            contract.setVariables(updatedContract.getVariables());
            contract.setExtractionStatus("manually_edited");
        }
        
        return contractRepository.save(contract);
    }
    
    private String extractTextFromDocxBytes(byte[] fileBytes) throws IOException {
        StringBuilder text = new StringBuilder();
        try (XWPFDocument document = new XWPFDocument(new java.io.ByteArrayInputStream(fileBytes))) {
            for (XWPFParagraph paragraph : document.getParagraphs()) {
                text.append(paragraph.getText()).append("\n");
            }
        }
        return text.toString();
    }
    
    private String extractTextFromDocx(MultipartFile file) throws IOException {
        StringBuilder text = new StringBuilder();
        try (XWPFDocument document = new XWPFDocument(file.getInputStream())) {
            for (XWPFParagraph paragraph : document.getParagraphs()) {
                text.append(paragraph.getText()).append("\n");
            }
        }
        return text.toString();
    }
    
    private ContractVariables extractVariablesWithAI(String text) {
        ContractVariables variables = new ContractVariables();
        
        // Enhanced contract type detection
        String contractType = "Unknown";
        String textLower = text.toLowerCase();
        
        Map<String, String[]> contractPatterns = new HashMap<>();
        contractPatterns.put("Service Agreement", new String[]{"service agreement", "services agreement", "consulting agreement"});
        contractPatterns.put("Employment Contract", new String[]{"employment agreement", "employment contract", "job offer"});
        contractPatterns.put("Lease Agreement", new String[]{"lease agreement", "rental agreement", "tenancy agreement"});
        contractPatterns.put("Non-Disclosure Agreement", new String[]{"non-disclosure", "nda", "confidentiality agreement"});
        
        for (Map.Entry<String, String[]> entry : contractPatterns.entrySet()) {
            for (String pattern : entry.getValue()) {
                if (textLower.contains(pattern)) {
                    contractType = entry.getKey();
                    break;
                }
            }
            if (!contractType.equals("Unknown")) break;
        }
        
        variables.setContractType(contractType);
        
        // Extract party names
        List<String> partyNames = new ArrayList<>();
        Pattern partyPattern = Pattern.compile("between\\s+([A-Z][a-zA-Z\\s&.,Inc]+?)\\s+(?:and|&)\\s+([A-Z][a-zA-Z\\s&.,Inc]+?)(?:\\s|,|\\.|$)", Pattern.CASE_INSENSITIVE);
        Matcher matcher = partyPattern.matcher(text);
        while (matcher.find()) {
            partyNames.add(matcher.group(1).trim());
            partyNames.add(matcher.group(2).trim());
        }
        variables.setPartyNames(partyNames);
        
        // Extract amounts
        Pattern amountPattern = Pattern.compile("[\\$£€¥]\\s*[\\d,]+(?:\\.\\d{2})?");
        matcher = amountPattern.matcher(text);
        if (matcher.find()) {
            variables.setAmount(matcher.group());
        }
        
        // Extract dates
        Pattern datePattern = Pattern.compile("\\b\\d{1,2}[/-]\\d{1,2}[/-]\\d{4}\\b|\\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\\s+\\d{1,2},?\\s+\\d{4}\\b", Pattern.CASE_INSENSITIVE);
        matcher = datePattern.matcher(text);
        List<String> dates = new ArrayList<>();
        while (matcher.find()) {
            dates.add(matcher.group());
        }
        if (!dates.isEmpty()) {
            variables.setDate(dates.get(0));
            if (dates.size() > 1) {
                variables.setExpirationDate(dates.get(1));
            }
        }
        
        // Extract signatures
        List<String> signatures = new ArrayList<>();
        Pattern signaturePattern = Pattern.compile("Signature:\\s*([A-Z][a-zA-Z\\s]+?)(?:\\n|$)", Pattern.CASE_INSENSITIVE);
        matcher = signaturePattern.matcher(text);
        while (matcher.find()) {
            signatures.add(matcher.group(1).trim());
        }
        variables.setSignatures(signatures);
        
        // Other fields
        Map<String, Object> otherFields = new HashMap<>();
        otherFields.put("text_length", text.length());
        otherFields.put("extraction_method", "enhanced_java_ai");
        variables.setOtherFields(otherFields);
        
        return variables;
    }
}
