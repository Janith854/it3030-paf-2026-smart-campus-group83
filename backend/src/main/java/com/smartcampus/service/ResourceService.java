package com.smartcampus.service;

import com.smartcampus.dto.ResourceDTO;
import com.smartcampus.model.Resource;
import java.util.List;

/** Member 1 implements this */
public interface ResourceService {
    ResourceDTO createResource(ResourceDTO resourceDto);
    ResourceDTO getResourceById(String id);
    List<ResourceDTO> getAllResources();
    List<ResourceDTO> searchResources(String type, Integer minCapacity, String location, String status);
    ResourceDTO updateResource(String id, ResourceDTO resourceDto);
    ResourceDTO updateStatus(String id, Resource.ResourceStatus status);
    void deleteResource(String id);
}
