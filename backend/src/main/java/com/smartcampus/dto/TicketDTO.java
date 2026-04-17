package com.smartcampus.dto;

import com.smartcampus.model.Ticket;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class TicketDTO {
    private String id;
    private String description;
    private Ticket.Priority priority;
    private String category;
    private String location;
    private Ticket.TicketStatus status;
    private String reportedByUserId;
    private String assignedTechnicianId;
    private List<String> imageAttachments;
    private List<CommentDTO> comments;
    private LocalDateTime createdAt;
    private String resolutionNotes;
    private String rejectionReason;

    @Data
    public static class CommentDTO {
        private String id;
        private String userId;
        private String content;
        private LocalDateTime createdAt;
    }

    public static TicketDTO fromEntity(Ticket entity) {
        TicketDTO dto = new TicketDTO();
        dto.setId(entity.getId());
        dto.setDescription(entity.getDescription());
        dto.setPriority(entity.getPriority());
        dto.setCategory(entity.getCategory());
        dto.setLocation(entity.getLocation());
        dto.setStatus(entity.getStatus());
        dto.setReportedByUserId(entity.getReportedByUserId());
        dto.setAssignedTechnicianId(entity.getAssignedTechnicianId());
        dto.setImageAttachments(entity.getImageAttachments());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setResolutionNotes(entity.getResolutionNotes());
        dto.setRejectionReason(entity.getRejectionReason());
        
        if (entity.getComments() != null) {
            dto.setComments(entity.getComments().stream().map(c -> {
                CommentDTO cdto = new CommentDTO();
                cdto.setId(c.getId());
                cdto.setUserId(c.getUserId());
                cdto.setContent(c.getContent());
                cdto.setCreatedAt(c.getCreatedAt());
                return cdto;
            }).collect(java.util.stream.Collectors.toList()));
        }
        return dto;
    }

    public Ticket toEntity() {
        Ticket entity = new Ticket();
        entity.setId(this.id);
        entity.setDescription(this.description);
        entity.setPriority(this.priority);
        entity.setCategory(this.category);
        entity.setLocation(this.location);
        entity.setStatus(this.status);
        entity.setReportedByUserId(this.reportedByUserId);
        entity.setAssignedTechnicianId(this.assignedTechnicianId);
        entity.setImageAttachments(this.imageAttachments);
        entity.setCreatedAt(this.createdAt);
        entity.setResolutionNotes(this.resolutionNotes);
        entity.setRejectionReason(this.rejectionReason);
        // Note: comments handled separately in service usually
        return entity;
    }
}
