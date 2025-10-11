package com.docutrack.repository;

import com.docutrack.model.Contract;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ContractRepository extends MongoRepository<Contract, String> {
    
    @Query("{'$or': [{'userId': ?0}, {'userId': {'$exists': false}}, {'userId': 'default'}]}")
    List<Contract> findByUserIdOrLegacy(String userId);
    
    @Query("{'$and': [" +
           "{'$or': [{'userId': ?0}, {'userId': {'$exists': false}}, {'userId': 'default'}]}, " +
           "{'extractionStatus': ?1}" +
           "]}")
    List<Contract> findByUserIdAndExtractionStatus(String userId, String extractionStatus);
    
    @Query("{'$and': [" +
           "{'$or': [{'userId': ?0}, {'userId': {'$exists': false}}, {'userId': 'default'}]}, " +
           "{'$or': [" +
           "{'originalFilename': {'$regex': ?1, '$options': 'i'}}, " +
           "{'variables.contractType': {'$regex': ?1, '$options': 'i'}}, " +
           "{'variables.partyNames': {'$regex': ?1, '$options': 'i'}}" +
           "]}" +
           "]}")
    List<Contract> findByUserIdAndSearch(String userId, String searchTerm);
}
