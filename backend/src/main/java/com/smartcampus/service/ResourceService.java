package com.smartcampus.service;

import com.smartcampus.model.Resource;
import java.util.List;

/** Member 1 implements this */
public interface ResourceService {
    Resource createResource(Resource resource);
    Resource getResourceById(String id);
    List<Resource> getAllResources();
    List<Resource> searchResources(String type, Integer minCapacity, String location, String status);
    Resource updateResource(String id, Resource resource);
    Resource updateStatus(String id, Resource.ResourceStatus status);
    void deleteResource(String id);
}
