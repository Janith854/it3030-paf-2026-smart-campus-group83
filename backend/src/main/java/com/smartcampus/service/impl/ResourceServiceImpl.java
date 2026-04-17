package com.smartcampus.service.impl;

import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Resource;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.service.ResourceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import java.util.List;

/**
 * TODO Member 1: Implement all methods
 * Branch: feature/facilities
 */
@Service
@RequiredArgsConstructor
public class ResourceServiceImpl implements ResourceService {

    private final ResourceRepository resourceRepository;
    private final MongoTemplate mongoTemplate;

    @Override
    public Resource createResource(Resource resource) {
        // TODO: validate fields, save and return
        return resourceRepository.save(resource);
    }

    @Override
    public Resource getResourceById(String id) {
        return resourceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + id));
    }

    @Override
    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    @Override
    public List<Resource> searchResources(String type, Integer minCapacity, String location, String status) {
        Query query = new Query();
        
        if (type != null && !type.trim().isEmpty()) {
            try {
                query.addCriteria(Criteria.where("type").is(Resource.ResourceType.valueOf(type.toUpperCase())));
            } catch (IllegalArgumentException e) {
                // Ignore invalid type for filtering, or handle accordingly
            }
        }
        
        if (minCapacity != null) {
            query.addCriteria(Criteria.where("capacity").gte(minCapacity));
        }
        
        if (location != null && !location.trim().isEmpty()) {
            query.addCriteria(Criteria.where("location").regex(location, "i")); // Case-insensitive partial match
        }
        
        if (status != null && !status.trim().isEmpty()) {
            try {
                query.addCriteria(Criteria.where("status").is(Resource.ResourceStatus.valueOf(status.toUpperCase())));
            } catch (IllegalArgumentException e) {}
        }
        
        return mongoTemplate.find(query, Resource.class);
    }

    @Override
    public Resource updateResource(String id, Resource resource) {
        // TODO: fetch existing, update fields, save
        Resource existing = getResourceById(id);
        existing.setName(resource.getName());
        existing.setCapacity(resource.getCapacity());
        existing.setLocation(resource.getLocation());
        existing.setDescription(resource.getDescription());
        existing.setAvailabilityWindows(resource.getAvailabilityWindows());
        return resourceRepository.save(existing);
    }

    @Override
    public Resource updateStatus(String id, Resource.ResourceStatus status) {
        Resource existing = getResourceById(id);
        existing.setStatus(status);
        return resourceRepository.save(existing);
    }

    @Override
    public void deleteResource(String id) {
        getResourceById(id);
        resourceRepository.deleteById(id);
    }
}
