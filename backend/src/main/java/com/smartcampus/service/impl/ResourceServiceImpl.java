package com.smartcampus.service.impl;

import com.smartcampus.dto.ResourceDTO;
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
import java.util.stream.Collectors;

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
    public ResourceDTO createResource(ResourceDTO resourceDto) {
        Resource resource = resourceDto.toEntity();
        Resource saved = resourceRepository.save(resource);
        return ResourceDTO.fromEntity(saved);
    }

    @Override
    public ResourceDTO getResourceById(String id) {
        Resource resource = resourceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + id));
        return ResourceDTO.fromEntity(resource);
    }

    @Override
    public List<ResourceDTO> getAllResources() {
        return resourceRepository.findAll().stream()
            .map(ResourceDTO::fromEntity)
            .collect(Collectors.toList());
    }

    @Override
    public List<ResourceDTO> searchResources(String type, Integer minCapacity, String location, String status) {
        Query query = new Query();
        
        if (type != null && !type.trim().isEmpty()) {
            try {
                query.addCriteria(Criteria.where("type").is(Resource.ResourceType.valueOf(type.toUpperCase())));
            } catch (IllegalArgumentException e) {}
        }
        
        if (minCapacity != null) {
            query.addCriteria(Criteria.where("capacity").gte(minCapacity));
        }
        
        if (location != null && !location.trim().isEmpty()) {
            query.addCriteria(Criteria.where("location").regex(location, "i"));
        }
        
        if (status != null && !status.trim().isEmpty()) {
            try {
                query.addCriteria(Criteria.where("status").is(Resource.ResourceStatus.valueOf(status.toUpperCase())));
            } catch (IllegalArgumentException e) {}
        }
        
        return mongoTemplate.find(query, Resource.class).stream()
            .map(ResourceDTO::fromEntity)
            .collect(Collectors.toList());
    }

    @Override
    public ResourceDTO updateResource(String id, ResourceDTO resourceDto) {
        Resource existing = resourceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + id));
        
        existing.setName(resourceDto.getName());
        existing.setType(resourceDto.getType()); // FIXED: was ignored
        existing.setCapacity(resourceDto.getCapacity());
        existing.setLocation(resourceDto.getLocation());
        existing.setDescription(resourceDto.getDescription());
        existing.setStatus(resourceDto.getStatus()); // FIXED: was ignored
        existing.setAvailabilityWindows(resourceDto.getAvailabilityWindows());
        
        Resource saved = resourceRepository.save(existing);
        return ResourceDTO.fromEntity(saved);
    }

    @Override
    public ResourceDTO updateStatus(String id, Resource.ResourceStatus status) {
        Resource existing = resourceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + id));
        existing.setStatus(status);
        Resource saved = resourceRepository.save(existing);
        return ResourceDTO.fromEntity(saved);
    }

    @Override
    public void deleteResource(String id) {
        if (!resourceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Resource not found: " + id);
        }
        resourceRepository.deleteById(id);
    }
}
