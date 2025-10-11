package com.docutrack.controller;

import com.docutrack.model.Contract;
import com.docutrack.service.ContractService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*")
public class AnalyticsController {
    
    @Autowired
    private ContractService contractService;
    
    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getAnalyticsSummary(
            @RequestParam(required = false) String userId) {
        
        List<Contract> contracts = contractService.getAllContracts(userId, null, null, null);
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("total_contracts", contracts.size());
        summary.put("auto_extracted", contracts.stream()
            .mapToInt(c -> "auto_extracted".equals(c.getExtractionStatus()) ? 1 : 0)
            .sum());
        summary.put("manual_required", contracts.stream()
            .mapToInt(c -> "manual_required".equals(c.getExtractionStatus()) ? 1 : 0)
            .sum());
        summary.put("manually_edited", contracts.stream()
            .mapToInt(c -> "manually_edited".equals(c.getExtractionStatus()) ? 1 : 0)
            .sum());
        summary.put("total_size", contracts.stream()
            .mapToLong(c -> c.getFileSize() != null ? c.getFileSize() : 0)
            .sum());
        
        return ResponseEntity.ok(summary);
    }
    
    @GetMapping("/contract-types")
    public ResponseEntity<List<Map<String, Object>>> getContractTypes(
            @RequestParam(required = false) String userId) {
        
        List<Contract> contracts = contractService.getAllContracts(userId, null, null, null);
        
        Map<String, Long> typeCount = contracts.stream()
            .collect(Collectors.groupingBy(
                c -> c.getVariables() != null && c.getVariables().getContractType() != null 
                    ? c.getVariables().getContractType() 
                    : "Unknown",
                Collectors.counting()
            ));
        
        List<Map<String, Object>> result = typeCount.entrySet().stream()
            .map(entry -> {
                Map<String, Object> item = new HashMap<>();
                item.put("contract_type", entry.getKey());
                item.put("count", entry.getValue());
                return item;
            })
            .sorted((a, b) -> Long.compare((Long)b.get("count"), (Long)a.get("count")))
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(result);
    }
}
