package com.smartcampus.service;

import com.smartcampus.model.Ticket;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

/** Member 3 implements this */
public interface TicketService {
    Ticket createTicket(Ticket ticket, String userId, List<MultipartFile> images);
    Ticket getTicketById(String id, com.smartcampus.security.UserPrincipal user);
    List<Ticket> getMyTickets(String userId);
    List<Ticket> getAllTickets(String status, String priority);
    Ticket updateTicketStatus(String id, Ticket.TicketStatus status, String notes);
    Ticket assignTechnician(String id, String technicianId);
    Ticket addComment(String id, String userId, String content);
    Ticket updateComment(String ticketId, String commentId, String userId, String content);
    Ticket deleteComment(String ticketId, String commentId, String userId);
}
