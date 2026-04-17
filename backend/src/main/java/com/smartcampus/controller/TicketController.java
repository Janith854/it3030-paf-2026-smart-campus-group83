package com.smartcampus.controller;

import com.smartcampus.dto.TicketDTO;
import com.smartcampus.model.Ticket;
import com.smartcampus.security.UserPrincipal;
import com.smartcampus.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.validation.Valid;
import java.util.List;

/**
 * Module C — Maintenance & Incident Ticketing
 * Member 3: feature/tickets
 */
@RestController
@RequestMapping("/api/v1/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    @PostMapping(consumes = "application/json")
    public ResponseEntity<TicketDTO> createTicketJson(
            @Valid @RequestBody TicketDTO ticketDto,
            @AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ticketService.createTicket(ticketDto, user.getId(), null));
    }

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<TicketDTO> createTicketMultipart(
            @RequestPart("ticket") TicketDTO ticketDto,
            @RequestPart(value = "images", required = false) List<MultipartFile> images,
            @AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ticketService.createTicket(ticketDto, user.getId(), images));
    }

    @GetMapping("/my")
    public ResponseEntity<List<TicketDTO>> getMyTickets(@AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(ticketService.getMyTickets(user.getId()));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','TECHNICIAN')")
    public ResponseEntity<List<TicketDTO>> getAllTickets(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority) {
        return ResponseEntity.ok(ticketService.getAllTickets(status, priority));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketDTO> getById(@PathVariable String id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','TECHNICIAN')")
    public ResponseEntity<TicketDTO> updateStatus(@PathVariable String id,
                                                 @RequestParam Ticket.TicketStatus status,
                                                 @RequestParam(required = false) String notes,
                                                 @AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(ticketService.updateTicketStatus(id, status, notes, user.getId(), user.getRole()));
    }

    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TicketDTO> assign(@PathVariable String id,
                                           @RequestParam String technicianId) {
        return ResponseEntity.ok(ticketService.assignTechnician(id, technicianId));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<TicketDTO> addComment(@PathVariable String id,
                                               @RequestParam String content,
                                               @AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ticketService.addComment(id, user.getId(), content));
    }

    @DeleteMapping("/{ticketId}/comments/{commentId}")
    public ResponseEntity<TicketDTO> deleteComment(@PathVariable String ticketId,
                                                  @PathVariable String commentId,
                                                  @AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(ticketService.deleteComment(ticketId, commentId, user.getId()));
    }
}
