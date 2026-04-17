package com.smartcampus.repository;

import com.smartcampus.model.Resource;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

/** Member 1 — add custom queries here as needed */
public interface ResourceRepository extends MongoRepository<Resource, String> {
    List<Resource> findByType(Resource.ResourceType type);
    List<Resource> findByStatus(Resource.ResourceStatus status);
    List<Resource> findByLocation(String location);
    List<Resource> findByTypeAndStatus(Resource.ResourceType type, Resource.ResourceStatus status);
    List<Resource> findByCapacityGreaterThanEqual(int capacity);
}
