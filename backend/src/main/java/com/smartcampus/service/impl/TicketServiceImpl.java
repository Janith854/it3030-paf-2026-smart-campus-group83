package com.smartcampus.service.impl;

import com.smartcampus.dto.TicketDTO;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.exception.InvalidTicketStatusException;
import com.smartcampus.model.Notification;
import com.smartcampus.model.Ticket;
import com.smartcampus.model.User;
import com.smartcampus.repository.TicketRepository;
import com.smartcampus.service.FileStorageService;
import com.smartcampus.service.NotificationService;
import com.smartcampus.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Module C — Maintenance & Incident Ticketing
 * Member 3: feature/tickets
 */
@Service
@RequiredArgsConstructor
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;
    private final NotificationService notificationService;
    private final FileStorageService fileStorageService;

    @Override
    public TicketDTO createTicket(TicketDTO ticketDto, String userId, List<MultipartFile> images) {
        if (ticketDto.getDescription() == null || ticketDto.getDescription().isBlank()) {
            throw new InvalidTicketStatusException("Description is required");
        }

        Ticket ticket = ticketDto.toEntity();
        ticket.setReportedByUserId(userId);
        ticket.setStatus(Ticket.TicketStatus.OPEN);
        ticket.setCreatedAt(java.time.LocalDateTime.now());
        
        // Handle images (max 3)
        if (images != null && !images.isEmpty()) {
            if (images.size() > 3) {
                throw new InvalidTicketStatusException("Maximum of 3 images allowed");
            }
            List<String> fileNames = fileStorageService.storeFiles(images);
            ticket.setImageAttachments(fileNames);
        } else {
            ticket.setImageAttachments(new ArrayList<>());
        }
        
        Ticket saved = ticketRepository.save(ticket);
        return TicketDTO.fromEntity(saved);
    }

    @Override
    public TicketDTO getTicketById(String id) {
        Ticket ticket = ticketRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + id));
        return TicketDTO.fromEntity(ticket);
    }

    @Override
    public List<TicketDTO> getMyTickets(String userId) {
        return ticketRepository.findByReportedByUserId(userId).stream()
            .map(TicketDTO::fromEntity)
            .collect(Collectors.toList());
    }

    @Override
    public List<TicketDTO> getAllTickets(String status, String priority) {
        List<Ticket> list;
        if (status != null && priority != null) {
            list = ticketRepository.findByStatusAndPriority(
                Ticket.TicketStatus.valueOf(status), Ticket.Priority.valueOf(priority));
        } else if (status != null) {
            list = ticketRepository.findByStatus(Ticket.TicketStatus.valueOf(status));
        } else {
            list = ticketRepository.findAll();
        }
        return list.stream()
            .map(TicketDTO::fromEntity)
            .collect(Collectors.toList());
    }

    @Override
    public TicketDTO updateTicketStatus(String id, Ticket.TicketStatus status, String notes, String actorId, User.Role actorRole) {
        Ticket ticket = ticketRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + id));
            
        validateStatusTransition(ticket, status, notes, actorId, actorRole);
        ticket.setStatus(status);
        if (status == Ticket.TicketStatus.RESOLVED) {
            ticket.setResolutionNotes(notes);
        }
        if (status == Ticket.TicketStatus.REJECTED) {
            ticket.setRejectionReason(notes);
        }
        Ticket saved = ticketRepository.save(ticket);
        
        notificationService.createNotification(
            saved.getReportedByUserId(),
            "Ticket Status Updated",
            "Your ticket is now " + saved.getStatus() + ".",
            Notification.NotificationType.TICKET_STATUS_CHANGED,
            saved.getId()
        );
        return TicketDTO.fromEntity(saved);
    }

    @Override
    public TicketDTO assignTechnician(String id, String technicianId) {
        Ticket ticket = ticketRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + id));
            
        Ticket.TicketStatus current = ticket.getStatus();
        if (current != Ticket.TicketStatus.OPEN) {
            throw new InvalidTicketStatusException("Cannot assign technician when ticket is " + current);
        }
        ticket.setAssignedTechnicianId(technicianId);
        Ticket saved = ticketRepository.save(ticket);
        
        notificationService.createNotification(
            technicianId,
            "Ticket Assigned",
            "You have been assigned a new ticket: " + saved.getCategory() + ".",
            Notification.NotificationType.TICKET_ASSIGNED,
            saved.getId()
        );
        return TicketDTO.fromEntity(saved);
    }

    @Override
    public TicketDTO addComment(String id, String userId, String content) {
        Ticket ticket = ticketRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + id));
            
        Ticket.Comment comment = new Ticket.Comment();
        comment.setId(UUID.randomUUID().toString());
        comment.setUserId(userId);
        comment.setContent(content);
        comment.setCreatedAt(java.time.LocalDateTime.now());
        ticket.getComments().add(comment);
        Ticket saved = ticketRepository.save(ticket);
        
        if (saved.getReportedByUserId() != null && !saved.getReportedByUserId().equals(userId)) {
            String preview = content == null ? "" : content.trim();
            if (preview.length() > 60) preview = preview.substring(0, 60) + "...";
            notificationService.createNotification(
                saved.getReportedByUserId(),
                "New Comment",
                "New comment on your ticket: " + preview,
                Notification.NotificationType.TICKET_COMMENT_ADDED,
                saved.getId()
            );
        }
        return TicketDTO.fromEntity(saved);
    }

    @Override
    public TicketDTO deleteComment(String ticketId, String commentId, String userId) {
        Ticket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId));
            
        boolean removed = ticket.getComments().removeIf(c -> 
            c.getId().equals(commentId) && c.getUserId().equals(userId)
        );
        
        if (!removed) {
            throw new InvalidTicketStatusException("Comment not found or you don't have permission to delete it");
        }
        
        Ticket saved = ticketRepository.save(ticket);
        return TicketDTO.fromEntity(saved);
    }

    // Member 3 (Tickets): enforce state machine transitions for status updates.
    private void validateStatusTransition(Ticket ticket, Ticket.TicketStatus next, String notes, String actorId, User.Role actorRole) {
        Ticket.TicketStatus current = ticket.getStatus();
        if (current == null || next == null) {
            throw new InvalidTicketStatusException("Status is required");
        }
        if (current == next) {
            throw new InvalidTicketStatusException("Ticket is already " + current);
        }
        if (actorRole == null) {
            throw new InvalidTicketStatusException("Actor role is required");
        }

        if (current == Ticket.TicketStatus.OPEN) {
            if (next == Ticket.TicketStatus.IN_PROGRESS) {
                if (ticket.getAssignedTechnicianId() == null) {
                    throw new InvalidTicketStatusException("Assign a technician before starting progress");
                }
                if (actorRole != User.Role.TECHNICIAN) {
                    throw new InvalidTicketStatusException("Only a technician can start progress");
                }
                if (actorId == null || !ticket.getAssignedTechnicianId().equals(actorId)) {
                    throw new InvalidTicketStatusException("Only the assigned technician can start progress");
                }
                return;
            }
            if (next == Ticket.TicketStatus.REJECTED) {
                if (actorRole != User.Role.ADMIN) {
                    throw new InvalidTicketStatusException("Only an admin can reject a ticket");
                }
                return;
            }
        }

        if (current == Ticket.TicketStatus.IN_PROGRESS && next == Ticket.TicketStatus.RESOLVED) {
            if (actorRole != User.Role.TECHNICIAN) {
                throw new InvalidTicketStatusException("Only a technician can resolve a ticket");
            }
            if (actorId == null || !actorId.equals(ticket.getAssignedTechnicianId())) {
                throw new InvalidTicketStatusException("Only the assigned technician can resolve the ticket");
            }
            if (notes == null || notes.trim().isEmpty()) {
                throw new InvalidTicketStatusException("Resolution notes are required to resolve a ticket");
            }
            return;
        }

        if (current == Ticket.TicketStatus.RESOLVED && next == Ticket.TicketStatus.CLOSED) {
            if (actorRole != User.Role.ADMIN) {
                throw new InvalidTicketStatusException("Only an admin can close a ticket");
            }
            return;
        }

        throw new InvalidTicketStatusException("Invalid status transition: " + current + " -> " + next);
    }
}
