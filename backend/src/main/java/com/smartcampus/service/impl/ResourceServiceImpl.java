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
 * Module A — Facilities & Assets
 * Member 1: feature/facilities
 */
@Service
@RequiredArgsConstructor
public class ResourceServiceImpl implements ResourceService {

    private final ResourceRepository resourceRepository;
    private final MongoTemplate mongoTemplate;

    @Override
    public Resource createResource(Resource resource) {
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

        if (type != null && !type.isEmpty()) {
            query.addCriteria(Criteria.where("type").is(Resource.ResourceType.valueOf(type)));
        }

        if (minCapacity != null) {
            query.addCriteria(Criteria.where("capacity").gte(minCapacity));
        }

        if (location != null && !location.isEmpty()) {
            query.addCriteria(Criteria.where("location").regex(location, "i"));
        }

        if (status != null && !status.isEmpty()) {
            query.addCriteria(Criteria.where("status").is(Resource.ResourceStatus.valueOf(status)));
        }

        return mongoTemplate.find(query, Resource.class);
    }

    @Override
    public Resource updateResource(String id, Resource resource) {
        Resource existing = resourceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + id));

        existing.setName(resource.getName());
        existing.setType(resource.getType());
        existing.setCapacity(resource.getCapacity());
        existing.setLocation(resource.getLocation());
        existing.setDescription(resource.getDescription());
        existing.setStatus(resource.getStatus());
        existing.setAvailabilityWindows(resource.getAvailabilityWindows());

        return resourceRepository.save(existing);
    }

    @Override
    public Resource updateStatus(String id, Resource.ResourceStatus status) {
        Resource existing = resourceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + id));
        existing.setStatus(status);
        return resourceRepository.save(existing);
    }

    @Override
    public void deleteResource(String id) {
        if (!resourceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Resource not found: " + id);
        }
        resourceRepository.deleteById(id);
    }
}
