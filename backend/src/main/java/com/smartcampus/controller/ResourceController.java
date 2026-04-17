package com.smartcampus.controller;

import com.smartcampus.dto.ResourceDTO;
import com.smartcampus.model.Resource;
import com.smartcampus.service.ResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * Module A — Facilities & Assets
 * Member 1: feature/facilities
 */
@RestController
@RequestMapping("/api/v1/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;

    @GetMapping
    public ResponseEntity<List<ResourceDTO>> getAll() {
        return ResponseEntity.ok(resourceService.searchResources(null, null, null, null));
    }

    @GetMapping("/filter")
    public ResponseEntity<List<ResourceDTO>> filterResources(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(resourceService.searchResources(type, minCapacity, location, status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResourceDTO> getById(@PathVariable String id) {
        return ResponseEntity.ok(resourceService.getResourceById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResourceDTO> create(@Valid @RequestBody ResourceDTO resourceDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(resourceService.createResource(resourceDto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResourceDTO> update(@PathVariable String id, @Valid @RequestBody ResourceDTO resourceDto) {
        return ResponseEntity.ok(resourceService.updateResource(id, resourceDto));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResourceDTO> updateStatus(@PathVariable String id,
                                                   @RequestParam Resource.ResourceStatus status) {
        return ResponseEntity.ok(resourceService.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }
}
