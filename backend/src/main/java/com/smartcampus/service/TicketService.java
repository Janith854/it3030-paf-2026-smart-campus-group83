package com.smartcampus.service;

import com.smartcampus.model.Ticket;
import com.smartcampus.model.User;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

/** Member 3 implements this */
public interface TicketService {
    Ticket createTicket(Ticket ticket, String userId, List<MultipartFile> images);
    Ticket getTicketById(String id);
    List<Ticket> getMyTickets(String userId);
    List<Ticket> getAllTickets(String status, String priority);
    Ticket updateTicketStatus(String id, Ticket.TicketStatus status, String notes, String actorId, User.Role actorRole);
    Ticket assignTechnician(String id, String technicianId);
    Ticket addComment(String id, String userId, String content);
    Ticket deleteComment(String ticketId, String commentId, String userId);
}
