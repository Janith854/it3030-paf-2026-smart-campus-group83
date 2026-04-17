package com.smartcampus.service;

import com.smartcampus.dto.TicketDTO;
import com.smartcampus.model.Ticket;
import com.smartcampus.model.User;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

/** Member 3 implements this */
public interface TicketService {
    TicketDTO createTicket(TicketDTO ticketDto, String userId, List<MultipartFile> images);
    TicketDTO getTicketById(String id);
    List<TicketDTO> getMyTickets(String userId);
    List<TicketDTO> getAllTickets(String status, String priority);
    TicketDTO updateTicketStatus(String id, Ticket.TicketStatus status, String notes, String actorId, User.Role actorRole);
    TicketDTO assignTechnician(String id, String technicianId);
    TicketDTO addComment(String id, String userId, String content);
    TicketDTO deleteComment(String ticketId, String commentId, String userId);
}
