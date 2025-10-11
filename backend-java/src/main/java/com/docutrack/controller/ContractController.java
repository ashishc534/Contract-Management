package com.docutrack.controller;

import com.docutrack.model.Contract;
import com.docutrack.service.ContractService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/contracts")
@CrossOrigin(origins = "*")
public class ContractController {
    
    @Autowired
    private ContractService contractService;
    
    @GetMapping
    public ResponseEntity<List<Contract>> getAllContracts(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String contractType,
            @RequestParam(required = false) String extractionStatus) {
        
        List<Contract> contracts = contractService.getAllContracts(userId, search, contractType, extractionStatus);
        return ResponseEntity.ok(contracts);
    }
    
    @PostMapping("/upload")
    public ResponseEntity<List<Contract>> uploadContracts(
            @RequestParam("files") MultipartFile[] files,
            @RequestParam(defaultValue = "default") String userId) {
        
        List<Contract> uploadedContracts = new ArrayList<>();
        
        for (MultipartFile file : files) {
            try {
                Contract contract = contractService.uploadContract(file, userId);
                uploadedContracts.add(contract);
            } catch (IOException e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(null);
            }
        }
        
        return ResponseEntity.ok(uploadedContracts);
    }
    
    @GetMapping("/{contractId}")
    public ResponseEntity<Contract> getContract(@PathVariable String contractId) {
        Optional<Contract> contract = contractService.getContract(contractId);
        return contract.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{contractId}")
    public ResponseEntity<String> deleteContract(@PathVariable String contractId) {
        try {
            contractService.deleteContract(contractId);
            return ResponseEntity.ok("{\"message\": \"Contract deleted successfully\"}");
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("{\"error\": \"Failed to delete contract\"}");
        }
    }
    
    @PostMapping("/{contractId}/reprocess")
    public ResponseEntity<Contract> reprocessContract(@PathVariable String contractId) {
        try {
            Contract contract = contractService.reprocessContract(contractId);
            return ResponseEntity.ok(contract);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PutMapping("/{contractId}")
    public ResponseEntity<Contract> updateContract(@PathVariable String contractId, @RequestBody Contract updatedContract) {
        try {
            Contract contract = contractService.updateContract(contractId, updatedContract);
            return ResponseEntity.ok(contract);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/{contractId}/download")
    public ResponseEntity<Resource> downloadContract(@PathVariable String contractId) {
        Optional<Contract> contractOpt = contractService.getContract(contractId);
        
        if (contractOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Contract contract = contractOpt.get();
        
        try {
            Resource file = new FileSystemResource(contract.getFilePath());
            if (!file.exists()) {
                return ResponseEntity.notFound().build();
            }
            
            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, 
                       "attachment; filename=\"" + contract.getOriginalFilename() + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(file);
                
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
