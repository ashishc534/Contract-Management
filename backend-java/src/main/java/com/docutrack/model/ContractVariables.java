package com.docutrack.model;

import java.util.List;
import java.util.Map;

public class ContractVariables {
    private String contractType;
    private List<String> partyNames;
    private String amount;
    private String date;
    private String expirationDate;
    private List<String> signatures;
    private Map<String, Object> otherFields;

    // Constructors
    public ContractVariables() {}

    // Getters and Setters
    public String getContractType() { return contractType; }
    public void setContractType(String contractType) { this.contractType = contractType; }

    public List<String> getPartyNames() { return partyNames; }
    public void setPartyNames(List<String> partyNames) { this.partyNames = partyNames; }

    public String getAmount() { return amount; }
    public void setAmount(String amount) { this.amount = amount; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getExpirationDate() { return expirationDate; }
    public void setExpirationDate(String expirationDate) { this.expirationDate = expirationDate; }

    public List<String> getSignatures() { return signatures; }
    public void setSignatures(List<String> signatures) { this.signatures = signatures; }

    public Map<String, Object> getOtherFields() { return otherFields; }
    public void setOtherFields(Map<String, Object> otherFields) { this.otherFields = otherFields; }
}
