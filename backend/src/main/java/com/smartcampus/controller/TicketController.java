package com.smartcampus.controller;

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

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<Ticket> createTicketMultipart(
            @Valid @RequestPart("ticket") Ticket ticket,
            @RequestPart(value = "images", required = false) List<MultipartFile> images,
            @AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ticketService.createTicket(ticket, user.getId(), images));
    }

    @GetMapping("/my")
    public ResponseEntity<List<Ticket>> getMyTickets(@AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(ticketService.getMyTickets(user.getId()));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','TECHNICIAN')")
    public ResponseEntity<List<Ticket>> getAllTickets(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority) {
        return ResponseEntity.ok(ticketService.getAllTickets(status, priority));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getById(@PathVariable String id, @AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(ticketService.getTicketById(id, user));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','TECHNICIAN')")
    public ResponseEntity<Ticket> updateStatus(@PathVariable String id,
                                                 @RequestParam Ticket.TicketStatus status,
                                                 @RequestParam(required = false) String notes) {
        return ResponseEntity.ok(ticketService.updateTicketStatus(id, status, notes));
    }

    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Ticket> assign(@PathVariable String id,
                                           @RequestParam String technicianId) {
        return ResponseEntity.ok(ticketService.assignTechnician(id, technicianId));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<Ticket> addComment(@PathVariable String id,
                                               @RequestParam String content,
                                               @AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ticketService.addComment(id, user.getId(), content));
    }

    @PatchMapping("/{ticketId}/comments/{commentId}")
    public ResponseEntity<Ticket> updateComment(@PathVariable String ticketId,
                                                  @PathVariable String commentId,
                                                  @RequestParam String content,
                                                  @AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(ticketService.updateComment(ticketId, commentId, user.getId(), content));
    }

    @DeleteMapping("/{ticketId}/comments/{commentId}")
    public ResponseEntity<Ticket> deleteComment(@PathVariable String ticketId,
                                                  @PathVariable String commentId,
                                                  @AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(ticketService.deleteComment(ticketId, commentId, user.getId()));
    }
}
